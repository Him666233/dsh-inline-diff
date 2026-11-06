import test from 'node:test'
import assert from 'node:assert/strict'
import {
  INPUT_FAILURE_CODES,
  failureSide,
  sectionStates,
  shellSectionStates,
} from '../src/client/tool-status.js'
import { deriveCall } from '../src/client/model.js'

/** Every legal section state from spec2 §4. */
const STATES = new Set(['preparing', 'running', 'ok', 'error', 'stopped', 'skipped'])

/** A settled failing `deriveCall`-shaped call. */
function settledError(error, argsRaw) {
  return { settled: true, phase: 'result', isError: true, error, argsRaw, content: [] }
}

/** A settled successful `deriveCall`-shaped call. */
function settledOk(extra = {}) {
  return { settled: true, phase: 'result', isError: false, content: [], ...extra }
}

/** Assert a states object is well-formed, optionally with exact values. */
function assertStates(states, expectedInput, expectedOutput, label = '') {
  assert.ok(states !== null && typeof states === 'object', `${label} states object`)
  assert.ok(STATES.has(states.input), `${label} invalid input state ${String(states.input)}`)
  assert.ok(STATES.has(states.output), `${label} invalid output state ${String(states.output)}`)
  if (expectedInput !== undefined) assert.equal(states.input, expectedInput, `${label} input`)
  if (expectedOutput !== undefined) assert.equal(states.output, expectedOutput, `${label} output`)
}

/** Mixed-case variant of a code: first letter lower, rest preserved. */
function mixedCase(code) {
  return code.slice(0, 1).toLowerCase() + code.slice(1)
}

test('input-side failure codes: every code in any case is attributed to IN', () => {
  assert.deepEqual(INPUT_FAILURE_CODES, [
    'INVALID_ARGS',
    'UNKNOWN_TOOL',
    'ABORTED_BEFORE_DISPATCH',
  ])

  for (const code of INPUT_FAILURE_CODES) {
    for (const variant of [code, code.toLowerCase(), mixedCase(code)]) {
      const call = settledError({ name: 'ToolError', code: variant }, '{"path":"a.txt"}')
      assert.equal(failureSide(call), 'input', `failureSide for ${variant}`)
      assertStates(sectionStates(call), 'error', 'skipped', variant)
      // A non-zero exit marker must not move an input-side failure to OUT.
      assertStates(shellSectionStates(call, true), 'error', 'skipped', variant)
      assertStates(shellSectionStates(call, false), 'error', 'skipped', variant)
    }
  }
})

test('unknown or missing code with acceptable args is attributed to OUT', () => {
  const calls = [
    settledError({ name: 'ToolError', code: 'EXEC_FAILED' }, '{"path":"a.txt"}'),
    settledError({ code: 'TIMEOUT' }, '{"path":"a.txt"}'),
    settledError({ code: 'ABORTED' }, '{"path":"a.txt"}'),
    settledError(undefined, '{"path":"a.txt"}'),
    settledError(null, '{}'),
    settledError({}, '{"path":"a.txt"}'),
    settledError({ name: 'ToolError', reason: 'boom' }, '{"path":"a.txt"}'),
  ]
  for (const call of calls) {
    assert.equal(failureSide(call), 'output')
    assertStates(sectionStates(call), 'ok', 'error')
  }
  // No argsRaw at all: the fallback cannot prove an input failure.
  assert.equal(failureSide(settledError({})), 'output')
  assertStates(sectionStates(settledError({})), 'ok', 'error')
})

test('missing code + unusable argsRaw is attributed to IN', () => {
  const unusable = ['{not json', '[]', 'null', '"text"', '42', 'true', '{"a":']
  for (const argsRaw of unusable) {
    const call = settledError({ name: 'ToolError', reason: 'unnamed' }, argsRaw)
    assert.equal(failureSide(call), 'input', `failureSide for ${argsRaw}`)
    assertStates(sectionStates(call), 'error', 'skipped', argsRaw)
  }
  // Empty/non-string argsRaw does not count as bad input.
  for (const argsRaw of ['', null, undefined, 42, {}, ['{}']]) {
    const call = settledError({}, argsRaw)
    assert.equal(failureSide(call), 'output', `failureSide for ${String(argsRaw)}`)
    assertStates(sectionStates(call), 'ok', 'error')
  }
  // failureSide ignores non-error calls even when the args are unusable.
  assert.equal(failureSide({ settled: true, isError: false, argsRaw: 'not-json' }), 'output')
  assert.equal(failureSide({ settled: false, argsRaw: 'not-json' }), 'output')
})

test('unsettled calls: preparing vs running phases', () => {
  assertStates(sectionStates({ settled: false, phase: 'preparing' }), 'preparing', 'running')
  assertStates(sectionStates({ settled: false, phase: 'start' }), 'running', 'running')
  assertStates(sectionStates({ settled: false }), 'running', 'running')
  assertStates(sectionStates({}), 'running', 'running')

  assertStates(shellSectionStates({ settled: false, phase: 'preparing' }, false), 'preparing', 'running')
  assertStates(shellSectionStates({ settled: false, phase: 'start' }, true), 'running', 'running')

  // Real block shapes through deriveCall.
  const preparing = deriveCall({ name: 'bash', argsRaw: '', phase: 'preparing' })
  assert.equal(preparing.settled, false)
  assert.equal(preparing.phase, 'preparing')
  assertStates(sectionStates(preparing), 'preparing', 'running')
  assertStates(shellSectionStates(preparing, false), 'preparing', 'running')

  const started = deriveCall({ name: 'bash', argsRaw: '{"command":"ls"}', phase: 'start' })
  assert.equal(started.settled, false)
  assertStates(sectionStates(started), 'running', 'running')
  assertStates(shellSectionStates(started, false), 'running', 'running')
})

test('settled success is ok/ok for generic and shell tools', () => {
  for (const call of [settledOk(), { settled: true, isError: false }, { settled: true }]) {
    assert.equal(failureSide(call), 'output')
    assertStates(sectionStates(call), 'ok', 'ok')
    assertStates(shellSectionStates(call, false), 'ok', 'ok')
    assertStates(shellSectionStates(call, undefined), 'ok', 'ok')
  }
  const result = deriveCall({
    kind: 'tool_result',
    call: { name: 'read', argsRaw: '{"path":"a.txt"}' },
    isError: false,
    content: [{ type: 'text', text: 'file body' }],
  })
  assert.equal(result.settled, true)
  assertStates(sectionStates(result), 'ok', 'ok')
  assertStates(shellSectionStates(result, false), 'ok', 'ok')
})

test('interrupted is stopped, never an error side', () => {
  for (const code of ['interrupted', 'INTERRUPTED', 'Interrupted']) {
    const call = settledError({ name: 'ToolError', code })
    assertStates(sectionStates(call), 'ok', 'stopped', code)
    // The exit marker must not turn a stopped call into an OUT error.
    assertStates(shellSectionStates(call, true), 'ok', 'stopped', code)
    // Contract: only the three input codes are input failures.
    assert.equal(failureSide(call), 'output')
  }
  // interrupted wins over the bad-args fallback.
  assertStates(sectionStates(settledError({ code: 'interrupted' }, 'not-json')), 'ok', 'stopped')

  const stopped = deriveCall({
    kind: 'tool_result',
    call: { name: 'bash', argsRaw: '{"command":"sleep 10"}' },
    isError: true,
    error: { name: 'ToolError', code: 'INTERRUPTED' },
    content: [],
  })
  assertStates(sectionStates(stopped), 'ok', 'stopped')
  assertStates(shellSectionStates(stopped, false), 'ok', 'stopped')
})

test('shell tools: a non-zero exit is an OUT failure even without isError', () => {
  assertStates(shellSectionStates(settledOk(), true), 'ok', 'error')
  assertStates(shellSectionStates(settledOk(), false), 'ok', 'ok')
  // Generic tools do not take the exit marker into account.
  assertStates(sectionStates(settledOk()), 'ok', 'ok')

  const bashResult = deriveCall({
    kind: 'tool_result',
    call: { name: 'bash', argsRaw: '{"command":"false"}' },
    isError: false,
    content: [{ type: 'text', text: '[exit code: 1]' }],
  })
  assert.equal(bashResult.isError, false)
  assertStates(shellSectionStates(bashResult, true), 'ok', 'error')
  assertStates(shellSectionStates(bashResult, false), 'ok', 'ok')
})

test('input-side failures show error/skipped, output-side failures ok/error', () => {
  const invalid = deriveCall({
    kind: 'tool_result',
    call: { name: 'read', argsRaw: '{"path":' },
    isError: true,
    error: { name: 'ToolError', code: 'INVALID_ARGS' },
    content: [],
  })
  assert.equal(failureSide(invalid), 'input')
  assertStates(sectionStates(invalid), 'error', 'skipped')
  assertStates(shellSectionStates(invalid, false), 'error', 'skipped')

  const exitFailure = deriveCall({
    kind: 'tool_result',
    call: { name: 'bash', argsRaw: '{"command":"exit 2"}' },
    isError: true,
    error: { name: 'ToolError', code: 'PROCESS_EXIT' },
    content: [{ type: 'text', text: '[exit code: 2]' }],
  })
  assert.equal(failureSide(exitFailure), 'output')
  assertStates(shellSectionStates(exitFailure, true), 'ok', 'error')
  assertStates(sectionStates(exitFailure), 'ok', 'error')
})

test('malformed input never throws and always yields a legal state pair', () => {
  const junk = [null, undefined, 42, 'tool', true, [], () => {}, Symbol('x'), 10n]
  for (const value of junk) {
    assert.equal(failureSide(value), 'output')
    assertStates(sectionStates(value), 'running', 'running')
    assertStates(shellSectionStates(value, true), 'running', 'running')
    assertStates(shellSectionStates(value, false), 'running', 'running')
  }

  // Missing / oddly typed fields.
  const missing = [
    { settled: true, isError: true },
    { settled: true, isError: true, error: null },
    { settled: true, isError: true, error: 'boom' },
    { settled: true, isError: true, error: 42 },
    { settled: true, isError: true, error: { code: 42 }, argsRaw: 'not-json' },
    { settled: true, isError: true, error: { code: null }, argsRaw: 'not-json' },
    { settled: true, isError: true, error: { code: '' }, argsRaw: 'not-json' },
    { settled: true, isError: 'yes', error: { code: 'INVALID_ARGS' } },
  ]
  for (const call of missing) {
    assertStates(sectionStates(call))
    assertStates(shellSectionStates(call, true))
  }
  assertStates(sectionStates({ settled: true, isError: true }), 'ok', 'error')
  assertStates(sectionStates({ settled: true, isError: true, error: null }), 'ok', 'error')
  assertStates(sectionStates({ settled: true, isError: 'yes' }), 'ok', 'ok')

  // Throwing getters are contained inside the helpers.
  const explodingSettled = {
    get settled() {
      throw new Error('boom')
    },
  }
  assert.doesNotThrow(() => sectionStates(explodingSettled))
  assert.doesNotThrow(() => shellSectionStates(explodingSettled, true))
  assertStates(sectionStates(explodingSettled), 'running', 'running')
  assert.equal(failureSide(explodingSettled), 'output')

  const explodingError = {
    settled: true,
    isError: true,
    get error() {
      throw new Error('boom')
    },
  }
  assert.doesNotThrow(() => failureSide(explodingError))
  assert.equal(failureSide(explodingError), 'output')
  assertStates(sectionStates(explodingError), 'ok', 'error')

  const explodingArgs = {
    settled: true,
    isError: true,
    get argsRaw() {
      throw new Error('boom')
    },
  }
  assert.doesNotThrow(() => failureSide(explodingArgs))
  assert.equal(failureSide(explodingArgs), 'output')
  assertStates(sectionStates(explodingArgs), 'ok', 'error')
})
