/**
 * 设置快照的共享 React Hook。
 *
 * 职责：把 `settings.js` 的“外部 store”接进 React，让任意卡片/弹窗在设置变化
 * 时重渲染。1.3.0 之前这段 `useSyncExternalStore(subscribeSettings, getSettings,
 * getSettings)` 在 components.jsx、enhanced-shell.jsx、enhanced-tools.jsx、
 * settings-ui.jsx 各写了一份（完全相同的三参数调用），属于重复轮子；这里收敛为
 * 唯一实现，避免以后改订阅方式时漏改某一处。
 *
 * 为什么单独成文件而不是放进 settings.js：settings.js 是纯数据/持久化模块，
 * 必须能在没有安装 react 的纯 Node 环境里被 `tests/locales.test.mjs` 直接
 * import（见 i18n.js 的同类说明）。只有本模块和浏览器入口的 .jsx 文件依赖
 * react，因此 react 只能在 JSX/Hook 模块里出现。
 *
 * 依赖：react（useSyncExternalStore）、./settings.js（getSettings /
 * subscribeSettings）。
 * 输入输出：无参数；返回当前设置对象（变更之间引用稳定）。
 * 失败与回退：settings.js 的读取本身永不抛错（坏存档回退默认值），因此这里
 * 没有额外 catch；React 运行时缺失只可能出现在非浏览器环境，此时调用方
 * （.jsx 组件）本来就不会被加载。
 */
import { useSyncExternalStore } from 'react'
import { getSettings, subscribeSettings } from './settings.js'

/**
 * 订阅插件显示设置，返回当前设置快照。
 *
 * getSnapshot 与 getServerSnapshot 都传 `getSettings`：设置 store 是纯浏览器
 * 内存对象，没有“服务端渲染差异”，快照函数返回同一引用即可让 React 用浅比较
 * 判断是否重渲染。
 *
 * @returns {object} 当前设置（见 settings.js 的 DEFAULTS 形状）。
 */
export function useSettingsSnapshot() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}
