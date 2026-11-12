/**
 * 插件的浏览器侧 Host API 客户端（唯一网络出口）。
 *
 * 职责：用 fetch 调用 Host 半侧（plugin/index.js）注册的同源前缀路由：
 *   POST /dsh-inline-diff/api/snapshot  { sessionId, callId }  → 精确执行快照
 *   POST /dsh-inline-diff/api/read      { cwd, path }          → 工作区文件文本
 * 并把响应收窄成展示层可用的形状；另带两个带预算的内存缓存，避免同一卡片因
 * 重渲染反复请求。
 *
 * 依赖：浏览器 fetch / AbortController（无第三方依赖）。
 * 输入输出：
 *   - fetchSnapshot(sessionId, callId) → { path, before, after, operation } | null
 *   - fetchFileText(cwd, path) → { kind:'text', text, size } | { kind:'binary'|
 *     'oversized', size } | null
 *   - cachedFileText / cachedSnapshot：带缓存的包装；
 *   - invalidateFileCache：显式失效一条文件缓存；
 *   - API_PREFIX：路由前缀常量（与 Host 侧保持一致）。
 *
 * 失败与回退（README「多级回退与容错」的 Host API 行）：
 *   - 每次请求有 10s 超时（AbortController），Host 卡死也不会冻结会话；
 *   - 非 2xx、超时、网络错误、响应不是 JSON 对象 —— 一律返回 null，不向渲染层
 *     抛错。调用方（model.js / components.jsx）把 null 当作“快照/文件不可用”，
 *     继续走下一级回退：元数据差异块 → 参数预览 → 「没有可展示的差异」；
 *   - 快照首次为 null 时做一次 180ms 延时重试：Host 的捕获监听器与浏览器的
 *     首次渲染天然存在竞态，短重试能补上“结果刚落地、快照刚写入”的窗口，又
 *     不会拖慢行渲染；缓存里用 null 记住“查过但没有”，重试只发生一次；
 *   - 缓存均有条数上限（文件 24 条 / 快照 160 条）与 TTL（文件 15s），超限从
 *     最旧条目开始淘汰，避免长会话无限增长。
 */
export const API_PREFIX = '/dsh-inline-diff/api'

/** 单个请求的硬超时：Host 卡住时宁可降级展示也不拖住会话渲染。 */
const TIMEOUT_MS = 10_000

/**
 * 执行一次 POST 调用并把响应收窄为对象。
 *
 * @param {'snapshot'|'read'} action - 路由 action。
 * @param {object} payload - JSON 请求体。
 * @returns {Promise<object|null>} 解析后的对象；任何失败都返回 null。
 */
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
    // 非 2xx（如 403 / 415 / 429）不抛错：调用方按“不可用”降级。
    if (!response.ok) return null
    const data = await response.json()
    return data !== null && typeof data === 'object' ? data : null
  } catch {
    // 网络错误 / 超时 / 响应不是合法 JSON：显示型请求失败即降级。
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 取一次成功 edit/write 的执行快照（Host 捕获的修改前/后全文）。
 *
 * 参数不合法（空 sessionId / 缺 callId）时直接返回 null，不浪费一次请求。
 * 响应逐字段收窄：`after` 必须是字符串才认为快照可用；`before` 缺失归一为
 * null（创建文件）；`operation` 缺失时按 before 推断 create/update。
 *
 * @param {string} sessionId
 * @param {string|number} callId
 * @returns {Promise<{path:string, before:string|null, after:string, operation:string}|null>}
 */
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

/**
 * 读取一个工作区文件（只用于展示：历史回放定位行号、全文对照）。
 *
 * Host 用 kind 显式表达降级：'text' 可展示；'binary' / 'oversized' 表示无法
 * 作为文本展示（卡片随后退回差异块/统计视图）。未知 kind 与失败都返回 null。
 *
 * @param {string} cwd - 会话工作区根目录。
 * @param {string} path - 文件路径（Host 侧还会做 realpath 围栏）。
 * @returns {Promise<{kind:string, text?:string, size?:number}|null>}
 */
export async function fetchFileText(cwd, path) {
  if (typeof cwd !== 'string' || cwd === '' || typeof path !== 'string' || path === '') return null
  const data = await call('read', { cwd, path })
  if (data === null || data.ok !== true) return null
  if (data.kind === 'text' && typeof data.text === 'string') return { kind: 'text', text: data.text, size: data.size }
  if (data.kind === 'binary') return { kind: 'binary', size: data.size }
  if (data.kind === 'oversized') return { kind: 'oversized', size: data.size }
  return null
}

/** 文件文本缓存：展示专用、短生命周期，按 (cwd,path) 键。 */
const FILE_CACHE_LIMIT = 24
const FILE_CACHE_TTL = 15_000
const fileCache = new Map()

/**
 * 把 Map 裁剪回条数预算内（FIFO：Map 的插入序就是淘汰序）。
 *
 * 文件缓存与快照缓存都有“条数上限 + 淘汰最旧”的需求，1.3.0 前两处各写了一遍
 * 相同的淘汰循环；这里共享一个纯工具函数，行为不变（都从 keys() 的第一个删）。
 *
 * @param {Map} map - 要裁剪的缓存。
 * @param {number} limit - 允许保留的最大条数。
 */
function trimCache(map, limit) {
  while (map.size > limit) {
    const oldest = map.keys().next().value
    if (oldest === undefined) break
    map.delete(oldest)
  }
}

/**
 * 带 TTL 的文件读取：同一 (cwd,path) 在 15s 内只请求一次。
 *
 * 命中时把条目重新插入 Map 末尾，把它变成“最近使用”（简易 LRU）。缓存值本身
 * 允许是 null（表示 Host 明确不可用），这样一次失败不会在 TTL 内被反复重试。
 *
 * @returns {Promise<object|null>} 同 fetchFileText。
 */
export async function cachedFileText(cwd, path) {
  // \u0000 作为分隔符：路径里不会出现 NUL，两个字段不会拼出歧义键。
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
  trimCache(fileCache, FILE_CACHE_LIMIT)
  return value
}

/** 丢弃一条文件缓存（例如之后要读更新后的文件内容时）。 */
export function invalidateFileCache(cwd, path) {
  fileCache.delete(`${cwd ?? ''}\u0000${path ?? ''}`)
}

/** 快照缓存：按 session+call 键，避免重渲染反复请求。 */
const SNAPSHOT_CACHE_LIMIT = 160
const snapshotCache = new Map()

/**
 * 每个调用只取一次快照。
 *
 * 语义细节：`has(key)` 为 true 时直接返回缓存值（可能是 null），即“查过但
 * 没有”，不会因卡片重渲染再次发请求；首次为 null 时等 180ms 再查一次，弥补
 * Host 捕获与客户端渲染的竞态。
 *
 * @returns {Promise<object|null>}
 */
export async function cachedSnapshot(sessionId, callId) {
  const key = `${sessionId ?? ''}\u0000${callId ?? ''}`
  if (snapshotCache.has(key)) return snapshotCache.get(key) ?? null
  let snapshot = await fetchSnapshot(sessionId, callId)
  if (snapshot === null) {
    // Host 的捕获监听器与客户端渲染天生存在竞态：一次短重试既补上“刚写入”
    // 的窗口，又不会拖住这一行（180ms 后无论结果如何都只查这一次）。
    await new Promise(resolve => setTimeout(resolve, 180))
    snapshot = await fetchSnapshot(sessionId, callId)
  }
  snapshotCache.set(key, snapshot)
  trimCache(snapshotCache, SNAPSHOT_CACHE_LIMIT)
  return snapshot
}

/* ------------------------------------------------------------------ */
/* 版本与更新（Host 代理 npm registry；浏览器不直连外网）                */
/* ------------------------------------------------------------------ */

/**
 * 读取可更新版本列表（Host 侧请求 registry 并缓存 60s）。
 *
 * @param {boolean} [refresh] true 时强制刷新 Host 缓存。
 * @returns {Promise<object|null>} Host 响应；失败/超时返回 null。
 */
export async function fetchUpdateInfo(refresh) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  try {
    const suffix = refresh === true ? '?refresh=1' : ''
    const response = await fetch(`${API_PREFIX}/update/versions${suffix}`, {
      credentials: 'include',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data !== null && typeof data === 'object' && data.ok === true ? data : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 安装指定版本（更新或回退）。Host 侧调用官方 CLI，失败时 CLI 会自行回滚。
 *
 * @param {string} version 目标版本。
 * @returns {Promise<object|null>} { ok, code?, installedVersion?, logTail?, command? }；网络失败返回 null。
 */
export async function performUpdate(version) {
  const controller = new AbortController()
  // CLI 安装最坏情况会因 pnpm 重试拖到分钟级；Host 侧自身 240s 超时并强制返回。
  const timer = setTimeout(() => controller.abort(), 260_000)
  try {
    const response = await fetch(`${API_PREFIX}/update/install`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ version }),
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
