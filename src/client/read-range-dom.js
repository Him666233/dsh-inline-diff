/**
 * 页面级 Read 行号角标（直接操作 DOM 的补充层）。
 *
 * 背景：Read 工具保持 DSH 原生卡片，而原生卡片可能由多条渲染路径产生（本插件
 * 的工具节点包装、官方分组/展开树、历史回放）。从某一层 React 包装内部插入
 * 角标会漏掉其它路径渲染出来的行，因此这里改为观察整个文档：找到每个
 * `[data-tool="read"]` 行，沿 React fiber 向上取到工具 block，算出范围后在
 * 文件链接旁挂一个角标 `<span class="did-read-range">`。
 *
 * 依赖：./read-range.js（范围推导与文案）、宿主的 DOM 结构
 * （`[data-disclosure-row]` 头、文件链接 button、`aria-expanded`）。
 * 输入输出：startReadRangeChips(t) 接收“按当前插件语言翻译”的函数，返回清理
 * 函数；模块自身不导出 DOM 节点。
 *
 * 失败与回退：
 *   - 没有 document / 没有 MutationObserver（Node 单测）→ 返回 no-op 清理函数；
 *   - 启动早期 document.body 尚不存在 → 返回 no-op（避免 observe(null) 抛错）；
 *   - observe 时 body 被卸载/替换 → 断开并返回 no-op（角标不再新增，已有卡片
 *     不受影响）；
 *   - fiber 上找不到 block / 找不到原生头 / 找不到文件链接 → 该行跳过，不挂
 *     角标也不报错（原生卡片保持原样）；
 *   - 范围无法推导（null）→ 移除该行已有角标；
 *   - 角标是纯展示节点：不替换卡片、不改 disclosure、不拦截原生事件；
 *   - 外观效果（原生 / 磨砂玻璃 / 液态玻璃）与其它表面一样逐表面可配：角标被
 *     创建/复用时写入 data-fx / data-fx-surface / --did-fx-alpha / --did-fx-blur，
 *     设置变化时由 subscribeSettings 统一刷新现有角标（见 applyChipAppearance）。
 */
import { readRangeLabels, readRangesForBlock } from './read-range.js'
import { getSettings, subscribeSettings } from './settings.js'
import { EFFECT_LIQUID, surfaceDomValues } from './surfaces.js'

/** 角标节点标记属性：用于查找/去重/清理。 */
const CHIP_ATTR = 'data-dsh-inline-diff-read-range'
/** 行元素 → { block, label }：同一 block 的角标只推导一次。 */
const rowCache = new WeakMap()

/**
 * 把当前「读取行范围徽标」的外观效果写到角标 DOM 上（幂等）。
 *
 * 角标是直接操作 DOM 创建的，不经过 React 渲染，因此这里手动维护与其它表面
 * 相同的属性契约（data-fx / data-fx-surface / data-liquid-mode / CSS 变量），
 * 由 styles.js 的外观效果区段统一渲染。设置非法/缺失时回退 native（无视觉变化）。
 *
 * @param {Element} chip - 角标节点。
 */
function applyChipAppearance(chip) {
  const config = surfaceDomValues(getSettings(), 'readRangeChip')
  chip.setAttribute('data-fx', config.effect)
  chip.setAttribute('data-fx-surface', 'readRangeChip')
  if (config.effect === EFFECT_LIQUID) chip.setAttribute('data-liquid-mode', config.mode)
  else chip.removeAttribute('data-liquid-mode')
  chip.style.setProperty('--did-fx-alpha', String(config.opacity))
  chip.style.setProperty('--did-fx-blur', `${config.blur}px`)
}

/**
 * 从一个 DOM 节点沿 React fiber 向上找工具调用 block。
 *
 * React 把内部 fiber 挂在 DOM 元素的 `__reactFiber$…` 属性上（开发/生产构建
 * 前缀不同），因此按前缀查找。最多向上 60 层，防止异常树结构导致死循环；找到
 * 带 block 的 props 即返回，找不到返回 null。
 *
 * @param {Element} element
 * @returns {object|null}
 */
function blockFromFiber(element) {
  const key = Object.keys(element).find(name => name.startsWith('__reactFiber$') || name.startsWith('__reactInternalInstance$'))
  if (key === undefined) return null
  let fiber = element[key]
  let guard = 0
  while (fiber !== null && fiber !== undefined && guard < 60) {
    const props = fiber.memoizedProps
    if (props !== null && typeof props === 'object') {
      const block = props.block
      if (block !== null && typeof block === 'object' && ('kind' in block || 'phase' in block || 'call' in block)) return block
    }
    fiber = fiber.return
    guard++
  }
  return null
}

/**
 * 让单个 Read 行的角标与当前状态同步（幂等）。
 *
 * 步骤：取 block → 用 rowCache 复用上次的 label（仅当 block 引用未变）→ 找到
 * 原生 disclosure 头（没有就说明不是展开态原生行，跳过）→ 有 label 时确保角标
 * 存在并把文本/title 更新成当前语言，无 label 时移除角标 → 行展开时隐藏角标
 * （展开后卡片自己显示内容，角标重复）。
 *
 * @param {Element} row - `[data-tool="read"]` 行元素。
 * @param {Function} t - 当前插件语言的翻译函数。
 */
function syncReadRow(row, t) {
  const block = blockFromFiber(row)
  if (block === null) return
  const cached = rowCache.get(row)
  let label
  if (cached !== undefined && cached.block === block) {
    label = cached.label
  } else {
    const ranges = readRangesForBlock(block)
    label = ranges === null ? null : readRangeLabels(ranges, t)
    rowCache.set(row, { block, label })
  }
  const explicitHeader = row.querySelector('[data-disclosure-row]')
  if (explicitHeader === null) return
  let chip = explicitHeader.querySelector(`[${CHIP_ATTR}]`)
  if (label === null) {
    if (chip !== null) chip.remove()
    return
  }
  const fileLink = explicitHeader.querySelector('button')
  if (fileLink === null) return
  if (chip === null || chip.isConnected !== true) {
    chip = document.createElement('span')
    chip.className = 'did-read-range'
    chip.setAttribute(CHIP_ATTR, 'true')
    fileLink.insertAdjacentElement('afterend', chip)
  }
  if (chip.textContent !== label) chip.textContent = label
  if (chip.title !== label) chip.title = label
  // 外观效果：每次同步都写一次（属性赋值幂等且很便宜），保证设置切换后新出现
  // 的角标也立即使用当前效果。
  applyChipAppearance(chip)
  // 展开态不显示角标：内容已经可见，角标只会重复占位。
  const expanded = explicitHeader.getAttribute('aria-expanded') === 'true'
  if (chip.hidden !== expanded) chip.hidden = expanded
}

/**
 * 判断一个被增删的 DOM 节点是否可能与 Read 行有关。
 * 只做轻量匹配（自身是 read 行或包含 read 行），避免每次 DOM 变动都全文档查询。
 *
 * @param {Node} node
 * @returns {boolean}
 */
function isReadRelevant(node) {
  if (node === null || node === undefined || node.nodeType !== 1) return false
  if (typeof node.matches === 'function' && node.matches('[data-tool="read"]')) return true
  return typeof node.querySelector === 'function' && node.querySelector('[data-tool="read"]') !== null
}

/**
 * 启动页面级 Read 角标观察器。
 *
 * 调度策略：
 *   - 首帧扫描一次（第三方启动/开屏插件动画期间的扫描被推迟一帧，避免在用户
 *     还看不到对话时抢占主线程）；
 *   - MutationObserver 只关心两类变化：read 行内的属性变化（aria-expanded 切换）
 *     与包含 read 行的子树增删；其余 DOM 变动（流式输出、其它插件动画）不触发
 *     全文档 querySelectorAll；
 *   - 多次变更合并成一帧（rAF，缺失时 setTimeout 16ms）执行一次扫描。
 *
 * @param {Function} t - 当前插件语言的翻译函数（每次渲染时动态调用）。
 * @returns {() => void} 清理函数：断开观察器、取消待执行帧、移除所有角标。
 */
export function startReadRangeChips(t) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return () => {}
  // 启动早期（插件 apply 时）document.body 可能还不存在：此时观察器没有观察
  // 目标。安全回退为 no-op，避免 observe(null) 抛错中断其余插件初始化。
  const body = document.body
  if (body === null || body === undefined) return () => {}
  let scheduled = false
  let frame = null
  const scan = () => {
    scheduled = false
    frame = null
    for (const row of document.querySelectorAll('[data-tool="read"]')) syncReadRow(row, t)
  }
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    frame = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(scan)
      : setTimeout(scan, 16)
  }
  // 第三方开屏/启动插件（如 550C）挂载后会有数秒的全屏动画；这期间启动全页
  // 观察器与首扫只会在用户看不到的遮罩后面增加主线程工作。推迟一帧开始，
  // 不会延迟已经可见的对话。
  schedule()
  // 只有 Read 行的增删/展开才会改变角标。在长会话流式输出、其它插件动画时，
  // 这里的过滤能避免每一次无关 DOM 变动都唤醒一次全文档查询。
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const row = typeof record.target.closest === 'function' ? record.target.closest('[data-tool="read"]') : null
        if (row !== null) {
          schedule()
          return
        }
        continue
      }
      for (const node of record.addedNodes) {
        if (isReadRelevant(node)) {
          schedule()
          return
        }
      }
      for (const node of record.removedNodes) {
        if (isReadRelevant(node)) {
          schedule()
          return
        }
      }
    }
  })
  try {
    observer.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-expanded'] })
  } catch {
    // body 在观察前被卸载/替换（宿主重建 DOM）：退化为不观察，chip 不再新增。
    observer.disconnect()
    return () => {}
  }
  // 外观效果设置变化时刷新所有已有角标（设置面板逐表面即时生效，不需要刷新页面）。
  let unsubscribeSettings = () => {}
  try {
    unsubscribeSettings = subscribeSettings(() => {
      for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) applyChipAppearance(chip)
    })
  } catch {
    unsubscribeSettings = () => {}
  }
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    unsubscribeSettings()
    observer.disconnect()
    if (frame !== null) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      else clearTimeout(frame)
    }
    for (const chip of document.querySelectorAll(`[${CHIP_ATTR}]`)) chip.remove()
  }
}
