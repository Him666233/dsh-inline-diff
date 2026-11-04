/**
 * Tiny external store shared by the session-scoped cards and the root-scoped
 * overlay modal. The card opens the modal by publishing a payload; the overlay
 * (registered in `shell.overlay`) subscribes with useSyncExternalStore.
 */
let payload = null
const listeners = new Set()

/** Publish one comparison payload to the modal. */
export function openDiffModal(next) {
  payload = next
  for (const listener of listeners) listener()
}

/** Close the modal. */
export function closeDiffModal() {
  if (payload === null) return
  payload = null
  for (const listener of listeners) listener()
}

/** Current modal payload (stable reference between changes). */
export function getDiffModal() {
  return payload
}

/** Subscribe to modal open/close. */
export function subscribeDiffModal(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
