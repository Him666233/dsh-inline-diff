#!/usr/bin/env node
/**
 * 一键修改可安装插件的 npm 包名（唯一入口）。
 *
 * 用法：
 *   node scripts/set-package-name.mjs @your-npm-name/dsh-inline-diff
 *   node scripts/set-package-name.mjs dsh-inline-diff-some-suffix
 *
 * 为什么需要这个脚本：DSH 的整条安装链都以 npm 包名为主键——
 *   1) profile 的 `dsh.profile.bundles` 条目（由 `dsh plugin add` 写入）；
 *   2) `plugin/cordis.patch.yml` 里 insert 行的 `name`（Host 半侧模块名）；
 *   3) 构建产物 `plugin/client.js` 里的浏览器模块 id。
 * 任何一处与 `plugin/package.json` 的 `name` 不一致都会导致“装上了但插件不加载”。
 * 因此这里只改 `plugin/package.json`（唯一事实来源），再：
 *   - 同步所有文档中出现的旧包名（中英文 README、发布指南、仓库说明、发行说明）；
 *   - 调用 `build.mjs` 重新生成 `client.js` 与 `cordis.patch.yml`。
 *
 * 边界与回退：
 *   - 包名必须符合 npm 规则：小写、可选 scope、长度 ≤ 214，否则直接拒绝；
 *   - 文档不存在时跳过（ENOENT 容错），不会因为缺某个版本的发行说明而整体失败；
 *   - 新旧名字相同则直接退出（幂等）；
 *   - `build.mjs` 失败时沿用其非零退出码，并明确提示“包名已写入但构建失败”，避免静默留下半成品。
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const manifestPath = join(root, 'plugin', 'package.json')
// npm 包名：可选的小写 scope，然后是小写名字段；长度另有上限。
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/
const MAX_NAME_LENGTH = 214

/**
 * 收集需要同步包名的文档文件。
 * 固定列表覆盖中英文主文档、插件包 README 与维护者文档；
 * `release/` 下的发行说明按文件名模式收集，避免硬编码版本号（新增版本无需改脚本）。
 * @returns {Promise<string[]>} 存在的文件绝对路径数组。
 */
async function textTargets() {
  const fixed = [
    join(root, 'README.md'),
    join(root, 'README.en.md'),
    join(root, 'plugin', 'README.md'),
    join(root, 'plugin', 'README.en.md'),
    join(root, 'docs', 'publish.md'),
    join(root, 'docs', 'display-behavior.md'),
    join(root, 'docs', 'display-behavior.en.md'),
  ]
  let notes = []
  try {
    const names = await readdir(join(root, 'release'))
    notes = names
      .filter((name) => /^RELEASE_NOTES-.*\.md$/.test(name))
      .map((name) => join(root, 'release', name))
  } catch {
    // release/ 不存在时没有发行说明可同步，不影响改名。
    notes = []
  }
  return [...fixed, ...notes]
}

const next = process.argv[2]
if (next === undefined) {
  console.error('usage: node scripts/set-package-name.mjs <name|@scope/name>')
  process.exit(1)
}
if (next.length > MAX_NAME_LENGTH || !PACKAGE_NAME.test(next)) {
  console.error(`not a publishable npm package name: ${JSON.stringify(next)}`)
  console.error('use lowercase letters, digits, ".", "_", "-"; a scope looks like @your-npm-name/package')
  process.exit(1)
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const previous = manifest.name
if (previous === next) {
  console.log(`plugin/package.json already uses ${next}`)
  process.exit(0)
}

manifest.name = next
await writeFile(manifestPath, JSON.stringify(manifest, undefined, 2) + '\n', 'utf8')

for (const file of await textTargets()) {
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  if (!text.includes(previous)) continue
  await writeFile(file, text.split(previous).join(next), 'utf8')
  console.log(`updated ${file.slice(root.length + 1)}`)
}

const built = spawnSync(process.execPath, [join(root, 'build.mjs')], { cwd: root, stdio: 'inherit' })
if (built.status !== 0) {
  console.error('\npackage name was written, but the artifact build failed; fix the build error and re-run `node build.mjs`')
  process.exit(built.status ?? 1)
}

console.log(`\nrenamed ${previous} -> ${next}`)
console.log('next steps:')
console.log('  npm test')
console.log('  cd plugin && npm pack --dry-run')
console.log(`  npm publish    # publishes ${next}`)
