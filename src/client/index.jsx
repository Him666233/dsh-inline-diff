/**
 * 浏览器半侧入口：注册全部 slot 贡献。
 *
 * 职责（本文件只做“接线”，不实现展示逻辑）：
 *   - 注入 React 运行时给 i18n.js（它刻意不静态 import react，见 i18n.js 说明）；
 *   - 注册双语字典与宿主 locale 接线；
 *   - 注入两份样式表（styles.js 主样式、syntax-styles.js 高亮样式）；
 *   - 启动 Read 行号角标观察器、外观（浅/深色）跟踪；
 *   - 按持久化设置注册 / 注销 keyed `tool.call.toolview` 接管（内联差异卡片、
 *     命令执行行、其它工具行），并注册两个 body 级弹窗（对比弹窗、设置弹窗）；
 *   - 注册设置页条目与侧边栏启动按钮（label 由宿主解析，语言变化时重注册）。
 *
 * 关键约束：
 *   - 工具视图注册归本插件 context 所有：切换显示风格时先 dispose 再注册，切回
 *     DSH 原生就是“释放接管、官方行回归”（README「工具视图注册」回退链）；
 *   - 每个 slot 组件都经 `withPluginI18n` 包装：宿主注入的 `t` 绑定 DSH 全局
 *     locale，而插件有自己的 language 设置（默认 zh / en / auto=跟随 DSH）。包装
 *     层用插件字典构造 `t`，因此整个插件 UI 跟随插件语言并能即时切换。
 *
 * 失败与回退：
 *   - 单个 toolview 注册失败只放弃该 key 并 console.warn（官方行继续渲染），
 *     不会中断整组注册或后续 apply（见 registerView）；
 *   - 无 document / 无 MutationObserver 的环境（Node 单测）里，样式注入与角标
 *     观察器由各自模块的防御性检查退化，本文件不额外抛错；
 *   - 不注册 `conversation.chat.node`（见文件中部说明），避免与官方 Tool 层
 *     的 slot 声明冲突导致 apply 中断。
 */
import { createElement, useSyncExternalStore } from 'react'
import { EnhancedShellCard } from './enhanced-shell.jsx'
import {
  ENHANCED_DETAILS_KEYS,
  ENHANCED_GENERIC_KEYS,
  ENHANCED_SEARCH_WEB_KEYS,
  EnhancedExpandedTool,
  SHELL_KEYS,
} from './enhanced-tools.jsx'
import { DiffModal, InlineDiffCard } from './components.jsx'
import { installGlassRefraction } from './glass-filters.js'
import {
  attachHostLocale,
  getPluginLanguage,
  installI18nRuntime,
  pluginTranslate,
  subscribePluginLanguage,
  withPluginI18n,
} from './i18n.js'
import { dicts, NS } from './locales.js'
import { MUTATION_TOOLS } from './model.js'
import { getSettings, initSettings, startAppearanceTracking, subscribeSettings } from './settings.js'
import { CSS } from './styles.js'
import { SYNTAX_CSS } from './syntax-styles.js'
import { startReadRangeChips } from './read-range-dom.js'
import { VERSION } from './project.js'
import { SettingsLauncher, SettingsModal, SettingsSection } from './settings-ui.jsx'

/**
 * 把 React 运行时注入 i18n 模块。i18n.js 故意不静态 import react，以便
 * `tests/locales.test.mjs` 在纯 Node（未安装 react）下直接单测纯函数；
 * `withPluginI18n` 需要的 createElement / useSyncExternalStore 在这里提供。
 */
installI18nRuntime({ createElement, useSyncExternalStore })

/**
 * 用 withPluginI18n 包好的 slot 组件。包装结果放在模块级常量里，保证每次
 * 注册/重注册都是同一个组件引用（不会因为新组件身份导致已挂载行重挂载）。
 */
const PluginInlineDiffCard = withPluginI18n(InlineDiffCard)
const PluginEnhancedShellCard = withPluginI18n(EnhancedShellCard)
const PluginEnhancedExpandedTool = withPluginI18n(EnhancedExpandedTool)
const PluginDiffModal = withPluginI18n(DiffModal)
const PluginSettingsModal = withPluginI18n(SettingsModal)
const PluginSettingsSection = withPluginI18n(SettingsSection)
const PluginSettingsLauncher = withPluginI18n(SettingsLauncher)

/** 注入的服务：槽位、语言字典、宿主共享的配置表单（configForms）。 */
export const inject = ['slots', 'locale', 'configForms']

/** 被内联差异卡片接管的工具名（唯一来源：model.js 的 MUTATION_TOOLS）。 */
const INLINE_DIFF_KEYS = MUTATION_TOOLS
/** 被增强平铺命令行接管的工具名（唯一来源：enhanced-tools.jsx 的 SHELL_KEYS）。 */
const ENHANCED_SHELL_KEYS = SHELL_KEYS
/**
 * keyed `tool.call.toolview` 注册的优先级。
 *
 * 官方 Tool 层用默认优先级（0），主题/配套插件也可能以 -1 覆盖工具视图。槽位
 * 注册表拒绝“同一 key + 同一 priority”的重复注册，因此这里取一个明显更低的值：
 * 本插件的视图会被渲染（最低优先级渲染），而主题插件在 -1 注册时双方都不会在
 * 启动期抛“already declared”错误。
 */
const VIEW_PRIORITY = -100

/**
 * 挂载全部插件贡献。
 * @param ctx - 客户端根 context（服务通过 `inject` 注入：slots / locale /
 *   configForms）。
 */
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dicts), 'dsh-inline-diff: dictionaries')
  // 接线 DSH 的 locale face：插件语言为 'auto' 时，用户切换 DSH 全局语言后
  // 插件 UI 也要跟着刷新；组件清理时取消订阅并复位模块状态。
  ctx.effect(() => attachHostLocale(ctx.locale), 'dsh-inline-diff: host locale')
  // 全页只注入一次主样式表。命令行/通用行/详情行可以在没有任何差异卡片或弹窗
  // 的情况下单独挂载，因此不能依赖“某个组件顺带渲染 style 标签”。
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'inline-diff'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-inline-diff: stylesheet')
  // 语法高亮独占第二份样式表：调色板是数据驱动、可独立替换的；没有 token 时
  // 各表面仍按默认前景色正确渲染（两份样式表互不依赖）。
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'inline-diff-syntax'
    style.textContent = SYNTAX_CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-inline-diff: syntax stylesheet')
  // 液态玻璃的全局 SVG 折射滤镜 + 能力门控：整页只注入一次。没有它时
  // styles.js 的液态玻璃会退化为「只有 blur + 高光」的降级形态，不会破相。
  ctx.effect(() => installGlassRefraction(), 'dsh-inline-diff: glass refraction filters')
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`)
  // Read range 角标直接操作 DOM 而非 React 组件，所以传“按调用时插件语言翻译”
  // 的动态函数：新挂载的 Read 行角标一定用当前语言渲染。
  ctx.effect(() => startReadRangeChips(pluginTranslate), 'dsh-inline-diff: read range chips')
  initSettings(ctx.configForms)
  // 把宿主浅色/深色外观镜像到文档（html + body），让插件表面挑选可读的外壳/
  // 内部配色；dispose 时恢复宿主原样（删除插件写入的属性）。
  ctx.effect(() => {
    const stopAppearance = startAppearanceTracking()
    return () => {
      stopAppearance()
      if (typeof document !== 'undefined') {
        delete document.documentElement.dataset.dshInlineDiffAppearance
        if (document.body !== null) delete document.body.dataset.dshInlineDiffAppearance
      }
    }
  }, 'dsh-inline-diff: appearance')

  // 工具行接管跟随持久化的显示选项。重新注册前先 dispose 旧集合，让官方 DSH
  // 行先回归，再按新设置注册（避免残留上一组视图）。
  ctx.slots.inject('tool.call.toolview', () => {
    let disposers = []
    let signature = ''
    const clear = () => {
      for (const dispose of disposers) dispose()
      disposers = []
    }
    /**
     * 注册一个 keyed toolview，并把注册失败限制在单个 key 上。
     *
     * 回退链（与 README「工具视图注册」一致）：keyed 接管 → 某个 key 注册失败
     * 时释放该次注册（并未注册成功，无需释放）→ 官方通用行继续渲染。槽位注册
     * 在 key+priority 冲突等情况下会抛错；若让异常冒出 inject 回调，会中断本次
     * sync 里其余 key 的注册甚至整个 apply，导致“只有一部分工具行变成插件样式”
     * 且没有可读原因。这里逐项 try/catch：成功路径行为不变，失败路径只放弃这
     * 一项并用 console.warn 留下可诊断信息（不静默吞错）。
     *
     * @param {string} key - 工具名（slot key）。
     * @param {Function} Component - 已用 withPluginI18n 包装的行组件。
     */
    const registerView = (key, Component) => {
      try {
        disposers.push(ctx.slots.register({
          name: 'tool.call.toolview',
          key,
          priority: VIEW_PRIORITY,
          locale: NS,
        }, Component))
      } catch (error) {
        console.warn(`[dsh-inline-diff] cannot take over tool view "${key}"; the stock DSH row stays active`, error)
      }
    }
    const sync = () => {
      const settings = getSettings()
      const next = `${settings.fileCards}|${settings.shellRows}|${settings.toolCalls}`
      if (next === signature) return
      signature = next
      clear()
      if (settings.fileCards === 'enhanced') {
        for (const key of INLINE_DIFF_KEYS) registerView(key, PluginInlineDiffCard)
      }
      if (settings.shellRows === 'enhanced') {
        for (const key of ENHANCED_SHELL_KEYS) registerView(key, PluginEnhancedShellCard)
      }
      // 详情类工具自带 keyed 视图，也一并接管，让“其它工具调用”选项同样作用于
      // 例如“查询运行时”。搜索/网页工具原生是富卡片，同一选项也接管，避免同一段
      // 对话里平铺行与原生折叠卡片混用。
      if (settings.toolCalls === 'enhanced') {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS, ...ENHANCED_SEARCH_WEB_KEYS]) {
          registerView(key, PluginEnhancedExpandedTool)
        }
      }
    }
    const unsubscribe = subscribeSettings(sync)
    sync()
    return () => {
      unsubscribe()
      clear()
    }
  })

  // 不要覆盖 `conversation.chat.node` 的工具调用入口。dsh >= 0.2.2-rc.1 里官方
  // Tool 层（@deepseek-ai/dsh-client-ui-tool）拥有该入口，并把
  // `tool.call.toolview` 声明为其子槽位；槽位注册表每个 slot 只允许一份声明，
  // 再声明一次 `children` 表会抛 "slot ... is already declared"，中断 apply()
  // 余下全部注册。上面的 keyed 注册才是受支持的扩展点：官方树按工具名分发，
  // 未注册的工具继续用官方通用行。

  // 全屏级浮层。两者都通过 body 级 React portal 渲染，因此位于宿主 chrome、
  // 主题与第三方浮动层之上（对比弹窗；设置弹窗同理）。
  ctx.slots.inject('shell.overlay', function* () {
    yield ctx.slots.register({
      name: 'shell.overlay',
      id: 'inline-diff.modal',
      order: 60,
      locale: NS,
    }, PluginDiffModal)
    yield ctx.slots.register({
      name: 'shell.overlay',
      id: 'inline-diff.settings',
      order: 61,
      locale: NS,
    }, PluginSettingsModal)
  })

  /**
   * 注册一个“宿主负责渲染 label”的 slot 条目（设置页导航行 / 侧边栏底部按钮）。
   *
   * 为什么需要重注册：label 由宿主在渲染时调用注册项上的 label()，而宿主的
   * 设置导航只会在“slot 版本变化”或“DSH locale revision 变化”时重算导航行
   * （见 dsh-client-ui-settings-general 的 sections store）。只改插件自己的
   * language 设置不会触发这两个信号，因此这里订阅插件语言，语言解析结果变化
   * 时先 dispose 再 register —— 版本号变化让宿主重新调用 label()，而 label()
   * 内部读的是“当前插件语言”，导航文字于是立即切换。
   *
   * @param {string} slotName - 槽位名。
   * @param {() => object} makeOptions - 生成注册项的工厂（label 用动态翻译）。
   * @param {Function} Component - 已用 withPluginI18n 包装的组件。
   */
  const injectLocalizedEntry = (slotName, makeOptions, Component) => {
    ctx.slots.inject(slotName, () => {
      let dispose = null
      let language = null
      const sync = () => {
        const next = getPluginLanguage()
        if (dispose !== null && next === language) return
        const previous = dispose
        dispose = null
        language = next
        if (previous !== null) previous()
        dispose = ctx.slots.register(makeOptions(), Component)
      }
      const unsubscribe = subscribePluginLanguage(sync)
      try {
        sync()
      } catch (error) {
        unsubscribe()
        throw error
      }
      return () => {
        unsubscribe()
        if (dispose !== null) {
          dispose()
          dispose = null
        }
      }
    })
  }

  // 设置 shell 内的一整页设置。label 由宿主在渲染时解析，因此插件语言变化时
  // 需要重注册让宿主重新调用 label()（见 injectLocalizedEntry）。
  injectLocalizedEntry('settings.section', () => ({
    name: 'settings.section',
    id: 'inline-diff',
    order: 40,
    label: () => pluginTranslate('settings.nav'),
    locale: NS,
  }), PluginSettingsSection)

  // 侧边栏底部启动按钮：即使第三方主题隐藏或改写了 DSH 原生设置入口，
  // 插件设置仍然可达。
  injectLocalizedEntry('sidebar.footer.action', () => ({
    name: 'sidebar.footer.action',
    id: 'inline-diff.settings',
    order: 40,
    label: () => pluginTranslate('settings.short'),
    locale: NS,
  }), PluginSettingsLauncher)
}
