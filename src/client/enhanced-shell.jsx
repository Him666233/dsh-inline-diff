/**
 * enhanced flat flattened command row for `bash` / `pwsh`.
 *
 * The stock DSH row is a disclosure; this variant is the flat presentation
 * from a modern coding agent transcript: one status dot + tool name + one-line
 * summary, followed by the always-visible IN/OUT card. It derives everything
 * from the tool block the owner supplies and only restyles presentation — no
 * tool execution, session event, or model input is touched.
 */
import { useMemo } from 'react'
import { deriveCall, parseArgs } from './model.js'
import { InspectButton, KindIcon } from './enhanced-tools.jsx'

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
  const text = call.settled ? resultText(call) : ''
  const exit = call.settled && text !== '' ? parseExit(text) : { output: text, label: undefined, failed: false }
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError || exit.failed ? 'error' : 'ok'
  return {
    title,
    summary,
    command,
    description,
    output: call.settled ? exit.output : '',
    exitLabel: call.settled && !call.isError ? exit.label : undefined,
    state,
    background,
    errorLine: call.settled && call.isError ? firstLine(exit.output) : '',
    expanded: command !== '' || exit.output !== '',
  }
}

/** Render one flat enhanced-style shell row. */
export function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props
  const model = useMemo(() => shellModel(block, toolName), [block, toolName])
  const hasIO = model.command !== '' || model.output !== ''
  const stateLabel = model.state === 'error'
    ? t('state.error')
    : model.state === 'stopped'
      ? t('state.stopped')
      : model.state === 'running'
        ? t('state.running')
        : model.state === 'preparing' ? t('state.preparing') : ''
  return (
    <div className="enhanced-tool enhanced-command" data-variant="command" data-state={model.state} data-tool={toolName}>
      <div className="enhanced-head">
        <span className="enhanced-kind"><KindIcon kind="command" /></span>
        <span className="enhanced-dot" aria-hidden="true" />
        <span className="enhanced-name">{model.title}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.command}>{model.summary}</span> : null}
        {model.exitLabel !== undefined && model.exitLabel !== 'exit 0' ? <span className="enhanced-exit">{model.exitLabel}</span> : null}
        {stateLabel !== '' ? <span className="enhanced-state">{stateLabel}</span> : null}
        <InspectButton inspect={inspect} t={t} />
      </div>
      {hasIO ? (
        <div className="enhanced-io">
          {model.command !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('shell.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code">{model.command}</pre>
              </div>
            </div>
          ) : null}
          {model.command !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section">
              <span className="enhanced-label">{t('shell.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.state === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : null}
        </div>
      ) : phase === 'preparing' ? (
        <div className="enhanced-empty">{t('state.preparing')}…</div>
      ) : null}
      {model.state === 'error' && model.errorLine !== '' ? <div className="enhanced-error">{model.errorLine}</div> : null}
    </div>
  )
}
