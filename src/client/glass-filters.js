/**
 * 液态玻璃的全局折射滤镜与能力门控（浏览器半区，纯副作用模块）。
 *
 * 背景：Chromium（DSH Web UI 的 Electron 内核）支持在 `backdrop-filter` 里引用
 * SVG filter，从而对**背景**做 feTurbulence + feDisplacementMap 位移，得到苹果
 * Liquid Glass 那种「透过玻璃看到的背景被轻微折射」的观感。这是纯 CSS 做不到的
 * 部分（CSS 变量喂不进 SVG 图元，所以折射强度只能做成离散挡位）。
 *
 * 本模块只做两件事，都在插件 apply 时执行一次：
 *
 *   1. 往文档注入一份**静态、可信、无用户输入**的 SVG filter defs（幂等）；
 *      滤镜 id 固定为 did-glass-refract-sm / -md / -lg，由 styles.js 的液态玻璃
 *      规则引用；
 *   2. 做能力门控：只有「Chromium 主版本足够新 + CSS 支持 backdrop-filter url()」
 *      才给 `<html>` 加 `did-glass-refract-ok` 类，styles.js 里所有带 url(#…)
 *      的声明都在这个门控类之下。原因：
 *      - 老的 Chromium 会把 `url(#filter)` 解析为合法值（CSS.supports 也会返回
 *        true），但合成器不认，整条 backdrop-filter 会被忽略——连 blur 一起
 *        丢掉，玻璃变纯色。因此必须叠加内核版本判断（DSH 0.2.2 的 Electron 44
 *        对应 Chromium 152，实测 152+ 可用）。
 *
 * 失败与回退：
 *   - 没有 document（Node 单测）→ 返回 no-op 清理函数，不抛错；
 *   - 注入时 body/documentElement 缺失或 SVG 不被支持 → 跳过注入，门控类也不加，
 *     styles.js 退化为「只有 blur + 高光」的降级玻璃，不会破相；
 *   - 返回的清理函数可安全重复调用（移除注入节点与门控类）。
 */

/** 注入的 SVG 容器 id（幂等判断 + 清理定位）。 */
const FILTER_DEFS_ID = 'dsh-inline-diff-glass-filters'
/** 折射能力门控类：挂在 <html> 上，由 styles.js 的液态玻璃规则消费。 */
export const REFRACTION_GATE_CLASS = 'did-glass-refract-ok'
/** 最低可信 Chromium 主版本（DSH Web UI 官方内核为 Chromium 152）。 */
const MIN_CHROMIUM_MAJOR = 152

/**
 * 静态 SVG filter defs。字符串是模块内常量、不含任何外部/用户输入，因此插入
 * innerHTML 是安全的（不会执行脚本）。
 *
 * 三个挡位对应不同尺寸的表面：
 *   - sm（scale 9）：小徽标 / 头部条，避免位移把圆角「啃掉」；
 *   - md（scale 18）：卡片内容区、弹窗等常规表面；
 *   - lg（scale 30）：完全通透（clear）模式，边缘折射最明显。
 * 所有 filter 都显式写 `color-interpolation-filters="sRGB"`（linearRGB 会让
 * 128 中值漂移、整块背景被压暗），并把滤镜区域放大到元素边界外，避免位移采样
 * 越界取到透明而在圆角处出现暗边。
 */
const FILTERS_MARKUP = `
<defs>
  <filter id="did-glass-refract-sm" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.010 0.013" numOctaves="2" seed="7" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="1.4" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="9" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="did-glass-refract-md" x="-18%" y="-18%" width="136%" height="136%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.011" numOctaves="2" seed="13" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="1.8" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="18" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="did-glass-refract-lg" x="-22%" y="-22%" width="144%" height="144%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0075 0.0095" numOctaves="3" seed="21" result="noise" />
    <feGaussianBlur in="noise" stdDeviation="2.2" result="soft" />
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="30" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</defs>
`

/**
 * 解析 Chromium 主版本号；非 Chromium 内核返回 0。
 *
 * @param {string|undefined} userAgent - 可注入（单测用），缺省读 navigator。
 * @returns {number}
 */
export function chromiumMajor(userAgent = globalThis.navigator?.userAgent) {
  if (typeof userAgent !== 'string') return 0
  const match = userAgent.match(/Chrom(?:e|ium)\/(\d+)/)
  if (match === null) return 0
  const major = Number(match[1])
  return Number.isFinite(major) ? major : 0
}

/**
 * 是否启用 SVG 折射：内核版本足够新且 CSS 解析同意。
 *
 * 注意 `CSS.supports('backdrop-filter', 'url(#x)')` 单独不可信（老内核会误报
 * true），因此这里是「版本号 + supports」双条件。
 *
 * @param {string|undefined} userAgent - 可注入（单测用）。
 * @param {object|undefined} css - 可注入（单测用），通常为 globalThis.CSS。
 * @returns {boolean}
 */
export function supportsBackdropRefraction(userAgent = globalThis.navigator?.userAgent, css = globalThis.CSS) {
  try {
    if (chromiumMajor(userAgent) < MIN_CHROMIUM_MAJOR) return false
    if (css === undefined || css === null || typeof css.supports !== 'function') return false
    return css.supports('backdrop-filter', 'url(#did-glass-refract-sm)') === true
      || css.supports('-webkit-backdrop-filter', 'url(#did-glass-refract-sm)') === true
  } catch {
    return false
  }
}

/**
 * 注入 SVG 滤镜 defs 并按能力切换门控类；返回幂等清理函数。
 *
 * @returns {() => void} 清理函数（移除注入节点与门控类）。
 */
export function installGlassRefraction() {
  const doc = globalThis.document
  if (doc === undefined || doc === null) return () => {}
  const root = doc.documentElement
  const host = doc.body ?? root
  if (root === null || root === undefined || host === null || host === undefined) return () => {}
  let container = null
  try {
    if (doc.getElementById(FILTER_DEFS_ID) === null) {
      container = doc.createElement('svg')
      container.id = FILTER_DEFS_ID
      container.setAttribute('width', '0')
      container.setAttribute('height', '0')
      container.setAttribute('aria-hidden', 'true')
      container.setAttribute('focusable', 'false')
      container.setAttribute('style', 'position:absolute;width:0;height:0;pointer-events:none')
      container.innerHTML = FILTERS_MARKUP
      host.appendChild(container)
    }
  } catch {
    container = null
  }
  let gated = false
  try {
    if (supportsBackdropRefraction()) {
      root.classList.add(REFRACTION_GATE_CLASS)
      gated = true
    } else {
      root.classList.remove(REFRACTION_GATE_CLASS)
    }
  } catch {
    // 类操作失败只影响折射增强，玻璃仍有 blur + 高光。
  }
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    try {
      if (container !== null && container.isConnected) container.remove()
      else doc.getElementById(FILTER_DEFS_ID)?.remove()
    } catch {
      // 清理失败不影响页面
    }
    if (gated) {
      try {
        root.classList.remove(REFRACTION_GATE_CLASS)
      } catch {
        // 同上
      }
    }
  }
}
