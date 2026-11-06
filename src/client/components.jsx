/**
 * Inline diff card (session-scoped, replaces the stock edit/write tool rows)
 * and the full-screen side-by-side comparison modal (root-scoped overlay).
 */
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cachedFileText, cachedSnapshot } from './api.js'
import { FULL_VIEW_ROW_CAP, INLINE_ROW_CAP, gutterSides } from './diff.js'
import { InspectButton } from './enhanced-tools.jsx'
import { getDiffHighlighter, tokensForRow } from './highlight.js'
import { detectLanguage, languageInfo } from './languages.js'
import { buildCardModel, deriveCall, operationKey } from './model.js'
import { closeDiffModal, getDiffModal, openDiffModal, subscribeDiffModal } from './store.js'
import { getSettings, subscribeSettings } from './settings.js'

/** Per-card-type shell/inner tone settings (file / command / tool). */
function useCardSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/** Inline SVG icon set (no external primitive imports). */
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

/** Prettify one 1-based line range. */
function range(start, end) {
  if (start === null || start === undefined) return ''
  return start === end ? `L${start}` : `L${start}–L${end}`
}

/** Localized description of one hunk's old/new span. */
function hunkRangeText(hunk, t) {
  if (hunk.hasNumbers !== true) return t('unknownRange')
  if (hunk.oldCount === 0) return t('hunkHeaderNew', { new: range(hunk.newStart, hunk.newEnd) })
  if (hunk.newCount === 0) return t('hunkHeaderDel', { old: range(hunk.oldStart, hunk.oldEnd) })
  return t('hunkHeader', {
    old: range(hunk.oldStart, hunk.oldEnd),
    new: range(hunk.newStart, hunk.newEnd),
  })
}

/** Turn one running-head line into a key, tolerant of locale switches. */
function stateKeyOf(status) {
  if (status === 'preparing') return 'state.preparing'
  if (status === 'running') return 'state.running'
  if (status === 'error') return 'state.error'
  if (status === 'stopped') return 'state.stopped'
  return null
}

/** Localized source caption for the card footer / modal footer. */
function sourceLabel(source, t) {
  if (source === 'snapshot') return t('snapshotSource')
  if (source === 'located') return t('locatedSource')
  if (source === 'preview') return t('preview')
  if (source === 'args') return t('argsSource')
  return t('lineUnknown')
}

/** Hunk plan for the collapsed inline body: bounded rows, headers always kept. */
function buildInlinePlan(diff) {
  const parts = []
  let budget = INLINE_ROW_CAP
  let shown = 0
  // Count every hunk's rows up front: once the row budget is exhausted the loop
  // stops adding hunks, so accumulating the total inside it would undercount the
  // rows the card did not render and the "N more rows" footer would read too low.
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

/** Compose the badge class name (callers may add a contextual class). */
function badgeClassName(className) {
  return className === undefined || className === null || className === '' ? 'did-lang' : `did-lang ${className}`
}

/**
 * Small, quiet capsule naming the detected language. Purely informational:
 * unknown languages are marked with a dashed border, never with red or green,
 * which stay reserved for removed/added lines.
 */
function LanguageBadge({ languageId, settings, t, className }) {
  const base = badgeClassName(className)
  // "Hidden" hides every language badge, including the plain-text marker and
  // the dashed unknown-language badge; those two only honor "unknown language"
  // while badges are shown at all.
  if (settings.languageBadge === 'hidden') return null
  if (languageId === null || languageId === undefined) {
    // `unknownLanguage` defaults to 'show'; only the explicit opt-out hides it.
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
 * Tokens are only usable when they rebuild the row text exactly; anything else
 * (a stale/absent cache, a mismatched normalization) is ignored so the plain
 * text path is always the safe fallback.
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

/** One syntax-colored token span. */
function TokenSpan({ token }) {
  return <span className="did-tok" data-g={token.g}>{token.text}</span>
}

/**
 * Slice tokens along the row's segment boundaries. A token may straddle a
 * boundary, so it is split into pieces that never leave their segment: changed
 * segments keep their own `.did-seg` wash, unchanged ones stay plain tokens.
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

/** Render a line's text, splitting unchanged pieces from the changed spans. */
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

/** Localized move chip text; multi-line moves include the full target range. */
function moveText(move, t) {
  const end = move.endLine
  if (typeof end === 'number' && end > move.line) {
    return move.kind === 'to'
      ? t('movedToRange', { from: move.line, to: end })
      : t('movedFromRange', { from: move.line, to: end })
  }
  return move.kind === 'to' ? t('movedTo', { line: move.line }) : t('movedFrom', { line: move.line })
}

/** One unified inline row: old gutter, new gutter, sign, code, move chip. */
function InlineRow({ row, t, highlighter, hunk }) {
  const code = row.text === '' ? '\u00a0' : row.text
  const move = row.move
  const tokens = highlighter === null || highlighter === undefined
    ? null
    : tokensForRow(highlighter, hunk ?? null, row, row.kind === 'del' ? 'old' : 'new')
  return (
    <div className="did-row" data-kind={row.kind}>
      <span className="did-num" data-side="old">{row.oldNo ?? ''}</span>
      <span className="did-num" data-side="new">{row.newNo ?? ''}</span>
      <span className="did-sign">{row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' '}</span>
      <code className="did-code"><RowText row={row} fallback={code} tokens={tokens} /></code>
      {move !== undefined && move !== null ? (
        <span className="did-move">
          {moveText(move, t)}
        </span>
      ) : null}
    </div>
  )
}

/** The "horizontal beam" between two change regions inside one file. */
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
 * Only trusted user gestures may toggle the card. Some theme plugins replay a
 * synthetic `.click()` on the nearest `[aria-expanded]` row from an animation
 * finish callback (the claude-style theme does this); without this guard such a
 * replayed click lands on our card header and collapses the card right after a
 * real click on "放大", which reads as the expand button fighting the collapse
 * toggle. Programmatic clicks (`isTrusted === false`) are ignored for toggling.
 */
function isTrustedGesture(event) {
  const native = event === null || event === undefined ? null : (event.nativeEvent ?? event)
  return native === null || native.isTrusted !== false
}

/** One inline hunk block with its own "beam" header. */
function InlineHunk({ hunk, rows, t, pathLabel, highlighter }) {
  const hidden = hunk.rows.length - rows.length
  // Pure creations have no old-file numbers and pure deletions no new-file
  // numbers; the gutter legend must not claim a column that the rows never
  // fill. Hunks with context rows still have both numbers, so both labels stay.
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
        // Column legend for the two line-number gutters: makes it obvious which
        // number is the old-file line and which is the new-file line, on every
        // hunk rather than only in the hunk header above. A side that this hunk
        // never numbers keeps its column but drops the label.
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

/** Pair the ordered row stream into left/right cells for side-by-side view. */
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
    // A changed block may interleave added and removed rows; collect both
    // kinds in order so the two panes always pair the k-th removal with the
    // k-th addition.
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

/** One side of a side-by-side pair. */
function SideCell({ row, side, t, highlighter, hunk }) {
  const kind = row === null ? 'none' : row.kind
  const lineNo = row === null ? null : side === 'left' ? row.oldNo : row.newNo
  const code = row === null ? '' : row.text === '' ? '\u00a0' : row.text
  const move = row === null ? null : row.move
  const tokens = row === null || highlighter === null || highlighter === undefined
    ? null
    : tokensForRow(highlighter, hunk ?? null, row, side === 'left' ? 'old' : 'new')
  return (
    <div className="did-cell" data-kind={kind}>
      <span className="did-num">{lineNo ?? ''}</span>
      <code className="did-code"><RowText row={row} fallback={code || '\u00a0'} tokens={tokens} /></code>
      {move !== null && move !== undefined ? (
        <span className="did-move">
          {moveText(move, t)}
        </span>
      ) : null}
    </div>
  )
}

/** One aligned side-by-side row. */
function PairRow({ pair, t, highlighter, hunk }) {
  return (
    <div className="did-pair">
      <SideCell row={pair.left} side="left" t={t} highlighter={highlighter} hunk={hunk} />
      <SideCell row={pair.right} side="right" t={t} highlighter={highlighter} hunk={hunk} />
    </div>
  )
}

/** Header strip above the two columns. */
function PanesHead({ t }) {
  return (
    <div className="did-panes-head">
      <span className="did-pane-label">{t('before')}</span>
      <span className="did-pane-label">{t('after')}</span>
    </div>
  )
}

/** Full-screen comparison body: changed hunks or the whole file. */
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

/** Localized fallback notice for a degraded (large-file) model. */
function noticeText(notice, t) {
  if (notice.kind === 'huge') return t('noticeHuge', { old: notice.old, new: notice.new })
  if (notice.kind === 'coarse') return t('noticeCoarse')
  if (notice.kind === 'tool') return t('noticeTool')
  if (notice.kind === 'toolLocate') return t('noticeToolLocate')
  if (notice.kind === 'history') return t('noticeHistory')
  if (notice.kind === 'locate') return t('noticeLocate')
  return t('noticeLinesPending')
}

/** Build the modal payload from a card model. */
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

/** Session-scoped inline diff row, registered for edit/write. */
export function InlineDiffCard(props) {
  const { block, toolName, cwd, home, openFile, inspect, sessionId, t } = props
  const tone = useCardSettings()
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
  // Language detection is path-first and can fall back to the content (shebang
  // and special filenames); `detectLanguage` never throws on odd paths.
  const languageId = useMemo(
    () => detectLanguage(model.absolutePath ?? model.filePath, model.diff?.afterText ?? model.diff?.beforeText ?? ''),
    [model.absolutePath, model.filePath, model.diff],
  )
  // A null highlighter means "no highlighting": rows then render exactly as
  // before (plain text in the default foreground color).
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

  const openModal = (event) => {
    event?.stopPropagation?.()
    if (!isTrustedGesture(event)) return
    if (!hasHunks) return
    openDiffModal(modalPayloadOf(model))
  }
  const toggle = () => setCollapsed(value => !value)
  const onHeadClick = (event) => {
    // Ignore replayed/programmatic clicks from other plugins (see isTrustedGesture).
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
      <div className="did-card" data-state={model.status} data-tool={model.toolName} data-call-id={model.callId} data-inline-diff="row" data-shell-tone={tone.fileShellTone} data-inner-tone={tone.fileInnerTone} data-language={languageId ?? 'unknown'} data-syn-emphasis={tone.syntaxEmphasis}>
        <div
          className="did-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          // Compatibility with themes that hijack fold clicks: claude-style's
          // document-level capture listener intercepts every real click inside
          // an [aria-expanded] row, animates the fold and then replays the click
          // on the row — which turns clicks on 放大 / 轨迹 / the file-path button
          // into "collapse the card". Its own exclusion is [aria-haspopup]; an
          // explicit aria-haspopup="false" (valid ARIA: no popup) opts the whole
          // header out without changing what assistive tech or CSS sees.
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
              // Never use the native `disabled` attribute here: a disabled
              // button does not receive the click, so it bubbles to the whole
              // header (which toggles collapse) — the "expand seems to collapse
              // the card first" bug. Keep it focusable/hoverable and let the
              // handler ignore the click while the diff is not ready.
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
        {model.notice !== null && model.notice !== undefined && model.notice.kind !== 'history' && model.notice.kind !== 'locate' && model.notice.kind !== 'tool' && model.notice.kind !== 'toolLocate' ? (
          <div className="did-notice">{noticeText(model.notice, t)}</div>
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
 * Root-scoped overlay: reads the module store and renders the comparison
 * dialog. Nothing restores focus or state behind the user's back; Escape and
 * the backdrop both close it.
 */
export function DiffModal({ t }) {
  const payload = useSyncExternalStore(subscribeDiffModal, getDiffModal, getDiffModal)
  const settings = useCardSettings()
  const [tab, setTab] = useState('hunks')
  const [portalHost, setPortalHost] = useState(null)
  const dialogRef = useRef(null)
  const callId = payload === null ? null : payload.callId
  // The dialog follows the same detection/highlighting contract as the cards.
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
    // A body-level portal is what makes the dialog genuinely modal in the Web
    // UI: shell.overlay sits inside the frame's stacking context (z-index 20),
    // below plugin-owned floating layers such as desktop pets, so a dialog
    // rendered there stays visible but cannot receive pointer events reliably.
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
              <div className="did-notice did-dialog-notice">{noticeText(payload.notice, t)}</div>
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
