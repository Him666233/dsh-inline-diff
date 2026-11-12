/**
 * 卡片内呼吸动画同步（React 接线层）。
 *
 * 每张命令执行 / 工具调用卡片挂载时，圆点动画先开始、IN/OUT 状态条后挂载，
 * 于是同一张卡片里色条会落后圆点一段任意时间。这里用 `usePulseSync()` 在每次
 * 渲染后把卡片子树内的呼吸动画统一到同一起始时间，保证圆点与左边状态条
 * **同频同相、同时亮**；不同卡片仍由各自 callId 派生的负延迟保持错开。
 *
 * 为什么每次渲染都执行：IN/OUT 状态条（以及等待占位）是条件渲染的，可能在
 * 流式输出过程中较晚出现；每次渲染后对齐一次，新出现的动画会立即被拉回与
 * 圆点相同的相位。一次对齐只做 `getAnimations({subtree:true})` 与少量
 * `startTime` 赋值，代价远小于一帧渲染。
 *
 * 失败与回退：
 *   - 没有 root（ref 尚未挂载）→ 什么都不做；
 *   - 浏览器不支持 `Element.getAnimations` → `syncPulseAnimations` 返回 false，
 *     动画仍按 CSS 定义播放（退化为原来的相位，不影响功能）；
 *   - requestAnimationFrame 缺失（Node 单测 / 旧环境）→ 用 16ms 定时器兜底；
 *   - 组件卸载时取消全部待执行帧/定时器，不留下回调。
 */
import { useEffect, useRef } from 'react'
import { syncPulseAnimations } from './motion.js'

/** 挂载后补一次对齐的延时：覆盖“动画在下一帧才真正开始”的浏览器时序。 */
const LATE_SYNC_MS = 320

/**
 * 返回应挂到卡片根元素的 ref；组件每次渲染后都会把卡内呼吸动画对齐到同一相位。
 *
 * @returns {{ current: Element|null }} React ref。
 */
export function usePulseSync() {
  const ref = useRef(null)
  // 故意不传依赖数组：每次渲染后都对齐一次（条件渲染的状态条可能刚刚出现）。
  useEffect(() => {
    const root = ref.current
    if (root === null) return undefined
    syncPulseAnimations(root)
    let frame = null
    let timer = null
    const run = () => {
      syncPulseAnimations(root)
    }
    if (typeof requestAnimationFrame === 'function') frame = requestAnimationFrame(run)
    else timer = setTimeout(run, 16)
    const late = setTimeout(run, LATE_SYNC_MS)
    return () => {
      if (frame !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      if (timer !== null) clearTimeout(timer)
      clearTimeout(late)
    }
  })
  return ref
}
