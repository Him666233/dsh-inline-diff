/**
 * Plugin settings surface: a Settings page entry, a sidebar-foot launcher, and
 * a body-level modal reusing the same panel. All controls only change display
 * preferences; no session data or tool behavior is affected.
 */
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { supportedLanguages } from './languages.js'
import { AUTHOR, AUTHOR_URL, REPO_URL, VERSION } from './project.js'
import {
  currentTranscriptMode,
  getSettings,
  resetSettings,
  setTranscriptPreference,
  subscribeSettings,
  updateSettings,
} from './settings.js'

/* ---- settings modal store ---- */
let modalOpen = false
const modalListeners = new Set()

/** Open the plugin settings modal. */
export function openSettingsModal() {
  if (modalOpen) return
  modalOpen = true
  for (const listener of modalListeners) listener()
}

/** Close the plugin settings modal. */
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

function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/** The recognizer's registry: resolved once, and a missing list never breaks settings. */
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

/** Two-or-three-way segmented selector styled with host theme tokens. */
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

/** Compact native select used by the per-card shell/inner tone controls. */
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

/** Sliders icon for the sidebar-foot launcher. */
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

/** One labeled setting row with a segmented control. */
function SettingRow({ label, description, children, extra }) {
  return (
    <div className="did-setting">
      <div className="did-setting-text">
        <div className="did-setting-label">{label}</div>
        <div className="did-setting-desc">{description}</div>
        {extra === undefined ? null : extra}
      </div>
      <div className="did-setting-control">{children}</div>
    </div>
  )
}

/** Close button shared by the inline settings head and the modal banner. */
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
 * Collapsible list of every language the recognizer knows. The badge spans are
 * only mounted while the details element is open, so the settings page stays
 * light; the look is the same `.did-lang` badge used in the card header.
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

/** The shared settings panel body. */
function SettingsPanel({ t, onClose }) {
  const settings = useSettings()
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
              // Expanded rows inside DSH's native folded groups stay hidden, so
              // enabling this style also unfolds completed turns. The rows and
              // this preference switch live — no page reload is involved.
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

/** Settings page entry rendered inside the Settings shell. */
export function SettingsSection({ t }) {
  return (
    <div className="did-settings-page">
      <SettingsPanel t={t} />
    </div>
  )
}

/** Sidebar-foot launcher: always available even when a theme hides Settings. */
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

/** Body-level modal containing the same settings panel. */
export function SettingsModal({ t }) {
  const open = useModalOpen()
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
      <div className="did-settings-overlay" onPointerDown={closeSettingsModal}>
        <div className="did-settings-dialog" role="dialog" aria-modal="true" aria-label={t('settings.title')} onPointerDown={event => event.stopPropagation()}>
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
