# Just Enough Setting

Folia 播放器的模组（mod id `just-enough-setting`）。把系统媒体（Windows SMTC / 媒体浮窗）的标题栏、歌手栏、
专辑栏、浏览器标签页标题，以及 Steam 好友列表里那句「正在玩」，交给同一套可拖拽的片段列表自由编排：歌曲名、
歌手、专辑、歌词、翻译、逐词歌词、播放时长（已播放 + 进度条 + 总时长，模板可改）、自定义网站名与连接符
（连接符可以就是一个空格）；歌词延迟可自动精确排期到行时间戳，也可手动 ±3 秒；带快速预设、JSON 导入导出与
实时诊断面板。

这个仓库是**版本归档**，不是开发仓库。每个 `v*` 目录都是一份完整、可直接安装的模组快照，按当时的原样保存，
不再改动。

## 版本

| 目录 | 版本 | 归档日期 | 宿主契约 | 权限 | 入口 | 文件数 | 体积 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`v1.1.0/`](v1.1.0) | 1.1.0 | 2026-10-14 | Folium 1 | `ui.stage` | 仅客户端 | 12 | 156 KB |
| [`v1.1.1/`](v1.1.1) | 1.1.1 | 2026-10-14 | Folium 1 | `ui.stage` | 仅客户端 | 12 | 156 KB |
| [`v1.2.2/`](v1.2.2) | 1.2.2 | 2026-10-14 | Folium 1 | — | — | 1 | 12 KB |
| [`v1.2.3/`](v1.2.3) | 1.2.3 | 2026-11-11 | Folium 1 | `ui.stage` + `filesystem.data` | `index.cjs` + 客户端 | 34 | 8.5 MB |
| [`v1.2.4/`](v1.2.4) | 1.2.4 | 2026-11-11 | Folium 2 名字就绪（清单仍写 1） | `stageLayers` + `filesystem.data` | `index.cjs` + 客户端 | 34 | 8.5 MB |

「归档日期」取自本机备份目录的时间戳，不是发布日期。每个版本对应一个同名的 git 标签（`v1.1.0` … `v1.2.4`），
标签指向「加入该版本」的那次提交。

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
`lib/controller.mjs`、`steam/connector.mjs`、`ui/diagnostics.mjs`。

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

它是构建产物，由开发仓库的 `dev/folium/steam-bundle/build.mjs` 生成。要重建：

```bash
# 先在任意目录装依赖
npm i steam-user
# 再指向那棵依赖树打包
STEAM_DEPS=<那个目录>/node_modules node dev/folium/steam-bundle/build.mjs
```

产物落在模组的 `steam/vendor.cjs`，同目录的 `system.pem` 也必须一起带走（`@doctormckay/steam-crypto` 在
`require` 时按 `__dirname` 读它）。

## 凭据

仓库里**没有任何**账号密码或刷新令牌。登录用的凭据只在运行时写进宿主的模组存储（`api.storage`），落在 Folia 的
应用数据目录里，不进模组目录、也不进本仓库。`mod.json` 的片段设置同样只存布局，不含凭据。

## 说明

- `v1.2.4/` 里没有 `README.md`：开发仓库的模组目录里那份 169 KB 的 README 是 Folia 自己的《模组包规范》，
  不属于本模组，归档时略去。
- `v1.2.3/` 与 `v1.2.4/` 里的 `steam/node_modules/lzma` 是运行时依赖，不是误提交的依赖树。
