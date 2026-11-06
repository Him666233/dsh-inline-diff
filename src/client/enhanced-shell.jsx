/**
 * enhanced flat flattened command row for `bash` / `pwsh`.
 *
 * The stock DSH row is a disclosure; this variant is the flat presentation
 * from a modern coding agent transcript: one status dot + tool name + one-line
 * summary, followed by the always-visible IN/OUT card. It derives everything
 * from the tool block the owner supplies and only restyles presentation — no
 * tool execution, session event, or model input is touched.
 */
import { useMemo, useSyncExternalStore } from 'react'
import { deriveCall, parseArgs } from './model.js'
import { InspectButton, KindIcon } from './enhanced-tools.jsx'
import { getSettings, subscribeSettings } from './settings.js'
import { shellSectionStates } from './tool-status.js'

/** Split persisted content blocks into plain output text. */
function resultText(call) {
  const parts = []
  for (const part of call.content) {
    if (part !== null && typeof part === 'object') {
      if (part.type === 'text' && typeof part.text === 'string') parts.push(part.text)
      else if (part.type !== undefined) parts.push(JSON.stringify(part, null, 2))
    }
  }
  if (parts.length === 0 && call.error !== null && call.error !== undefined) {
    const info = call.error
    const reason = typeof info.reason === 'string' ? info.reason : typeof info.code === 'string' ? info.code : typeof info.name === 'string' ? info.name : ''
    if (reason !== '') parts.push(reason)
  }
  return parts.join('\n')
}

/** Extract the shell exit marker without importing the Host shell package. */
function parseExit(text) {
  const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text)
  if (signal !== null) return { output: text.slice(0, signal.index), label: signal[1], failed: true }
  const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text)
  if (exit !== null) {
    const code = exit[1] === 'null' ? null : Number(exit[1])
    return { output: text.slice(0, exit.index), label: code === null ? 'null' : `exit ${code}`, failed: code !== 0 }
  }
  return { output: text, label: undefined, failed: false }
}

function firstLine(text) {
  if (typeof text !== 'string') return ''
  const newline = text.indexOf('\n')
  return (newline === -1 ? text : text.slice(0, newline)).trim()
}

/** One shell call's flat presentation model. */
function shellModel(block, toolName) {
  const call = deriveCall(block)
  const args = call.args ?? parseArgs(call.argsRaw) ?? null
  const command = args !== null && typeof args.command === 'string' ? args.command : ''
  const description = args !== null && typeof args.description === 'string' ? args.description : ''
  const background = args !== null && args.run_in_background === true
  const title = call.name === 'pwsh' || toolName === 'pwsh' ? 'PowerShell' : 'Bash'
  const summary = description.trim() !== '' ? firstLine(description) : firstLine(command)
  // IN normally shows the command text. When the arguments themselves are
  // malformed/rejected there is no command string to show, so fall back to the
  // raw argument payload: the IN section (and its red input bar) must stay
  // visible for an input-side failure instead of silently disappearing.
  const input = command !== ''
    ? command
    : (typeof call.argsRaw === 'string' ? call.argsRaw.trim() : '')
  const text = call.settled ? resultText(call) : ''
  const exit = call.settled && text !== '' ? parseExit(text) : { output: text, label: undefined, failed: false }
  // Per-section state: IN covers call/preparation problems, OUT covers what
  // the process wrote back (including a non-zero exit code).
  const sections = shellSectionStates(call, exit.failed === true)
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError || exit.failed ? 'error' : 'ok'
  return {
    title,
    summary,
    command,
    input,
    description,
    output: call.settled ? exit.output : '',
    exitLabel: call.settled && !call.isError ? exit.label : undefined,
    state,
    inputState: sections.input,
    outputState: sections.output,
    // "Input accepted, output pending": the OUT section shows a placeholder so
    // its own (brand colored, pulsing) bar is visible while the process runs.
    waitingForOutput: call.settled !== true && call.phase !== 'preparing',
    background,
    expanded: command !== '' || exit.output !== '',
  }
}

/** Per-card-type shell/inner tone settings. */
function useCardSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/** Render one flat enhanced-style shell row. */
export function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props
  const tone = useCardSettings()
  const model = useMemo(() => shellModel(block, toolName), [block, toolName])
  const hasIO = model.input !== '' || model.output !== '' || model.waitingForOutput
  const stateLabel = model.state === 'error'
    ? t('state.error')
    : model.state === 'stopped'
      ? t('state.stopped')
      : model.state === 'running'
        ? t('state.running')
        : model.state === 'preparing' ? t('state.preparing') : ''
  return (
    <div className="enhanced-tool enhanced-command" data-variant="command" data-state={model.state} data-tool={toolName} data-shell-tone={tone.shellShellTone} data-inner-tone={tone.shellInnerTone} data-body={hasIO ? 'true' : 'false'}>
      <div className="enhanced-head">
        <span className="enhanced-kind"><KindIcon kind="command" /></span>
        <span className="enhanced-dot" aria-hidden="true" />
        <span className="enhanced-name">{model.title}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.command}>{model.summary}</span> : null}
        <span className="enhanced-actions">
          {model.exitLabel !== undefined && model.exitLabel !== 'exit 0' ? <span className="enhanced-exit">{model.exitLabel}</span> : null}
          {stateLabel !== '' ? <span className="enhanced-state">{stateLabel}</span> : null}
          <InspectButton inspect={inspect} t={t} />
        </span>
      </div>
      {hasIO ? (
        <div className="enhanced-io">
          {model.input !== '' ? (
            <div className="enhanced-section" data-section="in" data-state={model.inputState}>
              <span className="enhanced-label">{t('shell.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code" data-error={model.inputState === 'error' ? '' : undefined}>{model.input}</pre>
              </div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('shell.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.outputState === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : model.waitingForOutput ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('shell.out')}</span>
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
