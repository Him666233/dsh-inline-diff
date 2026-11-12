/**
 * 外观效果（原生 / 磨砂玻璃 / 液态玻璃）的唯一事实来源。
 *
 * 背景：本插件此前只有“配色”设置；本模块加入**逐表面**的外观材质设置——每一个
 * 可视表面（文件卡片头部/内容、命令卡片头部/IO、工具卡片头部/IO、放大弹窗、
 * 读取行范围徽标、设置弹窗本身）都可以单独选择：
 *
 *   - native：原生（默认，外观必须与 1.3.0 完全一致）；
 *   - glass ：高斯模糊玻璃（背景模糊 + 半透明材质，透明度/模糊可调）；
 *   - liquid：液态玻璃（苹果 iOS 26 Liquid Glass 风格，透明度/模糊可调，并有
 *              clear（完全通透）/ frosted（带一点模糊）两种模式）。
 *
 * 本模块只包含**数据与纯函数**（不 import React、不访问 DOM），因此设置层、
 * React 组件、直接操作 DOM 的 read-range 层以及 Node 单测可以共用同一份契约：
 *
 *   - 表面清单 SURFACES / SURFACE_IDS；
 *   - 默认值与归一化：DEFAULT_EFFECT / defaultEffects / normalizeEffects；
 *   - React 侧展开属性：surfaceProps / fxRootProps；
 *   - 纯 DOM 侧取值：surfaceDomValues。
 *
 * 设置存档形状（settings.effects）：
 *   { [surfaceId]: { effect, opacity, blur, mode } }
 * 任何非法/缺失字段都会回退到 DEFAULT_EFFECT，绝不抛错（读旧存档、手改
 * localStorage、第三方脚本写入脏数据都不能阻止插件启动）。
 */

/** 三种外观效果。 */
export const EFFECT_NATIVE = 'native'
export const EFFECT_GLASS = 'glass'
export const EFFECT_LIQUID = 'liquid'
/** 效果枚举（设置 UI 的顺序：原生 → 磨砂玻璃 → 液态玻璃）。 */
export const EFFECTS = Object.freeze([EFFECT_NATIVE, EFFECT_GLASS, EFFECT_LIQUID])

/** 液态玻璃的两种模式：完全通透 / 带一点模糊。 */
export const LIQUID_CLEAR = 'clear'
export const LIQUID_FROSTED = 'frosted'
export const LIQUID_MODES = Object.freeze([LIQUID_CLEAR, LIQUID_FROSTED])

/**
 * 可调参数的取值范围。设置 UI 的滑杆与归一化共用这些常量，避免两端漂移。
 * 透明度用 0.05 步进（百分比整数感），模糊用整数 px。
 */
export const FX_LIMITS = Object.freeze({
  opacityMin: 0.05,
  opacityMax: 1,
  opacityStep: 0.05,
  blurMin: 0,
  blurMax: 40,
  blurStep: 1,
})

/** 单个表面的默认配置：原生、中等透明度、中等模糊、液态默认带一点模糊。 */
export const DEFAULT_EFFECT = Object.freeze({
  effect: EFFECT_NATIVE,
  opacity: 0.55,
  blur: 14,
  mode: LIQUID_FROSTED,
})

/**
 * 表面清单。 `id` 是存档键与 DOM 契约（data-fx-surface）的主键，**不要随意改名**；
 * `labelKey` / `descKey` 指向 src/client/locales.js 里的文案键。
 * 顺序即设置 UI 中的展示顺序。
 */
export const SURFACES = Object.freeze([
  { id: 'fileCardHeader', labelKey: 'fx.surface.fileCardHeader', descKey: 'fx.surface.fileCardHeaderDesc' },
  { id: 'fileCardBody', labelKey: 'fx.surface.fileCardBody', descKey: 'fx.surface.fileCardBodyDesc' },
  { id: 'diffModal', labelKey: 'fx.surface.diffModal', descKey: 'fx.surface.diffModalDesc' },
  { id: 'commandHeader', labelKey: 'fx.surface.commandHeader', descKey: 'fx.surface.commandHeaderDesc' },
  { id: 'commandIO', labelKey: 'fx.surface.commandIO', descKey: 'fx.surface.commandIODesc' },
  { id: 'toolHeader', labelKey: 'fx.surface.toolHeader', descKey: 'fx.surface.toolHeaderDesc' },
  { id: 'toolIO', labelKey: 'fx.surface.toolIO', descKey: 'fx.surface.toolIODesc' },
  { id: 'readRangeChip', labelKey: 'fx.surface.readRangeChip', descKey: 'fx.surface.readRangeChipDesc' },
  { id: 'settingsPanel', labelKey: 'fx.surface.settingsPanel', descKey: 'fx.surface.settingsPanelDesc' },
])

/** 全部表面 id（顺序与 SURFACES 一致）。 */
export const SURFACE_IDS = Object.freeze(SURFACES.map(surface => surface.id))

/** 数值夹取：非有限数时回退 fallback，然后夹到 [min, max]。 */
function clampNumber(value, min, max, fallback) {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  if (number < min) return min
  if (number > max) return max
  return number
}

/** 归一化一个表面配置；任何非法字段逐个回退，绝不抛错。 */
export function normalizeSurfaceEffect(value) {
  const source = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const effect = EFFECTS.includes(source.effect) ? source.effect : DEFAULT_EFFECT.effect
  const mode = LIQUID_MODES.includes(source.mode) ? source.mode : DEFAULT_EFFECT.mode
  const opacity = clampNumber(source.opacity, FX_LIMITS.opacityMin, FX_LIMITS.opacityMax, DEFAULT_EFFECT.opacity)
  const blur = clampNumber(source.blur, FX_LIMITS.blurMin, FX_LIMITS.blurMax, DEFAULT_EFFECT.blur)
  return { effect, opacity, blur, mode }
}

/**
 * 归一化整份 effects 存档：总是返回**全部**表面键的合法对象。
 * 旧存档没有 effects 字段 → 全部默认 native；未知表面键被丢弃。
 */
export function normalizeEffects(value) {
  const source = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const next = {}
  for (const id of SURFACE_IDS) next[id] = normalizeSurfaceEffect(source[id])
  return next
}

/** 全 native 的 effects 深拷贝（settings.js 的 DEFAULTS 用；避免共享可变对象）。 */
export function defaultEffects() {
  return normalizeEffects(undefined)
}

/**
 * 取某个表面当前生效的配置；settings 缺失/损坏时回退 DEFAULT_EFFECT。
 *
 * @param {object|undefined|null} settings - 设置快照（含 effects）。
 * @param {string} surfaceId - SURFACES 中的 id。
 * @returns {{effect:string, opacity:number, blur:number, mode:string}}
 */
export function effectOf(settings, surfaceId) {
  const effects = settings !== null && settings !== undefined ? settings.effects : undefined
  const raw = effects !== null && effects !== undefined ? effects[surfaceId] : undefined
  if (raw === undefined) return DEFAULT_EFFECT
  return normalizeSurfaceEffect(raw)
}

/**
 * React 组件展开用的表面属性：
 *   data-fx、data-fx-surface、可选 data-liquid-mode、style（--did-fx-alpha / --did-fx-blur）。
 *
 * 三个效果（含 native）都会写入相同形状的属性，CSS 只需按属性值分支；native 时
 * 不产生任何视觉变化（样式表里 native 不定义材质规则）。
 *
 * @param {object} settings - 设置快照。
 * @param {string} surfaceId - 表面 id。
 * @returns {object} 可展开进 JSX 的属性对象。
 */
export function surfaceProps(settings, surfaceId) {
  const config = effectOf(settings, surfaceId)
  const props = {
    'data-fx': config.effect,
    'data-fx-surface': surfaceId,
    style: {
      '--did-fx-alpha': String(config.opacity),
      '--did-fx-blur': `${config.blur}px`,
    },
  }
  if (config.effect === EFFECT_LIQUID) props['data-liquid-mode'] = config.mode
  return props
}

/**
 * 卡片根的“含外观效果”标记：当给定表面里**任意一个**不是 native 时返回
 * `{ 'data-fx-root': 'true' }`，否则返回空对象。
 *
 * CSS 用它来判断“卡片根的不透明底色/边框要不要让位给子表面的材质”——只有真正
 * 启用了玻璃效果时才移除，保证默认（全 native）外观与 1.3.0 完全一致。
 *
 * @param {object} settings - 设置快照。
 * @param {ReadonlyArray<string>} surfaceIds - 该卡片包含的表面 id。
 * @returns {object} 可展开进 JSX 的属性对象。
 */
export function fxRootProps(settings, surfaceIds) {
  for (const id of surfaceIds) {
    if (effectOf(settings, id).effect !== EFFECT_NATIVE) return { 'data-fx-root': 'true' }
  }
  return {}
}

/**
 * 非 React 的纯 DOM 消费者（read-range 徽标）取用的纯数据。
 *
 * @param {object} settings - 设置快照。
 * @param {string} surfaceId - 表面 id。
 * @returns {{effect:string, opacity:number, blur:number, mode:string}}
 */
export function surfaceDomValues(settings, surfaceId) {
  return effectOf(settings, surfaceId)
}

/**
 * 弹窗遮罩的「模糊代理」属性。
 *
 * 背景：Chromium 会忽略嵌套的 backdrop-filter（祖先元素已有 backdrop-filter 时，
 * 子元素/伪元素的 backdrop-filter 完全失效，见 .team/liquid-glass/NOTES.md 的
 * probe5）。放大弹窗（在 `.did-overlay` 里）与设置弹窗（在 `.did-settings-overlay`
 * 里）的遮罩层都自带模糊，因此这两个表面自身的 blur 是惰性的——用户拖动「模糊」
 * 滑杆会看不到任何变化。
 *
 * 修复方式：把弹窗表面的 blur 与 clear/frosted 模式交给遮罩层实现（遮罩用同一个
 * `--did-fx-blur` 做 backdrop-filter），弹窗内部的半透明材质叠在“已模糊的背景”
 * 上，于是模糊滑杆对这两个表面同样可见、可调。仅当该表面非 native 时返回属性，
 * native 时遮罩保持原状（完全不改旧外观）。
 *
 * @param {object} settings - 设置快照。
 * @param {string} surfaceId - 弹窗类表面 id（diffModal / settingsPanel）。
 * @returns {object} 可展开到遮罩元素上的属性（空对象表示保持原生遮罩）。
 */
export function backdropProxyProps(settings, surfaceId) {
  const config = effectOf(settings, surfaceId)
  if (config.effect === EFFECT_NATIVE) return {}
  const props = {
    'data-fx-backdrop': config.effect,
    style: { '--did-fx-blur': `${config.blur}px` },
  }
  if (config.effect === EFFECT_LIQUID) props['data-liquid-mode'] = config.mode
  return props
}
