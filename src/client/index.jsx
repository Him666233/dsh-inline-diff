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
import { ENHANCED_DETAILS_KEYS, ENHANCED_GENERIC_KEYS, EnhancedExpandedTool, EnhancedToolCallTree } from './enhanced-tools.jsx'
import { DiffModal, InlineDiffCard } from './components.jsx'
import { dicts, NS } from './locales.js'
import { MUTATION_TOOLS } from './model.js'
import { getSettings, initSettings, subscribeSettings } from './settings.js'
import { CSS } from './styles.js'
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
  const t = ctx.locale.bind(NS)
  console.info(`[dsh-inline-diff] client ${VERSION} · enhanced presentation`)
  ctx.effect(() => startReadRangeChips(t), 'dsh-inline-diff: read range chips')
  initSettings(ctx.configForms)

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
            priority: -1,
            locale: NS,
          }, InlineDiffCard))
        }
      }
      if (settings.shellRows === 'enhanced') {
        for (const key of ENHANCED_SHELL_KEYS) {
          disposers.push(ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: -1,
            locale: NS,
          }, EnhancedShellCard))
        }
      }
      // Details-style tools own keyed views; take them over as well so the
      // "other tool calls" option also applies to e.g. 查询运行时.
      if (settings.toolCalls === 'enhanced') {
        for (const key of [...ENHANCED_DETAILS_KEYS, ...ENHANCED_GENERIC_KEYS]) {
          disposers.push(ctx.slots.register({
            name: 'tool.call.toolview',
            key,
            priority: -1,
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

  // The tool-call node renderer stays mounted for the page lifetime and reads
  // the display settings live. This keeps keyed child dispatch intact (Read /
  // todo / ask / this plugin's cards still render themselves) while making the
  // enhanced ⇄ DSH-native switch instantaneous, without relying on a page reload
  // that a desktop shell may intercept.
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'tool-call',
    priority: -1,
    locale: NS,
    children: {
      'tool.call.toolview': { kind: 'keyed', scope: 'session' },
    },
  }, EnhancedToolCallTree))

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
