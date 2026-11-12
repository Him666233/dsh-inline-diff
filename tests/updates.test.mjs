/**
 * 版本与更新纯逻辑测试：semver 比较、版本行标记、动作判定、日期格式。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildVersionRows,
  compareSemver,
  formatPublishedAt,
  installActionFor,
  parseSemver,
} from '../src/client/updates.js'

test('compareSemver orders releases and prereleases correctly', () => {
  const ordered = ['0.1.0', '0.2.0-alpha.1', '0.2.0-alpha.2', '0.2.0-rc.1', '0.2.0', '1.0.0', '1.10.0']
  for (let index = 1; index < ordered.length; index += 1) {
    assert.ok(compareSemver(ordered[index - 1], ordered[index]) < 0, `${ordered[index - 1]} should be < ${ordered[index]}`)
    assert.ok(compareSemver(ordered[index], ordered[index - 1]) > 0)
    assert.equal(compareSemver(ordered[index], ordered[index]), 0)
  }
  assert.equal(parseSemver('not-a-version'), null)
  assert.equal(parseSemver('1.2'), null)
  assert.deepEqual(parseSemver('v1.2.3-beta.1'), { major: 1, minor: 2, patch: 3, pre: ['beta', '1'] })
})

test('buildVersionRows marks latest/current/unavailable and sorts descending', () => {
  const payload = {
    latest: '1.3.0',
    versions: [
      { version: '1.2.0', publishedAt: '2026-01-02T03:04:05Z', installable: true, enginesDsh: '>=0.2.2-rc.1' },
      { version: '1.3.0', publishedAt: '2026-02-02T03:04:05Z', installable: true },
      { version: '0.0.0-stage', publishedAt: null, installable: false, bundleMissing: true },
      { version: 'bogus', installable: true },
      null,
    ],
  }
  const rows = buildVersionRows(payload, '1.2.0')
  assert.deepEqual(rows.map(row => row.version), ['1.3.0', '1.2.0', '0.0.0-stage'])
  assert.equal(rows[0].latest, true)
  assert.equal(rows[0].current, false)
  assert.equal(rows[1].current, true)
  assert.equal(rows[2].installable, false)
  assert.equal(rows[2].reason, 'bundle-missing')
  assert.equal(buildVersionRows(null, '1.0.0').length, 0)
})

test('installActionFor distinguishes update / rollback / reinstall', () => {
  assert.equal(installActionFor('1.2.0', '1.3.0'), 'update')
  assert.equal(installActionFor('1.3.0', '1.2.0'), 'rollback')
  assert.equal(installActionFor('1.3.0', '1.3.0'), 'reinstall')
  assert.equal(installActionFor('1.3.0', 'nope'), null)
})

test('formatPublishedAt prints local YYYY-MM-DD and tolerates bad input', () => {
  assert.match(formatPublishedAt('2026-02-02T03:04:05Z'), /^2026-02-0[12]$/)
  assert.equal(formatPublishedAt(null), '')
  assert.equal(formatPublishedAt('not-a-date'), '')
})
