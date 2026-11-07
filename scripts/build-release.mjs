#!/usr/bin/env node
/**
 * 打包 1.3.0 发行版（GitHub Release 附件）。
 *
 * 用法（仓库根目录）：
 *   node scripts/build-release.mjs
 *
 * 产物（写入 `release/`，该目录已在 .gitignore 中忽略，只作为 Release 资产上传）：
 *   - dsh-inline-diff-<version>.zip         完整源码包（顶层 dsh-inline-diff/）
 *   - dsh-inline-diff-<version>-plugin.zip  可直接安装的插件包（顶层 plugin/）
 *   - SHA256SUMS.txt                        上面两个 zip 的 SHA-256
 *   - RELEASE_NOTES-<version>.md            由维护者事先写好，本脚本只做存在性检查
 *
 * 设计要点（与旧版 1.2.6 的打包结构保持一致）：
 *   1. 完整包包含源码、测试、文档、双语截图、构建产物、脚本与工程配置；
 *      排除 node_modules、release 自身、日志与临时文件，避免把本地状态打进发行包。
 *   2. 插件包就是 `plugin/` 目录的逐文件拷贝，用户解压后可直接在 DSH「添加插件」中选择，
 *      或按 npm 包方式安装。
 *   3. 打包前做一次发布完整性校验（版本三处一致、bundle patch/客户端入口存在、
 *      包名在 manifest/patch/client.js 三处一致、构建产物与源码一致），任一项失败即中止，
 *      避免发出“装上了但加载不了”的包。
 *   4. ZIP 由本脚本用 Node 内置 zlib 直接写出（无第三方依赖，跨平台可用），
 *      文件名按 UTF-8 标记，解压后中文路径不会乱码。
 *
 * 回退与错误处理：
 *   - 任何校验失败都打印明确原因并以非零退出码结束，不生成半成品 zip；
 *   - 旧版本（其他版本号）的发行包会被移动到 `release/archive/<旧版本>/`，避免混淆；
 *   - 若已存在同版本 zip 会覆盖（发行包可重复生成，内容由源码与版本号决定）。
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync, renameSync, existsSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateRawSync } from 'node:zlib'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const releaseDir = join(root, 'release')

/** 读取并解析 JSON 文件；失败时给出包含文件路径的错误。 */
function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`cannot read JSON ${file}: ${String(error)}`)
  }
}

// ── 1. 版本与发布完整性校验 ─────────────────────────────────────────────────
const pluginManifest = readJson(join(root, 'plugin', 'package.json'))
const workspaceManifest = readJson(join(root, 'package.json'))
const projectSource = readFileSync(join(root, 'src', 'client', 'project.js'), 'utf8')
const version = pluginManifest.version
const problems = []

const projectVersion = /export const VERSION = '([^']+)'/.exec(projectSource)?.[1]
if (workspaceManifest.version !== version) problems.push(`root package.json version ${workspaceManifest.version} != plugin ${version}`)
if (projectVersion !== version) problems.push(`src/client/project.js VERSION ${projectVersion} != plugin ${version}`)
if (pluginManifest.private === true) problems.push('plugin/package.json must not be private for publishing')
if (pluginManifest.dsh?.bundle?.patch === undefined) problems.push('plugin/package.json lacks dsh.bundle.patch (DSH would treat it as a plain dependency)')
if (pluginManifest.exports?.['./client'] === undefined) problems.push('plugin/package.json lacks exports["./client"] (browser half)')

const patchFile = join(root, 'plugin', pluginManifest.dsh?.bundle?.patch ?? 'cordis.patch.yml')
const patchText = readFileSync(patchFile, 'utf8')
const patchName = /name:\s*'([^']+)'/.exec(patchText)?.[1]
if (patchName !== pluginManifest.name) problems.push(`cordis.patch.yml name ${patchName} != package name ${pluginManifest.name}`)

const clientText = readFileSync(join(root, 'plugin', 'client.js'), 'utf8')
const clientId = /id:\s*"([^"]+)"/.exec(clientText)?.[1]
if (clientId !== pluginManifest.name) problems.push(`plugin/client.js module id ${clientId} != package name ${pluginManifest.name}`)

// 构建产物必须与源码一致：发行包里的 client.js 不能落后于 src/client。
const check = spawnSync(process.execPath, [join(root, 'build.mjs'), '--check'], { cwd: root, encoding: 'utf8' })
if (check.status !== 0) problems.push(`build artifacts are stale: ${(check.stderr || check.stdout).trim()}`)

const notesPath = join(releaseDir, `RELEASE_NOTES-${version}.md`)
if (!existsSync(notesPath)) problems.push(`missing release notes: ${relative(root, notesPath)}`)

if (problems.length > 0) {
  console.error('release packaging aborted:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

// ── 2. 归档其他版本的发行包，保持 release/ 只聚焦当前版本 ───────────────────
mkdirSync(releaseDir, { recursive: true })
for (const name of readdirSync(releaseDir)) {
  const match = /^dsh-inline-diff-(.+?)(?:-plugin)?\.zip$/.exec(name)
  if (match === null || match[1] === version) continue
  const archiveDir = join(releaseDir, 'archive', match[1])
  mkdirSync(archiveDir, { recursive: true })
  renameSync(join(releaseDir, name), join(archiveDir, name))
  console.log(`archived old release asset: release/${name} -> release/archive/${match[1]}/`)
}
for (const name of readdirSync(releaseDir)) {
  if (!name.startsWith('RELEASE_NOTES-')) continue
  if (name === `RELEASE_NOTES-${version}.md`) continue
  const oldVersion = name.replace(/^RELEASE_NOTES-/, '').replace(/\.md$/, '')
  const archiveDir = join(releaseDir, 'archive', oldVersion)
  mkdirSync(archiveDir, { recursive: true })
  renameSync(join(releaseDir, name), join(archiveDir, name))
  console.log(`archived old release notes: release/${name} -> release/archive/${oldVersion}/`)
}

// ── 3. 收集文件清单 ────────────────────────────────────────────────────────
/** 完整源码包需要排除的目录/文件（本地状态、依赖、发行产物、日志与临时文件）。 */
function excluded(rel) {
  const parts = rel.split(sep)
  if (parts.includes('node_modules')) return true
  if (parts[0] === 'release') return true
  if (parts[0] === '.git') return true
  const base = parts[parts.length - 1]
  if (base.startsWith('.tmp-')) return true
  if (base.endsWith('.log')) return true
  if (base === '.DS_Store' || base === 'Thumbs.db') return true
  return false
}

/** 递归收集目录下的文件（相对 root 的路径，排序保证 zip 可复现）。 */
function walk(dir, prefix = '') {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name)
    const rel = prefix === '' ? name : join(prefix, name)
    if (excluded(rel)) continue
    const info = statSync(full)
    if (info.isDirectory()) out.push(...walk(full, rel))
    else if (info.isFile()) out.push(rel)
  }
  return out
}

const sourceFiles = walk(root).map((rel) => ({ rel, file: join(root, rel) }))
const pluginFiles = walk(join(root, 'plugin')).map((rel) => ({ rel, file: join(root, 'plugin', rel) }))

// ── 4. 极简 ZIP 写入（store/deflate + CRC32 + UTF-8 名称） ──────────────────
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    table[i] = value >>> 0
  }
  return table
})()

/** 计算一段字节的 CRC32（ZIP 校验用）。 */
function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** 把 Date 转成 ZIP 的 DOS 日期/时间字段。 */
function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

/**
 * 生成一个 zip 文件。
 * @param {string} target 输出路径。
 * @param {Array<{name: string, data: Buffer}>} entries 条目（name 使用 `/` 分隔，可含 UTF-8）。
 */
function writeZip(target, entries) {
  const chunks = []
  const central = []
  let offset = 0
  const now = new Date()
  const { time, day } = dosDateTime(now)
  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, 'utf8')
    const deflated = deflateRawSync(entry.data, { level: 9 })
    const useDeflate = deflated.length < entry.data.length
    const payload = useDeflate ? deflated : entry.data
    const method = useDeflate ? 8 : 0
    const crc = crc32(entry.data)
    const flags = 0x0800 // bit 11：文件名按 UTF-8 编码
    const header = Buffer.alloc(30)
    header.writeUInt32LE(0x04034b50, 0)
    header.writeUInt16LE(20, 4)
    header.writeUInt16LE(flags, 6)
    header.writeUInt16LE(method, 8)
    header.writeUInt16LE(time, 10)
    header.writeUInt16LE(day, 12)
    header.writeUInt32LE(crc, 14)
    header.writeUInt32LE(payload.length, 18)
    header.writeUInt32LE(entry.data.length, 22)
    header.writeUInt16LE(nameBytes.length, 26)
    header.writeUInt16LE(0, 28)
    chunks.push(header, nameBytes, payload)
    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(flags, 8)
    centralHeader.writeUInt16LE(method, 10)
    centralHeader.writeUInt16LE(time, 12)
    centralHeader.writeUInt16LE(day, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(payload.length, 20)
    centralHeader.writeUInt32LE(entry.data.length, 24)
    centralHeader.writeUInt16LE(nameBytes.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    // 外部属性：0o100644 表示普通文件（Unix 权限位），左移 16 位后必须转无符号，否则符号位溢出。
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    central.push(centralHeader, nameBytes)
    offset += header.length + nameBytes.length + payload.length
  }
  const centralBuffer = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuffer.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  writeFileSync(target, Buffer.concat([...chunks, centralBuffer, end]))
}

/** 把 {rel, file} 列表转换为 zip 条目（加顶层目录前缀）。 */
function zipEntries(files, topDir) {
  return files.map(({ rel, file }) => ({ name: `${topDir}/${rel.split(sep).join('/')}`, data: readFileSync(file) }))
}

// ── 5. 生成两个发行包并计算 SHA-256 ────────────────────────────────────────
const fullZip = join(releaseDir, `dsh-inline-diff-${version}.zip`)
const pluginZip = join(releaseDir, `dsh-inline-diff-${version}-plugin.zip`)
const fullEntries = zipEntries(sourceFiles, 'dsh-inline-diff')
const pluginEntries = zipEntries(pluginFiles, 'plugin')
writeZip(fullZip, fullEntries)
writeZip(pluginZip, pluginEntries)

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')
const sums = [
  `${sha256(pluginZip)}  dsh-inline-diff-${version}-plugin.zip`,
  `${sha256(fullZip)}  dsh-inline-diff-${version}.zip`,
]
rmSync(join(releaseDir, 'SHA256SUMS.txt'), { force: true })
writeFileSync(join(releaseDir, 'SHA256SUMS.txt'), sums.join('\n') + '\n', 'utf8')

const sizeKb = (file) => (statSync(file).size / 1024).toFixed(1)
console.log(`\nrelease ${version} packaged into ${relative(process.cwd(), releaseDir)}/`)
console.log(`  dsh-inline-diff-${version}.zip         ${fullEntries.length} files, ${sizeKb(fullZip)} KiB`)
console.log(`  dsh-inline-diff-${version}-plugin.zip  ${pluginEntries.length} files, ${sizeKb(pluginZip)} KiB`)
console.log('  SHA256SUMS.txt')
for (const line of sums) console.log(`  ${line}`)
