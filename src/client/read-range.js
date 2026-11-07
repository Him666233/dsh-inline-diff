/**
 * Read 工具的行号范围推导（折叠态外部范围角标的数据层）。
 *
 * 背景：DSH 原生 Read 卡片保持官方展示，本插件只在文件链接旁追加一个
 * 「L x–L y」范围小角标。角标数据有两个来源，按“权威性优先”排序：
 *   1. 已落定调用的工具元数据 `meta.lines`（Host 实际返回的行，最准确）；
 *   2. 还在执行的调用只有参数（offset / limit）时，按参数推算一个保守范围。
 *
 * 依赖：./model.js 的 deriveCall（把两种 block 形状归一成调用对象）。
 * 输入输出：所有导出都是纯函数，不读 DOM、不写状态：
 *   - compressLineRanges(numbers) → [{start,end}]：把离散行号压成连续区间；
 *   - readRangesForBlock(block) → 区间数组 | null：从 block 推导展示区间；
 *   - rangeLineCount(range) → number | null：区间代表的文本行数；
 *   - readRangeLabels(ranges, t) → string | null：渲染成 L 标签。
 *
 * 失败与回退（README「多级回退」精神的 display-only 变体）：
 *   - meta.lines 形状不对（非数组 / 元素不是对象 / number 非有限数）→ 逐个
 *     跳过非法元素；一个有效行号都没有时退回参数推算；
 *   - 运行中的调用只有路径、没有 offset/limit 时返回 null（不猜默认 2000 行
 *     上限，避免角标显示一个错误的巨大范围）；
 *   - 有 offset 无 limit → 展示“L x 起”（end=null 表示开放区间）；
 *   - 标签最多 4 段，超出用 '…' 省略，避免角标撑破行布局。
 */
import { deriveCall } from './model.js'

/**
 * 把排好序的行号压成连续区间。
 *
 * 例：[1,2,3,7,8,10] → [{start:1,end:3},{start:7,end:8},{start:10,end:10}]。
 * 非数字 / 非有限数元素直接跳过（不抛错）；乱序输入按原顺序断段（调用方只在
 * meta.lines 这种本就升序的数据上使用）。
 *
 * @param {Array<number>} numbers
 * @returns {Array<{start:number, end:number}>}
 */
export function compressLineRanges(numbers) {
  const ranges = []
  let start = null
  let previous = null
  for (const value of numbers) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    if (start === null) {
      start = previous = value
    } else if (value === previous + 1) {
      previous = value
    } else {
      ranges.push({ start, end: previous })
      start = previous = value
    }
  }
  if (start !== null) ranges.push({ start, end: previous })
  return ranges
}

/** 归一化一个可选的正整数参数；非法 / 非正数返回 null。 */
function positiveInt(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : null
}

/**
 * 推导一次 Read 调用要展示的行号区间。
 *
 * 主路径：已落定 → 用 `meta.lines`（Host 记录的真实行号）压缩成区间。
 * 回退：仍在执行 → 用参数 offset/limit 估算；只有路径时返回 null。
 *
 * 行号口径：offset 缺省为 1（Read 工具默认从第 1 行开始）；有 limit 时终点为
 * start+limit−1；没有 limit 时终点未知（end=null，渲染为“L x 起”）。
 *
 * @param {object} block - 工具调用 block（running 或 settled 均可）。
 * @returns {Array<{start:number, end:number|null}>|null} 区间；无法判断时 null。
 */
export function readRangesForBlock(block) {
  const call = deriveCall(block)
  const meta = call.meta
  if (meta !== null && typeof meta === 'object' && Array.isArray(meta.lines) && meta.lines.length > 0) {
    const numbers = meta.lines
      .map(line => (line !== null && typeof line === 'object' ? line.number : undefined))
      .filter(value => typeof value === 'number' && Number.isFinite(value))
    if (numbers.length > 0) return compressLineRanges(numbers)
  }
  const args = call.args
  if (args === null || typeof args !== 'object') return null
  const offset = positiveInt(args.offset)
  const limit = positiveInt(args.limit)
  // 运行中且只有 path：没有可辩护的终点，等落定的 meta，不猜默认 2000 行。
  if (offset === null && limit === null) return null
  const start = offset ?? 1
  if (limit === null) return [{ start, end: null }]
  return [{ start, end: start + limit - 1 }]
}

/** 一个区间代表的文本行数；end=null（开放区间）时返回 null。 */
export function rangeLineCount(range) {
  return range.end === null ? null : range.end - range.start + 1
}

/**
 * 把区间渲染成角标文案。
 *
 * 文案形态：
 *   - 开放区间 → t('readFrom', {line})，如“L 12 起 / from L 12”；
 *   - 单行     → "L 12"；
 *   - 多行     → "L 12 – L 34"；
 *   - 多段用 ' · ' 连接，最多 4 段，其余用 '…' 表示（角标必须保持一行可读）。
 *
 * @param {Array<{start:number, end:number|null}>} ranges
 * @param {Function} t - 插件语言翻译函数。
 * @returns {string|null} 没有区间时 null（调用方据此不挂角标）。
 */
export function readRangeLabels(ranges, t) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null
  const max = 4
  const labels = ranges.slice(0, max).map(range => {
    if (range.end === null) return t('readFrom', { line: range.start })
    if (range.start === range.end) return `L ${range.start}`
    return `L ${range.start} – L ${range.end}`
  })
  if (ranges.length > max) labels.push('…')
  return labels.join(' · ')
}
