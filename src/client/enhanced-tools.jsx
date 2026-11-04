/**
 * Optional enhanced flat tool-call transcript.
 *
 * When enabled, this shadows the shipped `tool-call` Chat node with a wrapper
 * that keeps the SAME keyed child dispatch (`tool.call.toolview`): every tool
 * that has a dedicated view — including this plugin's diff cards and flat
 * command rows — still renders its own presentation. Only tools without a
 * keyed view fall back to this plugin's expanded IN/OUT card, which is the
 * "show what was sent and what came back without unfolding" behaviour.
 *
 * When disabled the plugin registers nothing at this node key and the shipped
 * tree returns unchanged.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { deriveCall } from './model.js'
import { getSettings, subscribeSettings } from './settings.js'

/** Mirrors the owner's call-stage discriminator. */
function toolCallPhase(block) {
  if ('kind' in block) return { phase: 'result', block }
  return block.phase === 'preparing' ? { phase: 'preparing', block } : { phase: 'start', block }
}

/** The wire tool name at any stage. */
function callName(call) {
  return call.phase === 'result' ? call.block.call?.name ?? '' : call.block.name
}

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

/** Build a one-line summary from the most descriptive argument. */
function summaryOf(args) {
  if (args === null || typeof args !== 'object') return ''
  const keys = ['description', 'command', 'file_path', 'path', 'pattern', 'url', 'query', 'prompt', 'objective', 'skill', 'title', 'name', 'tool']
  for (const key of keys) {
    const value = args[key]
    if (typeof value !== 'string' || value.trim() === '') continue
    const first = value.split('\n')[0].trim()
    return first.length > 120 ? first.slice(0, 120) + '…' : first
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

/** State + copy for one expanded generic tool call. */
function genericModel(block, toolName, t) {
  const call = deriveCall(block)
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError ? 'error' : 'ok'
  return {
    title: toolLabel(call.name !== '' ? call.name : toolName, t),
    displayName: wireName(call.name !== '' ? call.name : toolName, t),
    summary: summaryOf(call.args),
    input: inputText(call),
    output: call.settled ? outputText(call) : '',
    state,
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
  const model = useMemo(() => genericModel(block, toolName, t), [block, toolName, t])
  const [open, setOpen] = useState(true)
  const stateLabel = statusKey(model.state)
  const hasBody = model.input !== '' || model.output !== ''
  return (
    <div className="enhanced-tool enhanced-generic" data-variant="tool" data-state={model.state} data-tool={toolName}>
      <div className="enhanced-head">
        <span className="enhanced-kind"><KindIcon kind="tool" /></span>
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
        <span className="enhanced-sep" aria-hidden="true">·</span>
        <span className="enhanced-name">{model.displayName}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.summary}>{model.summary}</span> : null}
        {stateLabel !== null ? <span className="enhanced-state">{t(stateLabel)}</span> : null}
        <InspectButton inspect={inspect} t={t} />
      </div>
      {open && hasBody ? (
        <div className="enhanced-io">
          {model.input !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('tool.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code">{model.input}</pre>
              </div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.state === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {model.state === 'running' || model.state === 'preparing' ? (
        <div className="enhanced-empty">{t(statusKey(model.state))}…</div>
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
 * (Read, search, web, todo, question) stay native on purpose.
 */
export const ENHANCED_DETAILS_KEYS = [
  'create_goal', 'get_goal', 'update_goal',
  'schedule_create', 'schedule_list', 'schedule_delete', 'schedule_update',
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

/** Command tools keep their native disclosure when the command-row option is native. */
const SHELL_KEYS = new Set(['bash', 'pwsh', 'win_bash'])

/** Live display settings for the always-mounted node renderer. */
function useDisplaySettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/** Native-like collapsed disclosure used when the enhanced option is off. */
function NativeCompactTool({ block, toolName, t, variant = 'generic', inspect }) {
  const call = deriveCall(block)
  const [open, setOpen] = useState(false)
  const model = genericModel(block, toolName, t)
  const state = model.state
  const title = variant === 'shell'
    ? toolLabel(call.name !== '' ? call.name : toolName, t)
    : `${t('tool.fallbackTitle')} · ${wireName(call.name !== '' ? call.name : toolName, t)}`
  return (
    <div className="enhanced-native" data-variant={variant} data-state={state} data-tool={toolName}>
      <div className="enhanced-native-headrow">
        <button type="button" className="enhanced-native-head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <span className="enhanced-native-chevron" data-open={open ? 'true' : 'false'} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span className="enhanced-name">{title}</span>
          {model.summary !== '' ? <span className="enhanced-summary">{model.summary}</span> : null}
          {state !== 'ok' ? <span className="enhanced-state">{t(state === 'error' ? 'state.error' : state === 'running' ? 'state.running' : state === 'preparing' ? 'state.preparing' : 'state.stopped')}</span> : null}
        </button>
        <InspectButton inspect={inspect} t={t} />
      </div>
      {open && (model.input !== '' || model.output !== '') ? (
        <div className="enhanced-io">
          {model.input !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('tool.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in"><pre className="enhanced-code">{model.input}</pre></div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll"><pre className="enhanced-code" data-error={state === 'error' ? '' : undefined}>{model.output}</pre></div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
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

/** Small terminal/tool glyphs so command rows and tool-call rows read differently. */
export function KindIcon({ kind }) {
  if (kind === 'command') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="m3.5 5 3.2 3-3.2 3M8.5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M8 1.8l1.5 4.2L13.7 7.5l-4.2 1.5L8 13.2 6.5 9 2.3 7.5 6.5 6 8 1.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

/** Trajectory jump affordance shared by the enhanced-style rows. */
export function InspectButton({ inspect, t }) {
  if (typeof inspect !== 'function') return null
  return (
    <button
      type="button"
      className="enhanced-inspect"
      title={t('inspectTrajectory')}
      aria-label={t('inspectTrajectory')}
      onClick={event => { event.stopPropagation(); inspect() }}
    >
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm2.3 3.7-1.6 3.9-3.9 1.6 1.6-3.9 3.9-1.6Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/** One call plus its nested sub-calls. */
function ToolBranch({ renderSlot, block, cwd, openFile, inspectCall, loadImage, useDisclosure, t }) {
  const call = useMemo(() => toolCallPhase(block), [block])
  const callId = call.block.callId
  const toolName = callName(call)
  const owner = useMemo(() => ({
    callId,
    toolName,
    ...call,
    openFile,
    cwd,
    home: undefined,
    loadImage,
    useDisclosure,
    inspect: typeof inspectCall === 'function' ? () => inspectCall(callId) : undefined,
  }), [callId, toolName, call, openFile, cwd, loadImage, useDisclosure, inspectCall])
  const settings = useDisplaySettings()
  const shellTool = SHELL_KEYS.has(toolName)
  const inspect = owner.inspect
  const fallback = shellTool && settings.shellRows === 'native'
    ? <NativeCompactTool block={call.block} toolName={toolName} t={t} variant="shell" inspect={inspect} />
    : settings.toolCalls === 'enhanced'
      ? <EnhancedExpandedTool block={call.block} phase={call.phase} toolName={toolName} t={t} inspect={inspect} />
      : <NativeCompactTool block={call.block} toolName={toolName} t={t} inspect={inspect} />
  const rendered = typeof renderSlot === 'function'
    ? renderSlot('tool.call.toolview', owner, { entryKey: toolName, fallback })
    : fallback
  const showSubCalls = call.phase !== 'preparing' && Array.isArray(call.block.subCalls) && call.block.subCalls.length > 0
  return (
    <div className="enhanced-call-row" data-chat-anchor-key={`call:${callId}`} data-chat-call-id={callId}>
      {rendered}
      {showSubCalls ? (
        <div className="enhanced-subcalls" data-subcalls="true">
          {call.block.subCalls.map(child => (
            <ToolBranch
              key={child.callId}
              renderSlot={renderSlot}
              block={child}
              cwd={cwd}
              openFile={openFile}
              inspectCall={inspectCall}
              loadImage={loadImage}
              useDisclosure={useDisclosure}
              t={t}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Replacement `conversation.chat.node` renderer for the `tool-call` kind. */
export function EnhancedToolCallTree({ renderSlot, node, cwd, openFile, inspectCall, loadImage, useDisclosure, t }) {
  return (
    <ToolBranch
      renderSlot={renderSlot}
      block={node.data.root}
      cwd={cwd}
      openFile={openFile}
      inspectCall={inspectCall}
      loadImage={loadImage}
      useDisclosure={useDisclosure}
      t={t}
    />
  )
}
