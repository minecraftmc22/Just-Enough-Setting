# Just Enough Setting

<img src="assets/icon.png" alt="Just Enough Setting 图标" width="96">

Folia 播放器的模组（mod id `just-enough-setting`）。把系统媒体（Windows SMTC / 媒体浮窗）的标题栏、歌手栏、
专辑栏、浏览器标签页标题，以及 Steam 好友列表里那句「正在玩」，交给同一套可拖拽的片段列表自由编排：歌曲名、
歌手、专辑、歌词、翻译、逐词歌词、播放时长（已播放 + 进度条 + 总时长，模板可改）、自定义网站名与连接符
（连接符可以就是一个空格）；歌词延迟可自动精确排期到行时间戳，也可手动 ±3 秒；带快速预设、JSON 导入导出与
实时诊断面板。

系统媒体三行与窗口标题是 Folia 自己的界面状态，不是它给模组的接口：模组默认一次都不碰，需要你在模组面板里
明确同意之后才接管，随时可以撤销并还原。

这个仓库是**版本归档**，不是开发仓库。每个 `v*` 目录都是一份完整、可直接安装的模组快照，按当时的原样保存，
不再改动。

## 版本

| 目录 | 版本 | 归档日期 | 宿主契约 | 权限 | 入口 | 文件数 | 体积 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`v1.1.0/`](v1.1.0) | 1.1.0 | 2026-10-14 | Folium 1 | `ui.stage` | 仅客户端 | 12 | 156 KB |
| [`v1.1.1/`](v1.1.1) | 1.1.1 | 2026-10-14 | Folium 1 | `ui.stage` | 仅客户端 | 12 | 156 KB |
| [`v1.2.2/`](v1.2.2) | 1.2.2 | 2026-10-14 | Folium 1 | — | — | 1 | 12 KB |
| [`v1.2.3/`](v1.2.3) | 1.2.3 | 2026-11-11 | Folium 1 | `ui.stage` + `filesystem.data` | `index.cjs` + 客户端 | 34 | 8.5 MB |
| [`v1.2.4/`](v1.2.4) | 1.2.4 | 2026-11-11 | Folium 2 名字就绪（清单仍写 1） | `stageLayers` + `filesystem.data` | `index.cjs` + 客户端 | 37 | 8.8 MB |
| [`v1.3.0/`](v1.3.0) | 1.3.0 | 2026-11-12 | Folium 2 名字就绪（清单仍写 1） | `stageLayers` + `filesystem.data` | `index.cjs` + 客户端 | 38 | 9.1 MB |
| [`v1.3.1/`](v1.3.1) | 1.3.1 | 2026-11-12 | Folium 2 名字就绪（清单仍写 1） | `stageLayers` + `filesystem.data` | `index.cjs` + 客户端 | 38 | 9.1 MB |

「归档日期」取自本机备份目录的时间戳，不是发布日期。每个版本对应一个同名的 git 标签（`v1.1.0` … `v1.2.4`），
标签指向「加入该版本」的那次提交（`v1.1.0` … `v1.3.1`）。

## 各个版本

### v1.1.0 — 只有客户端

最早的形态：SMTC 三行 + 浏览器标签页标题的片段编排，纯客户端模组，没有主进程入口，也就没有 Steam 部分。
`mod.json` 的 `name` 此时还是「Just Enough Setting（SMTC）」。

### v1.1.1 — 同一条线上的修订

仍然只有客户端。相对 1.1.0，`client.mjs`、`lib/`（clock、compose、config、controller、i18n）与 `ui/`
（diagnostics、fragment-list、panel）都有改动，是 1.1.x 这一代最完整的一版。

### v1.2.2 — 增量备份，不是完整模组

这一版在本机只留下了**一个文件** `compose.mjs`（`lib/compose.mjs` 当时代的版本）。当时的备份习惯是「只备份
动过的文件」，所以没有整包可归档。

这个目录**不能直接安装**，它只用于考证 `compose.mjs` 在 1.2.2 时的样子。要跑 1.2.x，请用 `v1.2.3/`。
目录里刻意没有放额外的说明文件，保持快照原样。

### v1.2.3 — 加入 Steam

开始有主进程入口 `index.cjs`，直连 Steam 网络（登录你自己的账号，把状态报成非 Steam 游戏），因此新增
`filesystem.data` 权限用于存放刷新令牌。也是第一版带 `steam/vendor.cjs` 打包产物与 `steam/system.pem` 的
完整包。这是迁移到 Folium 2 之前的最后一版。

### v1.2.4 — Folium 2 适配

功能与 1.2.3 一致，改动全部是跟着 Folium 2 的改名走（见下节）。清单里 `folium` 仍写 `1`，因为当前参考构建的
`FOLIUM_VERSION` 仍是 `{ major: 1, minor: 9 }`，而 `validateManifest` 要求 major 严格相等——写 `2` 会被直接
拒绝加载。换成 major 2 的宿主时，只需要把这一行改成 `2`，代码不用再动。

相对 1.2.3 改动的文件：`mod.json`、`client.mjs`、`index.cjs`、`lib/clock.mjs`、`lib/config.mjs`、
`lib/controller.mjs`、`steam/connector.mjs`、`ui/diagnostics.mjs`，另加市场介绍图 `preview.png`（见下节）。

提交到模组市场前还改了一处目录布局：`steam/node_modules/lzma` 换成 `steam/deps/lzma`，`vendor.cjs` 里那句
`requireWithFallback("lzma-native", "lzma")` 改成指向 `./deps/lzma`。原因见下节。

归档 1.2.4 时还补了许可证文件：`LICENSE`（AGPL-3.0 全文）与 `steam/THIRD-PARTY-NOTICES.md`（bundle 里 41 个
第三方包的许可证原文）。两者都在模组目录里，会跟着签名包一起分发。

### v1.3.0 — 接管改为「用户同意后才生效」

1.2.4 里有两处上架审查不接受的写法：`lib/media-session.mjs` 用 `Object.defineProperty` 替换
`MediaSession.prototype.metadata` 的 setter，`lib/controller.mjs` 直接写 `document.title`。两处改的都是
Folia 自己的界面状态，不是它给模组的接口。

1.3.0 没有换实现（要沿用宿主发布的封面、并在宿主每次发布时接管，只能在这一层拦），而是把这两条输出整体挂到
**一次性的用户同意**上：

- **默认不接管**：没同意时一次都不碰——不装拦截、不写 `document.title`，面板上写宿主的那三个开关压暗且不吃指针；
- 面板顶部新增「接管范围（需要你同意）」，写明改的是哪两处、为什么需要同意；点「我了解，允许接管」并二次确认后才生效；
- 同意记在渲染进程的 `localStorage`（`lib/consent.mjs`），**不进配置导出，也不会被导入的配置顶替**——否则别人分享
  一份配置就等于替你点了同意；
- **随时可撤销**：撤销的那一刻把原型方法、宿主最后发布的 metadata 三行与标题一起还原，诊断面板会显示「未接管」。

其余功能（片段编排、歌词延迟、逐词、进度条、预设、导入导出、诊断、Steam）不变。相对 1.2.4 改动的文件：
`mod.json`、`client.mjs`、`lib/config.mjs`、`lib/controller.mjs`、`lib/i18n.mjs`、`lib/media-session.mjs`、
`ui/panel.mjs`、`ui/diagnostics.mjs`，新增 `lib/consent.mjs`；`preview.png` 换成 1.3.0 的版本。

### v1.3.1 — 版本号前进，Steam 产物改为可复现

功能代码与 1.3.0 **完全相同**，只有三处变化：

1. `mod.json` 与 `lib/config.mjs` 的版本号改成 1.3.1；
2. 仓库根新增 `.steam-bundle/`（`package.json`、`package-lock.json`、`build.mjs`、`README.md`）：把
   `steam/vendor.cjs` 的生成环境钉死，`cd .steam-bundle && npm ci && cd .. && node .steam-bundle/build.mjs`
   就能逐字节重建产物。这个目录在模组目录**外面**，不会被签名包收录。
3. `steam/vendor.cjs` 因此用这棵干净的依赖树重打了一次（包集合与旧产物一致，8,281,869 B）。

重打的原因：原来的产物来自开发仓库里混着宿主依赖的 `node_modules`，从本仓库内复现不出来。现在
`THIRD-PARTY-NOTICES.md` 的「产物中的版本」一列与 `.steam-bundle` 的 lock 一一对应，共 43 个包
（旧表是 41 行——`psl` 与 `zstddec` 的产物模块是 `.cjs`，此前被提取脚本漏掉，两行都已补上并附原文）。
`preview.png` 换成带 1.3.1 徽标的同一张图。

## 许可证

本仓库与全部版本目录均为 **AGPL-3.0**（[`LICENSE`](LICENSE) 是 FSF 的原文，未作改动）。

Steam 连接器里捆了第三方代码，各自的许可证**没有**被 AGPL 覆盖：

- `v1.3.1/steam/THIRD-PARTY-NOTICES.md` 汇总了 `steam/vendor.cjs` 里 43 个包的许可证原文、每个包的
  版权行与「产物中的版本」；清单是从产物的模块路径注释与 `.steam-bundle` 的 lock 里对着提取的，不是手抄。
- `v1.2.4/steam/THIRD-PARTY-NOTICES.md` 是当时那版（41 行）的原文，保留不动。
- `v1.2.4/steam/deps/lzma/LICENSE` 是 lzma 的 MIT 原文（它单独成目录，许可证跟着走）。
- 上架表单要求「包含第三方库时把它们的许可证文件放在模组目录里」，这两份就是为此准备的。

`v1.2.3/` 及更早的归档目录里没有 `LICENSE` 文件——它们是当时原样的快照，加进去就不再是「原样」了；
仓库根的 `LICENSE` 覆盖这些目录里的代码。

## 图标与市场介绍图

- `assets/icon.png`（1024×1024，圆角透明）与 `assets/icon.svg`（矢量原件，任意尺寸重出都清晰）。
- `v1.3.1/preview.png`：模组市场卡片顶部的 16:9 介绍图，1280×720，543 KB。`mod.json` 里的
  `preview` 指向它；宿主只校验路径与扩展名，推荐尺寸与 1 MB 上限来自 folium-compound 的提交要求。
- `v1.2.4/preview.png`：上一代（175 KB），用面板 DOM 拼的，界面对不上真机，已被替换。

1.3.x 这张图里的界面像素**全部取自真机截图**：右侧是设置面板「系统媒体（SMTC）」那一节的真实渲染，
左下是系统媒体卡片与 Steam 好友行，脚本只做裁切、放大与排版（`dev/folium/preview/preview-card.py`）。
1.2.4 那张是把面板 DOM 塞进假窗口拼的，所以看起来像界面但控件状态与真机不符。

## 从 Folium 1 到 Folium 2 的改名对照

| 旧名字（Folium 1） | 新名字（Folium 2） | 落在 |
| --- | --- | --- |
| 权限 `ui.stage` | `stageLayers` | `mod.json` |
| `api.storage.data` | `api.storage` | `index.cjs` |
| `api.lifecycle.onDeactivate` | `api.onDispose` | `index.cjs` |
| `settingsSections.register(…).params` | `.settings` | `client.mjs` |
| `params.subscribe` | `settings.onChange` | `lib/controller.mjs` |
| `ctx.subscribe` | `ctx.onChange` | `lib/clock.mjs` |
| `ctx.currentTime` | `ctx.lyricTime` | `lib/clock.mjs` |

兼容性要说清楚：Folium 1.9 的宿主里已经有 `stageLayers`，同时保留了一层旧名字兼容（把 `ui.stage` 读成
`stageLayers`，并给一条弃用警告）。所以在这一代宿主上，1.2.3 能跑但会警告，1.2.4 零警告。**Folium 2 起那层
兼容被删除**，`ui.stage` 会变成「unknown or unsupported permission」，1.1.x / 1.2.2 / 1.2.3 会被清单校验直接
拒掉；那时能用的只有 1.2.4（并把它的 `folium` 改成 `2`）。

## 安装

1. 选一个版本目录，把**目录里的内容**（`mod.json` 及其同级文件与子目录）整个复制到
   `%APPDATA%\Folia\mods\Just-Enough-Setting\`。目录名可以随意，宿主按 `mod.json` 的 `id` 识别模组。
2. 重启 Folia。首次启用会显示内容摘要并要求你确认信任这个模组。
3. 在模组面板里打开「SMTC 设置」分区调片段编排。

同一个 `id` 只能装一份，装新版本前先把旧目录移走或改名。Steam 相关设置需要 `filesystem.data` 权限，若清单
里声明了但宿主没给，模组会退回「这次会话内有效」的凭据。

## 关于 steam/vendor.cjs

`vendor.cjs` 是把 Steam 连接器连同依赖（`steam-user` 的 54 个包、3989 个文件、45 MB）打成的单文件，约 8 MB。
之所以必须打包：宿主给模组目录算内容摘要时有硬上限（2000 个文件 / 64 MB），超了会抛
`mod-content-unverifiable`，模组永远无法启用。

它是构建产物，1.3.1 起由仓库根的 `.steam-bundle/` 生成（依赖版本由 `package-lock.json` 钉死，
Node v22.22.2 / esbuild 0.28.2）。要重建：

```bash
cd .steam-bundle && npm ci
cd .. && node .steam-bundle/build.mjs      # 缺省指向 v1.3.1/
```

产物落在模组的 `steam/vendor.cjs`，与仓库里那份逐字节一致（`sha256 bfee3320…`）。脚本还会把
`@doctormckay/steam-crypto` 的 `system.pem` 复制过来并整包复制 `deps/lzma`——这两样都必须跟着产物走。

注意产物里有**一处路径依赖**：esbuild 给入口文件的模块注释写的是相对构建目录的路径
（`// ../../v1.3.1/steam/connector.mjs`）。所以对着 `v1.3.0/` 构建出来的文件除了这一行之外与 1.3.1 的
完全相同（字节数也一样），比对时以「默认目录构建」的结果为准。

还要带走 `steam/deps/lzma`：`steam-user` 用 `requireWithFallback('lzma-native', 'lzma')` 把包名当参数传进去，
打包器看不见这句 require，只能让它在运行时从磁盘解析。目录名刻意不叫 `node_modules`——那样上架时会被整层剔除。

## 凭据

仓库里**没有任何**账号密码或刷新令牌。登录用的凭据只在运行时写进宿主的模组存储（`api.storage`），落在 Folia 的
应用数据目录里，不进模组目录、也不进本仓库。`mod.json` 的片段设置同样只存布局，不含凭据。

## 说明

- `v1.2.4/` 里没有 `README.md`：开发仓库的模组目录里那份 169 KB 的 README 是 Folia 自己的《模组包规范》，
  不属于本模组，归档时略去。
- `v1.2.3/` 里的 `steam/node_modules/lzma` 是运行时依赖，不是误提交的依赖树。`v1.2.4/` 起改放
  `steam/deps/lzma`：folium-compound 的导入脚本会跳过任何一层叫 `node_modules` 的目录
  （`tools/ci/lib/source.mjs` 的 `isExcludedFromImport`），照原样提交的话签名包里会缺这个包，
  `require` 产物直接 `MODULE_NOT_FOUND`。
- `v1.2.4` 这个标签在提交到模组市场之前移动过三次：第一次补 `preview.png` 与清单里的 `preview`，
  第二次换 lzma 的目录布局，第三次补 `LICENSE` 与 `steam/THIRD-PARTY-NOTICES.md`。三次都发生在任何审查
  之前；相对第一次打标签时的内容，功能代码（`client.mjs`、`index.cjs`、`lib/`、`ui/`、`steam/connector.mjs`）
  一行未改，变动只有 `mod.json` 的 `preview` 字段、`vendor.cjs` 里 lzma 的 require 路径和新增的许可证文件。
