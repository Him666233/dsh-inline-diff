/**
 * Host API 路径解析的纯函数测试。
 *
 * 背景：插件默认请求根绝对路径 `/dsh-inline-diff/api/*`；DSH 部署在带路径前缀
 * 的反向代理后时，浏览器必须把请求发给 `<前缀>/dsh-inline-diff/api/*`，因此
 * `resolveApiPath()` 会按 `document.baseURI` 的目录部分拼接。这里覆盖根路径、
 * 前缀、桌面自定义协议（dsh-app://）、非法输入与异常回退，保证正常部署的请求
 * 与 1.4.1 之前完全一致。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveApiPath } from '../src/client/api.js'

test('root deployments keep the original absolute API path', () => {
  assert.equal(resolveApiPath('snapshot', 'http://127.0.0.1:52355/'), '/dsh-inline-diff/api/snapshot')
  assert.equal(resolveApiPath('tools', 'https://example.com/'), '/dsh-inline-diff/api/tools')
})

test('path-prefixed reverse proxies keep the prefix', () => {
  assert.equal(resolveApiPath('read', 'https://example.com/dsh/'), '/dsh/dsh-inline-diff/api/read')
  assert.equal(resolveApiPath('update/install', 'https://example.com/a/b/'), '/a/b/dsh-inline-diff/api/update/install')
})

test('desktop custom-protocol documents resolve to the same path', () => {
  // 桌面 Electron 的页面可能是 dsh-app://app/；URL 解析只取 pathname，
  // fetch 仍然落在同一个自定义协议 origin 上。
  assert.equal(resolveApiPath('snapshot', 'dsh-app://app/'), '/dsh-inline-diff/api/snapshot')
})

test('actions are normalized and never escape the API prefix', () => {
  assert.equal(resolveApiPath('/snapshot', 'http://host/'), '/dsh-inline-diff/api/snapshot')
  assert.equal(resolveApiPath('', 'http://host/'), '/dsh-inline-diff/api/')
})

test('missing or invalid base URIs fall back to the root path', () => {
  assert.equal(resolveApiPath('snapshot', undefined), '/dsh-inline-diff/api/snapshot')
  assert.equal(resolveApiPath('snapshot', ''), '/dsh-inline-diff/api/snapshot')
  assert.equal(resolveApiPath('snapshot', 'not a url'), '/dsh-inline-diff/api/snapshot')
})

test('a document without a trailing directory slash does not duplicate slashes', () => {
  assert.equal(resolveApiPath('snapshot', 'https://example.com/index.html'), '/dsh-inline-diff/api/snapshot')
})
