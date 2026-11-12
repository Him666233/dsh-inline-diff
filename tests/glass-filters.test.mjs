/**
 * glass-filters.js（液态玻璃折射滤镜注入与能力门控）的纯函数测试。
 *
 * 不使用真实 DOM：只验证「Chromium 主版本解析」与「版本 + CSS.supports 双条件
 * 门控」的判定逻辑；installGlassRefraction 在无 document 环境下必须是安全 no-op。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  REFRACTION_GATE_CLASS,
  chromiumMajor,
  installGlassRefraction,
  supportsBackdropRefraction,
} from '../src/client/glass-filters.js'

const CHROME_152 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'
const CHROME_157 = CHROME_152.replace('Chrome/152.0.0.0', 'Chromium/157.0.0.0')
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0'

/** 伪造 CSS.supports。 */
function fakeCss(support) {
  return { supports: () => support }
}

test('chromiumMajor parses Chromium/Chrome versions and rejects other engines', () => {
  assert.equal(chromiumMajor(CHROME_152), 152)
  assert.equal(chromiumMajor(CHROME_157), 157)
  assert.equal(chromiumMajor(FIREFOX), 0)
  assert.equal(chromiumMajor(undefined), 0)
  assert.equal(chromiumMajor(''), 0)
  assert.equal(chromiumMajor(42), 0)
})

test('refraction gate requires both a new-enough Chromium and CSS support', () => {
  assert.equal(supportsBackdropRefraction(CHROME_152, fakeCss(true)), true)
  assert.equal(supportsBackdropRefraction(CHROME_157, fakeCss(true)), true)
  // 旧内核：即使 CSS.supports 误报 true 也不启用。
  assert.equal(supportsBackdropRefraction(CHROME_152.replace('/152.', '/151.'), fakeCss(true)), false)
  // 非 Chromium：不启用。
  assert.equal(supportsBackdropRefraction(FIREFOX, fakeCss(true)), false)
  // CSS 不支持 / 缺失：不启用。
  assert.equal(supportsBackdropRefraction(CHROME_152, fakeCss(false)), false)
  assert.equal(supportsBackdropRefraction(CHROME_152, undefined), false)
  assert.equal(supportsBackdropRefraction(CHROME_152, { supports() { throw new Error('boom') } }), false)
})

test('gate class name is namespaced and stable', () => {
  assert.equal(REFRACTION_GATE_CLASS, 'did-glass-refract-ok')
})

test('installGlassRefraction is a safe no-op without a document', () => {
  const previously = globalThis.document
  // 某些 Node 版本可能没有 document；显式设成 undefined 保证走 no-op 分支。
  globalThis.document = undefined
  try {
    const dispose = installGlassRefraction()
    assert.equal(typeof dispose, 'function')
    assert.doesNotThrow(() => dispose())
    assert.doesNotThrow(() => dispose())
  } finally {
    globalThis.document = previously
  }
})
