/**
 * 第三方工具兼容清单的纯逻辑测试。
 *
 * 重点断言三条产品约束：
 *   1. 本插件已按设置接管的工具名不重复注册（否则同 key 双视图冲突）；
 *   2. 官方富卡片 / 第三方定制行已占用的 key 必须让位（Read、todo、提问、
 *      图片等不能被兜底视图盖掉）；
 *   3. 异常输入（非数组、非字符串、超长、重复、海量工具）不会抛错，也不会
 *      让单轮注册数量失控。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  selectDynamicToolKeys,
  TOOL_CATALOG_LIMIT,
  TOOL_NAME_LIMIT,
} from '../src/client/tool-catalog.js'

test('dynamic tool keys skip the tools the plugin already takes over', () => {
  const names = ['ssh_exec', 'bash', 'grep', 'web_search', 'read']
  const known = ['bash', 'grep', 'web_search']
  assert.deepEqual(selectDynamicToolKeys(names, { known }), ['ssh_exec', 'read'])
})

test('dynamic tool keys defer to official or third-party claimed views', () => {
  const names = ['ssh_exec', 'ssh_upload', 'read', 'todo_write', 'ask_user_question']
  const claimed = ['read', 'todo_write', 'ask_user_question']
  assert.deepEqual(selectDynamicToolKeys(names, { claimed }), ['ssh_exec', 'ssh_upload'])
})

test('dynamic tool keys also skip keys already registered by a previous round', () => {
  const names = ['ssh_exec', 'ssh_upload']
  assert.deepEqual(selectDynamicToolKeys(names, { already: new Set(['ssh_exec']) }), ['ssh_upload'])
})

test('dynamic selection is ordered, unique, and drops invalid names', () => {
  const names = [
    'ssh_exec',
    '',
    'ssh_exec',
    null,
    42,
    'x'.repeat(TOOL_NAME_LIMIT + 1),
    'ssh_cluster',
  ]
  assert.deepEqual(selectDynamicToolKeys(names), ['ssh_exec', 'ssh_cluster'])
})

test('dynamic selection caps one round of registrations', () => {
  const names = Array.from({ length: TOOL_CATALOG_LIMIT + 50 }, (_, index) => `tool_${index}`)
  assert.equal(selectDynamicToolKeys(names).length, TOOL_CATALOG_LIMIT)
  assert.equal(selectDynamicToolKeys(names, { limit: 7 }).length, 7)
  // 非正数/非法 limit 回退到默认上限，而不是返回空数组或抛错。
  assert.equal(selectDynamicToolKeys(names, { limit: 0 }).length, TOOL_CATALOG_LIMIT)
  assert.equal(selectDynamicToolKeys(names, { limit: Number.NaN }).length, TOOL_CATALOG_LIMIT)
})

test('dynamic selection tolerates hostile input without throwing', () => {
  assert.deepEqual(selectDynamicToolKeys(null), [])
  assert.deepEqual(selectDynamicToolKeys(undefined), [])
  assert.deepEqual(selectDynamicToolKeys('ssh_exec'), [])
  assert.deepEqual(selectDynamicToolKeys({ length: 1, 0: 'ssh_exec' }), [])
  // known / claimed / already 可以是任意可迭代值，非法值按空集合处理。
  assert.deepEqual(selectDynamicToolKeys(['ssh_exec'], { known: 42 }), ['ssh_exec'])
  assert.deepEqual(selectDynamicToolKeys(['ssh_exec'], { known: null, claimed: undefined }), ['ssh_exec'])
})
