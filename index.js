/**
 * dsh-inline-diff — Host half.
 *
 * Two responsibilities, both deliberately small:
 *
 * 1. Capture the exact pre-image and post-image of every successful `edit` /
 *    `write` Tool call from the `tools/result` event. The fs tools already
 *    return `{ path, before, after }`; keeping that snapshot lets the browser
 *    render a precise whole-file diff (real line numbers, moved-block hints,
 *    passive line-number shifts) without re-reading or reconstructing files.
 *    Snapshots live in a bounded in-memory LRU: the current live session is
 *    the primary consumer, and history replay falls back to the fenced read
 *    route below.
 *
 * 2. Serve a tiny same-origin, workspace-fenced read API under the plugin's
 *    own prefix route:
 *
 *      POST /dsh-inline-diff/api/snapshot  { sessionId, callId }
 *      POST /dsh-inline-diff/api/read      { cwd, path }
 *      GET  /dsh-inline-diff/api/ping
 *
 * The read route never leaves the session workspace (realpath containment on
 * both the requested and the resolved path), and it only ever returns display
 * text for files under the cap. It is used for two display-only jobs: line
 * numbers in history whose live snapshot is gone, and the whole-file view.
 */
import { readFile, realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'

/** The webServer service hosts this plugin's prefix route. */
export const inject = ['webServer']

/** The plugin's own API prefix (package name; '/'-safe in a URL path). */
const API_PREFIX = '/dsh-inline-diff/api'
/** Display-only read cap: larger files answer `oversized` and degrade to hunk view. */
const READ_CAP = 2 * 1024 * 1024
/** Request body cap. */
const BODY_CAP = 1024 * 1024
/** Snapshot entries kept across all sessions (bounded in-memory LRU). */
const SNAPSHOT_CAP = 240
/** Per-side snapshot cap: giant writes are not worth the memory for display. */
const SNAPSHOT_TEXT_CAP = 4 * 1024 * 1024

/** sessionId + callId → captured mutation snapshot. Insertion order doubles as LRU. */
const snapshots = new Map()

/** Compose the snapshot map key. */
function snapshotKey(sessionId, callId) {
  return String(sessionId) + '\0' + String(callId)
}

/** Store one snapshot, evicting the oldest entry beyond the cap. */
function putSnapshot(key, snapshot) {
  snapshots.delete(key)
  snapshots.set(key, snapshot)
  while (snapshots.size > SNAPSHOT_CAP) {
    const oldest = snapshots.keys().next().value
    if (oldest === undefined) break
    snapshots.delete(oldest)
  }
}

/** Whether the candidate is the root itself or lies under it (no `..` escape). */
function inside(root, candidate) {
  const child = relative(root, candidate)
  return child === '' || (!child.startsWith('..') && !isAbsolute(child))
}

/**
 * Resolve one requested path inside the workspace with the display fence:
 * realpath the root, contain the candidate, realpath it, contain the result.
 * Symlinks are allowed only when their target still lives inside the root.
 * @returns {{ filename: string, size: number }}
 */
async function resolveReadTarget(cwd, requestedPath) {
  if (typeof cwd !== 'string' || cwd === '') throw new Error('cwd is required')
  if (typeof requestedPath !== 'string' || requestedPath === '') throw new Error('path is required')
  const root = await realpath(cwd)
  const candidate = resolve(root, requestedPath)
  if (!inside(root, candidate)) throw new Error('path is outside the session workspace')
  const filename = await realpath(candidate)
  if (!inside(root, filename)) throw new Error('resolved path is outside the session workspace')
  const info = await stat(filename)
  if (!info.isFile()) throw new Error('path is not a regular file')
  return { filename, size: info.size }
}

/** Read one display target; answers a kind so the browser degrades explicitly. */
async function readDisplayTarget(cwd, requestedPath) {
  const target = await resolveReadTarget(cwd, requestedPath)
  if (target.size > READ_CAP) return { kind: 'oversized', size: target.size }
  const bytes = await readFile(target.filename)
  if (bytes.includes(0)) return { kind: 'binary', size: target.size }
  let text = bytes.toString('utf8')
  // A leading BOM is display noise; the diff basis itself is text-only anyway.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return { kind: 'text', text, size: target.size }
}

/** Read one JSON request body with a hard cap. */
function readJsonBody(req, res) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > BODY_CAP) {
        rejectPromise(new Error('request body too large'))
        if (!res.headersSent) {
          res.writeHead(413, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: 'request body too large' }))
        }
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          rejectPromise(new Error('body must be a JSON object'))
          return
        }
        resolvePromise(parsed)
      } catch (error) {
        rejectPromise(new Error('invalid JSON body: ' + String(error?.message ?? error)))
      }
    })
    req.on('error', rejectPromise)
  })
}

/** Send one JSON response and end the request. */
function respond(res, status, payload) {
  if (res.headersSent) return
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

/**
 * Install the Host-side capture and API.
 * @param ctx - plugin context; `webServer` arrives through `inject`.
 */
export function apply(ctx) {
  // Tool-result capture: the edit/write tools return before/after full text in
  // their result value, so this is the exact basis the Host itself diffed.
  ctx.effect(() => ctx.on('tools/result', (exec, result) => {
    try {
      if (result === undefined || result === null || result.isError === true) return
      const name = exec?.name
      if (name !== 'edit' && name !== 'write') return
      const value = result.value
      if (value === null || typeof value !== 'object') return
      const after = value.after
      if (typeof after !== 'string') return
      if (after.length > SNAPSHOT_TEXT_CAP) return
      const before = typeof value.before === 'string' ? value.before : null
      if (before !== null && before.length > SNAPSHOT_TEXT_CAP) return
      const callId = exec.callId === undefined || exec.callId === null ? '' : String(exec.callId)
      if (callId === '') return
      const sessionId = exec.agent?.id === undefined || exec.agent?.id === null ? '' : String(exec.agent.id)
      const path = typeof value.path === 'string' ? value.path : (typeof exec.arguments?.file_path === 'string' ? exec.arguments.file_path : '')
      putSnapshot(snapshotKey(sessionId, callId), {
        path,
        before,
        after,
        operation: typeof value.operation === 'string'
          ? value.operation
          : before === null ? 'create' : 'update',
        at: Date.now(),
      })
    } catch {
      // Display-only capture: a malformed/frozen unexpected shape must never
      // affect the Tool call itself.
    }
  }), 'dsh-inline-diff: capture mutation snapshots')

  // Same-origin display API. Each route entry is its own effect-owned resource.
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      const rawUrl = typeof req.url === 'string' ? req.url : '/'
      const route = rawUrl.split('?')[0]
      try {
        if (req.method === 'GET' && (route === '/ping' || route === API_PREFIX + '/ping')) {
          respond(res, 200, { ok: true, snapshots: snapshots.size })
          return
        }
        if (req.method !== 'POST') {
          respond(res, 405, { ok: false, error: 'POST only' })
          return
        }
        const action = route.startsWith(API_PREFIX + '/')
          ? route.slice(API_PREFIX.length + 1)
          : route.startsWith('/') ? route.slice(1) : route
        const body = await readJsonBody(req, res)
        if (action === 'snapshot') {
          const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
          const callId = body.callId === undefined || body.callId === null ? '' : String(body.callId)
          const found = snapshots.get(snapshotKey(sessionId, callId))
          respond(res, 200, { ok: true, snapshot: found ?? null })
          return
        }
        if (action === 'read') {
          const result = await readDisplayTarget(String(body.cwd ?? ''), String(body.path ?? ''))
          respond(res, 200, { ok: true, ...result })
          return
        }
        respond(res, 404, { ok: false, error: 'unknown action' })
      } catch (error) {
        respond(res, 200, { ok: false, error: String(error?.message ?? error) })
      }
    },
  }), 'dsh-inline-diff: display api')
}
