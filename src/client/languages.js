/**
 * 语言注册表与“按路径识别语言”的纯数据/纯函数模块。
 *
 * 职责：内联差异卡片与设置页需要知道一个文件是什么语言：用哪种 highlight.js
 * grammar 着色、语言徽章显示什么文字、设置页列出哪些支持语言。本模块用一张
 * 声明式注册表 {@link LANGUAGES} 承载全部事实，并在模块加载期把“扩展名表 +
 * 精确文件名表”编译成 Map，让每次识别都是 O(1)。
 *
 * 字段约定：
 *   - id：语言身份（识别结果、徽章查表、highlight.js 注册名都用它）；
 *   - label / short：徽章显示的全名 / 短代码；
 *   - hljs：仅当 grammar 模块名与 id 不同才需要（html→xml、shell→bash），默认=id；
 *   - extensions：小写扩展名（不含点）；
 *   - filenames：无扩展名/特殊文件名的小写精确匹配（Dockerfile、Makefile…）。
 *
 * 依赖：无（纯数据 + 正则/Map，不 import 任何模块），Node 单测可直接加载。
 * 输入输出：detectLanguage(path, text?) → 语言 id | 'plaintext' | null；
 * languageInfo(id) → 注册项 / 纯文本条目 / null；supportedLanguages() → 排序列表；
 * 另导出 LANGUAGES 注册表供高亮层与设置页构建。
 *
 * 失败与回退（README「语言识别」行）：
 *   识别优先级：复合后缀（.d.ts/.min.js）→ 精确文件名 → 文件名前缀
 *   （Dockerfile.dev / .env.local）→ 纯扩展名 → 首行 shebang → null。
 *   命中 plaintext 扩展名/文件名时返回 'plaintext'（识别成功但不做高亮）；
 *   都没命中返回 null → 卡片显示“未知语言”徽章（可在设置中隐藏）且不高亮。
 *   任何异常路径（非字符串路径、`.`/`..`、畸形 shebang）都返回 null，不抛错。
 *
 * @typedef {{ id:string, label:string, short:string, hljs?:string,
 *   extensions:string[], filenames?:string[] }} LanguageEntry
 */

/** @type {readonly LanguageEntry[]} */
export const LANGUAGES = Object.freeze(
  [
    // ---- 标记 / Web 前端 ----
    {
      id: 'javascript',
      label: 'JavaScript',
      short: 'JS',
      extensions: ['js', 'mjs', 'cjs', 'jsx'],
    },
    {
      id: 'typescript',
      label: 'TypeScript',
      short: 'TS',
      extensions: ['ts', 'mts', 'cts', 'tsx'],
    },
    {
      id: 'json',
      label: 'JSON',
      short: 'JSON',
      // JSONC（带注释的 JSON）用 JSON grammar 近似高亮。
      extensions: ['json', 'jsonc'],
      filenames: ['.babelrc', '.eslintrc', '.prettierrc', '.stylelintrc'],
    },
    {
      id: 'html',
      label: 'HTML',
      short: 'HTML',
      hljs: 'xml',
      extensions: ['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'],
    },
    {
      id: 'xml',
      label: 'XML',
      short: 'XML',
      extensions: ['xml', 'svg', 'plist', 'xsd', 'xsl', 'xslt', 'rss', 'atom'],
    },
    { id: 'css', label: 'CSS', short: 'CSS', extensions: ['css'] },
    { id: 'scss', label: 'SCSS', short: 'SCSS', extensions: ['scss', 'sass'] },
    { id: 'less', label: 'Less', short: 'LESS', extensions: ['less'] },
    {
      id: 'markdown',
      label: 'Markdown',
      short: 'MD',
      extensions: ['md', 'mdx', 'markdown'],
    },
    { id: 'yaml', label: 'YAML', short: 'YAML', extensions: ['yml', 'yaml'] },
    {
      id: 'ini',
      label: 'INI / Config',
      short: 'INI',
      // TOML 没有 highlight.js grammar；ini grammar 对卡片展示来说足够近似
      // （产品约定，见 README 已知限制）。
      extensions: ['ini', 'cfg', 'conf', 'properties', 'toml'],
      filenames: ['.editorconfig', '.npmrc', '.yarnrc', '.gitconfig', '.env', 'cargo.toml'],
    },

    // ---- 数据 / 序列化 ----
    { id: 'sql', label: 'SQL', short: 'SQL', extensions: ['sql'] },
    {
      id: 'graphql',
      label: 'GraphQL',
      short: 'GQL',
      extensions: ['graphql', 'gql'],
    },
    {
      id: 'protobuf',
      label: 'Protocol Buffers',
      short: 'PROTO',
      extensions: ['proto'],
    },
    { id: 'diff', label: 'Diff', short: 'DIFF', extensions: ['diff', 'patch'] },

    // ---- 后端 / 通用语言 ----
    {
      id: 'python',
      label: 'Python',
      short: 'PY',
      extensions: ['py', 'pyw', 'pyi'],
    },
    { id: 'java', label: 'Java', short: 'JAVA', extensions: ['java'] },
    { id: 'kotlin', label: 'Kotlin', short: 'KT', extensions: ['kt', 'kts'] },
    { id: 'go', label: 'Go', short: 'GO', extensions: ['go'] },
    { id: 'rust', label: 'Rust', short: 'RS', extensions: ['rs'] },
    // `.h` 归 Objective-C（见下方注册项），这是产品约定：头文件按 ObjC 高亮
    // 比按 C/C++ 更常见，避免同一后缀在两张表里冲突。
    { id: 'c', label: 'C', short: 'C', extensions: ['c'] },
    {
      id: 'cpp',
      label: 'C++',
      short: 'CPP',
      extensions: ['cpp', 'cc', 'cxx', 'c++', 'hpp', 'hh', 'hxx', 'ipp'],
    },
    { id: 'csharp', label: 'C#', short: 'CS', extensions: ['cs', 'csx'] },
    {
      id: 'php',
      label: 'PHP',
      short: 'PHP',
      extensions: ['php', 'phtml', 'php3', 'php4', 'php5', 'phps'],
    },
    {
      id: 'ruby',
      label: 'Ruby',
      short: 'RB',
      extensions: ['rb', 'rake', 'gemspec', 'ru'],
      filenames: [
        'gemfile',
        'rakefile',
        'vagrantfile',
        'brewfile',
        'podfile',
        'guardfile',
        'capfile',
        'fastfile',
        'appfile',
        'berksfile',
        'thorfile',
      ],
    },
    { id: 'swift', label: 'Swift', short: 'SWIFT', extensions: ['swift'] },
    {
      id: 'objectivec',
      label: 'Objective-C',
      short: 'OBJC',
      extensions: ['m', 'mm', 'h'],
    },
    { id: 'scala', label: 'Scala', short: 'SCALA', extensions: ['scala', 'sc'] },
    { id: 'dart', label: 'Dart', short: 'DART', extensions: ['dart'] },
    { id: 'elixir', label: 'Elixir', short: 'EX', extensions: ['ex', 'exs'] },
    { id: 'erlang', label: 'Erlang', short: 'ERL', extensions: ['erl', 'hrl'] },
    {
      id: 'haskell',
      label: 'Haskell',
      short: 'HS',
      extensions: ['hs', 'lhs'],
    },
    {
      id: 'clojure',
      label: 'Clojure',
      short: 'CLJ',
      extensions: ['clj', 'cljs', 'cljc', 'edn'],
    },
    { id: 'lua', label: 'Lua', short: 'LUA', extensions: ['lua'] },
    { id: 'perl', label: 'Perl', short: 'PL', extensions: ['pl', 'pm', 'pod'] },
    { id: 'r', label: 'R', short: 'R', extensions: ['r'] },
    { id: 'julia', label: 'Julia', short: 'JL', extensions: ['jl'] },
    {
      id: 'groovy',
      label: 'Groovy',
      short: 'GRV',
      extensions: ['groovy', 'gradle', 'gvy'],
      filenames: ['jenkinsfile'],
    },
    {
      id: 'fsharp',
      label: 'F#',
      short: 'FS',
      extensions: ['fs', 'fsx', 'fsi'],
    },
    {
      id: 'ocaml',
      label: 'OCaml',
      short: 'ML',
      extensions: ['ml', 'mli', 'mll', 'mly'],
    },
    {
      id: 'fortran',
      label: 'Fortran',
      short: 'F90',
      extensions: ['f90', 'f95', 'f03', 'f08', 'for', 'f'],
    },
    { id: 'd', label: 'D', short: 'D', extensions: ['d', 'di'] },
    { id: 'nim', label: 'Nim', short: 'NIM', extensions: ['nim', 'nims', 'nimble'] },
    { id: 'crystal', label: 'Crystal', short: 'CR', extensions: ['cr'] },

    // ---- 脚本 / 构建 / 终端 ----
    {
      id: 'shell',
      label: 'Shell',
      short: 'SH',
      hljs: 'bash',
      extensions: ['sh', 'bash', 'zsh', 'ksh', 'fish'],
      filenames: [
        '.bashrc',
        '.bash_profile',
        '.bash_login',
        '.bash_logout',
        '.profile',
        '.zshrc',
        '.zprofile',
        '.zshenv',
        '.zlogin',
        '.kshrc',
        '.cshrc',
      ],
    },
    {
      id: 'powershell',
      label: 'PowerShell',
      short: 'PS',
      extensions: ['ps1', 'psm1', 'psd1'],
    },
    { id: 'dos', label: 'Batch', short: 'BAT', extensions: ['bat', 'cmd'] },
    {
      id: 'makefile',
      label: 'Makefile',
      short: 'MK',
      extensions: ['mk', 'mak'],
      filenames: ['makefile', 'gnumakefile', 'makefile.am', 'makefile.in'],
    },
    {
      id: 'dockerfile',
      label: 'Dockerfile',
      short: 'DOCK',
      extensions: ['dockerfile'],
      filenames: ['dockerfile', 'containerfile'],
    },
    {
      id: 'cmake',
      label: 'CMake',
      short: 'CMAKE',
      extensions: ['cmake'],
      filenames: ['cmakelists.txt'],
    },
    {
      id: 'nginx',
      label: 'Nginx',
      short: 'NGINX',
      extensions: ['nginx'],
      filenames: ['nginx.conf'],
    },
    {
      id: 'vim',
      label: 'Vim script',
      short: 'VIM',
      extensions: ['vim'],
      filenames: ['.vimrc', 'vimrc', '.gvimrc', 'gvimrc', '.exrc'],
    },
    {
      id: 'x86asm',
      label: 'x86 Assembly',
      short: 'ASM',
      extensions: ['asm', 's'],
    },
    { id: 'vbscript', label: 'VBScript', short: 'VBS', extensions: ['vbs'] },
    { id: 'vbnet', label: 'VB.NET', short: 'VB', extensions: ['vb'] },

    // ---- 文档 / 其它 ----
    { id: 'latex', label: 'LaTeX', short: 'TEX', extensions: ['tex', 'latex', 'sty', 'cls'] },
    { id: 'asciidoc', label: 'AsciiDoc', short: 'ADOC', extensions: ['adoc', 'asciidoc', 'asc'] },
  ].map(entry => Object.freeze(entry)),
)

/**
 * 纯文本的合成语言条目：能被识别出来，但永远不做语法高亮。
 * 单列而不是混进 LANGUAGES，因为设置页的“支持语言”列表不应包含纯文本。
 */
const PLAINTEXT_INFO = Object.freeze({
  id: 'plaintext',
  label: 'Plain text',
  short: 'TXT',
})

/** 这些扩展名一律“显示纯文本，绝不高亮”（日志/文本文件没有稳定语法）。 */
const PLAINTEXT_EXTENSIONS = new Set(['txt', 'text', 'log'])

/** 无扩展名但属于纯文本的精确文件名（小写）。 */
const PLAINTEXT_FILENAMES = new Set([
  '.gitignore',
  '.dockerignore',
  '.gitattributes',
  '.npmignore',
  'license',
  'licence',
  'copying',
  'notice',
  'authors',
  'contributors',
  'go.mod',
  'go.sum',
  'go.work',
  'procfile',
])

/**
 * 复合后缀表：优先于“最后一个点后面的普通扩展名”。例如 `foo.d.ts` 的普通
 * 扩展名是 `ts`（本身已是 TypeScript），但 `.d.mts` / `.d.cts` 这类后缀必须整体
 * 匹配；`.min.js` 等压缩文件同样按整体识别。表按后缀长度降序排列，保证最长
 * 匹配优先（`.d.mts` 先于 `.mts` 判断）。
 */
const COMPOUND_SUFFIXES = Object.freeze(
  [
    ['.d.ts', 'typescript'],
    ['.d.mts', 'typescript'],
    ['.d.cts', 'typescript'],
    ['.min.js', 'javascript'],
    ['.min.mjs', 'javascript'],
    ['.min.cjs', 'javascript'],
    ['.min.css', 'css'],
  ].sort((a, b) => b[0].length - a[0].length),
)

/**
 * 文件名前缀表：点后面的后缀不是已注册扩展名、但文件名本身有语言含义时使用
 * （Dockerfile.dev、.env.local）。按顺序匹配，先命中先返回。
 */
const FILENAME_PREFIXES = Object.freeze([
  ['dockerfile.', 'dockerfile'],
  ['.env.', 'ini'],
])

/**
 * 解释器 basename（小写、去掉版本号）→ 语言 id，用于处理无扩展名脚本的
 * `#!` 首行（README「语言识别」的最终回退）。只收录常见解释器，未收录的保持
 * null（未知语言、不做高亮），不猜测。
 */
const SHEBANG_LANGUAGES = new Map([
  ['node', 'javascript'],
  ['nodejs', 'javascript'],
  ['deno', 'javascript'],
  ['bun', 'javascript'],
  ['ts-node', 'typescript'],
  ['tsx', 'typescript'],
  ['python', 'python'],
  ['py', 'python'],
  ['pypy', 'python'],
  ['sh', 'shell'],
  ['bash', 'shell'],
  ['zsh', 'shell'],
  ['ksh', 'shell'],
  ['dash', 'shell'],
  ['fish', 'shell'],
  ['csh', 'shell'],
  ['tcsh', 'shell'],
  ['ruby', 'ruby'],
  ['perl', 'perl'],
  ['php', 'php'],
  ['lua', 'lua'],
  ['rscript', 'r'],
  ['julia', 'julia'],
  ['pwsh', 'powershell'],
  ['powershell', 'powershell'],
  ['groovy', 'groovy'],
  ['swift', 'swift'],
  ['scala', 'scala'],
])

/** id → 注册项（languageInfo 查表用）。 */
/** id → 注册项（languageInfo 用）。 */
const LANGUAGE_BY_ID = new Map()
/** 小写扩展名（不含点）→ id（扩展名识别用）。 */
const EXTENSION_LANGUAGE = new Map()
/** 小写精确 basename → id（特殊文件名识别用）。 */
const FILENAME_LANGUAGE = new Map()

// 模块加载期一次性建表：注册表里先出现的语言优先（has 检查保证不互相覆盖），
// 之后每次识别都是 O(1) Map 查询，不再遍历注册表。plaintext 文件名最后补入，
// 保证普通语言同名文件（理论上不会冲突）优先。
for (const language of LANGUAGES) {
  if (!LANGUAGE_BY_ID.has(language.id)) LANGUAGE_BY_ID.set(language.id, language)
  for (const extension of language.extensions) {
    const key = extension.toLowerCase()
    if (!EXTENSION_LANGUAGE.has(key)) EXTENSION_LANGUAGE.set(key, language.id)
  }
  for (const filename of language.filenames ?? []) {
    const key = filename.toLowerCase()
    if (!FILENAME_LANGUAGE.has(key)) FILENAME_LANGUAGE.set(key, language.id)
  }
}
for (const filename of PLAINTEXT_FILENAMES) {
  if (!FILENAME_LANGUAGE.has(filename)) FILENAME_LANGUAGE.set(filename, 'plaintext')
}

/**
 * 取 Windows / POSIX / 展示路径的小写 basename（文件名部分）。
 * 去掉末尾斜杠、兼容两种分隔符；取不到（空串）时返回 ''，调用方按未知处理。
 */
function basenameOf(path) {
  const trimmed = path.replace(/[\\/]+$/, '')
  if (trimmed === '') return ''
  const lastSlash = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  return lastSlash === -1 ? trimmed : trimmed.slice(lastSlash + 1)
}

/**
 * 把解释器路径/可执行名归一成“裸的、去版本号的小写名字”。
 *
 * 例：`/usr/bin/python3.11` → 'python'，`C:\\bin\\NODE18.EXE` → 'node'。
 * 去版本号是为了让 shebang 表只维护一份 'python'/'node'（否则要为每个小版本
 * 建条目）；同时兼容 Windows 的 .exe/.cmd/.bat/.com 后缀。
 */
function normalizeInterpreter(command) {
  let name = command
  const lastSlash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'))
  if (lastSlash !== -1) name = name.slice(lastSlash + 1)
  name = name.toLowerCase().replace(/\.(exe|cmd|bat|com)$/, '')
  // 版本号归一：python3.11 → python，node18 → node，ruby2.7 → ruby
  name = name.replace(/[0-9.]+$/, '')
  return name
}

/**
 * 从 `#!` 首行识别解释器（无扩展名脚本的最后一级回退）。
 *
 * 支持：
 *   - `#!/usr/bin/python3` 直接取解释器；
 *   - `#!/usr/bin/env node` / `#!/usr/bin/env -S node --no-warnings`（跳过 -S、
 *     VAR=value 等参数，取第一个非选项、非赋值参数）；
 *   - CRLF 首行（去掉尾部 \r）。
 * 表里没有的解释器返回 null（未知语言、不高亮），不做进一步猜测。
 *
 * @param {string} text - 文件全文（只读第一行）。
 * @returns {string|null} 语言 id 或 null。
 */
function detectFromShebang(text) {
  if (typeof text !== 'string' || text === '') return null
  const newline = text.indexOf('\n')
  let firstLine = newline === -1 ? text : text.slice(0, newline)
  if (firstLine.endsWith('\r')) firstLine = firstLine.slice(0, -1)
  if (!firstLine.startsWith('#!')) return null
  const body = firstLine.slice(2).trim()
  if (body === '') return null
  const parts = body.split(/\s+/)
  let command = parts[0]
  let index = 0
  if (normalizeInterpreter(command) === 'env') {
    // `#!/usr/bin/env -S node --no-warnings`：跳过选项（-S 等）与 VAR=value
    // 赋值，取第一个真正的解释器参数。
    index = 1
    while (index < parts.length && (parts[index].startsWith('-') || parts[index].includes('='))) index++
    if (index >= parts.length) return null
    command = parts[index]
  }
  return SHEBANG_LANGUAGES.get(normalizeInterpreter(command)) ?? null
}

/**
 * 从文件路径（可选结合内容）识别语言。
 *
 * 优先级（与 README「语言识别」一致，逐级回退）：
 *   1. 复合后缀（.d.ts / .min.js …）；
 *   2. 精确文件名（Dockerfile / Makefile / .gitignore …）；
 *   3. 文件名前缀（Dockerfile.dev / .env.local）；
 *   4. 普通扩展名；纯文本扩展名（txt/log/text）在此返回 'plaintext'；
 *   5. 首行 `#!` shebang（只有内容非空时可用）；
 *   6. 都不匹配 → null（未知语言，不做高亮，徽章可按设置显示/隐藏）。
 *
 * 边界：非字符串/空路径、`.`/`..`、无 basename 的路径直接 null；所有函数内部
 * 都不抛错，因此卡片可以在任意异常路径上安全调用。
 *
 * @param {string} path - Windows 绝对 / POSIX / 相对展示路径。
 * @param {string} [text] - 文件内容（仅用于 shebang 回退）。
 * @returns {string|null} 注册表 id / 'plaintext' / null。
 */
export function detectLanguage(path, text = '') {
  if (typeof path !== 'string' || path === '') return null
  const basename = basenameOf(path).toLowerCase()
  if (basename === '' || basename === '.' || basename === '..') return null

  for (const [suffix, id] of COMPOUND_SUFFIXES) {
    if (basename.endsWith(suffix)) return id
  }

  const filenameHit = FILENAME_LANGUAGE.get(basename)
  if (filenameHit !== undefined) return filenameHit

  for (const [prefix, id] of FILENAME_PREFIXES) {
    if (basename.startsWith(prefix)) return id
  }

  const dot = basename.lastIndexOf('.')
  const extension = dot > 0 && dot < basename.length - 1 ? basename.slice(dot + 1) : ''
  if (extension !== '') {
    if (PLAINTEXT_EXTENSIONS.has(extension)) return 'plaintext'
    const extensionHit = EXTENSION_LANGUAGE.get(extension)
    if (extensionHit !== undefined) return extensionHit
  }

  return detectFromShebang(typeof text === 'string' ? text : '')
}

/**
 * 取一个语言 id 的元数据。
 *
 * 未知 id / 非字符串 → null；合成语言 'plaintext' → 纯文本条目；其余查注册表。
 * 徽章层靠返回 null 来决定“显示未知语言徽章/不显示”。
 *
 * @param {string} id
 * @returns {LanguageEntry | {id:string, label:string, short:string} | null}
 */
export function languageInfo(id) {
  if (typeof id !== 'string' || id === '') return null
  if (id === 'plaintext') return PLAINTEXT_INFO
  return LANGUAGE_BY_ID.get(id) ?? null
}

/**
 * 按显示名排序的注册表列表（设置页“支持的语言”用）。
 * 纯文本不是可高亮语言，特意排除；排序用 'en' locale 保证与运行环境语言无关，
 * 设置页在中文界面下也不会出现乱序。
 *
 * @returns {LanguageEntry[]}
 */
export function supportedLanguages() {
  return [...LANGUAGES].sort((a, b) => a.label.localeCompare(b.label, 'en'))
}
