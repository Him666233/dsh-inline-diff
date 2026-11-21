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
 *        GET  /dsh-inline-diff/api/update/versions  版本列表/当前版本/安装方式
 *        POST /dsh-inline-diff/api/update/install   { version } 安装/回退
 *        GET  /dsh-inline-diff/api/tools            当前可见工具名（第三方工具兼容）
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
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, realpath, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** webServer 服务承载本插件的前缀路由（通过 inject 注入）。 */
export const inject = ['webServer']

/** 本插件自己的 API 前缀（用包名，URL 路径安全）。 */
const API_PREFIX = '/dsh-inline-diff/api'
/** 展示读取上限：更大的文件返回 `oversized`，浏览器降级为差异块视图。 */
const READ_CAP = 2 * 1024 * 1024
/** 用户显式授权的工作区外可读目录上限（设置页维护）。 */
const READ_ROOTS_MAX = 12
/** 单个授权目录路径长度上限。 */
const READ_ROOTS_PATH_MAX = 4096
/** 授权目录清单文件的缓存时间（设置页写入后会主动刷新）。 */
const READ_ROOTS_CACHE_TTL_MS = 5_000
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
/** 工具名上限：Host 注册表的 wire name 不会这么长，超过的一律丢弃。 */
const MAX_TOOL_NAME_LENGTH = 200
/** 单次 `/tools` 应答最多列出的工具数（MCP 等可能一次暴露很多工具）。 */
const MAX_TOOL_NAMES = 500

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
  maxToolNameLength: MAX_TOOL_NAME_LENGTH,
  maxToolNames: MAX_TOOL_NAMES,
})

/** 一个带类型的请求失败：`status` 是应答用的 HTTP 状态码。 */
class RequestError extends Error {
  /**
   * @param {number} status
   * @param {string} message - 稳定、不敏感的客户端可读消息（不回显 fs 细节）
   * @param {string} [code] - 稳定错误码（设置页等需要按码显示文案时使用）
   */
  constructor(status, message, code) {
    super(message)
    this.name = 'RequestError'
    this.status = status
    if (typeof code === 'string') this.code = code
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
  // 不能只用 startsWith('..')：根下名为 `..notes.txt` 的合法文件也会以 `..`
  // 开头，必须按路径段判断。
  return child === '' || (!isAbsolute(child) && child !== '..' && !child.startsWith('..' + sep))
}

/** Windows 与默认 APFS 大小写不敏感；路径比较按平台归一，避免误拒。 */
function foldPathForPlatform(value) {
  return process.platform === 'win32' || process.platform === 'darwin' ? value.toLowerCase() : value
}

/** target 是否等于 root 或位于 root 之下（两者都应是规范绝对路径）。 */
function isSameOrInside(root, target) {
  const rootKey = foldPathForPlatform(root)
  const targetKey = foldPathForPlatform(target)
  if (targetKey === rootKey) return true
  return targetKey.startsWith(rootKey.endsWith(sep) ? rootKey : rootKey + sep)
}

/**
 * 在“展示围栏”内解析一个请求路径：根 realpath → 候选包含校验 → 候选 realpath
 * → 结果再包含校验。符号链接只有目标仍在根内才放行（指向工作区外的链接或
 * Windows junction 读不到根外内容）。
 *
 * `extraRoots` 是用户显式授权的额外可读目录（设置页维护）：候选路径或 realpath
 * 之后的目标只要落在其中任一目录下也放行。这样工作区外文件的历史回放/全文对照
 * 可以按用户授权读取，而不是放开任意根。
 *
 * 失败一律抛带状态码的 RequestError，且消息固定：绝不把原始 fs 错误
 * （含用户请求的绝对路径与 errno）回给调用方。
 *
 * @param {string} cwd - 会话工作区根。
 * @param {string} requestedPath - 请求路径（绝对或相对 cwd）。
 * @param {string[]} [extraRoots] - 已规范化的额外可读目录。
 * @returns {Promise<{ filename: string, size: number }>} 解析后的真实文件名与大小。
 */
export async function resolveReadTarget(cwd, requestedPath, extraRoots = []) {
  if (typeof cwd !== 'string' || cwd === '') throw new RequestError(400, 'cwd is required')
  if (typeof requestedPath !== 'string' || requestedPath === '') throw new RequestError(400, 'path is required')
  // NUL 会截断底层系统调用，属于非法路径而不是普通“不存在”。
  if (cwd.includes('\0') || requestedPath.includes('\0')) throw new RequestError(400, 'path is invalid')
  const roots = Array.isArray(extraRoots) ? extraRoots.filter(root => typeof root === 'string' && root !== '') : []
  let root
  try {
    root = await realpath(cwd)
  } catch {
    throw new RequestError(404, 'workspace is not readable')
  }
  const candidate = resolve(root, requestedPath)
  if (!inside(root, candidate) && !roots.some(extra => isSameOrInside(extra, candidate))) {
    throw new RequestError(403, 'path is outside the session workspace')
  }
  let filename
  try {
    // 符号链接在这里解析：只有 realpath 之后仍在根内（或授权的额外目录内）才
    // 放行，因此一个指向其它位置的链接无法绕过围栏。
    filename = await realpath(candidate)
  } catch {
    throw new RequestError(404, 'file is not readable')
  }
  if (!inside(root, filename) && !roots.some(extra => isSameOrInside(extra, filename))) {
    throw new RequestError(403, 'resolved path is outside the session workspace')
  }
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
 * 把展示文件字节解码成文本；无法作为文本展示时返回 null。
 *
 * 识别 UTF-8 BOM 与 UTF-16 LE/BE BOM（记事本「Unicode」默认写 UTF-16LE）：
 * 直接按字节里有没有 NUL 判二进制会把 UTF-16 文本误判成二进制，导致历史回放
 * 无法展示文件内容。UTF-16 解码后仍含 NUL 的才视为二进制。
 *
 * @param {Buffer} bytes
 * @returns {string|null}
 */
function decodeDisplayText(bytes) {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    const text = bytes.subarray(2).toString('utf16le')
    return text.includes('\u0000') ? null : text
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const body = bytes.subarray(2)
    const even = body.length - (body.length % 2)
    const swapped = Buffer.allocUnsafe(even)
    for (let index = 0; index < even; index += 2) {
      swapped[index] = body[index + 1]
      swapped[index + 1] = body[index]
    }
    const text = swapped.toString('utf16le')
    return text.includes('\u0000') ? null : text
  }
  if (bytes.includes(0)) return null
  const text = bytes.toString('utf8')
  // 开头的 BOM 属于展示噪声；差异基准本身也是纯文本，去掉不留痕。
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

// ---------------------------------------------------------------------------
// 用户授权的额外可读目录（工作区外文件的历史回放）
// ---------------------------------------------------------------------------

/** DSH home：与 DSH 的 DSH_HOME 语义一致；测试可临时覆盖环境变量。 */
function dshHomeDir() {
  return typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
}

/** 授权目录清单文件（Host 侧持久化，不写 localStorage/不随浏览器清空）。 */
function readRootsFilePath() {
  return join(dshHomeDir(), 'dsh-inline-diff', 'read-roots.json')
}

/** 每个清单文件一份缓存：DSH_HOME 变化或 TTL 过期时重新读取。 */
let readRootsCache = { key: '', at: 0, roots: [] }

/**
 * 校验并规范化一个用户输入的可读目录。
 *
 * 安全约束：必须是绝对路径、存在、是目录；拒绝文件系统根（`/`、`C:\`、UNC
 * share 根），避免“加一个根 = 恢复任意文件读取”的误操作。符号链接按 realpath
 * 落到真实目录后保存。
 *
 * @param {unknown} value
 * @returns {Promise<string>} 规范绝对路径
 */
async function canonicalizeReadRoot(value) {
  if (typeof value !== 'string') throw new RequestError(400, 'invalid root', 'invalid-root')
  const trimmed = value.trim()
  if (trimmed === '') throw new RequestError(400, 'invalid root', 'invalid-root')
  if (trimmed.length > READ_ROOTS_PATH_MAX) throw new RequestError(400, 'invalid root', 'invalid-root')
  if (/[\u0000-\u001f]/.test(trimmed)) throw new RequestError(400, 'invalid root', 'invalid-root')
  if (!isAbsolute(trimmed)) throw new RequestError(400, 'root must be absolute', 'root-not-absolute')
  let canonical
  try {
    canonical = await realpath(trimmed)
  } catch {
    throw new RequestError(400, 'root is not readable', 'root-not-readable')
  }
  let info
  try {
    info = await stat(canonical)
  } catch {
    throw new RequestError(400, 'root is not readable', 'root-not-readable')
  }
  if (!info.isDirectory()) throw new RequestError(400, 'root is not a directory', 'root-not-directory')
  if (canonical === parse(canonical).root) {
    throw new RequestError(400, 'filesystem root is not allowed', 'filesystem-root')
  }
  return canonical
}

/**
 * 规范化一份目录清单：去重、最多 READ_ROOTS_MAX 条。
 *
 * @param {unknown} input
 * @param {boolean} strict - true：POST 设置，遇到非法条目直接抛错；
 *   false：读取持久化文件，跳过损坏/已不存在的条目，保留其余。
 * @returns {Promise<string[]>}
 */
async function normalizeReadRoots(input, strict) {
  if (!Array.isArray(input)) {
    if (strict) throw new RequestError(400, 'roots must be an array', 'invalid-roots')
    return []
  }
  if (input.length > READ_ROOTS_MAX && strict) {
    throw new RequestError(400, 'too many roots', 'too-many-roots')
  }
  const roots = []
  const seen = new Set()
  for (const value of input.slice(0, READ_ROOTS_MAX)) {
    let canonical
    try {
      canonical = await canonicalizeReadRoot(value)
    } catch (error) {
      if (strict) throw error
      continue
    }
    const key = foldPathForPlatform(canonical)
    if (seen.has(key)) continue
    seen.add(key)
    roots.push(canonical)
  }
  return roots
}

/** 读取当前授权目录；文件缺失/损坏时返回空数组（读取能力退回工作区围栏）。 */
async function loadReadRoots() {
  const file = readRootsFilePath()
  if (readRootsCache.key === file && Date.now() - readRootsCache.at < READ_ROOTS_CACHE_TTL_MS) {
    return readRootsCache.roots
  }
  let roots = []
  try {
    const data = JSON.parse(await readFile(file, 'utf8'))
    roots = await normalizeReadRoots(data?.roots, false)
  } catch {
    roots = []
  }
  readRootsCache = { key: file, at: Date.now(), roots }
  return roots
}

/** 原子地写入授权目录清单（先写临时文件再 rename），并刷新缓存。 */
async function saveReadRoots(roots) {
  const file = readRootsFilePath()
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`
  try {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(temp, `${JSON.stringify({ roots }, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temp, file)
  } catch {
    throw new RequestError(500, 'read roots are not writable', 'read-roots-unwritable')
  }
  readRootsCache = { key: file, at: Date.now(), roots }
}

/**
 * 请求的路径（解析 realpath 后）是否落在某个用户授权目录内。
 * 用于 cwd 不是注册 workspace 时判断这次读取是否有明确授权。
 */
async function requestedPathInExtraRoots(cwd, requestedPath, roots) {
  if (!Array.isArray(roots) || roots.length === 0) return false
  if (typeof cwd !== 'string' || cwd === '' || typeof requestedPath !== 'string' || requestedPath === '') return false
  let target
  try {
    target = await realpath(isAbsolute(requestedPath) ? requestedPath : resolve(cwd, requestedPath))
  } catch {
    return false
  }
  return roots.some(root => isSameOrInside(root, target))
}

/**
 * 展示读取的根目录是否可信：必须等于某个已注册 workspace 的规范路径，或位于
 * 它之下（会话 cwd 通常就是 workspace 根）。
 *
 * `/read` 的 `cwd` 来自浏览器请求；如果只按“调用方给的根”做 realpath 围栏，
 * 任何同源脚本都能把根设成 `/` 或盘符根读取宿主可读的任意小文件（浏览器信任
 * 边界挡不住同源第三方主题/插件）。这里用 DSH 的 `workspaceRegistry` 把读取
 * 限定在用户真正打开过的工作区；registry 不存在（嵌入式/旧 profile）时保持
 * 既有行为，避免破坏历史回放。
 *
 * @param {object} ctx - Host 插件 context。
 * @param {string} cwd - 请求方给出的读取根。
 * @returns {Promise<boolean>}
 */
async function readRootAllowed(ctx, cwd) {
  let registry
  try {
    registry = typeof ctx?.get === 'function' ? ctx.get('workspaceRegistry') : undefined
  } catch {
    registry = undefined
  }
  if (registry === null || registry === undefined || typeof registry.list !== 'function') {
    // 没有 workspace 服务：保持 1.4.1 之前的“调用方根 + realpath 围栏”行为。
    return true
  }
  let canonical
  try {
    canonical = await realpath(cwd)
  } catch {
    return false
  }
  let workspaces
  try {
    workspaces = registry.list()
  } catch {
    // 服务存在但不可用：fail-closed，展示读取降级为差异块。
    return false
  }
  if (!Array.isArray(workspaces)) return false
  for (const workspace of workspaces) {
    const root = workspace !== null && typeof workspace === 'object' ? workspace.path : undefined
    if (typeof root !== 'string' || root === '') continue
    if (isSameOrInside(root, canonical)) return true
  }
  return false
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
async function readDisplayTarget(cwd, requestedPath, extraRoots = []) {
  const target = await resolveReadTarget(cwd, requestedPath, extraRoots)
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
  const text = decodeDisplayText(bytes)
  if (text === null) return { kind: 'binary', size: target.size }
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
  // DNS rebinding 的第二道：Host 写成 loopback 但 TCP 对端不是本机 → 拒绝。
  // 回退围栏本来就在没有 connection 服务时使用；真实 Node 请求一定有 socket。
  if (loopback) {
    const peer = peerAddressOf(req)
    if (peer !== undefined && !isLoopbackPeer(peer)) return false
  }
  if (headerOf(headers, 'sec-fetch-site') === 'cross-site') return false
  const origin = headerOf(headers, 'origin')
  if (origin === undefined) return true
  return isSameAuthorityOrigin(origin, host)
}

/** 取 TCP 对端地址；单测的伪请求不一定有 socket。 */
function peerAddressOf(req) {
  const address = req !== null && typeof req === 'object' ? req.socket?.remoteAddress : undefined
  return typeof address === 'string' && address !== '' ? address : undefined
}

/** 对端地址是否 loopback（兼容 IPv4-mapped IPv6 与带方括号的 ::1）。 */
function isLoopbackPeer(address) {
  if (typeof address !== 'string') return false
  const value = address.toLowerCase().startsWith('::ffff:') ? address.slice(7) : address
  return value === '::1' || isLoopbackHostname(value)
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
// 版本与更新（设置页自带的检查更新 / 更新 / 回退）
// ---------------------------------------------------------------------------

/** npm 包名兜底值：正常情况下从本目录的 package.json 读取，改名后无需改 Host 代码。 */
const UPDATE_PACKAGE_FALLBACK = '@him666233/dsh-inline-diff'
const UPDATE_FETCH_TIMEOUT_MS = 12_000
const UPDATE_CACHE_TTL_MS = 60_000
const UPDATE_INSTALL_TIMEOUT_MS = 240_000
const UPDATE_LOG_CAP = 16 * 1024
const UPDATE_ERROR_TAIL_CAP = 4_000
/** registry packument 响应上限：正常只有 ~10KB，2MB 足以覆盖且防止恶意超大响应撑内存。 */
const REGISTRY_MAX_CHARS = 2 * 1024 * 1024
/** 版本列表最多保留多少条（防止异常 packument 生成超大数组）。 */
const REGISTRY_MAX_VERSIONS = 200
/** profile 名白名单：只允许常见字符，防止被当成 CLI 选项或路径片段。 */
const PROFILE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

/** registry 列表缓存（Host 进程级）。 */
let updateCache = { at: 0, data: null }
/** 同一进程内只允许一个安装任务（CLI 自身还有跨进程文件锁）。 */
let updateBusy = false

/** 本插件 Host 半区所在目录（读自己的 package.json 取当前版本）。 */
function selfDir() {
  return dirname(fileURLToPath(import.meta.url))
}

/** 安全读 JSON；缺失/损坏返回 null。 */
async function readJsonSafe(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return null
  }
}

/** 当前已加载的插件版本（来自安装目录的 package.json）。 */
async function currentPluginVersion() {
  const manifest = await readJsonSafe(join(selfDir(), 'package.json'))
  return typeof manifest?.version === 'string' ? manifest.version : null
}

/** 进程级包名缓存；package.json 不可读时回退到发布包名。 */
let packageNameCache = null

/**
 * 本插件自己的 npm 包名（唯一事实来源：本目录的 package.json）。
 *
 * `scripts/set-package-name.mjs` 会同步清单 / patch / client.js / README，但
 * 不会改 Host 代码；如果这里写死旧包名，改名后「检查更新 / 安装」会去查旧包。
 * 读不到清单时回退到发布包名，功能不中断。
 *
 * @returns {string}
 */
function updatePackageName() {
  if (packageNameCache !== null) return packageNameCache
  try {
    const manifest = JSON.parse(readFileSync(join(selfDir(), 'package.json'), 'utf8'))
    if (typeof manifest?.name === 'string' && /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(manifest.name)) {
      packageNameCache = manifest.name
      return packageNameCache
    }
  } catch {
    // 包清单缺失/损坏：回退兜底值，更新面板仍可显示（安装会失败并回滚）。
  }
  packageNameCache = UPDATE_PACKAGE_FALLBACK
  return packageNameCache
}

/** npm registry 的 packument 地址（作用域斜杠编码为 %2F，@ 保留字面量）。 */
function registryUrlOf(packageName) {
  return `https://registry.npmjs.org/${packageName.startsWith('@') ? packageName.replace('/', '%2F') : packageName}`
}

/**
 * 当前 profile 的上下文。优先用 DSH 文档化的 profileContext 服务；取不到时
 * 回退解析 `--profile <name>` / DSH_PROFILE 环境变量（Web CLI 启动场景）。
 */
function profileContextOf(ctx) {
  try {
    const pc = typeof ctx?.get === 'function' ? ctx.get('profileContext') : undefined
    if (pc !== null && typeof pc === 'object' && typeof pc.name === 'string' && PROFILE_NAME_PATTERN.test(pc.name)) return pc
  } catch {
    // 服务不可用：继续回退。
  }
  const argv = Array.isArray(process.argv) ? process.argv : []
  let name = typeof process.env.DSH_PROFILE === 'string' ? process.env.DSH_PROFILE : null
  for (let index = 0; index < argv.length - 1; index += 1) {
    if (argv[index] === '--profile' && typeof argv[index + 1] === 'string') name = argv[index + 1]
  }
  if (name === null || name === '' || !PROFILE_NAME_PATTERN.test(name)) return null
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
    ? process.env.DSH_HOME
    : join(homedir(), '.dsh')
  return { name, dir: join(home, 'profiles', name) }
}

/** 是否运行在桌面 Electron 宿主里（桌面端 v1 只读展示 + 手动命令）。 */
function isDesktopHost() {
  if (process.versions?.electron !== undefined) return true
  // 只匹配独立路径段，避免工作区里恰好含 dsh-desktop-host 字样的路径误命中。
  return Array.isArray(process.argv)
    && process.argv.some(value => /(^|[\\/])dsh-desktop-host([\\/]|$)/.test(String(value)))
}

/** semver 解析；非 semver 返回 null。 */
function parseSemver(text) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(text).trim())
  if (match === null) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] === undefined ? [] : match[4].split('.'),
  }
}

/** semver 比较：a<b 返回负数，a==b 返回 0，a>b 返回正数（含 prerelease 规则）。 */
function compareSemver(left, right) {
  const a = parseSemver(left)
  const b = parseSemver(right)
  if (a === null || b === null) return 0
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] - b[key]
  }
  if (a.pre.length === 0 && b.pre.length === 0) return 0
  if (a.pre.length === 0) return 1
  if (b.pre.length === 0) return -1
  const length = Math.max(a.pre.length, b.pre.length)
  for (let index = 0; index < length; index += 1) {
    const x = a.pre[index]
    const y = b.pre[index]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const xn = /^\d+$/.test(x) ? Number(x) : null
    const yn = /^\d+$/.test(y) ? Number(y) : null
    if (xn !== null && yn !== null) {
      if (xn !== yn) return xn - yn
      continue
    }
    if (xn !== null) return -1
    if (yn !== null) return 1
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/** 把 registry packument 收窄成设置页可用的版本列表。 */
function normalizeRegistry(document) {
  const latest = typeof document?.['dist-tags']?.latest === 'string' ? document['dist-tags'].latest : null
  const time = document?.time !== null && typeof document?.time === 'object' ? document.time : {}
  const versions = []
  for (const [version, meta] of Object.entries(document?.versions ?? {})) {
    if (parseSemver(version) === null) continue
    const hasBundle = meta?.dsh !== null && typeof meta?.dsh === 'object' && meta.dsh.bundle !== undefined && meta.dsh.bundle !== null
    // 占位/坏包（例如 0.0.0-stage）没有 dsh.bundle 且 tarball 元数据损坏，安装会
    // 在 pnpm 重试数分钟后失败：直接标记为不可安装，避免用户踩坑。
    const stub = meta?.stub === true || !hasBundle
    versions.push({
      version,
      publishedAt: typeof time[version] === 'string' ? time[version] : null,
      latest: latest === version,
      deprecated: typeof meta?.deprecated === 'string' ? meta.deprecated : null,
      enginesDsh: typeof meta?.engines?.dsh === 'string' ? meta.engines.dsh : null,
      bundleMissing: !hasBundle,
      installable: !stub,
    })
  }
  versions.sort((a, b) => compareSemver(b.version, a.version))
  return { latest, versions: versions.slice(0, REGISTRY_MAX_VERSIONS) }
}

/** 拉取 npm registry 版本列表（带超时与 60s 缓存）。 */
async function fetchRegistryVersions(force) {
  if (force !== true && updateCache.data !== null && Date.now() - updateCache.at < UPDATE_CACHE_TTL_MS) {
    return updateCache.data
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPDATE_FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(registryUrlOf(updatePackageName()), {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`registry responded ${response.status}`)
    // 先按 Content-Length 与正文长度双重限制，再 JSON.parse：即使 registry/代理
    // 返回异常超大响应，也不会在 Host 进程里分配无界内存。
    const declared = Number(response.headers.get('content-length') ?? '0')
    if (Number.isFinite(declared) && declared > REGISTRY_MAX_CHARS) throw new Error('registry response too large')
    const bodyText = await response.text()
    if (bodyText.length > REGISTRY_MAX_CHARS) throw new Error('registry response too large')
    let document
    try {
      document = JSON.parse(bodyText)
    } catch {
      throw new Error('registry response is not valid JSON')
    }
    if (document === null || typeof document !== 'object' || Array.isArray(document)) {
      throw new Error('registry response has unexpected shape')
    }
    const data = normalizeRegistry(document)
    updateCache = { at: Date.now(), data }
    return data
  } finally {
    clearTimeout(timer)
  }
}

/** 当前 profile 的安装方式：Web 可一键调用官方 CLI；桌面端降级为手动命令。 */
function installerInfo(pc) {
  const name = pc?.name ?? 'web'
  const anchor = typeof pc?.installAnchor === 'string' ? pc.installAnchor : null
  // installAnchor 必须是当前安装锚点里的 @deepseek-ai/dsh/package.json；否则视为
  // 不可用（宁可降级为手动命令，也不从任意路径 spawn）。
  const anchorLooksExpected = anchor !== null
    && /[\\/]node_modules[\\/]@deepseek-ai[\\/]dsh[\\/]package\.json$/.test(anchor)
  const cliRoot = anchorLooksExpected ? dirname(anchor) : null
  const cliBin = cliRoot === null ? null : join(cliRoot, 'lib', 'bin.js')
  const command = `dsh plugin --profile ${name} add ${updatePackageName()}@<version>`
  if (isDesktopHost()) {
    return { mode: 'manual', platform: 'desktop', command, cliBin: null, reason: 'desktop-requires-exit' }
  }
  if (cliBin === null || !isAbsolute(cliBin) || !existsSync(cliBin)) {
    return { mode: 'manual', platform: 'web', command, cliBin: null, reason: 'cli-not-found' }
  }
  return { mode: 'cli', platform: 'web', command, cliBin, reason: null }
}

/** 读取 profile 里已安装的插件版本；读不到返回 null。 */
async function installedVersionAt(pc) {
  if (pc === null || typeof pc.dir !== 'string') return null
  const manifest = await readJsonSafe(join(pc.dir, 'node_modules', updatePackageName(), 'package.json'))
  return typeof manifest?.version === 'string' ? manifest.version : null
}

/** 读取 profile 绑定的 DSH 版本（installAnchor 指向 @deepseek-ai/dsh/package.json）。 */
async function dshVersionAt(pc) {
  if (pc === null || typeof pc.installAnchor !== 'string') return null
  const manifest = await readJsonSafe(pc.installAnchor)
  return typeof manifest?.version === 'string' ? manifest.version : null
}

/** 在子进程里跑官方 CLI 的 plugin add；返回结构化结果（含日志尾部）。 */
function runPluginInstall(pc, version, installer) {
  return new Promise((resolveResult) => {
    const spec = `${updatePackageName()}@${version}`
    const command = `dsh plugin --profile ${pc.name} add ${spec}`
    const args = [installer.cliBin, 'plugin', '--profile', pc.name, 'add', spec]
    if (typeof installer.cliBin !== 'string' || !isAbsolute(installer.cliBin) || !PROFILE_NAME_PATTERN.test(pc.name)) {
      resolveResult({ ok: false, code: 'installer-unavailable', command })
      return
    }
    let child
    try {
      child = spawn(process.execPath, args, {
        cwd: typeof pc.dir === 'string' && isAbsolute(pc.dir) ? pc.dir : process.cwd(),
        windowsHide: true,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        // POSIX：让 CLI 自成一个进程组，超时时可以整组 SIGKILL；否则 pnpm 的
        // 孙进程会留在机器上（Windows 走 taskkill /T，见下面的超时分支）。
        detached: process.platform !== 'win32',
      })
    } catch (error) {
      resolveResult({ ok: false, code: 'spawn-failed', command, logTail: String(error?.message ?? '') })
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolveResult({ ...result, command })
    }
    child.stdout?.on('data', (chunk) => { stdout = (stdout + String(chunk)).slice(-UPDATE_LOG_CAP) })
    child.stderr?.on('data', (chunk) => { stderr = (stderr + String(chunk)).slice(-UPDATE_LOG_CAP) })
    child.on('error', (error) => finish({ ok: false, code: 'spawn-failed', logTail: String(error?.message ?? '') }))
    child.on('close', (code) => {
      const logTail = (stderr + stdout).slice(-UPDATE_ERROR_TAIL_CAP)
      finish({ ok: code === 0, code: code === 0 ? 'ok' : `exit-${code}`, exitCode: code, logTail })
    })
    const timer = setTimeout(() => {
      try {
        if (process.platform === 'win32') {
          // npm/pnpm 会拉起子进程树：只 kill 父进程会留下孤儿，因此用 taskkill /T。
          // spawn 失败时 pid 可能缺失，不能把 "undefined" 传给 taskkill。
          if (Number.isInteger(child.pid)) spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true }).on('error', () => {})
        } else {
          // 子进程在独立进程组里（detached），负 pid 杀整组；失败再退回只杀直接子进程。
          try {
            if (Number.isInteger(child.pid)) process.kill(-child.pid, 'SIGKILL')
            else child.kill('SIGKILL')
          } catch {
            child.kill('SIGKILL')
          }
        }
      } catch {
        // 尽力而为：超时返回状态仍然明确。
      }
      finish({ ok: false, code: 'timeout', logTail: (stderr + stdout).slice(-UPDATE_ERROR_TAIL_CAP) })
    }, UPDATE_INSTALL_TIMEOUT_MS)
  })
}

/** GET /update/versions 的响应体。 */
async function updateVersionsPayload(ctx, force) {
  const pc = profileContextOf(ctx)
  const [current, registry, dshVersion] = await Promise.all([
    currentPluginVersion(),
    fetchRegistryVersions(force),
    dshVersionAt(pc),
  ])
  const installed = await installedVersionAt(pc)
  const installer = installerInfo(pc)
  return {
    ok: true,
    current: installed ?? current,
    loaded: current,
    dshVersion,
    latest: registry.latest,
    // 只回传 profile 名称：绝对路径属于本机信息，UI 也不需要，避免不必要地暴露。
    profile: pc === null ? null : { name: pc.name },
    installer,
    versions: registry.versions,
  }
}

/** POST /update/install 的核心：校验版本 → 跑 CLI → 复核安装结果。 */
async function performUpdate(ctx, body) {
  const version = body?.version
  if (typeof version !== 'string' || version.length > 100 || parseSemver(version) === null) {
    return { status: 400, payload: { ok: false, code: 'invalid-version' } }
  }
  const pc = profileContextOf(ctx)
  if (pc === null) return { status: 400, payload: { ok: false, code: 'profile-unknown' } }
  const installer = installerInfo(pc)
  if (installer.mode !== 'cli') {
    return {
      status: 400,
      payload: {
        ok: false,
        code: installer.reason ?? 'manual-required',
        command: `${installer.command.replace('@<version>', `@${version}`)}`,
      },
    }
  }
  const registry = await fetchRegistryVersions(false)
  const entry = registry.versions.find(item => item.version === version)
  if (entry === undefined) return { status: 400, payload: { ok: false, code: 'version-not-found' } }
  if (entry.installable !== true) return { status: 400, payload: { ok: false, code: 'version-not-installable' } }
  if (updateBusy) return { status: 409, payload: { ok: false, code: 'busy' } }
  updateBusy = true
  try {
    const result = await runPluginInstall(pc, version, installer)
    if (!result.ok) return { status: 200, payload: { ok: false, code: result.code, logTail: result.logTail, command: result.command } }
    const installed = await installedVersionAt(pc)
    if (installed !== version) {
      return { status: 200, payload: { ok: false, code: 'verify-failed', installedVersion: installed, logTail: result.logTail, command: result.command } }
    }
    // 安装成功：下次进程启动才加载新代码，因此必须提示重启（页面刷新不够）。
    updateCache = { at: 0, data: null }
    return {
      status: 200,
      payload: { ok: true, installedVersion: installed, restartRequired: true, logTail: result.logTail, command: result.command },
    }
  } finally {
    updateBusy = false
  }
}

// ---------------------------------------------------------------------------
// 工具清单（第三方工具兼容）
// ---------------------------------------------------------------------------

/**
 * 每个插件 ctx 一份 `/tools` 应答缓存：工具注册/卸载（`tools/change`）时失效。
 *
 * 为什么要 Host 半侧提供清单：浏览器半侧的 keyed `tool.call.toolview` 只能按
 * wire 工具名注册视图，DSH 自己只认识内建工具；第三方插件（dsh-ssh、MCP 等）
 * 注册的工具名客户端无从得知，只能由 Host 从 `tools.definitions()` 导出。
 * 该路由只读、不落盘、不包含参数或结果。
 */
const toolNamesByContext = new WeakMap()

/** 取当前进程的 tools 服务；不同 profile/嵌入式宿主缺失时返回 undefined。 */
function toolsServiceOf(ctx) {
  try {
    if (ctx !== null && typeof ctx === 'object' && typeof ctx.get === 'function') {
      const service = ctx.get('tools')
      if (service !== null && typeof service === 'object') return service
    }
  } catch {
    // 版本漂移 / 服务尚未就绪：按“没有工具清单”处理，客户端继续用内建清单。
  }
  return undefined
}

/**
 * 当前可见工具的 wire 名（去重、排序、有界）。任何异常都返回空数组，绝不让
 * 一个展示型路由把 Host 的 tools 服务拖进错误路径。
 *
 * 只读取**全局可见**定义；注册在某个 agent scope 里的工具不在其中（少数实验
 * 插件会这样做），那些工具仍走官方通用行。
 */
export function visibleToolNames(ctx) {
  if (ctx !== null && typeof ctx === 'object' && toolNamesByContext.has(ctx)) return toolNamesByContext.get(ctx)
  const names = []
  const tools = toolsServiceOf(ctx)
  // 服务尚未就绪时不缓存空结果：之后挂载 tools 服务的宿主仍能拿到真实清单。
  if (tools === undefined) return []
  try {
    let definitions
    if (typeof tools.definitions === 'function') definitions = tools.definitions()
    else if (typeof tools.schemas === 'function') definitions = tools.schemas()
    if (Array.isArray(definitions)) {
      for (const definition of definitions) {
        const name = definition !== null && typeof definition === 'object' ? definition.name : undefined
        if (typeof name !== 'string' || name === '' || name.length > MAX_TOOL_NAME_LENGTH) continue
        names.push(name)
        if (names.length >= MAX_TOOL_NAMES) break
      }
    }
  } catch {
    return []
  }
  names.sort()
  const unique = [...new Set(names)]
  if (ctx !== null && typeof ctx === 'object') toolNamesByContext.set(ctx, unique)
  return unique
}

/** 工具注册表变化时丢弃缓存，下一次 `/tools` 重新读取。 */
export function invalidateToolNames(ctx) {
  if (ctx !== null && typeof ctx === 'object') toolNamesByContext.delete(ctx)
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
    if (req.method === 'GET' && route === API_PREFIX + '/tools') {
      // 第三方工具兼容：浏览器半侧按这份清单为“官方没有视图”的工具名注册
      // 展开风格行。只回工具名，不回 schema、参数或结果。
      respond(res, 200, { ok: true, tools: visibleToolNames(ctx) })
      return
    }
    if (req.method === 'GET' && route === API_PREFIX + '/read-roots') {
      // 用户显式授权的工作区外可读目录；设置页读取当前清单。
      respond(res, 200, { ok: true, roots: await loadReadRoots(), max: READ_ROOTS_MAX })
      return
    }
    if (req.method === 'GET' && route === API_PREFIX + '/update/versions') {
      const refresh = /[?&]refresh=1(?:&|$)/.test(String(req?.url ?? ''))
      try {
        respond(res, 200, await updateVersionsPayload(ctx, refresh))
      } catch {
        respond(res, 200, { ok: false, code: 'registry-unreachable' })
      }
      return
    }
    if (req.method !== 'POST') {
      fail(res, 405, 'POST only')
      return
    }
    // 2. 先认 action 再读 body：未知路径不消耗解析预算。
    const action = actionOf(route)
    if (action !== 'snapshot' && action !== 'read' && action !== 'update/install' && action !== 'read-roots') {
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
    if (action === 'read-roots') {
      try {
        const roots = await normalizeReadRoots(body.roots, true)
        await saveReadRoots(roots)
        respond(res, 200, { ok: true, roots })
      } catch (error) {
        const code = error instanceof RequestError && typeof error.code === 'string' ? error.code : 'invalid-roots'
        // 设置页按稳定 code 显示本地化文案；不把 fs 错误/绝对路径回给浏览器。
        respond(res, error instanceof RequestError && error.status === 500 ? 500 : 400, { ok: false, code })
      }
      return
    }
    if (action === 'update/install') {
      const result = await performUpdate(ctx, body)
      respond(res, result.status, result.payload)
      return
    }
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
    if (typeof body.cwd !== 'string' || body.cwd === '') {
      fail(res, 400, 'cwd is required')
      return
    }
    if (typeof body.path !== 'string' || body.path === '') {
      fail(res, 400, 'path is required')
      return
    }
    // 只允许读用户真正打开过的工作区（或其子目录），或用户显式授权的额外目录；
    // 同源脚本不能把根设成盘符根/`/` 来读取宿主任意文件。
    const extraRoots = await loadReadRoots()
    if (!(await readRootAllowed(ctx, body.cwd)) && !(await requestedPathInExtraRoots(body.cwd, body.path, extraRoots))) {
      fail(res, 403, 'workspace is not registered')
      return
    }
    if (activeReads >= MAX_CONCURRENT_READS) {
      // 429 而不是排队：显示型读取失败时浏览器本来就会回退为差异块展示。
      fail(res, 429, 'too many concurrent reads')
      return
    }
    activeReads++
    try {
      const result = await readDisplayTarget(body.cwd, body.path, extraRoots)
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

  // 工具注册表变化（插件挂载/卸载、MCP 工具刷新）→ 丢弃 `/tools` 缓存，
  // 下一次请求即可看到新工具。事件没有负载，只用来失效。
  ctx.effect(() => ctx.on('tools/change', () => {
    invalidateToolNames(ctx)
  }), 'dsh-inline-diff: tool list cache')

  // 同源展示 API。每个路由条目都是 effect 持有的资源（dispose 时自动注销）。
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      await handleRequest(ctx, req, res)
    },
  }), 'dsh-inline-diff: display api')
}
