/**
 * 插件级国际化（i18n）核心：语言解析、字典翻译、React 高阶组件包装。
 *
 * 背景：DSH 自带的 locale 服务（`ctx.locale`）提供的是“全局”语言，插件的
 * slot 组件默认拿到的是按 DSH 当前语言绑定的 `t`。1.3.0 起插件拥有自己的
 * `language` 设置（'zh' / 'en' / 'auto'），因此插件 UI 文案必须在“插件语言”
 * 下渲染，而不是永远跟随 DSH 的全局语言：
 *
 *   language='zh'   → 插件界面固定中文（默认值）；
 *   language='en'   → 插件界面固定英文；
 *   language='auto' → 跟随 DSH：DSH 为中文时中文，其他语言时英文。
 *
 * 本模块只依赖纯数据（./locales.js）与设置存储（./settings.js），**不静态
 * import react**：`tests/locales.test.mjs` 在纯 Node（未安装 react）下运行，
 * 必须能直接 import 本模块来单测纯函数。React 运行时（createElement /
 * useSyncExternalStore）在浏览器入口 `index.jsx` 里通过
 * {@link installI18nRuntime} 注入，只有 `withPluginI18n` 会用到它。
 *
 * 回退链（translate）：选中语言字典 → 简体中文（zh）字典 → key 本身。
 * 任何异常输入（未知 key、缺参数、字典缺失、值类型错误）都不得抛错。
 *
 * 输入输出：
 *   - 纯函数：normalizeLanguageSetting / hostLanguageKind / resolveLanguage /
 *     translate / translatorFor —— 输入任意值，输出确定的语言 id 或文案；
 *   - 运行时：installI18nRuntime 注入 React 运行时；attachHostLocale 接线
 *     ctx.locale；getPluginLanguage / subscribePluginLanguage 读取与订阅最终
 *     语言；pluginTranslate 给非 React 上下文即时翻译；
 *     withPluginI18n(Component) 返回“覆盖宿主 t”的包装组件。
 *
 * 失败与回退：
 *   - 设置读取抛错 / 宿主 locale 快照异常 → 视为“设置/宿主语言未知”，按
 *     resolveLanguage 的规则回退默认中文，异常绝不抛给渲染层；
 *   - 宿主 locale 订阅失败 → 只影响 auto 模式的即时跟随，组件仍按当前语言渲染
 *     （可在下次重渲染时恢复）；
 *   - 包装组件在没有 React 运行时的环境（Node 单测）直接渲染原组件，不抛错。
 */
import { DEFAULT_LANGUAGE, dicts } from './locales.js'
import { getSettings, subscribeSettings } from './settings.js'

/*
 * 语言常量统一定义在 ./locales.js：settings.js 的枚举白名单与这里的语言解析
 * 必须共享同一份取值，否则出现“设置页能选、解析层不认识”的漂移会很难发现。
 * 这里 re-export 保持 1.3.0 已公开的导出签名（tests/locales.test.mjs 从本模块
 * 导入这三个常量）。
 */
export { DEFAULT_LANGUAGE, LANGUAGE_SETTINGS, SUPPORTED_LANGUAGES } from './locales.js'

/* ========================================================================
 * 1. 纯函数：设置值归一化、宿主语言归类、语言解析
 * ===================================================================== */

/**
 * 把任意设置值归一化为一个合法的 `language` 设置项。
 *
 * @param {unknown} value - localStorage 里可能残留的任意值（旧版本无该字段、
 *   手工编辑的 JSON、未来版本的新值等）。
 * @returns {'zh'|'en'|'auto'} 合法值原样返回；其余一律返回默认值 'zh'。
 */
export function normalizeLanguageSetting(value) {
  return value === 'zh' || value === 'en' || value === 'auto' ? value : DEFAULT_LANGUAGE
}

/**
 * 把宿主（DSH）语言 id 归类为插件支持的语言。
 *
 * DSH 的 locale id 形如 'zh' / 'en' / 'ja' / 'zh-CN' 等（见 dsh-client-locale
 * README）。这里只按主语言子标签归类：'zh*' → 'zh'，'en*' → 'en'，其它已注册
 * 语言（ja/es/fr/de/ru/pt…）→ 'en'（插件没有对应字典，英文是最合理的输出）。
 *
 * @param {unknown} hostLanguage - `ctx.locale.getSnapshot().active`，可能缺失。
 * @returns {'zh'|'en'|undefined} 无法识别（非字符串 / 空串）时返回 undefined。
 */
export function hostLanguageKind(hostLanguage) {
  if (typeof hostLanguage !== 'string') return undefined
  const normalized = hostLanguage.trim().toLowerCase().replace(/_/g, '-')
  if (normalized === '') return undefined
  const primary = normalized.split('-')[0]
  if (primary === 'zh') return 'zh'
  if (primary === 'en') return 'en'
  // 宿主注册了其它语言：插件没有该语言的字典，按产品约定落到英文。
  return 'en'
}

/**
 * 解析最终生效的插件界面语言。
 *
 * 规则（与设置页的三个选项一一对应）：
 *   - 'zh'   → 'zh'（固定中文）；
 *   - 'en'   → 'en'（固定英文）；
 *   - 'auto' → 跟随 DSH：宿主语言归类为 'zh' 时中文，其余已知语言英文；
 *              宿主语言未知（locale 服务尚未接线 / 单测环境）时回退默认中文，
 *              因为“默认语言必须是中文”是产品硬约束；
 *   - 其它（旧存档无该字段时这里收到 undefined、手改 JSON 的非法值）→ 'zh'。
 *
 * @param {unknown} setting - 插件的 language 设置值。
 * @param {unknown} hostLanguage - DSH 当前语言 id（可缺省）。
 * @returns {'zh'|'en'} 用来选择字典的语言 id。
 */
export function resolveLanguage(setting, hostLanguage) {
  if (setting === 'zh') return 'zh'
  if (setting === 'en') return 'en'
  if (setting !== 'auto') return DEFAULT_LANGUAGE
  const host = hostLanguageKind(hostLanguage)
  if (host === 'zh') return 'zh'
  if (host === 'en') return 'en'
  return DEFAULT_LANGUAGE
}

/* ========================================================================
 * 2. 纯函数：字典翻译
 * ===================================================================== */

/**
 * 从字典对象里安全读取一个 key。
 *
 * 边界：字典 / 语言子字典 / key 任意一层缺失、或值不是非空字符串时都返回
 * undefined；只认自有属性（避免 `dict['toString']` 之类原型链上的函数冒充
 * 文案），且整体包在 try/catch 里，恶意 getter 也不会把异常抛给渲染层。
 *
 * @param {unknown} dictionary - `{ zh: {...}, en: {...} }` 形状的字典对象。
 * @param {string} language - 语言 id（这里只查具体语言，不做回退）。
 * @param {string} key - 文案 key。
 * @returns {string|undefined} 命中且是非空字符串时返回文案，否则 undefined。
 */
function lookupDictionary(dictionary, language, key) {
  try {
    if (dictionary === null || typeof dictionary !== 'object') return undefined
    const table = dictionary[language]
    if (table === null || typeof table !== 'object') return undefined
    if (!Object.prototype.hasOwnProperty.call(table, key)) return undefined
    const value = table[key]
    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

/**
 * 替换模板里的 `{name}` 占位符。
 *
 * 边界：params 不是对象时原样返回；某个占位符在 params 里没有自有属性、或
 * 值恰好是 undefined / null 时保留占位符原文（与 DSH 官方 t() 的行为一致）；
 * 值的 String() 转换抛错时也保留原文。这样“缺参数”永远不会变成异常。
 *
 * @param {string} template - 字典里的模板字符串。
 * @param {unknown} params - 占位符参数表。
 * @returns {string} 替换后的文案。
 */
function formatTemplate(template, params) {
  if (params === null || typeof params !== 'object') return template
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return match
    let value
    try {
      value = params[name]
    } catch {
      return match
    }
    if (value === undefined || value === null) return match
    try {
      return String(value)
    } catch {
      return match
    }
  })
}

/**
 * 按回退链翻译一条文案。
 *
 * 回退链：选中语言字典 → zh 字典 → key 本身。
 * 例如 `translate(dicts, 'en', 'close')` → 'Close'；若 en 字典缺这个 key 而
 * zh 有，则返回中文；两边都缺时返回 key 本身（便于发现漏翻）。
 *
 * 边界：key 不是字符串时返回空串（React 渲染空内容比崩溃安全）；字典参数
 * 缺失 / 形状错误 / 含抛错 getter 时都不会抛错。
 *
 * @param {Record<string, Record<string, string>>} dictionary - zh/en 字典表。
 * @param {string} language - 期望语言 id（'zh' / 'en' / 其它）。
 * @param {string} key - 文案 key。
 * @param {Record<string, unknown>} [params] - 占位符参数。
 * @returns {string} 翻译结果；最坏情况下就是 key 本身。
 */
export function translate(dictionary, language, key, params) {
  if (typeof key !== 'string') return ''
  try {
    const wanted = typeof language === 'string' && language !== '' ? language : DEFAULT_LANGUAGE
    const template = lookupDictionary(dictionary, wanted, key)
      ?? lookupDictionary(dictionary, DEFAULT_LANGUAGE, key)
      ?? key
    return formatTemplate(template, params)
  } catch {
    return key
  }
}

/**
 * 取某个语言的翻译函数，并按 (字典对象, 语言) 缓存。
 *
 * 为什么需要缓存：slot 渲染器会把 `t` 作为 props 注入组件，部分组件把 `t`
 * 放进 useMemo 依赖。若每帧都新建函数会造成不必要的重算；这里保证同一语言
 * 的翻译函数引用稳定，语言切换时才换新引用 —— 正好也充当“语言变化”的
 * React 浅比较信号。
 *
 * @param {unknown} dictionary - 字典对象。
 * @param {unknown} language - 语言 id；非法值按 zh 处理。
 * @returns {(key: string, params?: Record<string, unknown>) => string} 稳定的翻译函数。
 */
const translatorCache = new WeakMap()
export function translatorFor(dictionary, language) {
  const table = dictionary !== null && typeof dictionary === 'object' ? dictionary : {}
  let perLanguage = translatorCache.get(table)
  if (perLanguage === undefined) {
    perLanguage = new Map()
    translatorCache.set(table, perLanguage)
  }
  const wanted = typeof language === 'string' && language !== '' ? language : DEFAULT_LANGUAGE
  let translator = perLanguage.get(wanted)
  if (translator === undefined) {
    translator = (key, params) => translate(table, wanted, key, params)
    perLanguage.set(wanted, translator)
  }
  return translator
}

/* ========================================================================
 * 3. 运行时状态：宿主 locale 接线、当前插件语言、动态翻译函数
 * ===================================================================== */

/**
 * React 运行时注入点。
 *
 * 为什么不在本模块 `import { useSyncExternalStore } from 'react'`：本模块要能
 * 在纯 Node 单测里直接 import（工作区 devDependencies 只有 esbuild 和
 * highlight.js，没有 react）。浏览器入口 `index.jsx` 在模块求值阶段调用
 * {@link installI18nRuntime} 注入这两个 API；`withPluginI18n` 之外没有任何地方
 * 依赖它们。
 *
 * @type {{ createElement: Function, useSyncExternalStore: Function } | null}
 */
let reactRuntime = null

/**
 * 注入 React 运行时（只应在浏览器入口调用一次）。
 * @param {{ createElement: Function, useSyncExternalStore: Function } | null} runtime
 */
export function installI18nRuntime(runtime) {
  reactRuntime = runtime !== null && typeof runtime === 'object' ? runtime : null
}

/** 已接线的宿主 locale face（`ctx.locale`）；未接线时为 null。 */
let hostLocaleFace = null
/** 宿主 locale 变化订阅者（原始 revision 通知，由 subscribePluginLanguage 使用）。 */
const hostLanguageListeners = new Set()

/**
 * 读取 DSH 当前语言 id（locale 快照的 `active`）。
 *
 * 任何异常（face 未接线、快照形状异常、getter 抛错）都返回 undefined，
 * 交给 resolveLanguage 按“宿主语言未知”处理，绝不把异常抛给渲染层。
 *
 * @returns {string|undefined}
 */
export function getHostLanguage() {
  try {
    const snapshot = hostLocaleFace?.getSnapshot?.()
    const active = snapshot !== null && typeof snapshot === 'object' ? snapshot.active : undefined
    return typeof active === 'string' && active !== '' ? active : undefined
  } catch {
    return undefined
  }
}

/** 通知所有宿主语言订阅者；单个回调抛错不影响其他人。 */
function notifyHostLanguage() {
  for (const listener of [...hostLanguageListeners]) {
    try {
      listener()
    } catch {
      // 订阅者自身的异常不能影响 locale 服务的事件循环。
    }
  }
}

/**
 * 订阅宿主语言变化（原始通知：locale revision 变化都会触发，可能语言没变）。
 * @param {() => void} listener
 * @returns {() => void} 取消订阅。
 */
export function subscribeHostLanguage(listener) {
  hostLanguageListeners.add(listener)
  return () => {
    hostLanguageListeners.delete(listener)
  }
}

/**
 * 接线宿主 locale face（通常在 `apply(ctx)` 里通过 ctx.effect 调用）。
 *
 * 订阅 face 的 revision 通知后，`language='auto'` 的组件能在用户切换 DSH
 * 语言时即时重渲染。返回值是幂等的清理函数：取消订阅，并仅在 face 未被替换
 * 时清空模块状态（防止旧实例的清理误伤新实例）。
 *
 * @param {{ getSnapshot?: Function, subscribe?: Function }} face - `ctx.locale`。
 * @returns {() => void} 清理函数。
 */
export function attachHostLocale(face) {
  if (face === null || typeof face !== 'object') return () => {}
  hostLocaleFace = face
  let unsubscribe = () => {}
  try {
    if (typeof face.subscribe === 'function') {
      const off = face.subscribe(() => notifyHostLanguage())
      if (typeof off === 'function') unsubscribe = off
    }
  } catch {
    unsubscribe = () => {}
  }
  // attach 之前可能已有组件按“宿主语言未知”渲染过（auto 回退中文）；接线后
  // 立刻补一次通知，让它们改用真实宿主语言。
  notifyHostLanguage()
  return () => {
    try {
      unsubscribe()
    } catch {
      // 取消订阅失败只影响重渲染，不影响其他逻辑。
    }
    if (hostLocaleFace === face) hostLocaleFace = null
  }
}

/**
 * 读取当前生效的插件语言（插件设置 + 宿主语言 + 回退规则）。
 * @returns {'zh'|'en'}
 */
export function getPluginLanguage() {
  let setting
  try {
    setting = getSettings()?.language
  } catch {
    setting = undefined
  }
  return resolveLanguage(setting, getHostLanguage())
}

/**
 * 订阅“插件语言”变化。
 *
 * 内部同时订阅插件设置与宿主 locale，但只在**解析后的语言真的变化**时才通知
 * 调用方 —— 切换其它显示设置不会让所有 UI 重渲染。返回值幂等。
 *
 * @param {() => void} listener
 * @returns {() => void} 取消订阅。
 */
export function subscribePluginLanguage(listener) {
  let last = getPluginLanguage()
  const check = () => {
    const next = getPluginLanguage()
    if (next === last) return
    last = next
    try {
      listener()
    } catch {
      // 订阅者异常隔离。
    }
  }
  let offSettings = () => {}
  let offHost = () => {}
  try {
    offSettings = subscribeSettings(check)
  } catch {
    offSettings = () => {}
  }
  try {
    offHost = subscribeHostLanguage(check)
  } catch {
    offHost = () => {}
  }
  return () => {
    offSettings()
    offHost()
  }
}

/**
 * 立即按当前插件语言翻译一条文案（给非 React 上下文使用，例如直接操作 DOM 的
 * Read range 角标）。组件内部请优先使用 `withPluginI18n` 注入的 `t`。
 *
 * @param {string} key - 文案 key。
 * @param {Record<string, unknown>} [params] - 占位符参数。
 * @returns {string}
 */
export function pluginTranslate(key, params) {
  return translate(dicts, getPluginLanguage(), key, params)
}

/* ========================================================================
 * 4. React 高阶组件：覆盖 slot 注入的 t
 * ===================================================================== */

/**
 * 包装一个 slot 组件，把宿主注入的 `t` 替换成“按插件语言选字典”的 `t`。
 *
 * 职责：
 *   1. 用 useSyncExternalStore 订阅 `subscribePluginLanguage`，语言设置变化
 *      后即时重渲染（无需刷新页面）；
 *   2. 计算本次语言对应的稳定翻译函数并优先覆盖 props.t，其余 props 原样透传；
 *   3. 兜底：没有注入 React 运行时（纯 Node 单测 / 极早期渲染）时直接渲染原
 *      组件，不抛错。
 *
 * 输入输出：输入是任意接受 `t` prop 的 React 组件，输出是同类组件；语言切换时
 * 输出的 `t` 引用随语言变化，因此把它放进 useMemo 依赖的组件也会正确重算。
 *
 * @template {Function} C
 * @param {C} Component - 需要插件级 i18n 的组件。
 * @returns {C} 包装后的组件（非函数输入原样返回）。
 */
export function withPluginI18n(Component) {
  if (typeof Component !== 'function') return Component
  /**
   * 包装组件：唯一的额外工作是计算语言并覆盖 t。
   * @param {Record<string, unknown>} props - slot 渲染器传入的完整 props。
   */
  function PluginI18nBound(props) {
    const runtime = reactRuntime
    // 没有 React 运行时（只可能出现在 Node 单测里）：直接渲染原组件，
    // 保持函数签名可调用、不依赖 hooks，绝不抛错。
    if (runtime === null || typeof runtime.useSyncExternalStore !== 'function') {
      return typeof runtime?.createElement === 'function' ? runtime.createElement(Component, props) : null
    }
    const language = runtime.useSyncExternalStore(subscribePluginLanguage, getPluginLanguage, getPluginLanguage)
    const t = translatorFor(dicts, language)
    return runtime.createElement(Component, { ...props, t })
  }
  const name = typeof Component.displayName === 'string' && Component.displayName !== ''
    ? Component.displayName
    : typeof Component.name === 'string' && Component.name !== '' ? Component.name : 'Component'
  PluginI18nBound.displayName = `withPluginI18n(${name})`
  return PluginI18nBound
}
