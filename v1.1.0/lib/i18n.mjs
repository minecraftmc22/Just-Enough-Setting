// mods/Just-Enough-Setting/lib/i18n.mjs
// 模组自带的文案表。
//
// 宿主只负责翻译注册表条目的 label / description；面板里由模组自己画的 DOM 得自己翻译。
// 语言取面板 ctx.locale（FoliumPanelContext），拿不到时退回 <html lang> / navigator.language，
// 再拿不到按 en 处理；查不到的词条按 精确语言 → zh-CN → en → 任意一条 回退，与宿主对 FoliumLabel 的规则一致。

const DICT = Object.freeze({
  'zh-CN': {
    'panel.title': 'SMTC 设置',
    'panel.subtitle': '系统媒体三行与标签页标题，全部由片段列表编排。',

    'group.switches': '开关',
    'group.lyricSync': '歌词同步',
    'group.smtc': '系统媒体（SMTC）',
    'group.pageTitle': '网页标题',
    'group.presets': '快速预设',
    'group.io': '导入 / 导出',
    'group.diagnostics': '诊断信息',

    'option.enabled': '启用 SMTC 自定义',
    'option.enabledHint': '关闭后系统媒体恢复宿主原本的标题、歌手与专辑。',
    'option.artwork': '向系统媒体发送封面',
    'option.artworkHint': '关闭后媒体浮窗只显示文字，不发送专辑图。',
    'option.pageTitle': '自定义标签页标题',
    'option.pageTitleHint': '关闭后恢复 Folia 原本的窗口标题。',
    'option.hud': '播放页诊断 HUD',
    'option.hudHint': '在播放页左上角叠加实时诊断，排查歌词不显示时最有用。',

    'option.syncMode': '歌词延迟',
    'option.syncAuto': '自动（精确排期到行时间戳）',
    'option.syncManual': '手动（±3 秒）',
    'option.autoBaseline': '页面歌词基准微调',
    'option.autoBaselineHint': '自动模式下换算歌词时间的基准偏移。只有宿主歌词时钟不可用（不在播放页）时才会用上。',
    'option.manualOffset': '手动延迟',
    'option.manualOffsetHint': '整体推迟（正值）或提前（负值）系统媒体里的歌词。',

    'target.smtcTitle': '标题栏',
    'target.smtcArtist': '歌手栏',
    'target.smtcAlbum': '专辑栏',
    'target.pageTitle': '标签页标题',
    'target.smtcTitleHint': '系统媒体第一行。',
    'target.smtcArtistHint': '系统媒体第二行。',
    'target.smtcAlbumHint': '系统媒体第三行。',
    'target.pageTitleHint': '窗口与标签页标题。',

    'fragment.song': '歌曲名',
    'fragment.artist': '歌手',
    'fragment.album': '专辑',
    'fragment.lyric': '歌词',
    'fragment.translation': '翻译',
    'fragment.word': '逐词歌词',
    'fragment.progress': '播放时长',
    'fragment.site': '网站名称',
    'fragment.connector': '连接符',
    'fragment.customPlaceholder': '自定义文本',
    'fragment.progressPlaceholder': '{elapsed} {bar} {total}',
    'fragment.progressTitle': '进度模板：{elapsed} 已播放 · {total} 总时长 · {remaining} 剩余 · {percent} 百分比 · {bar} 进度条（可写 {bar:20} 定长度、{bar:20:▓░} 换字符）',
    'fragment.spaceHint': '想用空格做分隔时就填一个空格——它和「 - 」一样会被保留。',
    'fragment.add': '添加片段',
    'fragment.addPlaceholder': '选择片段类型',
    'fragment.remove': '移除片段',
    'fragment.moveLeft': '前移',
    'fragment.moveRight': '后移',
    'fragment.drag': '拖拽排序',

    'hint.preview': '预览',
    'hint.empty': '空栏：这一栏不发任何内容。',
    'hint.allEmpty': '三栏全空时将不接管系统媒体信息。',
    'hint.edgeSpace': '含两端空白',
    'hint.progressTemplate': '进度模板：{elapsed} 已播放 · {total} 总时长 · {remaining} 剩余 · {percent} 百分比 · {bar} 进度条（{bar:20} 定长度、{bar:20:▓░} 换字符）。留空即用默认。',
    'hint.spaceGlyph': '␣ 代表一个空格字符',

    'action.copy': '复制',
    'action.download': '下载',
    'action.importText': '从文本导入',
    'action.pickFile': '选择文件…',
    'action.reset': '恢复默认',
    'action.resetConfirm': '再点一次确认恢复默认',
    'action.cancel': '取消',
    'action.exportTitle': '导出 JSON',
    'action.importTitle': '导入 JSON',
    'action.importHint': '粘贴配置 JSON，或选择一个 .json 文件；导入会覆盖当前的编排与选项。',
    'action.saveFile': '导出文件名',

    'message.copied': '配置已复制到剪贴板',
    'message.copyFailed': '复制失败，请手动选中文本复制',
    'message.downloaded': '已导出配置文件',
    'message.imported': '配置已导入',
    'message.importFailed': '导入失败',
    'message.reset': '已恢复默认配置',
    'message.presetApplied': '已套用预设',
    'message.fileFailed': '读取文件失败',
    'message.panelOpened': '已打开 SMTC 设置面板',

    'diag.title': '诊断信息',
    'diag.song': '歌曲',
    'diag.songId': '歌曲 ID',
    'diag.source': '来源',
    'diag.lines': '歌词行数',
    'diag.progress': '播放进度',
    'diag.current': '当前歌词',
    'diag.words': '逐词进度',
    'diag.layout': '标题栏编排',
    'diag.clock': '歌词时钟',
    'diag.hostLine': '宿主行号',
    'diag.smtc': '系统媒体',
    'diag.pageTitle': '标签页',
    'diag.clockHost': '宿主歌词时钟（精确）',
    'diag.clockEstimated': '按播放进度估算',
    'diag.noSong': '没有正在播放的歌曲',
    'diag.noLyrics': '没有歌词数据',
    'diag.noWordTiming': '本行没有逐词时间',
    'diag.none': '—',
    'diag.idle': '未接管',

    'status.enabled': 'SMTC 自定义已开启',
    'status.disabled': 'SMTC 自定义已关闭',
    'status.unavailable': '当前环境没有系统媒体接口',
  },

  en: {
    'panel.title': 'SMTC settings',
    'panel.subtitle': 'The three system media rows and the tab title, all composed from fragment lists.',

    'group.switches': 'Switches',
    'group.lyricSync': 'Lyric sync',
    'group.smtc': 'System media (SMTC)',
    'group.pageTitle': 'Web page title',
    'group.presets': 'Quick presets',
    'group.io': 'Import / export',
    'group.diagnostics': 'Diagnostics',

    'option.enabled': 'Customize the system media panel',
    'option.enabledHint': 'Off restores the host title, artist and album.',
    'option.artwork': 'Send cover art to the system media panel',
    'option.artworkHint': 'Off sends text only, without the album thumbnail.',
    'option.pageTitle': 'Customize the tab title',
    'option.pageTitleHint': 'Off restores the plain Folia window title.',
    'option.hud': 'Diagnostics HUD on the player page',
    'option.hudHint': 'Overlays live diagnostics in the top-left corner of the player page.',

    'option.syncMode': 'Lyric delay',
    'option.syncAuto': 'Auto (scheduled to line timestamps)',
    'option.syncManual': 'Manual (±3 s)',
    'option.autoBaseline': 'Page lyric baseline fine-tune',
    'option.autoBaselineHint': 'The base offset used to turn playback time into lyric time. Only used when the host lyric clock is unavailable (not on the player page).',
    'option.manualOffset': 'Manual delay',
    'option.manualOffsetHint': 'Delays (positive) or advances (negative) the lyric shown in the system media panel.',

    'target.smtcTitle': 'Title row',
    'target.smtcArtist': 'Artist row',
    'target.smtcAlbum': 'Album row',
    'target.pageTitle': 'Tab title',
    'target.smtcTitleHint': 'First system media row.',
    'target.smtcArtistHint': 'Second system media row.',
    'target.smtcAlbumHint': 'Third system media row.',
    'target.pageTitleHint': 'Window and tab title.',

    'fragment.song': 'Song',
    'fragment.artist': 'Artist',
    'fragment.album': 'Album',
    'fragment.lyric': 'Lyric',
    'fragment.translation': 'Translation',
    'fragment.word': 'Word-by-word lyric',
    'fragment.progress': 'Playback time',
    'fragment.site': 'Site name',
    'fragment.connector': 'Separator',
    'fragment.customPlaceholder': 'Custom text',
    'fragment.progressPlaceholder': '{elapsed} {bar} {total}',
    'fragment.progressTitle': 'Progress template: {elapsed} elapsed · {total} total · {remaining} remaining · {percent} percent · {bar} the bar (use {bar:20} for a length, {bar:20:▓░} for other characters)',
    'fragment.spaceHint': 'A single space works as a separator too — it is kept just like “ - ”.',
    'fragment.add': 'Add fragment',
    'fragment.addPlaceholder': 'Pick a fragment type',
    'fragment.remove': 'Remove fragment',
    'fragment.moveLeft': 'Move earlier',
    'fragment.moveRight': 'Move later',
    'fragment.drag': 'Drag to reorder',

    'hint.preview': 'Preview',
    'hint.empty': 'Empty row: sends nothing.',
    'hint.allEmpty': 'With all three rows empty the mod leaves the system media panel alone.',
    'hint.edgeSpace': 'keeps edge whitespace',
    'hint.progressTemplate': 'Progress template: {elapsed} elapsed · {total} total · {remaining} remaining · {percent} percent · {bar} the bar ({bar:20} for a length, {bar:20:▓░} for other characters). Empty means the default.',
    'hint.spaceGlyph': '␣ stands for one space character',

    'action.copy': 'Copy',
    'action.download': 'Download',
    'action.importText': 'Import from text',
    'action.pickFile': 'Choose a file…',
    'action.reset': 'Restore defaults',
    'action.resetConfirm': 'Click again to restore defaults',
    'action.cancel': 'Cancel',
    'action.exportTitle': 'Export JSON',
    'action.importTitle': 'Import JSON',
    'action.importHint': 'Paste a config JSON, or pick a .json file. Importing replaces the current layout and options.',
    'action.saveFile': 'Export file name',

    'message.copied': 'Config copied to the clipboard',
    'message.copyFailed': 'Copy failed — select the text and copy it manually',
    'message.downloaded': 'Config file exported',
    'message.imported': 'Config imported',
    'message.importFailed': 'Import failed',
    'message.reset': 'Defaults restored',
    'message.presetApplied': 'Preset applied',
    'message.fileFailed': 'Could not read the file',
    'message.panelOpened': 'SMTC settings panel opened',

    'diag.title': 'Diagnostics',
    'diag.song': 'Song',
    'diag.songId': 'Song ID',
    'diag.source': 'Source',
    'diag.lines': 'Lyric lines',
    'diag.progress': 'Progress',
    'diag.current': 'Current lyric',
    'diag.words': 'Word progress',
    'diag.layout': 'Title row layout',
    'diag.clock': 'Lyric clock',
    'diag.hostLine': 'Host line index',
    'diag.smtc': 'System media',
    'diag.pageTitle': 'Tab title',
    'diag.clockHost': 'Host lyric clock (exact)',
    'diag.clockEstimated': 'Estimated from playback time',
    'diag.noSong': 'Nothing is playing',
    'diag.noLyrics': 'no lyric data',
    'diag.noWordTiming': 'no word timing on this line',
    'diag.none': '—',
    'diag.idle': 'not taken over',

    'status.enabled': 'SMTC customization on',
    'status.disabled': 'SMTC customization off',
    'status.unavailable': 'No system media API in this environment',
  },
});

const resolveLocale = (locale) => {
  const raw = String(locale || document.documentElement.lang || navigator.language || '').toLowerCase();
  if (raw.startsWith('zh')) return 'zh-CN';
  if (raw.startsWith('en')) return 'en';
  return raw ? raw : 'en';
};

// 精确语言查不到时按宿主的回退顺序走（先 en，再任意一条），保证永远拿得到字符串而不是 key。
const pick = (locale, key) => {
  const table = DICT[locale];
  if (table && table[key] !== undefined) return table[key];
  if (DICT.en[key] !== undefined) return DICT.en[key];
  return Object.values(DICT).map((entry) => entry[key]).find((value) => value !== undefined) ?? key;
};

/**
 * 造一个翻译函数：`t('panel.title')`，第二参数可以给 `{ name: '…' }` 做 `{name}` 插值。
 * 面板每次挂载时按当时的 locale 造一次，语言切换由宿主重新挂载承担。
 */
export const createTranslator = (locale) => {
  const resolved = resolveLocale(locale);
  return (key, values) => {
    const template = pick(resolved, key);
    if (!values) return template;
    return Object.keys(values).reduce(
      (text, name) => text.replaceAll(`{${name}}`, String(values[name])),
      template,
    );
  };
};

/**
 * 取 FoliumLabel（`{ 'zh-CN': …, en: … }`）里的文本，规则与宿主一致：
 * 精确语言 → en → 任意一条。预设名、片段类型名这类定义在 lib/config.mjs 里的标签走这里。
 */
export const pickLabel = (label, locale) => {
  if (typeof label === 'string') return label;
  if (!label || typeof label !== 'object') return '';
  const resolved = resolveLocale(locale);
  if (typeof label[resolved] === 'string') return label[resolved];
  if (typeof label.en === 'string') return label.en;
  const found = Object.values(label).find((value) => typeof value === 'string');
  return found ?? '';
};
