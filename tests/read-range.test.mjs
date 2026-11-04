import test from 'node:test'
import assert from 'node:assert/strict'
import { compressLineRanges, readRangesForBlock, readRangeLabels } from '../src/client/read-range.js'

function settled(fields) {
  return {
    kind: 'tool-result',
    callId: 'call-1',
    call: { name: 'read', argsRaw: JSON.stringify(fields.args ?? { file_path: 'a.js' }) },
    content: [],
    isError: false,
    meta: fields.meta === undefined ? null : fields.meta,
  }
}

test('compressLineRanges keeps contiguous and jumping ranges separate', () => {
  assert.deepEqual(compressLineRanges([1, 2, 3, 8, 9, 12]), [
    { start: 1, end: 3 },
    { start: 8, end: 9 },
    { start: 12, end: 12 },
  ])
  assert.deepEqual(compressLineRanges([42]), [{ start: 42, end: 42 }])
})

test('settled meta lines are authoritative, including a single line', () => {
  assert.deepEqual(readRangesForBlock(settled({ meta: { lines: [{ number: 400, text: 'x' }] } })), [{ start: 400, end: 400 }])
  assert.deepEqual(readRangesForBlock(settled({ meta: { lines: [{ number: 10, text: 'a' }, { number: 11, text: 'b' }] } })), [{ start: 10, end: 11 }])
})

test('jumping line sets become separate ranges', () => {
  assert.deepEqual(
    readRangesForBlock(settled({ meta: { lines: [1, 2, 3, 5, 7, 8].map(number => ({ number, text: String(number) })) } })),
    [{ start: 1, end: 3 }, { start: 5, end: 5 }, { start: 7, end: 8 }],
  )
})

test('running calls fall back to offset/limit arguments', () => {
  const running = (args) => ({ phase: 'start', name: 'read', callId: 'c', argsRaw: JSON.stringify(args) })
  assert.deepEqual(readRangesForBlock(running({ file_path: 'a.js', offset: 10, limit: 5 })), [{ start: 10, end: 14 }])
  assert.deepEqual(readRangesForBlock(running({ file_path: 'a.js', offset: 10 })), [{ start: 10, end: null }])
  assert.deepEqual(readRangesForBlock(running({ file_path: 'a.js', limit: 3 })), [{ start: 1, end: 3 }])
  assert.equal(readRangesForBlock(running({ file_path: 'a.js' })), null)
})

test('labels cover ranges, single lines, and open-ended reads', () => {
  const t = (key, values = {}) => (key === 'readFrom' ? `从 L${values.line} 起` : key)
  assert.equal(readRangeLabels([{ start: 1, end: 3 }, { start: 8, end: 8 }], t), 'L 1 – L 3 · L 8')
  assert.equal(readRangeLabels([{ start: 40, end: null }], t), '从 L40 起')
  assert.equal(readRangeLabels([], t), null)
})
