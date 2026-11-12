/**
 * 版本与更新功能的前端纯逻辑（可单测，不访问 DOM / 网络）。
 *
 * 职责：把 Host `/update/versions` 的响应收窄成设置页可直接渲染的行数据，
 * 并给出“当前版本 → 目标版本”应该显示哪个动作（更新 / 回退 / 重新安装）。
 *
 * 依赖：无。
 * 失败与回退：
 *   - 响应缺字段 / 版本号非法：跳过该行，绝不抛错；
 *   - 任意未知状态：按“不可安装”处理，安装按钮保持禁用；
 *   - 日期非法：返回空串（不显示发布时间）。
 */

/**
 * 解析 semver（仅前端用于排序/比较，不参与安装校验）。
 *
 * @param {unknown} text
 * @returns {{major:number,minor:number,patch:number,pre:string[]}|null}
 */
export function parseSemver(text) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(text ?? '').trim())
  if (match === null) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] === undefined ? [] : match[4].split('.'),
  }
}

/**
 * semver 比较：a<b 返回负数，a==b 返回 0，a>b 返回正数（含 prerelease 规则）。
 *
 * @param {unknown} left
 * @param {unknown} right
 * @returns {number}
 */
export function compareSemver(left, right) {
  const a = parseSemver(left)
  const b = parseSemver(right)
  if (a === null || b === null) return 0
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] - b[key]
  }
  if (a.pre.length === 0 && b.pre.length === 0) return 0
  if (a.pre.length === 0) return 1
  if (b.pre.length === 0) return -1
  const length = Math.max(a.pre.length, b.pre.length)
  for (let index = 0; index < length; index += 1) {
    const x = a.pre[index]
    const y = b.pre[index]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const xn = /^\d+$/.test(x) ? Number(x) : null
    const yn = /^\d+$/.test(y) ? Number(y) : null
    if (xn !== null && yn !== null) {
      if (xn !== yn) return xn - yn
      continue
    }
    if (xn !== null) return -1
    if (yn !== null) return 1
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/**
 * 把 Host 响应转成带徽标/可安装标记的行（按版本降序）。
 *
 * @param {object|null|undefined} payload Host `/update/versions` 响应。
 * @param {string|null|undefined} currentVersion 当前已装版本。
 * @returns {Array<{version:string,latest:boolean,current:boolean,publishedAt:string|null,deprecated:boolean,enginesDsh:string|null,installable:boolean,reason:string|null}>}
 */
export function buildVersionRows(payload, currentVersion) {
  const rows = []
  const versions = Array.isArray(payload?.versions) ? payload.versions : []
  const latest = typeof payload?.latest === 'string' ? payload.latest : null
  for (const item of versions) {
    if (item === null || typeof item !== 'object') continue
    if (typeof item.version !== 'string' || parseSemver(item.version) === null) continue
    const installable = item.installable !== false
    const reason = installable
      ? null
      : item.bundleMissing === true ? 'bundle-missing' : 'unavailable'
    rows.push({
      version: item.version,
      latest: item.version === latest || item.latest === true,
      current: currentVersion !== null && currentVersion !== undefined && item.version === currentVersion,
      publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : null,
      deprecated: typeof item.deprecated === 'string' || item.deprecated === true,
      enginesDsh: typeof item.enginesDsh === 'string' ? item.enginesDsh : null,
      installable,
      reason,
    })
  }
  rows.sort((a, b) => compareSemver(b.version, a.version))
  return rows
}

/**
 * 目标版本相对当前版本的动作。
 *
 * @param {string|null|undefined} currentVersion
 * @param {string|null|undefined} targetVersion
 * @returns {'update'|'rollback'|'reinstall'|null}
 */
export function installActionFor(currentVersion, targetVersion) {
  if (parseSemver(currentVersion) === null || parseSemver(targetVersion) === null) return null
  const order = compareSemver(targetVersion, currentVersion)
  if (order === 0) return 'reinstall'
  return order > 0 ? 'update' : 'rollback'
}

/**
 * 把 ISO 发布时间格式化成 `YYYY-MM-DD`（本地时区）；非法输入返回空串。
 *
 * @param {string|null|undefined} iso
 * @returns {string}
 */
export function formatPublishedAt(iso) {
  if (typeof iso !== 'string' || iso === '') return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
