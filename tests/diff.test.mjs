import test from 'node:test'
import assert from 'node:assert/strict'
import { contentLines, diffText, gutterSides, lineSegments } from '../src/client/diff.js'

function text(lines) {
  return lines.join('\n') + '\n'
}

test('contentLines normalizes CRLF so history replay can locate hunks', () => {
  assert.deepEqual(contentLines('alpha\r\nbeta\r\n'), ['alpha', 'beta'])
  assert.deepEqual(contentLines('alpha\nbeta\n'), ['alpha', 'beta'])
  assert.deepEqual(contentLines(''), [])
})

test('lineSegments highlights only the changed tokens of a replaced line', () => {
  const segments = lineSegments('const total = price * quantity', 'const total = price * quantity * taxRate')
  assert.ok(segments)
  const oldText = segments.old.map(part => part.text).join('')
  const newText = segments.new.map(part => part.text).join('')
  assert.equal(oldText, 'const total = price * quantity')
  assert.equal(newText, 'const total = price * quantity * taxRate')
  assert.deepEqual(
    segments.new.filter(part => part.changed).map(part => part.text),
    [' * taxRate'],
  )
  assert.deepEqual(
    segments.old.filter(part => part.changed).map(part => part.text),
    [],
  )
})

test('replacement blocks attach segments to paired lines and keep extra lines plain', () => {
  const diff = diffText(text(['alpha 1', 'beta 2']), text(['alpha 10', 'beta 20', 'extra line']))
  const rows = diff.hunks.flatMap(hunk => hunk.rows)
  assert.equal(rows.filter(row => row.segments !== undefined).length, 4)
  assert.equal(rows.filter(row => row.kind === 'add' && row.segments === undefined).length, 1)
})

test('a fully replaced expression highlights as one continuous band', () => {
  const segments = lineSegments(
    '/** Sum every line, then apply discount rules in order. */',
    '/** Format a computed total for one locale, currency included. */',
  )
  assert.ok(segments)
  // Shared spaces/punctuation sit inside the replaced region; only one changed
  // run may remain, otherwise the intra-line highlight looks like a row of
  // separate word blocks.
  assert.deepEqual(segments.old.filter(part => part.changed).map(part => part.text), [
    'Sum every line, then apply discount rules in order',
  ])
  assert.deepEqual(segments.new.filter(part => part.changed).map(part => part.text), [
    'Format a computed total for one locale, currency included',
  ])
})

test('shared operators and spaces never split one replaced expression', () => {
  const segments = lineSegments('return left + right', 'return head + tail')
  assert.ok(segments)
  assert.deepEqual(segments.old.filter(part => part.changed).map(part => part.text), ['left + right'])
  assert.deepEqual(segments.new.filter(part => part.changed).map(part => part.text), ['head + tail'])
})

test('a genuinely shared word still separates two changed highlights', () => {
  const segments = lineSegments('alpha one beta', 'gamma one delta')
  assert.ok(segments)
  assert.deepEqual(segments.new.filter(part => part.changed).map(part => part.text), ['gamma', 'delta'])
  assert.deepEqual(segments.old.filter(part => part.changed).map(part => part.text), ['alpha', 'beta'])
})

test('alignment noise on shared whitespace/punctuation never becomes a changed fragment', () => {
  // Real pair from the plugin README fix: the old line is a token subsequence of
  // the new one, so a naive token LCS flags shared spaces/punctuation as
  // "changed" and the deleted row looks speckled, as if fragments had moved.
  const oldText = '- 不 shadow  的 tool-call 条目（官方 Tool 层拥有该条目并声明  子槽），只通过 keyed  注册接管已登记的工具行；未登记工具沿用官方通用行'
  const newText = '- 不 shadow `conversation.chat.node` 的 tool-call 条目（官方 Tool 层拥有该条目并声明 `tool.call.toolview` 子槽，重复声明会抛错），只通过 keyed `tool.call.toolview` 注册接管已登记的工具行；未登记工具沿用官方通用行'
  const segments = lineSegments(oldText, newText)
  assert.ok(segments)
  assert.deepEqual(segments.old.filter(part => part.changed).map(part => part.text), [])
  const changedNew = segments.new.filter(part => part.changed).map(part => part.text)
  assert.equal(changedNew.length, 4)
  for (const part of changedNew) {
    assert.match(part, /[\p{L}\p{N}]/u, `fragment ${JSON.stringify(part)} must carry real content`)
  }
  assert.ok(changedNew[0].includes('conversation.chat.node'))
  assert.ok(changedNew.some(part => part.includes('重复声明会抛错')))
})

test('a whitespace-only edit produces no fragment highlight', () => {
  const segments = lineSegments('alpha  beta', 'alpha beta')
  assert.ok(segments)
  assert.deepEqual(segments.old.filter(part => part.changed), [])
  assert.deepEqual(segments.new.filter(part => part.changed), [])
})

test('pure multi-line moves get full old/new line ranges', () => {
  const before = ['alpha one', 'beta two', 'gamma three', 'delta four', 'epsilon five', 'zeta six', 'eta seven', 'theta eight']
  const after = ['alpha one', 'beta two', 'epsilon five', 'zeta six', 'gamma three', 'delta four', 'eta seven', 'theta eight']
  const diff = diffText(text(before), text(after))
  const rows = diff.hunks.flatMap(hunk => hunk.rows)
  const removed = rows.find(row => row.kind === 'del' && row.text === 'gamma three')
  const added = rows.find(row => row.kind === 'add' && row.text === 'gamma three')
  assert.deepEqual(removed.move, { kind: 'to', line: 5, endLine: 6 })
  assert.deepEqual(added.move, { kind: 'from', line: 3, endLine: 4 })
})

test('a single moved Chinese line is annotated like a substantial ASCII one', () => {
  const before = ['alpha one', '中文说明这一行', 'beta two', 'gamma three', 'delta four', 'epsilon five', 'zeta six', 'eta seven']
  const after = ['alpha one', 'beta two', 'gamma three', 'delta four', 'epsilon five', 'zeta six', '中文说明这一行', 'eta seven']
  const diff = diffText(text(before), text(after))
  const rows = diff.hunks.flatMap(hunk => hunk.rows)
  const removed = rows.find(row => row.kind === 'del' && row.text === '中文说明这一行')
  const added = rows.find(row => row.kind === 'add' && row.text === '中文说明这一行')
  assert.ok(removed, 'deleted line must be present')
  assert.ok(added, 'added line must be present')
  assert.ok(removed.move !== undefined, 'deleted Chinese line should carry a move hint')
  assert.ok(added.move !== undefined, 'added Chinese line should carry a move hint')
})

test('passive shifts expose old→new ranges and the shift amount', () => {
  const before = Array.from({ length: 40 }, (_, i) => `line ${i + 1}`)
  const after = [...before]
  after.splice(25, 2)
  after[37] = 'line 38 changed'
  const diff = diffText(text(before), text(after))
  assert.equal(diff.hunks.length, 2)
  const gap = diff.hunks[1].gapBefore
  assert.ok(gap)
  assert.equal(gap.shift, -2)
  assert.equal(gap.newStart - gap.oldStart, -2)
  assert.equal(gap.count, gap.newEnd - gap.newStart + 1)
  assert.equal(gap.count, gap.oldEnd - gap.oldStart + 1)
})

test('every row keeps its exact old/new line number', () => {
  const before = Array.from({ length: 30 }, (_, i) => `l${i + 1}`)
  const after = [...before]
  after.splice(4, 2)
  after.splice(20, 0, 'inserted A', 'inserted B')
  after[26] = 'l25 changed'
  const diff = diffText(text(before), text(after))
  const seenOld = new Set()
  const seenNew = new Set()
  for (const row of diff.rows) {
    if (row.kind !== 'add') {
      assert.equal(before[row.oldNo - 1], row.text)
      seenOld.add(row.oldNo)
    }
    if (row.kind !== 'del') {
      assert.equal(after[row.newNo - 1], row.text)
      seenNew.add(row.newNo)
    }
  }
  assert.equal(seenOld.size, before.length)
  assert.equal(seenNew.size, after.length)
})

test('gutter legend only labels line-number sides the hunk actually fills', () => {
  // A file emptied by the edit: every row is a deletion, no new line numbers.
  const deletion = diffText(text(['a', 'b', 'c']), '')
  assert.deepEqual(deletion.hunks[0].rows.map(row => row.kind), ['del', 'del', 'del'])
  assert.deepEqual(gutterSides(deletion.hunks[0]), { old: true, new: false })

  // A brand-new file: every row is an addition, no old line numbers.
  const creation = diffText('', text(['x', 'y']))
  assert.deepEqual(creation.hunks[0].rows.map(row => row.kind), ['add', 'add'])
  assert.deepEqual(gutterSides(creation.hunks[0]), { old: false, new: true })

  // A normal line replacement fills both gutters.
  const mixed = diffText(text(['a', 'b']), text(['a', 'B']))
  assert.deepEqual(gutterSides(mixed.hunks[0]), { old: true, new: true })
})

test('deletion / insertion hunks with context rows keep both gutter labels', () => {
  // Context rows carry numbers on both sides, so the "old / new" legend stays
  // meaningful even when every change is on one side.
  const deletion = diffText(text(['a', 'b', 'c', 'd', 'e']), text(['a', 'e']))
  assert.deepEqual(deletion.hunks[0].rows.map(row => row.kind), ['ctx', 'del', 'del', 'del', 'ctx'])
  assert.deepEqual(gutterSides(deletion.hunks[0]), { old: true, new: true })

  const insertion = diffText(text(['a', 'e']), text(['a', 'x', 'y', 'e']))
  assert.deepEqual(insertion.hunks[0].rows.map(row => row.kind), ['ctx', 'add', 'add', 'ctx'])
  assert.deepEqual(gutterSides(insertion.hunks[0]), { old: true, new: true })
})

test('gutter legend drops both labels when a hunk has no line numbers', () => {
  // Preview / history hunks whose numbers were stripped render no legend.
  const fragment = { rows: [{ kind: 'add', oldNo: null, newNo: null }] }
  assert.deepEqual(gutterSides(fragment), { old: false, new: false })
  assert.deepEqual(gutterSides(null), { old: false, new: false })
})
