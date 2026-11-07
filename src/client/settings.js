/**
 * 插件自有显示偏好（“展开风格”外观相关）的持久化与状态管理。
 *
 * 职责：
 *   - 定义全部设置项与默认值（DEFAULTS），以及每一项的枚举/类型白名单；
 *   - 从 localStorage 读取存档并做版本迁移（v4 当前，v3/v2 读入后迁移，v1 已
 *     退役只清理不再读取）；
 *   - 提供 getSettings / subscribeSettings / updateSettings / resetSettings 的
 *     外部 store 接口（React 侧通过 use-settings.js 的 Hook 订阅）；
 *   - 通过宿主共享的 `configForms` 服务驱动 DSH 自己的
 *     `ui-chat.transcriptView` 偏好（transcript 项），并使用户切回 DSH 原生时
 *     能恢复其原有值。
 *
 * 依赖：./locales.js（共享语言常量）、浏览器 localStorage、宿主 configForms
 * 服务（可缺失）。
 * 输入输出：getSettings() → 设置快照（引用稳定）；updateSettings(patch) 只接受
 * DEFAULTS 中已知键的合法值；subscribeSettings(listener) → 取消订阅函数。
 *
 * 失败与回退（README「设置读取」「界面语言」两行）：
 *   1. localStorage 不存在 / 读取抛错 / JSON 损坏 / 顶层不是对象 → 全量默认值；
 *   2. 原始 JSON 超过 64 KiB（损坏或被同源脚本写入）→ 解析前直接放弃并回退
 *      默认值（随后 persist 会覆盖坏存档）；
 *   3. 单个字段类型/枚举非法 → 该字段回退默认值，其余字段照常迁移；
 *   4. 未知键、非法值在 updateSettings 中被忽略（language 例外：非法值按产品
 *      约定回退默认中文），避免外部调用把任意数据写进设置存档；
 *   5. 写盘失败（隐私模式 / 配额满）只损失持久化，实时切换仍然生效；
 *   6. configForms 服务缺失/未连接时 transcript 相关操作静默降级（本地设置
 *      照常保存，页面不报错）。
 */

import { DEFAULT_LANGUAGE, LANGUAGE_SETTINGS } from './locales.js'

/** 当前存档 key（v4）。 */
const STORAGE_KEY = 'dsh-inline-diff.settings.v4'
/** 上一版存档 key：读入后迁移到 v4，下次 persist 时清理。 */
const LEGACY_KEY = 'dsh-inline-diff.settings.v3'
/** 更早的存档 key：同上。 */
const OLDER_KEY = 'dsh-inline-diff.settings.v2'
/** v1 早于中性模式命名（enhanced/native），不再读取，只在保存时删除。 */
const RETIRED_KEY = 'dsh-inline-diff.settings.v1'

/** 全部显示选项。默认值保持：内联差异卡片、DSH 原生命令行、不改动用户已有的
 *  DSH 对话记录偏好。 */
export const DEFAULTS = {
  /**
   * 插件级界面语言（1.3.0 新增）：
   *   'zh'（默认）中文；'en' 英文；'auto' 跟随 DSH 全局语言（DSH 中文→中文，
   *   其它语言→英文）。
   * 这是插件自己的显示偏好，与 DSH 的全局 locale 相互独立：客户端文案从
   * src/client/locales.js 取字典，由插件语言选择；宿主渲染的 slot label 在
   * 语言变化时重新注册。旧存档没有该字段，迁移为默认值 'zh'。
   */
  language: DEFAULT_LANGUAGE,
  /** 'enhanced' = 内联差异卡片；'native' = DSH 原生文件修改行。 */
  fileCards: 'enhanced',
  /** 'enhanced' = 平铺展开的 Bash/PowerShell 行；'native' = DSH 原生行。 */
  shellRows: 'native',
  /** 'enhanced' = 其它工具调用（通用/详情/搜索/网页）默认展开 IN/OUT；'native' = DSH 折叠行。 */
  toolCalls: 'native',
  /** 'enhanced' = 使用 DSH verbose 对话记录（平铺、不折叠）；'native' = 不改动。 */
  transcript: 'native',
  /** 每类卡片的外壳配色：'auto'（主题 + 宿主外观）、'light'、'dark'。 */
  fileShellTone: 'auto',
  shellShellTone: 'auto',
  toolShellTone: 'auto',
  /** 每类卡片的内部配色：'auto'（官方浅/深色）、'light'、'dark'、'same'（与外壳一致）。 */
  fileInnerTone: 'auto',
  shellInnerTone: 'auto',
  toolInnerTone: 'auto',
  /** 差异代码的语法高亮开关（语言识别与配色见 languages.js / highlight.js）。 */
  syntaxHighlight: true,
  /** 语言徽章样式：'short' 短代码、'full' 全名、'hidden' 隐藏。 */
  languageBadge: 'short',
  /** 识别不到语言时：'show' 显示中性“未知语言”徽章，'hidden' 不显示。 */
  unknownLanguage: 'show',
  /** 'on' = 高亮颜色 + 字体强调（关键词加粗、注释斜体）；'off' = 仅颜色。 */
  syntaxEmphasis: 'on',
}

const LANGUAGE_BADGE_VALUES = ['short', 'full', 'hidden']
const UNKNOWN_LANGUAGE_VALUES = ['show', 'hidden']
const SYNTAX_EMPHASIS_VALUES = ['on', 'off']
const SHELL_TONE_VALUES = ['auto', 'light', 'dark']
const INNER_TONE_VALUES = ['auto', 'light', 'dark', 'same']
/*
 * 展示风格枚举：'enhanced'（插件展开风格）与 'native'（DSH 原生）。
 * fileCards / shellRows / toolCalls / transcript 四个字段共用同一组取值，之前
 * 内联重复了四遍，这里抽成常量避免四处漂移。
 */
const STYLE_VALUES = ['enhanced', 'native']
/**
 * localStorage 原始 JSON 的长度上界（约 64 KiB，安全审计 LOW-5）。
 *
 * 设置项全是短枚举/布尔值，正常记录只有几百字节；超过上限说明存档损坏或被
 * 同源脚本写入。这里在 `JSON.parse` 之前直接放弃，避免在页面启动路径上解析
 * 数 MB 文本阻塞主线程；随后 `persist()` 会用默认值覆盖坏存档。
 */
const MAX_STORED_SETTINGS_CHARS = 65536
/**
 * DSH `ui-chat.transcriptView` 的合法取值（安全审计 LOW-6）。
 *
 * 来源是 DSH 0.2.2-rc.1 `dsh-client-ui-chat` 的
 * `TRANSCRIPT_VIEW_SETTING_VALUES`：当前模式 compact / standard / detailed /
 * verbose，加两个只读兼容的旧值 normal / expanded。从 localStorage 读回的
 * `previousTranscript` 必须在这个白名单内才允许写回 `configForms`。
 */
const TRANSCRIPT_VIEW_VALUES = ['compact', 'standard', 'detailed', 'verbose', 'normal', 'expanded']
/** 可原样恢复的“当前模式”；旧值 normal / expanded 在 DSH 里等同于 detailed，
 *  恢复时归一为 detailed（见 restorableTranscript）。 */
const RESTORABLE_TRANSCRIPT_VIEWS = ['compact', 'standard', 'detailed']

/** 设置变化订阅者集合。 */
const listeners = new Set()
// `previousTranscript` 必须在 `load()` 运行之前声明：恢复的存档可能带这个字段，
// 若在 let 的暂时性死区里赋值会抛错，导致整份存档被静默丢弃。
let previousTranscript
/** 已解析的 `ui-chat` 表单缓存（configForms 晚到也能用）。 */
let transcriptForm
/** configForms 服务引用（initSettings 注入，可缺失）。 */
let configFormsRef
/** 当前设置快照（模块求值即加载）。 */
let state = load()

// 立即把 v4 写回一次：v3/v2 迁移结果必须落盘，否则下次刷新还会重新迁移。
persist()

/**
 * 归一化“展示风格”模式（v2 迁移用）。
 * 合法值原样返回；v2 存档可能存的是旧的“前一个样式值”，任何非空字符串都映射
 * 为 'enhanced'（保持老用户升级后仍看到插件展开风格）；其余返回 undefined（保留
 * 默认值）。
 */
function normalizeMode(value) {
  if (value === 'enhanced' || value === 'native') return value
  if (typeof value === 'string' && value !== '') return 'enhanced'
  return undefined
}

/** 枚举守卫：值在允许集合内返回原值，否则返回 fallback（读存档用）。 */
function normalizeEnum(value, allowed, fallback) {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback
}

/** 布尔守卫：只有真正的 boolean 通过，其余回退默认值。 */
function normalizeBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

/** 外壳配色：只有文档中的取值能通过一次存档往返，其余回退 'auto'。 */
function normalizeShellTone(value) {
  return normalizeEnum(value, SHELL_TONE_VALUES, 'auto')
}

/** 内部代码配色：额外接受 'same'（跟随外壳）。 */
function normalizeInnerTone(value) {
  return normalizeEnum(value, INNER_TONE_VALUES, 'auto')
}

/** transcriptView 白名单校验：只接受 DSH 已定义的取值，其余返回 undefined。 */
function normalizeTranscriptView(value) {
  return typeof value === 'string' && TRANSCRIPT_VIEW_VALUES.includes(value) ? value : undefined
}

/** 枚举字段校验器工厂：非法值返回 undefined（updateSettings 据此忽略该字段）。 */
function enumGuard(allowed) {
  return value => (typeof value === 'string' && allowed.includes(value) ? value : undefined)
}

/**
 * `updateSettings` 的字段白名单与校验器（安全审计 LOW-6）。
 *
 * 只接受 DEFAULTS 中已知的键；每个字段做枚举白名单或布尔类型校验，非法值
 * 忽略（language 例外：非法值按产品约定回退默认中文）。未知键一律忽略，避免
 * 外部调用把任意数据写进设置存档。
 */
const SETTING_VALIDATORS = {
  language: value => normalizeEnum(value, LANGUAGE_SETTINGS, DEFAULTS.language),
  fileCards: enumGuard(STYLE_VALUES),
  shellRows: enumGuard(STYLE_VALUES),
  toolCalls: enumGuard(STYLE_VALUES),
  transcript: enumGuard(STYLE_VALUES),
  fileShellTone: enumGuard(SHELL_TONE_VALUES),
  shellShellTone: enumGuard(SHELL_TONE_VALUES),
  toolShellTone: enumGuard(SHELL_TONE_VALUES),
  fileInnerTone: enumGuard(INNER_TONE_VALUES),
  shellInnerTone: enumGuard(INNER_TONE_VALUES),
  toolInnerTone: enumGuard(INNER_TONE_VALUES),
  syntaxHighlight: value => (typeof value === 'boolean' ? value : undefined),
  languageBadge: enumGuard(LANGUAGE_BADGE_VALUES),
  unknownLanguage: enumGuard(UNKNOWN_LANGUAGE_VALUES),
  syntaxEmphasis: enumGuard(SYNTAX_EMPHASIS_VALUES),
}

/**
 * 把宿主外观（浅色 / 深色，含“跟随系统”）镜像到文档属性上。
 *
 * 为什么需要：宿主把解析后的外观写成内联 `color-scheme`，官方原生控件也读它；
 * 但第三方主题在外观切换时可能仍保留深色文字 token，因此本插件不单靠主题 token
 * 判断明暗，而是把自己的观察结果写成 `data-dsh-inline-diff-appearance` 属性，
 * 由 styles.js / syntax-styles.js 的 `body[data-dsh-inline-diff-appearance=…]`
 * 规则选择配色。
 *
 * 判定顺序：`color-scheme` 内联值/computed 值 → body 的 `data-ds-dark-theme`
 * 属性（部分主题只通过它宣布深色）→ `prefers-color-scheme` 媒体查询。
 *
 * 属性同时写到 `<html>`（兼容/清理用）与 `<body>`：插件派生变量声明在 body
 * （宿主主题也在 body 声明 token），因此浅色外观覆盖必须同样作用在 body 上。
 *
 * 失败与回退：没有 document / 没有 MutationObserver（Node 单测）→ 返回 no-op
 * 清理函数；任何异常同样退化为 no-op，不影响设置与渲染。
 *
 * @returns {() => void} 停止观察并移除监听的清理函数。
 */
export function startAppearanceTracking() {
  try {
    const doc = globalThis.document
    const root = doc?.documentElement
    const body = doc?.body ?? null
    if (root === undefined || root === null || typeof MutationObserver !== 'function') return () => {}
    const styleOf = node => (node === null ? '' : String(globalThis.getComputedStyle?.(node)?.colorScheme || ''))
    const apply = () => {
      const tokens = [String(root.style.colorScheme || ''), styleOf(root), styleOf(body)]
        .filter(part => part !== '')
        .join(' ')
        .toLowerCase()
      let mode
      if (tokens.includes('dark')) mode = 'dark'
      else if (tokens.includes('light')) mode = 'light'
      // 部分主题只通过 data-ds-dark-theme 属性宣布深色外观。
      else if (body !== null && body.hasAttribute('data-ds-dark-theme')) mode = 'dark'
      else mode = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches === true ? 'dark' : 'light'
      if (root.dataset.dshInlineDiffAppearance !== mode) root.dataset.dshInlineDiffAppearance = mode
      if (body !== null && body.dataset.dshInlineDiffAppearance !== mode) body.dataset.dshInlineDiffAppearance = mode
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['style', 'class'] })
    if (body !== null) {
      observer.observe(body, { attributes: true, attributeFilter: ['style', 'class', 'data-ds-dark-theme'] })
    }
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    if (media !== null && media !== undefined && typeof media.addEventListener === 'function') media.addEventListener('change', apply)
    return () => {
      observer.disconnect()
      if (media !== null && media !== undefined && typeof media.removeEventListener === 'function') media.removeEventListener('change', apply)
    }
  } catch {
    return () => {}
  }
}

/**
 * 读取并迁移设置存档（模块求值时调用一次）。
 *
 * 迁移顺序：v4 → v3 → v2，逐级回退读取；v1 已退役不读。整个函数包 try/catch，
 * 任何异常（storage 抛错、坏 JSON、getter 异常）都整份回退默认值——设置读取
 * 失败绝不能阻止插件启动（README「设置读取」：存档损坏/超长 → 丢弃并回退默认）。
 *
 * @returns {object} 合法设置快照（每个字段都已过白名单校验）。
 */
function load() {
  try {
    const storage = globalThis.localStorage
    if (storage === undefined || storage === null) return { ...DEFAULTS }
    // v4 是当前格式；v3/v2 按顺序读入迁移，下次 persist 时清理旧 key。
    // v1 早于中性模式命名，不读取。
    let raw = storage.getItem(STORAGE_KEY)
    if (typeof raw !== 'string' || raw === '') raw = storage.getItem(LEGACY_KEY)
    if (typeof raw !== 'string' || raw === '') raw = storage.getItem(OLDER_KEY)
    if (typeof raw !== 'string' || raw === '') return { ...DEFAULTS }
    // 解析前先做长度上界（安全审计 LOW-5）：损坏或被同源脚本写入的超大 JSON
    // 直接放弃并回退默认值；随后 `persist()` 会用默认值覆盖坏存档，旧 key 也会
    // 被清理。正常设置的 JSON 只有几百字节，64 K 字符上限不会误伤。
    if (raw.length > MAX_STORED_SETTINGS_CHARS) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...DEFAULTS }
    const next = { ...DEFAULTS }
    // 插件界面语言。旧存档（1.3.0 之前）完全没有 language 字段，因此默认值
    // 'zh' 自然生效；手改 JSON 或未来版本留下的非法值（类型错误、'fr'、'EN'、
    // 42、null…）也一律回退 'zh'，保证插件不会用没有字典的语言渲染文案。
    next.language = normalizeEnum(parsed.language, LANGUAGE_SETTINGS, DEFAULTS.language)
    const fileCards = normalizeMode(parsed.fileCards)
    const shellRows = normalizeMode(parsed.shellRows)
    const toolCalls = normalizeMode(parsed.toolCalls)
    const transcript = normalizeMode(parsed.transcript)
    if (fileCards !== undefined) next.fileCards = fileCards
    if (shellRows !== undefined) next.shellRows = shellRows
    if (toolCalls !== undefined) next.toolCalls = toolCalls
    if (transcript !== undefined) next.transcript = transcript
    if (parsed.fileShellTone !== undefined) next.fileShellTone = normalizeShellTone(parsed.fileShellTone)
    if (parsed.shellShellTone !== undefined) next.shellShellTone = normalizeShellTone(parsed.shellShellTone)
    if (parsed.toolShellTone !== undefined) next.toolShellTone = normalizeShellTone(parsed.toolShellTone)
    if (parsed.fileInnerTone !== undefined) next.fileInnerTone = normalizeInnerTone(parsed.fileInnerTone)
    if (parsed.shellInnerTone !== undefined) next.shellInnerTone = normalizeInnerTone(parsed.shellInnerTone)
    if (parsed.toolInnerTone !== undefined) next.toolInnerTone = normalizeInnerTone(parsed.toolInnerTone)
    // 语法高亮相关选项：坏类型/坏枚举（旧存档、手改或残缺 JSON）一律回退文档
    // 默认值，而不是抛错。
    next.syntaxHighlight = normalizeBoolean(parsed.syntaxHighlight, DEFAULTS.syntaxHighlight)
    next.languageBadge = normalizeEnum(parsed.languageBadge, LANGUAGE_BADGE_VALUES, DEFAULTS.languageBadge)
    next.unknownLanguage = normalizeEnum(parsed.unknownLanguage, UNKNOWN_LANGUAGE_VALUES, DEFAULTS.unknownLanguage)
    next.syntaxEmphasis = normalizeEnum(parsed.syntaxEmphasis, SYNTAX_EMPHASIS_VALUES, DEFAULTS.syntaxEmphasis)
    // previousTranscript 只接受 DSH transcriptView 白名单内的值（LOW-6）：
    // 它之后会被回传给 configForms.set('transcriptView', …)，不能带任意字符串。
    previousTranscript = normalizeTranscriptView(parsed.previousTranscript)
    return next
  } catch {
    return { ...DEFAULTS }
  }
}

/**
 * 把当前设置写回 localStorage（v4），并清理旧版本 key。
 *
 * 只有持久化失败会丢失：隐私模式 / 配额满时 setItem 抛错被吞掉，内存中的
 * state 与订阅通知已经生效，实时切换外观仍然工作（README「设置读取」的最终
 * 回退）。previousTranscript 为空时不写该字段，保持存档最小。
 */
function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      ...previousTranscript === undefined ? {} : { previousTranscript },
    }))
    globalThis.localStorage?.removeItem(LEGACY_KEY)
    globalThis.localStorage?.removeItem(OLDER_KEY)
    globalThis.localStorage?.removeItem(RETIRED_KEY)
  } catch {
    // 写盘被拒只损失持久化；内存设置与实时切换仍然工作。
  }
}

/** 同步通知全部设置订阅者（React 侧 Hook 据此重渲染）。 */
function emit() {
  for (const listener of listeners) listener()
}

/** 当前设置快照；两次变更之间引用稳定（React 浅比较依赖这一点）。 */
export function getSettings() {
  return state
}

/** 订阅设置变化；返回取消订阅函数。 */
export function subscribeSettings(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * 合并一个补丁进设置并通知订阅者。
 *
 * 形状校验（安全审计 LOW-6）：只为 DEFAULTS 中已知的键做枚举/类型白名单校验；
 * 未知键与非法值一律忽略（language 例外：非法值按产品约定回退 zh）。没有任何
 * 合法字段时不写盘、不通知，避免噪声事件。
 *
 * @param {object} patch - 待更新字段（可含多个键）。
 */
export function updateSettings(patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return
  const next = {}
  for (const key of Object.keys(patch)) {
    const validate = SETTING_VALIDATORS[key]
    if (typeof validate !== 'function') continue
    const value = validate(patch[key])
    if (value !== undefined) next[key] = value
  }
  if (Object.keys(next).length === 0) return
  state = { ...state, ...next }
  persist()
  emit()
}

/**
 * 全部恢复默认值（含把 DSH transcript 偏好恢复/切换到默认对应状态）。
 * configForms 服务失败只影响 DSH 偏好这一步，本地设置照常重置。
 */
export async function resetSettings() {
  const wasEnhanced = state.transcript === 'enhanced'
  state = { ...DEFAULTS }
  previousTranscript = undefined
  persist()
  emit()
  try {
    if (state.transcript === 'enhanced') await adoptTranscriptPreference()
    else if (wasEnhanced) await setTranscriptPreference('native')
  } catch {
    // 设置服务失败不能阻塞本地选项的重置（本地设置已生效）。
  }
}

/**
 * 接线客户端共享的 configForms 服务，并尝试重新应用已持久化的 flat 偏好。
 * 服务可能晚于本插件连接，因此这里只保存引用；后续使用时再解析表单。
 */
export function initSettings(configForms) {
  configFormsRef = configForms
  void adoptTranscriptPreference()
}

/**
 * 解析 `ui-chat` 配置表单（首次使用时解析并缓存）。
 * 服务尚未接线时抛错，由调用方 catch 后降级（不影响其它设置）。
 */
function chatForm() {
  if (configFormsRef === undefined) throw new Error('configForms is not available')
  if (transcriptForm === undefined) transcriptForm = configFormsRef.get('ui-chat')
  return transcriptForm
}

/** 读取当前 DSH 对话记录模式；设置服务不可用时返回 undefined（UI 用兜底文案）。 */
export function currentTranscriptMode() {
  try {
    return chatForm().getSnapshot().value?.transcriptView
  } catch {
    return undefined
  }
}

/** 把任意已记录值归一为“可安全回传给 configForms”的 transcriptView 模式。 */
function restorableTranscript(value) {
  const normalized = normalizeTranscriptView(value)
  if (normalized === undefined) return undefined
  // 旧值 normal / expanded 在 DSH 里就读作 detailed，恢复时写回当前名称。
  return normalized === 'normal' || normalized === 'expanded' ? 'detailed' : normalized
}

/**
 * 记录“切到 flat 之前用户当前的 DSH 模式”，供切回 DSH 原生时恢复。
 *
 * 只接受 transcriptView 白名单内的值（安全审计 LOW-6）：verbose 表示用户本来
 * 就在 flat 模式，不覆盖已有记录；非法/缺失值同样不覆盖。这样 previousTranscript
 * 永远来自 DSH 的合法取值集合，绝不会把 localStorage 里的任意字符串回传。
 */
function rememberPreviousTranscript(current) {
  const restorable = restorableTranscript(current)
  if (restorable !== undefined && restorable !== 'verbose') previousTranscript = restorable
}

/**
 * 持久化插件选择并应用对应的 DSH 对话记录模式。
 *
 * 'enhanced'：先记录用户当前模式（用于之后恢复），保存插件选择，再把 DSH 切到
 * 'verbose'（官方“平铺不折叠”模式，而非 CSS hack）。
 * 'native'：保存插件选择；仅当 DSH 当前确实处于 verbose（很可能是本插件改的）
 * 才恢复记录的模式，避免覆盖用户自己后来在 DSH 设置里选的模式。
 *
 * 失败：configForms 未连接/写入失败时异常向上抛，由设置页显示可读错误（
 * settings-ui.jsx 的 catch → setError），不静默吞错。
 */
export async function setTranscriptPreference(mode) {
  const form = chatForm()
  if (mode === 'enhanced') {
    const current = form.getSnapshot().value?.transcriptView
    if (typeof current !== 'string') previousTranscript = 'standard'
    else rememberPreviousTranscript(current)
    updateSettings({ transcript: 'enhanced' })
    await form.set('transcriptView', 'verbose')
    return
  }
  updateSettings({ transcript: 'native' })
  const current = form.getSnapshot().value?.transcriptView
  if (current === 'verbose') {
    // 恢复用户在开启平铺展示之前的模式；这里再做一次白名单校验，保证损坏/
    // 手改的存档也绝不会把任意字符串写进 DSH 自己的设置。
    await form.set('transcriptView', restorableTranscript(previousTranscript) ?? 'standard')
  }
}

/**
 * 页面重新加载后重新应用已持久化的 flat 偏好。
 *
 * 只在插件选项为 'enhanced' 时运行；选择 native 时绝不去改动用户在 DSH 自己的
 * 设置里选定的模式。任何失败（服务未就绪/写入异常）都只影响这一次恢复，其余
 * 插件功能继续工作（设置页仍可手动切换）。
 */
export async function adoptTranscriptPreference() {
  if (state.transcript !== 'enhanced') return
  try {
    if (configFormsRef === undefined) return
    const form = chatForm()
    const current = form.getSnapshot().value?.transcriptView
    if (current !== 'verbose') {
      if (typeof current !== 'string') previousTranscript = 'standard'
      else rememberPreviousTranscript(current)
      await form.set('transcriptView', 'verbose')
      persist()
    }
  } catch {
    // 设置服务不可用：插件其余部分继续工作（设置页会显示当前模式未知）。
  }
}

/** 设置页显示的“当前生效值”文案（不写入 store，按需实时读取）。 */
export function effectiveTranscriptLabel() {
  const mode = currentTranscriptMode()
  if (state.transcript === 'native') return mode ?? 'native'
  return mode ?? 'verbose'
}
