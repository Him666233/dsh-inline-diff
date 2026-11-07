/**
 * 语法高亮的样式表（与 styles.js 分开注入的第二份插件样式）。
 *
 * 配色约束（README「语法高亮」）：高亮只使用**前景色**，且色相被限制在蓝→紫
 * 区间（180°–285°）。插件已用红/绿表示删除/新增行，高亮颜色绝不能看起来像
 * 增删标记——这是安全/可读性的硬约束，由 tests/syntax-palette.test.mjs 断言。
 *
 * 实现方式：每个 token 组的颜色都走 `--did-syn-*` 自定义属性，同一份 DOM 可以
 * 在内层深色、内层浅色、以及“内层配色=跟随外壳”三种组合下重新取色，而完全
 * 不触碰行背景、行号槽（gutter）或行内改动洗色——那些由 styles.js 拥有。
 *
 * 导出的 `SYNTAX_PALETTE` 是给配色安全测试用的数据（键固定为渲染层实际使用的
 * token 分组）；`SYNTAX_CSS` 是完整样式表，由 index.jsx 以插件自有 `<style>`
 * 注入。
 *
 * 依赖：无（纯字符串/数据模块）。
 * 失败与回退：样式表本身不会失败；当高亮句柄为 null（未知语言/预算超限）时，
 * 渲染层根本不产出 `.did-tok` 节点，代码使用默认前景色（仍随浅色/深色外观可读）。
 */

/** 高亮调色板：仅前景色，深色/浅色两套。键 = token 分组，值 = 颜色。 */
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

/** 拥有独立自定义属性的分组（即导出调色板的键；其余分组复用这些色）。 */
const VARIABLE_GROUPS = ['kw', 'str', 'num', 'type', 'prop', 'com', 'meta', 'op', 'punct']

/** 生成一套调色板的自定义属性声明块（每行一个 `--did-syn-*`）。 */
function paletteVars(palette) {
  return VARIABLE_GROUPS.map(group => `  --did-syn-${group}: ${palette[group]};`).join('\n')
}

/** 生成“选择器 { 调色板变量 }”块，用于按外观/内层配色重定向调色板。 */
function paletteBlock(selector, palette) {
  return `${selector} {\n${paletteVars(palette)}\n}`
}

/**
 * token 着色规则。
 *
 * 没有专属色相的分组复用相近颜色（fn/tag/head → kw，attr/link → str，
 * lit → num）；`var` 与 `emph` 有意保持周围前景色，让普通标识符不会被染上
 * 语义色（避免“看起来像关键词”的误导）。
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
/* 次级分组复用相近色相，不再增加颜色数量。 */
.did-tok[data-g='fn'],
.did-tok[data-g='tag'],
.did-tok[data-g='head'] { color: var(--did-syn-kw); }
.did-tok[data-g='attr'],
.did-tok[data-g='link'] { color: var(--did-syn-str); }
.did-tok[data-g='lit'] { color: var(--did-syn-num); }
/* 普通标识符与强调文字保持代码默认前景色。 */
.did-tok[data-g='var'],
.did-tok[data-g='emph'] { color: inherit; }
`.trim()

/**
 * 可选的字体强调：只在设置项 `syntaxEmphasis` 为 'on' 时生效。
 * 'off' 时显式把字体样式重置为继承，防止第三方主题的加粗/斜体泄漏进来。
 */
const EMPHASIS_RULES = `
[data-syn-emphasis='on'] .did-tok[data-g='kw'],
[data-syn-emphasis='on'] .did-tok[data-g='fn'],
[data-syn-emphasis='on'] .did-tok[data-g='type'],
[data-syn-emphasis='on'] .did-tok[data-g='tag'],
[data-syn-emphasis='on'] .did-tok[data-g='head'] { font-weight: 600; }
[data-syn-emphasis='on'] .did-tok[data-g='com'] { font-style: italic; }
[data-syn-emphasis='on'] .did-tok[data-g='link'] { text-decoration: underline; }
/* “仅颜色”：确保没有任何字体样式从别处泄漏进来。 */
[data-syn-emphasis='off'] .did-tok {
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}
`.trim()

/**
 * 语言徽章样式：小而安静的发丝级胶囊，颜色用中性前景/边框 token；
 * 未知语言用虚线边框区分，而不是红/绿（红绿仍是增删语义专属）。
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
/* 卡片头：允许徽章收缩而不是把头部动作按钮挤出窄窗口；父级用 overflow
   hidden 截断。12em 上限足以容纳本地化的“未知语言”/“Unknown”以及最长的
   语言全名。 */
.did-head > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
}
/* 弹窗副标题：徽章内联在既有文字之前。 */
.did-dialog-sub > .did-lang {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 12em;
  overflow: hidden;
  margin-right: 5px;
  vertical-align: -1px;
}
`.trim()

/** 完整样式表：由 index.jsx 作为插件自有 `<style>` 注入。 */
export const SYNTAX_CSS = `
/* ---- 语法高亮：只使用前景色 ---------------------------------------------
   新增/删除行背景、行号符号与行内改动底色仍由 styles.js 以红/绿表达；
   这里的规则只改 token 文字颜色。
   调色板变量声明在 body 上，原因与 styles.js 相同：宿主主题把它的 token 声明
   在 body，声明在 :root 的 var() 解析不到那些 token（详见 styles.js）。 */
${paletteBlock('body', SYNTAX_PALETTE.dark)}
/* 官方浅色外观（宿主设置）：浅色内层。 */
${paletteBlock("body[data-dsh-inline-diff-appearance='light']", SYNTAX_PALETTE.light)}
/* 单卡片内部配色覆盖。'auto' 故意不写规则：跟随上面的文档级外观。 */
${paletteBlock("[data-inner-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='dark']", SYNTAX_PALETTE.dark)}
/* “内层配色 = 跟随外壳”：代码底色即外壳表面，因此调色板跟随外壳配色。
   外壳配色 'auto' 同样继承文档外观，所以不需要额外规则。 */
${paletteBlock("[data-inner-tone='same'][data-shell-tone='light']", SYNTAX_PALETTE.light)}
${paletteBlock("[data-inner-tone='same'][data-shell-tone='dark']", SYNTAX_PALETTE.dark)}

${TOKEN_RULES}

${EMPHASIS_RULES}

${BADGE_RULES}
`
