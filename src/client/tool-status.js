/**
 * 增强风格工具卡片的 IN / OUT 分段状态推导（纯函数）。
 *
 * 背景：每张增强卡片把一次工具调用拆成两条独立着色的状态条：
 *   - IN  —— 模型提供的参数/名字（派发之前，见 enhanced-shell.jsx 的 IN 段）；
 *   - OUT —— 工具返回的结果文本。
 * 失败可能发生在任意一侧：
 *   - 参数/模式校验/派发失败 → 工具主体根本没执行：IN 失败、OUT 跳过
 *     （`{input:'error', output:'skipped'}`）；
 *   - 其余失败发生在产出结果的过程中 → OUT 失败（`{input:'ok', output:'error'}`）；
 *   - 客户端标记的 `interrupted`（整体被中止）不属于任何一侧失败：
 *     `{input:'ok', output:'stopped'}`。
 *
 * 依赖：./model.js 的 parseArgs（用于“无错误码时按参数是否可解析归因”）。
 * 输入输出：全部是纯函数，输入是 `deriveCall(block)` 的结果（允许任意畸形
 * 输入），输出是 `SectionStates = { input, output }` 状态对。
 *
 * 边界与失败回退（渲染层可以无条件调用）：
 *   - 所有导出函数都包在 try/catch 里，畸形对象 / 抛错 getter 一律回退到
 *     “运行中”状态，绝不抛错；
 *   - 没有 error.code 时：原始参数非空但不是 JSON 对象 → 归因为 IN 失败；
 *     参数为空或可解析 → 归因为 OUT 失败；
 *   - 错误码比较大小写不敏感（`input_failure_codes` 也认）。
 */

import { parseArgs } from './model.js'

/**
 * `ToolErrorInfo.code` 中表示“调用在工具主体执行前就被拒绝”的取值
 * （比较时统一转大写，因此大小写不敏感）。
 *
 * 例：INVALID_ARGS（参数不合法）、UNKNOWN_TOOL（工具不存在）、
 * ABORTED_BEFORE_DISPATCH（派发前中止）——这三种情况下 OUT 根本没有内容，
 * 归因给 IN 才能让用户看清失败发生在“送进去”的一侧。
 */
export const INPUT_FAILURE_CODES = Object.freeze([
  'INVALID_ARGS',
  'UNKNOWN_TOOL',
  'ABORTED_BEFORE_DISPATCH',
])

/**
 * 一段的状态取值：'preparing' | 'running' | 'ok' | 'error' | 'stopped' | 'skipped'。
 *
 * @typedef {{ input: string, output: string }} SectionStates
 */

/** 客户端“被中止”标记（任意大小写归一后比较）。 */
const INTERRUPTED_CODE = 'interrupted'

/** 缺失/无法判断时的安全状态：两侧都当作仍在运行。 */
function runningStates() {
  return { input: 'running', output: 'running' }
}

/** 收窄为“非 null 对象”，其余一律 null（含函数、数组也视作对象）。 */
function asObject(value) {
  return value !== null && typeof value === 'object' ? value : null
}

/**
 * 取错误码并归一成去空白的非空字符串；取不到时返回 ''。
 *
 * 属性访问包了 try/catch：错误对象可能来自序列化/冻结/代理，读取 getter 可能
 * 抛错，渲染层不能因此崩溃。'' 表示“没有错误码”，交给后备归因规则。
 *
 * @param {object|null} call
 * @returns {string}
 */
function errorCodeOf(call) {
  let error
  try {
    error = call.error
  } catch {
    return ''
  }
  if (error === null || typeof error !== 'object') return ''
  let code
  try {
    code = error.code
  } catch {
    return ''
  }
  if (typeof code !== 'string') return ''
  const trimmed = code.trim()
  return trimmed === '' ? '' : trimmed
}

/** 已落定调用是否带客户端 `interrupted` 标记（大小写不敏感）。 */
function isInterrupted(call) {
  return errorCodeOf(call).toLowerCase() === INTERRUPTED_CODE
}

/**
 * 无错误码时的后备归因：原始参数非空但不是合法 JSON 对象 → 输入从未合法。
 *
 * 这是唯一能从结果侧推断“工具是否被参数拦住”的信号：工具主体若执行过，
 * 错误会带 code；没有 code 且参数根本解析不了，最合理的归因是 IN。
 */
function failedByArguments(call) {
  let raw
  try {
    raw = call.argsRaw
  } catch {
    return false
  }
  if (typeof raw !== 'string' || raw === '') return false
  return parseArgs(raw) === null
}

/**
 * 判断一次已落定失败该归因到哪一侧。
 *
 * 规则（按优先级）：
 *   1. 不是失败调用 → 'output'（调用方只在 isError===true 时才会用到）；
 *   2. 有错误码 → 在 INPUT_FAILURE_CODES 白名单里 → 'input'，否则 'output'；
 *   3. 无错误码 → 原始参数存在但解析不出 JSON 对象 → 'input'，否则 'output'。
 *
 * @param {object|null} call - deriveCall(block) 的结果。
 * @returns {'input'|'output'}
 */
export function failureSide(call) {
  try {
    const target = asObject(call)
    if (target === null || target.isError !== true) return 'output'
    const code = errorCodeOf(target)
    if (code !== '') {
      return INPUT_FAILURE_CODES.includes(code.toUpperCase()) ? 'input' : 'output'
    }
    return failedByArguments(target) ? 'input' : 'output'
  } catch {
    return 'output'
  }
}

/** 已落定失败调用的两侧状态（中断优先于失败归因）。 */
function failingStates(call) {
  if (isInterrupted(call)) return { input: 'ok', output: 'stopped' }
  if (failureSide(call) === 'input') return { input: 'error', output: 'skipped' }
  return { input: 'ok', output: 'error' }
}

/**
 * 通用工具调用的 IN/OUT 状态。
 *
 * @param {object|null} call - deriveCall(block) 的结果。
 * @returns {SectionStates}
 */
export function sectionStates(call) {
  try {
    const target = asObject(call)
    if (target === null) return runningStates()
    if (target.settled !== true) {
      return {
        input: target.phase === 'preparing' ? 'preparing' : 'running',
        output: 'running',
      }
    }
    if (target.isError !== true) return { input: 'ok', output: 'ok' }
    return failingStates(target)
  } catch {
    return runningStates()
  }
}

/**
 * 命令执行工具（bash / pwsh / win_bash）的 IN/OUT 状态。
 *
 * 在通用规则之上多一条：已落定且未报错、但结果文本里解析出非零退出码/被信号
 * 终止时，参数被接受而进程失败 → 归因为 OUT 失败（这与“错误码=OUT 失败”的
 * 语义一致；命令行工具把退出码放在结果文本里，而不是 error.code）。
 *
 * @param {object|null} call - deriveCall(block) 的结果。
 * @param {boolean} exitFailed - 调用方是否从结果文本解析出非零退出/被信号终止。
 * @returns {SectionStates}
 */
export function shellSectionStates(call, exitFailed) {
  try {
    const target = asObject(call)
    if (target === null) return runningStates()
    if (target.settled !== true) {
      return {
        input: target.phase === 'preparing' ? 'preparing' : 'running',
        output: 'running',
      }
    }
    if (target.isError !== true) {
      return exitFailed === true ? { input: 'ok', output: 'error' } : { input: 'ok', output: 'ok' }
    }
    return failingStates(target)
  } catch {
    return runningStates()
  }
}
