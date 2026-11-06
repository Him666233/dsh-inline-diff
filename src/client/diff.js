/**
 * Line-level diff engine for the inline cards.
 *
 * Everything here is pure and deterministic: the browser half asks for the
 * exact before/after text of a settled edit/write (Host snapshot) and derives
 * one aligned row stream, hunks with context, gap bands between hunks, moved
 * block hints and old→new line numbers from it. Two budgeted fallbacks keep
 * the conversation responsive for pathological inputs:
 *
 *  - huge files fall back to the Host-authored `meta.diffs` (already ±3-context
 *    hunks) and locate each hunk's post-image in the file for line numbers;
 *  - inside a single alignment the LCS table is capped, falling back to a
 *    prefix/suffix + replace-block walk (correct coloring and numbering, but
 *    no moved-block inference).
 */

/** Context rows kept on each side of a changed run. */
export const CONTEXT_LINES = 3
/** LCS dynamic-programming budget per side. */
export const ALIGN_MAX_SIDE_LINES = 4000
/** LCS dynamic-programming cell budget (m × n). */
export const ALIGN_MAX_CELLS = 2_500_000
/** Rows rendered in the collapsed inline card before "expand" is offered. */
export const INLINE_ROW_CAP = 42
/** Rows rendered in the whole-file tab. */
export const FULL_VIEW_ROW_CAP = 4000

/** Split text into content lines (a trailing newline is a terminator, not a row). */
export function contentLines(text) {
  if (typeof text !== 'string' || text === '') return []
  const body = text.endsWith('\n') ? text.slice(0, -1) : text
  // Files written on Windows keep `\r` at the end of every line. Meta diffs are
  // stored with LF only, so leaving the carriage returns in place made the
  // history-replay line-number locator miss every CRLF file. Normalizing here is
  // display-only and keeps both sides of a snapshot comparison consistent.
  return body.split('\n').map(line => (line.endsWith('\r') ? line.slice(0, -1) : line))
}

/** One aligned row; `oldNo`/`newNo` are 1-based when known. */
function ctxRow(text, oldNo, newNo) {
  return { kind: 'ctx', text, oldNo, newNo }
}
function delRow(text, oldNo) {
  return { kind: 'del', text, oldNo, newNo: null }
}
function addRow(text, newNo) {
  return { kind: 'add', text, oldNo: null, newNo }
}

/** Coarse but O(n) alignment: trim the shared prefix/suffix, replace the middle. */
function coarseAlign(oldLines, newLines) {
  const rows = []
  let prefix = 0
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++
  let oldEnd = oldLines.length
  let newEnd = newLines.length
  while (oldEnd > prefix && newEnd > prefix && oldLines[oldEnd - 1] === newLines[newEnd - 1]) {
    oldEnd--
    newEnd--
  }
  for (let i = 0; i < prefix; i++) rows.push(ctxRow(oldLines[i], i + 1, i + 1))
  for (let i = prefix; i < oldEnd; i++) rows.push(delRow(oldLines[i], i + 1))
  for (let j = prefix; j < newEnd; j++) rows.push(addRow(newLines[j], j + 1))
  let oldNo = oldEnd + 1
  let newNo = newEnd + 1
  while (oldNo <= oldLines.length && newNo <= newLines.length) {
    rows.push(ctxRow(oldLines[oldNo - 1], oldNo, newNo))
    oldNo++
    newNo++
  }
  return { rows, coarse: true }
}

/**
 * Align two line arrays through an LCS walk.
 * @returns {{ rows: Array<object>, coarse: boolean }} rows in file order.
 */
export function alignLines(oldLines, newLines) {
  const m = oldLines.length
  const n = newLines.length
  if (m === 0) return { rows: newLines.map((text, j) => addRow(text, j + 1)), coarse: false }
  if (n === 0) return { rows: oldLines.map((text, i) => delRow(text, i + 1)), coarse: false }
  if (m > ALIGN_MAX_SIDE_LINES || n > ALIGN_MAX_SIDE_LINES || m * n > ALIGN_MAX_CELLS) {
    return coarseAlign(oldLines, newLines)
  }
  const w = n + 1
  const dp = new Uint32Array((m + 1) * w)
  for (let i = m - 1; i >= 0; i--) {
    const row = i * w
    const below = row + w
    const line = oldLines[i]
    for (let j = n - 1; j >= 0; j--) {
      dp[row + j] = line === newLines[j]
        ? dp[below + j + 1] + 1
        : Math.max(dp[below + j], dp[row + j + 1])
    }
  }
  const rows = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      rows.push(ctxRow(oldLines[i], i + 1, j + 1))
      i++
      j++
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      rows.push(delRow(oldLines[i], i + 1))
      i++
    } else {
      rows.push(addRow(newLines[j], j + 1))
      j++
    }
  }
  while (i < m) {
    rows.push(delRow(oldLines[i], i + 1))
    i++
  }
  while (j < n) {
    rows.push(addRow(newLines[j], j + 1))
    j++
  }
  return { rows, coarse: false }
}

/** Locate `needle` exactly once in `fileLines`; null when absent or ambiguous. */
export function locateOnce(needle, fileLines) {
  if (!Array.isArray(needle) || needle.length === 0) return -1
  if (!Array.isArray(fileLines) || fileLines.length < needle.length) return -1
  let found = -1
  const last = fileLines.length - needle.length
  outer: for (let i = 0; i <= last; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (fileLines[i + j] !== needle[j]) continue outer
    }
    if (found !== -1) return -1
    found = i
  }
  return found
}

/**
 * Split the full row stream into visible hunks (changed rows plus
 * {@link CONTEXT_LINES} shared rows) and gap bands between them.
 * Counters advance over folded rows too, so every number is file-accurate.
 */
export function groupHunks(rows) {
  const keep = new Uint8Array(rows.length)
  let hasChange = false
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].kind === 'ctx') continue
    hasChange = true
    for (let d = Math.max(0, i - CONTEXT_LINES); d <= Math.min(rows.length - 1, i + CONTEXT_LINES); d++) keep[d] = 1
  }
  if (!hasChange) return []
  const hunks = []
  let oldCur = 0
  let newCur = 0
  let gap = null
  let i = 0
  while (i < rows.length) {
    if (keep[i] === 0) {
      const oldStart = oldCur + 1
      const newStart = newCur + 1
      const start = i
      while (i < rows.length && keep[i] === 0) {
        const row = rows[i]
        if (row.oldNo !== null && row.oldNo !== undefined) oldCur = row.oldNo
        if (row.newNo !== null && row.newNo !== undefined) newCur = row.newNo
        i++
      }
      const count = i - start
      const oldCount = oldCur - (oldStart - 1)
      const newCount = newCur - (newStart - 1)
      if (hunks.length > 0 && i < rows.length && count > 0 && oldCount > 0) {
        gap = {
          count,
          oldCount,
          newCount,
          oldStart,
          oldEnd: oldCur,
          newStart,
          newEnd: newCur,
          // Mapping shift of the unchanged band, which is what the annotation
          // promises: old Lx now reads as new Ly.
          shift: newStart - oldStart,
        }
      }
      continue
    }
    const startOld = oldCur + 1
    const startNew = newCur + 1
    const seg = []
    while (i < rows.length && keep[i] !== 0) {
      const row = rows[i]
      if (row.oldNo !== null && row.oldNo !== undefined) oldCur = row.oldNo
      if (row.newNo !== null && row.newNo !== undefined) newCur = row.newNo
      seg.push(row)
      i++
    }
    const hunk = makeHunk(seg, startOld, startNew, gap)
    hunks.push(hunk)
    gap = null
  }
  return hunks
}

/** Build one hunk record from its kept rows and the counters at its boundary. */
function makeHunk(rows, boundaryOld, boundaryNew, gapBefore) {
  let oldStart = null
  let oldEnd = null
  let newStart = null
  let newEnd = null
  let added = 0
  let removed = 0
  for (const row of rows) {
    if (row.kind === 'del') {
      removed++
      if (oldStart === null) oldStart = row.oldNo
      oldEnd = row.oldNo
    } else if (row.kind === 'add') {
      added++
      if (newStart === null) newStart = row.newNo
      newEnd = row.newNo
    } else {
      if (oldStart === null) oldStart = row.oldNo
      oldEnd = row.oldNo
      if (newStart === null) newStart = row.newNo
      newEnd = row.newNo
    }
  }
  const oldCount = rows.filter(row => row.kind !== 'add').length
  const newCount = rows.filter(row => row.kind !== 'del').length
  // A one-sided hunk (insertion/deletion at the file edges) still knows the
  // boundary line of the side that has no row.
  if (oldStart === null) {
    oldStart = boundaryOld
    oldEnd = boundaryOld - 1
  }
  if (newStart === null) {
    newStart = boundaryNew
    newEnd = boundaryNew - 1
  }
  return {
    index: 0,
    rows,
    oldStart,
    oldEnd,
    newStart,
    newEnd,
    oldCount,
    newCount,
    added,
    removed,
    gapBefore: gapBefore ?? null,
    hasNumbers: true,
  }
}

/** Token budget for intra-line (word/character) highlighting. */
const INTRA_MAX_CHARS = 4000
const INTRA_MAX_CELLS = 160_000
const INTRA_MAX_TOTAL_CELLS = 2_000_000

/** Split one line into whitespace, identifier, CJK, and punctuation tokens. */
export function lineTokens(text) {
  if (typeof text !== 'string' || text === '') return []
  const tokens = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[A-Za-z0-9_$]+|\s+|./gu)
  return tokens === null ? [] : tokens
}

/** Merge adjacent tokens when their changed flag is identical. */
function pushSegment(segments, text, changed) {
  if (text === '') return
  const last = segments[segments.length - 1]
  if (last !== undefined && last.changed === changed) last.text += text
  else segments.push({ text, changed })
}

/** Rebuild a full line as segments from per-token changed flags. */
function segmentsFromFlags(tokens, flags) {
  const segments = []
  for (let i = 0; i < tokens.length; i++) pushSegment(segments, tokens[i], flags[i] === 1)
  return segments
}

/**
 * A token that carries no content of its own: whitespace or punctuation.
 * A word/identifier/number/CJK token (`[\p{L}\p{N}_$]`) is content, not a gap.
 */
function isGapToken(token) {
  if (typeof token !== 'string' || token === '') return false
  return !/[\p{L}\p{N}_$]/u.test(token)
}

/**
 * A changed run made only of gap tokens (whitespace/punctuation) sitting
 * between two *unchanged* content tokens is alignment noise, not a real edit:
 * token matching on repeated single-character tokens can flag a shared space,
 * comma or hyphen even though both lines contain exactly that character. Drop
 * those runs so the intra-line highlight only shows meaningful changed content
 * instead of scattered specks that read like block-move markers.
 */
function calmGapRuns(tokens, flags) {
  let i = 0
  while (i < tokens.length) {
    if (flags[i] !== 1 || !isGapToken(tokens[i])) {
      i++
      continue
    }
    const start = i
    while (i < tokens.length && flags[i] === 1 && isGapToken(tokens[i])) i++
    // A run that touches changed content (before or after) belongs to a real
    // edit; only a fully isolated run between unchanged content is demoted.
    const touchesChangedContent = (start > 0 && flags[start - 1] === 1)
      || (i < tokens.length && flags[i] === 1)
    if (!touchesChangedContent) {
      for (let k = start; k < i; k++) flags[k] = 0
    }
  }
  return flags
}

/**
 * Merge an unchanged run of gap tokens (whitespace/punctuation) only when two
 * changed content tokens sit on both sides of it: that run is inside one
 * replaced expression, so it belongs to one continuous highlight band. A gap
 * that merely separates two independent edits is left alone — otherwise every
 * space and comma between them would light up as a stray fragment. Genuinely
 * shared words also keep their own edits apart.
 */
function absorbGapTokens(tokens, flags) {
  let i = 0
  while (i < tokens.length) {
    if (flags[i] === 1 || !isGapToken(tokens[i])) {
      i++
      continue
    }
    const start = i
    while (i < tokens.length && flags[i] === 0 && isGapToken(tokens[i])) i++
    const boundedByChanged = start > 0 && flags[start - 1] === 1
      && i < tokens.length && flags[i] === 1
    if (boundedByChanged) {
      for (let k = start; k < i; k++) flags[k] = 1
    }
  }
  return flags
}

/**
 * Word/character-level comparison of one replaced line pair. Returns the two
 * sides as segment arrays, or null when the line is too large to compare
 * cheaply (the caller then keeps plain line-level coloring).
 */
export function lineSegments(oldText, newText, budget = null) {
  if (typeof oldText !== 'string' || typeof newText !== 'string') return null
  if (oldText === newText) return null
  if (oldText.length > INTRA_MAX_CHARS || newText.length > INTRA_MAX_CHARS) return null
  const a = lineTokens(oldText)
  const b = lineTokens(newText)
  if (a.length === 0 || b.length === 0) return null
  // Trim the shared prefix/suffix first so the DP only covers the real edit.
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++
  let aEnd = a.length
  let bEnd = b.length
  while (aEnd > prefix && bEnd > prefix && a[aEnd - 1] === b[bEnd - 1]) {
    aEnd--
    bEnd--
  }
  const am = aEnd - prefix
  const bn = bEnd - prefix
  if (am === 0 && bn === 0) return null
  const cells = am * bn
  if (cells > INTRA_MAX_CELLS) return null
  if (budget !== null) {
    if (cells > budget.remaining) return null
    budget.remaining -= cells
  }
  const oldFlags = new Uint8Array(a.length)
  const newFlags = new Uint8Array(b.length)
  for (let i = 0; i < prefix; i++) { oldFlags[i] = 0; newFlags[i] = 0 }
  for (let i = aEnd; i < a.length; i++) oldFlags[i] = 0
  for (let i = bEnd; i < b.length; i++) newFlags[i] = 0
  if (am > 0 && bn > 0) {
    const w = bn + 1
    const dp = new Uint32Array((am + 1) * w)
    for (let i = am - 1; i >= 0; i--) {
      const row = i * w
      const below = row + w
      const token = a[prefix + i]
      for (let j = bn - 1; j >= 0; j--) {
        dp[row + j] = token === b[prefix + j]
          ? dp[below + j + 1] + 1
          : Math.max(dp[below + j], dp[row + j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < am && j < bn) {
      if (a[prefix + i] === b[prefix + j]) {
        i++
        j++
      } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
        oldFlags[prefix + i] = 1
        i++
      } else {
        newFlags[prefix + j] = 1
        j++
      }
    }
    while (i < am) { oldFlags[prefix + i] = 1; i++ }
    while (j < bn) { newFlags[prefix + j] = 1; j++ }
  } else if (am > 0) {
    for (let i = prefix; i < aEnd; i++) oldFlags[i] = 1
  } else {
    for (let j = prefix; j < bEnd; j++) newFlags[j] = 1
  }
  return {
    old: segmentsFromFlags(a, absorbGapTokens(a, calmGapRuns(a, oldFlags))),
    new: segmentsFromFlags(b, absorbGapTokens(b, calmGapRuns(b, newFlags))),
  }
}

/**
 * Pair each replaced line group (delete run against the following/preceding add
 * run) and attach intra-line segments. Entirely added/removed extra lines keep
 * their plain row-level coloring.
 */
export function annotateIntraLine(rows) {
  let i = 0
  const budget = { remaining: INTRA_MAX_TOTAL_CELLS }
  while (i < rows.length) {
    if (rows[i].kind === 'ctx') {
      i++
      continue
    }
    const dels = []
    const adds = []
    while (i < rows.length && rows[i].kind !== 'ctx') {
      if (rows[i].kind === 'del') dels.push(rows[i])
      else adds.push(rows[i])
      i++
    }
    const count = Math.min(dels.length, adds.length)
    if (count === 0) continue
    for (let k = 0; k < count; k++) {
      if (budget.remaining <= 0) break
      const segments = lineSegments(dels[k].text, adds[k].text, budget)
      if (segments === null) continue
      dels[k].segments = segments.old
      adds[k].segments = segments.new
    }
  }
  return rows
}

/** Moved-block inference: identical contiguous runs across the change sets. */
const MOVE_MIN_LINES = 2
const MOVE_SINGLE_MIN_WIDTH = 12
const MOVE_MAX_LINES = 120

/** Visual width of one line in terminal cells (CJK / full-width = 2 cells). */
function displayWidth(text) {
  let width = 0
  for (const char of text) {
    const code = char.codePointAt(0)
    width += (code >= 0x2e80 && code <= 0x9fff) || (code >= 0xf900 && code <= 0xfaff) || (code >= 0xff00 && code <= 0xffef)
      ? 2
      : 1
  }
  return width
}

/** Trim blank lines from both edges; returns the core text and its offset. */
function trimBlankEdges(lines) {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === '') start++
  while (end > start && lines[end - 1].trim() === '') end--
  return { core: lines.slice(start, end), offset: start }
}

function runIsSignificant(lines) {
  if (lines.length >= MOVE_MIN_LINES && lines.some(text => text.trim() !== '')) return true
  // One-line moves use display width, not UTF-16 length: a 6-character Chinese
  // line is as substantial as a 12-character ASCII line, and both should get
  // the move hint so the annotation does not look arbitrary in Chinese files.
  if (lines.length === 1 && displayWidth(lines[0].trim()) >= MOVE_SINGLE_MIN_WIDTH) return true
  return false
}

/**
 * Pair deleted runs with identical added runs (outside their original place)
 * and annotate both ends. The pair comparison ignores blank lines on the runs'
 * edges: a block move almost always carries one boundary blank line to a
 * different side, and that must not hide the move.
 *
 * Old location stays red, new location stays green — exactly how the user
 * asked for a deterministic literal move to read — while the chips say where
 * the block went / came from.
 */
export function detectMoves(hunks) {
  const deleted = []
  const added = []
  for (const hunk of hunks) {
    let i = 0
    const rows = hunk.rows
    while (i < rows.length) {
      const kind = rows[i].kind
      if (kind === 'ctx') {
        i++
        continue
      }
      const start = i
      while (i < rows.length && rows[i].kind === kind) i++
      const run = rows.slice(start, i)
      const lines = run.map(row => row.text)
      const trimmed = trimBlankEdges(lines)
      const record = {
        hunk,
        start,
        coreOffset: trimmed.offset,
        core: trimmed.core,
        oldNo: run[0].oldNo ?? null,
        newNo: run[0].newNo ?? null,
      }
      if (trimmed.core.length === 0) continue
      if (kind === 'del') deleted.push(record)
      else added.push(record)
    }
  }
  if (deleted.length === 0 || added.length === 0) return 0
  const candidates = []
  for (const d of deleted) {
    if (!runIsSignificant(d.core) || d.core.length > MOVE_MAX_LINES) continue
    for (const a of added) {
      if (d.core.length !== a.core.length || !runIsSignificant(a.core)) continue
      let equal = true
      for (let k = 0; k < d.core.length; k++) {
        if (d.core[k] !== a.core[k]) {
          equal = false
          break
        }
      }
      if (!equal) continue
      const distance = d.oldNo !== null && a.newNo !== null ? Math.abs(a.newNo - d.oldNo) : 0
      candidates.push({ d, a, length: d.core.length, distance })
    }
  }
  if (candidates.length === 0) return 0
  candidates.sort((x, y) => y.length - x.length || x.distance - y.distance)
  const usedDel = new Set()
  const usedAdd = new Set()
  let pairs = 0
  for (const candidate of candidates) {
    const dKey = candidate.d.hunk.index + ':' + candidate.d.start
    const aKey = candidate.a.hunk.index + ':' + candidate.a.start
    if (usedDel.has(dKey) || usedAdd.has(aKey)) continue
    usedDel.add(dKey)
    usedAdd.add(aKey)
    const delRow = candidate.d.hunk.rows[candidate.d.start + candidate.d.coreOffset]
    const addRow = candidate.a.hunk.rows[candidate.a.start + candidate.a.coreOffset]
    const length = candidate.length
    if (addRow.newNo !== null) delRow.move = { kind: 'to', line: addRow.newNo, endLine: addRow.newNo + length - 1 }
    if (delRow.oldNo !== null) addRow.move = { kind: 'from', line: delRow.oldNo, endLine: delRow.oldNo + length - 1 }
    pairs++
  }
  return pairs
}

/** Totals over the changed rows of a hunk list. */
export function hunkTotals(hunks) {
  let added = 0
  let removed = 0
  for (const hunk of hunks) {
    added += hunk.added
    removed += hunk.removed
  }
  return { added, removed }
}

/**
 * Which line-number gutters a hunk actually fills. A brand-new file only has
 * new numbers and a deletion-only hunk (e.g. the file emptied) only old ones;
 * hunks that contain context rows carry both numbers even if all changes are on
 * one side, so "old / new" stays meaningful there. The inline gutter legend
 * uses this to avoid labelling a column the rows never fill.
 * @param {object} hunk - hunk produced by diffText / diffFromMeta.
 * @returns {{old: boolean, new: boolean}} whether each gutter has line numbers.
 */
export function gutterSides(hunk) {
  const rows = hunk === null || hunk === undefined ? null : hunk.rows
  if (!Array.isArray(rows)) return { old: false, new: false }
  let hasOld = false
  let hasNew = false
  for (const row of rows) {
    if (!hasOld && row.oldNo !== null && row.oldNo !== undefined) hasOld = true
    if (!hasNew && row.newNo !== null && row.newNo !== undefined) hasNew = true
    if (hasOld && hasNew) break
  }
  return { old: hasOld, new: hasNew }
}

/**
 * Diff two full texts. Used for the exact Host snapshot (live session) and for
 * the small arg-fragment previews while a call is still running.
 * @returns a titled model consumed by the card and modal.
 */
export function diffText(beforeText, afterText) {
  const oldLines = contentLines(beforeText ?? '')
  const newLines = contentLines(afterText ?? '')
  const { rows, coarse } = alignLines(oldLines, newLines)
  annotateIntraLine(rows)
  const hunks = groupHunks(rows)
  hunks.forEach((hunk, index) => { hunk.index = index + 1 })
  if (!coarse) detectMoves(hunks)
  const totals = hunkTotals(hunks)
  return {
    rows,
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    coarse,
    hasNumbers: true,
    beforeText: beforeText ?? '',
    afterText: afterText ?? '',
    beforeLineCount: oldLines.length,
    afterLineCount: newLines.length,
  }
}

/** Build a preview model from bare fragments (running call arguments). */
export function fragmentDiff(oldText, newText) {
  const oldLines = contentLines(oldText ?? '')
  const newLines = contentLines(newText ?? '')
  const { rows } = alignLines(oldLines, newLines)
  annotateIntraLine(rows)
  const hunks = groupHunks(rows)
  hunks.forEach((hunk, index) => { hunk.index = index + 1 })
  const totals = hunkTotals(hunks)
  return {
    rows: [],
    hunks,
    added: totals.added,
    removed: totals.removed,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
    hasNumbers: false,
    fragment: true,
    beforeText: oldText ?? '',
    afterText: newText ?? '',
  }
}

/** Drop fabricated numbers from a fallback model (line bases are unknown). */
function stripNumbers(hunks) {
  for (const hunk of hunks) {
    hunk.hasNumbers = false
    hunk.oldStart = null
    hunk.oldEnd = null
    hunk.newStart = null
    hunk.newEnd = null
    for (const row of hunk.rows) {
      row.oldNo = null
      row.newNo = null
    }
  }
}

/** Compose the gap band between two numbered hunks. */
function computeGaps(hunks) {
  for (let i = 0; i < hunks.length; i++) {
    const current = hunks[i]
    if (i === 0) {
      current.gapBefore = null
      continue
    }
    const previous = hunks[i - 1]
    if (!current.hasNumbers || !previous.hasNumbers) {
      current.gapBefore = null
      continue
    }
    const oldStart = previous.oldEnd + 1
    const newStart = previous.newEnd + 1
    const count = current.oldStart - oldStart
    if (count > 0) {
      current.gapBefore = {
        count,
        oldCount: count,
        newCount: count,
        oldStart,
        oldEnd: current.oldStart - 1,
        newStart,
        newEnd: current.newStart - 1,
        shift: newStart - oldStart,
      }
    } else {
      current.gapBefore = null
    }
  }
}

/**
 * Derive per-hunk 1-based line numbers by locating each hunk's post-image in
 * the current file, then propagate the cumulative line shift backwards to the
 * pre-image side. This is the history-replay fallback: the live snapshot is
 * gone but the file still exists. Every failure is per-hunk and degrades to
 * "line numbers pending".
 */
export function attachLineNumbers(hunks, fileLines) {
  let shift = 0
  for (const hunk of hunks) {
    const newSide = hunk.rows.filter(row => row.kind !== 'del').map(row => row.text)
    const oldSide = hunk.rows.filter(row => row.kind !== 'add')
    let baseNew = null
    if (newSide.length > 0) {
      const at = locateOnce(newSide, fileLines)
      if (at >= 0) baseNew = at + 1
    } else if (oldSide.length > 0) {
      // Deletion-only hunk: its leading context (if any) still exists in the
      // file; a bare deletion has no anchor and stays unnumbered.
      const probe = oldSide.slice(0, Math.min(CONTEXT_LINES, oldSide.length)).map(row => row.text)
      const at = locateOnce(probe, fileLines)
      if (at >= 0) baseNew = at + 1 + shift
    }
    if (baseNew !== null) {
      const baseOld = baseNew - shift
      let oldNo = baseOld
      let newNo = baseNew
      for (const row of hunk.rows) {
        if (row.kind === 'ctx') {
          row.oldNo = oldNo++
          row.newNo = newNo++
        } else if (row.kind === 'del') {
          row.oldNo = oldNo++
          row.newNo = null
        } else {
          row.oldNo = null
          row.newNo = newNo++
        }
      }
      hunk.oldStart = hunk.rows.find(row => row.oldNo !== null)?.oldNo ?? baseOld
      hunk.newStart = hunk.rows.find(row => row.newNo !== null)?.newNo ?? baseNew
      hunk.oldEnd = [...hunk.rows].reverse().find(row => row.oldNo !== null)?.oldNo ?? hunk.oldStart - 1
      hunk.newEnd = [...hunk.rows].reverse().find(row => row.newNo !== null)?.newNo ?? hunk.newStart - 1
      hunk.hasNumbers = true
    }
    shift += hunk.newCount - hunk.oldCount
  }
  computeGaps(hunks)
}

/** Narrow opaque result metadata's `diffs` to well-formed file hunks. */
export function narrowDiffs(diffs) {
  if (!Array.isArray(diffs) || diffs.length === 0) return null
  const out = []
  for (const hunk of diffs) {
    if (hunk === null || typeof hunk !== 'object') return null
    const path = hunk.path
    const oldText = hunk.oldText
    const newText = hunk.newText
    if (typeof path !== 'string' || (oldText !== null && typeof oldText !== 'string') || typeof newText !== 'string') return null
    out.push({ path, oldText, newText })
  }
  return out
}

/**
 * Build a fallback model from the Host-authored `meta.diffs`. Each meta diff is
 * one already-contextualized hunk; line numbers are attached afterwards from a
 * file read when available.
 */
export function diffFromMeta(diffs, fileLines) {
  const hunks = []
  let added = 0
  let removed = 0
  for (let i = 0; i < diffs.length; i++) {
    const diff = diffs[i]
    const oldLines = contentLines(diff.oldText ?? '')
    const newLines = contentLines(diff.newText)
    const { rows } = alignLines(oldLines, newLines)
    annotateIntraLine(rows)
    const hunk = makeHunk(rows, 1, 1, null)
    hunk.index = i + 1
    added += hunk.added
    removed += hunk.removed
    hunks.push(hunk)
  }
  stripNumbers(hunks)
  if (Array.isArray(fileLines)) attachLineNumbers(hunks, fileLines)
  return {
    rows: [],
    hunks,
    added,
    removed,
    oldLineCount: null,
    newLineCount: Array.isArray(fileLines) ? fileLines.length : null,
    hasNumbers: hunks.length > 0 && hunks.every(hunk => hunk.hasNumbers),
    source: Array.isArray(fileLines) ? 'located' : 'meta',
    beforeText: null,
    afterText: null,
  }
}

/** Resolve one absolute path against a workspace root (display helper only). */
export function joinPath(cwd, path) {
  if (typeof path !== 'string' || path === '') return ''
  if (/^[A-Za-z]:[\\/]/.test(path) || path.startsWith('\\\\') || path.startsWith('/')) return path
  if (typeof cwd !== 'string' || cwd === '') return path
  const separator = cwd.includes('\\') ? '\\' : '/'
  return `${cwd.replace(/[\\/]+$/, '')}${separator}${path.replace(/^[\\/]+/, '')}`
}

/** Short, workspace-relative display form of a path. */
export function displayPath(path, cwd, home) {
  if (typeof path !== 'string' || path === '') return ''
  let text = path
  if (typeof cwd === 'string' && cwd !== '') {
    const root = cwd.replace(/[\\/]+$/, '')
    if (text === root) text = '.'
    else if (text.startsWith(root + '/') || text.startsWith(root + '\\')) text = text.slice(root.length + 1)
  }
  if (typeof home === 'string' && home !== '' && !/^[A-Za-z]:/.test(home)) {
    const root = home.replace(/\/+$/, '')
    if (text === root) text = '~'
    else if (text.startsWith(root + '/')) text = '~' + text.slice(root.length)
  }
  return text
}
