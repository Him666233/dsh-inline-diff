/**
 * Language registry and path-based language detection for the inline cards.
 *
 * The registry is intentionally declarative: everything the UI needs (badge
 * label, short code, highlight.js grammar) lives in {@link LANGUAGES}, and both
 * the extension table and the exact-filename table are compiled into Maps once
 * at module load so detection stays O(1) per lookup.
 *
 * The `id` is the language identity used everywhere else (detection result,
 * badge lookup, highlight.js registration name). `hljs` is only needed when the
 * grammar module does not share the id (html -> xml, shell -> bash); it defaults
 * to the id.
 *
 * @typedef {{ id:string, label:string, short:string, hljs?:string,
 *   extensions:string[], filenames?:string[] }} LanguageEntry
 */

/** @type {readonly LanguageEntry[]} */
export const LANGUAGES = Object.freeze(
  [
    // --- Markup / web -------------------------------------------------------
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
      // JSONC (JSON with comments) is highlighted by the JSON grammar.
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
      // TOML has no highlight.js grammar; the ini grammar is a close enough
      // approximation for the card's purposes (spec decision).
      extensions: ['ini', 'cfg', 'conf', 'properties', 'toml'],
      filenames: ['.editorconfig', '.npmrc', '.yarnrc', '.gitconfig', '.env', 'cargo.toml'],
    },

    // --- Data / serialization ----------------------------------------------
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

    // --- Backend / general purpose -----------------------------------------
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
    // `.h` is claimed by Objective-C below, per the team spec.
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

    // --- Scripts / build / terminal ----------------------------------------
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

    // --- Documentation / other ---------------------------------------------
    { id: 'latex', label: 'LaTeX', short: 'TEX', extensions: ['tex', 'latex', 'sty', 'cls'] },
    { id: 'asciidoc', label: 'AsciiDoc', short: 'ADOC', extensions: ['adoc', 'asciidoc', 'asc'] },
  ].map(entry => Object.freeze(entry)),
)

/** The synthetic plain-text entry: detected, but never syntax highlighted. */
const PLAINTEXT_INFO = Object.freeze({
  id: 'plaintext',
  label: 'Plain text',
  short: 'TXT',
})

/** Extensions that always mean "show plain text, never highlight". */
const PLAINTEXT_EXTENSIONS = new Set(['txt', 'text', 'log'])

/** Exact file names (lower-case) that are plain text but have no extension. */
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
 * Compound suffixes win over the last plain extension. Highlight.js only needs
 * the language id, so the map is deliberately tiny: everything else is already
 * correct through its final extension.
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
 * File-name prefixes that carry language meaning even when the suffix after the
 * dot is not a registered extension (Dockerfile.dev, .env.local).
 */
const FILENAME_PREFIXES = Object.freeze([
  ['dockerfile.', 'dockerfile'],
  ['.env.', 'ini'],
])

/** Interpreter basename (lower-case, version stripped) -> language id. */
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

/** id -> entry, for {@link languageInfo}. */
const LANGUAGE_BY_ID = new Map()
/** lower-case extension (no dot) -> id. */
const EXTENSION_LANGUAGE = new Map()
/** lower-case exact basename -> id. */
const FILENAME_LANGUAGE = new Map()

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

/** Lower-case base name of a Windows, POSIX or display-style path. */
function basenameOf(path) {
  const trimmed = path.replace(/[\\/]+$/, '')
  if (trimmed === '') return ''
  const lastSlash = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  return lastSlash === -1 ? trimmed : trimmed.slice(lastSlash + 1)
}

/** Normalize an interpreter path/executable to a bare, version-less name. */
function normalizeInterpreter(command) {
  let name = command
  const lastSlash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'))
  if (lastSlash !== -1) name = name.slice(lastSlash + 1)
  name = name.toLowerCase().replace(/\.(exe|cmd|bat|com)$/, '')
  // python3.11 -> python, node18 -> node, ruby2.7 -> ruby
  name = name.replace(/[0-9.]+$/, '')
  return name
}

/** Detect the language from a `#!` first line, if any. */
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
    // `#!/usr/bin/env -S node --no-warnings`, skipping VAR=value assignments.
    index = 1
    while (index < parts.length && (parts[index].startsWith('-') || parts[index].includes('='))) index++
    if (index >= parts.length) return null
    command = parts[index]
  }
  return SHEBANG_LANGUAGES.get(normalizeInterpreter(command)) ?? null
}

/**
 * Detect the language of a file from its path and (optionally) content.
 *
 * Priority: compound extensions -> exact file names -> plain extension ->
 * `#!` shebang of the first content line -> null. Returns `'plaintext'` for
 * text files that should not be highlighted, and `null` when nothing matches.
 *
 * @param {string} path Windows absolute, POSIX or relative display path.
 * @param {string} [text] File content (used only for the shebang fallback).
 * @returns {string | null}
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
 * Metadata for one language id. Unknown ids return null; the synthetic
 * plain-text language resolves to `{ id:'plaintext', label:'Plain text',
 * short:'TXT' }`.
 *
 * @param {string} id
 * @returns {LanguageEntry | { id:string, label:string, short:string } | null}
 */
export function languageInfo(id) {
  if (typeof id !== 'string' || id === '') return null
  if (id === 'plaintext') return PLAINTEXT_INFO
  return LANGUAGE_BY_ID.get(id) ?? null
}

/**
 * The registry ordered by display label, for the settings page. Plain text is
 * not a supported highlighting language and is excluded.
 *
 * @returns {LanguageEntry[]}
 */
export function supportedLanguages() {
  return [...LANGUAGES].sort((a, b) => a.label.localeCompare(b.label, 'en'))
}
