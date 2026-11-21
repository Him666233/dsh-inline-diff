/**
 * 第三方工具兼容清单（纯逻辑，无 DOM / React / fetch / 宿主 API 依赖）。
 *
 * 背景：DSH 的 keyed `tool.call.toolview` 只按 wire 工具名分发；官方包给内建
 * 工具注册了视图，**没有注册的工具名回退到官方通用行**。本插件内建的工具清单
 * 只能覆盖已知工具，第三方插件（dsh-ssh 的 ssh_*、MCP 桥接的工具等）新增的
 * 工具名会一直停在官方通用行，设置里的“其它工具调用 = 展开风格”对它不生效。
 *
 * 解决方式分两层：
 *   1. Host 半侧新增只读 `/tools`，从 DSH `tools` 服务导出当前可见 wire 工具名；
 *   2. 本模块从这份清单里挑出“还没有被任何人注册视图”的工具名，交给
 *      `index.jsx` 以展开风格视图接管。
 *
 * 关键取舍：**让位于已有视图**。清单里已经出现在 `tool.call.toolview` 里的
 * key（官方富结果卡片、第三方插件自己的定制行）一律跳过，因此 Read / todo /
 * 提问 / 图片 / Office 等富卡片和第三方自带视图保持原样；只有当某个工具
 * “谁都没有视图”时，才由本插件兜底。
 *
 * 失败与回退：输入不是数组、名字不是字符串、过长、重复 → 逐项跳过；上限之外
 * 的工具名本轮不注册（下一轮刷新仍有机会），返回的数组永远可直接遍历。
 */

/** 动态工具清单的刷新间隔：本地只读路由，30s 一次的开销可以忽略。 */
export const TOOL_CATALOG_REFRESH_MS = 30_000

/** 单个 wire 工具名长度上限（Host 侧同样限制；超出视为异常数据）。 */
export const TOOL_NAME_LIMIT = 200

/** 单轮最多补注册多少个工具视图：MCP 可能一次暴露数百个工具。 */
export const TOOL_CATALOG_LIMIT = 500

/**
 * 从 Host 工具名清单里挑出需要本插件兜底注册视图的工具名。
 *
 * @param {readonly string[]} names - Host `/tools` 返回的 wire 工具名。
 * @param {object} [options]
 * @param {Iterable<string>} [options.known] - 本插件已按设置接管的工具名
 *   （文件卡片 / 命令行 / 其它工具调用），动态清单不再重复注册。
 * @param {Iterable<string>} [options.claimed] - `tool.call.toolview` 里已被
 *   **别的注册者**占用的 key（官方富卡片、第三方定制行）。
 * @param {Iterable<string>} [options.already] - 本插件上一轮已动态注册的 key。
 * @param {number} [options.limit] - 本轮最多返回多少项（默认
 *   {@link TOOL_CATALOG_LIMIT}）。
 * @returns {string[]} 去重、保持 Host 顺序（Host 已排序）的待注册工具名。
 */
export function selectDynamicToolKeys(names, options = {}) {
  const known = toSet(options.known)
  const claimed = toSet(options.claimed)
  const already = toSet(options.already)
  const limit = Number.isFinite(options.limit) && options.limit > 0 ? Math.floor(options.limit) : TOOL_CATALOG_LIMIT
  const selected = []
  if (!Array.isArray(names)) return selected
  const seen = new Set()
  for (const name of names) {
    if (typeof name !== 'string' || name === '' || name.length > TOOL_NAME_LIMIT) continue
    if (seen.has(name)) continue
    seen.add(name)
    if (known.has(name) || claimed.has(name) || already.has(name)) continue
    selected.push(name)
    if (selected.length >= limit) break
  }
  return selected
}

/** 把任意可迭代值收窄成 Set（undefined / null / 非可迭代值 → 空集合）。 */
function toSet(value) {
  if (value instanceof Set) return value
  if (value === null || value === undefined) return new Set()
  try {
    return new Set(value)
  } catch {
    return new Set()
  }
}
