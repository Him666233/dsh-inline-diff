/**
 * Read tool range extraction for the collapsed external range chip.
 *
 * The stock Read card keeps its own presentation; this module only derives the
 * "which lines did this call return" fact from the settled tool metadata (the
 * authoritative source) or, while a call is still running, from its arguments.
 */
import { deriveCall } from './model.js'

/** Group sorted line numbers into contiguous `{ start, end }` ranges. */
export function compressLineRanges(numbers) {
  const ranges = []
  let start = null
  let previous = null
  for (const value of numbers) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    if (start === null) {
      start = previous = value
    } else if (value === previous + 1) {
      previous = value
    } else {
      ranges.push({ start, end: previous })
      start = previous = value
    }
  }
  if (start !== null) ranges.push({ start, end: previous })
  return ranges
}

/** Normalize one optional numeric argument. */
function positiveInt(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : null
}

/**
 * Derive the displayed ranges for one read call block.
 * @returns {Array<{start: number, end: number|null}>|null} ranges, or null when unknown
 */
export function readRangesForBlock(block) {
  const call = deriveCall(block)
  const meta = call.meta
  if (meta !== null && typeof meta === 'object' && Array.isArray(meta.lines) && meta.lines.length > 0) {
    const numbers = meta.lines
      .map(line => (line !== null && typeof line === 'object' ? line.number : undefined))
      .filter(value => typeof value === 'number' && Number.isFinite(value))
    if (numbers.length > 0) return compressLineRanges(numbers)
  }
  const args = call.args
  if (args === null || typeof args !== 'object') return null
  const offset = positiveInt(args.offset)
  const limit = positiveInt(args.limit)
  // A running call with only a path has no defensible end bound. Wait for the
  // settled meta instead of guessing the default 2000-line limit.
  if (offset === null && limit === null) return null
  const start = offset ?? 1
  if (limit === null) return [{ start, end: null }]
  return [{ start, end: start + limit - 1 }]
}

/** Number of lines represented by one range (null end means unknown). */
export function rangeLineCount(range) {
  return range.end === null ? null : range.end - range.start + 1
}

/** Render the ranges into `Lx`, `Lx–Ly`, or `Lx 起` labels. */
export function readRangeLabels(ranges, t) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null
  const max = 4
  const labels = ranges.slice(0, max).map(range => {
    if (range.end === null) return t('readFrom', { line: range.start })
    if (range.start === range.end) return `L ${range.start}`
    return `L ${range.start} – L ${range.end}`
  })
  if (ranges.length > max) labels.push('…')
  return labels.join(' · ')
}
