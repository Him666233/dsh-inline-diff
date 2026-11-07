/**
 * 极简外部 store：会话级内联卡片与根级放大弹窗之间的唯一通信通道。
 *
 * 背景：内联差异卡片挂在会话 slot（`tool.call.toolview`）里，而放大对比弹窗
 * 是根级 overlay（`shell.overlay`），两者不在同一 React 子树，无法靠 props 传
 * 递数据。卡片点击“放大”时把展示模型写入本 store，overlay 通过
 * `useSyncExternalStore` 订阅并渲染。
 *
 * 依赖：无（不 import react，也不访问 DOM）。
 * 输入输出：
 *   - openDiffModal(payload)：发布一次展示模型（卡片模型投影，见
 *     components.jsx 的 modalPayloadOf）；
 *   - closeDiffModal()：清空并通知；重复关闭是幂等的；
 *   - getDiffModal()：读取当前模型；未打开时返回 null；
 *   - subscribeDiffModal(listener)：订阅开关变化，返回取消订阅函数。
 *
 * 失败与回退：
 *   - 没有弹窗打开时 close 直接返回，不发多余通知；
 *   - 订阅者异常由 React 的订阅机制处理（React 会重新订阅），本模块不吞异常；
 *   - payload 只保留最新一份：连续打开不同卡片时旧的模型被覆盖，overlay 永远
 *     只渲染最后点击的那一张，不会叠出多个弹窗。
 */

/** 当前弹窗载荷；null 表示弹窗关闭。 */
let payload = null
/** 订阅者集合：Set 保证同一 listener 重复订阅只触发一次。 */
const listeners = new Set()

/** 发布一个展示模型并通知 overlay 渲染（覆盖上一次的载荷）。 */
export function openDiffModal(next) {
  payload = next
  for (const listener of listeners) listener()
}

/** 关闭弹窗；未打开时是安全的空操作。 */
export function closeDiffModal() {
  if (payload === null) return
  payload = null
  for (const listener of listeners) listener()
}

/** 当前弹窗载荷（两次变更之间引用稳定，可作为 React 快照）。 */
export function getDiffModal() {
  return payload
}

/** 订阅弹窗开关；返回值用于组件卸载/effect 清理时取消订阅。 */
export function subscribeDiffModal(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
