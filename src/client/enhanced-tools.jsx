/**
 * 可选“展开风格”的通用工具调用行（搜索 / 网页 / 详情 / 通用工具的 keyed 视图）。
 *
 * 背景：index.jsx 在用户开启“展开风格”后，为本模块导出的 key 清单注册
 * `tool.call.toolview` 视图：每次调用渲染一张平铺 IN/OUT 卡片，不用先展开就能
 * 看到“送进去什么、回来什么”。命令执行有专门的 enhanced-shell.jsx 行；没有注册
 * key 的工具保持 DSH 原生展示（README「工具视图注册」的回退终态）。
 *
 * 依赖：./model.js（deriveCall / contentText / firstLine / stateKeyOf 共享纯
 * 函数）、./tool-status.js（IN/OUT 失败归因）、./use-settings.js（配色设置）。
 * 输入输出：导出的 key 数组供 index.jsx 注册；EnhancedExpandedTool 是 slot
 * 组件；InspectButton / KindIcon 被其它行复用。
 *
 * 失败与回退：
 *   - 参数 JSON 解析失败 → IN 段显示原始 argsRaw（可读、不吞错）；
 *   - 结果里没有文本块 → OUT 显示错误原因（不静默空白）；
 *   - 未落定 → OUT 占位“执行中…”；输入侧失败 → IN 红条、OUT 灰条（skipped）；
 *   - 元数据残缺（meta 非对象/数字非有限）→ 徽标为空，摘要按可用参数降级；
 *   - 未知工具名 → 标题回退为原始 wire name（或字典里的“工具”）。
 */
import { useMemo, useRef, useState } from 'react'
import { contentText, deriveCall, firstLine, stateKeyOf } from './model.js'
import { isLiveToolState, pulsePhase } from './motion.js'
import { fxRootProps, surfaceProps } from './surfaces.js'
import { usePulseSync } from './use-pulse-sync.js'
import { sectionStates } from './tool-status.js'
import { useSettingsSnapshot } from './use-settings.js'

/**
 * 把 wire 工具名转成可读标题：优先查字典 toolTitle.<name>，没有则把
 * `snake_case`/`kebab-case` 拆词并首字母大写；完全缺失时用“工具”兜底。
 */
function toolLabel(name, t) {
  // 没有任何可读名字时也走插件语言字典，不能硬编码英文 'Tool'。
  if (typeof name !== 'string' || name === '') return typeof t === 'function' ? t('tool.unknownName') : 'Tool'
  if (typeof t === 'function') {
    const key = `toolTitle.${name}`
    const translated = t(key)
    if (typeof translated === 'string' && translated !== key) return translated
  }
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\b[a-z]/g, letter => letter.toUpperCase())
}

/**
 * 显示名：优先字典里的本地化标题，否则保留**原始 wire 名**（不加空格、不改写），
 * 便于用户/排查者看到真实工具名；空名用“工具”兜底。
 */
function wireName(name, t) {
  if (typeof name !== 'string' || name === '') return typeof t === 'function' ? t('tool.unknownName') : 'Tool'
  if (typeof t === 'function') {
    const key = `toolTitle.${name}`
    const translated = t(key)
    if (typeof translated === 'string' && translated !== key) return translated
  }
  return name
}

/** 摘要取首行并截断到 120 字符（保持单行且不撑破头部布局）。 */
function clampSummary(text) {
  const first = typeof text === 'string' ? firstLine(text).trim() : ''
  return first.length > 120 ? first.slice(0, 120) + '…' : first
}

/**
 * 搜索/网页工具的专用摘要：grep 显示 pattern · path · include，
 * web_search 显示查询词（多个用分隔符连接），web_fetch 显示 URL。
 */
function searchSummary(call) {
  const args = call.args
  if (args === null || typeof args !== 'object') return ''
  if (call.name === 'grep' || call.name === 'glob') {
    const pattern = typeof args.pattern === 'string' ? args.pattern : ''
    const path = typeof args.path === 'string' ? args.path : ''
    const include = call.name === 'grep' && typeof args.include === 'string' ? args.include : ''
    return clampSummary([pattern, path, include].filter(part => part.trim() !== '').join('  ·  '))
  }
  if (call.name === 'web_search') {
    const queries = Array.isArray(args.queries)
      ? args.queries.filter(query => typeof query === 'string' && query.trim() !== '')
      : []
    return clampSummary(queries.join('  ·  '))
  }
  if (call.name === 'web_fetch') {
    return clampSummary(typeof args.url === 'string' ? args.url : '')
  }
  return ''
}

/**
 * 从参数里挑“最有描述性”的字段生成一行摘要。
 *
 * 优先工具专用摘要（搜索/网页），否则按固定优先级扫描常见字段
 * （description、command、file_path…）；数组值（如 queries）用分隔符连接。
 * 数组/空字符串跳过，避免显示 `[object Object]` 或空摘要。
 */
function summaryOf(args, call) {
  if (args === null || typeof args !== 'object') return ''
  const specific = call === undefined ? '' : searchSummary(call)
  if (specific !== '') return specific
  const keys = ['description', 'command', 'file_path', 'path', 'url', 'query', 'queries', 'prompt', 'objective', 'skill', 'title', 'name', 'tool']
  for (const key of keys) {
    const value = args[key]
    if (Array.isArray(value)) {
      const joined = value.filter(item => typeof item === 'string' && item.trim() !== '').join('  ·  ')
      if (joined !== '') return clampSummary(joined)
      continue
    }
    if (typeof value !== 'string' || value.trim() === '') continue
    return clampSummary(value)
  }
  return ''
}

/**
 * 已落定调用的紧凑计数徽标（来自持久化的工具元数据）：
 * grep 匹配数（截断时加 '+'）、glob 文件数、web_search 来源数、web_fetch 状态码。
 * 元数据缺失/类型不对时返回空串（不显示徽标）。
 */
function badgeOf(call, t) {
  if (!call.settled) return ''
  const meta = call.meta
  if (meta === null || typeof meta !== 'object') return ''
  if (call.name === 'grep' && typeof meta.total === 'number' && Number.isFinite(meta.total)) {
    return t('search.matches', { n: meta.total }) + (meta.truncated === true ? '+' : '')
  }
  if (call.name === 'glob' && Array.isArray(meta.paths)) {
    return t('search.files', { n: meta.paths.length })
  }
  if (call.name === 'web_search' && Array.isArray(meta.sources)) {
    return t('web.sources', { n: meta.sources.length })
  }
  if (call.name === 'web_fetch' && typeof meta.statusCode === 'number' && Number.isFinite(meta.statusCode)) {
    return t('web.status', { code: meta.statusCode })
  }
  return ''
}

/** IN 段的展示文本：参数对象美化 JSON；不可序列化时回退原始参数文本。 */
function inputText(call) {
  if (call.args !== null && call.args !== undefined) {
    try {
      return JSON.stringify(call.args, null, 2)
    } catch {
      return call.argsRaw ?? ''
    }
  }
  return call.argsRaw ?? ''
}

/** 工具分类（决定小图标与行强调色）：command / search / web / tool。 */
function kindOf(toolName) {
  if (SHELL_KEY_SET.has(toolName)) return 'command'
  if (toolName === 'grep' || toolName === 'glob') return 'search'
  if (toolName === 'web_search' || toolName === 'web_fetch') return 'web'
  return 'tool'
}

/**
 * 一次通用工具调用的展示模型（纯函数，由 useMemo 缓存）。
 * 产出标题、显示名、摘要、徽标、分类、IN/OUT 文本、整体与分段状态、是否等待输出。
 */
function genericModel(block, toolName, t) {
  const call = deriveCall(block)
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError ? 'error' : 'ok'
  // IN/OUT 各自带状态：被拒绝的调用即使 OUT 从未执行，也归因为输入侧失败。
  const sections = sectionStates(call)
  const resolvedName = call.name !== '' ? call.name : toolName
  // 图片结果的占位标记也是 UI 文案，统一按插件语言渲染（t 缺失时退回英文原文）。
  const imageMarker = typeof t === 'function' ? t('tool.image') : '[image]'
  return {
    title: toolLabel(resolvedName, t),
    displayName: wireName(resolvedName, t),
    // 卡片稳定标识：状态点与 IN/OUT 色条据此共享同一个呼吸相位（见 motion.js）。
    callId: call.callId,
    summary: summaryOf(call.args, call),
    badge: badgeOf(call, t),
    kind: kindOf(resolvedName),
    input: inputText(call),
    output: call.settled ? contentText(call, imageMarker) : '',
    state,
    inputState: sections.input,
    outputState: sections.output,
    // “输入已接受、输出等待中”：显示 OUT 占位，让工具运行时 OUT 自己的品牌色
    // 呼吸条保持可见。
    waitingForOutput: call.settled !== true && call.phase !== 'preparing',
  }
}

/**
 * 展开风格的通用 IN/OUT 卡片（keyed slot 回退视图）。
 * 与原生折叠行不同，它默认展开；折叠箭头仍可用，长对话可以手动收起。
 */
export function EnhancedExpandedTool({ block, toolName, t, inspect }) {
  const tone = useSettingsSnapshot()
  const model = useMemo(() => genericModel(block, toolName, t), [block, toolName, t])
  const [open, setOpen] = useState(true)
  // 入场动画只给“运行中/准备中”挂载的卡片；历史回放/极快调用直接显示终态。
  const [enter] = useState(() => isLiveToolState(model.state))
  // 输出占位（“执行中…”）切换到真实输出时，让 OUT 段轻微淡入一次。
  const waitingRef = useRef(model.waitingForOutput)
  const outputAppeared = useRef(false)
  if (model.output !== '' && waitingRef.current) outputAppeared.current = true
  waitingRef.current = model.waitingForOutput
  // 卡片根 ref：把卡内呼吸动画对齐到同一相位（圆点与 IN/OUT 状态条同时亮）。
  const pulseRef = usePulseSync()
  const stateLabel = stateKeyOf(model.state)
  const hasBody = model.input !== '' || model.output !== ''
  return (
    <div className="enhanced-tool enhanced-generic" ref={pulseRef} {...fxRootProps(tone, ['toolHeader', 'toolIO'])} data-variant="tool" data-kind={model.kind} data-state={model.state} data-tool={toolName} data-shell-tone={tone.toolShellTone} data-inner-tone={tone.toolInnerTone} data-body={hasBody && open ? 'true' : 'false'} data-enter={enter ? '' : undefined} style={{ '--did-pulse-phase': pulsePhase(model.callId) }}>
      <div className="enhanced-head" {...surfaceProps(tone, 'toolHeader')}>
        <span className="enhanced-kind"><KindIcon kind={model.kind} /></span>
        {hasBody ? (
          <button
            type="button"
            className="enhanced-toggle"
            aria-expanded={open}
            aria-label={open ? t('collapse') : t('expand')}
            onClick={() => setOpen(value => !value)}
          >
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
              <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="enhanced-toggle-placeholder" aria-hidden="true" />
        )}
        <span className="enhanced-dot" aria-hidden="true" />
        <span className="enhanced-tag">{t('tool.fallbackTitle')}</span>
        <span className="enhanced-name">{model.displayName}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.summary}>{model.summary}</span> : null}
        {model.badge !== '' ? <span className="enhanced-badge">{model.badge}</span> : null}
        <span className="enhanced-actions">
          {stateLabel !== null ? <span className="enhanced-state">{t(stateLabel)}</span> : null}
          <InspectButton inspect={inspect} t={t} />
        </span>
      </div>
      {open && hasBody ? (
        <div className="enhanced-io" {...surfaceProps(tone, 'toolIO')}>
          {model.input !== '' ? (
            <div className="enhanced-section" data-section="in" data-state={model.inputState}>
              <span className="enhanced-label">{t('tool.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code" data-error={model.inputState === 'error' ? '' : undefined}>{model.input}</pre>
              </div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState} data-appear={outputAppeared.current ? '' : undefined}>
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.outputState === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : model.waitingForOutput ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('tool.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-placeholder="true">{t('state.running')}…</pre>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * 原生展示为通用 `DetailsRow` 的工具清单（目标/定时任务、运行时检查、
 * 会话/任务/终端查询、子代理控制、团队任务等）。它们自带 keyed 视图，节点回退
 * 永远看不到；当用户开启“其它工具调用”展开风格时，index.jsx 为这些 key 注册
 * 同一张展开卡。富结果视图（Read、todo、提问、图片）**有意保持原生**，不在此列
 * （README「工具视图注册」的边界）。
 */
export const ENHANCED_DETAILS_KEYS = [
  'create_goal', 'get_goal', 'update_goal',
  'schedule_create', 'schedule_list', 'schedule_view', 'schedule_edit',
  'schedule_delete', 'schedule_update',
  'cordis_inspect_list', 'cordis_inspect_query', 'cordis_inspect_self',
  'workflow', 'ralph',
  'session_event_read', 'session_event_search', 'session_event_trace',
  'session_search', 'session_trace',
  'list_subagent_models', 'subagent', 'list_agents', 'send_message',
  'interrupt_agent', 'spawn_teammate', 'wait_agent',
  'job_list', 'job_output', 'job_kill',
  'terminal_open', 'terminal_read', 'terminal_list', 'terminal_signal', 'terminal_close',
  'lsp',
  'team_task_create', 'team_task_get', 'team_task_update', 'team_task_list',
]

/**
 * 文件内容搜索与网页工具原生是富卡片。展开风格同样接管它们，避免同一段对话里
 * 平铺 IN/OUT 行与原生折叠卡片混用；把选项切回 DSH 原生即可恢复原样
 * （README「工具视图注册」的回退链：dispose 后官方卡片回归）。
 */
export const ENHANCED_SEARCH_WEB_KEYS = ['grep', 'glob', 'web_search', 'web_fetch']

/**
 * 命令执行类工具名（唯一来源）。
 *
 * index.jsx 的「命令执行行」接管与本模块的 kindOf 分类都按这份名单判断；
 * 1.3.0 前两处各定义了一份，这里集中导出，避免以后新增 shell 工具时漏改。
 * 保持数组形态（index.jsx 直接遍历注册），内部查询用 Set 保持 O(1)。
 */
export const SHELL_KEYS = Object.freeze(['bash', 'pwsh', 'win_bash'])

/** SHELL_KEYS 的集合形态，供 kindOf 做 O(1) 分类。 */
const SHELL_KEY_SET = new Set(SHELL_KEYS)

/**
 * 没有官方 keyed 视图的通用工具清单。原生对话/轨迹树按工具名分发
 * `tool.call.toolview`，没有 key 时回退到官方通用行；因此为这些 key 注册视图，
 * 才是“即使工具调用节点渲染器不是我们的，展开风格也能生效”的关键。
 */
export const ENHANCED_GENERIC_KEYS = [
  'browser_navigate', 'browser_click', 'browser_type', 'browser_press',
  'browser_scroll', 'browser_snapshot', 'browser_screenshot', 'browser_console',
  'browser_network', 'browser_tabs', 'browser_close',
  'working_directory', 'load_workspace_dependencies', 'plugin_manager', 'skill',
  'exit_plan_mode', 'subagent_fork',
  'squads_list', 'squads_read', 'squads_create', 'squads_update', 'squads_delete',
  'squad_member_add', 'squad_member_update', 'squad_member_remove',
  'squads_run_member', 'squads_run_squad',
  'task_board_list', 'task_board_get', 'task_board_create', 'task_board_update',
  'task_board_manage', 'task_board_run', 'task_board_schedule', 'task_board_set_parent',
  'task_board_github_list', 'task_board_github_get', 'task_board_github_refresh',
  'task_board_github_repositories', 'task_board_github_setup',
  'task_board_github_comment', 'task_board_github_create_pr',
  'task_board_github_link_pr', 'task_board_github_close_issue',
]

/** 小分类图标：让命令、搜索、网页与通用工具行在视觉上可区分。 */
export function KindIcon({ kind }) {
  if (kind === 'command') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="m3.5 5 3.2 3-3.2 3M8.5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'search') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.2 10.2 3.1 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'web') {
    return (
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.4 8h11.2M8 2.2c1.7 1.7 2.5 3.6 2.5 5.8S9.7 12.1 8 13.8C6.3 12.1 5.5 10.2 5.5 8S6.3 3.9 8 2.2Z" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M8 1.8l1.5 4.2L13.7 7.5l-4.2 1.5L8 13.2 6.5 9 2.3 7.5 6.5 6 8 1.8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * “在轨迹中查看”入口，被所有展开风格行与差异卡片复用。
 * 用带文字的胶囊按钮（而不是裸图标）保证一眼可发现；完整文案
 * “在轨迹中查看”放在 title/aria-label 里，窄布局下只显示“轨迹”。
 */
export function InspectButton({ inspect, t }) {
  if (typeof inspect !== 'function') return null
  return (
    <button
      type="button"
      className="enhanced-inspect"
      title={t('inspectTrajectory')}
      aria-label={t('inspectTrajectory')}
      onClick={event => { event.stopPropagation(); inspect() }}
      onKeyDown={event => event.stopPropagation()}
    >
      <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
        <path d="M9.2 2.2h4.6v4.6M13.8 2.2 8.1 7.9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.6 9.3v3.6a.9.9 0 0 1-.9.9H3.1a.9.9 0 0 1-.9-.9V5.3a.9.9 0 0 1 .9-.9h3.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
      <span className="enhanced-inspect-label">{t('inspectShort')}</span>
    </button>
  )
}

