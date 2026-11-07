/**
/**
 * dsh-inline-diff —— Host 半侧（Node 侧，纯 ESM，无需构建）。
 *
 * 职责只有两件事，都刻意保持小：
 *
 *   1. 快照捕获：监听 `tools/result` 事件，为每次**成功**的 `edit` / `write`
 *      Tool 调用保存精确的修改前/后全文。fs 工具本身就在结果 value 里返回
 *      `{ path, before, after }`，Host 半侧只需原样留存；浏览器半侧据此渲染
 *      精确的全文对照（真实行号、移动块提示、被动行号位移），无需重读/重建文件。
 *      快照保存在有界的内存 LRU 中：实时会话是主要消费者，历史回放则回退到
 *      下面的文件读取路由。
 *
 *   2. 同源只读 API：在本插件自己的前缀路由下提供
 *
 *        POST /dsh-inline-diff/api/snapshot  { sessionId, callId }
 *        POST /dsh-inline-diff/api/read      { cwd, path }
 *        GET  /dsh-inline-diff/api/ping
 *
 *      读取路由永远不离开会话工作区（请求路径与解析后路径都做 realpath 包含
 *      校验），且只返回上限内的展示文本。它只服务两个展示用途：历史回放中
 *      实时快照已丢失时的行号定位，以及全文对照。
 *
 * 安全模型（1.3.0 加固）：
 *
 *   - 前缀路由不在 DSH 已认证的 `/api` 传输层下，因此本模块自己执行同样的浏览器
 *     信任边界，且在任何 body 读取之前：当 `connection` 服务已挂载（所有
 *     Web/桌面 profile）时，用其文档化的 `admit(request)` 判定 Host/Origin/DNS
 *     rebinding 信任并要求有效浏览器会话 cookie（否则 401/403）；没有
 *     `connection` 的 profile 回退本地围栏——Host 头必须是 loopback 或本监听器
 *     的绑定地址、跨站 Origin / `sec-fetch-site: cross-site` 一律拒绝、带 Origin
 *     时必须是同一 authority。调用方无法跳过这道检查。
 *   - 请求体在缓冲前就限长（Content-Length + 流式累计大小），带读取超时，且必须
 *     是 `application/json` 对象，因此跨站“简单请求”与 slow-loris 流都会被拒绝，
 *     且不会无界分配内存。
 *   - 文件读取是展示专用的：根与目标都 realpath 包含校验、regular-file 检查、
 *     符号链接目标必须仍在工作区内、2 MiB 上限、二进制拒绝、读取超时、并发上限。
 *   - 快照内存有单条与总量双预算（按字节计账），一波巨大编辑不会让 Host 内存
 *     无限增长。
 *   - 响应统一 JSON + `nosniff` / `no-store`；错误信息映射为稳定码，绝不回显原始
 *     文件系统错误（其中含路径与 errno）。
 *
 * 失败与回退（README「Host API 准入」行）：
 *   - 准入失败 → 401/403 固定文案；客户端 api.js 收到非 2xx 返回 null，卡片继续
 *     降级展示（元数据差异块 → 参数预览 → “没有可展示的差异”）；
 *   - 读取结果超大/二进制/超时/并发超限 → 明确 kind 或错误码，浏览器按 kind
 *     降级，不猜测；
 *   - 捕获失败（结果畸形、事件被冻结、内存预算淘汰）→ 完全吞掉，绝不影响 Tool
 *     调用本身；快照缺失时历史回放会自动回退到文件读取/差异块。
 */
import { readFile, realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'

/** webServer 服务承载本插件的前缀路由（通过 inject 注入）。 */
export const inject = ['webServer']

/** 本插件自己的 API 前缀（用包名，URL 路径安全）。 */
const API_PREFIX = '/dsh-inline-diff/api'
/** 展示读取上限：更大的文件返回 `oversized`，浏览器降级为差异块视图。 */
const READ_CAP = 2 * 1024 * 1024
/** 请求体大小上限。 */
const BODY_CAP = 1024 * 1024
/** 所有会话合计保留的快照条目数（有界内存 LRU）。 */
const SNAPSHOT_CAP = 240
/** 单侧快照文本上限：巨大写入不值得为“展示”常驻这么多内存。 */
const SNAPSHOT_TEXT_CAP = 4 * 1024 * 1024
/**
 * Total snapshot memory budget across all sessions. 逐条上限仍可能被大量
 * "4 MiB 大文件编辑"叠加成近 2 GiB 的常驻内存（240 × 2 × 4 MiB），因此再加
 * 一道总量上限：按 UTF-16 字符数 × 2 字节保守估算，超出后从最旧条目开始淘汰。
 * 该预算只影响历史回放时较旧快照的可用性（读路由会回退为文件读取/差异块），
 * 不影响当前会话的实时快照。
 */
const SNAPSHOT_TOTAL_CAP = 64 * 1024 * 1024
/** 请求体必须在此时间窗内全部接收（slow-loris 防护）。 */
const BODY_TIMEOUT_MS = 10_000
/** 单次展示读取必须在此时间窗内完成（磁盘不可达/过慢时放弃）。 */
const READ_TIMEOUT_MS = 15_000
/** 所有卡片合计的并发展示读取上限：防止卡住的页面把磁盘 I/O 打满。 */
const MAX_CONCURRENT_READS = 8
/** 快照 key 来自客户端；限制长度让 key 保持小而可比较。 */
const MAX_ID_LENGTH = 512

/**
 * 只读边界常量。导出仅供 `tests/security.test.mjs` 断言真实生产值（避免测试里
 * 复制一份数字而漂移）；插件加载器会忽略多余的命名导出。
 */
export const LIMITS = Object.freeze({
  body: BODY_CAP,
  read: READ_CAP,
  snapshotEntries: SNAPSHOT_CAP,
  snapshotText: SNAPSHOT_TEXT_CAP,
  snapshotTotal: SNAPSHOT_TOTAL_CAP,
  bodyTimeoutMs: BODY_TIMEOUT_MS,
  readTimeoutMs: READ_TIMEOUT_MS,
  maxConcurrentReads: MAX_CONCURRENT_READS,
  maxIdLength: MAX_ID_LENGTH,
})

/** 一个带类型的请求失败：`status` 是应答用的 HTTP 状态码。 */
class RequestError extends Error {
  /**
   * @param {number} status
   * @param {string} message - 稳定、不敏感的客户端可读消息（不回显 fs 细节）
   */
  constructor(status, message) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// 快照存储（有界 LRU：条目数 + 总字节双预算）
// ---------------------------------------------------------------------------

/** sessionId + callId → `{ snapshot, bytes }`；Map 插入序即 LRU 淘汰序。 */
const snapshots = new Map()
/** 所有已存快照的近似常驻字节数（见 approximateSnapshotBytes 的保守估算）。 */
let snapshotBytes = 0

/** 拼出快照 Map 的 key（`sessionId\0callId`）。 */
function snapshotKey(sessionId, callId) {
  return String(sessionId) + '\0' + String(callId)
}

/**
 * 估算单条快照的保守字节占用，用于内存预算。
 *
 * V8 对短/拉丁字符串按每字符 1 字节存储，其它字符串 2 字节；这里统一按
 * `2 × 字符数` 估算，宁高估不低估，保证预算不会失守。
 */
function approximateSnapshotBytes(snapshot) {
  const before = typeof snapshot?.before === 'string' ? snapshot.before.length : 0
  const after = typeof snapshot?.after === 'string' ? snapshot.after.length : 0
  const path = typeof snapshot?.path === 'string' ? snapshot.path.length : 0
  return 2 * (before + after + path)
}

/** 删除一条快照并同步扣减字节计数（计数下限钳到 0，防止浮点/重复删除漂移）。 */
function deleteSnapshot(key) {
  const entry = snapshots.get(key)
  if (entry === undefined) return
  snapshots.delete(key)
  snapshotBytes -= entry.bytes
  if (snapshotBytes < 0) snapshotBytes = 0
}

/**
 * 存入一条快照：覆盖写（先删旧条目再插新条目，位移到 LRU 末端），随后当
 * 条目数或总字节任一超预算时，从最旧条目开始淘汰，直到两个预算都满足。
 */
function putSnapshot(key, snapshot) {
  deleteSnapshot(key)
  const bytes = approximateSnapshotBytes(snapshot)
  snapshots.set(key, { snapshot, bytes })
  snapshotBytes += bytes
  while (snapshots.size > SNAPSHOT_CAP || snapshotBytes > SNAPSHOT_TOTAL_CAP) {
    const oldest = snapshots.keys().next().value
    if (oldest === undefined) break
    deleteSnapshot(oldest)
  }
}

/** 读取一条快照；从未捕获或被淘汰时返回 null（浏览器据此走下一级回退）。 */
function getSnapshot(key) {
  const entry = snapshots.get(key)
  return entry === undefined ? null : entry.snapshot
}

/**
 * @internal 仅供测试的状态探针；调用方无法通过它修改存储。
 * @returns {{ count: number, bytes: number }}
 */
export function snapshotStats() {
  return { count: snapshots.size, bytes: snapshotBytes }
}

/**
 * @internal 仅供测试：清空快照存储，让每个测试套件从空状态开始。
 */
export function clearSnapshots() {
  snapshots.clear()
  snapshotBytes = 0
}

// ---------------------------------------------------------------------------
// 工作区路径围栏
// ---------------------------------------------------------------------------

/** 判断候选路径是根本身还是位于根之下（不允许 `..` 逃逸，`relative` 为空表示根）。 */
export function inside(root, candidate) {
  const child = relative(root, candidate)
  return child === '' || (!child.startsWith('..') && !isAbsolute(child))
}

/**
 * 在“展示围栏”内解析一个请求路径：根 realpath → 候选包含校验 → 候选 realpath
 * → 结果再包含校验。符号链接只有目标仍在根内才放行（指向工作区外的链接或
 * Windows junction 读不到根外内容）。
 *
 * 失败一律抛带状态码的 RequestError，且消息固定：绝不把原始 fs 错误
 * （含用户请求的绝对路径与 errno）回给调用方。
 *
 * @returns {Promise<{ filename: string, size: number }>} 解析后的真实文件名与大小。
 */
export async function resolveReadTarget(cwd, requestedPath) {
  if (typeof cwd !== 'string' || cwd === '') throw new RequestError(400, 'cwd is required')
  if (typeof requestedPath !== 'string' || requestedPath === '') throw new RequestError(400, 'path is required')
  // NUL 会截断底层系统调用，属于非法路径而不是普通“不存在”。
  if (cwd.includes('\0') || requestedPath.includes('\0')) throw new RequestError(400, 'path is invalid')
  let root
  try {
    root = await realpath(cwd)
  } catch {
    throw new RequestError(404, 'workspace is not readable')
  }
  const candidate = resolve(root, requestedPath)
  if (!inside(root, candidate)) throw new RequestError(403, 'path is outside the session workspace')
  let filename
  try {
    // 符号链接在这里解析：只有 realpath 之后仍在根内才放行，因此一个指向
    // 工作区外的链接（或 Windows junction）无法读出根外内容。
    filename = await realpath(candidate)
  } catch {
    throw new RequestError(404, 'file is not readable')
  }
  if (!inside(root, filename)) throw new RequestError(403, 'resolved path is outside the session workspace')
  let info
  try {
    info = await stat(filename)
  } catch {
    throw new RequestError(404, 'file is not readable')
  }
  if (!info.isFile()) throw new RequestError(400, 'path is not a regular file')
  return { filename, size: info.size }
}

/**
 * 读取一个展示目标；用 `kind` 显式告诉浏览器如何降级。
 *
 * 读取带独立超时，并在读取后再次检查大小：文件在 stat 与 readFile 之间变大时，
 * 仍然不会超过展示上限。
 *
 * @returns {Promise<{kind:'text', text:string, size:number} |
 *   {kind:'binary'|'oversized', size:number}>}
 */
async function readDisplayTarget(cwd, requestedPath) {
  const target = await resolveReadTarget(cwd, requestedPath)
  if (target.size > READ_CAP) return { kind: 'oversized', size: target.size }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), READ_TIMEOUT_MS)
  let bytes
  try {
    bytes = await readFile(target.filename, { signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted || error?.name === 'AbortError') {
      throw new RequestError(504, 'file read timed out')
    }
    throw new RequestError(404, 'file is not readable')
  } finally {
    clearTimeout(timer)
  }
  if (bytes.length > READ_CAP) return { kind: 'oversized', size: bytes.length }
  if (bytes.includes(0)) return { kind: 'binary', size: target.size }
  let text = bytes.toString('utf8')
  // 开头的 BOM 属于展示噪声；差异基准本身也是纯文本，去掉不留痕。
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return { kind: 'text', text, size: target.size }
}

// ---------------------------------------------------------------------------
// 浏览器信任围栏（`connection` 服务未挂载时的回退）
// ---------------------------------------------------------------------------

/** 判断一个归一化 URL hostname 是否为本机 loopback（localhost / [::1] / 127.0.0.0-127.255.255.255）。 */
export function isLoopbackHostname(hostname) {
  if (typeof hostname !== 'string' || hostname === '') return false
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/**
 * 把裸 authority（`host` 或 `host:port`）解析成 URL；不可解析时返回 undefined。
 *
 * 之后还会要求 pathname/search/hash 为空，因此夹带 `user@host` 或 `host/path`
 * 的 Host 头无法通过包含校验。
 */
function parseAuthority(authority, scheme = 'http:') {
  try {
    return new URL(`${scheme}//${authority}`)
  } catch {
    return undefined
  }
}

/**
 * 本监听器绑定 literal 对应的 URL hostname（IPv6 自动加方括号，去掉 zone id），
 * 无法解析时返回 undefined。
 */
export function bindHostname(bindHost) {
  if (typeof bindHost !== 'string' || bindHost === '') return undefined
  const zoneAt = bindHost.indexOf('%')
  const address = zoneAt === -1 ? bindHost : bindHost.slice(0, zoneAt)
  if (address === '') return undefined
  const parsed = parseAuthority(address.includes(':') ? `[${address}]` : address)
  return parsed?.hostname
}

/**
 * 判断附带的 `Origin` 头与 `Host` 是否同一 authority。
 *
 * Host 按 Origin 自己的 HTTP(S) 协议解析，保证默认端口归一一致（HTTPS 反向代理
 * 后面可能是一个 HTTP 监听器）。
 */
export function isSameAuthorityOrigin(origin, host) {
  if (typeof origin !== 'string' || typeof host !== 'string') return false
  let originUrl
  try {
    originUrl = new URL(origin)
  } catch {
    return false
  }
  const scheme = originUrl.protocol === 'https:' ? 'https:' : originUrl.protocol === 'http:' ? 'http:' : undefined
  if (scheme === undefined) return false
  const hostUrl = parseAuthority(host, scheme)
  return hostUrl !== undefined && originUrl.host === hostUrl.host
}

/**
 * 没有 `connection` 服务的 profile 使用的本地回退围栏。
 *
 * 防御 DNS rebinding（Host 写成攻击者域名、socket 却落到本机）与来自恶意页面
 * 的跨站请求。HTTP 页面里的读取型请求不携带 Origin，所以 Host 是唯一可靠依据：
 * 只接受 loopback 或监听器自己的绑定 IP literal；带 Origin 时必须是同一
 * authority；`sec-fetch-site: cross-site` 一律拒绝。
 *
 * @param {object} req - Node HTTP 请求（只读 headers）。
 * @param {string | undefined} bindHost - 本监听器的绑定地址 literal。
 * @param {'http:' | 'https:'} protocol - 本监听器的协议。
 * @returns {boolean} true 表示允许访问展示 API。
 */
export function isTrustedHostRequest(req, bindHost, protocol = 'http:') {
  const headers = req !== null && typeof req === 'object' ? req.headers : undefined
  const host = headerOf(headers, 'host')
  if (host === undefined) return false
  const hostUrl = parseAuthority(host, protocol)
  if (hostUrl === undefined) return false
  // Host 必须是裸 authority：不能带凭据、路径、query 或 fragment。
  if (hostUrl.username !== '' || hostUrl.password !== '' || hostUrl.pathname !== '/' || hostUrl.search !== '' || hostUrl.hash !== '') return false
  const loopback = isLoopbackHostname(hostUrl.hostname)
  const ownBind = hostUrl.hostname === bindHostname(bindHost)
  if (!loopback && !ownBind) return false
  if (headerOf(headers, 'sec-fetch-site') === 'cross-site') return false
  const origin = headerOf(headers, 'origin')
  if (origin === undefined) return true
  return isSameAuthorityOrigin(origin, host)
}

/** 读取一个 header 值（Node 已把名字转小写；单值字符串与数组首项都接受）。 */
function headerOf(headers, name) {
  if (headers === null || typeof headers !== 'object') return undefined
  const value = headers[name]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

/** 回退围栏需要的 webServer 事实（绑定地址与协议）；服务缺失/形状异常时返回安全默认。 */
function webServerFacts(ctx) {
  const fallback = { bindHost: undefined, protocol: 'http:' }
  try {
    let web = undefined
    if (ctx !== null && typeof ctx === 'object') {
      web = typeof ctx.webServer === 'object' && ctx.webServer !== null ? ctx.webServer : undefined
      if (web === undefined && typeof ctx.get === 'function') web = ctx.get('webServer')
    }
    if (web === null || typeof web !== 'object') return fallback
    return {
      bindHost: typeof web.host === 'string' ? web.host : undefined,
      protocol: web.protocol === 'https:' ? 'https:' : 'http:',
    }
  } catch {
    return fallback
  }
}

/**
 * 单个路由请求的准入判定。
 *
 * 优先复用 DSH 官方 connection 服务的准入（Host/Origin/跨站 + 浏览器 Cookie
 * 认证），这样本插件不会成为绕过平台认证的旁路；只有该服务未挂载的 profile 才
 * 退回本地围栏。任何异常都走围栏而不是直接放行（fail-closed）。
 *
 * @returns {number | undefined} 拒绝时返回 HTTP 状态码；undefined 表示放行。
 */
function admissionRejection(ctx, req) {
  let connection
  try {
    if (ctx !== null && typeof ctx === 'object' && typeof ctx.get === 'function') connection = ctx.get('connection')
  } catch {
    connection = undefined
  }
  if (connection !== null && typeof connection === 'object' && typeof connection.admit === 'function') {
    try {
      const admission = connection.admit(req)
      if (admission !== null && typeof admission === 'object' && 'rejection' in admission) {
        const status = admission.rejection
        return status === 401 ? 401 : 403
      }
      return undefined
    } catch {
      // 服务形态与预期不符（版本漂移）：退回本地围栏继续判定。
    }
  }
  const facts = webServerFacts(ctx)
  return isTrustedHostRequest(req, facts.bindHost, facts.protocol) ? undefined : 403
}

// ---------------------------------------------------------------------------
// HTTP 辅助函数
// ---------------------------------------------------------------------------

/**
 * 固定响应头：只回 JSON、禁止 MIME 嗅探、禁止缓存、不泄露 referrer、
 * 禁止跨源读取（display-only API 不需要被其它源嵌入）。
 */
const JSON_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'cross-origin-resource-policy': 'same-origin',
})

/** 发送一个 JSON 响应；连接已断开时安全 no-op（display-only API 没有需要保护的状态）。 */
function respond(res, status, payload) {
  if (res === null || typeof res !== 'object') return
  if (res.headersSent === true || res.writableEnded === true) return
  let body
  try {
    body = JSON.stringify(payload)
  } catch {
    body = '{"ok":false,"error":"response failed"}'
  }
  try {
    res.writeHead(status, JSON_HEADERS)
    res.end(body)
  } catch {
    // 客户端已断开：没有需要保护的状态，忽略。
  }
}

/** 发送一个带类型的失败响应（稳定错误码，不含文件系统细节）。 */
function fail(res, status, error) {
  respond(res, status, { ok: false, error })
}

/**
 * 拒绝一个“body 可能还在传输”的请求：先写响应，等响应刷出后再销毁 socket。
 * （先销毁会丢掉客户端需要看到的 413/408。）
 */
function rejectBody(req, res, status, error) {
  if (res !== null && typeof res === 'object' && res.headersSent !== true && res.writableEnded !== true) {
    try {
      res.writeHead(status, JSON_HEADERS)
      res.end(JSON.stringify({ ok: false, error }), () => {
        try {
          req.destroy()
        } catch {
          // 忽略：连接已断开，无需处理。
        }
      })
      return
    } catch {
      // 写响应失败则直接走销毁。
    }
  }
  try {
    req.destroy()
  } catch {
    // 忽略：socket 已不可用。
  }
}

/** 请求是否声明了 `application/json` body（忽略参数部分、大小写不敏感）。 */
function isJsonRequest(req) {
  const type = headerOf(req?.headers, 'content-type')
  if (typeof type !== 'string') return false
  const media = type.split(';', 1)[0].trim().toLowerCase()
  return media === 'application/json'
}

/**
 * 读取一个 JSON 请求体：硬上限 + 读取超时 + 提前 Content-Length 拒绝。
 *
 * 解析结果在 Promise 外先按对象校验：数组、null、标量都拒绝，避免下游把
 * `body.cwd` 之类的字段访问变成奇怪的类型强制转换。
 *
 * @param {object} req - Node IncomingMessage（只读取 headers）。
 * @param {object} res - Node ServerResponse（用于提前拒绝时先回响应）。
 * @returns {Promise<object>} 解析后的对象。
 */
function readJsonBody(req, res) {
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false
    let size = 0
    const chunks = []
    let timer
    /** 让 Promise 恰好 settle 一次并释放超时定时器（重复 settle 直接忽略）。 */
    const settle = (settleWith, value) => {
      if (settled) return
      settled = true
      if (timer !== undefined) clearTimeout(timer)
      settleWith(value)
    }
    const abort = (status, error) => {
      rejectBody(req, res, status, error)
      settle(rejectPromise, new RequestError(status, error))
    }
    // 快速失败：声明的 Content-Length 已超限时不必读取任何字节。
    const declared = headerOf(req?.headers, 'content-length')
    if (declared !== undefined && /^\d+$/.test(declared) && Number(declared) > BODY_CAP) {
      abort(413, 'request body too large')
      return
    }
    timer = setTimeout(() => {
      abort(408, 'request body read timeout')
    }, BODY_TIMEOUT_MS)
    req.on('data', chunk => {
      if (settled) return
      // 防御性：Node 正常给 Buffer；非 Buffer 只接受字符串，其余忽略。
      const buffer = Buffer.isBuffer(chunk) ? chunk : typeof chunk === 'string' ? Buffer.from(chunk) : null
      if (buffer === null) return
      size += buffer.length
      if (size > BODY_CAP) {
        abort(413, 'request body too large')
        return
      }
      chunks.push(buffer)
    })
    req.on('end', () => {
      if (settled) return
      let parsed
      try {
        parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      } catch {
        settle(rejectPromise, new RequestError(400, 'invalid JSON body'))
        return
      }
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        settle(rejectPromise, new RequestError(400, 'body must be a JSON object'))
        return
      }
      settle(resolvePromise, parsed)
    })
    req.on('error', () => {
      if (settled) return
      settle(rejectPromise, new RequestError(400, 'request aborted'))
    })
    // `close` 在上传中途中止与正常结束后都会触发；正常路径此时 Promise 已经
    // settle，因此这里只在尚未 settle 时按中止处理。
    req.on('close', () => {
      if (settled) return
      settle(rejectPromise, new RequestError(400, 'request aborted'))
    })
  })
}

/** 提取请求 URL 的 pathname（忽略 query string）。 */
function routeOf(rawUrl) {
  if (typeof rawUrl !== 'string' || rawUrl === '') return '/'
  const question = rawUrl.indexOf('?')
  return question === -1 ? rawUrl : rawUrl.slice(0, question)
}

/** 把匹配到的路由映射成 action 名；未知路由返回原文（由调用方回 404）。 */
function actionOf(route) {
  if (route.startsWith(API_PREFIX + '/')) return route.slice(API_PREFIX.length + 1)
  if (route.startsWith('/')) return route.slice(1)
  return route
}

// ---------------------------------------------------------------------------
// 快照捕获
// ---------------------------------------------------------------------------

/**
 * 从一次 `tools/result` 事件捕获成功的文件修改快照。
 *
 * 只处理成功、且工具名是 `edit`/`write` 的结果（`str_replace_editor` 不产生
 * 执行快照，卡片走元数据差异块路径）。展示专用：畸形/冻结/异常形状的事件都
 * 在这里吞掉，绝不影响 Tool 调用本身。
 *
 * 边界：after 必须是非空字符串且不超过单条文本上限；before 可为 null（新建）；
 * callId/sessionId 缺失或超长时放弃捕获（防止异常 key 撑爆存储）。
 */
function captureSnapshot(exec, result) {
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
    if (callId === '' || callId.length > MAX_ID_LENGTH) return
    const sessionId = exec.agent?.id === undefined || exec.agent?.id === null ? '' : String(exec.agent.id)
    if (sessionId.length > MAX_ID_LENGTH) return
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
    // 展示专用捕获：绝不影响 Tool 调用本身。
  }
}

// ---------------------------------------------------------------------------
// 路由处理
// ---------------------------------------------------------------------------

/** 当前并发的展示读取计数（进程级全局上限，见 MAX_CONCURRENT_READS）。 */
let activeReads = 0

/** 准入之后分发一个请求；所有失败路径都回 JSON（稳定码，不泄漏内部细节）。 */
async function handleRequest(ctx, req, res) {
  const route = routeOf(req?.url)
  // 1. 浏览器信任边界（平台准入优先，回退本地围栏）：必须在读取任何 body 之前。
  const rejection = admissionRejection(ctx, req)
  if (rejection !== undefined) {
    fail(res, rejection, rejection === 401 ? 'unauthorized' : 'forbidden')
    return
  }
  try {
    if (req.method === 'GET' && (route === '/ping' || route === API_PREFIX + '/ping')) {
      respond(res, 200, { ok: true, snapshots: snapshots.size })
      return
    }
    if (req.method !== 'POST') {
      fail(res, 405, 'POST only')
      return
    }
    // 2. 先认 action 再读 body：未知路径不消耗解析预算。
    const action = actionOf(route)
    if (action !== 'snapshot' && action !== 'read') {
      fail(res, 404, 'unknown action')
      return
    }
    // 3. 只接受 application/json：浏览器的跨站“简单请求”无法携带该类型，
    //    因此这一道同时挡住 text/plain 形式的 CSRF 探测。
    if (!isJsonRequest(req)) {
      fail(res, 415, 'content type must be application/json')
      return
    }
    const body = await readJsonBody(req, res)
    if (action === 'snapshot') {
      const sessionId = body.sessionId
      const rawCallId = body.callId
      if (sessionId !== undefined && typeof sessionId !== 'string') {
        fail(res, 400, 'invalid sessionId')
        return
      }
      if (rawCallId !== undefined && typeof rawCallId !== 'string' && typeof rawCallId !== 'number') {
        fail(res, 400, 'invalid callId')
        return
      }
      const key = snapshotKey(sessionId ?? '', rawCallId === undefined || rawCallId === null ? '' : String(rawCallId))
      if (key.length > MAX_ID_LENGTH * 2 + 1) {
        fail(res, 400, 'invalid snapshot key')
        return
      }
      respond(res, 200, { ok: true, snapshot: getSnapshot(key) })
      return
    }
    if (body.cwd !== undefined && typeof body.cwd !== 'string') {
      fail(res, 400, 'cwd is required')
      return
    }
    if (body.path !== undefined && typeof body.path !== 'string') {
      fail(res, 400, 'path is required')
      return
    }
    if (activeReads >= MAX_CONCURRENT_READS) {
      // 429 而不是排队：显示型读取失败时浏览器本来就会回退为差异块展示。
      fail(res, 429, 'too many concurrent reads')
      return
    }
    activeReads++
    try {
      const result = await readDisplayTarget(body.cwd, body.path)
      respond(res, 200, { ok: true, ...result })
    } finally {
      activeReads--
    }
  } catch (error) {
    // 底层在流式拒绝时已经写过响应（413/408）：不能二次写头。
    if (res?.headersSent === true || res?.writableEnded === true) return
    const status = Number.isInteger(error?.status) ? error.status : 500
    // 内部异常只回稳定文案，不泄漏 errno / 绝对路径 / 堆栈。
    const message = error instanceof RequestError ? error.message : 'request failed'
    fail(res, status, message)
  }
}

// ---------------------------------------------------------------------------
// 插件入口
// ---------------------------------------------------------------------------

/**
 * 安装 Host 半侧的捕获与只读 API。
 * @param ctx - 插件 context；`webServer` 服务通过 `inject` 注入。
 */
export function apply(ctx) {
  // 工具结果捕获：edit/write 工具在 result value 里返回修改前/后全文，这正是
  // Host 自己做 diff 时所依据的精确文本。
  ctx.effect(() => ctx.on('tools/result', (exec, result) => {
    captureSnapshot(exec, result)
  }), 'dsh-inline-diff: capture mutation snapshots')

  // 同源展示 API。每个路由条目都是 effect 持有的资源（dispose 时自动注销）。
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      await handleRequest(ctx, req, res)
    },
  }), 'dsh-inline-diff: display api')
}
