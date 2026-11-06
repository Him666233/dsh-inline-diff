/**
 * Color-safety contract for the syntax-highlighting palette.
 *
 * The diff cards reserve red / green for deletions and additions (row washes,
 * side bars, stats and the darker intra-line "changed" spans). A syntax token
 * color that lands in a red/green (or warm) hue band can therefore be mistaken
 * for change semantics, so the palette is constrained to the blue → violet arc:
 *
 *   - allowed hue window: 175° .. 285° (cyan-blue → violet); red/rose/magenta,
 *     orange/yellow, and every green are outside it by construction;
 *   - every foreground color keeps WCAG AA (>= 4.5:1) contrast on the official
 *     dark and light inner code-block backgrounds, so text never melts into
 *     the surface, and stays readable on top of the 11% / 30% diff row washes.
 *
 * These guards make the requirement machine-checkable: a future palette tweak
 * that reintroduces red/green fails `npm test`.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { SYNTAX_CSS, SYNTAX_PALETTE } from '../src/client/syntax-styles.js'

/** Official inner code-block backgrounds from styles.js. */
const DARK_BG = '#1b1d21'
const LIGHT_BG = '#f8f9fb'
/** Representative host success / error tokens, used only for blend checks. */
const SUCCESS = '#3fb950'
const ERROR = '#d95353'

/** Palette keys the renderer maps token groups onto. */
const REQUIRED_KEYS = ['kw', 'str', 'num', 'type', 'prop', 'com', 'meta', 'op', 'punct']
/** Token groups the renderer can emit (data-g attribute). */
const REQUIRED_GROUPS = [
  'kw', 'str', 'num', 'type', 'prop', 'com', 'meta', 'op', 'punct',
  'fn', 'tag', 'attr', 'head', 'link', 'lit', 'emph', 'var',
]

const HUE_MIN = 180
const HUE_MAX = 285

function parseHex(value) {
  assert.equal(typeof value, 'string', `color must be a string, got ${typeof value}`)
  const match = /^#([0-9a-f]{6})$/i.exec(value)
  assert.ok(match, `expected #rrggbb color, got ${value}`)
  const n = Number.parseInt(match[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function channelToLinear(value) {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex)
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

/** HSL hue in degrees (0..360); neutral grays report their nominal hue. */
function hueOf(hex) {
  const { r, g, b } = parseHex(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  if (max === min) return 0
  const delta = max - min
  let hue
  if (max === rn) hue = ((gn - bn) / delta) % 6
  else if (max === gn) hue = (bn - rn) / delta + 2
  else hue = (rn - gn) / delta + 4
  hue *= 60
  return (hue + 360) % 360
}

function hueInSafeWindow(hex) {
  const hue = hueOf(hex)
  return hue >= HUE_MIN && hue <= HUE_MAX
}

/** Blend `over` (host semantic color) with `base` at `weight` (0..1). */
function blend(over, base, weight) {
  const a = parseHex(over)
  const b = parseHex(base)
  const channel = (x, y) => Math.round(x * weight + y * (1 - weight))
  return `#${[channel(a.r, b.r), channel(a.g, b.g), channel(a.b, b.b)]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}`
}

test('the hue guard rejects every forbidden (red / green / warm / magenta) family', () => {
  const forbidden = {
    red: '#ff0000',
    'bright red': '#ff4d4d',
    rose: '#ff5577',
    orange: '#ff8800',
    amber: '#ffbb00',
    yellow: '#ffee00',
    'yellow-green': '#aaff00',
    green: '#00cc44',
    'bright green': '#00ff88',
    teal: '#00ccbb',
    magenta: '#ff00ff',
    pink: '#ff66cc',
  }
  for (const [name, color] of Object.entries(forbidden)) {
    assert.equal(hueInSafeWindow(color), false, `${name} (${color}) must stay outside the syntax palette window`)
  }
})

test('palette exposes every group and stays in the blue → violet arc', () => {
  for (const appearance of ['dark', 'light']) {
    const palette = SYNTAX_PALETTE[appearance]
    assert.ok(palette !== null && typeof palette === 'object', `missing ${appearance} palette`)
    for (const key of REQUIRED_KEYS) {
      assert.ok(key in palette, `${appearance} palette is missing "${key}"`)
      assert.equal(hueInSafeWindow(palette[key]), true,
        `${appearance}.${key} ${palette[key]} hue ${hueOf(palette[key]).toFixed(1)}° is outside the safe blue→violet window`)
    }
  }
})

test('every palette color keeps AA contrast on its code-block background', () => {
  for (const key of REQUIRED_KEYS) {
    const darkRatio = contrastRatio(SYNTAX_PALETTE.dark[key], DARK_BG)
    assert.ok(darkRatio >= 4.5, `dark.${key} contrast ${darkRatio.toFixed(2)}:1 < 4.5:1 on ${DARK_BG}`)
    const lightRatio = contrastRatio(SYNTAX_PALETTE.light[key], LIGHT_BG)
    assert.ok(lightRatio >= 4.5, `light.${key} contrast ${lightRatio.toFixed(2)}:1 < 4.5:1 on ${LIGHT_BG}`)
  }
})

test('tokens stay readable on top of the red/green diff washes', () => {
  // Changed rows paint an 11% semantic wash, changed intra-line spans a 30% one;
  // syntax colors must survive both without blending into the tint.
  for (const [appearance, base] of [['dark', DARK_BG], ['light', LIGHT_BG]]) {
    for (const [toneName, tone] of [['error', ERROR], ['success', SUCCESS]]) {
      for (const weight of [0.11, 0.3]) {
        const background = blend(tone, base, weight)
        for (const key of REQUIRED_KEYS) {
          const ratio = contrastRatio(SYNTAX_PALETTE[appearance][key], background)
          assert.ok(ratio >= 4,
            `${appearance}.${key} contrast ${ratio.toFixed(2)}:1 on ${toneName} ${Math.round(weight * 100)}% wash ${background} < 4:1`)
        }
      }
    }
  }
})

test('the stylesheet only ships safe foreground colors', () => {
  const paletteColors = new Set()
  for (const appearance of ['dark', 'light']) {
    for (const value of Object.values(SYNTAX_PALETTE[appearance])) paletteColors.add(value.toLowerCase())
  }
  const hexes = SYNTAX_CSS.match(/#[0-9a-fA-F]{6}\b/g) ?? []
  assert.ok(hexes.length > 0, 'SYNTAX_CSS must derive its colors from the palette')
  for (const hex of hexes) {
    const normalized = hex.toLowerCase()
    if (paletteColors.has(normalized)) continue
    const { r, g, b } = parseHex(normalized)
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) <= 18
    assert.ok(neutral || hueInSafeWindow(normalized),
      `stylesheets may not introduce red/green/warm color ${hex} (hue ${hueOf(hex).toFixed(1)}°)`)
  }
  for (const value of paletteColors) {
    assert.ok(SYNTAX_CSS.toLowerCase().includes(value), `SYNTAX_CSS does not use palette color ${value}`)
  }
})

test('stylesheet defines the token, emphasis and language-badge contracts', () => {
  for (const group of REQUIRED_GROUPS) {
    assert.ok(SYNTAX_CSS.includes(`data-g='${group}'`) || SYNTAX_CSS.includes(`data-g="${group}"`),
      `SYNTAX_CSS is missing the ${group} token group`)
  }
  assert.match(SYNTAX_CSS, /data-syn-emphasis=['"]on['"]/, 'missing emphasis-on rules')
  assert.match(SYNTAX_CSS, /data-syn-emphasis=['"]off['"]/, 'missing emphasis-off rules')
  assert.match(SYNTAX_CSS, /\.did-lang/, 'missing language badge styles')
  assert.match(SYNTAX_CSS, /data-inner-tone=['"]light['"]/, 'missing inner-tone light palette')
  assert.match(SYNTAX_CSS, /data-inner-tone=['"]dark['"]/, 'missing inner-tone dark palette')
  assert.match(SYNTAX_CSS, /data-dsh-inline-diff-appearance=['"]light['"]/, 'missing host light-appearance palette')
})
