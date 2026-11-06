/**
 * Plugin-owned stylesheet. Every surface inherits the Host theme through
 * `--dsw-alias-*` tokens (plus documented primitives tokens) and falls back to
 * neutral values when a token is absent, so a theme rename only degrades chrome.
 * Diff greens/reds are mixed from the Host success/error color tokens so they
 * stay legible in both light and dark themes.
 */
export const CSS = `
/* ---- appearance-aware surfaces -------------------------------------------
   Shell (card frame, dialogs, headers, footers) follows the active theme and
   the host light/dark setting: layering the theme's own surface token over an
   appearance-specific opaque base keeps the blue/gold/or whatever hue of the
   theme while avoiding translucent, washed-out windows.
   Inner content (diff rows, command execution, tool IO) follows the official
   DSH light/dark code-block palette instead: dark near-black gray, light
   near-white gray, with matching foreground colors so text never blends into
   the background.

   The derived variables are declared on \`body\`, not \`:root\`: the official DSH
   theme (and the descriptors injected by skin-center) define their
   \`--dsw-alias-*\` tokens on \`body\`. A var() declared on \`:root\` resolves on the
   root element, where those body-level tokens do not exist yet, so every
   surface would silently keep the literal fallbacks and never follow the
   theme. Declaring them on \`body\` resolves the theme tokens against the same
   element that defines them (and keeps working for skins that define their
   tokens on the root, because body inherits them). */
body {
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  /* dark appearance: neutral opaque underlay so the shell hue comes from the
     theme's own surface token (blue with the maid skin, gray with the official
     theme, whatever hue other themes define). */
  --did-shell-base: #101216;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  /* Elevated surfaces (settings dialog) use the theme's layer-2 surface, not
     --dsw-alias-bg-overlay: in the official dark theme the overlay token is a
     mid-gray (around #61666b) meant for scrims, so a dialog filled with it looks
     washed out/white against the dark UI. */
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #1a1c22);
  /* inner content uses the official dark code-block palette, not the theme */
  --did-io-bg: #1b1d21;
  --did-io-fg: #e9ebef;
  --did-io-muted: #9199a8;
  --did-io-border: rgba(255, 255, 255, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
body[data-dsh-inline-diff-appearance='light'] {
  --did-fg-primary: #172347;
  --did-fg-secondary: #4d5d7f;
  --did-fg-tertiary: #6f7c99;
  --did-border-1: rgba(71, 91, 145, 0.24);
  --did-border-2: rgba(71, 91, 145, 0.42);
  /* light appearance: neutral near-white underlay, shell hue again comes from
     the theme's own light surface token. */
  --did-shell-base: #ffffff;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #f4f6f9);
  /* inner content uses the official light code-block palette */
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
/* ---- per-card-type shell / inner tone overrides --------------------------
   Set by the settings panel on each rendered card; the values here override
   the document-level appearance variables for that card only. */
[data-shell-tone='light'] {
  --did-shell-base: #ffffff;
  --did-surface-1: #f4f6f9;
  --did-surface-2: #edf0f4;
  --did-surface-elevated: #f4f6f9;
  --did-fg-primary: #172347;
  --did-fg-secondary: #4d5d7f;
  --did-fg-tertiary: #6f7c99;
  --did-border-1: rgba(71, 91, 145, 0.24);
  --did-border-2: rgba(71, 91, 145, 0.42);
  --did-seg-bg: #edf0f4;
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
}
[data-shell-tone='dark'] {
  --did-shell-base: #101216;
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
}
[data-inner-tone='light'] {
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
}
[data-inner-tone='dark'] {
  --did-io-bg: #1b1d21;
  --did-io-fg: #e9ebef;
  --did-io-muted: #9199a8;
  --did-io-border: rgba(255, 255, 255, 0.12);
}
[data-inner-tone='same'] {
  --did-io-bg: transparent;
  --did-io-fg: var(--did-fg-primary);
  --did-io-muted: var(--did-fg-tertiary);
  --did-io-border: var(--did-border-1);
}
/* ---- enhanced flat flat command row (bash / pwsh) ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  /* No gap between the head and the IO panel: the IN status bar must reach the
     title strip without a blank band above it. Spacing is carried by the head
     padding instead. */
  gap: 0;
  min-width: 0;
  margin: 4px 0 4px 2px;
  padding: 4px 0 0;
  border: 0.5px solid var(--did-border-1);
  border-inline-width: 0.25px;
  border-bottom-width: 0;
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
  color: var(--did-fg-primary);
  overflow: hidden;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
}
.enhanced-head { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 1px 5px; }
/* Body cards: keep breathing room under the title text, but the IO panel and
   its status bars still touch the title strip. */
.enhanced-tool[data-body='true'] .enhanced-head { padding-bottom: 3px; }
.enhanced-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--did-fg-tertiary);
}
.enhanced-tool[data-state='ok'] .enhanced-dot { background: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] .enhanced-dot { background: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] .enhanced-dot { background: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: dsh-inline-diff-pulse 1.1s ease-in-out infinite; }
.enhanced-kind { display: inline-flex; flex: none; color: var(--did-fg-tertiary); }
.enhanced-tool[data-variant='command'] .enhanced-kind { color: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-variant='tool'] .enhanced-kind { color: var(--dsw-alias-brand-primary); }
.enhanced-tag {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-secondary);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.02em;
}
.enhanced-sep { flex: none; color: var(--did-fg-tertiary); opacity: 0.65; }
.enhanced-name { flex: none; font-weight: 600; color: var(--did-fg-primary); }
.enhanced-tool[data-variant='command'] .enhanced-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.enhanced-inspect {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 20px;
  padding: 0 7px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: transparent;
  color: var(--did-fg-tertiary);
  font: inherit;
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
  cursor: pointer;
}
.enhanced-inspect:hover {
  color: var(--dsw-alias-brand-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--did-border-2));
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
}
.enhanced-inspect:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.enhanced-inspect-label { font-size: 11px; line-height: 18px; }
.enhanced-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  padding-left: 8px;
}
.enhanced-badge {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--did-surface-2);
  color: var(--did-fg-secondary);
  font-family: var(--enhanced-mono);
  font-size: 10.5px;
  line-height: 17px;
  white-space: nowrap;
}
.enhanced-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--did-fg-secondary);
}
.enhanced-exit { flex: none; color: var(--dsw-alias-state-error-primary); font-family: var(--enhanced-mono); font-size: 11px; }
.enhanced-state { flex: none; color: var(--did-fg-tertiary); font-size: 11px; white-space: nowrap; }
.enhanced-io {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 0;
  border: 0;
  border-top: 0.5px solid var(--did-io-border);
  border-radius: 0;
  background: var(--did-io-bg);
  color: var(--did-io-fg);
  overflow: hidden;
}
.enhanced-tool[data-state='ok'] { --did-accent-bar: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] { --did-accent-bar: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] { --did-accent-bar: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'],
.enhanced-tool[data-state='preparing'] { --did-accent-bar: var(--dsw-alias-brand-primary); }
.enhanced-tool[data-body='false'] { padding-bottom: 4px; }
.enhanced-section {
  --did-section-bar: var(--dsw-alias-label-tertiary);
  display: grid;
  grid-template-columns: 2.6em minmax(0, 1fr);
  gap: 8px;
  /* No right padding: the scroll container below reaches the card's right edge
     so its scrollbar sits against the border (like the diff cards); the scroll
     content carries the visual inset itself. */
  padding: 8px 0 8px 7.5px;
  border-left: 2.5px solid color-mix(in srgb, var(--did-section-bar, var(--dsw-alias-label-tertiary)) 70%, transparent);
}
/* IN and OUT own their own status bar, drawn as the section's left border so it
   can follow the card's rounded bottom corner instead of being clipped by it:
   IN runs from the title strip down to the IN/OUT hairline, OUT runs from that
   hairline all the way along the card's curve to the bottom edge. The hairline
   is the only separator, so the two bars need no extra blank area between them. */
.enhanced-section:last-child {
  border-bottom-left-radius: var(--dsw-radius-lg, 16px);
}
.enhanced-section[data-state='ok'] { --did-section-bar: var(--dsw-alias-state-success-primary); }
.enhanced-section[data-state='error'] { --did-section-bar: var(--dsw-alias-state-error-primary); }
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] { --did-section-bar: var(--dsw-alias-brand-primary); }
.enhanced-section[data-state='stopped'] { --did-section-bar: var(--dsw-alias-state-warn-primary); }
.enhanced-section[data-state='skipped'] { --did-section-bar: var(--dsw-alias-label-tertiary); }
@keyframes dsh-inline-diff-bar-pulse {
  0%, 100% { border-left-color: color-mix(in srgb, var(--did-section-bar) 28%, transparent); }
  50% { border-left-color: color-mix(in srgb, var(--did-section-bar) 92%, transparent); }
}
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] {
  animation: dsh-inline-diff-bar-pulse 1.2s ease-in-out infinite;
}
/* One independent scroll area per section (IN and OUT each own theirs). The
   container spans to the card's right edge so its scrollbar is flush with the
   border; padding-right keeps the code text off the scrollbar. */
.enhanced-scroll { min-width: 0; max-height: 260px; overflow: auto; padding-right: 10px; }
.enhanced-scroll-in { max-height: 180px; }
.enhanced-label {
  color: var(--did-io-muted);
  font-size: 11px;
  line-height: 18px;
  font-family: var(--enhanced-mono);
  user-select: none;
}
.enhanced-code {
  min-width: 0;
  margin: 0;
  /* Default code text follows the inner tone / appearance (light inner = dark
     text, dark inner = light text) instead of the shell foreground. */
  color: var(--did-io-fg);
  font-family: var(--enhanced-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
}
.enhanced-code[data-error] { color: var(--dsw-alias-state-error-primary); }
.enhanced-code[data-placeholder='true'] { color: var(--did-io-muted); font-style: italic; }
.enhanced-divider { flex: none; height: 0.5px; background: var(--did-io-border); }
.enhanced-toggle {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--did-fg-tertiary);
  cursor: pointer;
  transition: transform 0.12s ease;
}
.enhanced-toggle[aria-expanded='true'] { transform: rotate(90deg); }
.enhanced-toggle:hover { color: var(--did-fg-primary); }
.enhanced-toggle-placeholder { flex: none; width: 14px; height: 14px; }

/* ---- sidebar-foot launcher ---- */
.did-launcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.did-launcher:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }
.did-launcher-label { overflow: hidden; text-overflow: ellipsis; }

/* ---- settings panel / page / modal ---- */
.did-settings-page { max-width: 760px; padding: 4px 0 24px; }
.did-settings { display: flex; flex-direction: column; min-width: 0; color: var(--did-fg-primary); }
.did-settings-head { display: flex; align-items: flex-start; gap: 12px; padding: 2px 0 16px; }
.did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-title { font-size: 18px; font-weight: 600; line-height: 26px; }
.did-settings-sub { margin-top: 4px; color: var(--did-fg-tertiary); font-size: 12px; line-height: 18px; }
.did-settings-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--did-fg-secondary);
  cursor: pointer;
}
.did-settings-close:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }
.did-settings-body { display: flex; flex-direction: column; border-top: 0.5px solid var(--did-border-1); }
.did-setting { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-bottom: 0.5px solid var(--did-border-1); }
.did-setting-text { flex: 1 1 auto; min-width: 0; }
.did-setting-label { font-size: 14px; color: var(--did-fg-primary); line-height: 21px; }
.did-setting-desc { margin-top: 3px; color: var(--did-fg-tertiary); font-size: 12px; line-height: 18px; }
.did-tones { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 7px; }
.did-tone { display: inline-flex; align-items: center; gap: 5px; }
.did-tone-label { color: var(--did-fg-tertiary); font-size: 11px; white-space: nowrap; }
.did-select {
  height: 22px;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-1);
  border-radius: 5px;
  background: var(--did-surface-2);
  color: var(--did-fg-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.did-select:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.did-setting-control { flex: none; }
.did-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--did-seg-bg); box-shadow: inset 0 0 0 0.5px var(--did-border-1); }
.did-seg-option {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;
}
.did-seg-option[data-active='true'] {
  background: var(--did-seg-active);
  color: var(--did-fg-primary);
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);
}
.did-seg-option:hover:not(:disabled) { color: var(--did-fg-primary); }
.did-seg-option:disabled { opacity: 0.5; cursor: default; }
.did-settings-note {
  margin-top: 12px;
  padding: 9px 12px;
  border: 0.5px solid var(--did-border-1);
  border-radius: 8px;
  background: var(--did-surface-1);
  color: var(--did-fg-secondary);
  font-size: 12px;
  line-height: 18px;
}
.did-settings-error { margin-top: 10px; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; white-space: pre-wrap; }
.did-settings-foot { display: flex; align-items: center; gap: 10px; padding-top: 14px; }
.did-settings-reset {
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 12px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}
.did-settings-grow { flex: 1 1 auto; }
.did-settings-author {
  color: var(--did-fg-tertiary);
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.did-settings-author:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.did-settings-hint { color: var(--did-fg-tertiary); font-size: 11.5px; }

.did-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
  pointer-events: auto;
}
.did-settings-dialog {
  width: min(760px, 96vw);
  max-height: min(820px, 90vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 55%, var(--did-border-1));
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-elevated), var(--did-surface-elevated));
  color: var(--did-fg-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}
/* Modal header banner: title + description + close stay fixed; the scroll body
   below is the only scrolling element, so its scrollbar never crosses the
   banner and the rounded dialog corners clip it instead of letting it spill. */
.did-settings-banner {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 22px 14px;
  border-bottom: 0.5px solid var(--did-border-1);
}
.did-settings-banner .did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-dialog .did-settings-head { display: none; }
.did-settings-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  /* Right padding keeps the scrollbar a little inside the rounded dialog edge
     instead of hugging (and appearing to spill over) the border. */
  padding: 14px 12px 16px 22px;
}
.did-settings-scroll .did-settings-body { border-top: 0; }
@media (max-width: 720px) {
  .did-setting { flex-direction: column; align-items: stretch; gap: 8px; }
  .did-setting-control { align-self: flex-start; }
  .did-settings-banner { padding: 16px 16px 12px; }
  .did-settings-scroll { padding: 12px 10px 14px 16px; }
}
.did-card {
  --did-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  --did-inset-x: 9px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 4px 0 4px 2px;
  /* A touch thicker than the host hairline so the card edge reads as a real
     surface; the color rows below still bleed all the way to that edge. */
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 45%, var(--did-border-1));
  border-inline-width: 0.25px;
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
  color: var(--did-fg-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
  overflow: hidden;
}

.did-card[data-state='error'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--did-border-1));
}

.did-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 5px var(--did-inset-x);
  cursor: pointer;
  user-select: none;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  font: inherit;
}

.did-head:hover { background: color-mix(in srgb, var(--did-fg-primary) 4%, transparent); }
.did-head:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }

.did-chevron {
  display: inline-flex;
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--did-fg-tertiary);
  transition: transform 0.12s ease;
}
.did-chevron[data-open='true'] { transform: rotate(90deg); }

.did-icon {
  display: inline-flex;
  flex: none;
  width: 15px;
  height: 15px;
  color: var(--did-fg-secondary);
}

.did-title {
  flex: none;
  font-weight: 500;
  color: var(--did-fg-primary);
}

.did-op {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-secondary);
  font-size: 10.5px;
  line-height: 16px;
}

.did-path {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 46%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  text-align: left;
  text-decoration: underline dotted 1px;
  text-underline-offset: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}
.did-path:hover { color: var(--dsw-alias-brand-primary); }

.did-stats {
  display: inline-flex;
  flex: none;
  gap: 5px;
  margin-left: 2px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  font-variant-numeric: tabular-nums;
}
.did-add { color: var(--dsw-alias-state-success-primary); }
.did-del { color: var(--dsw-alias-state-error-primary); }

.did-meta {
  flex: none;
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
  white-space: nowrap;
}

.did-spacer { flex: 1 1 auto; min-width: 4px; }
.did-actions { display: inline-flex; flex: none; align-items: center; gap: 7px; margin-left: auto; padding-left: 6px; }

.did-state {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  color: var(--did-fg-tertiary);
  font-size: 11px;
  white-space: nowrap;
}
.did-state[data-state='error'] { color: var(--dsw-alias-state-error-primary); }
.did-state[data-state='running'], .did-state[data-state='preparing'] { color: var(--dsw-alias-brand-primary); }
.did-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: dsh-inline-diff-pulse 1.1s ease-in-out infinite; }
@keyframes dsh-inline-diff-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.did-zoom {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 11px;
  line-height: 17px;
  cursor: pointer;
}
.did-zoom:hover:not([aria-disabled='true']) { color: var(--dsw-alias-brand-primary); border-color: currentColor; }
/* Not a native disabled button on purpose: it must still swallow the click so
   the card header (the collapse toggle) never receives it. */
.did-zoom[aria-disabled='true'] { opacity: 0.4; cursor: default; }

.did-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border-top: 0.5px solid var(--did-io-border);
  background: var(--did-io-bg);
}

.did-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 4px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, var(--did-io-bg));
  color: var(--did-fg-secondary);
  position: sticky;
  top: 0;
  z-index: 4;
  font-size: 11.5px;
  line-height: 18px;
}
.did-body > .did-hunk:first-child > .did-bar { border-top: 0; }

.did-bar-file {
  min-width: 0;
  max-width: 38%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--did-fg-primary);
}
.did-bar-range { white-space: nowrap; font-variant-numeric: tabular-nums; }
.did-bar-stats { margin-left: auto; flex: none; font-family: var(--did-mono); font-variant-numeric: tabular-nums; }

.did-rows { display: flex; flex-direction: column; min-width: 0; }

.did-row {
  display: grid;
  /* Compact gutters: both line-number columns stay tabular, but the code text
     starts much closer to the card edge instead of after a wide blank gutter. */
  grid-template-columns: 2.2em 2.2em 0.8em minmax(0, 1fr) auto;
  column-gap: 1px;
  min-width: 0;
  padding: 0 var(--did-inset-x, 9px) 0 8px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
}
.did-row[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-row[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-num {
  overflow: hidden;
  text-align: right;
  color: var(--did-fg-tertiary);
  font-variant-numeric: tabular-nums;
  user-select: none;
  font-size: 10.5px;
  letter-spacing: -0.01em;
}
/* Explicit gutter legend per hunk: labels the two line-number columns as the
   old-file and new-file line, so a changed row reads "old 42 / new 41" without
   having to decode the hunk header.
   The number columns below are sized in em against the row font size, so this
   strip must use the same base size; only the labels themselves are drawn
   smaller. Otherwise 2.2em here would be narrower than 2.2em in the rows and
   the 旧/新 glyphs would sit left of their number columns. */
.did-numhead {
  display: grid;
  grid-template-columns: 2.2em 2.2em 0.8em minmax(0, 1fr) auto;
  column-gap: 1px;
  padding: 3px var(--did-inset-x, 9px) 1px 8px;
  background: color-mix(in srgb, var(--did-fg-primary) 3%, transparent);
  color: var(--did-fg-tertiary);
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 12px;
  letter-spacing: 0;
  user-select: none;
}
.did-numhead-label {
  text-align: right;
  font-size: 9px;
  line-height: 12px;
  letter-spacing: 0;
  white-space: nowrap;
}
.did-numhead-label[data-side='old'] { color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 62%, var(--did-fg-tertiary)); }
.did-numhead-label[data-side='new'] { color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 62%, var(--did-fg-tertiary)); }
/* Reinforce the mapping on change rows: the gutter that belongs to the changed
   side is tinted like that side (deleted row → old number, added row → new). */
.did-row[data-kind='del'] .did-num[data-side='old'] {
  color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 60%, var(--did-fg-tertiary));
  font-weight: 600;
}
.did-row[data-kind='add'] .did-num[data-side='new'] {
  color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 60%, var(--did-fg-tertiary));
  font-weight: 600;
}
.did-sign { text-align: center; user-select: none; color: var(--did-fg-tertiary); }
.did-row[data-kind='add'] .did-sign { color: var(--dsw-alias-state-success-primary); }
.did-row[data-kind='del'] .did-sign { color: var(--dsw-alias-state-error-primary); }

.did-code {
  min-width: 0;
  margin: 0;
  padding: 0 4px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
  color: var(--did-fg-primary);
  tab-size: 4;
}

.did-move {
  align-self: center;
  margin-left: 6px;
  padding: 0 5px;
  border: 0.5px solid currentColor;
  border-radius: 999px;
  font-family: var(--dsh-content-font-family, system-ui, sans-serif);
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
  opacity: 0.85;
}
.did-row[data-kind='del'] .did-move { color: var(--dsw-alias-state-error-primary); }
.did-row[data-kind='add'] .did-move { color: var(--dsw-alias-state-success-primary); }

/* Word/character-level spans: deeper than the row's line-level wash. */
.did-row[data-kind='del'] .did-seg[data-changed='true'],
.did-cell[data-kind='del'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 65%, transparent);
}
.did-row[data-kind='add'] .did-seg[data-changed='true'],
.did-cell[data-kind='add'] .did-seg[data-changed='true'] {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 30%, transparent);
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 62%, transparent);
}

.did-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 3px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--did-fg-primary) 3.5%, transparent);
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.did-gap-range { font-variant-numeric: tabular-nums; white-space: nowrap; }
.did-shift {
  padding: 0 6px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  white-space: nowrap;
}

.did-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 4px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 17px;
}
.did-foot .did-grow { flex: 1 1 auto; }
.did-link {
  flex: none;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 11px;
  text-decoration: underline dotted 1px;
  text-underline-offset: 2px;
  cursor: pointer;
}

.did-note {
  padding: 7px var(--did-inset-x, 12px);
  color: var(--did-fg-secondary);
  font-size: 11.5px;
}

.did-notice {
  padding: 6px var(--did-inset-x, 12px);
  border-top: 0.5px solid var(--did-border-1);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--did-fg-secondary);
  font-size: 11.5px;
  line-height: 16px;
}
.did-dialog-notice {
  flex: none;
  border-top: 0;
  border-bottom: 0.5px solid var(--did-border-1);
}

.did-empty {
  padding: 9px var(--did-inset-x, 12px);
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
}

.did-error {
  padding: 8px var(--did-inset-x, 12px);
  color: var(--dsw-alias-state-error-primary);
  font-size: 11.5px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* ---- root overlay / modal ---- */

.did-overlay-root { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; }
.did-overlay-root[data-open='true'] { pointer-events: auto; }

.did-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
}

.did-dialog {
  --did-inset-x: 16px;
  display: flex;
  flex-direction: column;
  width: min(1440px, 96vw);
  height: min(900px, 90vh);
  min-width: 0;
  overflow: hidden;
  border: 0.5px solid color-mix(in srgb, var(--did-border-2) 55%, var(--did-border-1));
  border-radius: var(--dsw-radius-lg, 16px);
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-dialog-surface), var(--did-dialog-surface));
  color: var(--did-fg-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}

.did-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px var(--did-inset-x);
  border-bottom: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
}

.did-dialog-title { display: flex; flex-direction: column; gap: 1px; flex: 1 1 auto; min-width: 0; }
.did-dialog-path { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.did-dialog-sub { font-size: 11.5px; color: var(--did-fg-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.did-tabs { display: inline-flex; flex: none; gap: 2px; padding: 2px; border-radius: 8px; background: var(--did-seg-bg); box-shadow: inset 0 0 0 0.5px var(--did-border-1); }
.did-tab {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}
.did-tab[data-active='true'] { background: var(--did-seg-active); color: var(--did-fg-primary); box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent); }
.did-tab:disabled { opacity: 0.4; cursor: default; }

.did-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--did-fg-secondary);
  cursor: pointer;
}
.did-close:hover { background: color-mix(in srgb, var(--did-fg-primary) 7%, transparent); color: var(--did-fg-primary); }

.did-dialog-body { flex: 1 1 auto; min-height: 0; overflow: auto; scrollbar-gutter: stable; overscroll-behavior: contain; background: var(--did-io-bg); color: var(--did-io-fg); }

.did-dialog-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px var(--did-inset-x);
  border-top: 0.5px solid var(--did-border-1);
  background: var(--did-surface-1);
  color: var(--did-fg-tertiary);
  font-size: 11.5px;
}
.did-dialog-foot .did-grow { flex: 1 1 auto; }

.did-sbs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

/* The before/after strip is part of the dialog header now (outside the
   scrollable body), so it keeps its own row and never shares space with the
   body scrollbar. It no longer needs sticky positioning or a stacking level. */
.did-panes-head { flex: none; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: var(--did-dialog-surface); border-bottom: 0.5px solid var(--did-border-2); }
.did-pane-label { padding: 5px var(--did-inset-x); color: var(--did-fg-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--did-border-1); }

/* Hunk bars stick to the top of the scrollable body: the before/after strip is
   above that body in normal flow, so the bars can never paint over it. */
.did-sbs .did-bar { grid-column: 1 / -1; align-self: start; }

.did-read-main { min-width: 0; }
.did-read-range[hidden] { display: none; }
.did-read-range {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 0 6px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  color: var(--did-fg-tertiary);
  font-family: var(--enhanced-mono, var(--dsw-font-markdown-code-block-small, ui-monospace, monospace));
  font-size: 10.5px;
  line-height: 16px;
  white-space: nowrap;
  vertical-align: middle;
}
.did-sbs .did-gap { grid-column: 1 / -1; }
.did-sbs .did-note { grid-column: 1 / -1; }

.did-pair { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

.did-cell {
  display: grid;
  grid-template-columns: 2.7em minmax(0, 1fr) auto;
  min-width: 0;
  padding: 0 var(--did-inset-x) 0 14px;
  font-family: var(--did-mono, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
  border-left: 0.5px solid transparent;
}
.did-pair > .did-cell + .did-cell { border-left: 0.5px solid var(--did-border-1); }
.did-cell[data-kind='none'] { background: color-mix(in srgb, var(--did-fg-primary) 3%, transparent); }
.did-cell[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); }
.did-cell[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); }
.did-cell[data-kind='del'] { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-cell[data-kind='add'] { box-shadow: inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-cell .did-num { font-size: 10.5px; }
.did-cell .did-code { padding: 0 4px; }

.did-full-note { grid-column: 1 / -1; padding: 9px var(--did-inset-x); color: var(--did-fg-tertiary); font-size: 11.5px; }

@media (max-width: 860px) {
  .did-overlay { padding: 8px; }
  .did-dialog { width: 100%; height: 94vh; }
  .did-pair { grid-template-columns: minmax(0, 1fr); }
  .did-cell + .did-cell { border-top: 0.5px dashed var(--did-border-2); }
}

/* ---- settings: supported-language list -----------------------------------
   Only the layout shell lives here; the badge look itself is the shared
   .did-lang style injected with the syntax stylesheet, so the settings list
   and the card header badges stay identical. */
.did-langs-details { margin-top: 8px; }
.did-langs-details > summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  color: var(--did-fg-secondary);
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  user-select: none;
}
.did-langs-details > summary::-webkit-details-marker { display: none; }
.did-langs-details > summary::before {
  content: '▸';
  padding-right: 1px;
  color: var(--did-fg-tertiary);
  font-size: 10px;
}
.did-langs-details[open] > summary::before { content: '▾'; }
.did-langs-details > summary:hover { color: var(--did-fg-primary); }
.did-langs-details > summary:focus-visible {
  outline: 1px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
.did-langs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.did-langs .did-lang { font-size: 10.5px; line-height: 18px; }
`
