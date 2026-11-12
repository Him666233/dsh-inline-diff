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
  /* 强制深色外壳时，表面底色默认使用中性深色而不是主题 token：浅色外观（以及
     第三方浅色主题）下 --dsw-alias-bg-layer-* 是浅色，用主题 token 会把「深色
     外壳」做成白底 + 浅色文字（不可读）。下面的外观作用域规则在深色外观下再把
     主题的深色表面色相接回来，兼顾「强制基调」与「跟随主题」。 */
  --did-surface-1: #1a1c22;
  --did-surface-2: #202329;
  --did-surface-elevated: #202329;
  --did-fg-primary: #eef1f8;
  --did-fg-secondary: #c3cade;
  --did-fg-tertiary: #94a1bc;
  --did-border-1: rgba(151, 169, 216, 0.24);
  --did-border-2: rgba(151, 169, 216, 0.42);
  --did-seg-bg: var(--dsw-alias-bg-layer-2, #202329);
  --did-seg-active: color-mix(in srgb, var(--dsw-alias-brand-primary, #5686fe) 30%, #1e2128);
}
/* 强制外壳色调与当前外观一致时，沿用主题自己的表面色相（第三方主题也能带出自己的
   蓝/紫/金等色调）；外观相反时保持上面的中性强制色，保证文字对比度不被浅色 token
   冲掉。 */
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='dark'] {
  --did-surface-1: var(--dsw-alias-bg-layer-1, #1a1c22);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #202329);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #202329);
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='light'] {
  --did-surface-1: var(--dsw-alias-bg-layer-1, #f4f6f9);
  --did-surface-2: var(--dsw-alias-bg-layer-2, #edf0f4);
  --did-surface-elevated: var(--dsw-alias-bg-layer-2, #edf0f4);
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

/* ============================================================================
   ---- 外观效果：原生 / 磨砂玻璃 / 液态玻璃 ----
   ----------------------------------------------------------------------------
   本区段是「外观效果」的唯一 CSS 实现，**只追加、不改上面的任何旧规则**：
   所有规则都以 [data-fx='glass'|'liquid'] / [data-liquid-mode] / [data-fx-root='true']
   为前缀，因此全 native（默认）时一条都不会命中，1.3.0 的既有外观零回归。

   DOM 契约（surfaces.js 与 .team/glass-contract.md）：
     · 每个可视表面元素带 data-fx（native/glass/liquid 三值都写）、data-fx-surface；
       liquid 时另有 data-liquid-mode="clear|frosted"；
       内联变量 --did-fx-alpha（0.05–1，无单位）与 --did-fx-blur（px）。
     · 卡片根 .did-card / .enhanced-tool 在任一子表面非 native 时带 data-fx-root="true"。
     · 9 个表面：fileCardHeader / fileCardBody / diffModal / commandHeader /
       commandIO / toolHeader / toolIO / readRangeChip / settingsPanel。

   实现要点：
     1) 材质画在**子表面自己**身上（头部 / IO / 差异区 / 弹窗 / 徽标）。卡片根在
        fx-root 上下文里交出底色与边框，否则子表面的 backdrop-filter 只能看到卡片
        自己的不透明底，看不到背后的页面壁纸（§4）；
     2) fx-root 上下文里的 native 子表面把原底色补回来（§4.2），保证“一半玻璃
        一半原生”自然。无 data-fx-root 时一律命中不到这些规则；
     3) 液态玻璃的折射使用 Chromium 的 backdrop-filter: url(#…)（研究结论：折射
        必须与 blur 写在**同一条** backdrop-filter 声明里，嵌套 backdrop-filter 会被
        忽略；@supports 对 url() 会误报，所以由 index.jsx 启动时探测并给 <html>
        加 .did-glass-refract-ok 门控类）。不支持折射的引擎自动退回“只有模糊”的材质；
     4) 不支持 backdrop-filter 的引擎（@supports not …）退回更高不透明度的半透明
        底色，保证可读；prefers-reduced-transparency / forced-colors 同理降级（§7）；
     5) 性能：backdrop-filter 只挂在真正 glass/liquid 的表面元素上，不加
        will-change；卡片根只画一条 0.5px 轮廓（::after），不做模糊。

   主题：材质底色全部来自现有 --did-* token（--did-surface-1 / --did-io-bg /
   --did-dialog-surface / --did-surface-elevated），高光/内阴影按深浅外观与每张卡片
   自己的外壳色调（data-shell-tone）切换；文字颜色一律不动，靠半透明底色保证可读。
   ========================================================================== */

/* ---- 外观效果 1. 派生变量（材质参数） --------------------------------- */
[data-fx] {
  /* 用户可调项：markup 以内联 style 写入；这里给兜底值，避免纯 DOM 侧
     （read-range-dom.js）漏写时 var() 解析失败把整条声明丢掉。 */
  --did-fx-alpha: 0.55;
  --did-fx-blur: 14px;

  /* 系数：磨砂玻璃 = 1:1；液态玻璃两种模式在 §1.2 覆盖 */
  --did-fx-alpha-k: 1;
  --did-fx-blur-k: 1;

  /* 最终生效的透明度（0.02–1）与模糊半径 */
  --did-fx-alpha-eff: clamp(0.02, calc(var(--did-fx-alpha) * var(--did-fx-alpha-k)), 1);
  --did-fx-blur-eff: calc(var(--did-fx-blur) * var(--did-fx-blur-k));
  /* 可读性底衬：代码类表面额外叠一小段固定浓度。公式 α' = α + boost × (1 − α)
     随滑杆线性收敛（α=1 时仍是 1、α 越小增补越多），所以滑杆始终有效，只是避免
     用户把透明度拉到很低时大片代码直接糊在壁纸上。逐表面取值见本节下方。 */
  --did-fx-alpha-boost: 0;
  --did-fx-alpha-final: calc(var(--did-fx-alpha-eff) + var(--did-fx-alpha-boost) * (1 - var(--did-fx-alpha-eff)));

  /* backdrop-filter 调色：base 是“原始值”，k 是模式/外观的乘数，分开声明是为了
     让浅色外观覆盖 base 时不会把 clear/frosted 的相对差异冲掉。 */
  --did-fx-sat-base: 1.6;
  --did-fx-bright-base: 1.04;
  --did-fx-sat-k: 1;
  --did-fx-bright-k: 1;
  --did-fx-sat: calc(var(--did-fx-sat-base) * var(--did-fx-sat-k));
  --did-fx-bright: calc(var(--did-fx-bright-base) * var(--did-fx-bright-k));

  /* 材质底色来源：外壳类表面用主题表面色，代码/IO 类表面在下面换成代码块底色。
     用 rgb(from …) 相对色语法在“用户透明度”上重新取 alpha，因此主题 token 自带
     的透明度不会叠加。 */
  --did-fx-tint-base: var(--did-surface-1);

  /* 深浅外观共用的高光/内阴影色板（浅色外观在 §1.3 覆盖） */
  --did-fx-sheen-strong: rgb(255 255 255 / 0.55);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.16);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.30);
  --did-fx-shade: rgb(0 0 0 / 0.20);
  --did-fx-hairline: rgb(255 255 255 / 0.13);
  --did-fx-rim-k: 1;
  --did-fx-rim-opacity: min(1, calc(0.95 * var(--did-fx-rim-k)));
  --did-fx-noise-opacity: 0.12;

  /* 细色散：液态玻璃边缘极轻的冷暖分色（真正色散做不到，用两条 1px 半透明线近似） */
  --did-fx-fringe-a: rgb(130 210 255 / 0.10);
  --did-fx-fringe-b: rgb(255 150 210 / 0.08);

  /* 材质的多层背景（glass / liquid 各一套；浅色外观在 §1.3 换更淡的一套） */
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.055) 0%, rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0) 42%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.06 + 0.12 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 56%),
    linear-gradient(112deg, rgb(255 255 255 / 0.10) 0%, rgb(255 255 255 / 0.028) 30%, rgb(255 255 255 / 0) 56%),
    linear-gradient(180deg, rgb(255 255 255 / 0.05) 0%, rgb(255 255 255 / 0) 62%);

  /* 单独浮层（差异弹窗 / 设置面板 / 行范围徽标）的投影；卡片内子表面不投影，
     保持与原生一致的外轮廓。 */
  --did-fx-outer: 0 0 0 0 transparent;
  --did-fx-drop: rgb(0 0 0 / 0.22);
}

/* 材质底色来源：差异区 / IO 用官方代码块底色；弹窗用弹层底色；设置面板用抬升表面。 */
[data-fx-surface='fileCardBody'],
[data-fx-surface='commandIO'],
[data-fx-surface='toolIO'] { --did-fx-tint-base: var(--did-io-bg); }
[data-fx-surface='diffModal'] { --did-fx-tint-base: var(--did-dialog-surface); }
[data-fx-surface='settingsPanel'] { --did-fx-tint-base: var(--did-surface-elevated); }
/* 逐表面的可读性底衬：代码/IO 区最需要（大片文字直接压在壁纸上），头部等小面积
   元素只需要一点点，徽标更小、更要“浮”起来所以稍高。 */
[data-fx-surface='fileCardHeader'],
[data-fx-surface='commandHeader'],
[data-fx-surface='toolHeader'] { --did-fx-alpha-boost: 0.06; }
[data-fx-surface='fileCardBody'],
[data-fx-surface='commandIO'],
[data-fx-surface='toolIO'] { --did-fx-alpha-boost: 0.22; }
[data-fx-surface='diffModal'] { --did-fx-alpha-boost: 0.08; }
[data-fx-surface='settingsPanel'] { --did-fx-alpha-boost: 0.2; }
[data-fx-surface='readRangeChip'] { --did-fx-alpha-boost: 0.34; }
/* 卡片底部 foot 虽然也归 fileCardBody 表面，但原底色是外壳色，保持外壳色调。 */
.did-card > .did-foot[data-fx-surface='fileCardBody'] { --did-fx-tint-base: var(--did-surface-1); }
/* “与外壳一致”的内部配色把 --did-io-bg 设成 transparent；相对色语法从 transparent
   取通道会退化成黑色，浅色外观里会出现黑玻璃。这种组合改回外壳色做材质。 */
[data-inner-tone='same'] [data-fx-surface='fileCardBody'],
[data-inner-tone='same'] [data-fx-surface='commandIO'],
[data-inner-tone='same'] [data-fx-surface='toolIO'] { --did-fx-tint-base: var(--did-surface-1); }

/* 外壳色调与当前外观相反时（浅色外观里把卡片外壳设为深色，或深色外观里设为浅色），
   头部是一小块半透明材质，13px 标题在页面背景上容易掉到 WCAG AA 以下；把这一情形
   的头部底衬透明度提高一档，保证深底浅字/浅底深字仍然清晰。用户手动调低的透明度
   仍按 alpha 系数生效，这里只做固定比例的可读性补偿。 */
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='fileCardHeader'],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='commandHeader'],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx-surface='toolHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='fileCardHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='commandHeader'],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx-surface='toolHeader'] {
  --did-fx-alpha-boost: 0.32;
}

/* 单独浮层的投影（与原生 1.3.0 的弹窗阴影保持同一观感）。 */
[data-fx-surface='diffModal'],
[data-fx-surface='settingsPanel'] {
  --did-fx-outer: 0 18px 60px color-mix(in srgb, var(--did-fg-primary) 12%, transparent);
}
[data-fx-surface='settingsPanel'].did-settings-page {
  --did-fx-outer: 0 12px 36px -18px color-mix(in srgb, var(--did-fg-primary) 18%, transparent);
}
[data-fx-surface='readRangeChip'] { --did-fx-outer: 0 1px 2px var(--did-fx-drop); }

/* ---- 外观效果 1.2. 液态模式系数与玻璃参数 ----------------------------- */
[data-fx='liquid'] {
  --did-fx-sat-base: 1.8;
  --did-fx-bright-base: 1.05;
}
/* frosted（带一点模糊）= 用户模糊 ×1、材质更浓稠、饱和度略收（研究建议 1.15 / 0.95） */
[data-fx='liquid'][data-liquid-mode='frosted'] {
  --did-fx-alpha-k: 1.15;
  --did-fx-blur-k: 1;
  --did-fx-sat-k: 0.95;
}
/* clear（完全通透）= 模糊 ×0.12（14px → 1.7px）、材质更薄、饱和度更高（接近透镜） */
[data-fx='liquid'][data-liquid-mode='clear'] {
  --did-fx-alpha-k: 0.5;
  --did-fx-blur-k: 0.12;
  --did-fx-sat-k: 1.14;
  --did-fx-bright-k: 0.97;
  --did-fx-rim-k: 1.12;
  --did-fx-noise-opacity: 0.08;
}

/* ---- 外观效果 1.3. 浅色外观 / 每张卡片外壳色调的材质色板 --------------
   选择器同时覆盖两种情况：
     · body[data-dsh-inline-diff-appearance='light'] —— 宿主当前浅色外观；
     · [data-shell-tone='light'|'dark'] —— 设置里为单张卡片指定的外壳色调。
   顺序保证：卡片自己的色调覆盖宿主外观（浅色外观里的深色外壳卡片仍用白高光）。 */
body[data-dsh-inline-diff-appearance='light'] [data-fx],
body[data-dsh-inline-diff-appearance='light'] [data-fx-surface],
[data-shell-tone='light'] [data-fx],
[data-shell-tone='light'][data-fx] {
  --did-fx-sat-base: 1.35;
  --did-fx-bright-base: 1;
  --did-fx-sheen-strong: rgb(255 255 255 / 0.9);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.55);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.7);
  --did-fx-shade: rgb(30 40 60 / 0.12);
  --did-fx-hairline: rgb(20 24 32 / 0.14);
  --did-fx-fringe-a: rgb(90 160 220 / 0.07);
  --did-fx-fringe-b: rgb(220 120 170 / 0.05);
  --did-fx-noise-opacity: 0.09;
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.30) 0%, rgb(255 255 255 / 0) 60%),
    linear-gradient(112deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0) 45%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.18 + 0.18 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.34) 0%, rgb(255 255 255 / 0.10) 32%, rgb(255 255 255 / 0) 58%),
    linear-gradient(180deg, rgb(255 255 255 / 0.22) 0%, rgb(255 255 255 / 0) 62%);
  --did-fx-drop: rgb(30 40 60 / 0.22);
}
[data-shell-tone='dark'] [data-fx],
[data-shell-tone='dark'][data-fx] {
  --did-fx-sat-base: 1.8;
  --did-fx-bright-base: 1.05;
  --did-fx-sheen-strong: rgb(255 255 255 / 0.55);
  --did-fx-sheen-mid: rgb(255 255 255 / 0.16);
  --did-fx-sheen-soft: rgb(255 255 255 / 0.30);
  --did-fx-shade: rgb(0 0 0 / 0.20);
  --did-fx-hairline: rgb(255 255 255 / 0.13);
  --did-fx-fringe-a: rgb(130 210 255 / 0.10);
  --did-fx-fringe-b: rgb(255 150 210 / 0.08);
  --did-fx-noise-opacity: 0.12;
  --did-fx-glass-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.055) 0%, rgb(255 255 255 / 0) 58%),
    linear-gradient(112deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0) 42%);
  --did-fx-bloom: rgb(255 255 255 / calc(0.06 + 0.12 * var(--did-fx-alpha-final)));
  --did-fx-liquid-image:
    radial-gradient(120% 90% at 8% -28%, var(--did-fx-bloom), rgb(255 255 255 / 0) 56%),
    linear-gradient(112deg, rgb(255 255 255 / 0.10) 0%, rgb(255 255 255 / 0.028) 30%, rgb(255 255 255 / 0) 56%),
    linear-gradient(180deg, rgb(255 255 255 / 0.05) 0%, rgb(255 255 255 / 0) 62%);
  --did-fx-drop: rgb(0 0 0 / 0.22);
}

/* ---- 外观效果 2. 磨砂玻璃（glass） ------------------------------------ */
[data-fx='glass'] {
  position: relative;
  isolation: isolate;
  /* 三层声明是逐级增强的回退链：极旧浏览器只拿实体底色（至少可读），支持
     color-mix 的拿半透明材质，支持相对色语法的按滑杆透明度精确取 alpha。
     （相对色语法可以直接用 clamp() 得到的数字当 alpha，不受 color-mix 百分比限制。） */
  background-color: var(--did-fx-tint-base);
  background-color: color-mix(in srgb, var(--did-fx-tint-base) calc(var(--did-fx-alpha-final) * 100%), transparent);
  background-color: rgb(from var(--did-fx-tint-base) r g b / var(--did-fx-alpha-final));
  background-image: var(--did-fx-glass-image);
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright));
  backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright));
  /* 细高光边框 + 玻璃厚度：顶部 1px 高光、底部 1px 暗边、四周 0.5px 发丝线，
     再叠两条内侧的大半径柔光，让薄片看起来有厚度。 */
  box-shadow:
    inset 0 0 0 0.5px var(--did-fx-hairline),
    inset 0 1px 0 0 var(--did-fx-sheen-mid),
    inset 0 -1px 0 0 var(--did-fx-shade),
    inset 0 14px 26px -22px var(--did-fx-sheen-soft),
    inset 0 -20px 30px -26px var(--did-fx-shade),
    var(--did-fx-outer);
}
/* 头部是可点击的折叠开关，旧规则 .did-head:hover 用 background 简写覆盖底色
   （还会把 background-image 一起清掉）；玻璃头必须把材质原样补回去，
   否则悬停瞬间会闪成全透明。 */
.did-head[data-fx='glass']:hover,
.did-head[data-fx='liquid']:hover,
.enhanced-head[data-fx='glass']:hover,
.enhanced-head[data-fx='liquid']:hover {
  background-color: rgb(from var(--did-fx-tint-base) r g b / min(1, calc(var(--did-fx-alpha-final) + 0.06)));
  background-image: var(--did-fx-glass-image);
}
.did-head[data-fx='liquid']:hover,
.enhanced-head[data-fx='liquid']:hover { background-image: var(--did-fx-liquid-image); }

/* ---- 外观效果 3. 液态玻璃（liquid） ----------------------------------- */
/* 材质本体：半透明底色 + 三层背景（左上镜面泛光 / 斜向光泽 / 上沿提亮），
   backdrop-filter 负责模糊与调色；折射在 §3.2 的门控类下追加到同一条声明里。 */
[data-fx='liquid'] {
  position: relative;
  isolation: isolate;
  background-color: var(--did-fx-tint-base);
  background-color: color-mix(in srgb, var(--did-fx-tint-base) calc(var(--did-fx-alpha-final) * 100%), transparent);
  background-color: rgb(from var(--did-fx-tint-base) r g b / var(--did-fx-alpha-final));
  background-image: var(--did-fx-liquid-image);
  background-repeat: no-repeat;
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02);
  backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02);
  /* 边缘 specular + 厚度内阴影 + 极轻色散（色散变量在 §1 定义、浅色外观在 §1.3 覆盖）。 */
  box-shadow:
    inset 0 0.5px 0 0 var(--did-fx-sheen-strong),
    inset 0 -0.5px 0 0 var(--did-fx-sheen-mid),
    inset 0.5px 0 0 0 var(--did-fx-sheen-mid),
    inset -0.5px 0 0 0 var(--did-fx-sheen-mid),
    inset 0 1px 0 0 var(--did-fx-fringe-a),
    inset 0 -1px 0 0 var(--did-fx-fringe-b),
    inset 0 2px 4px -2px var(--did-fx-shade),
    inset 0 -28px 36px -32px var(--did-fx-sheen-soft),
    inset 0 24px 32px -34px var(--did-fx-shade),
    var(--did-fx-outer);
}
/* 噪声层：消掉“塑料感”与 8bit 色带。负 z-index + isolation 让它在材质底色之上、
   内容之下，因此不需要改动任何子元素的层级（也绝不会拦截点击）。 */
[data-fx='liquid']::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: var(--did-fx-noise-opacity);
  mix-blend-mode: overlay;
}
/* 边缘 specular 环：conic 渐变 + mask 挖空成 1px 描边。负 z-index 让它压在材质
   之上、内容之下；pointer-events:none 保证不拦点击。 */
[data-fx='liquid']::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: conic-gradient(from 215deg at 50% 50%,
      rgb(255 255 255 / 1)    0deg,
      rgb(255 255 255 / 0.28) 38deg,
      rgb(255 255 255 / 0.05) 112deg,
      rgb(255 255 255 / 0.5)  172deg,
      rgb(255 255 255 / 0.06) 232deg,
      rgb(255 255 255 / 0.62) 296deg,
      rgb(255 255 255 / 1)    360deg);
  opacity: var(--did-fx-rim-opacity);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
}

/* ---- 外观效果 3.2. 折射（Chromium 专有，门控启用） --------------------
   结论来自 .team/liquid-glass/NOTES.md：
     · Chromium 支持 backdrop-filter 里的 url(#svgFilter)（真·位移折射）；
     · 折射必须与 blur/saturate 写在**同一条** backdrop-filter 里（嵌套会被忽略）；
     · 一旦 url() 不被识别，整条 backdrop-filter 失效（连 blur 都没了），
       所以只用 index.jsx 探测通过后挂在 <html> 上的 .did-glass-refract-ok 门控；
     · 挡位按表面尺寸选：徽标 sm（scale 9）、卡片/弹窗默认 md（scale 18）、
       clear 模式 lg（scale 30，透镜扭曲更明显）。
   不支持的引擎（Safari/Firefox/未探测通过）自然停在“只有模糊”的材质上。 */
.did-glass-refract-ok [data-fx='liquid'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-md);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-md);
}
.did-glass-refract-ok [data-fx='liquid'][data-liquid-mode='clear'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-lg);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-lg);
}
/* 小徽标用 sm 挡位：小尺寸表面用大位移会被“吃掉”边缘（研究建议模糊 ≤10px）。
   选择器与上面的 clear 规则同权重、放在其后，保证徽标在 clear 模式下也用 sm 而不是 lg。 */
.did-glass-refract-ok [data-fx='liquid'][data-fx-surface='readRangeChip'] {
  -webkit-backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-sm);
          backdrop-filter: blur(var(--did-fx-blur-eff)) saturate(var(--did-fx-sat)) brightness(var(--did-fx-bright)) contrast(1.02) url(#did-glass-refract-sm);
}

/* ---- 外观效果 4. 卡片根的 fx-root 上下文 ------------------------------
   卡片根交出底色与边框，让子表面的 backdrop-filter 能采到页面壁纸；轮廓由
   一条 0.5px 的覆盖环（::after）负责，颜色沿用卡片原边框色，所以“全玻璃卡片”
   仍然有一圈完整、贴圆角的发丝线。 */
[data-fx-root='true'] {
  --did-fx-card-ring: color-mix(in srgb, var(--did-border-2) 45%, var(--did-border-1));
}
.did-card[data-fx-root='true'],
.enhanced-tool[data-fx-root='true'] {
  position: relative;
  isolation: isolate;
  background-color: transparent;
  background-image: none;
  /* border-color 置透明而不是删边框：宽度保留，布局与 native 完全一致。 */
  border-color: transparent;
}
.did-card[data-fx-root='true']::after,
.enhanced-tool[data-fx-root='true']::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 8;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 0 0 0.5px var(--did-fx-card-ring);
}
/* 出错态沿用卡片原本的红边语义。 */
.did-card[data-fx-root='true'][data-state='error'] {
  --did-fx-card-ring: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--did-border-1));
}
/* .enhanced-tool 顶部有 4px 内边距（原生时由卡片自己的不透明底填充）；fx-root 下
   卡片根透明，这 4px 会透出壁纸形成一条“断层”。把这段内边距移进头部，让材质
   覆盖到卡片顶边，总高度不变（折叠态同理把底部内边距移进头部）。 */
.enhanced-tool[data-fx-root='true'] { padding-top: 0; }
.enhanced-tool[data-fx-root='true'] > .enhanced-head { padding-top: 5px; }
.enhanced-tool[data-fx-root='true'][data-body='false'] { padding-bottom: 0; }
.enhanced-tool[data-fx-root='true'][data-body='false'] > .enhanced-head { padding-bottom: 5px; }

/* ---- 外观效果 4.2. fx-root 里 native 子表面补回原底色 ------------------
   只补“原本由卡片根提供”的那一层：
     · 头部（.did-head / .enhanced-head）原本透明，依赖卡片根的
       --did-shell-base + --did-surface-1 渐变；
     · 差异内容区 / IO 面板原本就是 --did-io-bg，底部 foot 是 --did-surface-1，
       这里显式写回，保证“一半玻璃一半原生”时边界自然、底色不被半透明层影响。 */
.did-card[data-fx-root='true'] > .did-head[data-fx='native'] {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
}
/* 原生头在 fx-root 下仍要保留悬停高亮：旧 .did-head:hover 只叠 4% 前景色，
   在透明卡片根上会变成“透出壁纸”，所以这里把底色和悬停色一起补回来。 */
.did-card[data-fx-root='true'] > .did-head[data-fx='native']:hover {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(
    color-mix(in srgb, var(--did-fg-primary) 5%, var(--did-surface-1)),
    color-mix(in srgb, var(--did-fg-primary) 5%, var(--did-surface-1)));
}
.did-card[data-fx-root='true'] > .did-body[data-fx='native'] { background: var(--did-io-bg); }
.did-card[data-fx-root='true'] > .did-foot[data-fx='native'] { background: var(--did-surface-1); }
.enhanced-tool[data-fx-root='true'] > .enhanced-head[data-fx='native'] {
  background-color: var(--did-shell-base);
  background-image: linear-gradient(var(--did-surface-1), var(--did-surface-1));
}
.enhanced-tool[data-fx-root='true'] > .enhanced-io[data-fx='native'] { background: var(--did-io-bg); }
/* 内部配色 =「与外壳一致」时 --did-io-bg 是 transparent；在 fx-root 卡片里卡片根
   已经透明，native 子表面必须补回外壳表面色，否则会直接透出页面背景（混合模式
   “玻璃头部 + 原生内容区”会露出壁纸）。 */
.did-card[data-fx-root='true'][data-inner-tone='same'] > .did-body[data-fx='native'],
.enhanced-tool[data-fx-root='true'][data-inner-tone='same'] > .enhanced-io[data-fx='native'] {
  background: var(--did-surface-1);
}

/* ---- 外观效果 4.3. 卡片内材质表面的圆角贴合 ----------------------------
   卡片根有 --dsw-radius-lg 圆角 + overflow:hidden；材质表面自己再取一次首/尾
   圆角，边缘高光与色散环才能沿圆角走（否则伪元素描边是直角、在四个角被父级
   裁断）。中间位置的表面（差异 body / IO）保持直角，与原生一致。
   只作用于非 native 表面：native 子表面继续完全由父级裁剪，保证零视觉差异。 */
.did-card > [data-fx='glass']:first-child,
.did-card > [data-fx='liquid']:first-child,
.enhanced-tool > [data-fx='glass']:first-child,
.enhanced-tool > [data-fx='liquid']:first-child {
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
}
.did-card > [data-fx='glass']:last-child,
.did-card > [data-fx='liquid']:last-child,
.enhanced-tool > [data-fx='glass']:last-child,
.enhanced-tool > [data-fx='liquid']:last-child {
  border-end-start-radius: inherit;
  border-end-end-radius: inherit;
}

/* ---- 外观效果 5. 玻璃/液态表面内部的吸顶横条 --------------------------
   差异卡片与放大弹窗里的 hunk 表头（.did-bar）原本是不透明的
   “品牌色 9% + 代码底色”；当承载它的内容区是玻璃时把它改成半透明，
   否则玻璃材质会被这条横条整块盖住。其它内部小元素（行号、gap、notice）
   本来就是半透明色，不需要处理。 */
.did-body[data-fx='glass'] .did-bar,
.did-body[data-fx='liquid'] .did-bar,
.did-dialog[data-fx='glass'] .did-bar,
.did-dialog[data-fx='liquid'] .did-bar {
  /* 底色取 --did-fx-tint-base（内部配色 = “与外壳一致”时它已被换成外壳色，
     避免 --did-io-bg: transparent 被相对色语法解析成黑色）。 */
  background: color-mix(in srgb,
    var(--dsw-alias-brand-primary) 9%,
    rgb(from var(--did-fx-tint-base) r g b / 0.74));
}

/* ---- 外观效果 6. 单独浮层：差异弹窗 / 设置面板 / 行范围徽标 ------------ */
/* 差异弹窗（.did-dialog）整窗即材质面：头部/底部/栏头原本是不透明外壳色，
   现在让材质透出来；差异正文区保留一层 58% 的代码底色作为可读性底衬，
   避免大片代码直接压在壁纸模糊层上。 */
.did-dialog[data-fx='glass'] > .did-dialog-head,
.did-dialog[data-fx='liquid'] > .did-dialog-head,
.did-dialog[data-fx='glass'] > .did-panes-head,
.did-dialog[data-fx='liquid'] > .did-panes-head,
.did-dialog[data-fx='glass'] > .did-dialog-foot,
.did-dialog[data-fx='liquid'] > .did-dialog-foot {
  background: transparent;
}
.did-dialog[data-fx='glass'] > .did-dialog-body,
.did-dialog[data-fx='liquid'] > .did-dialog-body {
  background: color-mix(in srgb, var(--did-io-bg) 58%, transparent);
}
/* 设置弹窗（.did-settings-dialog）内部本来就是透明的，只需保证横幅、滚动区与
   身体不覆盖材质；.did-setting 的分隔线与小控件保持原样。 */
.did-settings-dialog[data-fx='glass'] > .did-settings-banner,
.did-settings-dialog[data-fx='liquid'] > .did-settings-banner,
.did-settings-dialog[data-fx='glass'] > .did-settings-scroll,
.did-settings-dialog[data-fx='liquid'] > .did-settings-scroll { background: transparent; }
/* 设置页面板（.did-settings-page）原本是通栏内容；挂上材质后给它一点内边距和
   圆角，否则文字会贴着材质边缘。只在非 native 时生效。 */
.did-settings-page[data-fx='glass'],
.did-settings-page[data-fx='liquid'] {
  padding: 16px 18px 22px;
  border-radius: var(--dsw-radius-lg, 16px);
}
/* 读取行范围徽标：inline-flex 的胶囊，材质直接画在它身上，尺寸/内边距保持不变
   （原生行里必须保持原布局不跳动）；文字提高一档亮度保证半透明底上可读。 */
.did-read-range[data-fx='glass'],
.did-read-range[data-fx='liquid'] {
  border-color: color-mix(in srgb, var(--did-border-2) 62%, transparent);
  color: var(--did-fg-secondary);
}

/* ---- 外观效果 6.2. 设置面板里的「外观效果」分组控件 --------------------
   由 settings-fx-ui 在设置面板末尾渲染；这里只做渐进增强的布局与滑杆外观，
   没有本段样式时也能靠既有 .did-setting / .did-seg 等类正常使用。 */
.did-fx-details { margin-top: 12px; }
/* 与 .did-langs-details 共用 summary；这里把标题提亮成一级文字并稍加粗。 */
.did-fx-details > summary {
  margin-top: 4px;
  color: var(--did-fg-primary);
  font-size: 13px;
  font-weight: 600;
}
.did-fx-details[open] > summary { margin-bottom: 6px; }
.did-fx-content { padding-top: 8px; }
.did-fx-desc { margin-top: 6px; }
.did-fx-legend { margin-top: 8px; }
.did-fx-legend > div + div { margin-top: 2px; }
.did-fx-list { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
/* 每行本身是 .did-setting（flex：左文字列 + 右分段控件）。这里**不加** flex-wrap：
   参数行的 max-content 是「两个滑杆 + 液态模式」的整排宽度，一旦允许换行，右侧
   效果分段会被挤到下一行左侧；交给 .did-setting-text（min-width:0）收缩、参数行
   自己内部换行即可，窄屏由 ≤720px 的列布局处理。 */
.did-fx-row { padding: 12px 0; }
/* 参数行：透明度滑杆 + 模糊滑杆（+ 液态模式）自动换行，不再首尾相连。 */
.did-fx-params {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  margin-top: 8px;
}
.did-fx-slider {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--did-fg-tertiary);
  font-size: 11px;
  line-height: 18px;
  white-space: nowrap;
}
.did-fx-range {
  width: 130px;
  height: 18px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: pointer;
}
.did-fx-range:focus-visible { outline: 1px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
/* 数值用等宽数字 + 固定最小宽度，拖动时行宽不抖动。 */
.did-fx-slider-value {
  min-width: 38px;
  color: var(--did-fg-primary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.did-fx-mode { margin-top: 2px; }
@media (max-width: 720px) {
  .did-fx-row { flex-direction: column; align-items: stretch; }
  .did-fx-row .did-setting-control { align-self: flex-start; }
  .did-fx-params { width: 100%; }
  .did-fx-range { width: 120px; }
}

/* ---- 外观效果 7. 降级与无障碍 ---------------------------------------- */
/* 7.1 不支持 backdrop-filter 的引擎：去掉模糊，换成高不透明度的半透明底色。
   这里不需要“玻璃感”，只需要保证文字仍然可读。 */
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    -webkit-backdrop-filter: none;
            backdrop-filter: none;
    background-color: rgb(from var(--did-fx-tint-base) r g b / clamp(0.72, calc(var(--did-fx-alpha-final) + 0.4), 1));
    background-image: var(--did-fx-glass-image);
  }
  [data-fx='liquid']::before,
  [data-fx='liquid']::after { display: none; }
}
/* 7.2 系统“降低透明度”：完全不模糊，材质接近实体（苹果在 same 设置下也是这么做的）。 */
@media (prefers-reduced-transparency: reduce) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
    background-color: rgb(from var(--did-fx-tint-base) r g b / clamp(0.86, calc(var(--did-fx-alpha-final) + 0.34), 1));
  }
  [data-fx='liquid']::before { display: none; }
  [data-fx='liquid']::after { opacity: 0.35; }
}
/* 7.3 强制颜色模式：只保留 1px 边框，去掉装饰性高光与噪声。 */
@media (forced-colors: active) {
  [data-fx='glass'],
  [data-fx='liquid'] {
    background-image: none;
    border: 1px solid CanvasText;
    box-shadow: none;
  }
  [data-fx='liquid']::before,
  [data-fx='liquid']::after { display: none; }
  [data-fx-root='true']::after { display: none; }
}

/* ---- 外观效果 8. 弹窗遮罩的“模糊代理” ---------------------------------
   原因（研究结论，见 .team/liquid-glass/NOTES.md probe5）：Chromium 会忽略嵌套的
   backdrop-filter —— 祖先元素有 backdrop-filter 时，子元素/伪元素的 backdrop-filter
   完全失效。放大弹窗（在 .did-overlay 里）与设置弹窗（在 .did-settings-overlay 里）
   的遮罩层都自带模糊，因此这两个“表面”自身的 blur/折射是惰性的，「模糊」滑杆会
   没有可见变化。

   修复：把弹窗表面（diffModal / settingsPanel）的模糊参数接到遮罩层上——markup 在
   表面非 native 时给遮罩挂 data-fx-backdrop 与 --did-fx-blur（surfaces.js 的
   backdropProxyProps），遮罩按同一个 blur 与 clear/frosted 系数做 backdrop-filter，
   弹窗内部的半透明材质叠在“已模糊的背景”上。于是模糊滑杆对这两个表面同样生效。
   表面为 native 时遮罩不带任何属性，旧外观完全不变。 */
.did-overlay[data-fx-backdrop],
.did-settings-overlay[data-fx-backdrop] {
  --did-fx-backdrop-blur: var(--did-fx-blur, 14px);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 52%, transparent);
  -webkit-backdrop-filter: blur(var(--did-fx-backdrop-blur)) saturate(1.1) brightness(0.92);
          backdrop-filter: blur(var(--did-fx-backdrop-blur)) saturate(1.1) brightness(0.92);
}
/* clear（完全通透）：遮罩也几乎不模糊，让弹窗更像一块通透的液态玻璃。 */
.did-overlay[data-fx-backdrop='liquid'][data-liquid-mode='clear'],
.did-settings-overlay[data-fx-backdrop='liquid'][data-liquid-mode='clear'] {
  --did-fx-backdrop-blur: calc(var(--did-fx-blur, 14px) * 0.12);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 38%, transparent);
}
/* 无障碍降级：降低透明度时遮罩不做模糊（与内部材质的降级保持一致）。 */
@media (prefers-reduced-transparency: reduce) {
  .did-overlay[data-fx-backdrop],
  .did-settings-overlay[data-fx-backdrop] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
    background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  }
}
@media (forced-colors: active) {
  .did-overlay[data-fx-backdrop],
  .did-settings-overlay[data-fx-backdrop] {
    -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
  }
}


/* ---- 外观效果 9. 浅色 / 强制浅色卡片的可读性校正 -----------------------
   用户反馈：浅色外观下卡片边缘的小字（增删统计、行号、旧/新图例、语言徽章、
   底部状态条、轨迹按钮……）看不清，因为 1.3.0 直接使用宿主的 success/error
   token（官方浅色是 #22c55e / #ec1313 这类高饱和色）和三级灰，在白底/浅色玻璃
   上只有 1.8–4.2 的对比度。

   修复：语义文字统一改走 --did-*-ink 变量（默认值仍等于宿主语义色，深色外观
   因此完全不变），浅色外观与「强制浅色外壳」的卡片用混入深色前景的“墨色”，
   小号辅助文字提升到二级前景色；「强制深色外壳」的卡片反过来使用亮色墨。 */
.did-add,
.did-row[data-kind='add'] .did-sign,
.did-row[data-kind='add'] .did-move,
.enhanced-tool[data-variant='command'] .enhanced-kind {
  color: var(--did-add-ink, var(--dsw-alias-state-success-primary));
}
.did-del,
.did-row[data-kind='del'] .did-sign,
.did-row[data-kind='del'] .did-move,
.enhanced-exit,
.enhanced-code[data-error],
.did-error,
.did-settings-error,
.did-state[data-state='error'] {
  color: var(--did-del-ink, var(--dsw-alias-state-error-primary));
}
.did-row[data-kind='add'] .did-num[data-side='new'] {
  color: var(--did-num-add-ink, color-mix(in srgb, var(--dsw-alias-state-success-primary) 60%, var(--did-fg-tertiary)));
}
.did-row[data-kind='del'] .did-num[data-side='old'] {
  color: var(--did-num-del-ink, color-mix(in srgb, var(--dsw-alias-state-error-primary) 60%, var(--did-fg-tertiary)));
}
.did-numhead-label[data-side='old'] { color: color-mix(in srgb, var(--did-del-ink, var(--dsw-alias-state-error-primary)) 72%, var(--did-fg-secondary)); }
.did-numhead-label[data-side='new'] { color: color-mix(in srgb, var(--did-add-ink, var(--dsw-alias-state-success-primary)) 72%, var(--did-fg-secondary)); }

/* 浅色外观（自动色调）：深墨色 + 小字提级。 */
body[data-dsh-inline-diff-appearance='light'] {
  --did-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--did-fg-primary));
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--did-fg-primary));
  --did-num-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 34%, var(--did-fg-primary));
}
/* 强制浅色外壳（无论当前外观）：同样是深墨色（--did-fg-primary 已被色调块改为深色）。 */
[data-shell-tone='light'] {
  --did-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, var(--did-fg-primary));
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--did-fg-primary));
  --did-num-add-ink: color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 34%, var(--did-fg-primary));
}
/* 强制深色外壳：亮色墨（覆盖浅色外观的深墨色；深色外壳上需要浅色小字）。 */
[data-shell-tone='dark'] {
  --did-add-ink: #4ade80;
  --did-del-ink: #f87171;
  --did-num-add-ink: color-mix(in srgb, #4ade80 55%, var(--did-fg-tertiary));
  --did-num-del-ink: color-mix(in srgb, #f87171 55%, var(--did-fg-tertiary));
}
/* 深色外观默认：错误红略微提亮，保证在深色玻璃上达到 AA。 */
body[data-dsh-inline-diff-appearance='dark'] {
  --did-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 70%, var(--did-fg-primary));
  --did-num-del-ink: color-mix(in srgb, var(--dsw-alias-state-error-primary) 55%, var(--did-fg-tertiary));
}
/* 小号辅助文字：浅色外观 / 强制浅色外壳里提升到二级前景色（白底约 6.6）。 */
body[data-dsh-inline-diff-appearance='light'] .did-read-range,
body[data-dsh-inline-diff-appearance='light'] .did-meta,
body[data-dsh-inline-diff-appearance='light'] .did-empty,
body[data-dsh-inline-diff-appearance='light'] .did-lang,
body[data-dsh-inline-diff-appearance='light'] .did-num,
body[data-dsh-inline-diff-appearance='light'] .did-numhead,
body[data-dsh-inline-diff-appearance='light'] .did-bar-range,
body[data-dsh-inline-diff-appearance='light'] .did-foot,
body[data-dsh-inline-diff-appearance='light'] .enhanced-state,
body[data-dsh-inline-diff-appearance='light'] .enhanced-inspect-label,
[data-shell-tone='light'] .did-meta,
[data-shell-tone='light'] .did-empty,
[data-shell-tone='light'] .did-lang,
[data-shell-tone='light'] .did-num,
[data-shell-tone='light'] .did-numhead,
[data-shell-tone='light'] .did-bar-range,
[data-shell-tone='light'] .did-foot,
[data-shell-tone='light'] .enhanced-state,
[data-shell-tone='light'] .enhanced-inspect-label { color: var(--did-fg-secondary); }
/* 强制深色外壳里，小号辅助文字继续用色调块的浅色二级灰（--did-fg-secondary 已随
   色调变成 #c3cade），上面那条只用 var() 引用，不需要额外规则。 */

/* 语言徽章再深一档：徽章底色本身是浅色混合，二级灰只有 4.48，改用一级前景色。 */
body[data-dsh-inline-diff-appearance='light'] .did-lang,
[data-shell-tone='light'] .did-lang { color: var(--did-fg-primary); }

/* 浅色外观里卡片外轮廓再清晰一点：白底 + 白色高光会让玻璃卡片边缘“糊”在背景里，
   这里把外轮廓环加深一档（只影响带 fx-root 的玻璃卡片，native 卡片不变）。 */
body[data-dsh-inline-diff-appearance='light'] [data-fx-root='true'] {
  --did-fx-card-ring: color-mix(in srgb, var(--did-border-2) 78%, var(--did-border-1));
}

/* ---- 外观效果 10. 强制外壳色调与外观相反时的完整适配 -------------------
   浅色外观里选「深色外壳」（或深色外观里选「浅色外壳」）时，半透明玻璃叠在相反
   的页面底色上会被冲成中灰：深色卡片变灰、浅色文字与语义色一起掉对比度（实测
   1.2–2.0，完全看不清）。这种组合本身意味着用户要一张“强制色调”的卡片，因此：
     1) 卡片内材质不再透出页面底色（--did-fx-alpha-boost 固定 1 → alpha-final=1）；
     2) 在卡片子树内局部替换宿主品牌色与语义色：浅色主题的黑色链接 / 亮绿红不会
        落在深色表面上，深色主题的浅色链接 / 亮绿红不会落在浅色表面上；
     3) 卡片内的「放大」按钮跟随卡片表面色（它原本取宿主 --dsw-alias-bg-base，
        在强制色调卡片里会出现黑胶囊 / 白胶囊与卡片底色撞色）。
   全部只作用于“色调与外观相反”的组合；色调与外观一致的卡片不受影响。 */
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] [data-fx],
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'][data-fx],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] [data-fx],
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'][data-fx] {
  --did-fx-alpha-boost: 1;
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] {
  --dsw-alias-brand-primary: #9db9ff;
  --dsw-alias-brand-text: #9db9ff;
  --dsw-alias-state-success-primary: #4ade80;
  --dsw-alias-state-error-primary: #f87171;
  --dsw-alias-state-warn-primary: #fbbf24;
  --dsw-alias-label-primary: #eef1f8;
  --dsw-alias-label-secondary: #c3cade;
  --dsw-alias-label-tertiary: #94a1bc;
  --dsw-alias-border-l1: rgba(151, 169, 216, 0.24);
  --dsw-alias-border-l2: rgba(151, 169, 216, 0.42);
}
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] {
  --dsw-alias-brand-primary: #1d4ed8;
  --dsw-alias-brand-text: #1d4ed8;
  --dsw-alias-state-success-primary: #166534;
  --dsw-alias-state-error-primary: #991b1b;
  --dsw-alias-state-warn-primary: #b45309;
  --dsw-alias-label-primary: #172347;
  --dsw-alias-label-secondary: #4d5d7f;
  --dsw-alias-label-tertiary: #6f7c99;
  --dsw-alias-border-l1: rgba(71, 91, 145, 0.24);
  --dsw-alias-border-l2: rgba(71, 91, 145, 0.42);
}
body[data-dsh-inline-diff-appearance='light'] [data-shell-tone='dark'] .did-zoom,
body[data-dsh-inline-diff-appearance='dark'] [data-shell-tone='light'] .did-zoom {
  background: var(--did-surface-1);
  border-color: var(--did-border-2);
  color: var(--did-fg-secondary);
}
/* ---- 动效 11. 卡片 / 弹窗入场与输出出现 --------------------------------
   设计原则：
   · 只给“从无到有”的瞬时变化加动画：运行中的工具卡片挂载、命令输出到达、
     设置弹窗 / 放大弹窗打开；历史回放、已结算卡片、几毫秒完成的调用都不加，
     避免为了动画而上动画。
   · 只用 opacity + transform（GPU 合成，不触发重排）；缓动是强 ease-out 的
     阻尼曲线，没有回弹/过冲，克制、不夸张。
   · 「prefers-reduced-motion: reduce」 下全部关闭（用户系统偏好优先）。
   · 动画只作用于本插件自己的 DOM，不影响 DSH 原生行与第三方主题的动画。 */
@keyframes did-card-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes did-output-enter {
  from { opacity: 0; transform: translate3d(0, 2px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes did-overlay-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes did-dialog-enter {
  from { opacity: 0; transform: translate3d(0, 6px, 0) scale(0.985); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@media (prefers-reduced-motion: no-preference) {
  /* 运行中/准备中挂载的工具卡片（仅增强风格，原生行不在此列）。 */
  .enhanced-tool[data-enter] {
    animation: did-card-enter 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* 输出占位切换到真实输出的那一次。 */
  .enhanced-section[data-appear] {
    animation: did-output-enter 160ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  /* 设置弹窗（启动按钮打开）与放大弹窗：遮罩淡入 + 对话框轻微上浮。 */
  .did-settings-overlay[data-enter],
  .did-overlay-root[data-enter] {
    animation: did-overlay-enter 140ms ease-out both;
  }
  .did-settings-dialog[data-enter],
  .did-dialog[data-enter] {
    animation: did-dialog-enter 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

/* ---- 设置页：版本与更新面板 --------------------------------------------- */
.did-update {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 0.5px solid var(--did-border-1);
}
.did-update-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.did-update-headtext { flex: 1; min-width: 0; }
.did-update-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--did-fg-primary);
}
.did-update-sub {
  margin-top: 3px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--did-fg-secondary);
}
.did-update-check {
  flex: none;
  padding: 5px 11px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 8px;
  background: transparent;
  color: var(--did-fg-primary);
  font-size: 11.5px;
  cursor: pointer;
}
.did-update-check:hover:not(:disabled) { background: color-mix(in srgb, var(--did-fg-primary) 6%, transparent); }
.did-update-check:disabled { opacity: 0.55; cursor: default; }
.did-update-idle {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--did-fg-tertiary);
}
.did-update-list {
  margin-top: 9px;
  max-height: 210px;
  overflow: auto;
  border: 0.5px solid var(--did-border-1);
  border-radius: 8px;
  background: color-mix(in srgb, var(--did-fg-primary) 2.5%, transparent);
}
.did-update-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 6px 9px;
  border: 0;
  background: transparent;
  color: var(--did-fg-primary);
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}
.did-update-row + .did-update-row { border-top: 0.5px solid var(--did-border-1); }
.did-update-row:hover:not(:disabled) { background: color-mix(in srgb, var(--did-fg-primary) 5%, transparent); }
.did-update-row[data-selected] { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
.did-update-row:disabled { opacity: 0.55; cursor: default; }
.did-update-ver { font-family: var(--did-mono, ui-monospace, monospace); }
.did-update-date { margin-left: auto; color: var(--did-fg-tertiary); font-size: 10.5px; }
.did-update-badge {
  padding: 0 5px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 999px;
  font-size: 10px;
  line-height: 14px;
  color: var(--did-fg-secondary);
}
.did-update-badge[data-warn] { border-style: dashed; }
.did-update-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 9px;
}
.did-update-hint {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  color: var(--did-fg-tertiary);
}
.did-update-install {
  flex: none;
  padding: 5px 12px;
  border: 0.5px solid var(--did-border-2);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);
  color: var(--did-fg-primary);
  font-size: 11.5px;
  cursor: pointer;
}
.did-update-install:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent); }
.did-update-install:disabled { opacity: 0.5; cursor: default; }
.did-update-manual { margin-top: 9px; }
.did-update-manual-hint {
  margin-bottom: 5px;
  font-size: 10.5px;
  color: var(--did-fg-tertiary);
}
.did-update-command {
  display: block;
  padding: 6px 8px;
  overflow-x: auto;
  border: 0.5px solid var(--did-border-1);
  border-radius: 6px;
  background: var(--did-io-bg);
  color: var(--did-fg-secondary);
  font-family: var(--did-mono, ui-monospace, monospace);
  font-size: 10.5px;
  white-space: nowrap;
  user-select: all;
}
.did-update-result {
  margin-top: 9px;
  font-size: 11.5px;
  color: var(--did-add-ink, var(--dsw-alias-state-success-primary));
}
.did-update-log { margin-top: 7px; font-size: 10.5px; color: var(--did-fg-tertiary); }
.did-update-log pre {
  margin: 5px 0 0;
  max-height: 140px;
  overflow: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--did-io-bg);
  color: var(--did-fg-secondary);
  font-family: var(--did-mono, ui-monospace, monospace);
  white-space: pre-wrap;
  word-break: break-all;
}

`
