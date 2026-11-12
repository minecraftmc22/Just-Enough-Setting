/*
 * 把 Steam 连接器和它的依赖打成一个文件，复现 v1.3.1/steam/vendor.cjs。
 *
 *   cd .steam-bundle && npm ci
 *   node .steam-bundle/build.mjs [模组目录]
 *
 * 模组目录缺省为本仓库的 v1.3.1/（也就是投稿 issue 里指向的目录）。
 * 产物：<模组目录>/steam/vendor.cjs，外加同目录的 system.pem 与 deps/lzma。
 *
 * 为什么必须打包：宿主用 computeModDigest 给模组目录算内容摘要，绑定用户的
 * 「信任这个模组」决定。那个函数有硬上限 —— 2000 个文件 / 64MB，超了直接抛
 * mod-content-unverifiable，模组永远无法启用。而 steam-user 的依赖树是
 * 54 个包 / 3989 个文件 / 45MB。打包后是 1 个约 8MB 的文件。
 *
 * 复现要点（与 package-lock.json 配合）：
 * - 依赖版本全部由 lock 钉死（steam-user 5.3.0、esbuild 0.28.2，其余见 lock）；
 * - .npmrc 里 legacy-peer-deps=true：steam-user 声明了 peerDependency lzma-native
 *   （原生模块），我们故意不装它 —— 运行时代码 requireWithFallback("lzma-native",
 *   "lzma") 会退到纯 JS 的 lzma，lzma 以 EXACT 版本 2.3.2 列在 dependencies 里；
 * - esbuild 用 --target=node18 --format=cjs --platform=node，顺序和参数都在脚本里，
 *   不要改，改一个字节产物都会变。
 */

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const MOD_DIR = path.resolve(process.argv[2] || path.join(REPO_ROOT, 'v1.3.1'));
const STEAM_DIR = path.join(MOD_DIR, 'steam');
const ENTRY = path.join(STEAM_DIR, 'connector.mjs');
const OUT_FILE = path.join(STEAM_DIR, 'vendor.cjs');
const PEM_SOURCE = '@doctormckay/steam-crypto/system.pem';

/**
 * esbuild 静态分析不了、只能留到运行时再 require 的包。
 *
 * `steam-user/components/cdn_compression.js` 里写的是
 * `requireWithFallback('lzma-native', 'lzma')` —— 包名是当参数传进去的，
 * 所以打包器看不见，产物里留了一句 `require(模块名)`。`lzma-native` 是原生模块、
 * 本来就没装，于是运行时会去要 `lzma`，找不到就抛 MODULE_NOT_FOUND，连 require
 * 产物这一步都会失败（不止是解压功能不可用）。
 *
 * lzma 是纯 JS、零依赖、16 个文件，整体复制过来最省事：它自己的 index.js 用
 * `require(path.join(__dirname, 'src', 'lzma_worker.js'))` 读同目录的文件，
 * 所以不能只挑一个文件放。放在 `steam/deps/lzma`（不能叫 node_modules：上架
 * folium-compound 时，导入脚本会把任何一层叫 node_modules 的目录整个跳过），
 * 产物里那句 require 也改成显式相对路径。
 *
 * 依赖树里另外两处外部 require（bytebuffer 的 `memcpy`、debug 的 `supports-color`）
 * 都写在 try/catch 里，属于可选依赖，缺了会安静降级，不用管。
 */
const RUNTIME_PACKAGES = ['lzma'];

/** 同上，不能叫 node_modules。 */
const RUNTIME_DIR = 'deps';

const DEPS_DIR = path.resolve(process.env.STEAM_DEPS || path.join(HERE, 'node_modules'));

/** esbuild：环境变量优先，其次 .steam-bundle/node_modules 里的 JS 入口（用当前 node 跑，
 * 不走 .bin 的 .cmd 垫片 —— 新版 Node 出于安全原因禁止直接 spawn .cmd/.bat）。 */
const findEsbuild = () => {
  const explicit = process.env.ESBUILD_BINARY;
  if (explicit) {
    if (!fs.existsSync(explicit)) throw new Error(`ESBUILD_BINARY 指向的文件不存在：${explicit}`);
    return { cmd: process.execPath, args: [explicit] };
  }
  const entry = path.join(DEPS_DIR, 'esbuild', 'bin', 'esbuild');
  if (!fs.existsSync(entry)) {
    throw new Error('找不到 esbuild。先在 .steam-bundle 里 `npm ci`。');
  }
  return { cmd: process.execPath, args: [entry] };
};

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

/** 宿主的 computeModDigest 超过这个规模就不给摘要，模组将无法启用。 */
const DIGEST_HINT = '2000 个文件 / 64MB';

const countFiles = (dir) => {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += countFiles(full);
    else if (entry.isFile()) total += 1;
  }
  return total;
};

const main = () => {
  if (!fs.existsSync(ENTRY)) throw new Error(`连接器源码不存在：${ENTRY}`);
  const depsCheck = path.join(DEPS_DIR, 'steam-user');
  if (!fs.existsSync(depsCheck)) {
    throw new Error(`在 ${DEPS_DIR} 里找不到 steam-user。先在 .steam-bundle 里 \`npm ci\`。`);
  }

  const esbuild = findEsbuild();
  const banner = [
    '/* eslint-disable */',
    '// 自动生成，请勿手改。',
    `// 源码：${path.relative(MOD_DIR, ENTRY).replace(/\\/g, '/')}`,
    '// 重新生成：node .steam-bundle/build.mjs',
  ].join('\n');

  console.log(`esbuild   ${esbuild.args[0]}（node ${process.version}）`);
  console.log(`依赖目录  ${DEPS_DIR}`);
  console.log(`入口      ${ENTRY}`);

  execFileSync(
    esbuild.cmd,
    [
      ...esbuild.args,
      ENTRY,
      '--bundle',
      '--platform=node',
      '--format=cjs',
      '--target=node18',
      `--outfile=${OUT_FILE}`,
      `--banner:js=${banner}`,
      '--log-level=warning',
    ],
    {
      cwd: DEPS_DIR,
      stdio: 'inherit',
      // esbuild 靠 cwd 上溯解析 node_modules，所以必须站在依赖目录里跑。
      env: { ...process.env, NODE_PATH: DEPS_DIR },
    },
  );

  // steam-crypto 运行时读的那个公钥，得跟产物放一起。
  const pemSource = path.join(DEPS_DIR, PEM_SOURCE);
  if (!fs.existsSync(pemSource)) throw new Error(`找不到 ${pemSource}`);
  const pemTarget = path.join(STEAM_DIR, 'system.pem');
  fs.copyFileSync(pemSource, pemTarget);

  // 静态分析漏掉的那几个包，整包复制到产物旁边的 deps/，让运行时解析得到。
  const runtimeDir = path.join(STEAM_DIR, RUNTIME_DIR);
  fs.rmSync(runtimeDir, { recursive: true, force: true });
  let copiedFiles = 0;
  for (const name of RUNTIME_PACKAGES) {
    const from = path.join(DEPS_DIR, name);
    if (!fs.existsSync(from)) throw new Error(`依赖目录里没有 ${name}（${from}）`);
    const to = path.join(runtimeDir, name);
    fs.cpSync(from, to, { recursive: true });
    copiedFiles += countFiles(to);
    console.log(`运行时包  ${RUNTIME_DIR}/${name}`);
  }

  // 产物里那句 `require(模块名)` 指向相对路径，否则运行时只会去 node_modules 找。
  const CALL = 'requireWithFallback("lzma-native", "lzma")';
  const vendorSource = fs.readFileSync(OUT_FILE, 'utf8');
  const occurrences = vendorSource.split(CALL).length - 1;
  if (occurrences !== 1) {
    throw new Error(`产物里 ${CALL} 出现 ${occurrences} 次，期望恰好 1 次；esbuild 或 steam-user 换版本后要重新确认`);
  }
  fs.writeFileSync(
    OUT_FILE,
    vendorSource.replace(CALL, `requireWithFallback("lzma-native", "./${RUNTIME_DIR}/lzma")`),
  );

  const lzma = createRequire(import.meta.url)(path.join(runtimeDir, 'lzma'));
  if (typeof lzma?.decompress !== 'function') {
    throw new Error(`${RUNTIME_DIR}/lzma 没有导出 decompress，复制不完整`);
  }

  // 自检：真的 require 一次产物。正则扫不出变量形式的 require，只有这一步能证明
  // 运行时不会缺模块 —— 缺了的话这里就会抛，而不是等用户启用模组时才发现。
  const require_ = createRequire(import.meta.url);
  const vendor = require_(OUT_FILE);
  const factory = vendor.createSteamConnector || vendor.default;
  if (typeof factory !== 'function') {
    throw new Error('产物没有导出 createSteamConnector');
  }
  const probe = factory({ storage: null, log: null });
  const before = probe.status();
  probe.publish('build check');
  const after = probe.status();
  probe.dispose();
  if (before.state !== 'idle' || after.pending !== 'build check') {
    throw new Error('产物加载得起来，但连接器行为不对');
  }

  const stats = fs.statSync(OUT_FILE);
  console.log(`\n产物      ${path.relative(MOD_DIR, OUT_FILE)}  ${formatSize(stats.size)}`);
  console.log(`公钥      ${path.relative(MOD_DIR, pemTarget)}  ${fs.statSync(pemTarget).size} B`);
  console.log(`文件数    ${countFiles(STEAM_DIR)}（模组目录的摘要上限是 ${DIGEST_HINT}）`);
  console.log(`自检      产物可 require、可建连接器、状态流转正常`);
};

main();
