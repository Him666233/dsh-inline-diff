/**
 * Optional enhanced flat tool-call rows.
 *
 * These keyed `tool.call.toolview` views take over the search/web/generic tool
 * calls registered by index.jsx when the user enables the expanded style: each
 * call renders a flat IN/OUT card that shows what was sent and what came back
 * without unfolding. Commands have their own `enhanced-shell.jsx` row; tools
 * without a registered key keep the shipped DSH presentation.
 */
import { useMemo, useState, useSyncExternalStore } from 'react'
import { deriveCall } from './model.js'
import { getSettings, subscribeSettings } from './settings.js'
import { sectionStates } from './tool-status.js'

/** Humanize one wire tool name for the flat row title. */
function toolLabel(name, t) {
  if (typeof name !== 'string' || name === '') return 'Tool'
  if (typeof t === 'function') {
    const key = `toolTitle.${name}`
    const translated = t(key)
    if (typeof translated === 'string' && translated !== key) return translated
  }
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\b[a-z]/g, letter => letter.toUpperCase())
}

/** Localized title when one exists, otherwise the exact wire tool name. */
function wireName(name, t) {
  if (typeof name !== 'string' || name === '') return 'Tool'
  if (typeof t === 'function') {
    const key = `toolTitle.${name}`
    const translated = t(key)
    if (typeof translated === 'string' && translated !== key) return translated
  }
  return name
}

/** Clamp one summary line. */
function clampSummary(text) {
  const first = typeof text === 'string' ? text.split('\n')[0].trim() : ''
  return first.length > 120 ? first.slice(0, 120) + '…' : first
}

/** Join a few search terms into one readable summary line. */
function searchSummary(call) {
  const args = call.args
  if (args === null || typeof args !== 'object') return ''
  if (call.name === 'grep' || call.name === 'glob') {
    const pattern = typeof args.pattern === 'string' ? args.pattern : ''
    const path = typeof args.path === 'string' ? args.path : ''
    const include = call.name === 'grep' && typeof args.include === 'string' ? args.include : ''
    return clampSummary([pattern, path, include].filter(part => part.trim() !== '').join('  ·  '))
  }
  if (call.name === 'web_search') {
    const queries = Array.isArray(args.queries)
      ? args.queries.filter(query => typeof query === 'string' && query.trim() !== '')
      : []
    return clampSummary(queries.join('  ·  '))
  }
  if (call.name === 'web_fetch') {
    return clampSummary(typeof args.url === 'string' ? args.url : '')
  }
  return ''
}

/** Build a one-line summary from the most descriptive argument. */
function summaryOf(args, call) {
  if (args === null || typeof args !== 'object') return ''
  const specific = call === undefined ? '' : searchSummary(call)
  if (specific !== '') return specific
  const keys = ['description', 'command', 'file_path', 'path', 'url', 'query', 'queries', 'prompt', 'objective', 'skill', 'title', 'name', 'tool']
  for (const key of keys) {
    const value = args[key]
    if (Array.isArray(value)) {
      const joined = value.filter(item => typeof item === 'string' && item.trim() !== '').join('  ·  ')
      if (joined !== '') return clampSummary(joined)
      continue
    }
    if (typeof value !== 'string' || value.trim() === '') continue
    return clampSummary(value)
  }
  return ''
}

/** A compact settled-count badge derived from persisted tool metadata. */
function badgeOf(call, t) {
  if (!call.settled) return ''
  const meta = call.meta
  if (meta === null || typeof meta !== 'object') return ''
  if (call.name === 'grep' && typeof meta.total === 'number' && Number.isFinite(meta.total)) {
    return t('search.matches', { n: meta.total }) + (meta.truncated === true ? '+' : '')
  }
  if (call.name === 'glob' && Array.isArray(meta.paths)) {
    return t('search.files', { n: meta.paths.length })
  }
  if (call.name === 'web_search' && Array.isArray(meta.sources)) {
    return t('web.sources', { n: meta.sources.length })
  }
  if (call.name === 'web_fetch' && typeof meta.statusCode === 'number' && Number.isFinite(meta.statusCode)) {
    return t('web.status', { code: meta.statusCode })
  }
  return ''
}

/** Pretty input for the IN section. */
function inputText(call) {
  if (call.args !== null && call.args !== undefined) {
    try {
      return JSON.stringify(call.args, null, 2)
    } catch {
      return call.argsRaw ?? ''
    }
  }
  return call.argsRaw ?? ''
}

/** Plain output text for the OUT section. */
function outputText(call) {
  const parts = []
  for (const part of call.content) {
    if (part === null || typeof part !== 'object') continue
    if (part.type === 'text' && typeof part.text === 'string') parts.push(part.text)
    else if (part.type === 'image') parts.push('[image]')
    else parts.push(JSON.stringify(part, null, 2))
  }
  if (parts.length === 0 && call.error !== null && call.error !== undefined) {
    const info = call.error
    const reason = typeof info.reason === 'string' ? info.reason : typeof info.code === 'string' ? info.code : typeof info.name === 'string' ? info.name : ''
    if (reason !== '') parts.push(reason)
  }
  return parts.join('\n')
}

/** Category drives the small glyph and the row accent. */
function kindOf(toolName) {
  if (SHELL_KEYS.has(toolName)) return 'command'
  if (toolName === 'grep' || toolName === 'glob') return 'search'
  if (toolName === 'web_search' || toolName === 'web_fetch') return 'web'
  return 'tool'
}

/** State + copy for one expanded generic tool call. */
function genericModel(block, toolName, t) {
  const call = deriveCall(block)
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError ? 'error' : 'ok'
  // IN/OUT carry their own status: a rejected call is an input failure even
  // when the output side never ran.
  const sections = sectionStates(call)
  const resolvedName = call.name !== '' ? call.name : toolName
  return {
    title: toolLabel(resolvedName, t),
    displayName: wireName(resolvedName, t),
    summary: summaryOf(call.args, call),
    badge: badgeOf(call, t),
    kind: kindOf(resolvedName),
    input: inputText(call),
    output: call.settled ? outputText(call) : '',
    state,
    inputState: sections.input,
    outputState: sections.output,
    // "Input accepted, output pending": show an OUT placeholder so its own
    // brand-colored, pulsing bar is visible while the tool runs.
    waitingForOutput: call.settled !== true && call.phase !== 'preparing',
  }
}

function statusKey(state) {
  if (state === 'preparing') return 'state.preparing'
  if (state === 'running') return 'state.running'
  if (state === 'error') return 'state.error'
  if (state === 'stopped') return 'state.stopped'
  return null
}

/**
 * Expanded generic IN/OUT card used as the keyed-slot fallback. Unlike the
 * stock disclosure row it starts open; the chevron is still available so a
 * long transcript can be folded manually.
 */
export function EnhancedExpandedTool({ block, toolName, t, inspect }) {
  const tone = useDisplaySettings()
  const model = useMemo(() => genericModel(block, toolName, t), [block, toolName, t])
  const [open, setOpen] = useState(true)
  const stateLabel = statusKey(model.state)
  const hasBody = model.input !== '' || model.output !== ''
  return (
    <div className="enhanced-tool enhanced-generic" data-variant="tool" data-kind={model.kind} data-state={model.state} data-tool={toolName} data-shell-tone={tone.toolShellTone} data-inner-tone={tone.toolInnerTone} data-body={hasBody && open ? 'true' : 'false'}>
      <div className="enhanced-head">
        <span className="enhanced-kind"><KindIcon kind={model.kind} /></span>
        {hasBody ? (
          <button
            type="button"
            className="enhanced-toggle"
            aria-expanded={open}
            aria-label={open ? t('collapse') : t('expand')}
            onClick={() => setOpen(value => !value)}
          >
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="enhanced-toggle-placeholder" aria-hidden="true" />
        )}
        <span className="enhanced-dot" aria-hidden="true" />
        <span className="enhanced-tag">{t('tool.fallbackTitle')}</span>
        <span className="enhanced-name">{model.displayName}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.summary}>{model.summary}</span> : null}
        {model.badge !== '' ? <span className="enhanced-badge">{model.badge}</span> : null}
        <span className="enhanced-actions">
          {stateLabel !== null ? <span className="enhanced-state">{t(stateLabel)}</span> : null}
          <InspectButton inspect={inspect} t={t} />
        </span>
      </div>
      {open && hasBody ? (
        <div className="enhanced-io">
          {model.input !== '' ? (
            <div className="enhanced-section" data-section="in" data-state={model.inputState}>
              <span className="enhanced-label">{t('tool.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code" data-error={model.inputState === 'error' ? '' : undefined}>{model.input}</pre>
              </div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.outputState === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : model.waitingForOutput ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-placeholder="true">{t('state.running')}…</pre>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Tools whose stock presentation is the generic `DetailsRow` (goal/schedule,
 * runtime inspection, session/job/terminal queries, subagent control, team
 * tasks, ...). They have keyed views, so the node fallback never sees them;
 * the tool-call style registers the same expanded IN/OUT card for these keys
 * when the user enables the enhanced-style tool-call option. Rich-result views
 * (Read, todo, question, image) stay native on purpose.
 */
export const ENHANCED_DETAILS_KEYS = [
  'create_goal', 'get_goal', 'update_goal',
  'schedule_create', 'schedule_list', 'schedule_view', 'schedule_edit',
  'schedule_delete', 'schedule_update',
  'cordis_inspect_list', 'cordis_inspect_query', 'cordis_inspect_self',
  'workflow', 'ralph',
  'session_event_read', 'session_event_search', 'session_event_trace',
  'session_search', 'session_trace',
  'list_subagent_models', 'subagent', 'list_agents', 'send_message',
  'interrupt_agent', 'spawn_teammate', 'wait_agent',
  'job_list', 'job_output', 'job_kill',
  'terminal_open', 'terminal_read', 'terminal_list', 'terminal_signal', 'terminal_close',
  'lsp',
  'team_task_create', 'team_task_get', 'team_task_update', 'team_task_list',
]

/**
 * File-content search and web tools ship rich stock cards. The enhanced style
 * takes them over as well so one conversation does not mix flat IN/OUT rows
 * with native disclosure cards; turning the option back to DSH native restores
 * the stock cards unchanged.
 */
export const ENHANCED_SEARCH_WEB_KEYS = ['grep', 'glob', 'web_search', 'web_fetch']

/** Command tools keep their native disclosure when the command-row option is native. */
const SHELL_KEYS = new Set(['bash', 'pwsh', 'win_bash'])

/** Live display settings for the keyed enhanced rows. */
function useDisplaySettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/**
 * Keyless generic tools (no shipped keyed view). Stock chat/trajectory trees
 * dispatch `tool.call.toolview` by tool name and fall back to their own generic
 * row when no key exists, so registering these keys is what makes the enhanced
 * style apply even when the tool-call node renderer is not ours.
 */
export const ENHANCED_GENERIC_KEYS = [
  'browser_navigate', 'browser_click', 'browser_type', 'browser_press',
  'browser_scroll', 'browser_snapshot', 'browser_screenshot', 'browser_console',
  'browser_network', 'browser_tabs', 'browser_close',
  'working_directory', 'load_workspace_dependencies', 'plugin_manager', 'skill',
  'exit_plan_mode', 'subagent_fork',
  'squads_list', 'squads_read', 'squads_create', 'squads_update', 'squads_delete',
  'squad_member_add', 'squad_member_update', 'squad_member_remove',
  'squads_run_member', 'squads_run_squad',
  'task_board_list', 'task_board_get', 'task_board_create', 'task_board_update',
  'task_board_manage', 'task_board_run', 'task_board_schedule', 'task_board_set_parent',
  'task_board_github_list', 'task_board_github_get', 'task_board_github_refresh',
  'task_board_github_repositories', 'task_board_github_setup',
  'task_board_github_comment', 'task_board_github_create_pr',
  'task_board_github_link_pr', 'task_board_github_close_issue',
]

/** Small category glyphs so command, search, web and generic rows read differently. */
export function KindIcon({ kind }) {
  if (kind === 'command') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="m3.5 5 3.2 3-3.2 3M8.5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'search') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.2 10.2 3.1 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'web') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.4 8h11.2M8 2.2c1.7 1.7 2.5 3.6 2.5 5.8S9.7 12.1 8 13.8C6.3 12.1 5.5 10.2 5.5 8S6.3 3.9 8 2.2Z" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M8 1.8l1.5 4.2L13.7 7.5l-4.2 1.5L8 13.2 6.5 9 2.3 7.5 6.5 6 8 1.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Trajectory jump affordance shared by every enhanced-style row and diff card.
 * A labeled pill (not a bare glyph) so the action is discoverable at a glance;
 * it keeps the full "view in trajectory" wording in title/aria-label.
 */
export function InspectButton({ inspect, t }) {
  if (typeof inspect !== 'function') return null
  return (
    <button
      type="button"
      className="enhanced-inspect"
      title={t('inspectTrajectory')}
      aria-label={t('inspectTrajectory')}
      onClick={event => { event.stopPropagation(); inspect() }}
      onKeyDown={event => event.stopPropagation()}
    >
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
        <path d="M9.2 2.2h4.6v4.6M13.8 2.2 8.1 7.9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.6 9.3v3.6a.9.9 0 0 1-.9.9H3.1a.9.9 0 0 1-.9-.9V5.3a.9.9 0 0 1 .9-.9h3.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      <span className="enhanced-inspect-label">{t('inspectShort')}</span>
    </button>
  )
}

