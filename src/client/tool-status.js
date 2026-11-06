/**
 * IN / OUT section status inference for the enhanced tool cards.
 *
 * The tool cards split one call into two independently coloured strips:
 *
 *  - IN  — the arguments/name the model supplied (shown before dispatch);
 *  - OUT — the tool's result text.
 *
 * A failure can belong to either side. Parameter/schema/dispatch failures mean
 * the tool body never ran (`IN` failed, `OUT` was skipped); every other failure
 * happened while producing the result (`OUT` failed). A client-side
 * `interrupted` marker is not a failure side at all: the whole call stopped.
 *
 * Contract: spec2 §4. These helpers are pure, tolerate any malformed input and
 * never throw, so the rendering layer can call them unconditionally.
 */

import { parseArgs } from './model.js'

/**
 * `ToolErrorInfo.code` values that mean the input/call itself was rejected
 * before the tool body ran (compared case-insensitively).
 */
export const INPUT_FAILURE_CODES = Object.freeze([
  'INVALID_ARGS',
  'UNKNOWN_TOOL',
  'ABORTED_BEFORE_DISPATCH',
])

/**
 * One section state:
 * `'preparing' | 'running' | 'ok' | 'error' | 'stopped' | 'skipped'`.
 *
 * @typedef {{ input: string, output: string }} SectionStates
 */

/** Client display code for a call that was aborted, not failed (any case). */
const INTERRUPTED_CODE = 'interrupted'

/** Safe result for missing/settled-unknown input. */
function runningStates() {
  return { input: 'running', output: 'running' }
}

/** Narrow to a non-null object, or null for everything else. */
function asObject(value) {
  return value !== null && typeof value === 'object' ? value : null
}

/**
 * The failure code of a call as a trimmed non-empty string, or ''.
 * A non-string/absent `error` simply means "no code" (fallback rules apply).
 */
function errorCodeOf(call) {
  let error
  try {
    error = call.error
  } catch {
    return ''
  }
  if (error === null || typeof error !== 'object') return ''
  let code
  try {
    code = error.code
  } catch {
    return ''
  }
  if (typeof code !== 'string') return ''
  const trimmed = code.trim()
  return trimmed === '' ? '' : trimmed
}

/** True when the settled call carries the client's `interrupted` marker. */
function isInterrupted(call) {
  return errorCodeOf(call).toLowerCase() === INTERRUPTED_CODE
}

/**
 * Fallback attribution for a failure that has no `error.code`: if the raw
 * arguments are non-empty but are not a JSON object, the input never was valid.
 */
function failedByArguments(call) {
  let raw
  try {
    raw = call.argsRaw
  } catch {
    return false
  }
  if (typeof raw !== 'string' || raw === '') return false
  return parseArgs(raw) === null
}

/**
 * Which side of one settled failure is at fault.
 *
 * @param {object | null} call `deriveCall(block)` result
 *   (`settled`/`phase`/`isError`/`error`/`argsRaw`).
 * @returns {'input' | 'output'} `'output'` for non-error calls as well (callers
 *   only consult it when `isError === true`).
 */
export function failureSide(call) {
  try {
    const target = asObject(call)
    if (target === null || target.isError !== true) return 'output'
    const code = errorCodeOf(target)
    if (code !== '') {
      return INPUT_FAILURE_CODES.includes(code.toUpperCase()) ? 'input' : 'output'
    }
    return failedByArguments(target) ? 'input' : 'output'
  } catch {
    return 'output'
  }
}

/** States for a settled failing call (interrupted handled before sides). */
function failingStates(call) {
  if (isInterrupted(call)) return { input: 'ok', output: 'stopped' }
  if (failureSide(call) === 'input') return { input: 'error', output: 'skipped' }
  return { input: 'ok', output: 'error' }
}

/**
 * IN/OUT states of a generic tool call.
 *
 * @param {object | null} call `deriveCall(block)` result.
 * @returns {SectionStates}
 */
export function sectionStates(call) {
  try {
    const target = asObject(call)
    if (target === null) return runningStates()
    if (target.settled !== true) {
      return {
        input: target.phase === 'preparing' ? 'preparing' : 'running',
        output: 'running',
      }
    }
    if (target.isError !== true) return { input: 'ok', output: 'ok' }
    return failingStates(target)
  } catch {
    return runningStates()
  }
}

/**
 * IN/OUT states of a command-execution tool (`bash`/`pwsh`/`win_bash`).
 * On top of the generic rules, a settled non-error call whose result text
 * reported a non-zero exit code is an OUT failure (the input was accepted).
 *
 * @param {object | null} call `deriveCall(block)` result.
 * @param {boolean} exitFailed `true` when the caller parsed a non-zero exit /
 *   killed-by-signal marker out of the result text.
 * @returns {SectionStates}
 */
export function shellSectionStates(call, exitFailed) {
  try {
    const target = asObject(call)
    if (target === null) return runningStates()
    if (target.settled !== true) {
      return {
        input: target.phase === 'preparing' ? 'preparing' : 'running',
        output: 'running',
      }
    }
    if (target.isError !== true) {
      return exitFailed === true ? { input: 'ok', output: 'error' } : { input: 'ok', output: 'ok' }
    }
    return failingStates(target)
  } catch {
    return runningStates()
  }
}
