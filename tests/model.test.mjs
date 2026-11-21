import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCardModel } from '../src/client/model.js'

/** A settled edit result block as the conversation renderer supplies it. */
function editResult({ name = 'edit', args, diffs, content = [], isError = false } = {}) {
  return {
    kind: 'tool-result',
    callId: 'call-1',
    parentCallId: undefined,
    call: { name, argsRaw: JSON.stringify(args ?? {}) },
    meta: { path: 'D:/workspace/file.md', diffs },
    content,
    isError,
  }
}

const metaDiff = {
  path: 'D:/workspace/file.md',
  oldText: 'alpha\n### change\n\nexisting\n',
  newText: 'alpha\n### change\n\n- added line\nexisting\n',
}

test('a pure-addition edit stays an update, not a new file', () => {
  const model = buildCardModel({
    block: editResult({ args: { file_path: 'D:/workspace/file.md' }, diffs: [metaDiff] }),
    toolName: 'edit',
    cwd: 'D:/workspace',
    snapshot: null,
    fileText: 'alpha\r\n### change\r\n\r\n- added line\r\nexisting\r\n',
    loading: false,
  })
  assert.equal(model.status, 'ok')
  assert.equal(model.operation, 'update')
  assert.equal(model.source, 'located')
  assert.deepEqual(model.notice, { kind: 'history' })
  assert.equal(model.diff.hasNumbers, true)
})

test('a creation is recognized from an oldText:null meta diff', () => {
  const model = buildCardModel({
    block: editResult({
      name: 'write',
      args: { file_path: 'D:/workspace/new.md', content: 'hello\n' },
      diffs: [{ path: 'D:/workspace/new.md', oldText: null, newText: 'hello\n' }],
    }),
    toolName: 'write',
    cwd: 'D:/workspace',
    snapshot: null,
    fileText: 'hello\r\n',
    loading: false,
  })
  assert.equal(model.status, 'ok')
  assert.equal(model.operation, 'create')
  assert.equal(model.diff.hasNumbers, true)
})

test('when the current file no longer matches, numbers are pending with an explicit notice', () => {
  const model = buildCardModel({
    block: editResult({ args: { file_path: 'D:/workspace/file.md' }, diffs: [metaDiff] }),
    toolName: 'edit',
    cwd: 'D:/workspace',
    snapshot: null,
    fileText: 'unrelated\ncontent\n',
    loading: false,
  })
  assert.equal(model.status, 'ok')
  assert.equal(model.operation, 'update')
  assert.equal(model.source, 'meta')
  assert.deepEqual(model.notice, { kind: 'locate' })
  assert.equal(model.diff.hasNumbers, false)
})

test('an LF/CRLF-only rewrite is nochange instead of a zero-change diff', () => {
  const model = buildCardModel({
    block: editResult({ args: { file_path: 'D:/workspace/file.md' } }),
    toolName: 'edit',
    cwd: 'D:/workspace',
    // Diff 引擎逐行比较时会剥掉行尾 \r：纯换行符改写实际是 0 增删，卡片应显示
    // “无实际变化”，而不是一张 0 变更的差异卡片。
    snapshot: {
      path: 'D:/workspace/file.md',
      before: 'alpha\nbeta\n',
      after: 'alpha\r\nbeta\r\n',
      operation: 'update',
    },
    loading: false,
  })
  assert.equal(model.status, 'nochange')
  assert.equal(model.source, 'snapshot')
  assert.equal(model.diff.added, 0)
  assert.equal(model.diff.removed, 0)
})

test('the normalized nochange check does not hide real content changes', () => {
  const model = buildCardModel({
    block: editResult({ args: { file_path: 'D:/workspace/file.md' } }),
    toolName: 'edit',
    cwd: 'D:/workspace',
    snapshot: {
      path: 'D:/workspace/file.md',
      before: 'alpha\r\nbeta\r\n',
      after: 'alpha\r\ngamma\r\n',
      operation: 'update',
    },
    loading: false,
  })
  assert.equal(model.status, 'ok')
  assert.equal(model.diff.added, 1)
  assert.equal(model.diff.removed, 1)
})
