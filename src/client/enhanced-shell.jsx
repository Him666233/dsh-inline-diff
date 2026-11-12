/**
 * 增强风格的“平铺命令执行行”（bash / pwsh / win_bash 的 keyed 视图）。
 *
 * 背景：DSH 原生命令行是折叠（disclosure）样式；本变体采用现代编码代理对话
 * 记录的平铺呈现：一个状态点 + 工具名 + 一行摘要，下面是不折叠的 IN/OUT 卡片。
 * 组件只从宿主提供的工具 block 派生展示数据并重排样式——不执行工具、不写会话
 * 事件、不改变模型输入。
 *
 * 依赖：./model.js（deriveCall / parseArgs / contentText / firstLine 共享纯
 * 函数）、./tool-status.js（IN/OUT 分段状态）、./enhanced-tools.jsx（图标与
 * 轨迹按钮）、./use-settings.js（配色设置）。
 * 输入输出：EnhancedShellCard(props) 是 slot 组件；输出纯展示 DOM。
 *
 * 失败与回退（README「工具视图注册」与状态归因）：
 *   - 参数不是合法 JSON → IN 段回退显示原始参数文本（输入侧失败时红条仍可见，
 *     不会静默消失）；
 *   - 结果文本里没有退出标记 → 视为成功（不伪造退出码）；
 *   - 非零退出/未知退出码（null）/被信号终止 → 头部显示可读徽标，OUT 段标红；
 *   - 未落定时 OUT 显示占位（“执行中…”），让 OUT 自己的呼吸色条可见；
 *   - 未知/异常 block 由 deriveCall 归一成安全默认值，组件不会抛错。
 */
import { useMemo, useRef, useState } from 'react'
import { contentText, deriveCall, firstLine, parseArgs } from './model.js'
import { isLiveToolState, pulsePhase } from './motion.js'
import { fxRootProps, surfaceProps } from './surfaces.js'
import { usePulseSync } from './use-pulse-sync.js'
import { InspectButton, KindIcon } from './enhanced-tools.jsx'
import { shellSectionStates } from './tool-status.js'
import { useSettingsSnapshot } from './use-settings.js'

/** 从结果文本尾部解析退出码/信号标记（不依赖 Host 的 shell 包内部结构）。 */
function parseExit(text) {
  // 返回机器可读的退出信息（code / signal），界面文案由组件按插件语言用
  // t('shell.exit' | 'shell.exitNull' | 'shell.signal') 渲染；这里不再拼英文
  // 'exit N' 字符串，避免切换插件语言后徽标仍停留在英文。
  const signal = /\n\[killed by signal: ([^\]\n]+)\]$/.exec(text)
  if (signal !== null) return { output: text.slice(0, signal.index), signal: signal[1], failed: true }
  const exit = /\n\[exit code: (-?\d+|null)\]$/.exec(text)
  if (exit !== null) {
    const code = exit[1] === 'null' ? null : Number(exit[1])
    return { output: text.slice(0, exit.index), code, failed: code !== 0 }
  }
  return { output: text, failed: false }
}

function firstLineOf(text) {
  return firstLine(text).trim()
}

/**
 * 一次命令调用的平铺展示模型（纯函数，便于 useMemo 缓存）。
 *
 * 输入是工具 block 与 keyed 分发名；输出标题、摘要、IN/OUT 文本、退出信息、
 * 三段式状态（整体 / IN / OUT）以及是否等待输出。所有字段都做了类型收窄，
 * 畸形参数只会导致对应文本为空，不会抛错。
 */
function shellModel(block, toolName) {
  const call = deriveCall(block)
  const args = call.args ?? parseArgs(call.argsRaw) ?? null
  const command = args !== null && typeof args.command === 'string' ? args.command : ''
  const description = args !== null && typeof args.description === 'string' ? args.description : ''
  const background = args !== null && args.run_in_background === true
  const title = call.name === 'pwsh' || toolName === 'pwsh' ? 'PowerShell' : 'Bash'
  const summary = description.trim() !== '' ? firstLineOf(description) : firstLineOf(command)
  // IN 通常显示命令文本。参数本身畸形/被拒绝时没有 command 可显示，此时回退到
  // 原始参数文本：输入侧失败时 IN 段（及其红色输入条）必须保持可见，而不是
  // 静默消失。
  const input = command !== ''
    ? command
    : (typeof call.argsRaw === 'string' ? call.argsRaw.trim() : '')
  const text = call.settled ? contentText(call) : ''
  const exit = call.settled && text !== '' ? parseExit(text) : { output: text, failed: false }
  // 只在“确实要提示失败”时给出退出信息徽标：非零退出码、未知退出码
  // （null）或被信号终止；exit code 0 / 没有标记都不占位。
  const exitInfo = call.settled && !call.isError
    && (exit.signal !== undefined || (exit.code !== undefined && exit.code !== 0))
    ? { signal: exit.signal, code: exit.code }
    : undefined
  // 分段状态：IN 覆盖调用/准备阶段的问题，OUT 覆盖进程写回的内容
  // （包括非零退出码，见 tool-status.js 的 shellSectionStates）。
  const sections = shellSectionStates(call, exit.failed === true)
  const stopped = call.settled && call.error !== null && call.error !== undefined && call.error.code === 'interrupted'
  const state = !call.settled
    ? (call.phase === 'preparing' ? 'preparing' : 'running')
    : stopped ? 'stopped' : call.isError || exit.failed ? 'error' : 'ok'
  return {
    title,
    summary,
    command,
    input,
    description,
    // 卡片稳定标识：状态点与 IN/OUT 色条据此共享同一个呼吸相位（见 motion.js）。
    callId: call.callId,
    output: call.settled ? exit.output : '',
    exitInfo,
    state,
    inputState: sections.input,
    outputState: sections.output,
    // “输入已接受、输出等待中”：OUT 段显示占位文本，让 OUT 自己的品牌色呼吸条
    // 在进程运行时保持可见。
    waitingForOutput: call.settled !== true && call.phase !== 'preparing',
    background,
    expanded: command !== '' || exit.output !== '',
  }
}

/**
 * 渲染一行增强风格命令卡片。
 * props：block（工具 block）、toolName（keyed 分发名）、t（插件语言翻译函数）、
 * inspect（轨迹跳转回调）。仅展示，不修改宿主数据。
 */
export function EnhancedShellCard(props) {
  const { block, toolName, phase, t, inspect } = props
  const tone = useSettingsSnapshot()
  // 卡片根 ref：把卡内呼吸动画对齐到同一相位（圆点与 IN/OUT 状态条同时亮）。
  const pulseRef = usePulseSync()
  const model = useMemo(() => shellModel(block, toolName), [block, toolName])
  // 入场动画只在“运行中/准备中”挂载时播放；历史回放/已结算直接显示终态。
  const [enter] = useState(() => isLiveToolState(model.state))
  // 输出到达前 OUT 是“执行中…”占位；占位切到真实输出的那一帧给 OUT 段一次
  // 轻微的淡入，避免输出文本凭空出现。历史卡片挂载时 waiting=false，不触发。
  const waitingRef = useRef(model.waitingForOutput)
  const outputAppeared = useRef(false)
  if (model.output !== '' && waitingRef.current) outputAppeared.current = true
  waitingRef.current = model.waitingForOutput
  const hasIO = model.input !== '' || model.output !== '' || model.waitingForOutput
  const stateLabel = model.state === 'error'
    ? t('state.error')
    : model.state === 'stopped'
      ? t('state.stopped')
      : model.state === 'running'
        ? t('state.running')
        : model.state === 'preparing' ? t('state.preparing') : ''
  return (
    <div className="enhanced-tool enhanced-command" ref={pulseRef} {...fxRootProps(tone, ['commandHeader', 'commandIO'])} data-variant="command" data-state={model.state} data-tool={toolName} data-shell-tone={tone.shellShellTone} data-inner-tone={tone.shellInnerTone} data-body={hasIO ? 'true' : 'false'} data-enter={enter ? '' : undefined} style={{ '--did-pulse-phase': pulsePhase(model.callId) }}>
      <div className="enhanced-head" {...surfaceProps(tone, 'commandHeader')}>
        <span className="enhanced-kind"><KindIcon kind="command" /></span>
        <span className="enhanced-dot" aria-hidden="true" />
        <span className="enhanced-name">{model.title}</span>
        {model.summary !== '' ? <span className="enhanced-summary" title={model.command}>{model.summary}</span> : null}
        <span className="enhanced-actions">
          {model.exitInfo !== undefined ? (
            <span className="enhanced-exit">
              {/* 退出信息按插件语言渲染：信号优先于退出码，未知码单独提示。 */}
              {model.exitInfo.signal !== undefined
                ? t('shell.signal', { name: model.exitInfo.signal })
                : model.exitInfo.code === null
                  ? t('shell.exitNull')
                  : t('shell.exit', { code: model.exitInfo.code })}
            </span>
          ) : null}
          {stateLabel !== '' ? <span className="enhanced-state">{stateLabel}</span> : null}
          <InspectButton inspect={inspect} t={t} />
        </span>
      </div>
      {hasIO ? (
        <div className="enhanced-io" {...surfaceProps(tone, 'commandIO')}>
          {model.input !== '' ? (
            <div className="enhanced-section" data-section="in" data-state={model.inputState}>
              <span className="enhanced-label">{t('shell.in')}</span>
              <div className="enhanced-scroll enhanced-scroll-in">
                <pre className="enhanced-code" data-error={model.inputState === 'error' ? '' : undefined}>{model.input}</pre>
              </div>
            </div>
          ) : null}
          {model.input !== '' && model.output !== '' ? <div className="enhanced-divider" aria-hidden="true" /> : null}
          {model.output !== '' ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState} data-appear={outputAppeared.current ? '' : undefined}>
              <span className="enhanced-label">{t('shell.out')}</span>
              <div className="enhanced-scroll">
                <pre className="enhanced-code" data-error={model.outputState === 'error' ? '' : undefined}>{model.output}</pre>
              </div>
            </div>
          ) : model.waitingForOutput ? (
            <div className="enhanced-section" data-section="out" data-state={model.outputState}>
              <span className="enhanced-label">{t('shell.out')}</span>
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
