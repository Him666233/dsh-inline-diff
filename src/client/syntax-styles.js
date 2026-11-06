/**
 * Syntax-highlighting stylesheet for the inline diff surfaces.
 *
 * The palette is foreground-only and confined to the blue→violet arc
 * (hues 180°–285°): the plugin already uses red/green for removed/added lines,
 * so highlighting must never be able to look like an add/remove marker. Every
 * token color goes through a `--did-syn-*` custom property, which lets the same
 * markup re-color itself for a dark inner surface, a light inner surface, and
 * the "inner tone = same as shell" combination without touching the row
 * backgrounds, gutters, or changed-segment washes owned by styles.js.
 *
 * `SYNTAX_PALETTE` is exported as data for the palette safety test
 * (`tests/syntax-palette.test.mjs`): keys are fixed to the token groups the
 * renderer actually colors.
 */
export const SYNTAX_PALETTE = {
  dark: {
    kw: '#c5a8ff',
    str: '#86b6ff',
    num: '#74d9e6',
    type: '#aab8ff',
    prop: '#8fd0e8',
    com: '#a3acbd',
    meta: '#9fa8c8',
    op: '#b3bac6',
    punct: '#aab2c0',
  },
  light: {
    kw: '#6d3fd1',
    str: '#1f4fbf',
    num: '#0b6b7d',
    type: '#4652c4',
    prop: '#0f6076',
    com: '#525c6a',
    meta: '#46527d',
    op: '#55606f',
    punct: '#4c5563',
  },
}

/** Groups that get their own custom property (the exported palette keys). */
const VARIABLE_GROUPS = ['kw', 'str', 'num', 'type', 'prop', 'com', 'meta', 'op', 'punct']

/** One custom-property declaration block for a palette. */
function paletteVars(palette) {
  return VARIABLE_GROUPS.map(group => `  --did-syn-${group}: ${palette[group]};`).join('\n')
}

/** Selector block that re-points the palette custom properties. */
function paletteBlock(selector, palette) {
  return `${selector} {\n${paletteVars(palette)}\n}`
}

/**
 * Token coloring. Groups that have no dedicated hue fall back to a related
 * palette color; `var`/`emph` deliberately keep the surrounding foreground so
 * plain identifiers never pick up a semantic hue.
 */
const TOKEN_RULES = `
.did-tok[data-g='kw'] { color: var(--did-syn-kw); }
.did-tok[data-g='str'] { color: var(--did-syn-str); }
.did-tok[data-g='num'] { color: var(--did-syn-num); }
.did-tok[data-g='type'] { color: var(--did-syn-type); }
.did-tok[data-g='prop'] { color: var(--did-syn-prop); }
.did-tok[data-g='com'] { color: var(--did-syn-com); }
.did-tok[data-g='meta'] { color: var(--did-syn-meta); }
.did-tok[data-g='op'] { color: var(--did-syn-op); }
.did-tok[data-g='punct'] { color: var(--did-syn-punct); }
/* Secondary groups reuse a related hue instead of adding more colors. */
.did-tok[data-g='fn'],
.did-tok[data-g='tag'],
.did-tok[data-g='head'] { color: var(--did-syn-kw); }
.did-tok[data-g='attr'],
.did-tok[data-g='link'] { color: var(--did-syn-str); }
.did-tok[data-g='lit'] { color: var(--did-syn-num); }
/* Ordinary identifiers and emphasis keep the default code foreground. */
.did-tok[data-g='var'],
.did-tok[data-g='emph'] { color: inherit; }
`.trim()

/** Optional font emphasis, only active while the setting says `on`. */
const EMPHASIS_RULES = `
[data-syn-emphasis='on'] .did-tok[data-g='kw'],
[data-syn-emphasis='on'] .did-tok[data-g='fn'],
[data-syn-emphasis='on'] .did-tok[data-g='type'],
[data-syn-emphasis='on'] .did-tok[data-g='tag'],
[data-syn-emphasis='on'] .did-tok[data-g='head'] { font-weight: 600; }
[data-syn-emphasis='on'] .did-tok[data-g='com'] { font-style: italic; }
[data-syn-emphasis='on'] .did-tok[data-g='link'] { text-decoration: underline; }
/* "Color only": make sure no emphasis style leaks in from elsewhere. */
[data-syn-emphasis='off'] .did-tok {
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}
`.trim()

/**
 * Language badge. Small and quiet: a hairline capsule in the neutral
 * foreground/border tokens; unknown languages are distinguished by a dashed
 * border instead of any red/green color.
 */
const BADGE_RULES = `
.did-lang {
  display: inline-flex;
  flex: none;
  align-items: center;
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--did-fg-primary) 5%, transparent);
  color: var(--did-fg-tertiary);
  font-family: var(--did-mono, ui-monospace, monospace);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  user-select: none;
}
.did-lang[data-variant='full'] {
  font-family: inherit;
  font-size: 10.5px;
  letter-spacing: 0;
}
.did-lang[data-unknown='true'] { border-style: dashed; }
.did-lang[data-plain='true'] { opacity: 0.9; }
/* Card header: allow the badge to shrink instead of pushing the header
   actions out on a narrow window; the parent clamps it with overflow hidden.
   The 12em ceiling comfortably fits localized "未知语言"/"Unknown" and even the
   longest full language label. */
.did-head > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
}
/* Dialog subtitle: the badge sits inline before the existing text. */
.did-dialog-sub > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
  margin-right: 5px;
  vertical-align: -1px;
}
`.trim()

/** Complete stylesheet injected by index.jsx as a plugin-owned `<style>`. */
export const SYNTAX_CSS = `
/* ---- syntax highlighting: foreground colors only -----------------------
   Add/remove row washes, gutter signs, and changed-segment backgrounds stay
   red/green in styles.js; these rules only touch token text color.
   Palette variables live on body for the same reason the surface variables do
   (the host theme declares its tokens on body, so a :root declaration would
   never see them; see styles.js). */
${paletteBlock('body', SYNTAX_PALETTE.dark)}
/* Official light appearance (host setting): light inner surface. */
${paletteBlock("body[data-dsh-inline-diff-appearance='light']", SYNTAX_PALETTE.light)}
/* Per-card inner tone override. The "auto" value intentionally has no rule: it
   follows the document appearance above. */
${paletteBlock("[data-inner-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='dark']", SYNTAX_PALETTE.dark)}
/* Inner tone "same as shell": the code background is then the shell surface,
   so the palette follows the shell tone. Shell tone "auto" likewise inherits
   the document appearance, so it needs no extra rule either. */
${paletteBlock("[data-inner-tone='same'][data-shell-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='same'][data-shell-tone='dark']", SYNTAX_PALETTE.dark)}

${TOKEN_RULES}

${EMPHASIS_RULES}

${BADGE_RULES}
`
