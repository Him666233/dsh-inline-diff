/**
 * 内联差异卡片（会话级，接管 DSH 原生 edit/write 行）与全屏左右对照弹窗
 * （根级 overlay）。
 *
 * 职责：
 *   - 卡片：从 block + Host 快照/文件文本推导模型（model.js），渲染卡片头
 *     （工具名、操作徽标、路径、语言徽章、增删统计、状态、放大按钮）、降级提示、
 *     有限行的内联 hunk 列表与页脚；
 *   - 弹窗：订阅 store.js 的载荷，渲染“变更块 / 全文对照”两个页签、修改前/后
 *     栏头、固定提示横幅、页脚（来源、行数、Esc 关闭）；
 *   - 共享渲染件：行号槽、行内 token/segment 切分、move 标注、gap 带、徽章。
 *
 * 依赖：react / react-dom（portal）、./api.js（快照与文件读取缓存）、
 * ./diff.js（行数/渲染预算与 gutterSides）、./enhanced-tools.jsx（轨迹按钮）、
 * ./highlight.js（token）、./languages.js（语言识别/徽章）、./model.js（模型与
 * 共享纯函数）、./store.js（弹窗开关）、./use-settings.js（设置订阅）。
 *
 * 输入输出：InlineDiffCard(props) / DiffModal(props) 是 slot 组件；props 由宿主
 * 注入（block、cwd、home、sessionId、t 等），组件不修改宿主数据。
 *
 * 失败与回退（README「多级回退与容错」在渲染层的表现）：
 *   - 快照/文件读取失败 → api 返回 null → 模型退回元数据差异块或空模型，卡片仍
 *     渲染（显示“没有可展示的差异/行号待定”）；
 *   - diff 模型 truncated → 优先显示“文件过大”提示，不渲染任何行对象；
 *   - 高亮 token 不可用/校验失败 → 每行回退纯文本默认前景色；
 *   - 单行超长 → 只渲染截断后的纯文本（title 说明总字符数），不拼 token；
 *   - 全文对照不可用 → 页签 disabled + 悬停显示具体原因（历史回放/无快照/过大）。
 */
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cachedFileText, cachedSnapshot } from './api.js'
import { FULL_VIEW_ROW_CAP, INLINE_ROW_CAP, gutterSides } from './diff.js'
import { InspectButton } from './enhanced-tools.jsx'
import { getDiffHighlighter, tokensForRow } from './highlight.js'
import { detectLanguage, languageInfo } from './languages.js'
import { buildCardModel, deriveCall, operationKey, stateKeyOf } from './model.js'
import { pulsePhase } from './motion.js'
import { closeDiffModal, getDiffModal, openDiffModal, subscribeDiffModal } from './store.js'
import { useSettingsSnapshot } from './use-settings.js'

/** 内联 SVG 图标集（不引入外部图元依赖；currentColor 跟随文字颜色）。 */
function Icon({ kind, size = 14 }) {
  const common = {
    viewBox: '0 0 16 16',
    width: size,
    height: size,
    fill: 'none',
    'aria-hidden': true,
    focusable: 'false',
  }
  if (kind === 'chevron') {
    return (
      <svg {...common}>
        <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'expand') {
    return (
      <svg {...common}>
        <path
          d="M9.5 2h4.5v4.5M6.5 2H2v4.5M9.5 14H14V9.5M6.5 14H2V9.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (kind === 'close') {
    return (
      <svg {...common}>
        <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path
        d="M11.6 1.9a1.75 1.75 0 0 1 2.5 2.5l-.7.7-2.5-2.5.7-.7Zm-1.4 1.4 2.5 2.5-7.4 7.4-3.4.9.9-3.4 7.4-7.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** 格式化一个 1 起算的行区间：Lx 或 Lx–Ly；无行号返回空串。 */
function range(start, end) {
  if (start === null || start === undefined) return ''
  return start === end ? `L${start}` : `L${start}–L${end}`
}

/** 一个 hunk 的旧/新行号范围的本地化描述（hunk 头）。 */
function hunkRangeText(hunk, t) {
  if (hunk.hasNumbers !== true) return t('unknownRange')
  if (hunk.oldCount === 0) return t('hunkHeaderNew', { new: range(hunk.newStart, hunk.newEnd) })
  if (hunk.newCount === 0) return t('hunkHeaderDel', { old: range(hunk.oldStart, hunk.oldEnd) })
  return t('hunkHeader', {
    old: range(hunk.oldStart, hunk.oldEnd),
    new: range(hunk.newStart, hunk.newEnd),
  })
}

/** 卡片/弹窗页脚的“数据来源”说明（按插件语言渲染）。 */
function sourceLabel(source, t) {
  if (source === 'snapshot') return t('snapshotSource')
  if (source === 'located') return t('locatedSource')
  if (source === 'preview') return t('preview')
  if (source === 'args') return t('argsSource')
  return t('lineUnknown')
}

/**
 * 折叠卡片的渲染计划：在 INLINE_ROW_CAP 行预算内按 hunk 顺序取行。
 *
 * 先统计全部 hunk 的总行数（total），再按预算逐块放入；预算耗尽后不再加入新
 * hunk，但 total 已完整，因此页脚“另有 N 行未展开”的数字是准确的（若在循环里
 * 边加边统计，后面的行会被漏算，提示会偏小）。
 *
 * @param {object} diff - 差异模型。
 * @returns {{parts: Array<object>, shown:number, total:number}}
 *   parts 元素为 { type:'gap', gap, key } 或 { type:'hunk', hunk, rows, key }。
 */
function buildInlinePlan(diff) {
  const parts = []
  let budget = INLINE_ROW_CAP
  let shown = 0
  // 先一次性统计全部 hunk 的总行数：循环一旦耗尽预算就会停止加入新 hunk，
  // 若在循环里边加边统计，未渲染的行会被漏算，页脚“另有 N 行”会偏小。
  let total = 0
  for (const hunk of diff.hunks) total += hunk.rows.length
  for (const hunk of diff.hunks) {
    if (budget <= 0) break
    if (hunk.gapBefore !== null && hunk.gapBefore !== undefined) {
      parts.push({ type: 'gap', gap: hunk.gapBefore, key: 'gap' + hunk.index })
    }
    const rows = []
    for (const row of hunk.rows) {
      if (budget <= 0) break
      rows.push(row)
      budget--
      shown++
    }
    parts.push({ type: 'hunk', hunk, rows, key: 'hunk' + hunk.index })
  }
  return { parts, shown, total }
}

/** 拼出语言徽章的 class（调用方可以附加一个上下文 class）。 */
function badgeClassName(className) {
  return className === undefined || className === null || className === '' ? 'did-lang' : `did-lang ${className}`
}

/**
 * 小而安静的语言徽章。纯信息展示：
 *   - 未知语言用虚线边框标记，绝不用红/绿（红绿是删除/新增专属）；
 *   - 'hidden' 隐藏全部语言徽章（纯文本与未知语言标记也一并隐藏）；
 *   - 未知语言是否显示由 unknownLanguage 设置单独控制。
 */
function LanguageBadge({ languageId, settings, t, className }) {
  const base = badgeClassName(className)
  // "隐藏"会隐藏所有语言徽章，包括纯文本标记与虚线“未知语言”徽章；后两者只在
  // 徽章整体可见时才受 unknownLanguage 设置控制。
  if (settings.languageBadge === 'hidden') return null
  if (languageId === null || languageId === undefined) {
    // unknownLanguage 默认 'show'；只有显式选择隐藏时才不显示。
    if (settings.unknownLanguage === 'hidden') return null
    const label = t('langUnknown')
    const title = t('langTitle', { name: label })
    return (
      <span className={base} data-unknown="true" title={title} aria-label={title}>
        {label}
      </span>
    )
  }
  if (languageId === 'plaintext') {
    const label = t('langPlaintext')
    const title = t('langTitle', { name: label })
    return (
      <span className={base} data-plain="true" title={title} aria-label={title}>
        {label}
      </span>
    )
  }
  const info = languageInfo(languageId)
  if (info === null || info === undefined) return null
  const variant = settings.languageBadge === 'full' ? 'full' : 'short'
  const title = t('langTitle', { name: info.label })
  return (
    <span className={base} data-variant={variant} title={title} aria-label={title}>
      {variant === 'full' ? info.label : info.short}
    </span>
  )
}

/**
 * 校验 token 数组是否可直接渲染：必须非空、每项是 {text:string}，且拼接后
 * 逐字等于行文本。任一不满足返回 null——旧缓存/归一化不一致时宁可走纯文本
 * 路径，也绝不渲染与模型不一致的代码。
 */
function usableTokens(row, tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return null
  if (row === null || row === undefined || typeof row.text !== 'string') return null
  let rebuilt = ''
  for (const token of tokens) {
    if (token === null || typeof token !== 'object' || typeof token.text !== 'string') return null
    rebuilt += token.text
  }
  return rebuilt === row.text ? tokens : null
}

/** 一个带语法颜色的 token span。 */
function TokenSpan({ token }) {
  return <span className="did-tok" data-g={token.g}>{token.text}</span>
}

/**
 * 按行内改动片段（segments）的边界切分 token。
 *
 * 一个 token 可能横跨 segment 边界（例如 `foo_bar` 的 token 里只有 `bar` 被改），
 * 因此按字符长度把 token 切成“绝不跨出所属 segment”的小片：改动 segment 里的
 * 片段包 `.did-seg` 洗色，未改动片段保持普通 token。
 *
 * 返回 null 表示两侧长度对不上（模型异常）：调用方回退纯文本/segment 渲染。
 */
function splitTokensBySegments(tokens, segments) {
  let expected = 0
  for (const segment of segments) {
    if (segment === null || typeof segment !== 'object' || typeof segment.text !== 'string') return null
    expected += segment.text.length
  }
  let available = 0
  for (const token of tokens) available += token.text.length
  if (expected !== available) return null
  const groups = []
  let tokenIndex = 0
  let offset = 0
  for (const segment of segments) {
    const length = segment.text.length
    const pieces = []
    let used = 0
    while (used < length && tokenIndex < tokens.length) {
      const token = tokens[tokenIndex]
      const take = Math.min(token.text.length - offset, length - used)
      if (take > 0) pieces.push({ text: token.text.slice(offset, offset + take), g: token.g })
      offset += take
      used += take
      if (offset >= token.text.length) {
        tokenIndex++
        offset = 0
      }
    }
    groups.push({ changed: segment.changed === true, pieces })
  }
  return groups
}

/**
 * 渲染一行文本，按优先级选择渲染路径：
 *   1. 有合法 token 且无行内片段 → 纯 token；
 *   2. 有合法 token 且有行内片段 → 按片段切分 token（语法色 + 改动洗色叠加）；
 *   3. token 不可用但有片段 → 纯文本片段（改动段加 `.did-seg`）；
 *   4. 都没有 → fallback（纯文本，默认前景色）。
 * 任何一步校验失败都落到更简单的路径，绝不渲染错误文本。
 */
function RowText({ row, fallback, tokens }) {
  const segments = row === null || row === undefined ? null : row.segments
  const colorable = usableTokens(row, tokens)
  const hasSegments = Array.isArray(segments) && segments.length > 0
  if (colorable !== null && !hasSegments) {
    return colorable.map((token, index) => <TokenSpan token={token} key={index} />)
  }
  if (colorable !== null && hasSegments) {
    const groups = splitTokensBySegments(colorable, segments)
    if (groups !== null) {
      return groups.map((group, index) => (
        group.changed
          ? (
            <span className="did-seg" data-changed="true" key={index}>
              {group.pieces.map((piece, pieceIndex) => <TokenSpan token={piece} key={pieceIndex} />)}
            </span>
          )
          : (
            <Fragment key={index}>
              {group.pieces.map((piece, pieceIndex) => <TokenSpan token={piece} key={pieceIndex} />)}
            </Fragment>
          )
      ))
    }
  }
  if (!hasSegments) return fallback
  return segments.map((segment, index) => (
    segment.changed === true
      ? <span className="did-seg" data-changed="true" key={index}>{segment.text}</span>
      : <span key={index}>{segment.text}</span>
  ))
}

/** move 标注的本地化文案；多行移动带完整目标范围（移自/移至 Lx–Ly）。 */
function moveText(move, t) {
  const end = move.endLine
  if (typeof end === 'number' && end > move.line) {
    return move.kind === 'to'
      ? t('movedToRange', { from: move.line, to: end })
      : t('movedFromRange', { from: move.line, to: end })
  }
  return move.kind === 'to' ? t('movedTo', { line: move.line }) : t('movedFrom', { line: move.line })
}

/**
 * 单行代码的展示截断上限（字符数）。
 *
 * 安全背景（MEDIUM-5）：单行超长文本（典型是 minified 文件的一行几十万字符）
 * 会作为一个巨大文本节点交给浏览器排版；即使 diff 引擎已把 > 1,000,000 字符的
 * 单行整体降级，20,000~1,000,000 字符的行在低配设备上仍能造成明显卡顿。这里
 * 只做**纯展示截断**：diff 数据、行号、复制内容与增删统计都不受影响。
 */
const DISPLAY_LINE_CHARS = 20000

/**
 * 对一行代码做展示截断。
 *
 * 输入：任意行文本（可能 null / undefined / 非字符串，按空行处理）。
 * 输出：`{ text, truncated, total }`
 *   - text：≤ 上限时原样返回；超限时返回前 `DISPLAY_LINE_CHARS` 个字符 + '…'；
 *   - truncated：是否发生截断（true 时调用方跳过 token/segment 渲染，直接渲染 text）；
 *   - total：原始字符数（用于 title 提示“共 N 个字符”，不泄漏被截掉的内容）。
 */
function clampLineForDisplay(text) {
  if (typeof text !== 'string') return { text: '', truncated: false, total: 0 }
  if (text.length <= DISPLAY_LINE_CHARS) return { text, truncated: false, total: text.length }
  return { text: text.slice(0, DISPLAY_LINE_CHARS) + '…', truncated: true, total: text.length }
}

/** 一条统一格式的内联行：旧行号槽、新行号槽、符号、代码、move 标注。 */
function InlineRow({ row, t, highlighter, hunk }) {
  // 超长单行只渲染截断后的纯文本：token / segment 都基于完整行文本，截断后
  // 不能再拼接它们（否则会绕过展示上限），所以一个行内只有两种渲染路径。
  const clipped = clampLineForDisplay(row.text)
  const code = clipped.text === '' ? '\u00a0' : clipped.text
  const move = row.move
  const tokens = clipped.truncated || highlighter === null || highlighter === undefined
    ? null
    : tokensForRow(highlighter, hunk ?? null, row, row.kind === 'del' ? 'old' : 'new')
  return (
    <div className="did-row" data-kind={row.kind}>
      <span className="did-num" data-side="old">{row.oldNo ?? ''}</span>
      <span className="did-num" data-side="new">{row.newNo ?? ''}</span>
      <span className="did-sign">{row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' '}</span>
      <code
        className="did-code"
        title={clipped.truncated ? t('lineTruncated', { n: clipped.total }) : undefined}
      >
        {clipped.truncated ? code : <RowText row={row} fallback={code} tokens={tokens} />}
      </code>
      {move !== undefined && move !== null ? (
        <span className="did-move">
          {moveText(move, t)}
        </span>
      ) : null}
    </div>
  )
}

/** 一个文件内两处改动区之间的“横梁”：分隔带 + 未修改行数 + 行号位移。 */
function GapBand({ gap, t }) {
  if (gap === null || gap === undefined) return null
  const shift = gap.shift
  return (
    <div className="did-gap">
      <span aria-hidden="true">⋯</span>
      <span className="did-gap-range">{t('gapUnchanged', { n: gap.count })}</span>
      {shift !== 0 ? (
        <span className="did-gap-range">
          {t('gapRange', { old: `L${gap.oldStart}–L${gap.oldEnd}`, new: `L${gap.newStart}–L${gap.newEnd}` })}
        </span>
      ) : null}
      {shift !== 0 ? (
        <span className="did-shift">
          {shift > 0 ? t('shift', { delta: shift }) : t('shiftDown', { delta: Math.abs(shift) })}
        </span>
      ) : null}
    </div>
  )
}

/**
 * 只有“可信的用户手势”才能切换卡片折叠。
 *
 * 背景：部分主题插件会在动画结束回调里对最近的 `[aria-expanded]` 行重放一次
 * 合成 `.click()`（claude 风格主题如此）；若不加限制，重放的点击会落在卡片头
 * 上，导致用户刚点“放大”卡片就立刻折叠。程序化点击（`isTrusted === false`）
 * 一律忽略折叠切换（放大按钮自己的 onKeyDown 仍会 stopPropagation）。
 */
function isTrustedGesture(event) {
  const native = event === null || event === undefined ? null : (event.nativeEvent ?? event)
  return native === null || native.isTrusted !== false
}

/** 一个内联 hunk 块：自己的“横梁”头 + 行号图例 + 行列表 + 未展开提示。 */
function InlineHunk({ hunk, rows, t, pathLabel, highlighter }) {
  const hidden = hunk.rows.length - rows.length
  // 纯新建没有旧文件行号、纯删除没有新文件行号；行号图例不能给这一 hunk
  // 从未填充的列加标签。含上下文行的 hunk 两侧都有行号，因此两个标签都保留。
  const sides = gutterSides(hunk)
  const hasOldNumbers = sides.old
  const hasNewNumbers = sides.new
  const legendSides = hasOldNumbers && hasNewNumbers ? 'both' : hasOldNumbers ? 'old' : hasNewNumbers ? 'new' : 'none'
  return (
    <div className="did-hunk">
      <div className="did-bar">
        <span className="did-bar-file" title={pathLabel || undefined}>
          {pathLabel}
        </span>
        <span className="did-bar-range">{hunkRangeText(hunk, t)}</span>
        <span className="did-bar-stats">
          <span className="did-add">+{hunk.added}</span> <span className="did-del">−{hunk.removed}</span>
        </span>
      </div>
      {hunk.hasNumbers === false ? null : (
        // 两列行号的显式图例：让用户在每个 hunk 上都能分清哪个数字是旧文件行、
        // 哪个是新文件行，而不是只靠上方的 hunk 头猜。本 hunk 从未编号的一侧
        // 保留列宽但去掉标签。
        <div className="did-numhead" aria-hidden="true" data-sides={legendSides}>
          <span className="did-numhead-label" data-side="old">{hasOldNumbers ? t('gutterOld') : ''}</span>
          <span className="did-numhead-label" data-side="new">{hasNewNumbers ? t('gutterNew') : ''}</span>
        </div>
      )}
      <div className="did-rows">
        {rows.map((row, index) => (
          <InlineRow row={row} hunk={hunk} t={t} highlighter={highlighter} key={index} />
        ))}
      </div>
      {hidden > 0 ? <div className="did-note">{t('inlineMore', { n: hidden })}</div> : null}
    </div>
  )
}

/**
 * 把有序行流配成左右对照的单元格对（cap 为总行数上限）。
 *
 * ctx 行两侧共用同一行对象；连续的非 ctx 行按“第 k 行删除配第 k 行新增”配对，
 * 某一侧多出来的行在对侧显示空白格（kind='none'）。返回 truncated 表示因 cap
 * 截断，弹窗据此在底部显示“共 N 行；超出上限已截断”。
 *
 * @param {Array<object>} rows
 * @param {number} cap
 * @returns {{pairs: Array<{left:object|null, right:object|null}>, truncated:boolean}}
 */
function pairRows(rows, cap) {
  const pairs = []
  let i = 0
  let used = 0
  while (i < rows.length && used < cap) {
    const row = rows[i]
    if (row.kind === 'ctx') {
      pairs.push({ left: row, right: row })
      i++
      used++
      continue
    }
    const deleted = []
    const added = []
    // 变更块里删除行与新增行可能交错出现；按顺序分别收集两类，保证左右两栏
    // 永远“第 k 个删除配第 k 个新增”。
    while (i < rows.length && rows[i].kind !== 'ctx') {
      if (rows[i].kind === 'del') deleted.push(rows[i])
      else added.push(rows[i])
      i++
      used++
    }
    const count = Math.max(deleted.length, added.length)
    for (let k = 0; k < count; k++) pairs.push({ left: deleted[k] ?? null, right: added[k] ?? null })
  }
  return { pairs, truncated: i < rows.length }
}

/** 左右对照的单个单元格（空行显示 '\u00a0' 以保持行高）。 */
function SideCell({ row, side, t, highlighter, hunk }) {
  const kind = row === null ? 'none' : row.kind
  const lineNo = row === null ? null : side === 'left' ? row.oldNo : row.newNo
  // 与 InlineRow 同一套单行展示截断：左右对照里也限制单个文本节点大小。
  const clipped = clampLineForDisplay(row === null ? '' : row.text)
  const code = clipped.text === '' ? '\u00a0' : clipped.text
  const move = row === null ? null : row.move
  const tokens = row === null || clipped.truncated || highlighter === null || highlighter === undefined
    ? null
    : tokensForRow(highlighter, hunk ?? null, row, side === 'left' ? 'old' : 'new')
  return (
    <div className="did-cell" data-kind={kind}>
      <span className="did-num">{lineNo ?? ''}</span>
      <code
        className="did-code"
        title={clipped.truncated ? t('lineTruncated', { n: clipped.total }) : undefined}
      >
        {clipped.truncated ? code : <RowText row={row} fallback={code} tokens={tokens} />}
      </code>
      {move !== null && move !== undefined ? (
        <span className="did-move">
          {moveText(move, t)}
        </span>
      ) : null}
    </div>
  )
}

/** 一组对齐后的左右对照行。 */
function PairRow({ pair, t, highlighter, hunk }) {
  return (
    <div className="did-pair">
      <SideCell row={pair.left} side="left" t={t} highlighter={highlighter} hunk={hunk} />
      <SideCell row={pair.right} side="right" t={t} highlighter={highlighter} hunk={hunk} />
    </div>
  )
}

/** 两列上方的栏头（修改前 / 修改后）。 */
function PanesHead({ t }) {
  return (
    <div className="did-panes-head">
      <span className="did-pane-label">{t('before')}</span>
      <span className="did-pane-label">{t('after')}</span>
    </div>
  )
}

/**
 * 弹窗主体：按页签渲染“变更块”或“全文对照”。
 *
 * 全文模式用 FULL_VIEW_ROW_CAP 限制总行数（防止超大文件一次渲染过多行）；
 * 变更块模式逐 hunk 渲染（不分页，但 hunk 数量受真实修改数限制）。
 */
function SideBySide({ diff, mode, pathLabel, t, highlighter }) {
  if (mode === 'full') {
    const { pairs, truncated } = pairRows(diff.rows, FULL_VIEW_ROW_CAP)
    return (
      <div className="did-sbs" data-mode="full">
        {pairs.map((pair, index) => (
          <PairRow pair={pair} t={t} highlighter={highlighter} hunk={null} key={index} />
        ))}
        {truncated ? (
          <div className="did-full-note">{t('fullNote', { n: diff.rows.length })}</div>
        ) : null}
      </div>
    )
  }
  return (
    <div className="did-sbs" data-mode="hunks">
      {diff.hunks.map(hunk => {
        const { pairs } = pairRows(hunk.rows, Number.POSITIVE_INFINITY)
        return (
          <Fragment key={hunk.index}>
            {hunk.gapBefore !== null && hunk.gapBefore !== undefined ? <GapBand gap={hunk.gapBefore} t={t} /> : null}
            <div className="did-bar">
              <span className="did-bar-file" title={pathLabel || undefined}>
                {pathLabel}
              </span>
              <span className="did-bar-range">
                {t('hunk.i', { i: hunk.index, n: diff.hunks.length })} · {hunkRangeText(hunk, t)}
              </span>
              <span className="did-bar-stats">
                <span className="did-add">+{hunk.added}</span> <span className="did-del">−{hunk.removed}</span>
              </span>
            </div>
            {pairs.map((pair, index) => (
              <PairRow pair={pair} t={t} highlighter={highlighter} hunk={hunk} key={index} />
            ))}
          </Fragment>
        )
      })}
    </div>
  )
}

/**
 * 降级（大文件/历史回放）模型的本地化原因说明。
 *
 * @param {object|null} notice - 模型给出的提示（kind/old/new…）。
 * @param {Function} t - 插件语言翻译函数。
 * @param {boolean} [truncated] - diff 是否因“物化预算”被截断。截断模型没有
 *   rows/hunks，沿用 noticeHuge 的“已切换为差异块模式”会误导（其实没有任何差异
 *   块可看），因此截断时优先使用专门的 noticeTruncated 文案。
 * @returns {string} 要显示给用户的说明；无提示时返回空串。
 */
function noticeText(notice, t, truncated) {
  if (truncated === true) return t('noticeTruncated')
  if (notice === null || notice === undefined) return ''
  if (notice.kind === 'huge') return t('noticeHuge', { old: notice.old, new: notice.new })
  if (notice.kind === 'coarse') return t('noticeCoarse')
  if (notice.kind === 'tool') return t('noticeTool')
  if (notice.kind === 'toolLocate') return t('noticeToolLocate')
  if (notice.kind === 'history') return t('noticeHistory')
  if (notice.kind === 'locate') return t('noticeLocate')
  return t('noticeLinesPending')
}

/** 从卡片模型投影出弹窗载荷（只取展示所需字段，不把整个模型放进 store）。 */
function modalPayloadOf(model) {
  return {
    callId: model.callId,
    toolName: model.toolName,
    titleKey: model.titleKey,
    filePath: model.filePath,
    absolutePath: model.absolutePath,
    operation: model.operation,
    status: model.status,
    source: model.source,
    diff: model.diff,
    notice: model.notice,
  }
}

/**
 * 会话级内联差异行，注册给 edit / write / str_replace_editor。
 *
 * 数据获取：组件挂载后（已落定且非错误）取一次 Host 快照；快照缺失时再按元数据
 * 路径读一次当前文件（供历史回放定位行号）。`requested` ref 保证每张卡片只请求
 * 一次；effect 清理时用 alive 标记丢弃卸载后的异步结果，避免 setState 警告。
 *
 * 派生：模型（model.js）→ 语言识别（路径优先、content 兜底 shebang）→ 高亮句柄
 * → 折叠计划。所有派生都走 useMemo，避免重渲染重复计算。
 */
export function InlineDiffCard(props) {
  const { block, toolName, cwd, home, openFile, inspect, sessionId, t } = props
  const tone = useSettingsSnapshot()
  const call = useMemo(() => deriveCall(block), [block])
  const [snapshot, setSnapshot] = useState(undefined)
  const [fileText, setFileText] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    if (!call.settled || call.isError) return
    requested.current = true
    let alive = true
    const run = async () => {
      const captured = await cachedSnapshot(sessionId, call.callId)
      if (!alive) return
      setSnapshot(captured ?? null)
      if (captured === null) {
        const metaPath = call.meta !== null && typeof call.meta === 'object' && typeof call.meta.path === 'string' ? call.meta.path : ''
        if (metaPath !== '' && typeof cwd === 'string' && cwd !== '') {
          const read = await cachedFileText(cwd, metaPath)
          if (alive && read !== null && read.kind === 'text') setFileText(read.text)
        }
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [call.settled, call.isError, call.callId, call.meta, cwd, sessionId])

  const model = useMemo(() => buildCardModel({
    block,
    toolName,
    cwd,
    home,
    snapshot: snapshot ?? null,
    fileText,
    loading: snapshot === undefined && call.settled && !call.isError,
  }), [block, toolName, cwd, home, snapshot, fileText, call.settled, call.isError])

  const diff = model.diff
  // 语言识别以路径优先，内容兜底（shebang 与特殊文件名）；detectLanguage 对
  // 畸形路径也不抛错，因此卡片可以在任意状态下安全调用。
  const languageId = useMemo(
    () => detectLanguage(model.absolutePath ?? model.filePath, model.diff?.afterText ?? model.diff?.beforeText ?? ''),
    [model.absolutePath, model.filePath, model.diff],
  )
  // 高亮句柄为 null 表示“不高亮”：行按纯文本默认前景色渲染（与关闭语法高亮
  // 时完全一致），颜色仍随浅色/深色外观可读。
  const highlighter = useMemo(
    () => (tone.syntaxHighlight !== false && languageId !== null && diff !== null && diff !== undefined
      ? getDiffHighlighter(diff, languageId)
      : null),
    [diff, languageId, tone.syntaxHighlight],
  )
  const hasHunks = diff !== null && diff !== undefined && diff.hunks.length > 0
  const stateKey = stateKeyOf(model.status)
  const totalHunks = hasHunks ? diff.hunks.length : 0
  const plan = useMemo(() => (hasHunks ? buildInlinePlan(diff) : null), [diff, hasHunks])
  const hidden = plan === null ? 0 : plan.total - plan.shown
  // 卡片顶部的降级提示。物化预算截断（diff.truncated）时优先显示“已截断”文案：
  // 这种模型没有任何行对象/hunk，“已切换为差异块模式”会让用户以为下面有块可看。
  // 历史回放/无执行快照类提示属于放大弹窗的信息，卡片上不重复展示。
  const truncated = diff !== null && diff !== undefined && diff.truncated === true
  const cardNotice = (() => {
    if (truncated) return noticeText(null, t, true)
    const notice = model.notice
    if (notice === null || notice === undefined) return null
    if (notice.kind === 'history' || notice.kind === 'locate' || notice.kind === 'tool' || notice.kind === 'toolLocate') return null
    return noticeText(notice, t, false)
  })()

  const openModal = (event) => {
    event?.stopPropagation?.()
    if (!isTrustedGesture(event)) return
    if (!hasHunks) return
    openDiffModal(modalPayloadOf(model))
  }
  const toggle = () => setCollapsed(value => !value)
  const onHeadClick = (event) => {
    // 忽略其它插件重放/程序化的点击（见 isTrustedGesture）。
    if (isTrustedGesture(event)) toggle()
  }
  const onHeadKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }
  const emptyBody = () => {
    if (model.status === 'error') return <div className="did-error">{model.errorMessage || t('failedSummary')}</div>
    if (model.status === 'nochange') return <div className="did-empty">{t('noChanges')}</div>
    if (model.loading) return <div className="did-empty">{t('loading')}</div>
    if (model.status === 'preparing') return <div className="did-empty">{t('state.preparing')}…</div>
    if (model.status === 'running') return <div className="did-empty">{t('state.running')}…</div>
    return <div className="did-empty">{t('noDiff')}</div>
  }

  return (
    <Fragment>
      <div className="did-card" data-state={model.status} data-tool={model.toolName} data-call-id={model.callId} data-inline-diff="row" data-shell-tone={tone.fileShellTone} data-inner-tone={tone.fileInnerTone} data-language={languageId ?? 'unknown'} data-syn-emphasis={tone.syntaxEmphasis} style={{ '--did-pulse-phase': pulsePhase(model.callId) }}>
        <div
          className="did-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          // 兼容劫持折叠点击的主题：claude 风格主题会在 document 捕获阶段拦截
          // [aria-expanded] 行内的每次真实点击，播放折叠动画后把点击重放到行上，
          // 于是点“放大/轨迹/文件路径”反而会折叠卡片。它自己的排除条件是
          // [aria-haspopup]；这里显式写 aria-haspopup="false"（合法 ARIA：无弹层）
          // 让整个头部被排除，同时不改变辅助技术或 CSS 看到的内容。
          aria-haspopup="false"
          onClick={onHeadClick}
          onKeyDown={onHeadKeyDown}
        >
          <span className="did-chevron" data-open={!collapsed ? 'true' : 'false'} aria-hidden="true">
            <Icon kind="chevron" />
          </span>
          <span className="did-icon" aria-hidden="true">
            <Icon kind="edit" />
          </span>
          <span className="did-title">{t(model.titleKey)}</span>
          {model.operation !== null && model.operation !== undefined ? (
            <span className="did-op">{t(operationKey(model.operation))}</span>
          ) : null}
          {model.filePath !== '' ? (
            <button
              type="button"
              className="did-path"
              title={model.absolutePath ?? model.filePath}
              onClick={event => {
                event.stopPropagation()
                const target = model.absolutePath ?? model.filePath
                if (target !== '' && typeof openFile === 'function') openFile(target)
              }}
              onKeyDown={event => event.stopPropagation()}
            >
              {model.filePath}
            </button>
          ) : null}
          <LanguageBadge languageId={languageId} settings={tone} t={t} />
          {hasHunks ? (
            <span className="did-stats" aria-label={t('hunks', { n: totalHunks })}>
              <span className="did-add">+{diff.added}</span>
              <span className="did-del">−{diff.removed}</span>
            </span>
          ) : null}
          <span className="did-meta">
            {hasHunks
              ? t('hunks', { n: totalHunks })
              : model.status === 'nochange'
                ? t('noChanges')
                : model.status === 'error'
                  ? t('failedSummary')
                  : ''}
          </span>
          <span className="did-actions" onClick={event => event.stopPropagation()}>
            {stateKey !== null ? (
              <span className="did-state" data-state={model.status}>
                <span className="did-dot" aria-hidden="true" />
                {t(stateKey)}
              </span>
            ) : null}
            <InspectButton inspect={inspect} t={t} />
            <button
              type="button"
              className="did-zoom"
              // 这里绝不能用原生 disabled：禁用按钮收不到点击，点击会冒泡到整个
              // 头部（切换折叠）——这正是“点放大反而先折叠卡片”的 bug。保持可聚焦/
              // 可悬停，由 handler 在 diff 未就绪时忽略点击。
              aria-disabled={hasHunks ? undefined : 'true'}
              data-disabled={hasHunks ? undefined : 'true'}
              onClick={openModal}
              onKeyDown={event => event.stopPropagation()}
              title={t('zoom')}
              aria-label={t('zoom')}
            >
              <Icon kind="expand" size={11} />
              {t('zoom')}
            </button>
          </span>
        </div>
        {cardNotice !== null ? (
          <div className="did-notice">{cardNotice}</div>
        ) : null}
        {!collapsed ? (
          hasHunks ? (
            <Fragment>
              <div className="did-body">
                {plan.parts.map(part => {
                  if (part.type === 'gap') return <GapBand gap={part.gap} t={t} key={part.key} />
                  return (
                    <InlineHunk
                      hunk={part.hunk}
                      rows={part.rows}
                      t={t}
                      pathLabel={model.filePath}
                      highlighter={highlighter}
                      key={part.key}
                    />
                  )
                })}
              </div>
              <div className="did-foot">
                <span>{sourceLabel(model.source, t)}</span>
                <span className="did-grow" />
                {hidden > 0 ? <span>{t('inlineMore', { n: hidden })}</span> : null}
                <button type="button" className="did-link" onClick={openModal}>
                  {t('openViewer')}
                </button>
              </div>
            </Fragment>
          ) : (
            emptyBody()
          )
        ) : null}
      </div>
    </Fragment>
  )
}

/**
 * 根级浮层：订阅模块 store 并渲染左右对照弹窗。
 *
 * 行为约定：
 *   - 用 body 级 portal 渲染，保证真正的模态层级；
 *   - 打开时把焦点移到对话框（可键盘操作），Esc 与点击遮罩都关闭；
 *   - 切换卡片（callId 变化）时自动回到“变更块”页签；
 *   - 不偷偷恢复任何焦点/滚动状态（Esc 关闭即可，符合最小惊讶）；
 *   - 全文对照不可用时页签置灰，并在 title 里给出具体原因（历史回放/无快照/
 *     文件过大），而不是静默禁用。
 */
export function DiffModal({ t }) {
  const payload = useSyncExternalStore(subscribeDiffModal, getDiffModal, getDiffModal)
  const settings = useSettingsSnapshot()
  const [tab, setTab] = useState('hunks')
  const [portalHost, setPortalHost] = useState(null)
  const dialogRef = useRef(null)
  const callId = payload === null ? null : payload.callId
  // 弹窗与卡片使用同一套语言识别/高亮契约（同一个 detectLanguage 与
  // getDiffHighlighter，因此两处配色、语言徽章必然一致）。
  const languageId = useMemo(
    () => (payload === null
      ? null
      : detectLanguage(payload.absolutePath ?? payload.filePath, payload.diff?.afterText ?? payload.diff?.beforeText ?? '')),
    [payload],
  )
  const highlighter = useMemo(
    () => (settings.syntaxHighlight !== false && languageId !== null && payload?.diff !== null && payload?.diff !== undefined
      ? getDiffHighlighter(payload.diff, languageId)
      : null),
    [payload, languageId, settings.syntaxHighlight],
  )

  useEffect(() => {
    // 用 body 级 portal 才能让弹窗在 Web UI 里真正“模态”：shell.overlay 位于
    // 框架自己的层叠上下文（z-index 20）内，低于桌面宠物等插件浮动层；渲染在
    // 那里虽然可见，却无法可靠接收指针事件。
    setPortalHost(document.body)
  }, [])

  useEffect(() => {
    setTab('hunks')
  }, [callId])

  useEffect(() => {
    if (payload === null) return
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      closeDiffModal()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [payload])

  useEffect(() => {
    if (payload === null) return
    dialogRef.current?.focus?.()
  }, [payload])

  if (payload === null) return null
  const diff = payload.diff
  const hasHunks = diff !== null && diff !== undefined && diff.hunks.length > 0
  if (!hasHunks) return null
  const canFull = diff.hasNumbers === true && Array.isArray(diff.rows) && diff.rows.length > 0
  const activeTab = tab === 'full' && canFull ? 'full' : 'hunks'
  const oldLines = diff.oldLineCount
  const newLines = diff.newLineCount
  const close = () => closeDiffModal()

  const overlay = (
    <Fragment>
      <div className="did-overlay-root" data-open="true">
        <div className="did-overlay" onClick={close}>
          <div
            className="did-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('modal.title')}
            tabIndex={-1}
            ref={dialogRef}
            data-language={languageId ?? 'unknown'}
            data-syn-emphasis={settings.syntaxEmphasis}
            onClick={event => event.stopPropagation()}
          >
            <div className="did-dialog-head">
              <span className="did-icon" aria-hidden="true">
                <Icon kind="edit" />
              </span>
              <div className="did-dialog-title">
                <span className="did-dialog-path" title={payload.absolutePath ?? payload.filePath}>
                  {payload.filePath !== '' ? payload.filePath : t(payload.titleKey)}
                </span>
                <span className="did-dialog-sub">
                  <LanguageBadge languageId={languageId} settings={settings} t={t} />
                  {t(payload.titleKey)}
                  {payload.operation !== null && payload.operation !== undefined ? ` · ${t(operationKey(payload.operation))}` : ''}
                  {` · +${diff.added} −${diff.removed}`}
                  {oldLines !== null && newLines !== null ? ` · ${t('oldFile', { n: oldLines })} / ${t('newFile', { n: newLines })}` : ''}
                </span>
              </div>
              <div className="did-tabs" role="tablist" aria-label={t('modal.title')}>
                <button
                  type="button"
                  className="did-tab"
                  role="tab"
                  aria-selected={activeTab === 'hunks'}
                  data-active={activeTab === 'hunks' ? 'true' : 'false'}
                  onClick={() => setTab('hunks')}
                >
                  {t('tab.hunks')}
                </button>
                <button
                  type="button"
                  className="did-tab"
                  role="tab"
                  aria-selected={activeTab === 'full'}
                  data-active={activeTab === 'full' ? 'true' : 'false'}
                  disabled={!canFull}
                  title={canFull ? undefined : (
                    payload.notice?.kind === 'tool' || payload.notice?.kind === 'toolLocate'
                      ? t('fullToolUnavailable')
                      : payload.notice?.kind === 'history' || payload.notice?.kind === 'lines'
                        ? t('fullHistoryUnavailable')
                        : payload.notice?.kind === 'locate'
                          ? t('fullLocateUnavailable')
                          : t('fullTooLarge')
                  )}
                  onClick={() => setTab('full')}
                >
                  {t('tab.full')}
                </button>
              </div>
              <button type="button" className="did-close" onClick={close} aria-label={t('close')} title={t('close')}>
                <Icon kind="close" size={13} />
              </button>
            </div>
            {/* The replay/large-file notice is a permanent banner: it belongs to
                the fixed header region (title → notice → before/after strip),
                not to the scrollable body, so the body scrollbar starts below
                it and scrolling never hides it. */}
            {payload.notice !== null && payload.notice !== undefined ? (
              <div className="did-notice did-dialog-notice">{noticeText(payload.notice, t, diff.truncated === true)}</div>
            ) : null}
            {/* The before/after strip belongs to the dialog header, not to the
                scrollable body: keeping it here means the body's scrollbar
                starts below it instead of running up beside it. */}
            <PanesHead t={t} />
            <div className="did-dialog-body">
              <SideBySide diff={diff} mode={activeTab} pathLabel={payload.filePath} t={t} highlighter={highlighter} />
            </div>
            <div className="did-dialog-foot">
              <span>{sourceLabel(payload.source, t)}</span>
              <span className="did-grow" />
              <span>{`${t('oldFile', { n: oldLines ?? '?' })} · ${t('newFile', { n: newLines ?? '?' })}`}</span>
              <span>Esc · {t('close')}</span>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
  return portalHost === null ? overlay : createPortal(overlay, portalHost)
}
