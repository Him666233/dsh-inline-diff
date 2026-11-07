/**
 * 卡片模型推导：把一次工具调用 block（加上 Host 执行快照，或回退到 Host 记录的
 * 展示差异块）归一成内联卡片与放大弹窗共享的展示模型。
 *
 * 职责：这是“原始会话数据 → 渲染模型”的唯一入口，负责：
 *   - 两种 block 形状（运行中 `StartedToolCall` / `PreparingToolCall`、已落定
 *     `ToolResultNode`）的归一（deriveCall）；
 *   - 工具名、标题 key、操作类型（新建/更新/覆盖）的判定；
 *   - 三类数据源的选择与降级：精确执行快照 → 元数据差异块 → 调用参数预览；
 *   - 预算判断（物化/对齐）与对应 notice（超大文件、粗对齐、历史回放、
 *     无快照工具、行号待定等），供卡片与弹窗给出可读说明。
 *
 * 依赖：./diff.js（内容切分、预算测量、LCS 对齐、差异块定位、行号挂接）、
 * 以及宿主提供的 block 形状。本模块不访问网络/DOM，可在 Node 单测中直接调用。
 *
 * 输入输出：
 *   - 输入：buildCardModel({ block, toolName, cwd, home, snapshot, fileText,
 *     loading })；snapshot 来自 Host API（可能为 null），fileText 为当前文件
 *     文本（历史回放定位行号用，可能为 null）。
 *   - 输出：统一形状的模型 { toolName, titleKey, callId, filePath,
 *     absolutePath, operation, status, source, diff, notice, errorMessage,
 *     loading, parentCallId }；status 取值 preparing / running / ok / nochange /
 *     error / empty，source 取值 snapshot / located / meta / args / preview。
 *
 * 失败与回退（README「多级回退与容错」）：
 *   1. 修改前全文：Host 执行快照（精确）→ 元数据差异块 + 当前文件定位行号 →
 *      差异块 + “行号待定/不保存执行快照”说明；
 *   2. 超大文件：完整 diff → 差异块模式（notice huge/lines）→ 退化模型
 *      （notice truncated，不渲染逐行内容，页面不冻结）；
 *   3. 任何字段形状异常（argsRaw 不是 JSON、meta.diffs 残缺、快照缺 after）
 *      都按“不可用”跳过，绝不抛错——卡片最坏只显示“没有可展示的差异”。
 */
import {
  ALIGN_MAX_CELLS,
  ALIGN_MAX_SIDE_LINES,
  contentLines,
  diffFromMeta,
  diffText,
  displayPath,
  exceedsMaterializationBudget,
  fragmentDiff,
  joinPath,
  measureTextBudget,
  narrowDiffs,
} from './diff.js'

/** 本插件以差异卡片形式接管的文件修改工具（index.jsx 用它注册 keyed 视图）。 */
export const MUTATION_TOOLS = ['edit', 'write', 'str_replace_editor']

/**
 * 把工具调用的原始参数解析成对象；不是合法 JSON 对象时返回 null。
 *
 * 边界：空串 / 非字符串 / 数组 / null / 标量 / 坏 JSON 一律 null。参数解析失败
 * 不算异常：运行中预览只是不显示，失败归因交给 tool-status.js 的后备规则。
 *
 * @param {unknown} raw - `call.argsRaw`
 * @returns {object|null}
 */
export function parseArgs(raw) {
  if (typeof raw !== 'string' || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * 从已解析参数里取一个字符串字段。
 * @param {object|null} args
 * @param {string} key
 * @returns {string|undefined} 非字符串时 undefined（调用方用 ?? 走下一候选）。
 */
function stringArg(args, key) {
  if (args === null) return undefined
  const value = args[key]
  return typeof value === 'string' ? value : undefined
}

/* =========================================================================
 * 一、共享文本小工具（从 JSX 层收敛上来的纯函数）
 * ====================================================================== */

/**
 * 第一行文本（不含换行符本身）。
 *
 * 为什么共享：卡片摘要（命令/描述的首行）、错误摘要、参数摘要都要“只取第一行”，
 * 之前三处各写了一遍（model.js 的 errorMessage、enhanced-shell.jsx 的
 * firstLine、enhanced-tools.jsx 的 clampSummary）。这里统一成不 trim 的纯函数，
 * 需要 trim 的调用方自己 trim，保持各处原有输出（有的要保留行内空格）。
 *
 * @param {unknown} text
 * @returns {string} 非字符串返回空串；无换行时原样返回。
 */
export function firstLine(text) {
  if (typeof text !== 'string' || text === '') return ''
  const newline = text.indexOf('\n')
  return newline === -1 ? text : text.slice(0, newline)
}

/**
 * 从工具错误的 `error` 信息里取一条可读原因。
 *
 * 优先级 reason（最具体）→ code（稳定错误码）→ name（错误类型名）；都取不到
 * 时返回空串。为什么共享：enhanced-shell / enhanced-tools 的 OUT 文本与
 * model.js 的错误摘要用的是同一套规则，集中一处避免三份实现漂移。
 *
 * @param {unknown} info - `call.error`，允许 null / 非对象。
 * @returns {string} 可读原因，或空串。
 */
export function errorReason(info) {
  if (info === null || typeof info !== 'object') return ''
  if (typeof info.reason === 'string') return info.reason
  if (typeof info.code === 'string') return info.code
  if (typeof info.name === 'string') return info.name
  return ''
}

/**
 * 把一次工具调用的 content 块拼成展示文本（OUT 段/结果摘要用）。
 *
 * 规则（与 1.2.x 的 resultText / outputText 保持一致）：
 *   - `{ type:'text', text }` → 原文；
 *   - `{ type:'image' }` → 传入的占位标记（图片没有可展示的文本）；
 *   - 其它带 type 的块 → JSON 美化字符串（未知结果类型也尽量让用户看到内容）；
 *   - 没有文本块且调用失败时 → 错误原因（不吞错，至少显示失败原因）。
 *
 * 为什么共享：enhanced-shell.jsx 与 enhanced-tools.jsx 各有一份几乎相同的实现，
 * 唯一区别是图片占位（命令行的图片结果不需要 IN/OUT 标记，通用工具需要按插件
 * 语言显示 `[图片]`）。用可选参数表达这一差异，其余行为逐字保持。
 *
 * @param {object} call - deriveCall(block) 的结果。
 * @param {string} [imageMarker] - 图片块的占位文本；不传时按未知块 JSON 展示。
 * @returns {string} 以换行连接的展示文本；永不为 null。
 */
export function contentText(call, imageMarker) {
  const parts = []
  const blocks = call !== null && typeof call === 'object' && Array.isArray(call.content) ? call.content : []
  for (const part of blocks) {
    if (part === null || typeof part !== 'object') continue
    if (part.type === 'text' && typeof part.text === 'string') parts.push(part.text)
    else if (part.type === 'image' && typeof imageMarker === 'string') parts.push(imageMarker)
    else if (part.type !== undefined) parts.push(JSON.stringify(part, null, 2))
  }
  if (parts.length === 0) {
    const reason = errorReason(call !== null && typeof call === 'object' ? call.error : undefined)
    if (reason !== '') parts.push(reason)
  }
  return parts.join('\n')
}

/**
 * 运行状态 → i18n key。
 *
 * components.jsx 的 stateKeyOf 与 enhanced-tools.jsx 的 statusKey 完全相同，
 * 合并到这里；未知状态返回 null（调用方不渲染状态标签）。
 *
 * @param {string} status - 'preparing' | 'running' | 'error' | 'stopped' | 其它。
 * @returns {string | null}
 */
export function stateKeyOf(status) {
  if (status === 'preparing') return 'state.preparing'
  if (status === 'running') return 'state.running'
  if (status === 'error') return 'state.error'
  if (status === 'stopped') return 'state.stopped'
  return null
}

/* =========================================================================
 * 二、block 归一化与基础判定
 * ====================================================================== */

/**
 * 归一化宿主给出的两种 block 形状。
 *
 *   - 运行中：`StartedToolCall` / `PreparingToolCall` 本身（有 phase/name/argsRaw）；
 *   - 已落定：`ToolResultNode`（有 kind 字段，真正的调用在其 `.call` 上，结果
 *     字段分别挂在 node 的 meta/content/error/isError 上）。
 *
 * 判定“已落定”用 `'kind' in block`：ToolResultNode 一定带 kind，而运行中 block
 * 没有；不依赖具体 kind 值，避免宿主新增结果类型时误判。
 *
 * 所有字段都做了形状收窄（非字符串 name → ''、坏 JSON argsRaw → args null、
 * content 非数组 → []），保证下游可以无条件读取。
 *
 * @param {object} block
 * @returns {object} { settled, phase, name, argsRaw, args, meta, callId,
 *   parentCallId, isError, error, content, raw }
 */
export function deriveCall(block) {
  const settled = block !== null && typeof block === 'object' && 'kind' in block
  const call = settled ? block.call : block
  const phase = settled ? 'result' : (call?.phase === 'preparing' ? 'preparing' : 'start')
  return {
    settled,
    phase,
    name: typeof call?.name === 'string' ? call.name : '',
    argsRaw: typeof call?.argsRaw === 'string' ? call.argsRaw : null,
    args: parseArgs(call?.argsRaw),
    meta: settled ? block.meta : undefined,
    callId: settled ? block.callId : call?.callId,
    parentCallId: settled ? block.parentCallId : call?.parentCallId,
    isError: settled && block.isError === true,
    error: settled ? block.error : undefined,
    content: settled && Array.isArray(block.content) ? block.content : [],
    raw: block,
  }
}

/**
 * 行上显示的工具名：优先用 block 自己带的名字（运行中阶段 keyed 分发名可能还
 * 没同步进来），没有时退回 keyed 注册时传入的 fallback。
 *
 * @param {object} call - deriveCall 结果。
 * @param {string} [fallback]
 * @returns {string}
 */
export function resolveToolName(call, fallback) {
  if (call.name !== '') return call.name
  return typeof fallback === 'string' ? fallback : ''
}

/**
 * 已落定失败的简短错误摘要（卡片头的失败原因）。
 *
 * 取值顺序：结果文本块 → error.reason/code/name；然后 trim、只保留第一行，
 * 避免把整段堆栈塞进卡片头。
 *
 * @param {object} call - deriveCall 结果（已确认 isError）。
 * @returns {string} 空串表示没有可用摘要（UI 显示通用失败文案）。
 */
function errorMessage(call) {
  if (call.isError !== true) return ''
  const parts = []
  for (const part of call.content) {
    if (part?.type === 'text' && typeof part.text === 'string') parts.push(part.text)
  }
  if (parts.length === 0) {
    // 结果里没有文本块时退回 error 结构中的可读原因（reason/code/name）。
    const reason = errorReason(call.error)
    if (reason !== '') parts.push(reason)
  }
  const text = parts.join('\n').trim()
  return text === '' ? '' : firstLine(text)
}

/**
 * 工具名 → 卡片标题的 i18n key。
 * 三种被接管的工具各有标题；未知工具按 edit 处理（理论上不会发生）。
 */
export function titleKeyOf(toolName) {
  if (toolName === 'write') return 'title.write'
  if (toolName === 'str_replace_editor') return 'title.strReplace'
  return 'title.edit'
}

/**
 * 操作类型 → 徽标 i18n key。
 * 'create'（新建）、'overwrite'（覆盖写入）、其它一律按 'update'（更新）。
 */
export function operationKey(operation) {
  if (operation === 'create') return 'op.create'
  if (operation === 'overwrite') return 'op.overwrite'
  return 'op.update'
}

/**
 * 判定一次修改的操作类型（新建 / 更新）。
 *
 * 优先级：
 *   1. 有执行快照：快照 operation='create' 或 before===null（没有旧文本）→ 新建；
 *   2. 元数据 operation 明确给出 create/update → 采用；
 *   3. str_replace_editor 的 `command: 'create'` → 新建；
 *   4. 元数据差异块里所有 oldText 都是 null（纯新增）→ 新建；
 *   5. 其余 → 更新。
 *
 * 为什么需要第 3/4 步：纯新增的 edit（往已有文件里加行）不该被误判成新建文件；
 * 真正的“新建”信号只有 oldText:null / command:create 这类明确证据。
 *
 * @param {object|null} snapshot - Host 执行快照或 null。
 * @param {object} call - deriveCall 结果。
 * @param {string} toolName - 已解析的工具名。
 * @returns {'create'|'update'}
 */
function resolveOperation(snapshot, call, toolName) {
  if (snapshot !== null && snapshot !== undefined) {
    if (snapshot.operation === 'create' || snapshot.before === null) return 'create'
    return 'update'
  }
  const metaOperation = call.meta !== null && typeof call.meta === 'object' ? call.meta.operation : undefined
  if (metaOperation === 'create') return 'create'
  if (metaOperation === 'update') return 'update'
  // 纯新增 edit 只是往已有文件加行，不能当成新建文件；真正的创建在 meta.diffs
  // 里带 oldText:null，str_replace_editor create 则把操作写在参数里。
  if (toolName === 'str_replace_editor' && stringArg(call.args, 'command') === 'create') return 'create'
  const diffs = call.meta !== null && typeof call.meta === 'object' && Array.isArray(call.meta.diffs) ? call.meta.diffs : []
  if (diffs.length > 0 && diffs.every(diff => diff !== null && typeof diff === 'object' && diff.oldText === null)) return 'create'
  return 'update'
}

/**
 * 判断两侧文本是否超出浏览器 LCS 对齐预算（或物化预算）。
 *
 * 先用无分配的 measureTextBudget 取行数，避免为了判断预算而 split 出数百万行；
 * 物化预算（总行数/单行长度）与对齐预算一起决定是否走“超大文件”降级路径。
 *
 * @param {string} beforeText
 * @param {string} afterText
 * @returns {boolean}
 */
function exceedsAlignBudget(beforeText, afterText) {
  const oldMetric = measureTextBudget(beforeText)
  const newMetric = measureTextBudget(afterText)
  return oldMetric.lines > ALIGN_MAX_SIDE_LINES
    || newMetric.lines > ALIGN_MAX_SIDE_LINES
    || oldMetric.lines * newMetric.lines > ALIGN_MAX_CELLS
    || exceedsMaterializationBudget([oldMetric, newMetric])
}

/* =========================================================================
 * 三、展示模型推导
 * ====================================================================== */

/**
 * 推导一张卡片的展示模型。
 *
 * 决策顺序（也是回退顺序）：
 *   A. 运行中 / 准备中 → 参数预览（write 的 content、edit 的 old/new 片段、
 *      str_replace_editor 的 file_text/old_str/new_str）；被落定快照取代。
 *   B. 已落定且失败 → 错误模型（错误摘要）。
 *   C. 已落定成功：
 *      1. 有执行快照 → 精确 diffText；超过对齐/物化预算时退到
 *         “差异块 + 当前文件定位行号”，再退到粗对齐/截断的退化模型；
 *      2. 无快照但有 meta.diffs → 差异块模型；能读到当前文件就用它定位行号，
 *         读不到则行号待定；str_replace_editor 用“不保存执行快照”的专用提示；
 *      3. write 且没有 diff 元数据 → 按参数 content 重建新建模型；
 *      4. 其余 → 空模型（卡片显示“没有可展示的差异”）。
 *
 * @param {object} input
 * @param {object} input.block - 宿主提供的调用/结果 block。
 * @param {string} [input.toolName] - keyed 分发名（运行中阶段的名字回退）。
 * @param {string} [input.cwd] - 会话工作区根目录。
 * @param {string} [input.home] - 宿主 home（用于 `~` 缩写展示）。
 * @param {object|null} [input.snapshot] - Host 捕获的
 *   `{ before, after, path, operation }`。
 * @param {string|null} [input.fileText] - 当前文件全文（历史回放定位行号用）。
 * @param {boolean} [input.loading] - 文件/快照仍在读取中（避免过早显示“行号待定”）。
 * @returns {object} 卡片/弹窗共享的展示模型。
 */
export function buildCardModel({ block, toolName, cwd, home, snapshot, fileText, loading }) {
  const call = deriveCall(block)
  const resolvedToolName = resolveToolName(call, toolName)
  // 路径优先用元数据里的绝对路径（最准确），否则用参数路径拼工作区根。
  const argsPath = stringArg(call.args, 'file_path') ?? stringArg(call.args, 'path')
  const metaPath = call.meta !== null && typeof call.meta === 'object' && typeof call.meta.path === 'string' ? call.meta.path : null
  const absolutePath = metaPath !== null && metaPath !== '' ? metaPath : joinPath(cwd, argsPath ?? '')
  const shownPath = displayPath(metaPath !== null && metaPath !== '' ? metaPath : (argsPath ?? ''), cwd, home)
  const base = {
    toolName: resolvedToolName,
    titleKey: titleKeyOf(resolvedToolName),
    callId: call.callId,
    filePath: shownPath,
    absolutePath: absolutePath !== '' ? absolutePath : null,
    operation: 'update',
    status: 'running',
    source: null,
    diff: null,
    notice: null,
    errorMessage: '',
    loading: loading === true,
    parentCallId: call.parentCallId,
  }

  // A. 准备中：模型还没拿到参数，只显示“准备中”状态。
  if (call.phase === 'preparing') {
    return { ...base, status: 'preparing' }
  }

  // B. 已落定失败：展示错误摘要（取不到摘要时 UI 用通用失败文案）。
  if (call.settled && call.isError) {
    return { ...base, status: 'error', errorMessage: errorMessage(call) }
  }

  if (call.settled) {
    // C1. 精确 Host 执行快照（实时会话主路径）。
    if (snapshot !== null && snapshot !== undefined && typeof snapshot.after === 'string') {
      const before = typeof snapshot.before === 'string' ? snapshot.before : null
      const after = snapshot.after
      const operation = resolveOperation(snapshot, call, resolvedToolName)
      // 行数只测一次，供预算判断、标签与弹窗页脚共用（避免为计数反复 split）。
      const oldMetric = measureTextBudget(before ?? '')
      const newMetric = measureTextBudget(after)
      const overMaterialization = exceedsMaterializationBudget([oldMetric, newMetric])
      if (before !== null && before === after) {
        return { ...base, status: 'nochange', operation, source: 'snapshot', diff: diffText(before, after) }
      }
      // 创建（before === null）同样可能命中物化预算：一个巨大的新建文件不能
      // 因为没有“旧侧”就跳过降级判断。
      if (overMaterialization || (before !== null && exceedsAlignBudget(before, after))) {
        const oldCount = oldMetric.lines
        const newCount = newMetric.lines
        const diffs = narrowDiffs(call.meta?.diffs)
        if (diffs !== null) {
          // 超预算时不再为定位行号切分完整新文件，行号保持待定。
          const fileLines = overMaterialization ? null : contentLines(after)
          const located = diffFromMeta(diffs, fileLines)
          // 即使浏览器跳过了完整对齐，两侧真实行数仍然已知：保留给弹窗页脚。
          located.oldLineCount = oldCount
          located.newLineCount = newCount
          return {
            ...base,
            status: 'ok',
            operation,
            source: 'located',
            notice: { kind: 'huge', old: oldCount, new: newCount },
            diff: located,
          }
        }
        // 没有差异块元数据：退到粗对齐/截断后的退化模型（可能没有逐行内容）。
        const coarse = diffText(before ?? '', after)
        return {
          ...base,
          status: 'ok',
          operation,
          source: 'snapshot',
          notice: coarse.truncated === true
            ? { kind: 'huge', old: oldCount, new: newCount }
            : coarse.coarse
              ? { kind: 'coarse', old: oldCount, new: newCount }
              : { kind: 'huge', old: oldCount, new: newCount },
          diff: coarse,
        }
      }
      return {
        ...base,
        status: 'ok',
        operation,
        source: 'snapshot',
        diff: diffText(before ?? '', after),
      }
    }
    // C2. 无执行快照，回退到 Host 记录的展示差异块（历史回放主路径）。
    const diffs = narrowDiffs(call.meta?.diffs)
    if (diffs !== null) {
      // 当前文件同样先过物化预算：超过预算时不做 contentLines 全量切分，
      // 行号保持待定（卡片显示“行号待定”提示）。
      const lines = typeof fileText === 'string' && !exceedsMaterializationBudget([measureTextBudget(fileText)])
        ? contentLines(fileText)
        : null
      const located = diffFromMeta(diffs, lines)
      const hasNumbers = located.hasNumbers === true
      // str_replace_editor 不会产生 Host 执行快照（Host 只捕获 edit/write），
      // 因此它的卡片不是“历史回放”——只是无法提供全文对照。这里用专用提示，
      // 而不是“快照丢失”的历史回放措辞。
      const snapshotlessTool = resolvedToolName === 'str_replace_editor'
      return {
        ...base,
        status: 'ok',
        operation: resolveOperation(null, call, resolvedToolName),
        source: lines === null || !hasNumbers ? 'meta' : 'located',
        notice: lines === null
          ? (loading === true ? null : { kind: 'lines' })
          : snapshotlessTool
            ? { kind: hasNumbers ? 'tool' : 'toolLocate' }
            : hasNumbers ? { kind: 'history' } : { kind: 'locate' },
        diff: located,
      }
    }
    // C3. 没有差异块的 write：按参数内容重建（新建，或一次内容相同的重写）。
    if (resolvedToolName === 'write') {
      const content = stringArg(call.args, 'content')
      const metaOperation = call.meta !== null && typeof call.meta === 'object' ? call.meta.operation : undefined
      if (typeof content === 'string' && metaOperation !== 'update') {
        const created = diffText('', content)
        // 新建文件也可能超大：给出“文件过大”提示，而不是一张没有任何解释的空卡片。
        if (created.truncated === true) {
          return {
            ...base,
            status: 'ok',
            operation: 'create',
            source: 'args',
            notice: { kind: 'huge', old: 0, new: created.newLineCount },
            diff: created,
          }
        }
        return { ...base, status: 'ok', operation: 'create', source: 'args', diff: created }
      }
      return { ...base, status: 'nochange', operation: metaOperation === 'create' ? 'create' : 'update', source: null }
    }
    // C4. 已落定但没有可展示的数据：空模型（卡片显示“没有可展示的差异”）。
    return { ...base, status: 'empty' }
  }

  // A（续）. 运行中/准备中：只用参数生成预览，落定后会被精确快照取代。
  // 预览的所有文本同样经过 diff.js 的物化预算，超长参数不会展开成巨大模型。
  const args = call.args
  if (resolvedToolName === 'write') {
    const content = stringArg(args, 'content')
    if (typeof content === 'string') {
      const preview = diffText('', content)
      return { ...base, status: 'running', operation: 'create', source: 'preview', diff: preview }
    }
  } else if (resolvedToolName === 'edit') {
    const oldString = stringArg(args, 'old_string')
    const newString = stringArg(args, 'new_string')
    if (typeof oldString === 'string' && typeof newString === 'string') {
      const preview = fragmentDiff(oldString, newString)
      return { ...base, status: 'running', operation: 'update', source: 'preview', diff: preview }
    }
  } else if (resolvedToolName === 'str_replace_editor') {
    const oldString = stringArg(args, 'old_str')
    const newString = stringArg(args, 'new_str')
    const fileTextArg = stringArg(args, 'file_text')
    if (typeof fileTextArg === 'string') {
      return { ...base, status: 'running', operation: 'create', source: 'preview', diff: diffText('', fileTextArg) }
    }
    if (typeof oldString === 'string' && typeof newString === 'string') {
      return { ...base, status: 'running', operation: 'update', source: 'preview', diff: fragmentDiff(oldString, newString) }
    }
  }
  return { ...base, status: 'running' }
}
