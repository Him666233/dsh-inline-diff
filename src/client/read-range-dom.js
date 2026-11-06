/**
 * Page-level Read range chips.
 *
 * Read keeps its stock DSH card and the stock tree may render it through more
 * than one path (our tool-call node wrapper, a grouped/expanded official tree,
 * replayed history). Inserting the range chip from inside one React wrapper
 * therefore misses rows rendered elsewhere. This module watches the document
 * and mounts the chip directly next to the file link of every Read row; it only
 * observes stock presentation and never replaces the card or its disclosure.
 */
import { readRangeLabels, readRangesForBlock } from './read-range.js'

const CHIP_ATTR = 'data-dsh-inline-diff-read-range'
/** Row element → { block, label } so settled reads are only measured once. */
const rowCache = new WeakMap()

/** Find the tool-call block carried by a React fiber ancestor. */
function blockFromFiber(element) {
  const key = Object.keys(element).find(name => name.startsWith('__reactFiber$') || name.startsWith('__reactInternalInstance$'))
  if (key === undefined) return null
  let fiber = element[key]
  let guard = 0
  while (fiber !== null && fiber !== undefined && guard < 60) {
    const props = fiber.memoizedProps
    if (props !== null && typeof props === 'object') {
      const block = props.block
      if (block !== null && typeof block === 'object' && ('kind' in block || 'phase' in block || 'call' in block)) return block
    }
    fiber = fiber.return
    guard++
  }
  return null
}

/** Ensure one Read row has a range chip after its file link. */
function syncReadRow(row, t) {
  const block = blockFromFiber(row)
  if (block === null) return
  const cached = rowCache.get(row)
  let label
  if (cached !== undefined && cached.block === block) {
    label = cached.label
  } else {
    const ranges = readRangesForBlock(block)
    label = ranges === null ? null : readRangeLabels(ranges, t)
    rowCache.set(row, { block, label })
  }
  const explicitHeader = row.querySelector('[data-disclosure-row]')
  if (explicitHeader === null) return
  let chip = explicitHeader.querySelector(`[${CHIP_ATTR}]`)
  if (label === null) {
    if (chip !== null) chip.remove()
    return
  }
  const fileLink = explicitHeader.querySelector('button')
  if (fileLink === null) return
  if (chip === null || chip.isConnected !== true) {
    chip = document.createElement('span')
    chip.className = 'did-read-range'
    chip.setAttribute(CHIP_ATTR, 'true')
    fileLink.insertAdjacentElement('afterend', chip)
  }
  if (chip.textContent !== label) chip.textContent = label
  if (chip.title !== label) chip.title = label
  const expanded = explicitHeader.getAttribute('aria-expanded') === 'true'
  if (chip.hidden !== expanded) chip.hidden = expanded
}

/** Whether one mutated node is (or contains) a Read row worth scanning. */
function isReadRelevant(node) {
  if (node === null || node === undefined || node.nodeType !== 1) return false
  if (typeof node.matches === 'function' && node.matches('[data-tool="read"]')) return true
  return typeof node.querySelector === 'function' && node.querySelector('[data-tool="read"]') !== null
}

/** Watch the transcript and keep every Read row's chip in sync. */
export function startReadRangeChips(t) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  let scheduled = false
  let frame = null
  const scan = () => {
    scheduled = false
    frame = null
    for (const row of document.querySelectorAll('[data-tool="read"]')) syncReadRow(row, t)
  }
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    frame = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(scan)
      : setTimeout(scan, 16)
  }
  // Third-party boot/splash plugins (e.g. 550C) animate a full-screen overlay
  // for several seconds right after mount. Starting the page-wide observer and
  // its first scan in that window only adds main-thread work behind a cover the
  // user cannot see; defer one frame without delaying the visible transcript.
  schedule()
  // Only Read-row churn can change a chip. Filtering here matters on long,
  // streaming conversations and while another plugin is animating: unrelated
  // DOM mutations no longer wake a whole-document query.
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const row = typeof record.target.closest === 'function' ? record.target.closest('[data-tool="read"]') : null
        if (row !== null) {
          schedule()
          return
        }
        continue
      }
      for (const node of record.addedNodes) {
        if (isReadRelevant(node)) {
          schedule()
          return
        }
      }
      for (const node of record.removedNodes) {
        if (isReadRelevant(node)) {
          schedule()
          return
        }
      }
    }
  })
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-expanded'] })
  return () => {
    observer.disconnect()
    if (frame !== null) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      else clearTimeout(frame)
    }
    for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) chip.remove()
  }
}
