# .steam-bundle — vendor.cjs 的复现环境

`v1.3.0/steam/vendor.cjs` 是用 esbuild 把 `steam/connector.mjs` 和它的依赖打成的单文件。
这个目录把复现它所需的一切钉死：依赖版本在 `package-lock.json` 里，构建参数在 `build.mjs` 里。

## 复现步骤

```bash
cd .steam-bundle
npm ci
cd ..
node .steam-bundle/build.mjs            # 缺省指向本仓库的 v1.3.0/
# 或：node .steam-bundle/build.mjs <别的模组目录>
```

产物：`<模组目录>/steam/vendor.cjs`，同时刷新 `system.pem` 与 `deps/lzma`。

## 版本

| 组件 | 版本 |
| --- | --- |
| Node.js（构建时使用） | v22.22.2 |
| esbuild | 0.28.2（`--target=node18 --platform=node --format=cjs`，参数在 `build.mjs`） |
| steam-user | 5.3.0 |
| lzma（运行时包，进 `steam/deps/lzma`） | 2.3.2 |
| 其余依赖 | 见 `package-lock.json`，全部精确钉死 |

复现产物与仓库里 `v1.3.0/steam/vendor.cjs` **逐字节一致**
（sha256 `5641b575ce714a68ce7a6b9b3db4c060b4fa164c38c9134e2552a5ed360958c8`，本机两次独立的
`npm ci` + 构建已验证一致）。banner 与 esbuild 的入口注释都用相对路径，与检出位置无关。

## 两个刻意的决定

- `.npmrc` 写了 `legacy-peer-deps=true`：`steam-user` 声明了 peerDependency `lzma-native`
  （原生模块），我们故意不装它 —— 运行时 `requireWithFallback("lzma-native", "lzma")` 会退到
  纯 JS 的 `lzma`，后者以精确版本列在 `dependencies` 里，由 `build.mjs` 整包复制到
  `steam/deps/lzma`。
- 运行时包目录叫 `deps/` 而不是 `node_modules/`：folium-compound 收录模组时会跳过任何一层叫
  `node_modules` 的目录，签名后的包里就没了，`require` 产物那一步直接失败。
  `build.mjs` 会把产物里的 `requireWithFallback("lzma-native", "lzma")` 改写成指向
  `./deps/lzma` 的相对路径。

## 第三方许可证

`v1.3.0/steam/THIRD-PARTY-NOTICES.md` 的「产物中的版本」一列与这里的 lock 一一对应。
