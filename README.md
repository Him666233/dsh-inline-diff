# Inline Diff · 内联差异

DeepSeek Harness 插件：为每次 `edit` / `write` 调用在对话中就地渲染内联差异卡片，并提供左右对照、行内字符级高亮、移动块与被动行号说明、Read 行范围展示。

- **作者**：[Him666233](https://github.com/Him666233)
- **仓库**：[Him666233/dsh-inline-diff](https://github.com/Him666233/dsh-inline-diff)
- **License**：MIT
- **当前版本**：1.0.0

> 设置项中的「展开风格 / Expanded」指展开式、平板式、类现代编码代理的透明输出效果；项目不包含任何第三方产品品牌字样。

## 兼容性

- **DSH 版本范围（`engines.dsh`）**：`>=0.2.2-rc.1 <0.3.0`
- **实测版本**：`0.2.2-rc.1`
- 不在 `engines.dsh` 范围内时，DSH 加载器会拒绝加载本插件，不会静默运行未验证版本
- 桌面端与 Web UI 若使用不同 profile，需要分别安装

## 安装

推荐通过 DSH 插件管理器，选择本目录（`plugin/`）作为本地插件安装；也可以手动 link：

```bash
cd ~/.dsh/profiles/<profile>
pnpm add link:/absolute/path/to/dsh-inline-diff/plugin
```

然后在 profile 的 `package.json` 中加入：

```json
{
  "dependencies": {
    "@local/dsh-inline-diff": "link:/absolute/path/to/dsh-inline-diff/plugin"
  },
  "dsh": {
    "profile": {
      "bundles": ["@local/dsh-inline-diff"]
    }
  }
}
```

桌面端与 Web UI 若使用不同 profile，需要分别安装。插件加载后刷新或重启 DSH。

## 功能

- edit/write 逐次内联差异，精确旧/新行号；
- 行内字符级高亮，只有真正变化的片段标深红/深绿；
- 移动块标注「移至/移自 旧/新 Lx–Ly」；
- 被动行号位移说明 `旧 Lx–Ly → 新 Lm–Ln · 行号顺延 ±N`；
- 左右对照弹窗与全文对照（依赖 Host 内存快照）；
- 固定文件/修改点表头；
- Read 行折叠时在文件名旁显示实际行范围，展开后保留 DSH 原生展示；
- 四项独立展示选项：文件卡片、命令执行行、其它工具调用、过程折叠。

## 设置

侧边栏底部「差异样式」或 DSH 设置页「内联差异 · 显示样式」：

| 设置项 | 展开风格 | DSH 原生 |
| --- | --- | --- |
| 文件修改卡片 | 本插件的内联差异卡片 | 官方 file-mutation 行 |
| 命令执行行 | 默认展开 IN/OUT 的扁平命令行 | 官方 bash/pwsh 行 |
| 其它工具调用 | 普通/详情类工具默认展开 IN/OUT | 官方卡片 |
| 过程折叠 | 写入 DSH verbose 偏好 | 保留用户已有偏好 |

设置保存在 localStorage（`dsh-inline-diff.settings.v3`）；旧 v2 值自动迁移。

## 数据与限制

插件没有网络请求或遥测。Host 只保留显示所需的修改前后文本到内存 LRU，不落盘；应用重启后的历史回放无法全文对照，会在放大弹窗内说明。超大文件自动降级为差异块模式。

完整说明、内部架构与已知限制见仓库根目录 [README](https://github.com/Him666233/dsh-inline-diff#readme)。

## License

MIT © 2026 [Him666233](https://github.com/Him666233)
