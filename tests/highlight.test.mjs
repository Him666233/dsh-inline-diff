import test from 'node:test'
import assert from 'node:assert/strict'
import { diffText, diffFromMeta } from '../src/client/diff.js'
import { getDiffHighlighter, tokensForRow } from '../src/client/highlight.js'
import { LANGUAGES } from '../src/client/languages.js'

/** Token group enum fixed by the spec (§5.2). */
const GROUPS = new Set([
  'kw',
  'str',
  'num',
  'fn',
  'type',
  'prop',
  'com',
  'meta',
  'tag',
  'attr',
  'op',
  'punct',
  'head',
  'link',
  'lit',
  'emph',
  'var',
])

function fileText(lines) {
  return lines.join('\n') + '\n'
}

/** Every token array must rebuild the row text exactly and use a valid group. */
function assertTokens(tokens, rowText, label = '') {
  assert.ok(Array.isArray(tokens), `${label} expected tokens for ${JSON.stringify(rowText)}`)
  assert.equal(tokens.map(token => token.text).join(''), rowText, `${label} token text mismatch`)
  for (const token of tokens) {
    assert.equal(typeof token.text, 'string')
    assert.ok(token.text.length > 0, `${label} empty token`)
    assert.ok(GROUPS.has(token.g), `${label} invalid token group ${token.g}`)
  }
}

function groupsOf(tokens) {
  return tokens.map(token => token.g)
}

/** All (hunk, row) pairs of a model. */
function allRows(diff) {
  return diff.hunks.flatMap(hunk => hunk.rows.map(row => ({ hunk, row })))
}

test('full snapshot: every row gets tokens that rebuild its text', () => {
  const before = fileText([
    '// header',
    'const x: number = 1',
    'let s = "hi <&> there"',
    '/* multi',
    '   line */',
    '',
  ])
  const after = fileText([
    '// header',
    'const x: number = 2',
    'let s = "changed"',
    '/* multi',
    '   line */',
    'const y = true',
  ])
  const diff = diffText(before, after)
  const highlighter = getDiffHighlighter(diff, 'typescript')
  assert.ok(highlighter)

  const rows = allRows(diff)
  assert.ok(rows.length > 0)
  for (const { hunk, row } of rows) {
    const side = row.kind === 'del' ? 'old' : 'new'
    assertTokens(tokensForRow(highlighter, hunk, row, side), row.text, `${row.kind} `)
  }
})

test('groups: keywords, strings, numbers, types, functions and comments are separated', () => {
  const code = fileText([
    '// note',
    'interface User { name: string }',
    'function greet(name: string): string {',
    '  return "hi, " + name',
    '}',
    'const count: number = 42',
  ])
  const diff = diffText(code, code)
  const highlighter = getDiffHighlighter(diff, 'typescript')
  const byText = new Map(diff.rows.map(row => [row.text, tokensForRow(highlighter, null, row, 'new')]))
  for (const row of diff.rows) assertTokens(byText.get(row.text), row.text)

  assert.deepEqual(groupsOf(byText.get('// note')), ['com'])

  const declaration = byText.get('const count: number = 42')
  assert.ok(declaration.some(token => token.g === 'kw' && token.text === 'const'))
  assert.ok(declaration.some(token => token.g === 'type'))
  assert.ok(declaration.some(token => token.g === 'num' && token.text === '42'))

  const signature = byText.get('function greet(name: string): string {')
  assert.ok(signature.some(token => token.g === 'kw' && token.text === 'function'))
  assert.ok(signature.some(token => token.g === 'fn' && token.text === 'greet'))

  const iface = byText.get('interface User { name: string }')
  assert.ok(iface.some(token => token.g === 'kw' && token.text === 'interface'))
  assert.ok(iface.some(token => token.g === 'type'))

  const returned = byText.get('  return "hi, " + name')
  assert.ok(returned.some(token => token.g === 'kw' && token.text === 'return'))
  assert.ok(returned.some(token => token.g === 'str' && token.text.includes('hi, ')))
})

test('multi-line scopes are split at the line boundary', () => {
  const code = fileText([
    '/* first',
    ' second */',
    'const tpl = `alpha',
    'beta`',
    'const done = 1',
  ])
  const diff = diffText(code, code)
  const highlighter = getDiffHighlighter(diff, 'typescript')
  const byText = new Map(diff.rows.map(row => [row.text, tokensForRow(highlighter, null, row, 'new')]))

  assert.deepEqual(groupsOf(byText.get('/* first')), ['com'])
  assert.deepEqual(groupsOf(byText.get(' second */')), ['com'])

  const templateStart = byText.get('const tpl = `alpha')
  const templateEnd = byText.get('beta`')
  assert.ok(templateStart.some(token => token.g === 'str' && token.text.includes('`alpha')))
  assert.ok(templateEnd.some(token => token.g === 'str'))
  assert.ok(templateEnd.every(token => token.g === 'str'))
})

test('escaped entities are decoded back to the source characters', () => {
  const code = fileText([
    '<div class="a" data-x="1">x &amp; y</div>',
    '<span title="a &quot;b&quot;">z &lt; 2</span>',
  ])
  const diff = diffText(code, code)
  const highlighter = getDiffHighlighter(diff, 'xml')
  assert.ok(highlighter)

  for (const row of diff.rows) {
    const tokens = tokensForRow(highlighter, null, row, 'new')
    assertTokens(tokens, row.text)
    assert.ok(tokens.some(token => token.g === 'tag'), 'expected a tag token')
  }
  const first = tokensForRow(highlighter, null, diff.rows[0], 'new')
  assert.ok(first.some(token => token.g === 'prop'))
  assert.ok(first.some(token => token.g === 'str'))
})

test('old and new sides are indexed independently', () => {
  const before = fileText(['const oldName = "before"', 'shared line'])
  const after = fileText(['const newName = "after"', 'shared line'])
  const diff = diffText(before, after)
  const highlighter = getDiffHighlighter(diff, 'typescript')
  assert.ok(highlighter)

  const rows = diff.hunks.flatMap(hunk => hunk.rows)
  const hunk = diff.hunks[0]
  const removed = rows.find(row => row.kind === 'del')
  const added = rows.find(row => row.kind === 'add')
  assert.ok(removed && added)

  const removedTokens = tokensForRow(highlighter, hunk, removed, 'old')
  assertTokens(removedTokens, removed.text)
  assert.ok(removedTokens.some(token => token.g === 'str' && token.text.includes('before')))

  const addedTokens = tokensForRow(highlighter, hunk, added, 'new')
  assertTokens(addedTokens, added.text)
  assert.ok(addedTokens.some(token => token.g === 'str' && token.text.includes('after')))
})

test('context rows work from either side and empty lines yield an empty array', () => {
  const before = fileText(['alpha', '', 'const shared = 1', 'omega'])
  const after = fileText(['beta', '', 'const shared = 1', 'omega'])
  const diff = diffText(before, after)
  const highlighter = getDiffHighlighter(diff, 'typescript')
  assert.ok(highlighter)

  const rows = diff.hunks.flatMap(hunk => hunk.rows)
  const emptyRow = rows.find(row => row.kind === 'ctx' && row.text === '')
  assert.ok(emptyRow)
  assert.deepEqual(tokensForRow(highlighter, diff.hunks[0], emptyRow, 'old'), [])
  assert.deepEqual(tokensForRow(highlighter, diff.hunks[0], emptyRow, 'new'), [])

  const context = rows.find(row => row.kind === 'ctx' && row.text === 'const shared = 1')
  assert.ok(context)
  const fromOld = tokensForRow(highlighter, diff.hunks[0], context, 'old')
  const fromNew = tokensForRow(highlighter, diff.hunks[0], context, 'new')
  assertTokens(fromOld, context.text)
  assertTokens(fromNew, context.text)
  assert.ok(fromOld.some(token => token.g === 'kw'))
})

test('history-replay meta diffs are tokenized inside each hunk', () => {
  const before = fileText(['// note', 'const a = 1', 'let s = "q"'])
  const after = fileText(['// note', 'const b = 2', 'let s = "q"'])
  const meta = diffFromMeta([{ path: 'sample.ts', oldText: before, newText: after }], null)
  assert.equal(meta.beforeText, null)
  assert.equal(meta.afterText, null)

  const highlighter = getDiffHighlighter(meta, 'typescript')
  assert.ok(highlighter)
  const hunk = meta.hunks[0]
  assert.ok(hunk)

  for (const row of hunk.rows) {
    const side = row.kind === 'del' ? 'old' : 'new'
    const tokens = tokensForRow(highlighter, hunk, row, side)
    assertTokens(tokens, row.text, `meta ${row.kind} `)
  }

  const removed = hunk.rows.find(row => row.kind === 'del')
  const added = hunk.rows.find(row => row.kind === 'add')
  assert.ok(removed && added)
  assert.ok(tokensForRow(highlighter, hunk, removed, 'old').some(token => token.g === 'kw'))
  assert.ok(tokensForRow(highlighter, hunk, added, 'new').some(token => token.g === 'kw'))

  const context = hunk.rows.find(row => row.kind === 'ctx')
  assert.ok(context)
  assertTokens(tokensForRow(highlighter, hunk, context, 'old'), context.text)
  assertTokens(tokensForRow(highlighter, hunk, context, 'new'), context.text)

  // A row that does not belong to the hunk cannot be located.
  assert.equal(
    tokensForRow(highlighter, hunk, { kind: 'add', text: 'nope', oldNo: null, newNo: 1 }, 'new'),
    null,
  )
  // Repeated lookups reuse the cached hunk tokenization.
  assert.equal(
    tokensForRow(highlighter, hunk, hunk.rows[0], 'old'),
    tokensForRow(highlighter, hunk, hunk.rows[0], 'old'),
  )
})

test('highlighter handles are cached per (diff, language)', () => {
  const diff = diffText('const a = 1\n', 'const b = 2\n')
  const first = getDiffHighlighter(diff, 'typescript')
  assert.ok(first)
  assert.equal(getDiffHighlighter(diff, 'typescript'), first)
  assert.notEqual(getDiffHighlighter(diff, 'javascript'), first)
  assert.equal(getDiffHighlighter(diff, 'plaintext'), null)
  assert.equal(getDiffHighlighter(diff, 'not-a-language'), null)
})

test('plain text, unknown languages and invalid diffs produce no highlighter', () => {
  const diff = diffText('const a = 1\n', 'const b = 2\n')
  assert.equal(getDiffHighlighter(diff, 'plaintext'), null)
  assert.equal(getDiffHighlighter(diff, ''), null)
  assert.equal(getDiffHighlighter(diff, null), null)
  assert.equal(getDiffHighlighter(diff, undefined), null)
  assert.equal(getDiffHighlighter(undefined, 'typescript'), null)
  assert.equal(getDiffHighlighter(null, 'typescript'), null)
  assert.equal(getDiffHighlighter(42, 'typescript'), null)
  assert.equal(getDiffHighlighter({}, 'typescript'), null)
  assert.equal(getDiffHighlighter({ beforeText: null, afterText: null, hunks: [] }, 'typescript'), null)
})

test('budgets: oversized sides disable highlighting entirely', () => {
  const longSide = {
    beforeText: '',
    afterText: 'x'.repeat(200_001),
    hunks: [],
  }
  assert.equal(getDiffHighlighter(longSide, 'typescript'), null)

  const manyLines = Array.from({ length: 4001 }, (_, index) => `line ${index}`).join('\n')
  assert.equal(
    getDiffHighlighter({ beforeText: '', afterText: manyLines, hunks: [] }, 'typescript'),
    null,
  )

  // Just under the per-line token budget the rest of the file still highlights.
  const diff = diffText('', 'const a = 1\nshort line\n')
  const highlighter = getDiffHighlighter(diff, 'typescript')
  assert.ok(highlighter)
  const longRow = { kind: 'add', text: 'a'.repeat(2001), oldNo: null, newNo: 1 }
  assert.equal(tokensForRow(highlighter, null, longRow, 'new'), null)
  const shortRow = diff.rows.find(row => row.text === 'short line')
  assert.ok(shortRow)
  assertTokens(tokensForRow(highlighter, null, shortRow, 'new'), shortRow.text)
})

test('diff grammar additions/deletions map to meta, never to add/del colours', () => {
  const patch = fileText(['+added line', '-removed line', ' context line'])
  const diff = diffText('', patch)
  const highlighter = getDiffHighlighter(diff, 'diff')
  assert.ok(highlighter)
  const hunk = diff.hunks[0]

  for (const row of hunk.rows) {
    const tokens = tokensForRow(highlighter, hunk, row, row.kind === 'del' ? 'old' : 'new')
    assertTokens(tokens, row.text)
  }

  const added = hunk.rows.find(row => row.text === '+added line')
  const removed = hunk.rows.find(row => row.text === '-removed line')
  assert.deepEqual(groupsOf(tokensForRow(highlighter, hunk, added, 'new')), ['meta'])
  assert.deepEqual(groupsOf(tokensForRow(highlighter, hunk, removed, 'new')), ['meta'])
})

test('tokensForRow validates the row text instead of returning wrong tokens', () => {
  const diff = diffText('const alpha = 1\n', 'const beta = 2\n')
  const highlighter = getDiffHighlighter(diff, 'typescript')
  assert.ok(highlighter)

  // Correct text but unknown line number and no hunk: cannot be located.
  assert.equal(
    tokensForRow(highlighter, null, { kind: 'add', text: 'const beta = 2', oldNo: null, newNo: null }, 'new'),
    null,
  )
  // Known line number but mismatched text: fallback must not emit wrong tokens.
  assert.equal(
    tokensForRow(highlighter, null, { kind: 'add', text: 'const hacked = 2', oldNo: null, newNo: 1 }, 'new'),
    null,
  )
  // Malformed arguments never throw.
  assert.equal(tokensForRow(null, null, { text: 'x' }, 'new'), null)
  assert.equal(tokensForRow(highlighter, null, null, 'new'), null)
  assert.equal(tokensForRow(highlighter, null, { text: 42 }, 'new'), null)
  assert.equal(tokensForRow(highlighter, undefined, { text: 'x' }, 'new'), null)
  // Default side is 'new'; the deleted row has no new number, so it must miss.
  assert.equal(tokensForRow(highlighter, null, diff.rows[0]), null)
})

test('every registered language highlights a small file end to end', () => {
  const sample = fileText(['alpha beta gamma', 'second line 42', 'third "quoted" & <tag> line'])
  const diff = diffText(sample, sample + 'fourth line\n')
  for (const language of LANGUAGES) {
    const highlighter = getDiffHighlighter(diff, language.id)
    assert.ok(highlighter, `no highlighter for ${language.id}`)
    let tokenCount = 0
    for (const { hunk, row } of allRows(diff)) {
      const tokens = tokensForRow(highlighter, hunk, row, row.kind === 'del' ? 'old' : 'new')
      assertTokens(tokens, row.text, `${language.id}: `)
      tokenCount += tokens.length
    }
    assert.ok(tokenCount > 0, `${language.id} produced no tokens`)
  }
})
