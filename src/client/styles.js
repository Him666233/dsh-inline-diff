/**
 * 插件自有主样式表（字符串形式，由 index.jsx 作为 `<style>` 注入）。
 *
 * 所有表面都通过宿主的 `--dsw-alias-*` token（以及有文档的 primitives token）
 * 继承主题；token 缺失时回退到中性色，因此主题改名最坏也只是chrome 降级，不会
 * 变成不可读。差异的绿/红从宿主的 success/error 颜色 token 混出来，保证浅色/
 * 深色主题下都可读。
 */
export const CSS = `
/* ---- 外观感知的表面配色 ------------------------------------------------
   外壳（卡片框、弹窗、头/脚）跟随当前主题与宿主浅/深色设置：把主题自己的
   表面 token 叠在“外观专属的不透明底色”上，既保留主题的蓝/金/任意色相，又避免
   半透明、发灰的窗口。
   内部内容（差异行、命令执行、工具 IO）则跟随 DSH 官方浅/深色代码块配色：
   深色近黑灰、浅色近白灰，并配对应前景色，文字不会与背景糊在一起。

   派生变量声明在 body 而不是 :root：官方 DSH 主题（以及皮肤中心注入的
   描述符）把 --dsw-alias-* token 声明在 body 上。声明在 :root 的 var()
   会在根元素解析，而根元素上没有那些 body 级 token，于是所有表面都会静默保留
   字面 fallback、永远不跟随主题。声明在 body 上则与定义 token 的元素相同，
   解析得到主题颜色（对把 token 定义在根上的皮肤同样有效，因为 body 会继承）。 */
body {
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  /* 深色外观：中性不透明底层，外壳色相来自主题自己的表面 token
   （女仆皮肤下是蓝色、官方主题下是灰色、其它主题是各自色相）。 */
  --did-shell-base: #101216;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  /* 抬升表面（设置弹窗）使用主题的 layer-2 表面，而不是
   --dsw-alias-bg-overlay：官方深色主题里 overlay token 是给遮罩用的中灰
   （约 #61666b），用它填充弹窗会显得发白/发灰。 */
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #1a1c22);
  /* 内部内容使用官方深色代码块配色，而不是主题色 */
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
  /* 浅色外观：中性近白底层，外壳色相同样来自主题自己的浅色表面 token。 */
  --did-shell-base: #ffffff;
  --did-shell-tint: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-shell-tint-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-dialog-surface: var(--dsw-alias-bg-layer-1, #f4f6f9);
  /* 内部内容使用官方浅色代码块配色 */
  --did-io-bg: #f8f9fb;
  --did-io-fg: #1b1c1e;
  --did-io-muted: #6a7280;
  --did-io-border: rgba(15, 17, 21, 0.12);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 18%, #ffffff);
  --did-accent: var(--dsw-alias-brand-primary, #5686fe);
}
/* ---- 每类卡片的“外壳 / 内部”配色覆盖 --------------------------------
   由设置面板写到每张已渲染卡片上；这里的值只覆盖该卡片的文档级外观变量。 */
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
/* ---- 增强风格平铺命令执行行（bash / pwsh / win_bash） ---- */
.enhanced-tool {
  --enhanced-mono: var(--dsw-font-markdown-code-block-small, 12px/18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  display: flex;
  flex-direction: column;
  /* 头部与 IO 面板之间不留 gap：IN 状态条必须直接顶到标题条，中间不能有空白带。
   间距由头部的 padding 承担。 */
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
/* 有内容的卡片：标题文字下方保留呼吸空间，但 IO 面板及其状态条仍紧贴标题条。 */
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
/* 状态点呼吸：与 IN/OUT 色条共用 1.2s 周期与同一相位变量（--did-pulse-phase），
   保证同一张卡片的圆点和色条同频同相；圆点仍是透明度呼吸，色条是描边颜色呼吸，
   两者视觉效果不同，只是节奏对齐。不同卡片的相位由 motion.js 按 callId 错开。 */
.enhanced-tool[data-state='running'] .enhanced-dot,
.enhanced-tool[data-state='preparing'] .enhanced-dot { background: var(--dsw-alias-brand-primary); animation: dsh-inline-diff-pulse 1.2s ease-in-out infinite; animation-delay: var(--did-pulse-phase, 0ms); }
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
  /* 右内边距为 0：下面的滚动容器一直延伸到卡片右边缘，滚动条贴着边框（与差异
   卡片一致）；视觉留白由滚动内容自己承担。 */
  padding: 8px 0 8px 7.5px;
  border-left: 2.5px solid color-mix(in srgb, var(--did-section-bar, var(--dsw-alias-label-tertiary)) 70%, transparent);
}
/* IN 与 OUT 各自拥有状态条，画成分区的左边框，这样它能沿着卡片底部圆角走而不是
   被圆角裁掉：IN 从标题条向下到 IN/OUT 发丝线，OUT 从发丝线沿卡片曲线一直到
   底边。发丝线是唯一的分隔物，两条状态条之间不需要额外空白。 */
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
/* IN / OUT 各自按自己的状态决定是否呼吸（互不影响）；呼吸周期与卡片状态点一致，
   并使用同一张卡片上的相位变量，使同一卡片的圆点与色条同频同相。 */
.enhanced-section[data-state='running'],
.enhanced-section[data-state='preparing'] {
  animation: dsh-inline-diff-bar-pulse 1.2s ease-in-out infinite;
  animation-delay: var(--did-pulse-phase, 0ms);
}
/* 每个分区一个独立滚动区（IN 与 OUT 各自拥有）。容器延伸到卡片右边缘，让滚动条
   与边框齐平；padding-right 让代码文字不压到滚动条上。 */
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
  /* 代码默认文字颜色跟随内部配色/外观（浅色内层 = 深色文字，深色内层 = 浅色
   文字），而不是跟随外壳前景色。 */
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

/* ---- 侧边栏底部启动按钮 ---- */
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

/* ---- 设置面板 / 设置页 / 设置弹窗 ---- */
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
/* 原创声明（设置页 + 设置弹窗）。醒目但克制：品牌色淡染表面 + 左侧强调竖条；
   刻意不用红/绿，因为这两种颜色仍保留给删除/新增差异标记。 */
.did-originality {
  margin: 12px 0 2px;
  padding: 10px 14px 11px;
  border: 0.5px solid color-mix(in srgb, var(--did-accent) 38%, var(--did-border-1));
  border-inline-start: 3px solid var(--did-accent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--did-accent) 8%, var(--did-surface-1));
  color: var(--did-fg-secondary);
}
.did-originality-title {
  margin-bottom: 3px;
  color: var(--did-fg-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 19px;
}
.did-originality-body {
  font-size: 12px;
  line-height: 18px;
  /* 声明里含一个很长的仓库 URL，必须换行而不是把面板撑宽（窄弹窗/窄页面）。 */
  overflow-wrap: anywhere;
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
/* 弹窗头部横幅：标题、说明与关闭按钮固定；下方滚动区是唯一滚动元素，滚动条
   不会穿过横幅，圆角弹窗边缘会裁掉它而不是让它溢出。 */
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
  /* 右内边距让滚动条稍微内缩在圆角边缘里，而不是紧贴（并显得溢出）边框。 */
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
  /* 比宿主发丝线略粗，让卡片边缘看起来是一块真实表面；下面的色行仍会一直
   铺到这条边。 */
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
/* 文件修改卡片的状态点：与命令/工具卡片共用 1.2s 呼吸周期；相位取卡片根节点上的
   --did-pulse-phase（由 motion.js 按 callId 派生），不同卡片互相错开。 */
.did-state[data-state='running'] .did-dot, .did-state[data-state='preparing'] .did-dot { animation: dsh-inline-diff-pulse 1.2s ease-in-out infinite; animation-delay: var(--did-pulse-phase, 0ms); }
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
/* 故意不用原生 disabled 按钮：它必须仍能吞掉点击，让卡片头（折叠开关）永远
   收不到这次点击。 */
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
  /* 紧凑行号槽：两列行号仍保持等宽数字，但代码文字离卡片边缘更近，不再隔着一大段
   空白行号槽才开始。 */
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
/* 在变更行上强化对应关系：属于改动那一侧的行号槽染成该侧颜色
   （删除行 → 旧行号，新增行 → 新行号）。 */
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

/* 词/字符级改动片段：比整行级的洗色更深一层。 */
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

/* ---- 根级浮层 / 对比弹窗 ---- */

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

/* 修改前/后栏头现在是弹窗头部的一部分（在滚动区之外），因此独占一行，永远不会
   与正文滚动条抢空间；也不再需要 sticky 定位或额外的层叠层级。 */
.did-panes-head { flex: none; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: var(--did-dialog-surface); border-bottom: 0.5px solid var(--did-border-2); }
.did-pane-label { padding: 5px var(--did-inset-x); color: var(--did-fg-secondary); font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em; }
.did-pane-label + .did-pane-label { border-left: 0.5px solid var(--did-border-1); }

/* hunk 头吸顶于滚动区顶部：修改前/后栏头在正常流里位于该滚动区上方，因此
   hunk 头永远不可能盖住它。 */
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

/* ---- 设置页：支持的语言列表 --------------------------------------------
   这里只放布局外壳；徽章外观本身是语法高亮样式表里共享的 .did-lang 样式，
   因此设置页列表与卡片头徽章外观完全一致。 */
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
