/**
 * Security regression tests for dsh-inline-diff 1.3.0 hardening.
 *
 * 覆盖三块：
 *  1. Host API（plugin/index.js）：浏览器信任边界（Host/Origin/跨站、
 *     connection 服务准入）、方法/Content-Type/body 上限/坏 JSON 拒绝、工作区
 *     realpath 围栏（符号链接）、快照存储上限、响应头与错误信息脱敏。
 *  2. 高亮（src/client/highlight.js）：实体解码边界、highlight.js HTML →
 *     纯文本 token 的解析（不存在 HTML 注入路径）、超预算回退。
 *  3. 解析与预算（src/client/{diff,model,read-range-dom,languages}.js）：
 *     物化预算、定位/move 候选复杂度护栏、异常输入永不抛错、Read 行观察器
 *     在无 DOM 环境下的安全回退。
 *
 * 运行：node --test tests/security.test.mjs
 */
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  LIMITS,
  apply,
  bindHostname,
  clearSnapshots,
  inside,
  isLoopbackHostname,
  isSameAuthorityOrigin,
  isTrustedHostRequest,
  resolveReadTarget,
  snapshotStats,
} from '../plugin/index.js'
import {
  MAX_MATERIALIZED_LINES,
  MAX_SINGLE_LINE_CHARS,
  diffFromMeta,
  diffText,
  exceedsMaterializationBudget,
  fragmentDiff,
  locateOnce,
  measureTextBudget,
} from '../src/client/diff.js'
import {
  decodeEntity,
  getDiffHighlighter,
  parseHighlightedHtml,
  tokensForRow,
} from '../src/client/highlight.js'
import { buildCardModel, parseArgs } from '../src/client/model.js'
import { startReadRangeChips } from '../src/client/read-range-dom.js'
import { detectLanguage } from '../src/client/languages.js'

// ---------------------------------------------------------------------------
// Harness: drive the real Host route handler with fake ctx / req / res
// ---------------------------------------------------------------------------

const LOOPBACK_HOST = '127.0.0.1:64348'
const API = '/dsh-inline-diff/api'

/**
 * Apply the real plugin to a fake Cordis context and capture the registered
 * prefix route handler plus the `tools/result` listener.
 */
function createHarness(options = {}) {
  const routes = []
  const listeners = new Map()
  const ctx = {
    webServer: {
      host: options.bindHost ?? '127.0.0.1',
      protocol: 'http:',
      register(route) {
        routes.push(route)
        return () => {}
      },
    },
    effect(fn) {
      const dispose = fn()
      return typeof dispose === 'function' ? dispose : () => {}
    },
    on(event, handler) {
      listeners.set(event, handler)
      return () => {}
    },
    get(name) {
      if (name === 'webServer') return ctx.webServer
      if (name === 'connection') return options.connection
      return undefined
    },
  }
  apply(ctx)
  const route = routes.find(candidate => candidate.kind === 'prefix')
  assert.ok(route, 'the plugin must register exactly one prefix route')
  return {
    route,
    emit(exec, result) {
      const handler = listeners.get('tools/result')
      assert.equal(typeof handler, 'function', 'the plugin must listen to tools/result')
      handler(exec, result)
    },
    handler: route.handler,
  }
}

/** Fake Node response recording status/headers/body. */
function createResponse() {
  return {
    status: null,
    headers: null,
    body: '',
    headersSent: false,
    writableEnded: false,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
      this.headersSent = true
      return this
    },
    end(chunk, callback) {
      if (typeof chunk === 'string') this.body += chunk
      else if (Buffer.isBuffer(chunk)) this.body += chunk.toString('utf8')
      this.writableEnded = true
      if (typeof callback === 'function') {
        try {
          callback()
        } catch {
          // ignore
        }
      }
    },
  }
}

/** Fake request: a real Readable so data/end/error/close behave like Node. */
function createRequest({ method = 'POST', url = `${API}/read`, headers = {}, body, chunks } = {}) {
  const parts = chunks ?? (body === undefined ? [] : [body])
  const req = Readable.from(parts.map(part => (Buffer.isBuffer(part) ? part : Buffer.from(String(part)))))
  req.method = method
  req.url = url
  req.headers = { host: LOOPBACK_HOST, ...headers }
  return req
}

/** Invoke the captured route handler once and resolve with the fake response. */
async function call(harness, options = {}) {
  const req = createRequest(options)
  const res = createResponse()
  await harness.handler(req, res)
  return res
}

/** Parse the JSON body of a fake response. */
function json(res) {
  return JSON.parse(res.body)
}

function postBody(url, payload, headers = {}) {
  return {
    method: 'POST',
    url,
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  }
}

// ---------------------------------------------------------------------------
// Shared temporary workspace
// ---------------------------------------------------------------------------

const sandbox = await mkdtemp(join(tmpdir(), 'dsh-inline-diff-security-'))
const workspace = join(sandbox, 'workspace')
await mkdir(workspace, { recursive: true })
await writeFile(join(workspace, 'hello.txt'), 'first\nsecond\n', 'utf8')
await writeFile(join(workspace, 'binary.dat'), Buffer.from([0x61, 0x00, 0x62]))
await writeFile(join(sandbox, 'outside.txt'), 'outside secret\n', 'utf8')
const outsidePath = join(sandbox, 'outside.txt')
after(async () => {
  await rm(sandbox, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// 1. Browser trust boundary
// ---------------------------------------------------------------------------

test('loopback hostname classification follows 127/8 + IPv6 loopback only', () => {
  assert.equal(isLoopbackHostname('127.0.0.1'), true)
  assert.equal(isLoopbackHostname('127.255.255.255'), true)
  assert.equal(isLoopbackHostname('localhost'), true)
  assert.equal(isLoopbackHostname('[::1]'), true)
  assert.equal(isLoopbackHostname('128.0.0.1'), false)
  assert.equal(isLoopbackHostname('10.0.0.1'), false)
  assert.equal(isLoopbackHostname('127.0.0.1.evil.example'), false)
  assert.equal(isLoopbackHostname('127.0.1'), false)
  assert.equal(isLoopbackHostname(''), false)
})

test('bind hostname normalization keeps IPv6 bracketed and drops the zone id', () => {
  assert.equal(bindHostname('127.0.0.1'), '127.0.0.1')
  assert.equal(bindHostname('192.168.1.5'), '192.168.1.5')
  assert.equal(bindHostname('::1'), '[::1]')
  assert.equal(bindHostname('fe80::1%eth0'), '[fe80::1]')
  assert.equal(bindHostname(undefined), undefined)
  assert.equal(bindHostname(''), undefined)
})

test('origin comparison only accepts a bare http(s) same-authority origin', () => {
  assert.equal(isSameAuthorityOrigin('http://127.0.0.1:3000', '127.0.0.1:3000'), true)
  assert.equal(isSameAuthorityOrigin('http://127.0.0.1:3000', '127.0.0.1:3001'), false)
  assert.equal(isSameAuthorityOrigin('http://localhost:3000', '127.0.0.1:3000'), false)
  assert.equal(isSameAuthorityOrigin('http://evil.example', '127.0.0.1:3000'), false)
  assert.equal(isSameAuthorityOrigin('https://evil.example/127.0.0.1', '127.0.0.1:3000'), false)
  assert.equal(isSameAuthorityOrigin('null', '127.0.0.1:3000'), false)
  assert.equal(isSameAuthorityOrigin('file:///tmp/x', '127.0.0.1:3000'), false)
})

test('fallback fence rejects missing / foreign / smuggled Host headers', () => {
  assert.equal(isTrustedHostRequest({ headers: {} }, '127.0.0.1'), false)
  assert.equal(isTrustedHostRequest({ headers: { host: 'evil.example:64348' } }, '127.0.0.1'), false)
  assert.equal(isTrustedHostRequest({ headers: { host: '127.0.0.1:64348' } }, '127.0.0.1'), true)
  assert.equal(isTrustedHostRequest({ headers: { host: '[::1]:64348' } }, '127.0.0.1'), true)
  assert.equal(isTrustedHostRequest({ headers: { host: 'localhost:64348' } }, '127.0.0.1'), true)
  // userinfo / path / query in Host must not be treated as a bare authority.
  assert.equal(isTrustedHostRequest({ headers: { host: 'user@127.0.0.1:64348' } }, '127.0.0.1'), false)
  assert.equal(isTrustedHostRequest({ headers: { host: '127.0.0.1:64348/path' } }, '127.0.0.1'), false)
  // A directly configured non-loopback bind address is accepted (remote profiles).
  assert.equal(isTrustedHostRequest({ headers: { host: '192.168.1.5:64348' } }, '192.168.1.5'), true)
  assert.equal(isTrustedHostRequest({ headers: { host: '192.168.1.5:64348' } }, '127.0.0.1'), false)
})

test('fallback fence rejects cross-site markers and cross-origin Origin', () => {
  const host = { host: LOOPBACK_HOST }
  assert.equal(isTrustedHostRequest({ headers: { ...host, 'sec-fetch-site': 'cross-site' } }, '127.0.0.1'), false)
  assert.equal(isTrustedHostRequest({ headers: { ...host, 'sec-fetch-site': 'same-origin' } }, '127.0.0.1'), true)
  assert.equal(isTrustedHostRequest({ headers: { ...host, origin: 'http://evil.example' } }, '127.0.0.1'), false)
  assert.equal(isTrustedHostRequest({ headers: { ...host, origin: 'http://127.0.0.1:64348' } }, '127.0.0.1'), true)
  // A rebound page sends its own origin against our loopback Host.
  assert.equal(isTrustedHostRequest({ headers: { host: '127.0.0.1:64348', origin: 'https://attacker.example' } }, '127.0.0.1'), false)
})

test('route refuses untrusted Host / cross-site GET ping before doing any work', async () => {
  const harness = createHarness()

  const noHost = await call(harness, { method: 'GET', url: `${API}/ping`, headers: { host: 'evil.example' } })
  assert.equal(noHost.status, 403)
  assert.deepEqual(json(noHost), { ok: false, error: 'forbidden' })

  const crossSite = await call(harness, {
    method: 'GET',
    url: `${API}/ping`,
    headers: { 'sec-fetch-site': 'cross-site' },
  })
  assert.equal(crossSite.status, 403)

  const badOrigin = await call(harness, {
    method: 'GET',
    url: `${API}/ping`,
    headers: { origin: 'https://attacker.example' },
  })
  assert.equal(badOrigin.status, 403)

  const allowed = await call(harness, { method: 'GET', url: `${API}/ping` })
  assert.equal(allowed.status, 200)
  assert.equal(json(allowed).ok, true)
  assert.equal(typeof json(allowed).snapshots, 'number')
})

test('connection admission is authoritative when the DSH service is mounted', async () => {
  const rejected = createHarness({ connection: { admit: () => ({ rejection: 403 }) } })
  assert.equal((await call(rejected, { method: 'GET', url: `${API}/ping` })).status, 403)

  const unauthorized = createHarness({ connection: { admit: () => ({ rejection: 401 }) } })
  assert.equal((await call(unauthorized, { method: 'GET', url: `${API}/ping` })).status, 401)

  const admitted = createHarness({ connection: { admit: () => ({ peer: { id: 'p' } }) } })
  assert.equal((await call(admitted, { method: 'GET', url: `${API}/ping` })).status, 200)

  // A service-shape mismatch must fall back to the local fence, never fail open.
  const broken = createHarness({ connection: { admit() { throw new Error('drifted API') } } })
  const res = await call(broken, { method: 'GET', url: `${API}/ping` })
  assert.equal(res.status, 200)
  const evil = await call(broken, { method: 'GET', url: `${API}/ping`, headers: { host: 'evil.example' } })
  assert.equal(evil.status, 403)
})

// ---------------------------------------------------------------------------
// 2. Method / Content-Type / body limits
// ---------------------------------------------------------------------------

test('non-POST methods and unknown actions are refused', async () => {
  const harness = createHarness()
  const put = await call(harness, { method: 'PUT', url: `${API}/read` })
  assert.equal(put.status, 405)

  const del = await call(harness, { method: 'DELETE', url: `${API}/read` })
  assert.equal(del.status, 405)

  const unknown = await call(harness, postBody(`${API}/evil`, {}))
  assert.equal(unknown.status, 404)
  assert.equal(json(unknown).error, 'unknown action')
})

test('POST requires an application/json content type (blocks cross-site simple requests)', async () => {
  const harness = createHarness()
  const textPlain = await call(harness, {
    method: 'POST',
    url: `${API}/read`,
    headers: { 'content-type': 'text/plain' },
    body: JSON.stringify({ cwd: workspace, path: 'hello.txt' }),
  })
  assert.equal(textPlain.status, 415)

  const missing = await call(harness, { method: 'POST', url: `${API}/read`, body: '{}' })
  assert.equal(missing.status, 415)

  const hasCharset = await call(harness, {
    method: 'POST',
    url: `${API}/read`,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ cwd: workspace, path: 'hello.txt' }),
  })
  assert.equal(hasCharset.status, 200)
})

test('bad JSON / non-object bodies are rejected with stable codes', async () => {
  const harness = createHarness()
  const broken = await call(harness, postBody(`${API}/read`, '{oops'))
  assert.equal(broken.status, 400)
  assert.equal(json(broken).error, 'invalid JSON body')
  assert.equal(broken.body.includes('Unexpected'), false, 'V8 parser text must not leak')

  const array = await call(harness, postBody(`${API}/read`, '[]'))
  assert.equal(array.status, 400)
  assert.equal(json(array).error, 'body must be a JSON object')

  const nul = await call(harness, postBody(`${API}/read`, 'null'))
  assert.equal(nul.status, 400)

  const scalar = await call(harness, postBody(`${API}/read`, '42'))
  assert.equal(scalar.status, 400)
})

test('body cap refuses declared and streamed oversized bodies before buffering', async () => {
  const harness = createHarness()
  const declared = await call(harness, {
    method: 'POST',
    url: `${API}/read`,
    headers: { 'content-type': 'application/json', 'content-length': String(LIMITS.body + 1) },
    body: '{}',
  })
  assert.equal(declared.status, 413)
  assert.equal(json(declared).error, 'request body too large')

  const big = 'x'.repeat(LIMITS.body + 1)
  const streamed = await call(harness, postBody(`${API}/read`, big))
  assert.equal(streamed.status, 413)

  // A body exactly at the cap is still acceptable JSON-wise (and then rejected
  // as an invalid object, not as too large).
  const atCap = JSON.stringify({ pad: 'x'.repeat(LIMITS.body - 20) })
  const accepted = await call(harness, {
    ...postBody(`${API}/read`, atCap),
    body: atCap,
  })
  assert.notEqual(accepted.status, 413)
})

// ---------------------------------------------------------------------------
// 3. Workspace path fence
// ---------------------------------------------------------------------------

test('inside() contains root children and refuses .. and absolute escapes', () => {
  assert.equal(inside(workspace, workspace), true)
  assert.equal(inside(workspace, join(workspace, 'a', 'b.txt')), true)
  assert.equal(inside(workspace, join(workspace, '..')), false)
  assert.equal(inside(workspace, join(workspace, '..', 'outside.txt')), false)
  assert.equal(inside(workspace, outsidePath), false)
})

test('resolveReadTarget accepts a real file and reports its size', async () => {
  const target = await resolveReadTarget(workspace, 'hello.txt')
  assert.equal(target.filename, join(workspace, 'hello.txt'))
  assert.equal(target.size, 13)
})

test('resolveReadTarget refuses traversal, foreign absolutes and bad inputs', async () => {
  await assert.rejects(resolveReadTarget(workspace, '../outside.txt'), error => error.status === 403)
  await assert.rejects(resolveReadTarget(workspace, outsidePath), error => error.status === 403)
  await assert.rejects(resolveReadTarget(workspace, ''), error => error.status === 400)
  await assert.rejects(resolveReadTarget('', 'hello.txt'), error => error.status === 400)
  await assert.rejects(resolveReadTarget(workspace, 'hello\0.txt'), error => error.status === 400)
  await assert.rejects(resolveReadTarget(join(sandbox, 'missing-dir'), 'x'), error => error.status === 404)
  await assert.rejects(resolveReadTarget(workspace, 'missing.txt'), error => error.status === 404)
  await assert.rejects(resolveReadTarget(workspace, '.'), error => error.status === 400)
})

test('resolveReadTarget follows symlinks only while their target stays inside the root', async t => {
  // Windows 普通用户无法创建文件符号链接（EPERM），但目录 junction 可以；两种
  // 平台都用目录链接验证 realpath 围栏：链接链在根外 → 拒绝，链在根内 → 放行。
  const outsideDir = join(sandbox, 'outside-dir')
  const insideDir = join(workspace, 'inside-dir')
  await mkdir(outsideDir, { recursive: true })
  await mkdir(insideDir, { recursive: true })
  await writeFile(join(outsideDir, 'secret.txt'), 'secret\n', 'utf8')
  await writeFile(join(insideDir, 'ok.txt'), 'ok\n', 'utf8')
  try {
    await symlink(outsideDir, join(workspace, 'escape-dir'), 'junction')
    await symlink(insideDir, join(workspace, 'inside-link'), 'junction')
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES' || error?.code === 'UNKNOWN') {
      t.skip('directory links are not permitted in this environment')
      return
    }
    throw error
  }
  await assert.rejects(resolveReadTarget(workspace, 'escape-dir/secret.txt'), error => error.status === 403)
  const insideTarget = await resolveReadTarget(workspace, 'inside-link/ok.txt')
  assert.equal(insideTarget.filename, join(insideDir, 'ok.txt'))
})

test('read route serves text, answers binary/oversized explicitly, and never leaks details', async () => {
  const harness = createHarness()

  const text = await call(harness, postBody(`${API}/read`, { cwd: workspace, path: 'hello.txt' }))
  assert.equal(text.status, 200)
  assert.deepEqual(json(text), { ok: true, kind: 'text', text: 'first\nsecond\n', size: 13 })
  assert.equal(text.headers['x-content-type-options'], 'nosniff')
  assert.equal(text.headers['cache-control'], 'no-store')
  assert.equal(text.headers['cross-origin-resource-policy'], 'same-origin')
  assert.equal(text.headers['content-type'], 'application/json; charset=utf-8')

  const binary = await call(harness, postBody(`${API}/read`, { cwd: workspace, path: 'binary.dat' }))
  assert.equal(binary.status, 200)
  assert.equal(json(binary).kind, 'binary')

  await writeFile(join(workspace, 'big.txt'), Buffer.alloc(LIMITS.read + 1, 0x61))
  const oversized = await call(harness, postBody(`${API}/read`, { cwd: workspace, path: 'big.txt' }))
  assert.equal(oversized.status, 200)
  assert.equal(json(oversized).kind, 'oversized')

  // Errors use fixed messages: no errno, no echoed absolute path.
  const missing = await call(harness, postBody(`${API}/read`, { cwd: workspace, path: 'nope.txt' }))
  assert.equal(missing.status, 404)
  assert.equal(json(missing).error, 'file is not readable')
  assert.equal(missing.body.includes(workspace), false)

  const traversal = await call(harness, postBody(`${API}/read`, { cwd: workspace, path: '../outside.txt' }))
  assert.equal(traversal.status, 403)
  assert.equal(json(traversal).error, 'path is outside the session workspace')

  const badType = await call(harness, postBody(`${API}/read`, { cwd: 42, path: 'hello.txt' }))
  assert.equal(badType.status, 400)
  assert.equal(json(badType).error, 'cwd is required')
})

// ---------------------------------------------------------------------------
// 4. Snapshot store and route
// ---------------------------------------------------------------------------

function mutationResult(value, { isError = false } = {}) {
  return { isError, value }
}

test('snapshot route returns only captured display snapshots', async () => {
  clearSnapshots()
  const harness = createHarness()
  harness.emit(
    { name: 'edit', callId: 'call-1', agent: { id: 'session-1' } },
    mutationResult({ path: 'a.js', before: 'old\n', after: 'new\n' }),
  )
  harness.emit(
    { name: 'write', callId: 'call-err', agent: { id: 'session-1' } },
    mutationResult({ path: 'b.js', after: 'x\n' }, { isError: true }),
  )
  harness.emit({ name: 'bash', callId: 'call-bash', agent: { id: 'session-1' } }, mutationResult({ after: 'x' }))

  const found = await call(harness, postBody(`${API}/snapshot`, { sessionId: 'session-1', callId: 'call-1' }))
  assert.equal(found.status, 200)
  const snapshot = json(found).snapshot
  assert.equal(snapshot.after, 'new\n')
  assert.equal(snapshot.before, 'old\n')
  assert.equal(snapshot.operation, 'update')
  assert.equal(snapshot.path, 'a.js')

  const missing = await call(harness, postBody(`${API}/snapshot`, { sessionId: 'session-1', callId: 'call-nope' }))
  assert.equal(missing.status, 200)
  assert.equal(json(missing).snapshot, null)

  // Errors, other tools and malformed events are never captured.
  const errorCall = await call(harness, postBody(`${API}/snapshot`, { sessionId: 'session-1', callId: 'call-err' }))
  assert.equal(json(errorCall).snapshot, null)
  const bashCall = await call(harness, postBody(`${API}/snapshot`, { sessionId: 'session-1', callId: 'call-bash' }))
  assert.equal(json(bashCall).snapshot, null)

  const badSession = await call(harness, postBody(`${API}/snapshot`, { sessionId: 7, callId: 'call-1' }))
  assert.equal(badSession.status, 400)
  const badCall = await call(harness, postBody(`${API}/snapshot`, { sessionId: 'session-1', callId: { x: 1 } }))
  assert.equal(badCall.status, 400)
  clearSnapshots()
})

test('capture ignores oversized text and frozen/malformed events without throwing', () => {
  clearSnapshots()
  const harness = createHarness()
  harness.emit(
    { name: 'write', callId: 'huge', agent: { id: 's' } },
    mutationResult({ path: 'huge.txt', before: null, after: 'x'.repeat(LIMITS.snapshotText + 1) }),
  )
  assert.equal(snapshotStats().count, 0)

  const frozenExec = Object.freeze({ name: 'edit', callId: 'frozen', agent: Object.freeze({ id: 's' }) })
  harness.emit(frozenExec, mutationResult({ path: 'f.js', before: 'a', after: 'b' }))
  assert.equal(snapshotStats().count, 1)

  // A getter that throws must be swallowed by the capture listener.
  const hostile = {
    name: 'edit',
    get callId() {
      throw new Error('hostile getter')
    },
    agent: { id: 's' },
  }
  assert.doesNotThrow(() => harness.emit(hostile, mutationResult({ path: 'h.js', before: 'a', after: 'b' })))
  clearSnapshots()
})

test('snapshot store enforces entry-count and total-byte budgets', () => {
  clearSnapshots()
  const harness = createHarness()
  // Entry-count cap.
  for (let index = 0; index < LIMITS.snapshotEntries + 60; index++) {
    harness.emit(
      { name: 'edit', callId: `c${index}`, agent: { id: 's' } },
      mutationResult({ path: 'small.txt', before: 'a', after: 'b' }),
    )
  }
  assert.equal(snapshotStats().count, LIMITS.snapshotEntries)

  // Total-byte cap: 20 × ~4 MiB estimated exceeds the 64 MiB budget.
  clearSnapshots()
  const chunk = 'x'.repeat(2_000_000)
  for (let index = 0; index < 20; index++) {
    harness.emit(
      { name: 'write', callId: `big${index}`, agent: { id: 's' } },
      mutationResult({ path: 'big.txt', before: null, after: chunk }),
    )
  }
  const stats = snapshotStats()
  assert.ok(stats.count < 20, `expected byte-budget eviction, kept ${stats.count}`)
  assert.ok(stats.bytes <= LIMITS.snapshotTotal, `retained ${stats.bytes} bytes`)
  clearSnapshots()
})

// ---------------------------------------------------------------------------
// 5. highlight.js escaping / HTML-injection surface
// ---------------------------------------------------------------------------

test('entity decoding is bounded and never invents characters', () => {
  assert.equal(decodeEntity('&amp;'), '&')
  assert.equal(decodeEntity('&lt;'), '<')
  assert.equal(decodeEntity('&gt;'), '>')
  assert.equal(decodeEntity('&quot;'), '"')
  assert.equal(decodeEntity('&apos;'), "'")
  assert.equal(decodeEntity('&#x27;'), "'")
  assert.equal(decodeEntity('&#39;'), "'")
  assert.equal(decodeEntity('&#x3C;'), '<')
  assert.equal(decodeEntity('&nbsp;'), '\u00a0')
  assert.equal(decodeEntity('&unknown;'), null)
  assert.equal(decodeEntity('&;'), null)
  assert.equal(decodeEntity('&#;'), null)
  assert.equal(decodeEntity('&#0;'), null)
  assert.equal(decodeEntity('&#x110000;'), null)
  assert.equal(decodeEntity('&#xZZ;'), null)
})

test('highlight HTML is parsed into plain-text tokens, never markup', () => {
  const lines = parseHighlightedHtml('<span class="hljs-keyword">const</span> x = <span class="hljs-string">"&lt;script&gt;alert(1)&lt;/script&gt;"</span>')
  assert.equal(lines.length, 1)
  const text = lines[0].map(token => token.text).join('')
  assert.equal(text, 'const x = "<script>alert(1)</script>"')
  assert.deepEqual(lines[0].map(token => token.g), ['kw', 'var', 'str'])
  // No token may smuggle the markup through as its own text.
  for (const token of lines[0]) assert.equal(token.text.includes('<span'), false)

  // A hostile highlighter output (raw tags, not escaped) is not turned into text:
  // non-span tags are dropped by the parser and the upper layer's per-line
  // reconstruction check would reject the mismatch anyway.
  const hostile = parseHighlightedHtml('<span class="hljs-string"><img src=x onerror="alert(1)">payload</span>')
  assert.equal(hostile[0].map(token => token.text).join(''), 'payload')
  assert.equal(hostile[0].some(token => token.text.includes('<img')), false)
})

test('adversarial source text round-trips through highlight tokens with no markup', () => {
  const payloads = [
    '</span><span class="hljs-keyword">HACK</span>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
    '&lt;script&gt; not a tag',
    '&#x3C;script&#x3E;',
    '`${process.env.SECRET}`',
    '普通文本 <b>粗体</b> & 符号',
  ]
  const languages = ['javascript', 'xml', 'markdown', 'python', 'json']
  for (const language of languages) {
    const after = payloads.join('\n') + '\n'
    const diff = diffText('', after)
    const highlighter = getDiffHighlighter(diff, language)
    if (highlighter === null) continue
    let checked = 0
    for (const hunk of diff.hunks) {
      for (const row of hunk.rows) {
        const tokens = tokensForRow(highlighter, hunk, row, 'new')
        if (tokens === null) continue
        assert.ok(Array.isArray(tokens))
        assert.equal(tokens.map(token => token.text).join(''), row.text, `${language} tokens must rebuild the row text exactly`)
        for (const token of tokens) {
          assert.equal(typeof token.text, 'string')
          assert.equal(typeof token.g, 'string')
          // Group names come from the fixed internal map, never from source data.
          assert.match(token.g, /^[a-z]+$/)
        }
        checked++
      }
    }
    assert.ok(checked > 0, `${language} should produce at least one tokenized row`)
  }
})

test('highlighting gives up on oversized sides / lines instead of hanging', () => {
  const hugeLine = diffText('', 'a'.repeat(200_001))
  assert.equal(getDiffHighlighter(hugeLine, 'javascript'), null)

  const manyLines = diffText('', 'a\n'.repeat(4001))
  assert.equal(getDiffHighlighter(manyLines, 'javascript'), null)

  // A single rendered row over MAX_TOKEN_LINE_LENGTH is not tokenized.
  const longRow = diffText('', 'a'.repeat(2001))
  const highlighter = getDiffHighlighter(longRow, 'javascript')
  if (highlighter !== null) {
    const hunk = longRow.hunks[0]
    assert.equal(tokensForRow(highlighter, hunk, hunk.rows[0], 'new'), null)
  }
})

test('tokensForRow tolerates malformed handles/rows and never throws', () => {
  assert.equal(tokensForRow(null, null, null, 'new'), null)
  assert.equal(tokensForRow(undefined, undefined, undefined, 'old'), null)
  assert.equal(tokensForRow({}, {}, {}, 'new'), null)
  assert.equal(tokensForRow({ mode: 'full', oldLines: 'not-an-array', newLines: 42 }, null, { text: 'x', kind: 'add', newNo: 1 }, 'new'), null)
  assert.equal(tokensForRow({ mode: 'full', oldLines: [['x']], newLines: [['x']] }, null, { text: 'y', kind: 'add', newNo: 1 }, 'new'), null)
  const throwingRow = {
    kind: 'add',
    newNo: 1,
    get text() {
      throw new Error('hostile getter')
    },
  }
  assert.equal(tokensForRow({ mode: 'meta', languageId: 'javascript' }, null, throwingRow, 'new'), null)
})

// ---------------------------------------------------------------------------
// 6. Diff / model parsing budgets and exception fallbacks
// ---------------------------------------------------------------------------

test('measureTextBudget matches contentLines line counting without allocation', () => {
  assert.deepEqual(measureTextBudget(''), { lines: 0, maxLineLength: 0 })
  assert.deepEqual(measureTextBudget('a'), { lines: 1, maxLineLength: 1 })
  assert.deepEqual(measureTextBudget('a\n'), { lines: 1, maxLineLength: 1 })
  assert.deepEqual(measureTextBudget('a\nb'), { lines: 2, maxLineLength: 1 })
  assert.deepEqual(measureTextBudget('\n'), { lines: 1, maxLineLength: 0 })
  assert.deepEqual(measureTextBudget('abc\nde\n'), { lines: 2, maxLineLength: 3 })
  assert.deepEqual(measureTextBudget('a\r\nb\r\n'), { lines: 2, maxLineLength: 2 })
  assert.deepEqual(measureTextBudget(42), { lines: 0, maxLineLength: 0 })
})

test('materialization budget refuses to expand pathological diffs', () => {
  assert.equal(exceedsMaterializationBudget([]), false)
  assert.equal(exceedsMaterializationBudget([{ lines: 10, maxLineLength: 10 }]), false)
  assert.equal(
    exceedsMaterializationBudget([
      { lines: MAX_MATERIALIZED_LINES, maxLineLength: 1 },
      { lines: 1, maxLineLength: 1 },
    ]),
    true,
  )
  assert.equal(exceedsMaterializationBudget([{ lines: 1, maxLineLength: MAX_SINGLE_LINE_CHARS + 1 }]), true)

  const oldText = 'x\n'.repeat(120_000)
  const newText = 'y\n'.repeat(120_000)
  const truncated = diffText(oldText, newText)
  assert.equal(truncated.truncated, true)
  assert.equal(truncated.rows.length, 0)
  assert.equal(truncated.hunks.length, 0)
  assert.equal(truncated.oldLineCount, 120_000)
  assert.equal(truncated.newLineCount, 120_000)

  const hugeSingleLine = diffText('', 'z'.repeat(MAX_SINGLE_LINE_CHARS + 1))
  assert.equal(hugeSingleLine.truncated, true)
  assert.equal(hugeSingleLine.newLineCount, 1)

  const preview = fragmentDiff('x\n'.repeat(120_000), 'y\n'.repeat(120_000))
  assert.equal(preview.truncated, true)
  assert.equal(preview.hunks.length, 0)

  const meta = diffFromMeta([
    { path: 'a', oldText: 'x\n'.repeat(120_000), newText: 'y\n'.repeat(120_000) },
    { path: 'b', oldText: null, newText: 'z\n'.repeat(120_000) },
  ], null)
  assert.equal(meta.truncated, true)
  assert.equal(meta.hunks.length, 0)
  assert.equal(meta.hasNumbers, false)

  // Normal-sized diffs are unaffected.
  const normal = diffText('const a = 1\n', 'const a = 2\n')
  assert.notEqual(normal.truncated, true)
  assert.ok(normal.hunks.length > 0)
})

test('locateOnce has a search budget and tiny inputs keep exact behavior', () => {
  assert.equal(locateOnce(['b', 'c'], ['a', 'b', 'c', 'd']), 1)
  assert.equal(locateOnce(['b', 'c'], ['a', 'b', 'c', 'b', 'c']), -1) // ambiguous
  assert.equal(locateOnce(['x'], ['a', 'b']), -1)
  const fileLines = Array.from({ length: 5000 }, () => 'a')
  const needle = Array.from({ length: 2000 }, () => 'b')
  assert.equal(locateOnce(needle, fileLines), -1)
})

test('buildCardModel degrades huge snapshots/files with an explicit notice', () => {
  const settledWrite = {
    kind: 'tool-result',
    callId: 'c1',
    call: { name: 'write', argsRaw: '{"file_path":"big.txt"}' },
    isError: false,
    content: [],
    meta: { path: '/w/big.txt', diffs: [{ path: '/w/big.txt', oldText: null, newText: 'y\n' }] },
  }
  const hugeSnapshot = buildCardModel({
    block: settledWrite,
    toolName: 'write',
    cwd: '/w',
    snapshot: { path: 'big.txt', before: null, after: 'x'.repeat(MAX_SINGLE_LINE_CHARS + 1), operation: 'create' },
  })
  assert.equal(hugeSnapshot.status, 'ok')
  assert.equal(hugeSnapshot.notice?.kind, 'huge')
  // The meta-diff fallback still renders, but the (huge) current file is not split
  // for line numbers.
  assert.equal(hugeSnapshot.diff.hasNumbers, false)

  // Huge current file in the meta-diff path: line numbers stay pending, no throw.
  const hugeFile = buildCardModel({
    block: settledWrite,
    toolName: 'write',
    cwd: '/w',
    fileText: 'z\n'.repeat(MAX_MATERIALIZED_LINES + 10),
  })
  assert.equal(hugeFile.status, 'ok')
  assert.equal(hugeFile.notice?.kind, 'lines')
})

test('parseArgs / deriveCall / detectLanguage never throw on hostile input', () => {
  assert.equal(parseArgs('{'), null)
  assert.equal(parseArgs('[]'), null)
  assert.equal(parseArgs('null'), null)
  assert.equal(parseArgs('42'), null)
  assert.equal(parseArgs(undefined), null)
  assert.equal(parseArgs('{"file_path":"a.js"}').file_path, 'a.js')

  assert.doesNotThrow(() => buildCardModel({ block: null }))
  assert.doesNotThrow(() => buildCardModel({ block: { kind: 'tool-result', call: null, content: [] } }))

  assert.equal(detectLanguage('../../etc/passwd'), null)
  assert.equal(detectLanguage('a.js'), 'javascript')
  assert.equal(detectLanguage('Dockerfile.dev'), 'dockerfile')
  assert.equal(detectLanguage('script', '#!/usr/bin/env node\n'), 'javascript')
  assert.equal(detectLanguage(42), null)
})

test('read-range chip observer is a safe no-op without a DOM', () => {
  const stop = startReadRangeChips(key => key)
  assert.equal(typeof stop, 'function')
  assert.doesNotThrow(() => stop())
  assert.doesNotThrow(() => stop())
})

// ---------------------------------------------------------------------------
// 7. Route plumbing invariants
// ---------------------------------------------------------------------------

test('the registered route stays a same-origin prefix handler with no redirect', () => {
  const harness = createHarness()
  assert.equal(harness.route.kind, 'prefix')
  assert.equal(harness.route.path, API)
  assert.equal(typeof harness.route.handler, 'function')
  assert.equal(Object.hasOwn(harness.route, 'resource'), false)
})
