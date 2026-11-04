import test from 'node:test'
import assert from 'node:assert/strict'
import { diffText, lineSegments } from '../src/client/diff.js'

function text(lines) {
  return lines.join('\n') + '\n'
}

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
