/**
 * 项目公开身份信息（唯一事实来源）。
 *
 * 职责：集中定义插件名、版本号、作者与仓库地址。设置页页脚（VERSION /
 * AUTHOR / AUTHOR_URL / REPO_URL）、原创声明里的项目名，以及文档截图/发行说明
 * 使用的版本号都从这里读取，避免版本号与仓库地址散落在多个模块里改漏。
 *
 * 依赖：无。纯常量模块，不 import 任何模块，也不访问 DOM / localStorage /
 * 网络，因此浏览器与 Node 单测环境都能直接加载。
 *
 * 输入输出：模块求值时导出常量，无函数、无副作用。
 *
 * 失败与回退：
 *   - 全部是静态字面量，读取不会失败，渲染层永远拿到稳定值；
 *   - 版本号只在发布时人工同步（package.json / CHANGELOG / release 说明），
 *     不在运行时从 package.json 探测（浏览器侧拿不到构建期清单）。因此发布
 *     流程里必须同时更新这里与 package 清单；
 *   - 仓库改名时只需改 REPO_URL（以及 package.json 的 repository），设置页与
 *     文档链接会一起生效；
 *   - AUTHOR_URL / REPO_URL 只用于 `<a href>`，渲染层不把它拼进 HTML，
 *     天然没有注入路径。
 */
export const PROJECT_NAME = 'DSH Inline Diff'
export const PROJECT_SHORT = 'dsh-inline-diff'
export const VERSION = '1.4.0'
export const AUTHOR = 'Him666233'
export const AUTHOR_URL = 'https://github.com/Him666233'
export const REPO_URL = 'https://github.com/Him666233/dsh-inline-diff'
