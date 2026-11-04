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
const STORAGE_KEY = 'dsh-inline-diff.settings.v3'
const LEGACY_KEY = 'dsh-inline-diff.settings.v2'
const OLDER_KEY = 'dsh-inline-diff.settings.v1'

/** Display options. Defaults keep the original inline diff cards, native
 *  command rows, and the user's existing DSH transcript preference. */
export const DEFAULTS = {
  /** 'enhanced' = inline diff cards; 'native' = DSH file-mutation rows. */
  fileCards: 'enhanced',
  /** 'enhanced' = flat expanded Bash/PowerShell rows; 'native' = DSH rows. */
  shellRows: 'native',
  /** 'enhanced' = other tool calls expand IN/OUT by default; 'native' = DSH disclosure rows. */
  toolCalls: 'native',
  /** 'enhanced' = DSH verbose transcript (flat, unfolded); 'native' = don't touch it. */
  transcript: 'native',
}

const listeners = new Set()
let state = load()
let previousTranscript
let transcriptForm
let configFormsRef

// Materialize v3 immediately so a migrated v2 record survives the next reload.
persist()

function normalizeMode(value) {
  if (value === 'enhanced' || value === 'native') return value
  // v2 stored the previous style value; map any other non-empty mode to enhanced.
  if (typeof value === 'string' && value !== '') return 'enhanced'
  return undefined
}

function load() {
  try {
    const storage = globalThis.localStorage
    if (storage === undefined || storage === null) return { ...DEFAULTS }
    // v1 is intentionally retired; v2 values are migrated to the neutral
    // 'enhanced' name before the old key is removed.
    let raw = storage.getItem(STORAGE_KEY)
    if (typeof raw !== 'string' || raw === '') {
      raw = storage.getItem(LEGACY_KEY)
    }
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
