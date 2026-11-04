/**
 * Inline diff card (session-scoped, replaces the stock edit/write tool rows)
 * and the full-screen side-by-side comparison modal (root-scoped overlay).
 */
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cachedFileText, cachedSnapshot } from './api.js'
import { FULL_VIEW_ROW_CAP, INLINE_ROW_CAP } from './diff.js'
import { buildCardModel, deriveCall, operationKey } from './model.js'
import { closeDiffModal, getDiffModal, openDiffModal, subscribeDiffModal } from './store.js'

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
  let total = 0
  let shown = 0
  for (const hunk of diff.hunks) {
    total += hunk.rows.length
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

/** Render a line's text, splitting unchanged pieces from the changed spans. */
function RowText({ row, fallback }) {
  const segments = row === null || row === undefined ? null : row.segments
  if (!Array.isArray(segments) || segments.length === 0) return fallback
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
function InlineRow({ row, t }) {
  const code = row.text === '' ? '\u00a0' : row.text
  const move = row.move
  return (
    <div className="did-row" data-kind={row.kind}>
      <span className="did-num">{row.oldNo ?? ''}</span>
      <span className="did-num">{row.newNo ?? ''}</span>
      <span className="did-sign">{row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' '}</span>
      <code className="did-code"><RowText row={row} fallback={code} /></code>
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

/** One inline hunk block with its own "beam" header. */
function InlineHunk({ hunk, rows, t, pathLabel }) {
  const hidden = hunk.rows.length - rows.length
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
      <div className="did-rows">
        {rows.map((row, index) => (
          <InlineRow row={row} t={t} key={index} />
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
function SideCell({ row, side, t }) {
  const kind = row === null ? 'none' : row.kind
  const lineNo = row === null ? null : side === 'left' ? row.oldNo : row.newNo
  const code = row === null ? '' : row.text === '' ? '\u00a0' : row.text
  const move = row === null ? null : row.move
  return (
    <div className="did-cell" data-kind={kind}>
      <span className="did-num">{lineNo ?? ''}</span>
      <code className="did-code"><RowText row={row} fallback={code || '\u00a0'} /></code>
      {move !== null && move !== undefined ? (
        <span className="did-move">
          {moveText(move, t)}
        </span>
      ) : null}
    </div>
  )
}

/** One aligned side-by-side row. */
function PairRow({ pair, t }) {
  return (
    <div className="did-pair">
      <SideCell row={pair.left} side="left" t={t} />
      <SideCell row={pair.right} side="right" t={t} />
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
function SideBySide({ diff, mode, pathLabel, t }) {
  if (mode === 'full') {
    const { pairs, truncated } = pairRows(diff.rows, FULL_VIEW_ROW_CAP)
    return (
      <div className="did-sbs" data-mode="full">
        <PanesHead t={t} />
        {pairs.map((pair, index) => (
          <PairRow pair={pair} t={t} key={index} />
        ))}
        {truncated ? (
          <div className="did-full-note">{t('fullNote', { n: diff.rows.length })}</div>
        ) : null}
      </div>
    )
  }
  return (
    <div className="did-sbs" data-mode="hunks">
      <PanesHead t={t} />
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
              <PairRow pair={pair} t={t} key={index} />
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
  if (notice.kind === 'history') return t('noticeHistory')
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
  const hasHunks = diff !== null && diff !== undefined && diff.hunks.length > 0
  const stateKey = stateKeyOf(model.status)
  const totalHunks = hasHunks ? diff.hunks.length : 0
  const plan = useMemo(() => (hasHunks ? buildInlinePlan(diff) : null), [diff, hasHunks])
  const hidden = plan === null ? 0 : plan.total - plan.shown

  const openModal = (event) => {
    event?.stopPropagation?.()
    if (!hasHunks) return
    openDiffModal(modalPayloadOf(model))
  }
  const toggle = () => setCollapsed(value => !value)
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
      <div className="did-card" data-state={model.status} data-tool={model.toolName} data-call-id={model.callId} data-inline-diff="row">
        <div
          className="did-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          onClick={toggle}
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
          <span className="did-spacer" />
          {stateKey !== null ? (
            <span className="did-state" data-state={model.status}>
              <span className="did-dot" aria-hidden="true" />
              {t(stateKey)}
            </span>
          ) : null}
          <button
            type="button"
            className="did-zoom"
            disabled={!hasHunks}
            onClick={openModal}
            title={t('zoom')}
            aria-label={t('zoom')}
          >
            <Icon kind="expand" size={11} />
            {t('zoom')}
          </button>
        </div>
        {model.notice !== null && model.notice !== undefined && model.notice.kind !== 'history' ? (
          <div className="did-notice">{noticeText(model.notice, t)}</div>
        ) : null}
        {!collapsed ? (
          hasHunks ? (
            <Fragment>
              <div className="did-body">
                {plan.parts.map(part => {
                  if (part.type === 'gap') return <GapBand gap={part.gap} t={t} key={part.key} />
                  return <InlineHunk hunk={part.hunk} rows={part.rows} t={t} pathLabel={model.filePath} key={part.key} />
                })}
              </div>
              <div className="did-foot">
                <span>{sourceLabel(model.source, t)}</span>
                <span className="did-grow" />
                {hidden > 0 ? <span>{t('inlineMore', { n: hidden })}</span> : null}
                <button type="button" className="did-link" onClick={openModal}>
                  {t('openViewer')}
                </button>
                {typeof inspect === 'function' ? (
                  <button type="button" className="did-link" onClick={event => { event.stopPropagation(); inspect() }}>
                    {t('inspect')}
                  </button>
                ) : null}
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
  const [tab, setTab] = useState('hunks')
  const [portalHost, setPortalHost] = useState(null)
  const dialogRef = useRef(null)
  const callId = payload === null ? null : payload.callId

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
                  title={canFull ? undefined : (payload.notice?.kind === 'history' || payload.notice?.kind === 'lines' ? t('fullHistoryUnavailable') : t('fullTooLarge'))}
                  onClick={() => setTab('full')}
                >
                  {t('tab.full')}
                </button>
              </div>
              <button type="button" className="did-close" onClick={close} aria-label={t('close')} title={t('close')}>
                <Icon kind="close" size={13} />
              </button>
            </div>
            <div className="did-dialog-body">
              {payload.notice !== null && payload.notice !== undefined ? (
                <div className="did-notice did-dialog-notice">{noticeText(payload.notice, t)}</div>
              ) : null}
              <SideBySide diff={diff} mode={activeTab} pathLabel={payload.filePath} t={t} />
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
