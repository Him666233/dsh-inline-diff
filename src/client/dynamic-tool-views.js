/**
 * 第三方工具视图的“动态兜底注册”控制器（纯逻辑 + 注入依赖，可在 Node 里单测）。
 *
 * 问题：DSH 的 keyed `tool.call.toolview` 按 wire 工具名分发，官方只给内建工具
 * 注册了视图；第三方插件（dsh-ssh 的 ssh_*、MCP 桥接的工具等）注册的工具名
 * 客户端事先不知道，只能向 Host 要。Host 半侧 `/tools` 返回当前可见工具名后，
 * 本控制器负责把“没有人注册视图”的工具补成设置里的展开风格行。
 *
 * 关键约束（按优先级）：
 *   1. **让位于已有视图**：`tool.call.toolview` 里已经出现同名 key（官方富结果
 *      卡片、第三方定制行）时绝不覆盖；动态注册后若别的注册者后来也注册了同
 *      key，控制器释放自己的兜底视图，让原注册者接管。
 *   2. **只做展示**：这里只关心工具名与槽位注册，不读参数/结果、不碰网络以外
 *      的东西；取不到清单或注册失败时保持官方通用行，不抛错。
 *   3. **有界**：单轮注册数有上限（tool-catalog.js），刷新有间隔，可随时
 *      dispose；设置切回“DSH 原生”立即释放全部动态视图并停止轮询。
 *
 * 依赖注入：slots 只用到 `entries(key)` 与 `subscribe(key, fn)`；注册动作由调用
 * 方提供 `register(key) => disposer | null`（组件、i18n 包装保持在 index.jsx），
 * 定时器可替换，便于测试。
 */
import { selectDynamicToolKeys, TOOL_CATALOG_REFRESH_MS } from './tool-catalog.js'

/**
 * 创建动态兜底注册控制器。
 *
 * @param {object} options
 * @param {{ entries: (key: string) => readonly object[], subscribe?: (key: string, fn: () => void) => () => void }} options.slots
 *   客户端槽位服务（只使用 entries / subscribe）。
 * @param {Iterable<string>} options.known - 本插件已按设置接管的工具名。
 * @param {() => boolean} options.isEnabled - 当前设置是否启用“其它工具调用 = 展开风格”。
 * @param {() => Promise<string[]|null>} options.fetchNames - 读取 Host 工具名清单。
 * @param {(key: string) => (() => void)|null} options.register - 为一个工具名注册
 *   展开风格视图；失败返回 null（调用方负责打印诊断）。
 * @param {number} [options.refreshMs] - 轮询间隔（默认 30s）。
 * @param {(fn: () => void, ms: number) => unknown} [options.setTimeoutFn] - 定时器注入（测试用）。
 * @param {(handle: unknown) => void} [options.clearTimeoutFn] - 定时器清理（测试用）。
 * @returns {{ refresh: () => Promise<void>, stepAside: () => void, setEnabled: (enabled: boolean) => Promise<void>|undefined, dispose: () => void, keys: () => string[] }}
 */
export function createDynamicToolViews(options) {
  const { slots, known, isEnabled, fetchNames, register } = options
  const refreshMs = Number.isFinite(options.refreshMs) && options.refreshMs > 0 ? options.refreshMs : TOOL_CATALOG_REFRESH_MS
  const setTimeoutFn = typeof options.setTimeoutFn === 'function' ? options.setTimeoutFn : setTimeout
  const clearTimeoutFn = typeof options.clearTimeoutFn === 'function' ? options.clearTimeoutFn : clearTimeout
  const knownSet = known instanceof Set ? known : new Set(known ?? [])
  /** 旧版 DSH 可能没有公开的 `slots.entries`；没有占用查询就绝不能猜。 */
  const canInspectOccupancy = typeof slots?.entries === 'function'
  /** key → disposer（只装本控制器注册的兜底视图）。 */
  const views = new Map()
  let disposed = false
  let refreshing = false
  let timer = null
  let enabled = false

  /** 当前 `tool.call.toolview` 里某个 key 的注册条数（槽位没有占用查询 API）。 */
  const entryCount = key => {
    try {
      const entries = typeof slots?.entries === 'function' ? slots.entries('tool.call.toolview') : []
      if (!Array.isArray(entries)) return 0
      let count = 0
      for (const entry of entries) if (entry?.options?.key === key) count += 1
      return count
    } catch {
      return 0
    }
  }

  /** 释放一个动态视图；disposer 抛错只打印，不影响其它 key。 */
  const release = key => {
    const dispose = views.get(key)
    if (dispose === undefined) return
    views.delete(key)
    try {
      dispose()
    } catch (error) {
      console.warn(`[dsh-inline-diff] failed to release dynamic tool view "${key}"`, error)
    }
  }

  const clear = () => {
    for (const key of [...views.keys()]) release(key)
  }

  const clearTimer = () => {
    if (timer === null) return
    clearTimeoutFn(timer)
    timer = null
  }

  const schedule = () => {
    if (disposed || !enabled) {
      clearTimer()
      return
    }
    clearTimer()
    timer = setTimeoutFn(() => {
      timer = null
      void refresh()
    }, refreshMs)
  }

  /**
   * 刷新一轮：取 Host 工具清单 → 过滤掉内建/已占用 → 注册兜底视图。
   *
   * 并发保护：上一轮未结束时直接返回（焦点事件与 30s 轮询可能撞车）。
   */
  async function refresh() {
    if (disposed || refreshing || !enabled) return
    // 没有 `slots.entries()` 就无法判断某个工具是否已有视图；此时宁可退回内建
    // 清单，也不冒险覆盖官方富卡片（回退：官方通用行，不抛错）。
    if (!canInspectOccupancy) return
    refreshing = true
    try {
      const names = await fetchNames()
      if (disposed || !enabled) return
      if (!Array.isArray(names)) return
      // 已被别的注册者占用的 key（官方富卡片 / 第三方定制行）：让位。
      const claimed = new Set()
      for (const name of names) {
        if (knownSet.has(name) || views.has(name)) continue
        if (entryCount(name) > 0) claimed.add(name)
      }
      const selected = selectDynamicToolKeys(names, { known: knownSet, claimed, already: views.keys() })
      for (const key of selected) {
        if (disposed || !enabled) return
        // select 与注册之间没有 await，仍再查一次占用，避免与同 tick 的注册撞车。
        if (entryCount(key) > 0) continue
        const dispose = register(key)
        if (typeof dispose === 'function') views.set(key, dispose)
      }
    } catch (error) {
      // 展示型功能：任何失败都退回官方通用行，不向渲染层抛错。
      console.warn('[dsh-inline-diff] cannot refresh third-party tool views', error)
    } finally {
      refreshing = false
      schedule()
    }
  }

  /**
   * 让位：动态 key 出现第二份注册（官方/第三方后来注册了视图）时释放兜底。
   * 槽位变更事件是微任务批处理的，不会在注册当下同步重入。
   */
  function stepAside() {
    if (disposed) return
    for (const key of [...views.keys()]) {
      if (entryCount(key) > 1) release(key)
    }
  }

  /**
   * 跟随设置开关：关闭时立即释放全部动态视图并停止轮询；开启时立刻补一轮。
   *
   * 返回这一轮刷新的 Promise（没有可等待的刷新时为 undefined），便于调用方
   * 在测试里等注册完成；生产路径不依赖返回值。
   *
   * @param {boolean} next
   * @returns {Promise<void>|undefined}
   */
  function setEnabled(next) {
    if (disposed) return undefined
    enabled = next === true
    if (!enabled) {
      clearTimer()
      clear()
      return undefined
    }
    const pending = refresh()
    schedule()
    return pending
  }

  /** 注销全部动态视图、停止轮询；可重复调用。 */
  function dispose() {
    if (disposed) return
    disposed = true
    clearTimer()
    clear()
  }

  /** 当前已动态注册的工具名（诊断/测试用）。 */
  function keys() {
    return [...views.keys()]
  }

  return { refresh, stepAside, setEnabled, dispose, keys }
}
