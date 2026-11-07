/**
 * 内联差异卡片的语法高亮 token 层。
 *
 * 职责：highlight.js 一次只能把整段代码渲染成 HTML 字符串，而卡片需要“逐行
 * 的 token 区间”。本模块对每个可用文本侧只调用一次 highlight.js，再把
 * `<span class="hljs-*">` 标记解析回 `{ text, g }` 片段（按 `\n` 拆行、解码
 * 实体、合并相邻同色片段），并通过 WeakMap 缓存暴露 O(1) 的行级查询。
 *
 * 两种数据源（对应 README「语法高亮」的两种展示路径）：
 *   - 全文模式（diff.beforeText / afterText 是字符串）：两侧各高亮一次，按行的
 *     旧/新行号索引；实时快照与全文对照都走这条；
 *   - 历史回放模式（beforeText === null）：按每个 hunk 的旧/新行序列局部高亮，
 *     结果缓存在 hunk 上（WeakMap，hunk 被回收时自动释放）。
 *
 * 依赖：highlight.js 核心 + 各语言 grammar（静态 import，便于 esbuild 打包与
 * Node 单测直接加载）、./diff.js 的 contentLines（行切分口径必须一致）、
 * ./languages.js 的 LANGUAGES 注册表（语言 id → grammar）。
 *
 * 输入输出：getDiffHighlighter(diff, languageId) → 高亮句柄 | null；
 * tokensForRow(highlighter, hunk, row, side) → `{text,g}[]` | null。
 * “句柄为 null / token 为 null” 就是明确的回退信号：调用方按纯文本默认前景色
 * 渲染（颜色仍跟随浅色/深色外观），绝不回退整张卡片或报错。
 *
 * 失败与回退（README「语法高亮 / 高亮 HTML 解析」两行）：
 *   1. 未知语言 / plaintext / grammar 注册失败 → 不高亮；
 *   2. 整侧超过 200k 字符或 4000 行 → 放弃高亮（语言徽章与识别仍然生效）；
 *   3. 单行超过 2000 字符不 token 化；
 *   4. HTML 解析后必须与源文本逐行完全一致（硬校验），否则整侧弃用并回退纯文本；
 *   5. 任何解析/grammar 异常都被 try/catch 吞成 null，绝不让高亮拖垮卡片。
 * 安全边界：highlight.js 输出的 HTML 在这里只被解析成纯文本 token，非 `<span>`
 * 标记全部丢弃，解码后的文本永远作为文本节点渲染（不存在 innerHTML 注入）。
 */

import hljs from 'highlight.js/lib/core'
import asciidoc from 'highlight.js/lib/languages/asciidoc'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import clojure from 'highlight.js/lib/languages/clojure'
import cmake from 'highlight.js/lib/languages/cmake'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import crystal from 'highlight.js/lib/languages/crystal'
import d from 'highlight.js/lib/languages/d'
import dart from 'highlight.js/lib/languages/dart'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import dos from 'highlight.js/lib/languages/dos'
import elixir from 'highlight.js/lib/languages/elixir'
import erlang from 'highlight.js/lib/languages/erlang'
import fortran from 'highlight.js/lib/languages/fortran'
import fsharp from 'highlight.js/lib/languages/fsharp'
import go from 'highlight.js/lib/languages/go'
import graphql from 'highlight.js/lib/languages/graphql'
import groovy from 'highlight.js/lib/languages/groovy'
import haskell from 'highlight.js/lib/languages/haskell'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import julia from 'highlight.js/lib/languages/julia'
import kotlin from 'highlight.js/lib/languages/kotlin'
import latex from 'highlight.js/lib/languages/latex'
import less from 'highlight.js/lib/languages/less'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import nim from 'highlight.js/lib/languages/nim'
import objectivec from 'highlight.js/lib/languages/objectivec'
import ocaml from 'highlight.js/lib/languages/ocaml'
import perl from 'highlight.js/lib/languages/perl'
import php from 'highlight.js/lib/languages/php'
import powershell from 'highlight.js/lib/languages/powershell'
import protobuf from 'highlight.js/lib/languages/protobuf'
import python from 'highlight.js/lib/languages/python'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import scala from 'highlight.js/lib/languages/scala'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import vbnet from 'highlight.js/lib/languages/vbnet'
import vbscript from 'highlight.js/lib/languages/vbscript'
import vim from 'highlight.js/lib/languages/vim'
import x86asm from 'highlight.js/lib/languages/x86asm'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { contentLines } from './diff.js'
import { LANGUAGES } from './languages.js'

/** grammar 模块表：键是 highlight.js 的 grammar 名（不一定是注册 id，例如
 *  html → xml、shell → bash），见 languages.js 的 `hljs` 字段。 */
const GRAMMARS = Object.freeze({
  asciidoc,
  bash,
  c,
  clojure,
  cmake,
  cpp,
  csharp,
  css,
  crystal,
  d,
  dart,
  diff,
  dockerfile,
  dos,
  elixir,
  erlang,
  fortran,
  fsharp,
  go,
  graphql,
  groovy,
  haskell,
  ini,
  java,
  javascript,
  json,
  julia,
  kotlin,
  latex,
  less,
  lua,
  makefile,
  markdown,
  nginx,
  nim,
  objectivec,
  ocaml,
  perl,
  php,
  powershell,
  protobuf,
  python,
  r,
  ruby,
  rust,
  scala,
  scss,
  sql,
  swift,
  typescript,
  vbnet,
  vbscript,
  vim,
  x86asm,
  xml,
  yaml,
})

/** 语言注册表 id → 条目，用于按 id 注册 highlight.js 与查 grammar。 */
const LANGUAGE_BY_ID = new Map(LANGUAGES.map(entry => [entry.id, entry]))

/* ---- 高亮预算（README「高亮预算」）；超限只降级高亮，语言徽章不受影响 ---- */
/** 整侧文本的字符预算：更长的文件不做语法高亮。 */
const MAX_SIDE_TEXT_LENGTH = 200_000
/** 整侧行数预算。 */
const MAX_SIDE_LINES = 4000
/** 单行 token 化预算：超长行（minified 文件）不高亮。 */
const MAX_TOKEN_LINE_LENGTH = 2000

/* =========================================================================
 * highlight.js 注册
 * ====================================================================== */

/**
 * 注册一个注册表语言：优先用 `entry.hljs` 指定的 grammar，没有则用 id。
 *
 * grammar 不存在 / 注册抛错时返回 false（该语言回退默认前景色），绝不因为一个
 * 坏 grammar 让整张卡片失败。注册成功与否都以 `hljs.getLanguage` 为准。
 *
 * @param {{id:string, hljs?:string}} entry - languages.js 的注册项。
 * @returns {boolean} highlight.js 现在是否认识该语言。
 */
function registerLanguageEntry(entry) {
  const grammar = GRAMMARS[entry.hljs ?? entry.id]
  if (typeof grammar !== 'function') return false
  try {
    if (!hljs.getLanguage(entry.id)) hljs.registerLanguage(entry.id, grammar)
  } catch {
    // 坏 grammar 绝不能拖垮整张卡片：该语言只是回退为默认前景色。
    return false
  }
  return Boolean(hljs.getLanguage(entry.id))
}

// 模块加载期就注册全部语言：markdown/HTML 等 grammar 会内嵌 JavaScript/CSS 等
// 子语言，提前注册能保证无论哪份 diff 先请求哪种语言，嵌套 grammar 都已可用
// （否则 highlight.js 在解析子语言时会报 grammar 未注册）。
for (const entry of LANGUAGES) registerLanguageEntry(entry)

/**
 * 确保请求的注册表语言已注册给 highlight.js。
 * 已注册 → true；未知 id → false；懒注册失败 → false（回退默认前景色）。
 */
function ensureLanguage(languageId) {
  const entry = LANGUAGE_BY_ID.get(languageId)
  if (!entry) return false
  if (hljs.getLanguage(languageId)) return true
  return registerLanguageEntry(entry)
}

/* =========================================================================
 * highlight.js 的 class → token 分组
 * ====================================================================== */

/**
 * 把一个 highlight.js 作用域 class 属性映射到 token 分组。
 *
 * 需要处理“子作用域双 class”的情况：highlight.js 11 会输出
 * `<span class="hljs-title class_">`（主 class + 子 class 同在一个 span 上），
 * 因此先按空白/点拆分、去掉 `hljs-` 前缀，再用主 class 查表、用修饰 class 修正
 * （title+class_ → type、title+function_ → fn、variable+language_ → kw）。
 * 未识别的 class 一律回退 'var'（不覆盖颜色，使用默认前景色）。
 *
 * 分组集合：kw | str | num | fn | type | prop | com | meta | tag | attr | op |
 * punct | head | link | lit | emph | var —— 与 syntax-styles.js 的配色一一对应。
 *
 * @param {string} className - span 的 class 属性原文。
 * @returns {string} token 分组名。
 */
function groupForClass(className) {
  if (typeof className !== 'string' || className === '') return 'var'
  const parts = className
    .trim()
    .toLowerCase()
    .split(/[\s.]+/)
    .map(part => (part.startsWith('hljs-') ? part.slice(5) : part))
    .filter(part => part !== '')
  if (parts.length === 0) return 'var'
  const primary = parts[0]
  const modifiers = parts.length > 1 ? parts.slice(1) : []
  if (primary === 'title' && modifiers.includes('class_')) return 'type'
  if (primary === 'title' && modifiers.includes('function_')) return 'fn'
  if (primary === 'variable' && modifiers.includes('language_')) return 'kw'
  return PRIMARY_GROUPS.get(primary) ?? 'var'
}

/**
 * 单 class 的 scope → 分组主表（子作用域修正见 groupForClass）。
 *
 * 注意：diff grammar 的 addition/deletion 也映射到 'meta'（中性色），不映射到
 * 红/绿——红绿是本插件新增/删除行的专属语义，语法高亮不能借用（README 配色
 * 约束，tests/syntax-palette.test.mjs 有断言）。
 */
const PRIMARY_GROUPS = new Map([
  // 关键词 / 控制流
  ['keyword', 'kw'],
  ['selector-tag', 'kw'],
  ['selector-class', 'kw'],
  ['selector-id', 'kw'],
  ['meta-keyword', 'kw'],
  ['doctag', 'kw'],
  // 字符串 / 正则 / 模板文本
  ['string', 'str'],
  ['char', 'str'],
  ['regexp', 'str'],
  ['attr-value', 'str'],
  ['meta-string', 'str'],
  ['template-string', 'str'],
  ['code', 'str'],
  // 数字 / 常量
  ['number', 'num'],
  ['literal', 'num'],
  ['symbol', 'num'],
  ['bullet', 'num'],
  // 函数 / 类型
  ['function', 'fn'],
  ['function_', 'fn'],
  ['title', 'fn'],
  ['built_in', 'type'],
  ['type', 'type'],
  ['class-name', 'type'],
  ['class_', 'type'],
  // 属性 / 特性 / 变量
  ['attr', 'prop'],
  ['attribute', 'prop'],
  ['property', 'prop'],
  ['variable', 'prop'],
  ['language_', 'kw'],
  ['params', 'prop'],
  ['template-variable', 'prop'],
  ['subst', 'prop'],
  ['selector-attr', 'prop'],
  // 注释
  ['comment', 'com'],
  ['quote', 'com'],
  // 元信息 / 注解 / 预处理
  ['meta', 'meta'],
  // diff grammar 标记：绝不用红/绿语义，只当中性 meta
  ['addition', 'meta'],
  ['deletion', 'meta'],
  // 标签 / 标题
  ['tag', 'tag'],
  ['name', 'tag'],
  ['section', 'head'],
  // 运算符 / 标点
  ['operator', 'op'],
  ['punctuation', 'punct'],
  // 强调 / 链接
  ['emphasis', 'emph'],
  ['strong', 'emph'],
  ['link', 'link'],
])

/* =========================================================================
 * highlight.js HTML → 逐行 token 区间
 * ====================================================================== */

/** 需要解码的命名实体（highlight.js 实际只会输出这几种；未知实体按字面量处理）。 */
const NAMED_ENTITIES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', '\u00a0'],
])

/**
 * 解码一个 `&...;` 实体；不是已知/合法实体时返回 null。
 *
 * 导出仅供 `tests/security.test.mjs` 直接验证转义解码边界：该函数是
 * highlight.js HTML → 纯文本 token 的唯一解码入口，解码结果永远作为文本节点
 * 渲染（不是 HTML），未知/非法实体原样返回 null，由调用方按字面量 `&` 处理。
 * 数字实体只接受合法十进制/十六进制，且码点必须在 (0, 0x10FFFF] 内，因此不会
 * 解出控制字符或代理项以外的东西。
 * @internal
 */
export function decodeEntity(entity) {
  const body = entity.slice(1, -1)
  if (body === '') return null
  if (body.charCodeAt(0) === 35 /* # */) {
    const hex = body.length > 1 && (body[1] === 'x' || body[1] === 'X')
    const digits = hex ? body.slice(2) : body.slice(1)
    if (digits === '') return null
    const valid = hex ? /^[0-9a-fA-F]+$/.test(digits) : /^[0-9]+$/.test(digits)
    if (!valid) return null
    const codePoint = Number.parseInt(digits, hex ? 16 : 10)
    if (!Number.isFinite(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) return null
    try {
      return String.fromCodePoint(codePoint)
    } catch {
      return null
    }
  }
  const named = NAMED_ENTITIES.get(body.toLowerCase())
  return named !== undefined ? named : null
}

/** 把一行 token 拼回纯文本（用于“token 必须能逐字还原源文本”的硬校验）。 */
function lineText(tokens) {
  let text = ''
  for (const token of tokens) text += token.text
  return text
}

/**
 * 把 highlight.js 输出的 HTML 字符串解析成 `lines: {text,g}[][]`（逐行 token）。
 *
 * 解析规则（不使用任何 DOM API，纯字符串扫描，Node 单测也能跑）：
 *   - 用栈跟踪嵌套 `<span>`，当前分组取栈顶；`</span>` 弹栈；
 *   - 非 `<span>` 的开始标记直接忽略（highlight.js 不会输出其它标记，但这里
 *     按“只信 span”处理，杜绝把任意 HTML 带进渲染层的可能）；
 *   - class 属性支持双引号/单引号；缺失时按 'var'（默认前景色）；
 *   - 文本里的实体（`&amp; &lt; &gt; &quot; &#x27;` 等）经 decodeEntity 解码；
 *     未知实体回退为字面量 `&`（只前进 1 个字符，不会丢内容）；
 *   - 文本按 `\n` 拆行（跨行作用域在换行处结束，下一行继续继承栈顶分组）；
 *   - 相邻且分组相同的片段合并，减少 DOM 节点数。
 *
 * @internal 导出仅供安全测试：验证 highlight.js 输出的 HTML 只会被解析成
 * 纯文本 token，任何非 `<span>` 标记都被丢弃，且上层还会做逐行文本重建校验
 * （见 highlightLines），因此不存在把高亮 HTML 当 DOM 注入的路径。
 *
 * @param {string} html - highlight.js 的 `value`。
 * @returns {Array<Array<{text:string, g:string}>>} 逐行 token；至少一行。
 */
export function parseHighlightedHtml(html) {
  const lines = [[]]
  /** @type {{ group: string }[]} */
  const stack = []

  const pushToken = (text, group) => {
    if (text === '') return
    const line = lines[lines.length - 1]
    const previous = line[line.length - 1]
    if (previous !== undefined && previous.g === group) previous.text += text
    else line.push({ text, g: group })
  }

  const appendText = text => {
    if (text === '') return
    const group = stack.length > 0 ? stack[stack.length - 1].group : 'var'
    let start = 0
    for (let index = 0; index < text.length; index++) {
      if (text.charCodeAt(index) !== 10 /* \n */) continue
      pushToken(text.slice(start, index), group)
      lines.push([])
      start = index + 1
    }
    pushToken(text.slice(start), group)
  }

  let index = 0
  const length = html.length
  while (index < length) {
    const charCode = html.charCodeAt(index)
    if (charCode === 60 /* < */) {
      const end = html.indexOf('>', index + 1)
      if (end === -1) break
      const tag = html.slice(index, end + 1)
      index = end + 1
      if (tag.startsWith('</')) {
        if (stack.length > 0) stack.pop()
        continue
      }
      if (!/^<span\b/i.test(tag)) continue
      const match = /class\s*=\s*"([^"]*)"/i.exec(tag) ?? /class\s*=\s*'([^']*)'/i.exec(tag)
      const className = match ? match[1] : ''
      stack.push({ group: groupForClass(className) })
      continue
    }
    if (charCode === 38 /* & */) {
      const semicolon = html.indexOf(';', index + 1)
      if (semicolon !== -1 && semicolon - index <= 12) {
        const entity = html.slice(index, semicolon + 1)
        const decoded = decodeEntity(entity)
        if (decoded !== null) {
          appendText(decoded)
          index = semicolon + 1
          continue
        }
      }
      appendText('&')
      index += 1
      continue
    }
    let next = index + 1
    while (next < length) {
      const code = html.charCodeAt(next)
      if (code === 60 || code === 38) break
      next += 1
    }
    appendText(html.slice(index, next))
    index = next
  }

  return lines
}

/**
 * 高亮一段代码并返回逐行 token；任何失败返回 null（卡片回退纯文本）。
 *
 * 步骤：预算检查 → highlight.js 高亮（ignoreIllegals，语法错误不抛）→ HTML
 * 解析 → 行数校验 → **逐行重建校验**（token 拼回的文本必须逐字等于源行）。
 * 最后一步是“高亮 HTML 解析”回退链的硬闸门：解析器或 grammar 只要有一处不一致
 * 就整侧弃用，保证渲染出来的文本永远与 diff 模型里的文本完全相同。
 *
 * @param {string} code - 该侧的完整代码文本。
 * @param {string[]} sourceLines - contentLines 切出的源行（校验基准）。
 * @param {string} languageId - highlight.js 注册 id。
 * @returns {Array<Array<{text:string, g:string}>> | null}
 */
function highlightLines(code, sourceLines, languageId) {
  if (sourceLines.length === 0) return []
  if (code.length > MAX_SIDE_TEXT_LENGTH || sourceLines.length > MAX_SIDE_LINES) return null
  let html
  try {
    const result = hljs.highlight(code, { language: languageId, ignoreIllegals: true })
    html = result?.value
  } catch {
    return null
  }
  if (typeof html !== 'string') return null
  let parsed
  try {
    parsed = parseHighlightedHtml(html)
  } catch {
    return null
  }
  if (parsed.length !== sourceLines.length) return null
  for (let line = 0; line < parsed.length; line++) {
    if (lineText(parsed[line]) !== sourceLines[line]) return null
  }
  return parsed
}

/**
 * 预检一侧全文：区分“没有这一侧”（present=false）与“有但超预算”
 * （present=true, withinBudget=false）。
 *
 * 为什么要区分：历史回放的模型没有全文（beforeText=null），此时应走 hunk 局部
 * 高亮；而“有全文但太大”应直接放弃高亮（不再退到局部高亮，避免对超大文件做
 * 逐块高亮的无谓工作）。行切分与 diff 引擎共用 contentLines，保证索引对齐。
 *
 * @param {unknown} text - diff.beforeText / afterText。
 * @returns {{present:boolean, withinBudget:boolean, lines:string[]|null, code:string}}
 */
function prepareFullSide(text) {
  if (typeof text !== 'string') {
    return { present: false, withinBudget: true, lines: null, code: '' }
  }
  const lines = contentLines(text)
  if (text.length > MAX_SIDE_TEXT_LENGTH || lines.length > MAX_SIDE_LINES) {
    return { present: true, withinBudget: false, lines, code: '' }
  }
  return { present: true, withinBudget: true, lines, code: lines.join('\n') }
}

/* =========================================================================
 * hunk 局部高亮（历史回放：没有完整全文）
 * ====================================================================== */

/** WeakMap<hunk, Map<languageId, {old,new}|null>>：按 hunk 缓存，随 diff 一起回收。 */
const HUNK_TOKEN_CACHE = new WeakMap()

/**
 * 取一个 hunk 的旧/新行文本序列（供局部高亮使用）。
 *
 * 形状不合法（rows 非数组/为空、行不是对象、text 不是字符串、text 里含换行、
 * kind 无法识别）时返回 null → 该 hunk 不高亮。校验 text 不含换行是因为局部
 * 高亮按“一个 row = 一行”拼接，含换行会破坏逐行索引的对齐。
 *
 * @param {object} hunk
 * @returns {{oldLines:string[], newLines:string[]}|null}
 */
function hunkSideTexts(hunk) {
  const rows = hunk.rows
  if (!Array.isArray(rows) || rows.length === 0) return null
  const oldLines = []
  const newLines = []
  for (const row of rows) {
    if (row === null || typeof row !== 'object' || typeof row.text !== 'string') return null
    if (row.text.includes('\n')) return null
    if (row.kind !== 'add') oldLines.push(row.text)
    if (row.kind !== 'del') newLines.push(row.text)
  }
  return { oldLines, newLines }
}

/**
 * 高亮并缓存一个 hunk 的旧/新两侧（按 languageId 分桶）。
 *
 * 两侧各自独立：一侧失败不影响另一侧（局部模式下这很常见——hunk 缺少跨行结构
 * 上下文）。结果整条缓存在 WeakMap 上，hunk 被 GC 时自动释放；同一 hunk 在同
 * 语言下只高亮一次。
 */
function hunkTokensFor(hunk, languageId) {
  let byLanguage = HUNK_TOKEN_CACHE.get(hunk)
  if (!byLanguage) {
    byLanguage = new Map()
    HUNK_TOKEN_CACHE.set(hunk, byLanguage)
  }
  if (byLanguage.has(languageId)) return byLanguage.get(languageId)
  let entry = null
  const sideTexts = hunkSideTexts(hunk)
  if (sideTexts !== null) {
    const oldCode = sideTexts.oldLines.join('\n')
    const newCode = sideTexts.newLines.join('\n')
    const oldLines = highlightLines(oldCode, sideTexts.oldLines, languageId)
    const newLines = highlightLines(newCode, sideTexts.newLines, languageId)
    if (oldLines !== null || newLines !== null) entry = { old: oldLines, new: newLines }
  }
  byLanguage.set(languageId, entry)
  return entry
}

/**
 * 求某个 row 在其 hunk 的旧/新行序列中的下标；不在序列里返回 -1。
 *
 * 行序列口径与 hunkSideTexts 一致：add 行不计入旧侧、del 行不计入新侧。用引用
 * 相等（candidate === row）定位，因此 token 查询可以 O(hunk 行数) 完成；行数
 * 受 hunk 大小限制（最多 CONTEXT 上下文 + 变更行），不构成性能问题。
 */
function rowIndexInHunk(hunk, row, side) {
  const rows = hunk.rows
  if (!Array.isArray(rows)) return -1
  let oldIndex = 0
  let newIndex = 0
  for (const candidate of rows) {
    if (candidate === row) return side === 'old' ? oldIndex : newIndex
    if (candidate === null || typeof candidate !== 'object') continue
    if (candidate.kind !== 'add') oldIndex += 1
    if (candidate.kind !== 'del') newIndex += 1
  }
  return -1
}

/* =========================================================================
 * 对外 API
 * ====================================================================== */

/** WeakMap<diff, Map<languageId, highlighter|null>>：同一 diff 每种语言只构建一次。 */
const DIFF_CACHE = new WeakMap()

/**
 * 为 `(diff, languageId)` 构建（或复用）高亮句柄；不可高亮时返回 null。
 *
 * 返回 null 的所有情形（调用方一律回退纯文本默认前景色）：
 *   - diff 不是对象；
 *   - 语言是空串 / plaintext / 未知 id，或 grammar 注册失败；
 *   - 某一侧超过全文预算；
 *   - 两侧都没有可高亮文本（历史回放且没有 hunk 行）。
 * 整个函数包 try/catch：任何意外都只损失高亮，不影响卡片渲染。
 *
 * @param {object} diff - diff.js 生成的差异模型。
 * @param {string} languageId - detectLanguage 的返回值（注册表 id）。
 * @returns {{languageId:string, mode:'full'|'meta', oldLines:Array|null, newLines:Array|null}|null}
 */
export function getDiffHighlighter(diff, languageId) {
  try {
    if (diff === null || typeof diff !== 'object') return null
    if (typeof languageId !== 'string' || languageId === '' || languageId === 'plaintext') return null
    let byLanguage = DIFF_CACHE.get(diff)
    if (!byLanguage) {
      byLanguage = new Map()
      DIFF_CACHE.set(diff, byLanguage)
    }
    if (byLanguage.has(languageId)) return byLanguage.get(languageId)
    const highlighter = buildHighlighter(diff, languageId)
    byLanguage.set(languageId, highlighter)
    return highlighter
  } catch {
    return null
  }
}

/**
 * 创建一个按约定不可变的高亮句柄。
 *
 * 模式选择：
 *   - 有一侧或两侧全文可用（实时快照）→ 'full'：每侧只高亮一次，按行号 O(1) 查询；
 *   - 没有全文（历史回放）→ 'meta'：句柄只记录语言，逐 hunk 局部高亮并缓存。
 * 全文模式两侧都失败时返回 null（整体不高亮），不会悄悄退成局部模式——局部模式
 * 需要 hunk 行，而全文模型通常没有 hunks（rows 才是主数据）。
 */
function buildHighlighter(diff, languageId) {
  if (!ensureLanguage(languageId)) return null
  const oldSide = prepareFullSide(diff.beforeText)
  const newSide = prepareFullSide(diff.afterText)
  if (!oldSide.withinBudget || !newSide.withinBudget) return null
  const hasFullText = oldSide.present || newSide.present
  if (hasFullText) {
    const oldLines = oldSide.present ? highlightLines(oldSide.code, oldSide.lines, languageId) : null
    const newLines = newSide.present ? highlightLines(newSide.code, newSide.lines, languageId) : null
    if (oldLines === null && newLines === null) return null
    return { languageId, mode: 'full', oldLines, newLines }
  }
  const hunks = Array.isArray(diff.hunks) ? diff.hunks : []
  const hasRows = hunks.some(hunk => hunk !== null && typeof hunk === 'object' && Array.isArray(hunk.rows) && hunk.rows.length > 0)
  if (!hasRows) return null
  return { languageId, mode: 'meta', oldLines: null, newLines: null }
}

/**
 * 取一行渲染所需的 token 数组。
 *
 * 保证：返回 token 拼接后的文本**始终等于** row.text；只要无法保证就返回 null
 * （卡片保留纯文本默认前景色）。绝不抛错。
 *
 * 查找顺序：
 *   1. 全文模式先按行号查高亮后的全文（行号缺失/越界/文本对不上 → 未命中）；
 *   2. 未命中或 meta 模式 → 按 hunk 局部高亮查找（兜底）；
 *   3. 都没有 → null。
 * 单行超过 MAX_TOKEN_LINE_LENGTH（2000 字符）直接返回 null（minified 行不
 * token 化，避免生成成千上万个 span）。
 *
 * @param {object|null} highlighter - getDiffHighlighter 的句柄。
 * @param {object|null} hunk - 行所属 hunk；全文对照模式下为 null。
 * @param {{kind?:string, text:string, oldNo?:number|null, newNo?:number|null}} row
 * @param {'old'|'new'} side - 行属于旧侧还是新侧。
 * @returns {{text:string, g:string}[]|null}
 */
export function tokensForRow(highlighter, hunk, row, side) {
  try {
    if (highlighter === null || typeof highlighter !== 'object') return null
    if (row === null || typeof row !== 'object' || typeof row.text !== 'string') return null
    if (row.text.length > MAX_TOKEN_LINE_LENGTH) return null
    const lineSide = side === 'old' ? 'old' : 'new'
    if (highlighter.mode === 'full') {
      const fromFullText = tokensFromFullText(highlighter, row, lineSide)
      if (fromFullText !== undefined) return fromFullText
    }
    if (hunk === null || typeof hunk !== 'object' || !Array.isArray(hunk.rows)) return null
    return tokensFromHunk(highlighter, hunk, row, lineSide)
  } catch {
    return null
  }
}

/**
 * 按行号从“高亮后的全文”里取 token；未命中返回 undefined（区别于 null：
 * 表示“这次没查到，可以继续尝试 hunk 局部查找”）。
 *
 * 命中后仍做一次逐字校验：行号对不上文本时宁可放弃高亮——行号与模型不一致
 * 只可能来自手工构造/旧缓存，绝不能把错误文本渲染成代码。
 */
function tokensFromFullText(highlighter, row, side) {
  const lines = side === 'old' ? highlighter.oldLines : highlighter.newLines
  if (!Array.isArray(lines)) return undefined
  const lineNumber = side === 'old' ? row.oldNo : row.newNo
  if (!Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > lines.length) return undefined
  const tokens = lines[lineNumber - 1]
  if (!Array.isArray(tokens)) return undefined
  // 防御：手工构造/不一致的模型绝不能渲染出错误文本。
  if (lineText(tokens) !== row.text) return undefined
  return tokens
}

/**
 * 按 hunk 局部高亮取 token（历史回放主路径，也作为异常模型的兜底）。
 * 同样要求 token 拼回的文本逐字等于 row.text，否则返回 null。
 */
function tokensFromHunk(highlighter, hunk, row, side) {
  const languageId = highlighter.languageId
  if (typeof languageId !== 'string') return null
  const entry = hunkTokensFor(hunk, languageId)
  if (entry === null) return null
  const lines = side === 'old' ? entry.old : entry.new
  if (!Array.isArray(lines)) return null
  const index = rowIndexInHunk(hunk, row, side)
  if (index < 0 || index >= lines.length) return null
  const tokens = lines[index]
  if (!Array.isArray(tokens)) return null
  if (lineText(tokens) !== row.text) return null
  return tokens
}
