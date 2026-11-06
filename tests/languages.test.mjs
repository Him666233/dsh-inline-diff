import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LANGUAGES,
  detectLanguage,
  languageInfo,
  supportedLanguages,
} from '../src/client/languages.js'

test('registry: at least 45 languages with unique ids and well-formed metadata', () => {
  assert.ok(LANGUAGES.length >= 45, `expected >= 45 languages, got ${LANGUAGES.length}`)
  const ids = new Set()
  const labels = new Set()
  for (const language of LANGUAGES) {
    assert.equal(typeof language.id, 'string')
    assert.ok(language.id.length > 0)
    assert.ok(!ids.has(language.id), `duplicate id: ${language.id}`)
    ids.add(language.id)

    assert.equal(typeof language.label, 'string')
    assert.ok(language.label.length > 0, `${language.id} has no label`)
    labels.add(language.label)

    assert.equal(typeof language.short, 'string')
    assert.match(language.short, /^[A-Z0-9]{1,5}$/, `${language.id} short code ${language.short}`)

    assert.ok(Array.isArray(language.extensions), `${language.id} extensions`)
    if (language.filenames !== undefined) {
      assert.ok(Array.isArray(language.filenames), `${language.id} filenames`)
    }
    if (language.hljs !== undefined) {
      assert.equal(typeof language.hljs, 'string')
    }
  }
  // Labels are what the badge shows; keep them distinct enough to be meaningful.
  assert.equal(labels.size, LANGUAGES.length)
})

test('registry: every declared extension maps back to its own language', () => {
  for (const language of LANGUAGES) {
    for (const extension of language.extensions) {
      assert.equal(
        detectLanguage(`src/deep/sample.${extension}`),
        language.id,
        `extension .${extension} should detect ${language.id}`,
      )
      assert.equal(
        detectLanguage(`C:\\work\\project\\SAMPLE.${extension.toUpperCase()}`),
        language.id,
        `uppercase extension .${extension} should detect ${language.id}`,
      )
    }
  }
})

test('registry: every declared file name maps back to its own language', () => {
  for (const language of LANGUAGES) {
    for (const filename of language.filenames ?? []) {
      assert.equal(
        detectLanguage(`nested/dir/${filename}`),
        language.id,
        `file name ${filename} should detect ${language.id}`,
      )
    }
  }
})

test('detect: Windows, POSIX and relative display paths', () => {
  assert.equal(detectLanguage('C:\\Users\\dev\\project\\src\\App.TSX'), 'typescript')
  assert.equal(detectLanguage('D:/work/app/main.py'), 'python')
  assert.equal(detectLanguage('/home/dev/app/main.go'), 'go')
  assert.equal(detectLanguage('src/components/Button.jsx'), 'javascript')
  assert.equal(detectLanguage('src\\components\\Button.jsx'), 'javascript')
  assert.equal(detectLanguage('./docs/guide.md'), 'markdown')
  assert.equal(detectLanguage('plainfile.ts'), 'typescript')
})

test('detect: compound extensions take priority over the trailing extension', () => {
  assert.equal(detectLanguage('src/types/index.d.ts'), 'typescript')
  assert.equal(detectLanguage('src/types/index.D.MTS'), 'typescript')
  assert.equal(detectLanguage('src/types/index.d.cts'), 'typescript')
  assert.equal(detectLanguage('dist/bundle.min.js'), 'javascript')
  assert.equal(detectLanguage('dist/theme.min.css'), 'css')
  // Without the compound marker the plain extension still resolves.
  assert.equal(detectLanguage('src/types/index.ts'), 'typescript')
  assert.equal(detectLanguage('src/app.js'), 'javascript')
})

test('detect: special file names required by the spec', () => {
  assert.equal(detectLanguage('Dockerfile'), 'dockerfile')
  assert.equal(detectLanguage('docker/Dockerfile'), 'dockerfile')
  assert.equal(detectLanguage('docker/Dockerfile.dev'), 'dockerfile')
  assert.equal(detectLanguage('Makefile'), 'makefile')
  assert.equal(detectLanguage('CMakeLists.txt'), 'cmake')
  assert.equal(detectLanguage('Jenkinsfile'), 'groovy')

  assert.equal(detectLanguage('.gitignore'), 'plaintext')
  assert.equal(detectLanguage('repo/.dockerignore'), 'plaintext')
  assert.equal(detectLanguage('.gitattributes'), 'plaintext')

  assert.equal(detectLanguage('.env'), 'ini')
  assert.equal(detectLanguage('.env.local'), 'ini')
  assert.equal(detectLanguage('Cargo.toml'), 'ini')
  assert.equal(detectLanguage('.editorconfig'), 'ini')
  assert.equal(detectLanguage('go.mod'), 'plaintext')
  assert.equal(detectLanguage('go.sum'), 'plaintext')

  assert.equal(detectLanguage('deploy/nginx.conf'), 'nginx')
  assert.equal(detectLanguage('Gemfile'), 'ruby')
  assert.equal(detectLanguage('Rakefile'), 'ruby')
  assert.equal(detectLanguage('.bashrc'), 'shell')
  assert.equal(detectLanguage('.zshrc'), 'shell')
  assert.equal(detectLanguage('.vimrc'), 'vim')
  assert.equal(detectLanguage('scripts/build.sh'), 'shell')
  assert.equal(detectLanguage('build.gradle'), 'groovy')
})

test('detect: approximate grammar mappings from the spec', () => {
  assert.equal(detectLanguage('src/App.vue'), 'html')
  assert.equal(detectLanguage('src/App.svelte'), 'html')
  assert.equal(detectLanguage('src/App.astro'), 'html')
  assert.equal(detectLanguage('assets/icon.svg'), 'xml')
  assert.equal(detectLanguage('config/data.jsonc'), 'json')
  assert.equal(detectLanguage('docs/post.mdx'), 'markdown')
  assert.equal(detectLanguage('styles/main.sass'), 'scss')
  assert.equal(detectLanguage('config/app.toml'), 'ini')
  assert.equal(detectLanguage('config/app.properties'), 'ini')
  assert.equal(detectLanguage('include/legacy.h'), 'objectivec')
  assert.equal(detectLanguage('src/main.m'), 'objectivec')
  assert.equal(detectLanguage('Makefile.am'), 'makefile')
})

test('detect: explicit plain text files never highlight', () => {
  for (const path of [
    'notes.txt',
    'notes.TEXT',
    'server.log',
    'LICENSE',
    'licence',
    'COPYING',
    'NOTICE',
    'AUTHORS',
    'CONTRIBUTORS',
    'a/b/README.text',
    'Procfile',
  ]) {
    assert.equal(detectLanguage(path), 'plaintext', path)
  }
  // A plain-text extension wins over a misleading shebang.
  assert.equal(detectLanguage('notes.txt', '#!/usr/bin/env python3\n'), 'plaintext')
})

test('detect: extension-less files fall back to the first-line shebang', () => {
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env node\nconsole.log(1)\n'), 'javascript')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env -S node --no-warnings\n'), 'javascript')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/node\n'), 'javascript')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env ts-node\n'), 'typescript')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/python3.11\nprint(1)\n'), 'python')
  assert.equal(detectLanguage('bin/tool', '#!/bin/bash\nset -e\n'), 'shell')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env ruby\n'), 'ruby')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env pwsh\n'), 'powershell')
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env node\r\nconsole.log(1)\r\n'), 'javascript')
  // Unknown extensions may still be shebang scripts.
  assert.equal(detectLanguage('tool.unknownext', '#!/usr/bin/env python\n'), 'python')
  // No shebang, no language.
  assert.equal(detectLanguage('bin/tool'), null)
  assert.equal(detectLanguage('bin/tool', ''), null)
  assert.equal(detectLanguage('bin/tool', 'just some text\n'), null)
  assert.equal(detectLanguage('bin/tool', '#!/usr/bin/env some-unknown-runtime\n'), null)
})

test('detect: unknown / invalid input returns null without throwing', () => {
  assert.equal(detectLanguage('archive.bin'), null)
  assert.equal(detectLanguage('data.unknownext'), null)
  assert.equal(detectLanguage(''), null)
  assert.equal(detectLanguage('.'), null)
  assert.equal(detectLanguage('..'), null)
  assert.equal(detectLanguage('some/dir/'), null)
  assert.equal(detectLanguage(undefined), null)
  assert.equal(detectLanguage(null), null)
  assert.equal(detectLanguage(42), null)
  assert.equal(detectLanguage({}), null)
  assert.equal(detectLanguage(['a.js']), null)
  assert.equal(detectLanguage('file.unknownext', 42), null)
  assert.equal(detectLanguage('file.unknownext', null), null)
})

test('languageInfo: registry metadata, plain text and unknown ids', () => {
  const typescript = languageInfo('typescript')
  assert.equal(typescript.id, 'typescript')
  assert.equal(typescript.label, 'TypeScript')
  assert.equal(typescript.short, 'TS')
  assert.deepEqual(typescript.extensions, ['ts', 'mts', 'cts', 'tsx'])

  const html = languageInfo('html')
  assert.equal(html.hljs, 'xml')
  const shell = languageInfo('shell')
  assert.equal(shell.hljs, 'bash')

  assert.deepEqual(languageInfo('plaintext'), {
    id: 'plaintext',
    label: 'Plain text',
    short: 'TXT',
  })

  assert.equal(languageInfo('not-a-language'), null)
  assert.equal(languageInfo(''), null)
  assert.equal(languageInfo(null), null)
  assert.equal(languageInfo(42), null)

  for (const language of LANGUAGES) {
    assert.equal(languageInfo(language.id), language)
  }
})

test('supportedLanguages: label-sorted, complete and without plain text', () => {
  const languages = supportedLanguages()
  assert.ok(Array.isArray(languages))
  assert.equal(languages.length, LANGUAGES.length)
  assert.deepEqual(
    languages.map(entry => entry.id).sort(),
    LANGUAGES.map(entry => entry.id).sort(),
  )
  assert.ok(languages.every(entry => entry.id !== 'plaintext'))
  for (let index = 1; index < languages.length; index++) {
    assert.ok(
      languages[index - 1].label.localeCompare(languages[index].label, 'en') <= 0,
      `${languages[index - 1].label} should come before ${languages[index].label}`,
    )
  }
  // Each call returns a fresh array (callers may sort/filter their copy).
  assert.notEqual(supportedLanguages(), languages)
})
