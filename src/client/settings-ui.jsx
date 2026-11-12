/**
 * 插件设置界面：设置页内的一整页、侧边栏底部启动按钮、以及复用同一面板的
 * body 级设置弹窗。
 *
 * 职责：渲染全部显示偏好控件（语言、文件卡片、语法高亮、语言徽章、命令执行行、
 * 其它工具调用、过程折叠、配色、逐表面外观效果），驱动 settings.js 的读写与
 * DSH transcriptView 联动，并在失败时显示可读错误。
 *
 * 依赖：react / react-dom（portal）、./languages.js（支持语言列表）、
 * ./project.js（版本/作者/仓库链接）、./settings.js（设置读写与 transcript
 * 操作）、./surfaces.js（外观效果的表面清单/默认值/React 展开属性）、
 * ./use-settings.js（设置订阅）。
 * 输入输出：SettingsSection / SettingsLauncher / SettingsModal 是 slot 组件；
 * 面板本身只读设置、写设置，不触碰会话数据与工具行为。
 *
 * 失败与回退：
 *   - 语言列表解析失败 → 显示空列表（设置页其余部分照常工作）；
 *   - configForms 服务不可用 → 相关操作 catch 后显示错误文本，不阻塞其它设置；
 *   - 重置默认值时若 toolCalls 改变 → 延迟刷新页面让接管路由同步（180ms）；
 *   - 所有控件都是“点击即保存”（设置自动生效，页脚有提示）。
 */
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { supportedLanguages } from './languages.js'
import { fetchUpdateInfo, performUpdate } from './api.js'
import { buildVersionRows, formatPublishedAt, installActionFor } from './updates.js'
import { AUTHOR, AUTHOR_URL, REPO_URL, VERSION } from './project.js'
import {
  currentTranscriptMode,
  getSettings,
  resetSettings,
  setTranscriptPreference,
  updateSettings,
} from './settings.js'
import {
  EFFECTS,
  FX_LIMITS,
  LIQUID_MODES,
  SURFACES,
  backdropProxyProps,
  effectOf,
  surfaceProps,
} from './surfaces.js'
import { useSettingsSnapshot } from './use-settings.js'

/**
 * 原创声明中引用的仓库地址。**这不是本项目**——而是声明里明确撇清关系的、
 * 同名的无关插件。放在这里（而不是 project.js）是为了让项目身份模块只描述本插件自己的 URL；替换/删除这条声明时只需改这里与两处字典文案。
 */
const ORIGINALITY_REPO_URL = 'https://github.com/JanEickholt/dsh-inline-diff'

/* ---- settings modal store ---- */
let modalOpen = false
const modalListeners = new Set()

/** 打开插件设置弹窗（已打开时幂等，不发多余通知）。 */
export function openSettingsModal() {
  if (modalOpen) return
  modalOpen = true
  for (const listener of modalListeners) listener()
}

/** 关闭插件设置弹窗（未打开时幂等）。 */
export function closeSettingsModal() {
  if (!modalOpen) return
  modalOpen = false
  for (const listener of modalListeners) listener()
}

function subscribeModal(listener) {
  modalListeners.add(listener)
  return () => modalListeners.delete(listener)
}

function useModalOpen() {
  return useSyncExternalStore(subscribeModal, () => modalOpen, () => modalOpen)
}

/**
 * 支持语言列表（模块级缓存）：语言识别器注册表在运行期不会变化，只需解析一次；
 * 解析失败时缓存空数组，设置页其余部分照常渲染（设置页不能因语言列表失败而白屏）。
 */
let languagesCache
function supportedLanguageList() {
  if (languagesCache === undefined) {
    try {
      const list = supportedLanguages()
      languagesCache = Array.isArray(list) ? list : []
    } catch {
      languagesCache = []
    }
  }
  return languagesCache
}

/** 2~3 选一的分段选择器（使用宿主主题 token 的胶囊按钮组）。 */
function Segmented({ ariaLabel, value, options, disabled, onChange }) {
  return (
    <div className="did-seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className="did-seg-option"
          data-active={value === option.value ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** 紧凑的原生 select，用于每类卡片的外壳/内部配色控件。 */
function ToneSelect({ label, value, options, onChange }) {
  return (
    <label className="did-tone">
      <span className="did-tone-label">{label}</span>
      <select className="did-select" value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function shellToneOptions(t) {
  return [
    { value: 'auto', label: t('settings.toneAutoShell') },
    { value: 'light', label: t('settings.toneLight') },
    { value: 'dark', label: t('settings.toneDark') },
  ]
}

function innerToneOptions(t) {
  return [
    { value: 'auto', label: t('settings.toneAutoInner') },
    { value: 'light', label: t('settings.toneLight') },
    { value: 'dark', label: t('settings.toneDark') },
    { value: 'same', label: t('settings.toneSameShell') },
  ]
}

/** 侧边栏底部启动按钮的滑杆图标。 */
function SlidersIcon({ size = 15 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2 4h6M11.5 4H14M2 8h2.5M8 8h6M2 12h7M12.5 12H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9.75" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6.25" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10.75" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/** 一行带标签/说明/额外控件的设置项（右侧放分段选择器）。 */
function SettingRow({ label, description, children, extra, className }) {
  return (
    <div className={className === undefined ? 'did-setting' : `did-setting ${className}`}>
      <div className="did-setting-text">
        <div className="did-setting-label">{label}</div>
        <div className="did-setting-desc">{description}</div>
        {extra === undefined ? null : extra}
      </div>
      <div className="did-setting-control">{children}</div>
    </div>
  )
}

/* ---- 外观效果：逐表面材质控件 --------------------------------------------
   设置面板末尾的「外观效果」折叠分组。表面清单、默认值与归一化规则全部来自
   ./surfaces.js（唯一事实来源），这里只负责把 9 个表面映射成可点击/可拖动的
   React 控件，并把每次交互整份写回 settings.effects。

   样式说明：这里刻意复用现有类（.did-setting / .did-seg / .did-tones /
   .did-settings-note 等）保证没有新 CSS 时也能正常使用；新增的类名
   did-fx-details / did-fx-content / did-fx-desc / did-fx-legend / did-fx-list /
   did-fx-row / did-fx-params / did-fx-slider / did-fx-slider-label /
   did-fx-slider-value / did-fx-range / did-fx-mode 只做渐进增强，由 styles.js 补充。 */

/** 效果 / 液态模式 → 字典键（顺序由 surfaces.js 的 EFFECTS / LIQUID_MODES 决定）。 */
const FX_EFFECT_LABEL_KEYS = {
  native: 'fx.effectNative',
  glass: 'fx.effectGlass',
  liquid: 'fx.effectLiquid',
}
const FX_EFFECT_DESC_KEYS = {
  native: 'fx.effectNativeDesc',
  glass: 'fx.effectGlassDesc',
  liquid: 'fx.effectLiquidDesc',
}
const FX_MODE_LABEL_KEYS = { clear: 'fx.liquidClear', frosted: 'fx.liquidFrosted' }

/**
 * 外观效果的单个数值滑杆（拖动即保存）。
 * 左右两侧放标签与当前值（百分比 / px），input 本身保持原生 range（键盘与
 * 无障碍行为免费）；取值统一转成 Number 再交给上层归一化。
 */
function FxRange({ label, display, value, min, max, step, onChange }) {
  return (
    <label className="did-fx-slider">
      <span className="did-fx-slider-label">{label}</span>
      <input
        className="did-fx-range"
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
      <span className="did-fx-slider-value">{display}</span>
    </label>
  )
}

/**
 * 「外观效果」折叠分组：9 个表面 × 三种效果。
 *
 * 折叠标题实时显示已启用（非原生）的表面数量，让面板默认只多一行，需要时再展开；
 * 折叠状态交给原生 `<details>`（与 SupportedLanguages 一致），React 重渲染只更新
 * 标题与控件，不会重置用户的展开/收起选择。
 */
function FxSettings({ t, settings, onChange }) {
  let enabledCount = 0
  for (const surface of SURFACES) {
    if (effectOf(settings, surface.id).effect !== 'native') enabledCount += 1
  }
  const summaryState = enabledCount === 0
    ? t('fx.summaryNone')
    : t('fx.summaryCount', { n: enabledCount })

  return (
    <details className="did-fx-details did-langs-details">
      <summary>{t('fx.sectionTitle')}{summaryState}</summary>
      <div className="did-fx-content">
        <div className="did-setting-desc did-fx-desc">{t('fx.sectionDesc')}</div>
        <div className="did-settings-note did-fx-legend">
          {EFFECTS.map(effect => (
            <div key={effect}>{t(FX_EFFECT_LABEL_KEYS[effect])} — {t(FX_EFFECT_DESC_KEYS[effect])}</div>
          ))}
        </div>

        <div className="did-fx-list">
          {SURFACES.map(surface => {
            const config = effectOf(settings, surface.id)
            const liquid = config.effect === 'liquid'
            // 只有非原生效果才显示透明度/模糊；液态玻璃额外显示液态模式。
            const params = config.effect === 'native' ? undefined : (
              <div className="did-fx-params">
                <FxRange
                  label={t('fx.opacity')}
                  display={`${Math.round(config.opacity * 100)}%`}
                  value={config.opacity}
                  min={FX_LIMITS.opacityMin}
                  max={FX_LIMITS.opacityMax}
                  step={FX_LIMITS.opacityStep}
                  onChange={value => onChange(surface.id, { opacity: value })}
                />
                <FxRange
                  label={t('fx.blur')}
                  display={`${config.blur}px`}
                  value={config.blur}
                  min={FX_LIMITS.blurMin}
                  max={FX_LIMITS.blurMax}
                  step={FX_LIMITS.blurStep}
                  onChange={value => onChange(surface.id, { blur: value })}
                />
                {liquid ? (
                  <div className="did-tones did-fx-mode">
                    <span className="did-tone-label">{t('fx.liquidMode')}</span>
                    <Segmented
                      ariaLabel={t('fx.liquidMode')}
                      value={config.mode}
                      onChange={value => onChange(surface.id, { mode: value })}
                      options={LIQUID_MODES.map(mode => ({ value: mode, label: t(FX_MODE_LABEL_KEYS[mode]) }))}
                    />
                  </div>
                ) : null}
              </div>
            )
            return (
              <SettingRow
                key={surface.id}
                className="did-fx-row"
                label={t(surface.labelKey)}
                description={t(surface.descKey)}
                extra={params}
              >
                <Segmented
                  ariaLabel={`${t(surface.labelKey)} · ${t('fx.effect')}`}
                  value={config.effect}
                  onChange={value => onChange(surface.id, { effect: value })}
                  options={EFFECTS.map(effect => ({ value: effect, label: t(FX_EFFECT_LABEL_KEYS[effect]) }))}
                />
              </SettingRow>
            )
          })}
        </div>

        <div className="did-settings-note">{t('fx.note')}</div>
      </div>
    </details>
  )
}

/** 关闭按钮：设置页头部与弹窗横幅共用。 */
function SettingsCloseButton({ onClose, t }) {
  return (
    <button type="button" className="did-settings-close" onClick={onClose} aria-label={t('close')} title={t('close')}>
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  )
}

/**
 * 可折叠的“支持的语言”列表。
 * 只有 `<details>` 展开时才挂载徽章 span，设置页保持轻量；徽章样式复用卡片头
 * 的 `.did-lang`（语法高亮样式表里），列表与卡片外观一致。
 */
function SupportedLanguages({ t, languages }) {
  const [open, setOpen] = useState(false)
  const detailsRef = useRef(null)

  useEffect(() => {
    const node = detailsRef.current
    if (node === null) return undefined
    const onToggle = () => setOpen(node.open)
    setOpen(node.open)
    node.addEventListener('toggle', onToggle)
    return () => node.removeEventListener('toggle', onToggle)
  }, [])

  return (
    <details className="did-langs-details" ref={detailsRef}>
      <summary>{t('settings.supportedLanguages')} ({languages.length})</summary>
      {open ? (
        <div className="did-langs">
          {languages.map(language => (
            <span className="did-lang" data-variant="full" key={language.id}>{language.label}</span>
          ))}
        </div>
      ) : null}
    </details>
  )
}

/**
 * 共享的设置面板主体（设置页与设置弹窗共用）。
 * 局部状态：busy（异步操作进行中禁用控件）、error（可读错误文本）、dsmMode
 * （当前 DSH 对话记录模式，用于说明文案）。
 */
function SettingsPanel({ t, onClose }) {
  const settings = useSettingsSnapshot()
  const languageList = supportedLanguageList()
  const [dsmMode, setDsmMode] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDsmMode(currentTranscriptMode())
  }, [settings.transcript])

  const chooseTranscript = async (mode) => {
    setBusy(true)
    setError('')
    try {
      await setTranscriptPreference(mode)
      setDsmMode(currentTranscriptMode())
    } catch (reason) {
      setError(String(reason?.message ?? reason))
    } finally {
      setBusy(false)
    }
  }

  const doReset = async () => {
    setBusy(true)
    setError('')
    const previousToolCalls = settings.toolCalls
    try {
      await resetSettings()
      setDsmMode(currentTranscriptMode())
      if (getSettings().toolCalls !== previousToolCalls) window.setTimeout(() => window.location.reload(), 180)
    } catch (reason) {
      setError(String(reason?.message ?? reason))
    } finally {
      setBusy(false)
    }
  }

  const transcriptNote = settings.transcript === 'enhanced'
    ? t('settings.transcriptEnhancedNote')
    : t('settings.transcriptNativeNote')

  /**
   * 写入单个表面的外观效果（点击分段 / 拖动滑杆都会立即调用）。
   *
   * 关键点：始终从 getSettings() 读“最新”快照再合并，而不是用本次渲染闭包里的
   * settings——滑杆拖动时 onChange 可能在同一帧内连续触发多次，用旧快照合并会把
   * 上一次刚写入的透明度/模糊值覆盖掉。写入时传整份 effects 对象（settings.js
   * 会用 surfaces.normalizeEffects 归一化，未知字段与非法值都会被安全丢弃）。
   */
  const patchSurfaceEffect = (surfaceId, patch) => {
    const current = getSettings()
    const effects = { ...(current.effects ?? {}) }
    effects[surfaceId] = { ...effectOf(current, surfaceId), ...patch }
    updateSettings({ effects })
  }

  return (
    <div className="did-settings">
      <div className="did-settings-head">
        <div className="did-settings-headtext">
          <div className="did-settings-title">{t('settings.title')}</div>
          <div className="did-settings-sub">{t('settings.description')}</div>
        </div>
        {onClose === undefined ? null : <SettingsCloseButton onClose={onClose} t={t} />}
      </div>

      <div className="did-settings-body">
        {/* Language row first: it drives every label on this panel, and the
            switch takes effect immediately because the wrapper component
            (withPluginI18n) subscribes to the plugin language. */}
        <SettingRow label={t('settings.language')} description={t('settings.languageDesc')}>
          <Segmented
            ariaLabel={t('settings.language')}
            value={settings.language}
            onChange={value => updateSettings({ language: value })}
            options={[
              { value: 'zh', label: t('settings.languageZh') },
              { value: 'en', label: t('settings.languageEn') },
              { value: 'auto', label: t('settings.languageAuto') },
            ]}
          />
        </SettingRow>

        {/* Prominent, non-intrusive originality statement. It deliberately sits
            directly under the language row so it is visible without scrolling on
            both the Settings page and the modal; the copy follows the selected
            plugin language. */}
        <div className="did-originality" role="note">
          <div className="did-originality-title">{t('originality.title')}</div>
          <div className="did-originality-body">
            {t('originality.body', { repo: ORIGINALITY_REPO_URL })}
          </div>
        </div>

        <SettingRow label={t('settings.fileCards')} description={t('settings.fileCardsDesc')}           extra={
            <div className="did-tones">
              <ToneSelect label={t('settings.shellTone')} value={settings.fileShellTone} onChange={value => updateSettings({ fileShellTone: value })} options={shellToneOptions(t)} />
              <ToneSelect label={t('settings.innerTone')} value={settings.fileInnerTone} onChange={value => updateSettings({ fileInnerTone: value })} options={innerToneOptions(t)} />
            </div>
          }
>
          <Segmented
            ariaLabel={t('settings.fileCards')}
            value={settings.fileCards}
            onChange={value => updateSettings({ fileCards: value })}
            options={[
              { value: 'enhanced', label: t('settings.styleEnhanced') },
              { value: 'native', label: t('settings.styleNative') },
            ]}
          />
        </SettingRow>

        <SettingRow
          label={t('settings.syntax')}
          description={t('settings.syntaxDesc')}
          extra={<div className="did-setting-desc">{t('settings.syntaxToggleNote')}</div>}
        >
          <Segmented
            ariaLabel={t('settings.syntax')}
            value={settings.syntaxHighlight === false ? 'off' : 'on'}
            onChange={value => updateSettings({ syntaxHighlight: value === 'on' })}
            options={[
              { value: 'on', label: t('settings.syntaxOn') },
              { value: 'off', label: t('settings.syntaxOff') },
            ]}
          />
        </SettingRow>

        <SettingRow label={t('settings.languageBadge')} description={t('settings.languageBadgeDesc')}>
          <Segmented
            ariaLabel={t('settings.languageBadge')}
            value={settings.languageBadge}
            onChange={value => updateSettings({ languageBadge: value })}
            options={[
              { value: 'short', label: t('settings.badgeShort') },
              { value: 'full', label: t('settings.badgeFull') },
              { value: 'hidden', label: t('settings.badgeHidden') },
            ]}
          />
        </SettingRow>

        <SettingRow label={t('settings.unknownLanguage')} description={t('settings.unknownLanguageDesc')}>
          <Segmented
            ariaLabel={t('settings.unknownLanguage')}
            value={settings.unknownLanguage}
            onChange={value => updateSettings({ unknownLanguage: value })}
            options={[
              { value: 'show', label: t('settings.unknownShow') },
              { value: 'hidden', label: t('settings.unknownHidden') },
            ]}
          />
        </SettingRow>

        <SettingRow label={t('settings.syntaxEmphasis')} description={t('settings.syntaxEmphasisDesc')}>
          <Segmented
            ariaLabel={t('settings.syntaxEmphasis')}
            value={settings.syntaxEmphasis}
            onChange={value => updateSettings({ syntaxEmphasis: value })}
            options={[
              { value: 'on', label: t('settings.emphasisOn') },
              { value: 'off', label: t('settings.emphasisOff') },
            ]}
          />
        </SettingRow>

        <div className="did-settings-note">
          <div>{t('settings.supportedLanguagesNote', { n: languageList.length })}</div>
          <SupportedLanguages t={t} languages={languageList} />
        </div>

        <SettingRow label={t('settings.shellRows')} description={t('settings.shellRowsDesc')}           extra={
            <div className="did-tones">
              <ToneSelect label={t('settings.shellTone')} value={settings.shellShellTone} onChange={value => updateSettings({ shellShellTone: value })} options={shellToneOptions(t)} />
              <ToneSelect label={t('settings.innerTone')} value={settings.shellInnerTone} onChange={value => updateSettings({ shellInnerTone: value })} options={innerToneOptions(t)} />
            </div>
          }
>
          <Segmented
            ariaLabel={t('settings.shellRows')}
            value={settings.shellRows}
            onChange={value => updateSettings({ shellRows: value })}
            options={[
              { value: 'enhanced', label: t('settings.styleEnhanced') },
              { value: 'native', label: t('settings.styleNative') },
            ]}
          />
        </SettingRow>

        <SettingRow label={t('settings.toolCalls')} description={t('settings.toolCallsDesc')}           extra={
            <div className="did-tones">
              <ToneSelect label={t('settings.shellTone')} value={settings.toolShellTone} onChange={value => updateSettings({ toolShellTone: value })} options={shellToneOptions(t)} />
              <ToneSelect label={t('settings.innerTone')} value={settings.toolInnerTone} onChange={value => updateSettings({ toolInnerTone: value })} options={innerToneOptions(t)} />
            </div>
          }
>
          <Segmented
            ariaLabel={t('settings.toolCalls')}
            value={settings.toolCalls}
            onChange={value => {
              if (value === settings.toolCalls) return
              updateSettings({ toolCalls: value })
              // 展开行若落在 DSH 原生折叠组里仍会被遮住，因此开启该风格时把
              // 已完成的轮次也展开（切到 verbose）。行与偏好都即时生效，不刷新页面。
              if (value === 'enhanced' && settings.transcript === 'native') {
                setTranscriptPreference('enhanced').catch(() => {})
              }
            }}
            options={[
              { value: 'enhanced', label: t('settings.styleEnhanced') },
              { value: 'native', label: t('settings.styleNative') },
            ]}
          />
        </SettingRow>

        <SettingRow label={t('settings.transcript')} description={transcriptNote}>
          <Segmented
            ariaLabel={t('settings.transcript')}
            value={settings.transcript}
            disabled={busy}
            onChange={chooseTranscript}
            options={[
              { value: 'enhanced', label: t('settings.flat') },
              { value: 'native', label: t('settings.styleNative') },
            ]}
          />
        </SettingRow>

        {settings.toolCalls === 'enhanced' && settings.transcript === 'native' ? (
          <div className="did-settings-note">{t('settings.toolCallsNeedsFlat')}</div>
        ) : null}
        <div className="did-settings-note">{t('settings.subagentNote')}</div>
        {dsmMode !== undefined && settings.transcript === 'enhanced' ? (
          <div className="did-settings-note">{t('settings.dsmCurrent', { mode: dsmMode })}</div>
        ) : null}

        {/* 逐表面外观效果：放在 .did-settings-body 末尾（页脚恢复默认按钮之前）。
            默认折叠，标题显示已启用的表面数量，面板因此只多一行。 */}
        <FxSettings t={t} settings={settings} onChange={patchSurfaceEffect} />

        <UpdateSection t={t} />

        {error !== '' ? <div className="did-settings-error">{error}</div> : null}
      </div>

      <div className="did-settings-foot">
        <button type="button" className="did-settings-reset" disabled={busy} onClick={doReset}>
          {t('settings.reset')}
        </button>
        <span className="did-settings-grow" />
        <a className="did-settings-author" href={AUTHOR_URL} target="_blank" rel="noreferrer" title={AUTHOR_URL}>{AUTHOR}</a>
        <a className="did-settings-author" href={REPO_URL} target="_blank" rel="noreferrer" title={REPO_URL}>GitHub</a>
        <span className="did-settings-hint">v{VERSION} · {busy ? t('settings.saving') : t('settings.live')}</span>
      </div>
    </div>
  )
}

/** 设置页条目（渲染在 DSH 设置 shell 内）。 */
export function SettingsSection({ t }) {
  // 设置页根同样是一个可配置的外观表面（data-fx / data-fx-surface + CSS 变量）；
  // surfaceProps 只返回 data-* 与 style（--did-fx-*），没有其它内联样式需要合并。
  const settings = useSettingsSnapshot()
  return (
    <div className="did-settings-page" {...surfaceProps(settings, 'settingsPanel')}>
      <SettingsPanel t={t} />
    </div>
  )
}

/** 侧边栏底部启动按钮：即使第三方主题隐藏了 DSH 设置入口也仍然可用。 */
export function SettingsLauncher({ wide, t }) {
  return (
    <button
      type="button"
      className="did-launcher"
      onClick={openSettingsModal}
      title={t('settings.title')}
      aria-label={t('settings.title')}
    >
      <SlidersIcon />
      {wide ? <span className="did-launcher-label">{t('settings.short')}</span> : null}
    </button>
  )
}

/**
 * 版本与更新面板：点「检查更新」才请求 registry（Host 代理，60s 缓存），
 * 列出全部版本并标记 latest/当前/不可安装；选择任一版本后按“更新 / 回退 /
 * 重新安装”执行。Web 端由 Host 调用官方插桩 CLI 一键安装；桌面端 v1 只展示
 * 版本和可复制命令（官方要求先退出桌面端再改 desktop profile）。
 */
function UpdateSection({ t }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  const currentVersion = info?.current ?? VERSION
  const rows = useMemo(() => (info === null ? [] : buildVersionRows(info, currentVersion)), [info, currentVersion])
  const selectedRow = rows.find(row => row.version === selected) ?? null
  const action = selectedRow === null ? null : installActionFor(currentVersion, selectedRow.version)
  const manualMode = info?.installer?.mode === 'manual'

  const resetFeedback = () => {
    setError('')
    setResult(null)
  }

  const load = async (refresh) => {
    if (loading === true || installing === true) return
    resetFeedback()
    setLoading(true)
    const data = await fetchUpdateInfo(refresh)
    setLoading(false)
    if (data === null) {
      setError(t('update.errorNetwork'))
      return
    }
    setInfo(data)
    const preferred = data.versions?.find(item => item.version === data.latest && item.installable !== false)
      ?? data.versions?.find(item => item.installable !== false)
    setSelected(preferred?.version ?? null)
  }

  const install = async () => {
    if (selectedRow === null || selectedRow.installable !== true || installing === true) return
    resetFeedback()
    setInstalling(true)
    const response = await performUpdate(selectedRow.version)
    setInstalling(false)
    if (response === null) {
      setError(t('update.errorNetwork'))
      return
    }
    setResult(response)
    if (response.ok === true) setInfo(prev => (prev === null ? prev : { ...prev, current: response.installedVersion ?? prev.current }))
  }

  const actionLabel = action === 'update'
    ? t('update.updateTo', { version: selectedRow?.version ?? '' })
    : action === 'rollback'
      ? t('update.rollbackTo', { version: selectedRow?.version ?? '' })
      : action === 'reinstall'
        ? t('update.reinstall', { version: selectedRow?.version ?? '' })
        : t('update.selectVersion')

  return (
    <div className="did-update">
      <div className="did-update-head">
        <div className="did-update-headtext">
          <div className="did-update-title">{t('update.title')}</div>
          <div className="did-update-sub">
            {t('update.current', { version: currentVersion })}
            {typeof info?.latest === 'string' ? ` · ${t('update.latest')} v${info.latest}` : ''}
            {typeof info?.dshVersion === 'string' ? ` · DSH ${info.dshVersion}` : ''}
          </div>
        </div>
        <button
          type="button"
          className="did-update-check"
          disabled={loading || installing}
          onClick={() => load(true)}
        >
          {loading ? t('update.checking') : t('update.check')}
        </button>
      </div>

      {error !== '' ? <div className="did-settings-error">{error}</div> : null}

      {info === null ? (
        <div className="did-update-idle">{t('update.idleHint')}</div>
      ) : (
        <Fragment>
          <div className="did-update-list" role="listbox" aria-label={t('update.versions')}>
            {rows.slice(0, 15).map(row => (
              <button
                key={row.version}
                type="button"
                role="option"
                aria-selected={selected === row.version}
                className="did-update-row"
                data-selected={selected === row.version ? '' : undefined}
                data-latest={row.latest ? '' : undefined}
                data-current={row.current ? '' : undefined}
                data-unavailable={row.installable ? undefined : ''}
                disabled={!row.installable}
                onClick={() => {
                  resetFeedback()
                  setSelected(row.version)
                }}
              >
                <span className="did-update-ver">v{row.version}</span>
                {row.latest ? <span className="did-update-badge">{t('update.latest')}</span> : null}
                {row.current ? <span className="did-update-badge">{t('update.installed')}</span> : null}
                {row.deprecated ? <span className="did-update-badge" data-warn="">{t('update.deprecated')}</span> : null}
                {row.installable ? null : <span className="did-update-badge" data-warn="">{t('update.unavailable')}</span>}
                <span className="did-update-date">{formatPublishedAt(row.publishedAt)}</span>
              </button>
            ))}
          </div>

          <div className="did-update-actions">
            <span className="did-update-hint">{manualMode ? t('update.manualHint') : t('update.restartHint')}</span>
            <button
              type="button"
              className="did-update-install"
              disabled={selectedRow === null || selectedRow.installable !== true || installing || manualMode}
              onClick={install}
            >
              {installing ? t('update.installing') : actionLabel}
            </button>
          </div>

          {manualMode && typeof info?.installer?.command === 'string' ? (
            <div className="did-update-manual">
              <div className="did-update-manual-hint">{t('update.manualCommandHint', { profile: info?.profile?.name ?? 'desktop' })}</div>
              <code className="did-update-command">{info.installer.command.replace('@<version>', `@${selectedRow?.version ?? '<version>'}`)}</code>
            </div>
          ) : null}

          {result !== null ? (
            result.ok ? (
              <div className="did-update-result" data-ok="">
                {t('update.installOk', { version: result.installedVersion ?? selectedRow?.version ?? '' })}
              </div>
            ) : (
              <div className="did-settings-error">
                {t('update.installFailed', { code: result.code ?? 'unknown' })}
                {typeof result.command === 'string' ? <div className="did-update-manual-hint">{result.command}</div> : null}
              </div>
            )
          ) : null}
          {typeof result?.logTail === 'string' && result.logTail !== '' ? (
            <details className="did-update-log">
              <summary>{t('update.log')}</summary>
              <pre>{result.logTail}</pre>
            </details>
          ) : null}
        </Fragment>
      )}
    </div>
  )
}

/** body 级设置弹窗：复用同一个设置面板，body 级 portal 保证模态层级正确。 */
export function SettingsModal({ t }) {
  const open = useModalOpen()
  const settings = useSettingsSnapshot()
  const [host, setHost] = useState(null)

  useEffect(() => {
    setHost(document.body)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      closeSettingsModal()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  if (!open) return null
  const overlay = (
    <Fragment>
      {/* 嵌套 backdrop-filter 会被 Chromium 忽略：设置弹窗表面的 blur/模式由遮罩层
          代理（backdropProxyProps），拖动「模糊」滑杆对设置窗口同样生效。 */}
      <div className="did-settings-overlay" data-enter="" {...backdropProxyProps(settings, 'settingsPanel')} onPointerDown={closeSettingsModal}>
        {/* 弹窗根是设置面板表面本身：挂 data-fx / data-fx-surface 与
            --did-fx-alpha / --did-fx-blur，CSS 据此绘制玻璃/液态玻璃材质。
            surfaceProps 只带 style（两个 CSS 变量），本元素没有其它内联样式。 */}
        <div
          className="did-settings-dialog"
          data-enter=""
          role="dialog"
          aria-modal="true"
          aria-label={t('settings.title')}
          {...surfaceProps(settings, 'settingsPanel')}
          onPointerDown={event => event.stopPropagation()}
        >
          {/* Fixed banner: title, description and the close button never scroll;
              the body below owns the scrollbar, which therefore starts under
              the banner instead of running past it. */}
          <div className="did-settings-banner">
            <div className="did-settings-headtext">
              <div className="did-settings-title">{t('settings.title')}</div>
              <div className="did-settings-sub">{t('settings.description')}</div>
            </div>
            <SettingsCloseButton onClose={closeSettingsModal} t={t} />
          </div>
          <div className="did-settings-scroll">
            <SettingsPanel t={t} onClose={closeSettingsModal} />
          </div>
        </div>
      </div>
    </Fragment>
  )
  return host === null ? overlay : createPortal(overlay, host)
}
