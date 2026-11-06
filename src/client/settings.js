/**
 * Plugin-owned display preferences for the enhanced (expanded, flat) presentation.
 *
 * These are browser-side view choices (localStorage), not session data: they
 * never enter the Session log and never change model input or tool behavior.
 * `transcript` additionally drives DSH's own durable `ui-chat.transcriptView`
 * preference through the shared `configForms` service, so the "flat / not
 * folded" look is the shipped `verbose` transcript policy rather than a CSS
 * hack, and switching back restores the user's previous value.
 */
const STORAGE_KEY = 'dsh-inline-diff.settings.v4'
const LEGACY_KEY = 'dsh-inline-diff.settings.v3'
const OLDER_KEY = 'dsh-inline-diff.settings.v2'
/** v1 predates the neutral mode names: never read, only removed on save. */
const RETIRED_KEY = 'dsh-inline-diff.settings.v1'

/** Display options. Defaults keep the original inline diff cards, native
 *  command rows, and the user's existing DSH transcript preference. */
export const DEFAULTS = {
  /** 'enhanced' = inline diff cards; 'native' = DSH file-mutation rows. */
  fileCards: 'enhanced',
  /** 'enhanced' = flat expanded Bash/PowerShell rows; 'native' = DSH rows. */
  shellRows: 'native',
  /** 'enhanced' = other tool calls (generic/details/search/web) expand IN/OUT by default; 'native' = DSH disclosure rows. */
  toolCalls: 'native',
  /** 'enhanced' = DSH verbose transcript (flat, unfolded); 'native' = don't touch it. */
  transcript: 'native',
  /** Per-card-type shell tone: 'auto' (theme + host appearance), 'light', 'dark'. */
  fileShellTone: 'auto',
  shellShellTone: 'auto',
  toolShellTone: 'auto',
  /** Per-card-type inner tone: 'auto' (official light/dark), 'light', 'dark', 'same' (= shell). */
  fileInnerTone: 'auto',
  shellInnerTone: 'auto',
  toolInnerTone: 'auto',
  /** Syntax highlighting for diff code (detection/palette live in languages.js). */
  syntaxHighlight: true,
  /** Language badge style: 'short' code, 'full' name, or 'hidden'. */
  languageBadge: 'short',
  /** Undetected language: 'show' a neutral "unknown" badge, or 'hidden'. */
  unknownLanguage: 'show',
  /** 'on' = highlight color + font emphasis (bold keywords, italic comments); 'off' = color only. */
  syntaxEmphasis: 'on',
}

const LANGUAGE_BADGE_VALUES = ['short', 'full', 'hidden']
const UNKNOWN_LANGUAGE_VALUES = ['show', 'hidden']
const SYNTAX_EMPHASIS_VALUES = ['on', 'off']
const SHELL_TONE_VALUES = ['auto', 'light', 'dark']
const INNER_TONE_VALUES = ['auto', 'light', 'dark', 'same']

const listeners = new Set()
// `previousTranscript` must be declared before `load()` runs: a restored record
// may carry it, and assigning a `let` still in its temporal dead zone would
// throw and silently discard every persisted option.
let previousTranscript
let transcriptForm
let configFormsRef
let state = load()

// Materialize v4 immediately so a migrated v3/v2 record survives the next reload.
persist()

function normalizeMode(value) {
  if (value === 'enhanced' || value === 'native') return value
  // v2 stored the previous style value; map any other non-empty mode to enhanced.
  if (typeof value === 'string' && value !== '') return 'enhanced'
  return undefined
}

/** Type/enum guard for the newer options: anything unexpected falls back to the default. */
function normalizeEnum(value, allowed, fallback) {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback
}

function normalizeBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

/** Shell tint: only the documented values survive a round-trip. */
function normalizeShellTone(value) {
  return normalizeEnum(value, SHELL_TONE_VALUES, 'auto')
}

/** Inner code tint, which additionally accepts 'same' (= follow the shell). */
function normalizeInnerTone(value) {
  return normalizeEnum(value, INNER_TONE_VALUES, 'auto')
}

/**
 * Mirror the host appearance (light / dark, including "follow system") onto the
 * document. The host sets the resolved mode as an inline `color-scheme`, which
 * is also what native primitives use; third-party themes may keep dark label
 * tokens when the appearance flips to light, so our surfaces read this
 * attribute instead of trusting those tokens alone.
 *
 * The attribute is written on both `<html>` (kept for compatibility/cleanup) and
 * `<body>`: the plugin surfaces' derived variables live on `body` (where the
 * host theme declares its own tokens), so the light-appearance override must be
 * scoped there as well.
 */
export function startAppearanceTracking() {
  try {
    const doc = globalThis.document
    const root = doc?.documentElement
    const body = doc?.body ?? null
    if (root === undefined || root === null || typeof MutationObserver !== 'function') return () => {}
    const styleOf = node => (node === null ? '' : String(globalThis.getComputedStyle?.(node)?.colorScheme || ''))
    const apply = () => {
      const tokens = [String(root.style.colorScheme || ''), styleOf(root), styleOf(body)]
        .filter(part => part !== '')
        .join(' ')
        .toLowerCase()
      let mode
      if (tokens.includes('dark')) mode = 'dark'
      else if (tokens.includes('light')) mode = 'light'
      // Some themes only announce the mode through the dark-theme attribute.
      else if (body !== null && body.hasAttribute('data-ds-dark-theme')) mode = 'dark'
      else mode = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches === true ? 'dark' : 'light'
      if (root.dataset.dshInlineDiffAppearance !== mode) root.dataset.dshInlineDiffAppearance = mode
      if (body !== null && body.dataset.dshInlineDiffAppearance !== mode) body.dataset.dshInlineDiffAppearance = mode
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['style', 'class'] })
    if (body !== null) {
      observer.observe(body, { attributes: true, attributeFilter: ['style', 'class', 'data-ds-dark-theme'] })
    }
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    if (media !== null && media !== undefined && typeof media.addEventListener === 'function') media.addEventListener('change', apply)
    return () => {
      observer.disconnect()
      if (media !== null && media !== undefined && typeof media.removeEventListener === 'function') media.removeEventListener('change', apply)
    }
  } catch {
    return () => {}
  }
}

function load() {
  try {
    const storage = globalThis.localStorage
    if (storage === undefined || storage === null) return { ...DEFAULTS }
    // v4 is current; v3 and v2 are read-migrated in order below and retired on
    // the next persist. v1 predates the neutral mode names and is not read.
    let raw = storage.getItem(STORAGE_KEY)
    if (typeof raw !== 'string' || raw === '') raw = storage.getItem(LEGACY_KEY)
    if (typeof raw !== 'string' || raw === '') raw = storage.getItem(OLDER_KEY)
    if (typeof raw !== 'string' || raw === '') return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...DEFAULTS }
    const next = { ...DEFAULTS }
    const fileCards = normalizeMode(parsed.fileCards)
    const shellRows = normalizeMode(parsed.shellRows)
    const toolCalls = normalizeMode(parsed.toolCalls)
    const transcript = normalizeMode(parsed.transcript)
    if (fileCards !== undefined) next.fileCards = fileCards
    if (shellRows !== undefined) next.shellRows = shellRows
    if (toolCalls !== undefined) next.toolCalls = toolCalls
    if (transcript !== undefined) next.transcript = transcript
    if (parsed.fileShellTone !== undefined) next.fileShellTone = normalizeShellTone(parsed.fileShellTone)
    if (parsed.shellShellTone !== undefined) next.shellShellTone = normalizeShellTone(parsed.shellShellTone)
    if (parsed.toolShellTone !== undefined) next.toolShellTone = normalizeShellTone(parsed.toolShellTone)
    if (parsed.fileInnerTone !== undefined) next.fileInnerTone = normalizeInnerTone(parsed.fileInnerTone)
    if (parsed.shellInnerTone !== undefined) next.shellInnerTone = normalizeInnerTone(parsed.shellInnerTone)
    if (parsed.toolInnerTone !== undefined) next.toolInnerTone = normalizeInnerTone(parsed.toolInnerTone)
    // Syntax-highlighting options: bad types/enums (older records, hand-edited
    // or partial JSON) collapse to the documented defaults instead of throwing.
    next.syntaxHighlight = normalizeBoolean(parsed.syntaxHighlight, DEFAULTS.syntaxHighlight)
    next.languageBadge = normalizeEnum(parsed.languageBadge, LANGUAGE_BADGE_VALUES, DEFAULTS.languageBadge)
    next.unknownLanguage = normalizeEnum(parsed.unknownLanguage, UNKNOWN_LANGUAGE_VALUES, DEFAULTS.unknownLanguage)
    next.syntaxEmphasis = normalizeEnum(parsed.syntaxEmphasis, SYNTAX_EMPHASIS_VALUES, DEFAULTS.syntaxEmphasis)
    if (typeof parsed.previousTranscript === 'string' && parsed.previousTranscript !== '') {
      previousTranscript = parsed.previousTranscript
    }
    return next
  } catch {
    return { ...DEFAULTS }
  }
}

function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      ...previousTranscript === undefined ? {} : { previousTranscript },
    }))
    globalThis.localStorage?.removeItem(LEGACY_KEY)
    globalThis.localStorage?.removeItem(OLDER_KEY)
    globalThis.localStorage?.removeItem(RETIRED_KEY)
  } catch {
    // A blocked localStorage only loses persistence; live switching keeps working.
  }
}

function emit() {
  for (const listener of listeners) listener()
}

/** Current settings, stable reference between changes. */
export function getSettings() {
  return state
}

/** Subscribe to settings changes. */
export function subscribeSettings(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Merge a patch into the settings and notify subscribers. */
export function updateSettings(patch) {
  state = { ...state, ...patch }
  persist()
  emit()
}

/** Restore every option to its default, including the DSH transcript value. */
export async function resetSettings() {
  const wasEnhanced = state.transcript === 'enhanced'
  state = { ...DEFAULTS }
  previousTranscript = undefined
  persist()
  emit()
  try {
    if (state.transcript === 'enhanced') await adoptTranscriptPreference()
    else if (wasEnhanced) await setTranscriptPreference('native')
  } catch {
    // A settings-service failure must not block resetting the local options.
  }
}

/** Wire the client's shared config-forms service and adopt a persisted flat choice. */
export function initSettings(configForms) {
  configFormsRef = configForms
  void adoptTranscriptPreference()
}

/** The `ui-chat` config form, resolved on first use (the client service may
 *  connect after this plugin). */
function chatForm() {
  if (configFormsRef === undefined) throw new Error('configForms is not available')
  if (transcriptForm === undefined) transcriptForm = configFormsRef.get('ui-chat')
  return transcriptForm
}

/** Read the live DSH transcript mode, or undefined when settings are not ready. */
export function currentTranscriptMode() {
  try {
    return chatForm().getSnapshot().value?.transcriptView
  } catch {
    return undefined
  }
}

/** Persist the plugin choice and apply the corresponding DSH transcript mode. */
export async function setTranscriptPreference(mode) {
  const form = chatForm()
  if (mode === 'enhanced') {
    const current = form.getSnapshot().value?.transcriptView
    if (typeof current === 'string' && current !== 'verbose' && current !== 'normal' && current !== 'expanded') {
      previousTranscript = current
    } else if (typeof current !== 'string') {
      previousTranscript = 'standard'
    }
    updateSettings({ transcript: 'enhanced' })
    await form.set('transcriptView', 'verbose')
    return
  }
  updateSettings({ transcript: 'native' })
  const current = form.getSnapshot().value?.transcriptView
  if (current === 'verbose') {
    // Restoring the value the user had before enabling the flat presentation;
    // legacy `normal`/`expanded` already read as detailed.
    await form.set('transcriptView', previousTranscript ?? 'standard')
  }
}

/**
 * Re-apply the persisted flat preference after a page reload. Only runs while
 * the plugin option says "enhanced"; choosing native never overwrites whatever
 * the user picked in DSH's own settings.
 */
export async function adoptTranscriptPreference() {
  if (state.transcript !== 'enhanced') return
  try {
    if (configFormsRef === undefined) return
    const form = chatForm()
    const current = form.getSnapshot().value?.transcriptView
    if (current !== 'verbose') {
      if (typeof current === 'string' && current !== 'normal' && current !== 'expanded') previousTranscript = current
      await form.set('transcriptView', 'verbose')
      persist()
    }
  } catch {
    // Settings service unavailable: the rest of the plugin keeps working.
  }
}

/** Localized current values for the settings page (kept out of the store). */
export function effectiveTranscriptLabel() {
  const mode = currentTranscriptMode()
  if (state.transcript === 'native') return mode ?? 'native'
  return mode ?? 'verbose'
}
