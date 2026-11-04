/**
 * Plugin-owned stylesheet. Every surface inherits the Host theme through
 * `--dsw-alias-*` tokens (plus documented primitives tokens) and falls back to
 * neutral values when a token is absent, so a theme rename only degrades chrome.
 * Diff greens/reds are mixed from the Host success/error color tokens so they
 * stay legible in both light and dark themes.
 */
export const CSS = `
/* ---- enhanced flat flat command row (bash / pwsh) ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin: 4px 0 4px 2px;
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
}
.enhanced-head { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 1px 2px; }
.enhanced-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-label-tertiary);
}
.enhanced-tool[data-state='ok'] .enhanced-dot { background: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-state='error'] .enhanced-dot { background: var(--dsw-alias-state-error-primary); }
.enhanced-tool[data-state='stopped'] .enhanced-dot { background: var(--dsw-alias-state-warn-primary); }
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: did-pulse 1.1s ease-in-out infinite; }
.enhanced-kind { display: inline-flex; flex: none; color: var(--dsw-alias-label-tertiary); }
.enhanced-tool[data-variant='command'] .enhanced-kind { color: var(--dsw-alias-state-success-primary); }
.enhanced-tool[data-variant='tool'] .enhanced-kind { color: var(--dsw-alias-brand-primary); }
.enhanced-tag {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  line-height: 14px;
  letter-spacing: 0.02em;
}
.enhanced-sep { flex: none; color: var(--dsw-alias-label-tertiary); opacity: 0.65; }
.enhanced-name { flex: none; font-weight: 600; color: var(--dsw-alias-label-primary); }
.enhanced-tool[data-variant='command'] .enhanced-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.enhanced-inspect {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.enhanced-inspect:hover { color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent); }
.enhanced-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
}
.enhanced-exit { flex: none; color: var(--dsw-alias-state-error-primary); font-family: var(--enhanced-mono); font-size: 11px; }
.enhanced-state { flex: none; margin-left: auto; color: var(--dsw-alias-label-tertiary); font-size: 11px; white-space: nowrap; }
.enhanced-io {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 11px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 6px);
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
}
.enhanced-tool[data-variant='command'] .enhanced-io {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 3%, var(--dsw-alias-bg-layer-2));
}
.enhanced-tool[data-variant='tool'] .enhanced-io {
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-brand-primary) 42%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 4%, var(--dsw-alias-bg-layer-2));
}
.enhanced-section {
  display: grid;
  grid-template-columns: 2.6em minmax(0, 1fr);
  gap: 8px;
  padding: 8px 10px;
}
.enhanced-scroll { min-width: 0; max-height: 260px; overflow: auto; }
.enhanced-scroll-in { max-height: 180px; }
.enhanced-label {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 18px;
  font-family: var(--enhanced-mono);
  user-select: none;
}
.enhanced-code {
  min-width: 0;
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-family: var(--enhanced-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 4;
}
.enhanced-code[data-error] { color: var(--dsw-alias-state-error-primary); }
.enhanced-divider { flex: none; height: 0.5px; background: var(--dsw-alias-border-l1); }
.enhanced-error {
  margin-left: 11px;
  color: var(--dsw-alias-state-error-primary);
  font-size: 11.5px;
  line-height: 16px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.enhanced-native { display: flex; flex-direction: column; min-width: 0; margin: 4px 0 4px 2px; color: var(--dsw-alias-label-primary); font-size: var(--dsh-content-font-size-secondary, 13px); }
.enhanced-native-headrow { display: flex; align-items: center; gap: 4px; min-width: 0; }
.enhanced-native-headrow .enhanced-native-head { flex: 1 1 auto; min-width: 0; }
.enhanced-native-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 2px 2px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.enhanced-native-head:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent); border-radius: var(--dsw-radius-sm, 4px); }
.enhanced-native-chevron { display: inline-flex; flex: none; color: var(--dsw-alias-label-tertiary); transition: transform 0.12s ease; }
.enhanced-native-chevron[data-open='true'] { transform: rotate(90deg); }
.enhanced-native-output {
  margin: 2px 0 0 22px;
  padding: 8px 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 6px);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 2px);
  line-height: 18px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 260px;
  overflow: auto;
}
.enhanced-empty { margin-left: 11px; color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }
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
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: transform 0.12s ease;
}
.enhanced-toggle[aria-expanded='true'] { transform: rotate(90deg); }
.enhanced-toggle:hover { color: var(--dsw-alias-label-primary); }
.enhanced-toggle-placeholder { flex: none; width: 14px; height: 14px; }
.enhanced-call-row { min-width: 0; margin: 2px 0; border-radius: var(--dsw-radius-sm, 4px); }
.enhanced-subcalls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0 2px 22px;
  padding-left: 8px;
  border-left: 0.5px solid var(--dsw-alias-border-l2);
}

/* ---- sidebar-foot launcher ---- */
.did-launcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 4px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.did-launcher:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
.did-launcher-label { overflow: hidden; text-overflow: ellipsis; }

/* ---- settings panel / page / modal ---- */
.did-settings-page { max-width: 760px; padding: 4px 0 24px; }
.did-settings { display: flex; flex-direction: column; min-width: 0; color: var(--dsw-alias-label-primary); }
.did-settings-head { display: flex; align-items: flex-start; gap: 12px; padding: 2px 0 16px; }
.did-settings-headtext { flex: 1 1 auto; min-width: 0; }
.did-settings-title { font-size: 18px; font-weight: 600; line-height: 26px; }
.did-settings-sub { margin-top: 4px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
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
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.did-settings-close:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
.did-settings-body { display: flex; flex-direction: column; border-top: 0.5px solid var(--dsw-alias-border-l1); }
.did-setting { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-bottom: 0.5px solid var(--dsw-alias-border-l1); }
.did-setting-text { flex: 1 1 auto; min-width: 0; }
.did-setting-label { font-size: 14px; color: var(--dsw-alias-label-primary); line-height: 21px; }
.did-setting-desc { margin-top: 3px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.did-setting-control { flex: none; }
.did-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); }
.did-seg-option {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;
}
.did-seg-option[data-active='true'] { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.did-seg-option:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
.did-seg-option:disabled { opacity: 0.5; cursor: default; }
.did-settings-note {
  margin-top: 12px;
  padding: 9px 12px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
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
  color: var(--dsw-alias-label-tertiary);
  text-decoration: none;
  font-size: 11px;
  white-space: nowrap;
}
.did-settings-author:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.did-settings-hint { color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }

.did-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 32%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
  pointer-events: auto;
}
.did-settings-dialog {
  width: min(760px, 96vw);
  max-height: min(820px, 90vh);
  overflow: auto;
  padding: 18px 22px 16px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
}
@media (max-width: 720px) {
  .did-setting { flex-direction: column; align-items: stretch; gap: 8px; }
  .did-setting-control { align-self: flex-start; }
  .did-settings-dialog { padding: 16px; }
}
.did-card {
  --did-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 4px 0 4px 2px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 1.55;
  overflow: hidden;
}

.did-card[data-state='error'] {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1));
}

.did-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  font: inherit;
}

.did-head:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent); }
.did-head:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }

.did-chevron {
  display: inline-flex;
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--dsw-alias-label-tertiary);
  transition: transform 0.12s ease;
}
.did-chevron[data-open='true'] { transform: rotate(90deg); }

.did-icon {
  display: inline-flex;
  flex: none;
  width: 15px;
  height: 15px;
  color: var(--dsw-alias-label-secondary);
}

.did-title {
  flex: none;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}

.did-op {
  flex: none;
  padding: 0 5px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
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
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
  white-space: nowrap;
}

.did-spacer { flex: 1 1 auto; min-width: 4px; }

.did-state {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  white-space: nowrap;
}
.did-state[data-state='error'] { color: var(--dsw-alias-state-error-primary); }
.did-state[data-state='running'], .did-state[data-state='preparing'] { color: var(--dsw-alias-brand-primary); }
.did-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: did-pulse 1.1s ease-in-out infinite; }
@keyframes did-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }

.did-zoom {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11px;
  line-height: 17px;
  cursor: pointer;
}
.did-zoom:hover:not(:disabled) { color: var(--dsw-alias-brand-primary); border-color: currentColor; }
.did-zoom:disabled { opacity: 0.4; cursor: default; }

.did-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 360px;
  overflow: auto;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2, transparent);
}

.did-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 3px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, var(--dsw-alias-bg-layer-1, transparent));
  color: var(--dsw-alias-label-secondary);
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
  color: var(--dsw-alias-label-primary);
}
.did-bar-range { white-space: nowrap; font-variant-numeric: tabular-nums; }
.did-bar-stats { margin-left: auto; flex: none; font-family: var(--did-mono); font-variant-numeric: tabular-nums; }

.did-rows { display: flex; flex-direction: column; min-width: 0; }

.did-row {
  display: grid;
  grid-template-columns: 3.1em 3.1em 1em minmax(0, 1fr) auto;
  column-gap: 2px;
  min-width: 0;
  padding: 0 8px 0 2px;
  font-family: var(--did-mono);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
}
.did-row[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-row[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-num {
  overflow: hidden;
  text-align: right;
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
  user-select: none;
  font-size: 11px;
}
.did-sign { text-align: center; user-select: none; color: var(--dsw-alias-label-tertiary); }
.did-row[data-kind='add'] .did-sign { color: var(--dsw-alias-state-success-primary); }
.did-row[data-kind='del'] .did-sign { color: var(--dsw-alias-state-error-primary); }

.did-code {
  min-width: 0;
  margin: 0;
  padding: 0 4px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: inherit;
  color: var(--dsw-alias-label-primary);
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
  padding: 2px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 3.5%, transparent);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
}
.did-gap-range { font-variant-numeric: tabular-nums; white-space: nowrap; }
.did-shift {
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  white-space: nowrap;
}

.did-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 3px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-tertiary);
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
  padding: 6px 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
}

.did-notice {
  padding: 5px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  line-height: 16px;
}
.did-dialog-notice {
  border-top: 0;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  position: sticky;
  top: 0;
  z-index: 3;
}

.did-empty {
  padding: 8px 10px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
}

.did-error {
  padding: 7px 10px;
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
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 32%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
}

.did-dialog {
  display: flex;
  flex-direction: column;
  width: min(1440px, 96vw);
  height: min(900px, 90vh);
  min-width: 0;
  overflow: hidden;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
}

.did-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 14px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.did-dialog-title { display: flex; flex-direction: column; gap: 1px; flex: 1 1 auto; min-width: 0; }
.did-dialog-path { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.did-dialog-sub { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.did-tabs { display: inline-flex; flex: none; gap: 2px; padding: 2px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); }
.did-tab {
  padding: 2px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}
.did-tab[data-active='true'] { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
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
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.did-close:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }

.did-dialog-body { flex: 1 1 auto; min-height: 0; overflow: auto; background: var(--dsw-alias-bg-base); }

.did-dialog-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 7px 14px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11.5px;
}
.did-dialog-foot .did-grow { flex: 1 1 auto; }

.did-sbs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-width: 0; }

.did-panes-head { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); position: sticky; top: 0; z-index: 2; background: var(--dsw-alias-bg-layer-1); border-bottom: 0.5px solid var(--dsw-alias-border-l2); }
.did-pane-label { padding: 4px 12px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--dsw-alias-border-l1); }

.did-sbs .did-bar { grid-column: 1 / -1; align-self: start; top: 23px; }

.did-read-main { min-width: 0; }
.did-read-range[hidden] { display: none; }
.did-read-range {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  color: var(--dsw-alias-label-tertiary);
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
  grid-template-columns: 3.2em minmax(0, 1fr) auto;
  min-width: 0;
  padding: 0 6px 0 0;
  font-family: var(--did-mono, 12px/18px ui-monospace, monospace);
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 18px;
  border-left: 0.5px solid transparent;
}
.did-pair > .did-cell + .did-cell { border-left: 0.5px solid var(--dsw-alias-border-l1); }
.did-cell[data-kind='none'] { background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); }
.did-cell[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); }
.did-cell[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 11%, transparent); }
.did-cell[data-kind='del'] { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, transparent); }
.did-cell[data-kind='add'] { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, transparent); }

.did-cell .did-num { font-size: 11px; }
.did-cell .did-code { padding: 0 4px; }

.did-full-note { grid-column: 1 / -1; padding: 8px 14px; color: var(--dsw-alias-label-tertiary); font-size: 11.5px; }

@media (max-width: 860px) {
  .did-overlay { padding: 8px; }
  .did-dialog { width: 100%; height: 94vh; }
  .did-pair { grid-template-columns: minmax(0, 1fr); }
  .did-cell + .did-cell { border-top: 0.5px dashed var(--dsw-alias-border-l2); }
}
`
