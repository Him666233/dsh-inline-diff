/**
 * Syntax-highlighting tokens for the inline diff cards.
 *
 * highlight.js renders one HTML string per file side; the card needs tokens per
 * visible row instead. This module highlights each available side once, parses
 * the `<span class="hljs-*">` markup back into `{ text, g }` runs (splitting
 * multi-line scopes at `\n`, decoding entities, merging adjacent same-group
 * runs), and exposes O(1) row lookup through a WeakMap-cached handle.
 *
 * Two data sources are supported:
 *  - full snapshots (`diff.beforeText` / `diff.afterText` are strings): each
 *    side is highlighted once and indexed by the row's line number;
 *  - history-replay meta diffs (`beforeText === null`): each hunk's old/new
 *    line sequences are highlighted locally and cached on the hunk.
 *
 * Deliberately dependency-light: only `contentLines` is shared with the diff
 * engine, so the module can be imported directly by `node --test`.
 */

import hljs from 'highlight.js/lib/core'
import asciidoc from 'highlight.js/lib/languages/asciidoc'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import clojure from 'highlight.js/lib/languages/clojure'
import cmake from 'highlight.js/lib/languages/cmake'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import crystal from 'highlight.js/lib/languages/crystal'
import d from 'highlight.js/lib/languages/d'
import dart from 'highlight.js/lib/languages/dart'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import dos from 'highlight.js/lib/languages/dos'
import elixir from 'highlight.js/lib/languages/elixir'
import erlang from 'highlight.js/lib/languages/erlang'
import fortran from 'highlight.js/lib/languages/fortran'
import fsharp from 'highlight.js/lib/languages/fsharp'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import groovy from 'highlight.js/lib/languages/groovy'
import haskell from 'highlight.js/lib/languages/haskell'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import julia from 'highlight.js/lib/languages/julia'
import kotlin from 'highlight.js/lib/languages/kotlin'
import latex from 'highlight.js/lib/languages/latex'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import nim from 'highlight.js/lib/languages/nim'
import objectivec from 'highlight.js/lib/languages/objectivec'
import ocaml from 'highlight.js/lib/languages/ocaml'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import powershell from 'highlight.js/lib/languages/powershell'
import protobuf from 'highlight.js/lib/languages/protobuf'
import python from 'highlight.js/lib/languages/python'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scala from 'highlight.js/lib/languages/scala'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import vbnet from 'highlight.js/lib/languages/vbnet'
import vbscript from 'highlight.js/lib/languages/vbscript'
import vim from 'highlight.js/lib/languages/vim'
import x86asm from 'highlight.js/lib/languages/x86asm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { contentLines } from './diff.js'
import { LANGUAGES } from './languages.js'

/** Grammar modules keyed by highlight.js grammar name (not registry id). */
const GRAMMARS = Object.freeze({
  asciidoc,
  bash,
  c,
  clojure,
  cmake,
  cpp,
  csharp,
  css,
  crystal,
  d,
  dart,
  diff,
  dockerfile,
  dos,
  elixir,
  erlang,
  fortran,
  fsharp,
  go,
  graphql,
  groovy,
  haskell,
  ini,
  java,
  javascript,
  json,
  julia,
  kotlin,
  latex,
  less,
  lua,
  makefile,
  markdown,
  nginx,
  nim,
  objectivec,
  ocaml,
  perl,
  php,
  powershell,
  protobuf,
  python,
  r,
  ruby,
  rust,
  scala,
  scss,
  sql,
  swift,
  typescript,
  vbnet,
  vbscript,
  vim,
  x86asm,
  xml,
  yaml,
})

/** Language registry id -> entry, for highlight.js registration. */
const LANGUAGE_BY_ID = new Map(LANGUAGES.map(entry => [entry.id, entry]))

/** Whole-side budget: larger files fall back to no highlighting at all. */
const MAX_SIDE_TEXT_LENGTH = 200_000
const MAX_SIDE_LINES = 4000
/** A single rendered line longer than this is not tokenized. */
const MAX_TOKEN_LINE_LENGTH = 2000

// ---------------------------------------------------------------------------
// highlight.js registration
// ---------------------------------------------------------------------------

/** Register one registry language with the grammar named by `entry.hljs ?? id`. */
function registerLanguageEntry(entry) {
  const grammar = GRAMMARS[entry.hljs ?? entry.id]
  if (typeof grammar !== 'function') return false
  try {
    if (!hljs.getLanguage(entry.id)) hljs.registerLanguage(entry.id, grammar)
  } catch {
    // A broken grammar must never take the whole card down; it just means this
    // language renders with the default foreground colour.
    return false
  }
  return Boolean(hljs.getLanguage(entry.id))
}

// Register eagerly so nested sub-languages (e.g. markdown/HTML embedding
// JavaScript and CSS) resolve regardless of which language a diff needs first.
for (const entry of LANGUAGES) registerLanguageEntry(entry)

/** Make sure the requested registry id is available to highlight.js. */
function ensureLanguage(languageId) {
  const entry = LANGUAGE_BY_ID.get(languageId)
  if (!entry) return false
  if (hljs.getLanguage(languageId)) return true
  return registerLanguageEntry(entry)
}

// ---------------------------------------------------------------------------
// highlight.js class -> token group
// ---------------------------------------------------------------------------

/**
 * Token group of a highlight.js scope class attribute. Handles sub-scope
 * classes such as `hljs-title class_` (two classes on one span) and falls back
 * to `var` (no colour override) for anything unmapped.
 *
 * Groups: kw | str | num | fn | type | prop | com | meta | tag | attr | op |
 * punct | head | link | lit | emph | var.
 */
function groupForClass(className) {
  if (typeof className !== 'string' || className === '') return 'var'
  const parts = className
    .trim()
    .toLowerCase()
    .split(/[\s.]+/)
    .map(part => (part.startsWith('hljs-') ? part.slice(5) : part))
    .filter(part => part !== '')
  if (parts.length === 0) return 'var'
  const primary = parts[0]
  const modifiers = parts.length > 1 ? parts.slice(1) : []
  if (primary === 'title' && modifiers.includes('class_')) return 'type'
  if (primary === 'title' && modifiers.includes('function_')) return 'fn'
  if (primary === 'variable' && modifiers.includes('language_')) return 'kw'
  return PRIMARY_GROUPS.get(primary) ?? 'var'
}

/** Single-class highlight.js scope -> group. */
const PRIMARY_GROUPS = new Map([
  // keywords / control flow
  ['keyword', 'kw'],
  ['selector-tag', 'kw'],
  ['selector-class', 'kw'],
  ['selector-id', 'kw'],
  ['meta-keyword', 'kw'],
  ['doctag', 'kw'],
  // strings / regexps / template text
  ['string', 'str'],
  ['char', 'str'],
  ['regexp', 'str'],
  ['attr-value', 'str'],
  ['meta-string', 'str'],
  ['template-string', 'str'],
  ['code', 'str'],
  // numbers / constants
  ['number', 'num'],
  ['literal', 'num'],
  ['symbol', 'num'],
  ['bullet', 'num'],
  // functions / types
  ['function', 'fn'],
  ['function_', 'fn'],
  ['title', 'fn'],
  ['built_in', 'type'],
  ['type', 'type'],
  ['class-name', 'type'],
  ['class_', 'type'],
  // properties / attributes / variables
  ['attr', 'prop'],
  ['attribute', 'prop'],
  ['property', 'prop'],
  ['variable', 'prop'],
  ['language_', 'kw'],
  ['params', 'prop'],
  ['template-variable', 'prop'],
  ['subst', 'prop'],
  ['selector-attr', 'prop'],
  // comments
  ['comment', 'com'],
  ['quote', 'com'],
  // meta / annotations / preprocessor
  ['meta', 'meta'],
  // diff grammar markers: never red/green semantics, just meta
  ['addition', 'meta'],
  ['deletion', 'meta'],
  // tags / headings
  ['tag', 'tag'],
  ['name', 'tag'],
  ['section', 'head'],
  // operators / punctuation
  ['operator', 'op'],
  ['punctuation', 'punct'],
  // emphasis / links
  ['emphasis', 'emph'],
  ['strong', 'emph'],
  ['link', 'link'],
])

// ---------------------------------------------------------------------------
// HTML -> per-line token runs
// ---------------------------------------------------------------------------

const NAMED_ENTITIES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', '\u00a0'],
])

/** Decode one `&...;` entity; null when it is not a known/valid entity. */
function decodeEntity(entity) {
  const body = entity.slice(1, -1)
  if (body === '') return null
  if (body.charCodeAt(0) === 35 /* # */) {
    const hex = body.length > 1 && (body[1] === 'x' || body[1] === 'X')
    const digits = hex ? body.slice(2) : body.slice(1)
    if (digits === '') return null
    const valid = hex ? /^[0-9a-fA-F]+$/.test(digits) : /^[0-9]+$/.test(digits)
    if (!valid) return null
    const codePoint = Number.parseInt(digits, hex ? 16 : 10)
    if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return null
    try {
      return String.fromCodePoint(codePoint)
    } catch {
      return null
    }
  }
  const named = NAMED_ENTITIES.get(body.toLowerCase())
  return named !== undefined ? named : null
}

/** Concatenated text of one token line. */
function lineText(tokens) {
  let text = ''
  for (const token of tokens) text += token.text
  return text
}

/**
 * Parse a highlight.js HTML string into `lines: {text,g}[][]`.
 * Uses a stack for nested spans, decodes the entities highlight.js emits
 * (`&amp; &lt; &gt; &quot; &#x27;`), splits text at `\n` and merges adjacent
 * runs of the same group.
 */
function parseHighlightedHtml(html) {
  const lines = [[]]
  /** @type {{ group: string }[]} */
  const stack = []

  const pushToken = (text, group) => {
    if (text === '') return
    const line = lines[lines.length - 1]
    const previous = line[line.length - 1]
    if (previous !== undefined && previous.g === group) previous.text += text
    else line.push({ text, g: group })
  }

  const appendText = text => {
    if (text === '') return
    const group = stack.length > 0 ? stack[stack.length - 1].group : 'var'
    let start = 0
    for (let index = 0; index < text.length; index++) {
      if (text.charCodeAt(index) !== 10 /* \n */) continue
      pushToken(text.slice(start, index), group)
      lines.push([])
      start = index + 1
    }
    pushToken(text.slice(start), group)
  }

  let index = 0
  const length = html.length
  while (index < length) {
    const charCode = html.charCodeAt(index)
    if (charCode === 60 /* < */) {
      const end = html.indexOf('>', index + 1)
      if (end === -1) break
      const tag = html.slice(index, end + 1)
      index = end + 1
      if (tag.startsWith('</')) {
        if (stack.length > 0) stack.pop()
        continue
      }
      if (!/^<span\b/i.test(tag)) continue
      const match = /class\s*=\s*"([^"]*)"/i.exec(tag) ?? /class\s*=\s*'([^']*)'/i.exec(tag)
      const className = match ? match[1] : ''
      stack.push({ group: groupForClass(className) })
      continue
    }
    if (charCode === 38 /* & */) {
      const semicolon = html.indexOf(';', index + 1)
      if (semicolon !== -1 && semicolon - index <= 12) {
        const entity = html.slice(index, semicolon + 1)
        const decoded = decodeEntity(entity)
        if (decoded !== null) {
          appendText(decoded)
          index = semicolon + 1
          continue
        }
      }
      appendText('&')
      index += 1
      continue
    }
    let next = index + 1
    while (next < length) {
      const code = html.charCodeAt(next)
      if (code === 60 || code === 38) break
      next += 1
    }
    appendText(html.slice(index, next))
    index = next
  }

  return lines
}

/**
 * Highlight `code` and return one token line per source line.
 * Returns null on any parser/grammar failure or when the re-assembled lines do
 * not exactly reproduce the source text (the card then renders plain text).
 */
function highlightLines(code, sourceLines, languageId) {
  if (sourceLines.length === 0) return []
  if (code.length > MAX_SIDE_TEXT_LENGTH || sourceLines.length > MAX_SIDE_LINES) return null
  let html
  try {
    const result = hljs.highlight(code, { language: languageId, ignoreIllegals: true })
    html = result?.value
  } catch {
    return null
  }
  if (typeof html !== 'string') return null
  let parsed
  try {
    parsed = parseHighlightedHtml(html)
  } catch {
    return null
  }
  if (parsed.length !== sourceLines.length) return null
  for (let line = 0; line < parsed.length; line++) {
    if (lineText(parsed[line]) !== sourceLines[line]) return null
  }
  return parsed
}

/** Prepared full-text side: `present` distinguishes missing from budget-blocked. */
function prepareFullSide(text) {
  if (typeof text !== 'string') {
    return { present: false, withinBudget: true, lines: null, code: '' }
  }
  const lines = contentLines(text)
  if (text.length > MAX_SIDE_TEXT_LENGTH || lines.length > MAX_SIDE_LINES) {
    return { present: true, withinBudget: false, lines, code: '' }
  }
  return { present: true, withinBudget: true, lines, code: lines.join('\n') }
}

// ---------------------------------------------------------------------------
// Hunk-local highlighting (history-replay meta diffs)
// ---------------------------------------------------------------------------

/** WeakMap<hunk, Map<languageId, {old,new} | null>>. */
const HUNK_TOKEN_CACHE = new WeakMap()

/** Old/new line texts of a hunk, or null when the rows are malformed. */
function hunkSideTexts(hunk) {
  const rows = hunk.rows
  if (!Array.isArray(rows) || rows.length === 0) return null
  const oldLines = []
  const newLines = []
  for (const row of rows) {
    if (row === null || typeof row !== 'object' || typeof row.text !== 'string') return null
    if (row.text.includes('\n')) return null
    if (row.kind !== 'add') oldLines.push(row.text)
    if (row.kind !== 'del') newLines.push(row.text)
  }
  return { oldLines, newLines }
}

/** Highlight + cache both local sides of one hunk for one language id. */
function hunkTokensFor(hunk, languageId) {
  let byLanguage = HUNK_TOKEN_CACHE.get(hunk)
  if (!byLanguage) {
    byLanguage = new Map()
    HUNK_TOKEN_CACHE.set(hunk, byLanguage)
  }
  if (byLanguage.has(languageId)) return byLanguage.get(languageId)
  let entry = null
  const sideTexts = hunkSideTexts(hunk)
  if (sideTexts !== null) {
    const oldCode = sideTexts.oldLines.join('\n')
    const newCode = sideTexts.newLines.join('\n')
    const oldLines = highlightLines(oldCode, sideTexts.oldLines, languageId)
    const newLines = highlightLines(newCode, sideTexts.newLines, languageId)
    if (oldLines !== null || newLines !== null) entry = { old: oldLines, new: newLines }
  }
  byLanguage.set(languageId, entry)
  return entry
}

/** Index of `row` in the old/new line sequence of its hunk; -1 when absent. */
function rowIndexInHunk(hunk, row, side) {
  const rows = hunk.rows
  if (!Array.isArray(rows)) return -1
  let oldIndex = 0
  let newIndex = 0
  for (const candidate of rows) {
    if (candidate === row) return side === 'old' ? oldIndex : newIndex
    if (candidate === null || typeof candidate !== 'object') continue
    if (candidate.kind !== 'add') oldIndex += 1
    if (candidate.kind !== 'del') newIndex += 1
  }
  return -1
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** WeakMap<diff, Map<languageId, highlighter | null>>. */
const DIFF_CACHE = new WeakMap()

/**
 * Build (or reuse) the highlighter handle for one `(diff, languageId)` pair.
 * Returns null when the language is unknown/plain text, when no text can be
 * highlighted, or when a whole side is over the size budget.
 *
 * @param {object} diff Card diff model (see diff.js).
 * @param {string} languageId Registry id from `detectLanguage`.
 * @returns {object | null}
 */
export function getDiffHighlighter(diff, languageId) {
  try {
    if (diff === null || typeof diff !== 'object') return null
    if (typeof languageId !== 'string' || languageId === '' || languageId === 'plaintext') return null
    let byLanguage = DIFF_CACHE.get(diff)
    if (!byLanguage) {
      byLanguage = new Map()
      DIFF_CACHE.set(diff, byLanguage)
    }
    if (byLanguage.has(languageId)) return byLanguage.get(languageId)
    const highlighter = buildHighlighter(diff, languageId)
    byLanguage.set(languageId, highlighter)
    return highlighter
  } catch {
    return null
  }
}

/** Create one immutable-by-convention highlighter handle. */
function buildHighlighter(diff, languageId) {
  if (!ensureLanguage(languageId)) return null
  const oldSide = prepareFullSide(diff.beforeText)
  const newSide = prepareFullSide(diff.afterText)
  if (!oldSide.withinBudget || !newSide.withinBudget) return null
  const hasFullText = oldSide.present || newSide.present
  if (hasFullText) {
    const oldLines = oldSide.present ? highlightLines(oldSide.code, oldSide.lines, languageId) : null
    const newLines = newSide.present ? highlightLines(newSide.code, newSide.lines, languageId) : null
    if (oldLines === null && newLines === null) return null
    return { languageId, mode: 'full', oldLines, newLines }
  }
  const hunks = Array.isArray(diff.hunks) ? diff.hunks : []
  const hasRows = hunks.some(hunk => hunk !== null && typeof hunk === 'object' && Array.isArray(hunk.rows) && hunk.rows.length > 0)
  if (!hasRows) return null
  return { languageId, mode: 'meta', oldLines: null, newLines: null }
}

/**
 * Token array for one rendered row.
 *
 * The concatenated `text` of the returned tokens always equals `row.text`;
 * whenever that cannot be guaranteed the function returns null (the card then
 * keeps the plain default foreground colour). Never throws.
 *
 * @param {object | null} highlighter Handle from {@link getDiffHighlighter}.
 * @param {object | null} hunk Hunk the row belongs to, or null in full-view mode.
 * @param {{ kind?:string, text:string, oldNo?:number|null, newNo?:number|null }} row
 * @param {'old' | 'new'} side
 * @returns {{ text:string, g:string }[] | null}
 */
export function tokensForRow(highlighter, hunk, row, side) {
  try {
    if (highlighter === null || typeof highlighter !== 'object') return null
    if (row === null || typeof row !== 'object' || typeof row.text !== 'string') return null
    if (row.text.length > MAX_TOKEN_LINE_LENGTH) return null
    const lineSide = side === 'old' ? 'old' : 'new'
    if (highlighter.mode === 'full') {
      const fromFullText = tokensFromFullText(highlighter, row, lineSide)
      if (fromFullText !== undefined) return fromFullText
    }
    if (hunk === null || typeof hunk !== 'object' || !Array.isArray(hunk.rows)) return null
    return tokensFromHunk(highlighter, hunk, row, lineSide)
  } catch {
    return null
  }
}

/** Line-number lookup against the highlighted full texts; undefined = miss. */
function tokensFromFullText(highlighter, row, side) {
  const lines = side === 'old' ? highlighter.oldLines : highlighter.newLines
  if (!Array.isArray(lines)) return undefined
  const lineNumber = side === 'old' ? row.oldNo : row.newNo
  if (!Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > lines.length) return undefined
  const tokens = lines[lineNumber - 1]
  if (!Array.isArray(tokens)) return undefined
  // Defensive: a hand-built or mismatched model must never yield wrong text.
  if (lineText(tokens) !== row.text) return undefined
  return tokens
}

/** Hunk-local lookup for meta diffs (and as a fallback for odd models). */
function tokensFromHunk(highlighter, hunk, row, side) {
  const languageId = highlighter.languageId
  if (typeof languageId !== 'string') return null
  const entry = hunkTokensFor(hunk, languageId)
  if (entry === null) return null
  const lines = side === 'old' ? entry.old : entry.new
  if (!Array.isArray(lines)) return null
  const index = rowIndexInHunk(hunk, row, side)
  if (index < 0 || index >= lines.length) return null
  const tokens = lines[index]
  if (!Array.isArray(tokens)) return null
  if (lineText(tokens) !== row.text) return null
  return tokens
}
