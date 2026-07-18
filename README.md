# 保存小红书收藏

这是一个用于 Codex 的小红书收藏导入 Skill。它通过已登录的原生小红书 Mac 应用复制收藏分享链接，再交给 Obsidian 的 Xiaohongshu Importer Plus 插件生成 Markdown 笔记并下载已配置的媒体文件。

面向 Codex 的完整执行规范见 [SKILL.md](SKILL.md)，本页用于中文介绍和安装说明。

## 主要功能

- 支持把用户手动带到的当前视图作为唯一开始位置，只向下逐视口导入。
- 使用原始分享 URL 去重，避免重复生成笔记。
- 粘贴后核对当前卡片，拒绝小红书“复制成功”但剪贴板仍是上一条的情况。
- 每条导入后立即核对 URL、Markdown 文件和账本记录。
- 为视频等异步导入等待最多 90 秒，避免文件尚未落盘就误报失败或重复提交。
- 长批次自动按最多 20 条分段检查。
- 支持中断后从最后一条有效账本记录继续。
- 重置收藏目录时保护保留笔记引用的附件。
- 使用只读脚本检查重复 URL、空笔记、缺失附件和截图文件。

## 依赖

- macOS 上已登录的小红书原生应用。
- 已打开目标库的 Obsidian。
- 已安装并启用 Xiaohongshu Importer Plus 插件。
- 已在 Obsidian 快捷键设置中为命令 ID `xhs-importer:import` 配置快捷键。
- Codex 的 Computer Use 能力。
- 允许 Skill 通过只读进程查询实时解析当前小红书 `Wrapper/discover.app` 路径；沙箱阻止 `ps` 时需为随附解析脚本授权。
- Node.js，用于运行导入结果审计脚本。

Skill 会读取插件的 data.json 配置，并遵循其中的 noteFolder、imageFolder 和 downloadMedia，不会擅自修改插件设置。

## 安装

### 普通安装

将仓库直接克隆到 Codex 的个人 Skills 目录：

~~~bash
mkdir -p ~/.codex/skills
git clone https://github.com/sep1107/save-rednote-favorites.git ~/.codex/skills/save-rednote-favorites
~~~

### 作为开发项目维护

如果需要把 Git 仓库保存在项目目录中，只保留一份项目源码，再让个人 Skills 目录通过符号链接发现它：

~~~bash
PROJECT_DIR="/absolute/path/to/project/save-rednote-favorites"
mkdir -p ~/.codex/skills
git clone https://github.com/sep1107/save-rednote-favorites.git "$PROJECT_DIR"
ln -s "$PROJECT_DIR" ~/.codex/skills/save-rednote-favorites
~~~

不要同时维护项目目录和个人 Skills 目录中的两份独立仓库。如果 `~/.codex/skills/save-rednote-favorites` 已存在，先核对它的 Git 状态、文件内容和提交历史，不要直接覆盖。

安装后，在新的 Codex 任务中确认 `$save-rednote-favorites` 能被识别。

## 更新

直接安装和符号链接安装都可以通过个人发现路径更新。先确认没有未提交修改，再只接受快进更新：

~~~bash
git -C ~/.codex/skills/save-rednote-favorites status --short
git -C ~/.codex/skills/save-rednote-favorites pull --ff-only
~~~

如果第一条命令有输出，先处理本地修改，不要直接拉取。

## 使用示例

每次导入应指定总数或范围；如果没有指定，Skill 会建议先试 5 条。处理顺序以小红书“收藏 > 笔记”当前网格为准，不擅自称为时间顺序。

试导入最近可见的 5 条收藏：

~~~text
使用 $save-rednote-favorites，通过 Obsidian 小红书插件导入最近 5 条收藏，不保存截图。
~~~

继续导入 20 条：

~~~text
使用 $save-rednote-favorites，继续导入接下来的 20 条小红书收藏。
~~~

从已经手动定位的当前视图继续，只向下导入：

~~~text
使用 $save-rednote-favorites，从我当前视口最上方第一张完整可见的卡片开始，按从左到右、从上到下继续导入 20 条；不得回到顶部，位置丢失时立即停止。
~~~

检查现有导入结果：

~~~text
使用 $save-rednote-favorites，审计当前小红书收藏笔记、URL 账本和附件引用。
~~~

重置导入目录前先列出将删除的文件，并保留指定笔记及其附件：

~~~text
使用 $save-rednote-favorites，重置当前小红书收藏导入目录，但保留「示例笔记.md」及其附件；先列出拟删除文件，等我确认后再执行。
~~~

## 审计

可以从任意目录通过个人发现路径运行：

~~~bash
node ~/.codex/skills/save-rednote-favorites/scripts/audit_imports.mjs "/path/to/ObsidianVault" "小红书笔记目录" "小红书媒体目录"
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
- “复制成功”后仍以 Obsidian 导入框中的实际内容为准；内容与当前卡片不符时不提交。
- 不手工下载、转录、总结或截图小红书正文。
- 由 Obsidian 插件负责生成笔记和配置范围内的媒体。
- 不访问 Obsidian 库中的隐私禁区。
- 当前位置模式一旦丢失滚动位置就停止，不回到顶部重跑。
- 连续三次界面操作失败后停止，不盲目重试。

## 目录结构

~~~text
save-rednote-favorites/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
└── scripts/
    ├── audit_imports.mjs
    └── resolve_rednote_wrapper.sh
~~~
