# 发布到 npm：让 `dsh plugin add` 直接安装

本文说明如何把本插件发布到 npm，使其他人只要执行下面这一条命令（或等价地在 Web UI 里输入包名）就能安装：

```bash
dsh plugin add @him666233/dsh-inline-diff
```

## 发布节奏（本项目约定）

1. 本地完成代码、文档、双语截图与发行版打包，跑通全部检查（`node build.mjs --check`、`npm test`、`npm pack --dry-run`）；
2. **先**把源码提交到 GitHub，并创建 Release 上传 `release/` 下的两个 zip、`SHA256SUMS.txt`、`RELEASE_NOTES-<版本>.md`；
3. GitHub 内容确认无误后，**再**执行 `npm publish`。npm 版本一旦发布不可撤回（只能 `npm deprecate`），所以顺序不能反。

当前目标版本：**1.3.0**（首次 npm 发布版本）；npm 用户名已确定为 `him666233`，对应 scope `@him666233`。在收到明确发布指令前**不要**执行 `npm publish`。

## 一、DSH 插件的发布形态

DSH 插件就是一个普通的 npm 包，`package.json` 里多一个 `dsh` 清单声明。`dsh plugin add <包名>` 的实际行为是：

1. 在当前 profile 目录执行 `pnpm add <包名>`（装到该 profile 的 `node_modules`）；
2. 读取该包 `package.json`，检查 `engines.dsh`（或 `@deepseek-ai/dsh*` peer 依赖）与当前 DSH 版本是否兼容，不兼容会在安装前直接拒绝；
3. 如果包声明了 `dsh.bundle.patch`，把该 patch 文件追加进 profile 的 `dsh.profile.bundles` 并加载；**没有声明 `dsh.bundle.patch` 的包只会被当作普通依赖**，不会成为插件（Web 插件页的「添加插件」会直接以 `not-a-bundle` 拒绝）。

所以「像 `dshbase-catalog` 那样安装」的本质就是：**把包发布到 npm，并在清单里声明 `dsh.bundle.patch`**。本插件已经具备全部条件，缺的只是发布这一步。

## 二、包名出现在哪里

npm 包名是整条安装链的主键，以下三处必须完全一致：

| 位置 | 说明 |
|---|---|
| `plugin/package.json` 的 `name` | 唯一事实来源 |
| `plugin/cordis.patch.yml` 里 insert 行的 `name` | 由 `build.mjs` 生成 |
| `plugin/client.js` 里的 `window.__ModuleLoader__.load({ id })` | 由 `build.mjs` 生成 |

不要手工只改其中一处。需要换包名（例如 npm 用户名不是 `him666233`）时执行：

```bash
node scripts/set-package-name.mjs @你的npm用户名/dsh-inline-diff
```

脚本会：改写 `plugin/package.json` 的 `name` → 同步 README 中的包名 → 重新生成 `client.js` 与 `cordis.patch.yml`（并做语法/JSON 校验）。改完照常测试、发布即可。

## 三、一次性准备

1. **注册 npm 账号**：<https://www.npmjs.com/signup>。用户名会成为作用域包的 scope。本项目的 npm 用户名为 **`him666233`**，因此包名为 `@him666233/dsh-inline-diff`；如改用其他账号，需要先运行改名脚本换成 `@<账号名>/dsh-inline-diff` 再发布。
2. **在本机登录**：

   ```bash
   npm login     # 浏览器完成登录与 2FA
   npm whoami    # 应输出你的用户名
   ```

3. **作用域权限**：`@scope/name` 的 scope 必须是你的用户名或你拥有的 npm org。`plugin/package.json` 已配置 `"publishConfig": { "access": "public" }`，首次发布会自动公开，无需再加 `--access public`。

> 也可以不使用作用域，改成独立包名（如 `dsh-inline-diff-zh`，发布前用 `npm view <name>` 确认未被占用）。
> 注意：通用名 `dsh-inline-diff` 已被他人占用（维护者 JanEickholt），不要使用。

## 四、每次发布前的检查

在本仓库根目录执行：

```bash
npm install                  # 仅首次或依赖变化时需要
node build.mjs               # 重新生成 plugin/client.js 与 plugin/cordis.patch.yml
node build.mjs --check       # 校验已提交产物与源码、包名一致（CI 也跑这个）
npm test                     # 124 项单元测试
cd plugin
npm pack --dry-run           # 确认发布文件清单
```

`npm pack --dry-run` 应列出 9 个文件：`package.json`、`cordis.patch.yml`、`client.js`、`index.js`、`locale/en.json`、`locale/zh.json`、`icon.svg`、`README.md`、`LICENSE`（`src/`、`tests/`、`docs/` 不会进包）。

## 五、正式发布

```bash
cd plugin
npm publish
```

- 如果 npm 账号开启了 2FA，`npm publish` 会要求一次性验证码：按提示输入，或使用 `npm publish --otp=123456`。
- 发布成功后可验证：

  ```bash
  npm view @him666233/dsh-inline-diff version
  npm view @him666233/dsh-inline-diff dist-tags
  ```

- 常见失败：
  - `E403`：登录账号不是该 scope 的拥有者，或包名归属他人 → 用改名脚本换成自己的 scope / 新名字；
  - `E402`：作用域包被当成私有包发布 → 确认 `publishConfig.access = "public"` 存在；
  - `EOTP`：需要 2FA 验证码，用 `--otp` 重试；
  - `EPUBLISHCONFLICT`：该版本号已存在 → 提升 `version` 后重新发布（npm 不允许重发同一版本）。

## 五之二、打包 GitHub Release 发行版（npm 发布前完成）

先确认版本号已更新（`plugin/package.json`、根 `package.json`、`src/client/project.js` 三处一致），并已写好 `release/RELEASE_NOTES-<版本>.md`（中文在上、英文在下），然后：

```bash
node build.mjs            # 重建 plugin/client.js 与 plugin/cordis.patch.yml
node build.mjs --check    # 产物与源码/包名一致
npm test                  # 124 项全部通过
node scripts/build-release.mjs
```

`scripts/build-release.mjs` 会：

1. 做发布完整性校验（三处版本号一致、`dsh.bundle.patch` / `exports["./client"]` 存在、`cordis.patch.yml` 的 name、`client.js` 的模块 id 与包名一致、构建产物与源码一致、发行说明存在），任何一项不通过都不会生成 zip；
2. 把旧版本的发行包移入 `release/archive/<旧版本>/`，保持 `release/` 聚焦当前版本；
3. 生成 `release/dsh-inline-diff-<版本>.zip`（完整源码包，顶层 `dsh-inline-diff/`，排除 `node_modules`、`release/`、日志与临时文件）、`release/dsh-inline-diff-<版本>-plugin.zip`（可直接安装的插件包，顶层 `plugin/`）与 `release/SHA256SUMS.txt`（两个 zip 的 SHA-256）。

然后把这三个文件 **加上** `RELEASE_NOTES-<版本>.md` 作为 GitHub Release 附件上传（**不要**把 `release/` 提交进源码树）。下载校验：

```bash
# Windows
certutil -hashfile dsh-inline-diff-<版本>-plugin.zip SHA256
# macOS / Linux
shasum -a 256 dsh-inline-diff-<版本>-plugin.zip
```

## 六、发布后的安装验证（用户视角）

```bash
# 新环境/临时 profile 验证（不会影响自己的桌面 profile）
dsh plugin --profile __npm-probe add @him666233/dsh-inline-diff
```

安装后检查 `<DSH_HOME>/profiles/__npm-probe/package.json`：`dependencies` 与 `dsh.profile.bundles` 都应包含 `@him666233/dsh-inline-diff`。验证完可删除该临时 profile。

在 DSH 用户界面里的等价操作：**侧边栏「插件」→「添加插件」→ 输入包名**（对话框里说明的「`dsh plugin add` 后面那一段」就是包名）。桌面端与 Web UI 使用不同 profile 时，需要分别安装；安装后刷新页面或重启 DSH 生效。

### 把自己机器上现有的本地 link 版换成 npm 版

当前桌面 profile 装的是本地 link 包 `@local/dsh-inline-diff`，与 npm 版是同一个插件的两份副本，不要同时启用：

1. 完全退出 DeepSeek Harness（Desktop 运行时会占用 profile 锁）；
2. 移除旧的本地 link 包（使用 Desktop 自带 CLI，或 Web 插件页卸载/停用）；
3. 安装 npm 版：`dsh plugin add @him666233/dsh-inline-diff`（或在 Web 插件页添加）；
4. 重新打开 DSH，确认插件页中只剩 npm 版且已启用。

## 七、版本更新流程

1. 修改代码后：`node build.mjs` → `node build.mjs --check` → `npm test`；
2. 提升 `plugin/package.json` 的 `version`（遵循 SemVer），同步更新 `CHANGELOG.md` 与 README 的「当前版本」；
3. `cd plugin && npm publish`；
4. 已发布版本不能重复使用；预发布可以用 `npm publish --tag next`，验证后再用 `npm publish --tag latest` 提升（或下次正式版覆盖 latest）。

用户侧升级：`dsh plugin add @him666233/dsh-inline-diff@<新版本>`，或在插件页卸载后重装（插件管理器页面也提供第三方组合包的版本更新入口）。

## 八、DSH 安装校验清单（发布前自查）

| 清单字段 | 作用 | 本包取值 |
|---|---|---|
| `name` | profile 依赖名 / bundle 名 / 客户端模块 id | `@him666233/dsh-inline-diff` |
| `dsh.bundle.patch` | 声明这是组合包（缺失则不算插件） | `./cordis.patch.yml` |
| `cordis.patch.yml` insert 行的 `name` | Host 半侧模块名，必须等于包名 | `@him666233/dsh-inline-diff` |
| `engines.dsh` | DSH 版本门槛 | `>=0.2.2-rc.1 <0.3.0` |
| `exports["."]` | Host 半侧入口 | `./index.js` |
| `dsh.client` + `exports["./client"]` | 浏览器半侧声明与入口 | `platform: web`，`./client.js` |
| `exports["./locale/*.json"]` / `./icon` | 插件页展示的标题、描述与图标 | 已提供 |
| `files` | npm 发布内容白名单 | 见上 |
| `publishConfig.access` | 作用域包公开可见 | `public` |

## 九、常见问题

- **刚发布完装不到最新版**：DSH 会依次询问 npm 官方源与 npmmirror，新版本在镜像上可能有同步延迟；官方源能问到就不会有问题。若 profile 配置了 pnpm 的 `minimumReleaseAge`，新版本会被暂缓，可显式指定版本号安装或把包加入 `minimumReleaseAgeExclude`。
- **安装成功但功能没出现**：确认装进了 DSH 当前使用的 profile；桌面端需要重启；查看 `<profile>/.plugin-manager/logs/` 下最近一次 pnpm 日志。
- **两个版本同时生效导致报错**：同一插件不要在同一个 profile 里同时保留 link 版与 npm 版（两者会各自注册同一批 slot）。
- **npm 包名是否可以以后改**：可以，但旧包名会一直存在；换名后需要重新发布一次（新包名从该版本开始），并同步更新 README / 仓库说明。
