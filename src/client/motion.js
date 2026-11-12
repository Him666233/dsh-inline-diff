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
 *   - 同一张卡片内后挂载的元素（例如输出到达后才出现的 OUT 状态条）会在挂载
 *     时晚开始动画，仅靠相同的 delay 无法对齐，因此再由
 *     `syncPulseAnimations` 把它们统一到同一起始时间（见该函数说明）；
 *   - 缺失/非法 key：回退 0 偏移，同卡片内依然保持同步，不影响功能。
 *
 * 本模块保持纯函数（不 import React / 不访问 DOM 全局），React 侧的接线在
 * `use-pulse-sync.js`，因此 `node --test` 可以直接单测这里的纯函数。
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

/**
 * 本插件所有“呼吸”动画的 CSS 动画名。同步函数只处理这些动画，绝不碰宿主/
 * 第三方插件的动画（主题过渡、开屏动画等）。
 *
 * @type {ReadonlyArray<string>}
 */
export const PULSE_ANIMATION_NAMES = Object.freeze(['dsh-inline-diff-pulse', 'dsh-inline-diff-bar-pulse'])

/** 判断一个 Animation 是否是本插件的呼吸动画。 */
function isPulseAnimation(animation) {
  const name = animation?.animationName
  return typeof name === 'string' && PULSE_ANIMATION_NAMES.includes(name)
}

/**
 * 把一张卡片内部的全部呼吸动画对齐到同一个起始时间（同一相位）。
 *
 * 为什么需要：圆点在卡片挂载时就已存在，而 IN/OUT 状态条要等参数/输出文本到达
 * 后才挂载；CSS 动画从元素第一次匹配动画时开始计时，因此同一张卡片里后挂载的
 * 状态条会落后圆点一段任意时长（实测约 1~5 帧，流式参数到达时更长），表现为
 * “圆点和左边色条不同步、不同时亮”。两者的 animation-duration / animation-delay
 * 已经相同，缺的只是同一起跑线。
 *
 * 修复方式：用 Web Animations API 把卡片子树内全部呼吸动画的 `startTime` 统一
 * 改成其中最早的一个。每个元素自身的负延迟（--did-pulse-phase，按 callId 派生）
 * 保持不变，所以：同一张卡片内同频同相；不同卡片仍各自错开，不会整页同步闪烁。
 *
 * 边界与回退：
 *   - 没有 `getAnimations`（旧浏览器 / Node 单测）→ 返回 false，不动任何动画；
 *   - 卡片内呼吸动画少于 2 个（例如只有圆点在呼吸）→ 无需同步，返回 false；
 *   - 仍处于 pending（startTime 为 null）的动画暂时跳过，下一帧由调用方再试，
 *     因此不会把尚未开始的动画写到错误时间点。
 *
 * @param {Element|undefined|null} root - 卡片根元素。
 * @returns {boolean} 是否至少对齐过一对动画（调用方可据此判断是否需要重试）。
 */
export function syncPulseAnimations(root) {
  if (root === null || root === undefined || typeof root.getAnimations !== 'function') return false
  let animations
  try {
    animations = root.getAnimations({ subtree: true })
  } catch {
    return false
  }
  const pulses = animations.filter(animation => isPulseAnimation(animation) && typeof animation.startTime === 'number')
  if (pulses.length < 2) return false
  let base = Infinity
  for (const animation of pulses) if (animation.startTime < base) base = animation.startTime
  if (!Number.isFinite(base)) return false
  let aligned = false
  for (const animation of pulses) {
    if (animation.startTime === base) continue
    try {
      animation.startTime = base
      aligned = true
    } catch {
      // 个别动画不可写（浏览器差异）时保持原样，不影响其它动画。
    }
  }
  // 已经同相（aligned 为 false）也算“无需再对齐”，返回 true 让调用方停止重试。
  return aligned || pulses.length >= 2
}

/* ============================ 卡片/弹窗入场动画 ============================ */

/**
 * 卡片入场动画时长（毫秒）。CSS 中的 `did-card-enter` 必须与此一致；只给
 * “运行中/准备中”新挂载的工具卡片用，历史回放和已结算卡片不播。
 */
export const ENTRANCE_DURATION_MS = 200

/** 输出出现动画时长（毫秒）；与 CSS 的 `did-output-enter` 保持一致。 */
export const OUTPUT_REVEAL_DURATION_MS = 160

/**
 * 是否属于“仍在进行中”的工具状态。
 *
 * 入场动画只在这种状态挂载时开启：命令刚发出、输出还在等的时候，卡片从无到有
 * 应该是轻微的淡入+上移；而历史回放（挂载时已 settled）和几毫秒就完成的调用
 * 直接显示终态更干脆——不为动画而上动画。
 */
export function isLiveToolState(state) {
  return state === 'running' || state === 'preparing'
}

/**
 * 浏览器是否启用了“减少动效”偏好。Node（单测）或异常环境返回 false；
 * 真正的动画禁用由 CSS `@media (prefers-reduced-motion: no-preference)` 兜底，
 * 这里供需要 JS 决策的调用方（例如弹窗焦点/滚动补偿）使用。
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
