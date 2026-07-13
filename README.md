# 保存小红书收藏

这是一个用于 Codex 的小红书收藏导入 Skill。它通过已登录的原生小红书 Mac 应用复制收藏分享链接，再交给 Obsidian 的 Xiaohongshu Importer Plus 插件生成 Markdown 笔记并下载已配置的媒体文件。

面向 Codex 的完整执行规范见 [SKILL.md](SKILL.md)，本页用于中文介绍和安装说明。

## 主要功能

- 按小红书“收藏 > 笔记”当前网格顺序导入。
- 使用原始分享 URL 去重，避免重复生成笔记。
- 每条导入后立即核对 URL、Markdown 文件和账本记录。
- 长批次自动按最多 20 条分段检查。
- 支持中断后从最后一条有效账本记录继续。
- 重置收藏目录时保护保留笔记引用的附件。
- 使用只读脚本检查重复 URL、空笔记、缺失附件和截图文件。

## 依赖

- macOS 上已登录的小红书原生应用。
- 已打开目标库的 Obsidian。
- 已安装并启用 Xiaohongshu Importer Plus 插件。
- Codex 的 Computer Use 能力。
- Node.js，用于运行导入结果审计脚本。

Skill 会读取插件的 data.json 配置，并遵循其中的 noteFolder、imageFolder 和 downloadMedia，不会擅自修改插件设置。

## 安装

将仓库克隆到 Codex 的个人 Skills 目录：

~~~bash
git clone https://github.com/sep1107/save-rednote-favorites.git ~/.codex/skills/save-rednote-favorites
~~~

如果该目录已经存在，请先确认其中是否有未提交的个人修改，再决定更新方式。

## 使用示例

试导入最近可见的 5 条收藏：

~~~text
使用 $save-rednote-favorites，通过 Obsidian 小红书插件导入最近 5 条收藏，不保存截图。
~~~

继续导入 20 条：

~~~text
使用 $save-rednote-favorites，继续导入接下来的 20 条小红书收藏。
~~~

检查现有导入结果：

~~~text
使用 $save-rednote-favorites，审计当前小红书收藏笔记、URL 账本和附件引用。
~~~

## 审计

在 Obsidian 库根目录外也可以直接运行：

~~~bash
node scripts/audit_imports.mjs <Obsidian库路径> <笔记目录> <媒体目录>
~~~

审计会报告：

- 笔记和媒体文件数量。
- 账本行数与唯一 URL 数量。
- 重复 URL 和失效账本目标。
- 空笔记和缺失的本地图片引用。
- 不应出现的截图文件。
- 正文未包含原始 URL、只能依赖账本对应关系的警告。

## 安全边界

- 不点赞、评论、关注、转发、私信或取消收藏。
- 分享面板只选择“复制链接”。
- 不手工下载、转录、总结或截图小红书正文。
- 由 Obsidian 插件负责生成笔记和配置范围内的媒体。
- 不访问 Obsidian 库中的隐私禁区。
- 连续三次界面操作失败后停止，不盲目重试。

## 目录结构

~~~text
save-rednote-favorites/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── scripts/
    └── audit_imports.mjs
~~~
