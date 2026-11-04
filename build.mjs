/**
 * Build the plugin's browser half.
 *
 *   node build.mjs          write plugin/client.js
 *   node build.mjs --check  verify the checked-in bundle matches the source
 *
 * The output is a single plain-JS `window.__ModuleLoader__.load({...})` module:
 * only `react` and `react/jsx-runtime` stay external, everything else (diff
 * engine, CSS, components) is bundled in. The Host half (`plugin/index.js`) is
 * plain ESM and needs no build.
 */
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pluginDir = join(here, 'plugin')
const outputPath = join(pluginDir, 'client.js')
const PACKAGE_ID = '@local/dsh-inline-diff'

const banner = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(PACKAGE_ID)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
`
const footer = `
\t\treturn module.exports;
\t}
});
`

function wrapped(code) {
  return banner + code.trimEnd() + footer
}

const result = await build({
  entryPoints: [join(here, 'src/client/index.jsx')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  legalComments: 'none',
  charset: 'utf8',
})
if (result.errors.length > 0) {
  for (const error of result.errors) console.error(error)
  process.exit(1)
}
const code = wrapped(result.outputFiles[0].text)

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = await readFile(outputPath, 'utf8')
  } catch {
    current = ''
  }
  if (current !== code) {
    console.error('plugin/client.js is out of date — run node build.mjs')
    process.exit(1)
  }
  console.log('client.js is up to date')
} else {
  const { writeFile } = await import('node:fs/promises')
  await writeFile(outputPath, code, 'utf8')
  console.log(`wrote ${outputPath} (${(Buffer.byteLength(code) / 1024).toFixed(1)} KiB)`)
}

// Syntax-check both halves and the manifest resources.
for (const file of [outputPath, join(pluginDir, 'index.js')]) {
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (check.status !== 0) {
    console.error(check.stderr || check.stdout)
    process.exit(1)
  }
}
for (const file of ['package.json', 'locale/en.json', 'locale/zh.json']) {
  JSON.parse(await readFile(join(pluginDir, file), 'utf8'))
}
console.log('syntax + JSON checks passed')
