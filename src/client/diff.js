/**
 * 内联卡片的行级差异引擎（纯函数 + 确定性，无 DOM/网络依赖）。
 *
 * 职责：浏览器半侧拿到一次 edit/write 的修改前/后全文（Host 执行快照）后，由
 * 本模块派生出卡片与弹窗需要的全部展示数据：
 *   - 行级 LCS 对齐的行流（rows），以及带上下文的变更块（hunks）；
 *   - 变更块之间的“未修改区”gap 带（含行号位移标注）；
 *   - 行内 token 级改动高亮（segments）；
 *   - 移动块提示（move：改到哪了 / 从哪来）；
 *   - 旧→新行号（快照模式精确；历史回放模式按当前文件定位）。
 *
 * 依赖：无（不 import 任何模块），因此 `node --test` 可以直接单测全部纯函数。
 *
 * 输入输出：输入是字符串（全文/片段）或行数组；输出是“差异模型”对象
 *   { rows, hunks, added, removed, oldLineCount, newLineCount, coarse,
 *     truncated?, hasNumbers, beforeText, afterText, ... }。卡片层只消费这个
 *     形状，不关心内部算法。
 *
 * 失败与回退（README「多级回退与容错」中与本模块相关的三条）：
 *   1. 超大文件：对齐预算（单侧 > 4000 行或 LCS 表格 > 250 万格）→ 换成
 *      O(n) 的“前后缀 + 中段整体替换”粗对齐（颜色与行号仍准确，但关闭移动
 *      识别）；更极端时物化预算（两侧合计 > 20 万行或单行 > 100 万字符）→
 *      返回 truncated 退化模型，只保留行数与增删统计，不建任何行对象；
 *   2. 历史回放：没有快照时 diffFromMeta 用 Host 记录的差异块建模，位置定位
 *      失败（locateOnce 找不到/有歧义/超搜索预算）时行号标记为待定；
 *   3. 行内高亮：单行/整段 token 预算超限 → 该行回退纯色；移动识别候选对
 *      超过 25 万 → 直接关闭移动识别。所有降级都是纯展示层降级，不抛错。
 */

/** 变更行上下各保留的上下文行数（hunk 的“呼吸空间”）。 */
export const CONTEXT_LINES = 3
/** LCS 动态规划的单侧行数预算。 */
export const ALIGN_MAX_SIDE_LINES = 4000
/** LCS 动态规划的总格数预算（m × n）。 */
export const ALIGN_MAX_CELLS = 2_500_000
/** 折叠内联卡片默认最多渲染的行数，超过提示“另有 N 行未展开”。 */
export const INLINE_ROW_CAP = 42
/** 放大弹窗全文对照最多渲染的行数（左右各计一次）。 */
export const FULL_VIEW_ROW_CAP = 4000
/**
 * 一份差异模型的物化行数硬预算（旧 + 新两侧合计）。
 *
 * 安全预算：LCS/行内 diff 都已有“计算预算”，但真正物化的 `rows` 与 hunk 里的
 * 行对象没有上限。Host 侧单侧快照上限 4 MiB，一个 4 MiB 的“全是换行/短行”文件
 * 可以展开出数百万个行对象，足以让浏览器渲染进程内存暴涨甚至崩溃（UI 级 DoS）。
 * 超过该预算时 diff 系列函数返回 `truncated: true` 的退化模型：行数统计保留、
 * rows/hunks 为空，由卡片层显示“文件过大”提示，而不是冻结页面。
 */
export const MAX_MATERIALIZED_LINES = 200_000
/**
 * 单行字符上限：即使总行数很少，一条 4 MiB 的“单行”也会在 DOM 里变成巨大
 * 文本节点并卡住渲染。超过时同样走退化模型。
 */
export const MAX_SINGLE_LINE_CHARS = 1_000_000

/**
 * O(n) 且不分配数组地测量文本的行数与最长行长度（行数口径与 contentLines
 * 一致：末尾换行是终止符而不是再起一空行）。用于在 split('\n') 之前决定是否
 * 值得物化整份 diff。
 *
 * @param {unknown} text
 * @returns {{ lines: number, maxLineLength: number }}
 */
export function measureTextBudget(text) {
  if (typeof text !== 'string' || text === '') return { lines: 0, maxLineLength: 0 }
  let lines = 1
  let current = 0
  let maxLineLength = 0
  for (let index = 0; index < text.length; index++) {
    if (text.charCodeAt(index) === 10 /* \n */) {
      if (current > maxLineLength) maxLineLength = current
      current = 0
      lines++
    } else {
      current++
    }
  }
  if (text.charCodeAt(text.length - 1) === 10) {
    // 末尾换行是最后一行的终止符，不额外算一行。
    lines--
  } else if (current > maxLineLength) {
    maxLineLength = current
  }
  return { lines, maxLineLength }
}

/**
 * 判断给定各侧的测量结果是否超出物化预算。
 *
 * 调用方传入所有“将要一起 diff 的文本”的 measureTextBudget 结果（例如旧+新
 * 两侧、多个 meta 差异块）。判定：累计行数 > 20 万 或 任一侧最长行 > 100 万
 * 字符。行数按“合计”算是因为两侧的行对象会同时驻留内存；单行按“最大”算，
 * 因为一条超长行本身就足以卡住渲染。
 *
 * @param {Array<{ lines:number, maxLineLength:number }>} metrics
 * @returns {boolean}
 */
export function exceedsMaterializationBudget(metrics) {
  if (!Array.isArray(metrics)) return false
  let lines = 0
  let maxLineLength = 0
  for (const metric of metrics) {
    if (metric === null || typeof metric !== 'object') continue
    if (Number.isFinite(metric.lines)) lines += metric.lines
    if (Number.isFinite(metric.maxLineLength) && metric.maxLineLength > maxLineLength) maxLineLength = metric.maxLineLength
  }
  return lines > MAX_MATERIALIZED_LINES || maxLineLength > MAX_SINGLE_LINE_CHARS
}

/** 预算内文本的退化模型：与普通 diff 模型同形，但 rows/hunks 为空并带
 * `truncated: true`，行数仍准确。卡片层据此显示“文件过大”提示。 */
function truncatedTextModel(beforeText, afterText, oldMetric, newMetric) {
  return {
    rows: [],
    hunks: [],
    added: 0,
    removed: 0,
    oldLineCount: oldMetric.lines,
    newLineCount: newMetric.lines,
    coarse: true,
    truncated: true,
    hasNumbers: true,
    beforeText: beforeText ?? '',
    afterText: afterText ?? '',
    beforeLineCount: oldMetric.lines,
    afterLineCount: newMetric.lines,
  }
}

/**
 * 把文本切成“内容行”（末尾换行是终止符，不再多出一行空行）。
 *
 * 与 `measureTextBudget` 的行数口径必须一致：`"a\n"` 是 1 行（不是 2 行）。
 * 同时把 Windows CRLF 的 `\r` 去掉：Host 元数据差异块按 LF 存储，若这里保留
 * `\r`，历史回放按文件定位行号时会永远匹配不上 CRLF 文件。归一化只影响展示，
 * 不改变文件内容。
 *
 * @param {unknown} text
 * @returns {string[]}
 */
export function contentLines(text) {
  if (typeof text !== 'string' || text === '') return []
  const body = text.endsWith('\n') ? text.slice(0, -1) : text
  // 注意：这里必须用 split 一次性切分（内容行数量已在调用方经过物化预算判断）。
  return body.split('\n').map(line => (line.endsWith('\r') ? line.slice(0, -1) : line))
}

/** 未变更行（两侧都有行号；旧/新行号 1 基，未知时为 null）。 */
function ctxRow(text, oldNo, newNo) {
  return { kind: 'ctx', text, oldNo, newNo }
}
/** 删除行：只有旧侧行号，新侧为 null（左右对照据此显示空白格）。 */
function delRow(text, oldNo) {
  return { kind: 'del', text, oldNo, newNo: null }
}
/** 新增行：只有新侧行号，旧侧为 null。 */
function addRow(text, newNo) {
  return { kind: 'add', text, oldNo: null, newNo }
}

/**
 * 粗粒度但 O(n) 的对齐：先削掉公共前缀/后缀，中间整段视为“全删 + 全增”。
 *
 * 用途：LCS 预算超限时的回退（超大文件）。颜色与行号仍然准确（前后缀是精确
 * 对齐的），代价是中间被替换的块不再做行级配对，也因此不参与移动识别。
 * 尾部剩余部分按位置逐行配成 ctx：两侧长度不一定相同，但能保证行号单调。
 *
 * @param {string[]} oldLines
 * @param {string[]} newLines
 * @returns {{rows: Array<object>, coarse: true}}
 */
function coarseAlign(oldLines, newLines) {
  const rows = []
  let prefix = 0
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++
  let oldEnd = oldLines.length
  let newEnd = newLines.length
  while (oldEnd > prefix && newEnd > prefix && oldLines[oldEnd - 1] === newLines[newEnd - 1]) {
    oldEnd--
    newEnd--
  }
  for (let i = 0; i < prefix; i++) rows.push(ctxRow(oldLines[i], i + 1, i + 1))
  for (let i = prefix; i < oldEnd; i++) rows.push(delRow(oldLines[i], i + 1))
  for (let j = prefix; j < newEnd; j++) rows.push(addRow(newLines[j], j + 1))
  let oldNo = oldEnd + 1
  let newNo = newEnd + 1
  while (oldNo <= oldLines.length && newNo <= newLines.length) {
    rows.push(ctxRow(oldLines[oldNo - 1], oldNo, newNo))
    oldNo++
    newNo++
  }
  return { rows, coarse: true }
}

/**
 * LCS 对齐两段行数组，返回按文件顺序排列的行流。
 *
 * 算法：经典最长公共子序列 DP（Uint32Array，倒序填表），再正向回溯生成
 * ctx/del/add 行。空间为 (m+1)×(n+1) 个 32 位整数，因此必须先过预算检查：
 *   - 任一侧空 → 直接全增/全删；
 *   - 任一侧 > 4000 行或 m×n > 250 万格 → 回退 coarseAlign（coarse=true）。
 *
 * 回溯时相等行优先配对，其次根据 DP 值向下/向右移动；平局时先取删除，保证
 * 同一段替换总是“先旧后新”，与官方 diff 的阅读顺序一致。
 *
 * @param {string[]} oldLines
 * @param {string[]} newLines
 * @returns {{rows: Array<object>, coarse: boolean}}
 */
export function alignLines(oldLines, newLines) {
  const m = oldLines.length
  const n = newLines.length
  if (m === 0) return { rows: newLines.map((text, j) => addRow(text, j + 1)), coarse: false }
  if (n === 0) return { rows: oldLines.map((text, i) => delRow(text, i + 1)), coarse: false }
  if (m > ALIGN_MAX_SIDE_LINES || n > ALIGN_MAX_SIDE_LINES || m * n > ALIGN_MAX_CELLS) {
    return coarseAlign(oldLines, newLines)
  }
  const w = n + 1
  const dp = new Uint32Array((m + 1) * w)
  for (let i = m - 1; i >= 0; i--) {
    const row = i * w
    const below = row + w
    const line = oldLines[i]
    for (let j = n - 1; j >= 0; j--) {
      dp[row + j] = line === newLines[j]
        ? dp[below + j + 1] + 1
        : Math.max(dp[below + j], dp[row + j + 1])
    }
  }
  const rows = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      rows.push(ctxRow(oldLines[i], i + 1, j + 1))
      i++
      j++
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      rows.push(delRow(oldLines[i], i + 1))
      i++
    } else {
      rows.push(addRow(newLines[j], j + 1))
      j++
    }
  }
  while (i < m) {
    rows.push(delRow(oldLines[i], i + 1))
    i++
  }
  while (j < n) {
    rows.push(addRow(newLines[j], j + 1))
    j++
  }
  return { rows, coarse: false }
}

/**
 * 在一个文件行数组里精确查找 needle 恰好出现一次的位置。
 *
 * 返回 0 基下标；找不到、出现多次（有歧义）或超搜索预算时返回 -1。
 *
 * 复杂度护栏：朴素搜索是 O(fileLines × needle) 的，异常大的 hunk 与文件组合
 * 会让主线程长时间卡住。超过预算时按“未定位”处理（行号保持待定），调用方本来
 * 就允许定位失败退化为待定行号，因此这是纯降级、不改变正确性。
 *
 * @param {string[]} needle - hunk 的新侧连续行（含上下文）。
 * @param {string[]} fileLines - 当前文件的内容行。
 * @returns {number} 0 基下标，或 -1。
 */
export function locateOnce(needle, fileLines) {
  if (!Array.isArray(needle) || needle.length === 0) return -1
  if (!Array.isArray(fileLines) || fileLines.length < needle.length) return -1
  if (needle.length * fileLines.length > 5_000_000) return -1
  let found = -1
  const last = fileLines.length - needle.length
  outer: for (let i = 0; i <= last; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (fileLines[i + j] !== needle[j]) continue outer
    }
    if (found !== -1) return -1
    found = i
  }
  return found
}

/**
 * 把完整行流切成可见 hunk（变更行 ± CONTEXT_LINES 行的上下文）以及它们之间的
 * gap 带。
 *
 * 两遍扫描：第一遍用 Uint8Array 标出“要保留的行”（变更行及其上下文）；第二遍
 * 顺序遍历，连续保留区拼成一个 hunk，连续折叠区量化为一个 gap。行号计数器在
 * 折叠区也照样前进，因此每个行号、每个 gap 的 old/new 起止都是文件级准确的。
 *
 * gap 只在“两侧都有行号”时记录实际位移（shift = newStart − oldStart），供 UI
 * 标注“旧 Lx 现在读作新 Ly”。
 *
 * @param {Array<object>} rows - alignLines 生成的行流。
 * @returns {Array<object>} hunks（不含 index，调用方随后编号）；无变更返回 []。
 */
export function groupHunks(rows) {
  const keep = new Uint8Array(rows.length)
  let hasChange = false
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].kind === 'ctx') continue
    hasChange = true
    for (let d = Math.max(0, i - CONTEXT_LINES); d <= Math.min(rows.length - 1, i + CONTEXT_LINES); d++) keep[d] = 1
  }
  if (!hasChange) return []
  const hunks = []
  let oldCur = 0
  let newCur = 0
  let gap = null
  let i = 0
  while (i < rows.length) {
    if (keep[i] === 0) {
      const oldStart = oldCur + 1
      const newStart = newCur + 1
      const start = i
      while (i < rows.length && keep[i] === 0) {
        const row = rows[i]
        if (row.oldNo !== null && row.oldNo !== undefined) oldCur = row.oldNo
        if (row.newNo !== null && row.newNo !== undefined) newCur = row.newNo
        i++
      }
      const count = i - start
      const oldCount = oldCur - (oldStart - 1)
      const newCount = newCur - (newStart - 1)
      if (hunks.length > 0 && i < rows.length && count > 0 && oldCount > 0) {
        gap = {
          count,
          oldCount,
          newCount,
          oldStart,
          oldEnd: oldCur,
          newStart,
          newEnd: newCur,
          // 未修改带的行号位移：正是标注所承诺的“旧 Lx 现在读作新 Ly”。
          shift: newStart - oldStart,
        }
      }
      continue
    }
    const startOld = oldCur + 1
    const startNew = newCur + 1
    const seg = []
    while (i < rows.length && keep[i] !== 0) {
      const row = rows[i]
      if (row.oldNo !== null && row.oldNo !== undefined) oldCur = row.oldNo
      if (row.newNo !== null && row.newNo !== undefined) newCur = row.newNo
      seg.push(row)
      i++
    }
    const hunk = makeHunk(seg, startOld, startNew, gap)
    hunks.push(hunk)
    gap = null
  }
  return hunks
}

/**
 * 由“保留的行”和分块边界的行号计数器构造一个 hunk 记录。
 *
 * 逐行扫描保留行，得到两侧起止行号、增删计数；纯新增/纯删除的一侧可能一行都
 * 没有（例如文件末尾追加），此时用传入的边界计数器补出“空区间”的端点
 * （start=boundary、end=boundary−1），保证 hunkHeader 能渲染“新文件 Lx”/“删除 old Lx”。
 *
 * @param {Array<object>} rows - 该 hunk 保留的行。
 * @param {number} boundaryOld - hunk 开始前的旧侧行号计数（用于空区间补端点）。
 * @param {number} boundaryNew - hunk 开始前的新侧行号计数。
 * @param {object|null} gapBefore - 上一块与本块之间的未修改区（首块为 null）。
 * @returns {object} hunk（index 先置 0，由调用方统一编号）。
 */
function makeHunk(rows, boundaryOld, boundaryNew, gapBefore) {
  let oldStart = null
  let oldEnd = null
  let newStart = null
  let newEnd = null
  let added = 0
  let removed = 0
  for (const row of rows) {
    if (row.kind === 'del') {
      removed++
      if (oldStart === null) oldStart = row.oldNo
      oldEnd = row.oldNo
    } else if (row.kind === 'add') {
      added++
      if (newStart === null) newStart = row.newNo
      newEnd = row.newNo
    } else {
      if (oldStart === null) oldStart = row.oldNo
      oldEnd = row.oldNo
      if (newStart === null) newStart = row.newNo
      newEnd = row.newNo
    }
  }
  const oldCount = rows.filter(row => row.kind !== 'add').length
  const newCount = rows.filter(row => row.kind !== 'del').length
  // 单侧 hunk（文件边界的插入/删除）仍能知道“没有行的那一侧”的边界行号。
  if (oldStart === null) {
    oldStart = boundaryOld
    oldEnd = boundaryOld - 1
  }
  if (newStart === null) {
    newStart = boundaryNew
    newEnd = boundaryNew - 1
  }
  return {
    index: 0,
    rows,
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldCount,
    newCount,
    added,
    removed,
    gapBefore: gapBefore ?? null,
    hasNumbers: true,
  }
}

/* =========================================================================
 * 行内（词/字符级）高亮
 *
 * 预算说明：行内 diff 的 DP 与行级 LCS 同构，但输入是 token 序列。三层预算
 * 防止“一行超长 minified 代码”或“一屏全是重排”把主线程拖死：
 *   - INTRA_MAX_CHARS：单行超过 4000 字符不比较（保持整行级配色）；
 *   - INTRA_MAX_CELLS：单行的 token DP 最多 16 万格；
 *   - INTRA_MAX_TOTAL_CELLS：一份 diff 内所有行内比较累计最多 200 万格。
 * 任一预算耗尽都只是“该行/该段不再显示行内高亮”，行级颜色与行号不受影响。
 * ====================================================================== */

/** 单行行内比较的字符上限。 */
const INTRA_MAX_CHARS = 4000
/** 单行 token DP 的格数上限。 */
const INTRA_MAX_CELLS = 160_000
/** 整份 diff 的行内 DP 总预算。 */
const INTRA_MAX_TOTAL_CELLS = 2_000_000

/**
 * 把一行拆成 token 序列：CJK 单字、标识符/数字/`$`、空白、其它标点各成 token。
 *
 * 为什么 CJK 单字成 token：中文没有空格分词，按单字比较能让“改了一个字”的
 * 行内高亮定位到那一个字；英文按完整标识符比较，避免逐字符高亮出满屏碎片。
 *
 * @param {unknown} text
 * @returns {string[]} 非字符串/空串返回 []。
 */
export function lineTokens(text) {
  if (typeof text !== 'string' || text === '') return []
  const tokens = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[A-Za-z0-9_$]+|\s+|./gu)
  return tokens === null ? [] : tokens
}

/** 追加一个片段；与上一个片段的 changed 标记相同就合并（减少 DOM span 数量）。 */
function pushSegment(segments, text, changed) {
  if (text === '') return
  const last = segments[segments.length - 1]
  if (last !== undefined && last.changed === changed) last.text += text
  else segments.push({ text, changed })
}

/** 按每个 token 的 changed 标记（1=改动）把整行重建成片段数组。 */
function segmentsFromFlags(tokens, flags) {
  const segments = []
  for (let i = 0; i < tokens.length; i++) pushSegment(segments, tokens[i], flags[i] === 1)
  return segments
}

/**
 * 判断一个 token 是否“无实质内容”：空白或标点（不含字母/数字/下划线/$）。
 * 用于区分“真正的改动”和 token 对齐产生的标点噪声。
 */
function isGapToken(token) {
  if (typeof token !== 'string' || token === '') return false
  return !/[\p{L}\p{N}_$]/u.test(token)
}

/**
 * 降低 gap token 噪声：把夹在两个“未改动内容 token”之间的纯空白/标点改动段
 * 重新标为未改动。
 *
 * 背景：按 token 做 LCS 时，重复出现的单字符 token（空格、逗号、连字符）可能
 * 被算法标成“改了一个空格”，但两行其实都含有这个字符。这类碎片会让人误以为
 * 是块移动标记。规则：只有当整段改动都不与“改动的实质内容”相邻时，才降级为
 * 未改动；与真实改动相邻的标点仍算改动的一部分。
 *
 * @param {string[]} tokens
 * @param {Uint8Array} flags
 * @returns {Uint8Array} 同一数组（原地修改并返回）。
 */
function calmGapRuns(tokens, flags) {
  let i = 0
  while (i < tokens.length) {
    if (flags[i] !== 1 || !isGapToken(tokens[i])) {
      i++
      continue
    }
    const start = i
    while (i < tokens.length && flags[i] === 1 && isGapToken(tokens[i])) i++
    // 与改动内容相邻（前或后）的 gap 段属于真实改动的一部分；只有完全孤立在
    // 未改动内容之间的 gap 段才降级为未改动。
    const touchesChangedContent = (start > 0 && flags[start - 1] === 1)
      || (i < tokens.length && flags[i] === 1)
    if (!touchesChangedContent) {
      for (let k = start; k < i; k++) flags[k] = 0
    }
  }
  return flags
}

/**
 * 反向合并：把夹在“两个改动内容 token”之间的一整段未改动 gap token 并入改动，
 * 使被替换表达式内部的高亮带连续。
 *
 * 与 calmGapRuns 的边界：只合并“两侧都紧邻改动”的 gap；仅仅分隔两处独立改动
 * 的 gap（例如两处改动之间的一串空白）不合并，否则每个空格和逗号都会亮成碎片。
 * 真正共享的单词同样会打断合并，保证两处独立修改不会连成一片。
 *
 * @param {string[]} tokens
 * @param {Uint8Array} flags
 * @returns {Uint8Array} 同一数组（原地修改并返回）。
 */
function absorbGapTokens(tokens, flags) {
  let i = 0
  while (i < tokens.length) {
    if (flags[i] === 1 || !isGapToken(tokens[i])) {
      i++
      continue
    }
    const start = i
    while (i < tokens.length && flags[i] === 0 && isGapToken(tokens[i])) i++
    const boundedByChanged = start > 0 && flags[start - 1] === 1
      && i < tokens.length && flags[i] === 1
    if (boundedByChanged) {
      for (let k = start; k < i; k++) flags[k] = 1
    }
  }
  return flags
}

/**
 * 一行“替换行对”的词/字符级比较，返回两侧的片段数组；无法廉价比较时返回 null
 * （调用方保留整行级配色）。
 *
 * 算法：
 *   1. 先去掉两侧公共的 token 前缀/后缀，DP 只覆盖真正变化的中段；
 *   2. 中段一个为空 → 直接全标改动（纯插入/纯删除）；
 *   3. 否则做 token LCS（与行级同构），回溯标出两侧各自哪些 token 是改动的；
 *   4. 用 calmGapRuns 压掉标点噪声、absorbGapTokens 连续化替换表达式。
 *
 * 预算：单行 > 4000 字符、中段格数 > 16 万、或整份 diff 的累计预算（budget
 * 对象，跨行共享）不足时返回 null。预算对象由 annotateIntraLine 传入；从外部
 * 单独调用时传 null 即只受单行预算约束。
 *
 * @param {string} oldText - 旧行全文。
 * @param {string} newText - 新行全文。
 * @param {{remaining:number}|null} [budget] - 跨行累计格数预算。
 * @returns {{old: Array<{text:string,changed:boolean}>, new: Array<{text:string,changed:boolean}>}|null}
 */
export function lineSegments(oldText, newText, budget = null) {
  if (typeof oldText !== 'string' || typeof newText !== 'string') return null
  if (oldText === newText) return null
  if (oldText.length > INTRA_MAX_CHARS || newText.length > INTRA_MAX_CHARS) return null
  const a = lineTokens(oldText)
  const b = lineTokens(newText)
  if (a.length === 0 || b.length === 0) return null
  // 先削掉公共 token 前缀/后缀，让 DP 只覆盖真正变化的中段。
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++
  let aEnd = a.length
  let bEnd = b.length
  while (aEnd > prefix && bEnd > prefix && a[aEnd - 1] === b[bEnd - 1]) {
    aEnd--
    bEnd--
  }
  const am = aEnd - prefix
  const bn = bEnd - prefix
  if (am === 0 && bn === 0) return null
  const cells = am * bn
  if (cells > INTRA_MAX_CELLS) return null
  if (budget !== null) {
    if (cells > budget.remaining) return null
    budget.remaining -= cells
  }
  const oldFlags = new Uint8Array(a.length)
  const newFlags = new Uint8Array(b.length)
  for (let i = 0; i < prefix; i++) { oldFlags[i] = 0; newFlags[i] = 0 }
  for (let i = aEnd; i < a.length; i++) oldFlags[i] = 0
  for (let i = bEnd; i < b.length; i++) newFlags[i] = 0
  if (am > 0 && bn > 0) {
    const w = bn + 1
    const dp = new Uint32Array((am + 1) * w)
    for (let i = am - 1; i >= 0; i--) {
      const row = i * w
      const below = row + w
      const token = a[prefix + i]
      for (let j = bn - 1; j >= 0; j--) {
        dp[row + j] = token === b[prefix + j]
          ? dp[below + j + 1] + 1
          : Math.max(dp[below + j], dp[row + j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < am && j < bn) {
      if (a[prefix + i] === b[prefix + j]) {
        i++
        j++
      } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
        oldFlags[prefix + i] = 1
        i++
      } else {
        newFlags[prefix + j] = 1
        j++
      }
    }
    while (i < am) { oldFlags[prefix + i] = 1; i++ }
    while (j < bn) { newFlags[prefix + j] = 1; j++ }
  } else if (am > 0) {
    for (let i = prefix; i < aEnd; i++) oldFlags[i] = 1
  } else {
    for (let j = prefix; j < bEnd; j++) newFlags[j] = 1
  }
  return {
    old: segmentsFromFlags(a, absorbGapTokens(a, calmGapRuns(a, oldFlags))),
    new: segmentsFromFlags(b, absorbGapTokens(b, calmGapRuns(b, newFlags))),
  }
}

/**
 * 给一次 diff 的所有“替换行对”挂上行内高亮片段。
 *
 * 扫描方式：把连续的非 ctx 行看成一个替换块，其中按顺序收集 del 与 add，再用
 * min(del,add) 一一配对（第 k 行删除配第 k 行新增）——与左右对照的配对规则一致。
 * 多出来的纯新增/纯删除行保持整行级颜色（没有对应行可比较）。
 *
 * 预算：跨行共享 INTRA_MAX_TOTAL_CELLS；耗尽后剩余行不再做行内比较（只是少了
 * 行内高亮，行级颜色/行号不变）。
 *
 * @param {Array<object>} rows - 行流（原地给行对象加 segments 字段）。
 * @returns {Array<object>} 同一 rows。
 */
export function annotateIntraLine(rows) {
  let i = 0
  const budget = { remaining: INTRA_MAX_TOTAL_CELLS }
  while (i < rows.length) {
    if (rows[i].kind === 'ctx') {
      i++
      continue
    }
    const dels = []
    const adds = []
    while (i < rows.length && rows[i].kind !== 'ctx') {
      if (rows[i].kind === 'del') dels.push(rows[i])
      else adds.push(rows[i])
      i++
    }
    const count = Math.min(dels.length, adds.length)
    if (count === 0) continue
    for (let k = 0; k < count; k++) {
      if (budget.remaining <= 0) break
      const segments = lineSegments(dels[k].text, adds[k].text, budget)
      if (segments === null) continue
      dels[k].segments = segments.old
      adds[k].segments = segments.new
    }
  }
  return rows
}

/* =========================================================================
 * 移动块识别
 *
 * 判定规则：删除段与新增段内容完全一致（忽略首尾空行）且出现在不同位置 →
 * 视为“移动”，在两端各挂一个 move 标注（旧位置仍显示红色、新位置显示绿色，
 * 确定性、不改变颜色语义）。候选对是 O(deleted × added) 的双重循环；crafted
 * 的交替单行改动可以凑出数百万对候选并让主线程做无意义比较，因此有：
 *   - MOVE_MIN_LINES / MOVE_SINGLE_MIN_WIDTH / MOVE_MAX_LINES：过滤太短或太长
 *     的块（单行用显示宽度 ≥12 格判断，中文 6 个字与英文 12 个字符等价）；
 *   - MOVE_MAX_CANDIDATE_PAIRS：候选对超预算 → 直接关闭移动识别（纯展示降级，
 *     颜色与行号不受影响）；
 *   - 粗对齐（coarse）模式不调用本函数，因此超大文件不会误报移动。
 * ====================================================================== */

/** 多行移动的最小行数。 */
const MOVE_MIN_LINES = 2
/** 单行移动所需的最小显示宽度（CJK 按 2 格计）。 */
const MOVE_SINGLE_MIN_WIDTH = 12
/** 参与移动识别的最大块行数（更长的块不标注，避免噪声）。 */
const MOVE_MAX_LINES = 120
/** 候选对数量预算（deleted × added）。 */
const MOVE_MAX_CANDIDATE_PAIRS = 250_000

/**
 * 一行文本在等宽终端里的显示宽度：CJK/全角字符按 2 格，其余按 1 格。
 * 用于“单行移动是否足够显著”的判断（避免再用 UTF-16 长度，导致中文行被
 * 低估一半）。
 */
function displayWidth(text) {
  let width = 0
  for (const char of text) {
    const code = char.codePointAt(0)
    width += (code >= 0x2e80 && code <= 0x9fff) || (code >= 0xf900 && code <= 0xfaff) || (code >= 0xff00 && code <= 0xffef)
      ? 2
      : 1
  }
  return width
}

/** 去掉块首尾的空行，返回核心行数组与偏移量（偏移用于把 move 标注放回原行）。 */
function trimBlankEdges(lines) {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === '') start++
  while (end > start && lines[end - 1].trim() === '') end--
  return { core: lines.slice(start, end), offset: start }
}

/**
 * 判断一个连续段是否“值得标注移动”：
 *   - 多行段：至少 2 行且含非空行；
 *   - 单行段：按显示宽度判断（CJK 6 个字与 ASCII 12 个字符等价），保证中文
 *     文件里的移动标注不会显得随意。
 */
function runIsSignificant(lines) {
  if (lines.length >= MOVE_MIN_LINES && lines.some(text => text.trim() !== '')) return true
  // 单行移动用显示宽度而非 UTF-16 长度：6 个汉字与 12 个 ASCII 字符同样显著，
  // 中文文件的移动提示才不会被漏掉。
  if (lines.length === 1 && displayWidth(lines[0].trim()) >= MOVE_SINGLE_MIN_WIDTH) return true
  return false
}

/**
 * 把删除段与内容完全相同的新增段配对，并在两端挂 move 标注。
 *
 * 步骤：
 *   1. 从每个 hunk 里收集所有连续 del 段 / add 段（记录 hunk、起始行、去掉首尾
 *      空行后的核心内容与偏移）；
 *   2. 双向过滤候选对（同一段只配一次、长度一致、内容逐行相等、长度在 120 行内、
 *      显著性达标）；
 *   3. 按“长度降序、距离升序”贪心配对（先配长块，再配位置最近的一对）；
 *   4. 在删除段首行挂 kind='to'（移到新 Lx），在新增段首行挂 kind='from'
 *      （移自旧 Lx）；多行时记录 endLine 供 UI 显示完整范围。
 *
 * 配对比较会忽略段首尾空行：块移动几乎总会把边界空行带到另一侧，这不应让
 * “移动”识别失败。旧位置保持红色、新位置保持绿色——确定性、字面语义——标注
 * 只负责说明“这个块移到哪/从哪来”。
 *
 * @param {Array<object>} hunks - groupHunks 生成的 hunk（含 rows）。
 * @returns {number} 配成的移动对数（0 表示没有移动）。
 */
export function detectMoves(hunks) {
  const deleted = []
  const added = []
  for (const hunk of hunks) {
    let i = 0
    const rows = hunk.rows
    while (i < rows.length) {
      const kind = rows[i].kind
      if (kind === 'ctx') {
        i++
        continue
      }
      const start = i
      while (i < rows.length && rows[i].kind === kind) i++
      const run = rows.slice(start, i)
      const lines = run.map(row => row.text)
      const trimmed = trimBlankEdges(lines)
      const record = {
        hunk,
        start,
        coreOffset: trimmed.offset,
        core: trimmed.core,
        oldNo: run[0].oldNo ?? null,
        newNo: run[0].newNo ?? null,
      }
      if (trimmed.core.length === 0) continue
      if (kind === 'del') deleted.push(record)
      else added.push(record)
    }
  }
  if (deleted.length === 0 || added.length === 0) return 0
  if (deleted.length * added.length > MOVE_MAX_CANDIDATE_PAIRS) return 0
  const candidates = []
  for (const d of deleted) {
    if (!runIsSignificant(d.core) || d.core.length > MOVE_MAX_LINES) continue
    for (const a of added) {
      if (d.core.length !== a.core.length || !runIsSignificant(a.core)) continue
      let equal = true
      for (let k = 0; k < d.core.length; k++) {
        if (d.core[k] !== a.core[k]) {
          equal = false
          break
        }
      }
      if (!equal) continue
      const distance = d.oldNo !== null && a.newNo !== null ? Math.abs(a.newNo - d.oldNo) : 0
      candidates.push({ d, a, length: d.core.length, distance })
    }
  }
  if (candidates.length === 0) return 0
  candidates.sort((x, y) => y.length - x.length || x.distance - y.distance)
  const usedDel = new Set()
  const usedAdd = new Set()
  let pairs = 0
  for (const candidate of candidates) {
    const dKey = candidate.d.hunk.index + ':' + candidate.d.start
    const aKey = candidate.a.hunk.index + ':' + candidate.a.start
    if (usedDel.has(dKey) || usedAdd.has(aKey)) continue
    usedDel.add(dKey)
    usedAdd.add(aKey)
    const delRow = candidate.d.hunk.rows[candidate.d.start + candidate.d.coreOffset]
    const addRow = candidate.a.hunk.rows[candidate.a.start + candidate.a.coreOffset]
    const length = candidate.length
    if (addRow.newNo !== null) delRow.move = { kind: 'to', line: addRow.newNo, endLine: addRow.newNo + length - 1 }
    if (delRow.oldNo !== null) addRow.move = { kind: 'from', line: delRow.oldNo, endLine: delRow.oldNo + length - 1 }
    pairs++
  }
  return pairs
}

/**
 * 汇总一组 hunk 的增删行数（卡片头 +N/−M 与弹窗统计用）。
 *
 * @param {Array<object>} hunks
 * @returns {{added:number, removed:number}}
 */
export function hunkTotals(hunks) {
  let added = 0
  let removed = 0
  for (const hunk of hunks) {
    added += hunk.added
    removed += hunk.removed
  }
  return { added, removed }
}

/**
 * 判断一个 hunk 实际填充了哪几列行号（旧侧 / 新侧）。
 *
 * 全新文件只有新行号、纯删除 hunk（例如文件被清空）只有旧行号；含上下文行的
 * hunk 即使改动全在一侧，也同时有旧/新行号，因此“旧/新”图例在那种情况下仍然
 * 有意义。内联卡片的行号图例用本函数避免给一整列从不出现的数字加标签。
 *
 * @param {object} hunk - diffText / diffFromMeta 生成的 hunk。
 * @returns {{old: boolean, new: boolean}} 每侧是否有行号。
 */
export function gutterSides(hunk) {
  const rows = hunk === null || hunk === undefined ? null : hunk.rows
  if (!Array.isArray(rows)) return { old: false, new: false }
  let hasOld = false
  let hasNew = false
  for (const row of rows) {
    if (!hasOld && row.oldNo !== null && row.oldNo !== undefined) hasOld = true
    if (!hasNew && row.newNo !== null && row.newNo !== undefined) hasNew = true
    if (hasOld && hasNew) break
  }
  return { old: hasOld, new: hasNew }
}

/**
 * 对两段完整文本做 diff，返回带标题（index）的差异模型。
 *
 * 用途：精确 Host 执行快照（实时会话主路径）与运行中调用的参数片段预览。
 *
 * 流程：先测物化预算（超限 → truncated 退化模型，不 split、不建行对象）→
 * contentLines 切行 → LCS/粗对齐 → 行内高亮 → hunk 分组并编号 → 非粗对齐时
 * 识别移动块 → 统计增删。
 *
 * @param {string} beforeText
 * @param {string} afterText
 * @returns {object} 差异模型（hunks 已按 1 起编号）。
 */
export function diffText(beforeText, afterText) {
  // 物化预算前置：超过预算时不 split、不建 LCS/行对象，直接返回带行数的退化模型。
  const oldMetric = measureTextBudget(beforeText)
  const newMetric = measureTextBudget(afterText)
  if (exceedsMaterializationBudget([oldMetric, newMetric])) {
    return truncatedTextModel(beforeText, afterText, oldMetric, newMetric)
  }
  const oldLines = contentLines(beforeText ?? '')
  const newLines = contentLines(afterText ?? '')
  const { rows, coarse } = alignLines(oldLines, newLines)
  annotateIntraLine(rows)
  const hunks = groupHunks(rows)
  hunks.forEach((hunk, index) => { hunk.index = index + 1 })
  if (!coarse) detectMoves(hunks)
  const totals = hunkTotals(hunks)
  return {
    rows,
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    coarse,
    hasNumbers: true,
    beforeText: beforeText ?? '',
    afterText: afterText ?? '',
    beforeLineCount: oldLines.length,
    afterLineCount: newLines.length,
  }
}

/**
 * 由“裸片段”构造预览模型（运行中调用的参数预览）。
 *
 * 与 diffText 的区别：结果只保留 hunks（rows 置空、hasNumbers=false），因为
 * 参数片段的行号不代表文件里的真实行号；卡片随后显示“执行中的预览（精确行号
 * 将在完成后标注）”。同样受物化预算约束，超长参数不会展开成巨大模型。
 *
 * @param {string} oldText - old_string / old_str 片段。
 * @param {string} newText - new_string / new_str 片段。
 * @returns {object} 片段预览模型。
 */
export function fragmentDiff(oldText, newText) {
  // 运行中预览同样受物化预算约束：参数里的超长 old/new 片段不得展开成巨大模型。
  const oldMetric = measureTextBudget(oldText)
  const newMetric = measureTextBudget(newText)
  if (exceedsMaterializationBudget([oldMetric, newMetric])) {
    return {
      rows: [],
      hunks: [],
      added: 0,
      removed: 0,
      oldLineCount: oldMetric.lines,
      newLineCount: newMetric.lines,
      hasNumbers: false,
      fragment: true,
      truncated: true,
      beforeText: oldText ?? '',
      afterText: newText ?? '',
    }
  }
  const oldLines = contentLines(oldText ?? '')
  const newLines = contentLines(newText ?? '')
  const { rows } = alignLines(oldLines, newLines)
  annotateIntraLine(rows)
  const hunks = groupHunks(rows)
  hunks.forEach((hunk, index) => { hunk.index = index + 1 })
  const totals = hunkTotals(hunks)
  return {
    rows: [],
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    hasNumbers: false,
    fragment: true,
    beforeText: oldText ?? '',
    afterText: newText ?? '',
  }
}

/**
 * 去掉定位失败模型里的“伪造行号”：行号基准未知时，把 hunk 与行上的数字全部
 * 清空并标记 hasNumbers=false，UI 显示“行号待定”，绝不展示错误行号。
 */
function stripNumbers(hunks) {
  for (const hunk of hunks) {
    hunk.hasNumbers = false
    hunk.oldStart = null
    hunk.oldEnd = null
    hunk.newStart = null
    hunk.newEnd = null
    for (const row of hunk.rows) {
      row.oldNo = null
      row.newNo = null
    }
  }
}

/**
 * 在相邻 hunk 之间补齐 gap 带（历史回放模型用）。
 *
 * 与 groupHunks 内联生成的 gap 不同：这里只根据相邻 hunk 的行号端点推断两者
 * 之间折叠了多少行；任一侧没有行号（定位失败）时不做推断（gapBefore=null），
 * 避免显示错误的“未修改行数”。
 */
function computeGaps(hunks) {
  for (let i = 0; i < hunks.length; i++) {
    const current = hunks[i]
    if (i === 0) {
      current.gapBefore = null
      continue
    }
    const previous = hunks[i - 1]
    if (!current.hasNumbers || !previous.hasNumbers) {
      current.gapBefore = null
      continue
    }
    const oldStart = previous.oldEnd + 1
    const newStart = previous.newEnd + 1
    const count = current.oldStart - oldStart
    if (count > 0) {
      current.gapBefore = {
        count,
        oldCount: count,
        newCount: count,
        oldStart,
        oldEnd: current.oldStart - 1,
        newStart,
        newEnd: current.newStart - 1,
        shift: newStart - oldStart,
      }
    } else {
      current.gapBefore = null
    }
  }
}

/**
 * 历史回放的行号挂接：把每个 hunk 的“新侧后像”在当前文件里定位，再把累计行号
 * 位移反推回“旧侧”。
 *
 * 场景：实时执行快照已丢失（应用重启后的历史回放），但文件还在磁盘上。每一块
 * 都独立定位、独立失败：
 *   - 有新侧行 → 用整个新侧（含上下文）在文件里找唯一位置；
 *   - 纯删除块 → 用开头至多 CONTEXT_LINES 行的上下文作为探针定位；没有上下文
 *     的裸删除没有锚点，保持行号待定；
 *   - 找唯一位置失败 / 有歧义 / 超搜索预算 → 该 hunk 保持待定（hasNumbers
 *     false），其余 hunk 照常编号；
 *   - 行号一旦定位成功，就沿行流逐行填充 oldNo/newNo，并回填 hunk 端点与 gap。
 *
 * 位移 shift 按 hunk 顺序累计：newCount − oldCount 是这一块造成的行数变化，
 * 后一块的旧侧 = 新侧 − 累计位移。
 *
 * @param {Array<object>} hunks - 已生成 rows 的 hunk（原地修改行号字段）。
 * @param {string[]} fileLines - 当前文件内容行。
 * @returns {void}
 */
export function attachLineNumbers(hunks, fileLines) {
  let shift = 0
  for (const hunk of hunks) {
    const newSide = hunk.rows.filter(row => row.kind !== 'del').map(row => row.text)
    const oldSide = hunk.rows.filter(row => row.kind !== 'add')
    let baseNew = null
    if (newSide.length > 0) {
      const at = locateOnce(newSide, fileLines)
      if (at >= 0) baseNew = at + 1
    } else if (oldSide.length > 0) {
      // 纯删除 hunk：它的开头上下文（如果有）仍存在于当前文件里，可作探针；
      // 没有上下文的裸删除没有锚点，保持行号待定。
      const probe = oldSide.slice(0, Math.min(CONTEXT_LINES, oldSide.length)).map(row => row.text)
      const at = locateOnce(probe, fileLines)
      if (at >= 0) baseNew = at + 1 + shift
    }
    if (baseNew !== null) {
      const baseOld = baseNew - shift
      let oldNo = baseOld
      let newNo = baseNew
      for (const row of hunk.rows) {
        if (row.kind === 'ctx') {
          row.oldNo = oldNo++
          row.newNo = newNo++
        } else if (row.kind === 'del') {
          row.oldNo = oldNo++
          row.newNo = null
        } else {
          row.oldNo = null
          row.newNo = newNo++
        }
      }
      hunk.oldStart = hunk.rows.find(row => row.oldNo !== null)?.oldNo ?? baseOld
      hunk.newStart = hunk.rows.find(row => row.newNo !== null)?.newNo ?? baseNew
      hunk.oldEnd = [...hunk.rows].reverse().find(row => row.oldNo !== null)?.oldNo ?? hunk.oldStart - 1
      hunk.newEnd = [...hunk.rows].reverse().find(row => row.newNo !== null)?.newNo ?? hunk.newStart - 1
      hunk.hasNumbers = true
    }
    shift += hunk.newCount - hunk.oldCount
  }
  computeGaps(hunks)
}

/**
 * 把宿主结果元数据里的 `diffs` 收窄成形状可信的文件差异块。
 *
 * 宽容策略：`diffs` 不是数组 / 为空 → null；只要有一个块形状不对（非对象、
 * path 不是字符串、oldText 既不是 null 也不是字符串、newText 不是字符串）就
 * 整体返回 null——宁可整份回退到参数预览，也不展示半份可能错位的差异。
 *
 * @param {unknown} diffs - `call.meta.diffs`。
 * @returns {Array<{path:string, oldText:string|null, newText:string}>|null}
 */
export function narrowDiffs(diffs) {
  if (!Array.isArray(diffs) || diffs.length === 0) return null
  const out = []
  for (const hunk of diffs) {
    if (hunk === null || typeof hunk !== 'object') return null
    const path = hunk.path
    const oldText = hunk.oldText
    const newText = hunk.newText
    if (typeof path !== 'string' || (oldText !== null && typeof oldText !== 'string') || typeof newText !== 'string') return null
    out.push({ path, oldText, newText })
  }
  return out
}

/**
 * 由宿主记录的 `meta.diffs` 构造回退模型（历史回放的第二级数据源）。
 *
 * 每个 meta diff 已经是“带 ±3 行上下文的变更块”，因此不再做整文件对齐：
 *   - 物化预算前置：meta 来自 Session 日志，异常记录也可能携带超大文本；超限
 *     时返回空 hunks 的退化模型（行号待定），不展开任何行对象；
 *   - 逐块 alignLines（块很小，通常远低于预算）→ 行内高亮 → makeHunk；
 *   - 先 stripNumbers 清空伪造行号，再（如果调用方读到了当前文件）用
 *     attachLineNumbers 按文件定位真实行号；定位失败就保持待定；
 *   - 返回模型不含全文（beforeText/afterText 为 null），因此“全文对照”页签
 *     会置灰并给出历史回放说明。
 *
 * @param {Array<{path:string, oldText:string|null, newText:string}>} diffs - narrowDiffs 的结果。
 * @param {string[]|null} fileLines - 当前文件内容行（读不到时为 null）。
 * @returns {object} 差异模型（source 为 'located' 或 'meta'）。
 */
export function diffFromMeta(diffs, fileLines) {
  // 物化预算前置：meta 差异来自 Session 日志，异常记录也可能携带超大文本；
  // 超限时返回空 hunks 的退化模型（行号待定），不展开任何行对象。
  let metaLines = 0
  let metaMaxLine = 0
  for (const diff of Array.isArray(diffs) ? diffs : []) {
    if (diff === null || typeof diff !== 'object') continue
    const oldMetric = measureTextBudget(diff.oldText ?? '')
    const newMetric = measureTextBudget(diff.newText)
    metaLines += oldMetric.lines + newMetric.lines
    if (oldMetric.maxLineLength > metaMaxLine) metaMaxLine = oldMetric.maxLineLength
    if (newMetric.maxLineLength > metaMaxLine) metaMaxLine = newMetric.maxLineLength
  }
  if (metaLines > MAX_MATERIALIZED_LINES || metaMaxLine > MAX_SINGLE_LINE_CHARS) {
    return {
      rows: [],
      hunks: [],
      added: 0,
      removed: 0,
      oldLineCount: null,
      newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
      hasNumbers: false,
      source: 'meta',
      truncated: true,
      beforeText: null,
      afterText: null,
    }
  }
  const hunks = []
  let added = 0
  let removed = 0
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i]
    const oldLines = contentLines(diff.oldText ?? '')
    const newLines = contentLines(diff.newText)
    const { rows } = alignLines(oldLines, newLines)
    annotateIntraLine(rows)
    const hunk = makeHunk(rows, 1, 1, null)
    hunk.index = i + 1
    added += hunk.added
    removed += hunk.removed
    hunks.push(hunk)
  }
  stripNumbers(hunks)
  if (Array.isArray(fileLines)) attachLineNumbers(hunks, fileLines)
  return {
    rows: [],
    hunks,
    added,
    removed,
    oldLineCount: null,
    newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
    hasNumbers: hunks.length > 0 && hunks.every(hunk => hunk.hasNumbers),
    source: Array.isArray(fileLines) ? 'located' : 'meta',
    beforeText: null,
    afterText: null,
  }
}

/**
 * 把相对路径解析成绝对路径（仅展示用途，不做安全围栏）。
 *
 * 规则：空路径返回 ''；已经是 Windows 盘符 / UNC / POSIX 绝对路径的原样返回；
 * 有工作区根时按根的分隔符风格拼接；没有根时返回原路径。
 *
 * 注意：这里是“显示辅助”，真正决定能不能读文件的是 Host 侧
 * plugin/index.js 的 realpath 围栏；浏览器侧拼接只用于显示和 openFile 跳转。
 *
 * @param {string} cwd - 工作区根路径。
 * @param {string} path - 参数里的路径（可能相对）。
 * @returns {string}
 */
export function joinPath(cwd, path) {
  if (typeof path !== 'string' || path === '') return ''
  if (/^[A-Za-z]:[\\/]/.test(path) || path.startsWith('\\\\') || path.startsWith('/')) return path
  if (typeof cwd !== 'string' || cwd === '') return path
  const separator = cwd.includes('\\') ? '\\' : '/'
  return `${cwd.replace(/[\\/]+$/, '')}${separator}${path.replace(/^[\\/]+/, '')}`
}

/**
 * 路径的简短展示形式：优先相对工作区，其次把 home 目录缩成 `~`。
 *
 * 只做字符串前缀替换，不解析符号链接、不访问文件系统；前缀替换要求恰好落在
 * 目录边界（`root + '/'` / `root + '\\'`）上，避免 `/work-a` 误吃 `/work-ab`。
 * home 缩写只在 home 不是 Windows 盘符路径时启用（盘符路径与工作区相对化的
 * 语义冲突，且 `~` 在 Windows 上易混淆）。
 *
 * @param {string} path - 原始路径（绝对或展示路径）。
 * @param {string} [cwd] - 工作区根。
 * @param {string} [home] - 宿主 home。
 * @returns {string} 展示路径；空输入返回 ''。
 */
export function displayPath(path, cwd, home) {
  if (typeof path !== 'string' || path === '') return ''
  let text = path
  if (typeof cwd === 'string' && cwd !== '') {
    const root = cwd.replace(/[\\/]+$/, '')
    if (text === root) text = '.'
    else if (text.startsWith(root + '/') || text.startsWith(root + '\\')) text = text.slice(root.length + 1)
  }
  if (typeof home === 'string' && home !== '' && !/^[A-Za-z]:/.test(home)) {
    const root = home.replace(/\/+$/, '')
    if (text === root) text = '~'
    else if (text.startsWith(root + '/')) text = '~' + text.slice(root.length)
  }
  return text
}
