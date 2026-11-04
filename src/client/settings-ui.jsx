/**
 * Plugin settings surface: a Settings page entry, a sidebar-foot launcher, and
 * a body-level modal reusing the same panel. All controls only change display
 * preferences; no session data or tool behavior is affected.
 */
import { Fragment, useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
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
function SettingRow({ label, description, children }) {
  return (
    <div className="did-setting">
      <div className="did-setting-text">
        <div className="did-setting-label">{label}</div>
        <div className="did-setting-desc">{description}</div>
      </div>
      <div className="did-setting-control">{children}</div>
    </div>
  )
}

/** The shared settings panel body. */
function SettingsPanel({ t, onClose }) {
  const settings = useSettings()
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
        {onClose === undefined ? null : (
          <button type="button" className="did-settings-close" onClick={onClose} aria-label={t('close')} title={t('close')}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="did-settings-body">
        <SettingRow label={t('settings.fileCards')} description={t('settings.fileCardsDesc')}>
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

        <SettingRow label={t('settings.shellRows')} description={t('settings.shellRowsDesc')}>
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

        <SettingRow label={t('settings.toolCalls')} description={t('settings.toolCallsDesc')}>
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
          <SettingsPanel t={t} onClose={closeSettingsModal} />
        </div>
      </div>
    </Fragment>
  )
  return host === null ? overlay : createPortal(overlay, host)
}
