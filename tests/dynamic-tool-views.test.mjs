/**
 * 第三方工具动态兜底视图控制器的行为测试（不依赖 DOM / React）。
 *
 * 覆盖：
 *   1. 只注册 Host 清单里“没人占用”的工具名；
 *   2. 本插件已有的工具名不重复注册；
 *   3. 官方/第三方后来注册同名视图时让位（释放兜底而不是覆盖）；
 *   4. 设置切回 DSH 原生立即释放并停止轮询；
 *   5. 取清单失败/返回 null 不抛错、不误注册；
 *   6. 并发刷新与重复释放都是安全 no-op。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { createDynamicToolViews } from '../src/client/dynamic-tool-views.js'

/**
 * 伪槽位服务：维护 entries 列表与 subscribe 监听器；register 由测试提供，
 * 成功时把一个同名 entry 放进列表，返回时把它移除。
 */
function createSlots() {
  const entries = []
  const listeners = new Set()
  return {
    entriesList: entries,
    entries() {
      return entries
    },
    subscribe(key, fn) {
      assert.equal(key, 'tool.call.toolview')
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    /** 模拟“官方/第三方”注册了一个同名视图，并触发槽位变更。 */
    addForeign(key) {
      const entry = { options: { key } }
      entries.push(entry)
      for (const listener of listeners) listener()
      return entry
    },
    listeners,
  }
}

/** 组装控制器：默认启用、Host 清单固定、注册成功（可注入失败）。 */
function setup(options = {}) {
  const slots = createSlots()
  for (const key of options.claimed ?? []) slots.entriesList.push({ options: { key } })
  let enabled = options.enabled !== false
  const timers = []
  const disposed = []
  const controller = createDynamicToolViews({
    slots,
    known: options.known ?? [],
    isEnabled: () => enabled,
    fetchNames: options.fetchNames ?? (async () => options.names ?? []),
    register: key => {
      if (options.failKeys?.includes(key)) return null
      const entry = { options: { key } }
      slots.entriesList.push(entry)
      let released = false
      return () => {
        if (released) return
        released = true
        disposed.push(key)
        const index = slots.entriesList.indexOf(entry)
        if (index >= 0) slots.entriesList.splice(index, 1)
      }
    },
    refreshMs: 1000,
    setTimeoutFn: (fn, ms) => {
      timers.push({ fn, ms })
      return timers.length
    },
    clearTimeoutFn: handle => {
      if (typeof handle === 'number') timers[handle - 1] = null
    },
  })
  return {
    controller,
    slots,
    timers,
    disposed,
    setEnabled(value) {
      enabled = value
    },
  }
}

test('registers only unclaimed third-party tool names from the host catalog', async () => {
  const env = setup({
    names: ['ssh_exec', 'ssh_upload', 'ssh_cluster'],
    known: ['bash', 'grep'],
    claimed: ['ssh_cluster'],
  })
  await env.controller.setEnabled(true)
  assert.deepEqual(env.controller.keys().sort(), ['ssh_exec', 'ssh_upload'])
  // 每个动态 key 都真的注册进了槽位（1 条自己，没有别的）。
  for (const key of ['ssh_exec', 'ssh_upload']) {
    assert.equal(env.slots.entriesList.filter(entry => entry.options.key === key).length, 1)
  }
  env.controller.dispose()
})

test('steps aside when another registrant claims the same key later', async () => {
  const env = setup({ names: ['ssh_exec'] })
  await env.controller.setEnabled(true)
  assert.deepEqual(env.controller.keys(), ['ssh_exec'])

  // 官方或第三方后来注册了 ssh_exec 的视图，并收到槽位变更。
  env.slots.addForeign('ssh_exec')
  env.controller.stepAside()

  assert.deepEqual(env.controller.keys(), [])
  assert.deepEqual(env.disposed, ['ssh_exec'])
  // 只剩下外来注册的那一条；本插件没有残留。
  assert.equal(env.slots.entriesList.filter(entry => entry.options.key === 'ssh_exec').length, 1)

  // 下一轮刷新不会再抢回来。
  await env.controller.refresh()
  assert.deepEqual(env.controller.keys(), [])
  env.controller.dispose()
})

test('a disabled setting releases every dynamic view and stops polling', async () => {
  const env = setup({ names: ['ssh_exec', 'ssh_upload'] })
  env.controller.setEnabled(true)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(env.controller.keys().length, 2)

  env.setEnabled(false)
  env.controller.setEnabled(false)
  assert.deepEqual(env.controller.keys(), [])
  assert.equal(env.slots.entriesList.length, 0)

  // 禁用状态下 refresh 不会注册任何东西。
  await env.controller.refresh()
  assert.deepEqual(env.controller.keys(), [])
  env.controller.dispose()
})

test('null or failing host catalogs never throw and never register', async () => {
  const nullCatalog = setup({ fetchNames: async () => null })
  await nullCatalog.controller.setEnabled(true)
  assert.deepEqual(nullCatalog.controller.keys(), [])
  assert.equal(nullCatalog.slots.entriesList.length, 0)
  nullCatalog.controller.dispose()

  const brokenCatalog = setup({ fetchNames: async () => { throw new Error('host offline') } })
  await assert.doesNotReject(() => brokenCatalog.controller.setEnabled(true))
  assert.deepEqual(brokenCatalog.controller.keys(), [])
  brokenCatalog.controller.dispose()
})

test('an older host without slots.entries never guesses slot occupancy', async () => {
  // 旧版 DSH 没有公开的 entries()：无法判断 key 是否已被官方富卡片占用，
  // 控制器必须整体失效，只保留内建清单，绝不去覆盖别人的视图。
  const registered = []
  const controller = createDynamicToolViews({
    slots: { subscribe: () => () => {} },
    known: [],
    isEnabled: () => true,
    fetchNames: async () => ['read', 'ssh_exec'],
    register: key => {
      registered.push(key)
      return () => {}
    },
    setTimeoutFn: () => 1,
    clearTimeoutFn: () => {},
  })
  await controller.setEnabled(true)
  assert.deepEqual(controller.keys(), [])
  assert.deepEqual(registered, [])
  assert.doesNotThrow(() => controller.stepAside())
  controller.dispose()
})

test('a failing register call does not abort the remaining keys', async () => {
  const env = setup({ names: ['ssh_exec', 'ssh_upload', 'ssh_cluster'], failKeys: ['ssh_upload'] })
  await env.controller.setEnabled(true)
  assert.deepEqual(env.controller.keys().sort(), ['ssh_cluster', 'ssh_exec'])
  env.controller.dispose()
})

test('concurrent refresh calls are coalesced and dispose is idempotent', async () => {
  let calls = 0
  const env = setup({
    fetchNames: async () => {
      calls += 1
      await new Promise(resolve => setTimeout(resolve, 5))
      return ['ssh_exec']
    },
  })
  const enabling = env.controller.setEnabled(true)
  const second = env.controller.refresh()
  const third = env.controller.refresh()
  await Promise.all([enabling, second, third])
  assert.equal(calls, 1)
  assert.deepEqual(env.controller.keys(), ['ssh_exec'])

  env.controller.dispose()
  env.controller.dispose()
  assert.deepEqual(env.controller.keys(), [])
  assert.equal(env.slots.entriesList.length, 0)
})

test('scheduling only happens while enabled and is cancelled by dispose', async () => {
  const env = setup({ names: ['ssh_exec'] })
  env.controller.setEnabled(true)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.ok(env.timers.filter(Boolean).length >= 1, 'enabling must schedule a refresh')

  // 触发一次计划中的刷新：重入是安全的。
  const pending = env.timers.filter(Boolean).at(-1)
  env.timers[env.timers.indexOf(pending)] = null // 已触发的定时器不再计入待清理
  pending.fn()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.deepEqual(env.controller.keys(), ['ssh_exec'])

  env.controller.dispose()
  assert.equal(env.timers.filter(Boolean).length, 0, 'dispose must cancel the pending refresh timer')

  // dispose 之后任何入口都不应再安排定时器。
  env.controller.refresh()
  env.controller.stepAside()
  env.controller.setEnabled(true)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(env.timers.filter(Boolean).length, 0)
})
