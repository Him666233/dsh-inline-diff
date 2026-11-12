/**
 * settings.js 的 v5 存档迁移与 effects 写入测试。
 *
 * 每个用例用 URL query 触发一次全新的模块实例（模块级 state 在 import 时从
 * localStorage 读取），因此可以独立验证「旧存档迁移」「坏存档回退」「effects
 * 归一化写入」三条路径。测试不依赖浏览器：localStorage 用内存替身。
 */
import test from 'node:test'
import assert from 'node:assert/strict'

/** 一个最小的内存 localStorage 替身。 */
function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    store,
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
  }
}

let caseId = 0
/** 用内存 storage 加载一份全新的 settings.js 模块实例。 */
async function loadSettings(initial) {
  globalThis.localStorage = fakeStorage(initial)
  caseId += 1
  return import(`../src/client/settings.js?migration-case=${caseId}`)
}

test('v4 archive migrates to v5 with all surfaces native and legacy key removed', async () => {
  const v4 = JSON.stringify({
    language: 'en',
    fileCards: 'enhanced',
    shellRows: 'enhanced',
    toolCalls: 'enhanced',
    transcript: 'native',
    fileShellTone: 'light',
    fileInnerTone: 'same',
    syntaxHighlight: false,
    languageBadge: 'full',
    unknownLanguage: 'hidden',
    syntaxEmphasis: 'off',
  })
  const settings = await loadSettings({ 'dsh-inline-diff.settings.v4': v4 })
  const state = settings.getSettings()
  assert.equal(state.language, 'en')
  assert.equal(state.fileCards, 'enhanced')
  assert.equal(state.fileShellTone, 'light')
  assert.equal(state.syntaxHighlight, false)
  for (const [id, effect] of Object.entries(state.effects)) {
    assert.equal(effect.effect, 'native', `${id} should stay native after migration`)
  }
  // 迁移结果必须立即落盘到 v5，并清理旧 key。
  assert.equal(globalThis.localStorage.store.has('dsh-inline-diff.settings.v4'), false)
  const stored = JSON.parse(globalThis.localStorage.store.get('dsh-inline-diff.settings.v5'))
  assert.equal(stored.language, 'en')
  assert.equal(stored.effects.fileCardHeader.effect, 'native')
})

test('corrupt or oversized archives fall back to defaults without throwing', async () => {
  const settings = await loadSettings({ 'dsh-inline-diff.settings.v5': '{not json' })
  const state = settings.getSettings()
  assert.equal(state.language, 'auto')
  assert.equal(state.effects.fileCardBody.effect, 'native')

  const oversized = await loadSettings({ 'dsh-inline-diff.settings.v5': 'x'.repeat(70_000) })
  assert.equal(oversized.getSettings().effects.diffModal.effect, 'native')
})

test('updateSettings accepts a normalized effects object and persists v5', async () => {
  const settings = await loadSettings({})
  const next = settings.getSettings().effects
  next.commandHeader = { effect: 'liquid', opacity: 2, blur: -3, mode: 'clear' }
  settings.updateSettings({ effects: next })
  const state = settings.getSettings()
  assert.equal(state.effects.commandHeader.effect, 'liquid')
  assert.equal(state.effects.commandHeader.opacity, 1)
  assert.equal(state.effects.commandHeader.blur, 0)
  assert.equal(state.effects.commandHeader.mode, 'clear')
  const stored = JSON.parse(globalThis.localStorage.store.get('dsh-inline-diff.settings.v5'))
  assert.equal(stored.effects.commandHeader.effect, 'liquid')
})

test('invalid effects payloads are normalized instead of rejected', async () => {
  const settings = await loadSettings({})
  settings.updateSettings({ effects: { fileCardHeader: { effect: 'nope' }, ghost: { effect: 'glass' } } })
  const state = settings.getSettings()
  assert.equal(state.effects.fileCardHeader.effect, 'native')
  assert.equal(state.effects.ghost, undefined)
  assert.equal(state.effects.fileCardBody.effect, 'native')
})
