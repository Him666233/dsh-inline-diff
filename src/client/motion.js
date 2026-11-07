/**
 * 卡片呼吸动画相位工具（纯函数，浏览器半区共用）。
 *
 * 背景：工具调用 / 命令执行卡片在执行中会让「左上角状态点」和「IN/OUT 状态色条」
 * 一起呼吸。两者此前使用不同时长（1.1s / 1.2s）的 CSS 动画，导致同一张卡片内的
 * 圆点与色条逐渐分叉；而所有卡片又都在挂载时从 0 相位开始，容易出现整页卡片
 * 同步闪烁的观感。
 *
 * 本模块只负责「相位」这一件事：
 *   - 同一张卡片：圆点与色条共用同一个负 `animation-delay`，因此频率与相位一致
 *     （各自的动画效果仍分开定义：圆点是透明度呼吸，色条是描边颜色呼吸）；
 *   - 不同卡片：用 callId 派生不同的负延迟，让卡片之间自然错开、不会整页同步；
 *   - 缺失/非法 key：回退 0 偏移，同卡片内依然保持同步，不影响功能。
 *
 * 输入：任意稳定 key（通常是工具调用的 callId，字符串/数字/undefined）。
 * 输出：可直接写入 CSS 自定义属性 `--did-pulse-phase` 的负毫秒字符串。
 */

/** 圆点与色条共用的呼吸周期（毫秒）；CSS 中的 animation-duration 必须与此一致。 */
export const PULSE_DURATION_MS = 1200

/**
 * 由卡片 key 派生一个稳定的负动画延迟。
 *
 * 使用简单的 31 进制字符串散列（确定性、无副作用），把不同卡片映射到
 * [0, PULSE_DURATION) 的相位上；同 key 始终得到同值，因此同一张卡片的
 * 圆点与各段色条天然同相。
 *
 * @param {unknown} key 卡片稳定标识（通常为 callId）。
 * @returns {string} 形如 `-430ms` 的负延迟；key 缺失时返回 `0ms`。
 */
export function pulsePhase(key) {
  const text = typeof key === 'string' ? key : key === undefined || key === null ? '' : String(key)
  if (text === '') return '0ms'
  let hash = 0
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0
  }
  return `${-(hash % PULSE_DURATION_MS)}ms`
}
