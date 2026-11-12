/**
 * surfaces.js（逐表面外观效果注册表与纯函数）的单元测试。
 *
 * 覆盖：表面清单完整性、默认值与归一化（非法输入回退、数值夹取）、React 属性
 * 展开（surfaceProps / fxRootProps）、DOM 纯数据（surfaceDomValues）。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_EFFECT,
  EFFECTS,
  EFFECT_GLASS,
  EFFECT_LIQUID,
  EFFECT_NATIVE,
  FX_LIMITS,
  LIQUID_MODES,
  SURFACES,
  SURFACE_IDS,
  backdropProxyProps,
  defaultEffects,
  effectOf,
  fxRootProps,
  normalizeEffects,
  normalizeSurfaceEffect,
  surfaceDomValues,
  surfaceProps,
} from '../src/client/surfaces.js'

test('surface registry exposes the nine fixed surfaces with unique ids', () => {
  assert.equal(SURFACES.length, 9)
  assert.equal(SURFACE_IDS.length, 9)
  assert.equal(new Set(SURFACE_IDS).size, 9)
  assert.deepEqual([...SURFACE_IDS], [
    'fileCardHeader',
    'fileCardBody',
    'diffModal',
    'commandHeader',
    'commandIO',
    'toolHeader',
    'toolIO',
    'readRangeChip',
    'settingsPanel',
  ])
  for (const surface of SURFACES) {
    assert.equal(typeof surface.labelKey, 'string')
    assert.equal(typeof surface.descKey, 'string')
  }
})

test('effect and liquid-mode enums are exactly the documented values', () => {
  assert.deepEqual([...EFFECTS], ['native', 'glass', 'liquid'])
  assert.deepEqual([...LIQUID_MODES], ['clear', 'frosted'])
  assert.equal(DEFAULT_EFFECT.effect, EFFECT_NATIVE)
  assert.equal(DEFAULT_EFFECT.mode, 'frosted')
  assert.ok(Object.isFrozen(DEFAULT_EFFECT))
})

test('defaultEffects returns a fresh all-native object for every surface', () => {
  const first = defaultEffects()
  const second = defaultEffects()
  assert.notEqual(first, second)
  for (const id of SURFACE_IDS) assert.equal(first[id].effect, EFFECT_NATIVE)
  first.fileCardHeader.effect = EFFECT_GLASS
  assert.equal(second.fileCardHeader.effect, EFFECT_NATIVE)
})

test('normalizeEffects tolerates missing/garbage archives and clamps numbers', () => {
  for (const raw of [undefined, null, 42, 'x', [], { unknownSurface: { effect: 'glass' } }]) {
    const effects = normalizeEffects(raw)
    for (const id of SURFACE_IDS) assert.equal(effects[id].effect, EFFECT_NATIVE)
  }
  const effects = normalizeEffects({
    fileCardHeader: { effect: EFFECT_GLASS, opacity: 9, blur: 999 },
    fileCardBody: { effect: 'bogus', opacity: 'x', blur: null, mode: 'nope' },
    commandIO: { effect: EFFECT_LIQUID, mode: 'clear', opacity: 0.001, blur: -4 },
    madeUpSurface: { effect: EFFECT_LIQUID },
  })
  assert.equal(effects.fileCardHeader.opacity, FX_LIMITS.opacityMax)
  assert.equal(effects.fileCardHeader.blur, FX_LIMITS.blurMax)
  assert.equal(effects.fileCardBody.effect, EFFECT_NATIVE)
  assert.equal(effects.fileCardBody.opacity, DEFAULT_EFFECT.opacity)
  assert.equal(effects.fileCardBody.mode, DEFAULT_EFFECT.mode)
  assert.equal(effects.commandIO.effect, EFFECT_LIQUID)
  assert.equal(effects.commandIO.mode, 'clear')
  assert.equal(effects.commandIO.opacity, FX_LIMITS.opacityMin)
  assert.equal(effects.commandIO.blur, FX_LIMITS.blurMin)
  assert.equal(effects.madeUpSurface, undefined)
})

test('normalizeSurfaceEffect always returns the full shape', () => {
  for (const raw of [undefined, null, 'glass', 5, [], {}]) {
    const value = normalizeSurfaceEffect(raw)
    assert.equal(typeof value.effect, 'string')
    assert.equal(typeof value.opacity, 'number')
    assert.equal(typeof value.blur, 'number')
    assert.equal(typeof value.mode, 'string')
  }
})

test('effectOf falls back to the frozen default when settings are absent', () => {
  assert.equal(effectOf(undefined, 'fileCardHeader'), DEFAULT_EFFECT)
  assert.equal(effectOf({}, 'fileCardHeader'), DEFAULT_EFFECT)
  assert.equal(effectOf({ effects: { fileCardHeader: { effect: EFFECT_LIQUID } } }, 'fileCardHeader').effect, EFFECT_LIQUID)
})

test('surfaceProps emits the DOM contract and liquid mode only for liquid', () => {
  const settings = {
    effects: {
      fileCardHeader: { effect: EFFECT_GLASS, opacity: 0.4, blur: 18, mode: 'clear' },
      fileCardBody: { effect: EFFECT_LIQUID, opacity: 0.25, blur: 6, mode: 'clear' },
      diffModal: { effect: EFFECT_NATIVE, opacity: 0.5, blur: 10, mode: 'frosted' },
    },
  }
  const glass = surfaceProps(settings, 'fileCardHeader')
  assert.equal(glass['data-fx'], EFFECT_GLASS)
  assert.equal(glass['data-fx-surface'], 'fileCardHeader')
  assert.equal(glass.style['--did-fx-alpha'], '0.4')
  assert.equal(glass.style['--did-fx-blur'], '18px')
  assert.equal(glass['data-liquid-mode'], undefined)

  const liquid = surfaceProps(settings, 'fileCardBody')
  assert.equal(liquid['data-fx'], EFFECT_LIQUID)
  assert.equal(liquid['data-liquid-mode'], 'clear')

  const native = surfaceProps(settings, 'diffModal')
  assert.equal(native['data-fx'], EFFECT_NATIVE)
  assert.equal(native['data-liquid-mode'], undefined)
})

test('fxRootProps marks the card root only when a child surface leaves native', () => {
  assert.deepEqual(fxRootProps({ effects: defaultEffects() }, ['fileCardHeader', 'fileCardBody']), {})
  assert.deepEqual(fxRootProps(undefined, ['commandHeader', 'commandIO']), {})
  const glassBody = defaultEffects()
  glassBody.fileCardBody.effect = EFFECT_GLASS
  assert.deepEqual(fxRootProps({ effects: glassBody }, ['fileCardHeader', 'fileCardBody']), { 'data-fx-root': 'true' })
  // 只检查传入的表面：别的表面启用了效果不会影响本卡片。
  const otherSurface = defaultEffects()
  otherSurface.diffModal.effect = EFFECT_LIQUID
  assert.deepEqual(fxRootProps({ effects: otherSurface }, ['commandHeader', 'commandIO']), {})
})

test('surfaceDomValues mirrors effectOf for direct DOM consumers', () => {
  const settings = { effects: { readRangeChip: { effect: EFFECT_LIQUID, opacity: 0.3, blur: 8, mode: 'frosted' } } }
  const values = surfaceDomValues(settings, 'readRangeChip')
  assert.equal(values.effect, EFFECT_LIQUID)
  assert.equal(values.opacity, 0.3)
  assert.equal(values.blur, 8)
  assert.equal(values.mode, 'frosted')
  assert.equal(surfaceDomValues(settings, 'toolHeader').effect, EFFECT_NATIVE)
})

test('backdropProxyProps gives the overlay the modal blur only when the surface is not native', () => {
  const settings = {
    effects: {
      diffModal: { effect: EFFECT_GLASS, opacity: 0.5, blur: 22, mode: 'frosted' },
      settingsPanel: { effect: EFFECT_LIQUID, opacity: 0.4, blur: 8, mode: 'clear' },
    },
  }
  assert.deepEqual(backdropProxyProps(settings, 'diffModal'), {
    'data-fx-backdrop': EFFECT_GLASS,
    style: { '--did-fx-blur': '22px' },
  })
  assert.deepEqual(backdropProxyProps(settings, 'settingsPanel'), {
    'data-fx-backdrop': EFFECT_LIQUID,
    'data-liquid-mode': 'clear',
    style: { '--did-fx-blur': '8px' },
  })
  // native / 缺失设置 → 不改变遮罩的旧外观。
  assert.deepEqual(backdropProxyProps({ effects: defaultEffects() }, 'diffModal'), {})
  assert.deepEqual(backdropProxyProps(undefined, 'settingsPanel'), {})
  assert.deepEqual(backdropProxyProps(settings, 'fileCardHeader'), {})
})
