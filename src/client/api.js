/**
 * Browser half of the plugin's small Host API. Every call is display-only and
 * bounded by a timeout, so a hung Host can never freeze the conversation.
 */
export const API_PREFIX = '/dsh-inline-diff/api'
const TIMEOUT_MS = 10_000

async function call(action, payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_PREFIX}/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = await response.json()
    return data !== null && typeof data === 'object' ? data : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Fetch the captured before/after snapshot for one settled edit/write call. */
export async function fetchSnapshot(sessionId, callId) {
  if (typeof sessionId !== 'string' || sessionId === '' || callId === undefined || callId === null) return null
  const data = await call('snapshot', { sessionId, callId: String(callId) })
  if (data === null || data.ok !== true) return null
  const snapshot = data.snapshot
  if (snapshot === null || typeof snapshot !== 'object') return null
  if (typeof snapshot.after !== 'string') return null
  return {
    path: typeof snapshot.path === 'string' ? snapshot.path : '',
    before: typeof snapshot.before === 'string' ? snapshot.before : null,
    after: snapshot.after,
    operation: typeof snapshot.operation === 'string' ? snapshot.operation : (snapshot.before === null ? 'create' : 'update'),
  }
}

/** Read one workspace file for display; returns `{ kind, text? }` or null. */
export async function fetchFileText(cwd, path) {
  if (typeof cwd !== 'string' || cwd === '' || typeof path !== 'string' || path === '') return null
  const data = await call('read', { cwd, path })
  if (data === null || data.ok !== true) return null
  if (data.kind === 'text' && typeof data.text === 'string') return { kind: 'text', text: data.text, size: data.size }
  if (data.kind === 'binary') return { kind: 'binary', size: data.size }
  if (data.kind === 'oversized') return { kind: 'oversized', size: data.size }
  return null
}

/** File-content cache shared by every card: display-only, short-lived. */
const FILE_CACHE_LIMIT = 24
const FILE_CACHE_TTL = 15_000
const fileCache = new Map()

/** Read once per (cwd, path) within a short TTL; null when unavailable. */
export async function cachedFileText(cwd, path) {
  const key = `${cwd ?? ''}\u0000${path ?? ''}`
  const now = Date.now()
  const hit = fileCache.get(key)
  if (hit !== undefined && now - hit.at < FILE_CACHE_TTL) {
    fileCache.delete(key)
    fileCache.set(key, hit)
    return hit.value
  }
  const value = await fetchFileText(cwd, path)
  fileCache.set(key, { value, at: now })
  if (fileCache.size > FILE_CACHE_LIMIT) {
    const oldest = fileCache.keys().next().value
    if (oldest !== undefined) fileCache.delete(oldest)
  }
  return value
}

/** Forget one cached file (e.g. after opening a newer version). */
export function invalidateFileCache(cwd, path) {
  fileCache.delete(`${cwd ?? ''}\u0000${path ?? ''}`)
}

/** Snapshot cache keyed by session + call: avoids refetching on rerenders. */
const snapshotCache = new Map()

/** Fetch a snapshot once per call; `undefined` in the cache means "checked, absent". */
export async function cachedSnapshot(sessionId, callId) {
  const key = `${sessionId ?? ''}\u0000${callId ?? ''}`
  if (snapshotCache.has(key)) return snapshotCache.get(key) ?? null
  let snapshot = await fetchSnapshot(sessionId, callId)
  if (snapshot === null) {
    // The Host capture listener and the Client render race by design; one short
    // retry closes the window without stalling the row.
    await new Promise(resolve => setTimeout(resolve, 180))
    snapshot = await fetchSnapshot(sessionId, callId)
  }
  snapshotCache.set(key, snapshot)
  if (snapshotCache.size > 160) {
    const oldest = snapshotCache.keys().next().value
    if (oldest !== undefined) snapshotCache.delete(oldest)
  }
  return snapshot
}
