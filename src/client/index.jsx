/**
 * Browser-half entry.
 *
 * Registers the inline diff rows, the optional enhanced flat flat command
 * rows, both settings surfaces, and the two body-level modal overlays. Tool
 * view registrations are owned by this plugin context and re-created when the
 * user changes the display style, so switching back to DSH-native rows simply
 * disposes the takeover and the shipped cells return.
 */
import { EnhancedShellCard } from './enhanced-shell.jsx'
import {
  ENHANCED_DETAILS_KEYS,
  ENHANCED_GENERIC_KEYS,
  ENHANCED_SEARCH_WEB_KEYS,
  EnhancedExpandedTool,
} from './enhanced-tools.jsx'
import { DiffModal, InlineDiffCard } from './components.jsx'
import { dicts, NS } from './locales.js'
import { MUTATION_TOOLS } from './model.js'
import { getSettings, initSettings, startAppearanceTracking, subscribeSettings } from './settings.js'
import { CSS } from './styles.js'
import { SYNTAX_CSS } from './syntax-styles.js'
import { startReadRangeChips } from './read-range-dom.js'
import { VERSION } from './project.js'
import { SettingsLauncher, SettingsModal, SettingsSection } from './settings-ui.jsx'

/** Services: slots, locale dictionaries, and the shared Host-backed config forms. */
export const inject = ['slots', 'locale', 'configForms']

/** Tool keys whose stock view the inline diff cards replace. */
const INLINE_DIFF_KEYS = MUTATION_TOOLS
/** Tool keys whose stock view the enhanced flat command row replaces. */
const ENHANCED_SHELL_KEYS = ['bash', 'pwsh', 'win_bash']
/**
 * Priority for our keyed `tool.call.toolview` registrations. The official tool
 * layer registers at the default priority (0); theme/companion plugins may also
 * shadow tool views at -1. The slot registry rejects two registrations with the
 * same key *and* priority, so we use a clearly lower value: our views render
 * (lowest priority renders) and a theme plugin registering at -1 no longer
 * crashes either side during startup.
 */
const VIEW_PRIORITY = -100

/**
 * Mount all plugin contributions.
 * @param ctx - client root context (services arrive through `inject`).
 */
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dicts), 'dsh-inline-diff: dictionaries')
  // Inject the stylesheet once for the whole page. Tool rows (command / generic /
  // details) can mount without any diff card or modal, so they must not rely on
  // another component rendering the style tag.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'inline-diff'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-inline-diff: stylesheet')
  // Syntax highlighting owns a second stylesheet: it is palette data driven
  // and can be swapped independently, while surfaces still render correctly
  // (default foreground) when no tokens are present.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'inline-diff-syntax'
    style.textContent = SYNTAX_CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-inline-diff: syntax stylesheet')
  const t = ctx.locale.bind(NS)
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`)
  ctx.effect(() => startReadRangeChips(t), 'dsh-inline-diff: read range chips')
  initSettings(ctx.configForms)
  // Mirror the host light/dark appearance onto the document (html + body) so the
  // plugin surfaces can pick readable shell/inner colors; dispose restores the
  // host look.
  ctx.effect(() => {
    const stopAppearance = startAppearanceTracking()
    return () => {
      stopAppearance()
      if (typeof document !== 'undefined') {
        delete document.documentElement.dataset.dshInlineDiffAppearance
        if (document.body !== null) delete document.body.dataset.dshInlineDiffAppearance
      }
    }
  }, 'dsh-inline-diff: appearance')

  // Tool-row takeovers follow the persisted display options. Re-registering
  // disposes the previous set first, which restores the shipped DSH row.
  ctx.slots.inject('tool.call.toolview', () => {
    let disposers = []
    let signature = ''
    const clear = () => {
      for (const dispose of disposers) dispose()
      disposers = []
    }
    const sync = () => {
      const settings = getSettings()
      const next = `${settings.fileCards}|${settings.shellRows}|${settings.toolCalls}`
      if (next === signature) return
      signature = next
      clear()
      if (settings.fileCards === 'enhanced') {
        for (const key of INLINE_DIFF_KEYS) {
          disposers.push(ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: VIEW_PRIORITY,
            locale: NS,
          }, InlineDiffCard))
        }
      }
      if (settings.shellRows === 'enhanced') {
        for (const key of ENHANCED_SHELL_KEYS) {
          disposers.push(ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: VIEW_PRIORITY,
            locale: NS,
          }, EnhancedShellCard))
        }
      }
      // Details-style tools own keyed views; take them over as well so the
      // "other tool calls" option also applies to e.g. 查询运行时. Search and web
      // tools ship rich stock cards; the same option takes those over so one
      // conversation does not mix flat rows with native disclosure cards.
      if (settings.toolCalls === 'enhanced') {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS, ...ENHANCED_SEARCH_WEB_KEYS]) {
          disposers.push(ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: VIEW_PRIORITY,
            locale: NS,
          }, EnhancedExpandedTool))
        }
      }
    }
    const unsubscribe = subscribeSettings(sync)
    sync()
    return () => {
      unsubscribe()
      clear()
    }
  })

  // Do not shadow `conversation.chat.node`'s tool-call entry. In dsh
  // >= 0.2.2-rc.1 the official Tool layer (@deepseek-ai/dsh-client-ui-tool)
  // owns that entry and declares `tool.call.toolview` as its child; the slots
  // registry permits one declaration per slot, so a second `children` table
  // throws "slot ... is already declared" and aborts the rest of this apply().
  // The keyed registrations above are the supported extension point: the
  // official tree dispatches them by tool name and keeps its generic row for
  // unregistered tools.

  // Frame-wide overlays. Both render through a body-level React portal, so
  // they sit above host chrome, themes, and third-party floating layers.
  ctx.slots.inject('shell.overlay', function* () {
    yield ctx.slots.register({
      name: 'shell.overlay',
      id: 'inline-diff.modal',
      order: 60,
      locale: NS,
    }, DiffModal)
    yield ctx.slots.register({
      name: 'shell.overlay',
      id: 'inline-diff.settings',
      order: 61,
      locale: NS,
    }, SettingsModal)
  })

  // A full settings page inside the Settings shell.
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'inline-diff',
    order: 40,
    label: () => t('settings.nav'),
    locale: NS,
  }, SettingsSection))

  // A sidebar-foot launcher, so the settings stay reachable even when a
  // third-party theme hides or reworks the stock Settings launcher.
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'inline-diff.settings',
    order: 40,
    label: () => t('settings.short'),
    locale: NS,
  }, SettingsLauncher))
}
