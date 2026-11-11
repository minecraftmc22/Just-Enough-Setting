// mods/Just-Enough-Setting/ui/panel.mjs
// 模组自己的设置面板。
//
// 同一份界面挂两处：
//   - settingsSections 的 settingsPanel：模组管理面板里展开这个模组就能看到；
//   - playerPanelTabs：播放器面板里一个独立的标签页，空间更宽裕，folium.ui.openPlayerPanel('smtc') 打开。
//
// 值的真源始终是宿主的参数（settingsSections.settings + params）：面板只负责画法，
// 所有写入都经 controller → params.set，因此持久化、校验、随「视觉配置」导入导出都由宿主承担。
//
// 重画策略：结构性重画只发生在「不是自己写进去的」配置变化上（预设、导入、重置、命令面板）。
// 自己写进去的值会同步记进 renderedSignature，于是不会反过来把正在输入的自定义文本框拆掉。

import { CONFIG_FILE_NAME, PRESETS } from '../lib/config.mjs';
import { createTranslator, pickLabel } from '../lib/i18n.mjs';
import { TOKENS, copyText, createButton, createButtonRow, createConfirmButton, createDisclosure, createSection, createSelect, createSlider, createSwitch, createTextarea, debounce, el } from './dom.mjs';
import { createDiagnosticsView } from './diagnostics.mjs';
import { createFragmentList } from './fragment-list.mjs';

const formatSeconds = (value) => `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)} s`;

const configSignature = (config) => JSON.stringify([config.layout, config.options]);

/** 焦点在不在自己这块界面里：在的话，外部改动也只刷新文本，不重建 DOM。 */
const isFocusedInside = (root) => {
  const scope = root.getRootNode();
  const active = scope && 'activeElement' in scope ? scope.activeElement : null;
  const focused = active ?? document.activeElement;
  return Boolean(focused && focused !== document.body && root.contains(focused));
};

export const createPanelMount = ({ folium, controller, variant = 'section' }) => (container, ctx) => {
  const locale = ctx?.locale ?? document.documentElement.lang ?? navigator.language ?? 'en';
  const t = createTranslator(locale);
  const state = controller.getConfig();

  const root = el('div', variant === 'tab'
    ? {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      overflowY: 'auto',
      padding: '14px 16px',
      boxSizing: 'border-box',
      fontFamily: TOKENS.font,
      fontSize: '12px',
      lineHeight: '1.5',
    }
    : {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '2px 0',
      fontFamily: TOKENS.font,
      fontSize: '12px',
      lineHeight: '1.5',
    });

  const toast = (message, type = 'info') => {
    try {
      folium.ui.toast(message, { type, durationMs: 2200 });
    } catch { /* 提示条失败不影响设置本身 */ }
  };

  let renderedSignature = configSignature(state);
  const cleanups = [];

  // 自己写进去的值同步记账，避免 params 回调把它当成外部改动再重建一次 DOM。
  const commitLocal = (action) => {
    action();
    renderedSignature = configSignature(controller.getConfig());
  };

  // 滑杆拖动会连发 input 事件，而宿主每次写入都要落盘：节流到 6Hz 左右，拖动依然跟手。
  const persistNumber = debounce((key, value) => {
    commitLocal(() => controller.setOption(key, value));
  }, 150);
  cleanups.push(() => persistNumber.cancel());

  if (variant === 'tab') {
    root.append(
      el('div', { display: 'flex', flexDirection: 'column', gap: '2px' },
        el('div', { fontSize: '14px', fontWeight: '600' }, t('panel.title')),
        el('div', { fontSize: '11px', opacity: TOKENS.muted }, t('panel.subtitle'))),
    );
  }

  // ---------------------------------------------------------------- 开关
  const switchSpecs = [
    { key: 'enabled', label: t('option.enabled'), description: t('option.enabledHint') },
    { key: 'sendArtwork', label: t('option.artwork'), description: t('option.artworkHint') },
    { key: 'pageTitleEnabled', label: t('option.pageTitle'), description: t('option.pageTitleHint') },
    { key: 'hudEnabled', label: t('option.hud'), description: t('option.hudHint') },
  ];
  const switches = switchSpecs.map((spec) => createSwitch({
    label: spec.label,
    description: spec.description,
    checked: state.options[spec.key],
    onChange: (value) => commitLocal(() => controller.setOption(spec.key, value)),
  }));
  const switchesSection = createSection(t('group.switches'));
  switches.forEach((item) => switchesSection.body.append(item.root));
  root.append(switchesSection.root);

  // ---------------------------------------------------------------- 歌词同步
  const syncSection = createSection(t('group.lyricSync'));
  const modeSelect = createSelect({
    label: t('option.syncMode'),
    value: state.options.lyricSyncMode,
    options: [
      { value: 'auto', label: t('option.syncAuto') },
      { value: 'manual', label: t('option.syncManual') },
    ],
    onChange: (value) => {
      commitLocal(() => controller.setOption('lyricSyncMode', value));
      syncOffsetRows(controller.getConfig());
    },
  });
  const autoSlider = createSlider({
    label: t('option.autoBaseline'),
    description: t('option.autoBaselineHint'),
    value: state.options.autoBaselineSeconds,
    min: -1,
    max: 1,
    step: 0.05,
    format: formatSeconds,
    // 拖动过程中就写回（节流），落地后 commitLocal 会记下签名，不会反过来重建正在拖的滑杆。
    onChange: (value) => persistNumber('autoBaselineSeconds', value),
  });
  const manualSlider = createSlider({
    label: t('option.manualOffset'),
    description: t('option.manualOffsetHint'),
    value: state.options.manualOffsetSeconds,
    min: -3,
    max: 3,
    step: 0.05,
    format: formatSeconds,
    onChange: (value) => persistNumber('manualOffsetSeconds', value),
  });
  syncSection.body.append(modeSelect.root, autoSlider.root, manualSlider.root);
  root.append(syncSection.root);

  // 只有当前模式那根滑杆可用：另一根留在原地但不吃指针，避免「拖了没反应」。
  const syncOffsetRows = (config) => {
    modeSelect.setValue(config.options.lyricSyncMode);
    autoSlider.setValue(config.options.autoBaselineSeconds);
    manualSlider.setValue(config.options.manualOffsetSeconds);
    const manual = config.options.lyricSyncMode === 'manual';
    [[autoSlider, manual], [manualSlider, !manual]].forEach(([slider, dimmed]) => {
      slider.root.style.opacity = dimmed ? '0.45' : '1';
      slider.root.style.pointerEvents = dimmed ? 'none' : '';
    });
  };
  syncOffsetRows(state);

  // ---------------------------------------------------------------- 编排
  const persistLayout = debounce((nextLayout) => {
    // 编排是整块写回的（一个参数），一样节流；拖动排序和增删本身不会连发。
    commitLocal(() => controller.setLayout(nextLayout));
  }, 0);
  cleanups.push(() => persistLayout.cancel());

  const lists = [];
  const createTargetBlock = (target) => {
    const list = createFragmentList({
      folium,
      t,
      target,
      fragments: state.layout[target],
      getContext: () => controller.getContext(),
      onChange: (fragments) => {
        persistLayout({ ...controller.getConfig().layout, [target]: fragments });
      },
    });
    lists.push(list);
    return el('div', { display: 'flex', flexDirection: 'column' },
      el('div', { fontSize: '11px', fontWeight: '600' }, t(`target.${target}`)),
      el('div', { fontSize: '10px', opacity: TOKENS.muted, marginBottom: '5px' }, t(`target.${target}Hint`)),
      list.root);
  };

  const smtcSection = createSection(t('group.smtc'), t('hint.allEmpty'));
  ['smtcTitle', 'smtcArtist', 'smtcAlbum'].forEach((target) => smtcSection.body.append(createTargetBlock(target)));
  root.append(smtcSection.root);

  const pageTitleSection = createSection(t('group.pageTitle'));
  pageTitleSection.body.append(createTargetBlock('pageTitle'));
  root.append(pageTitleSection.root);

  // ---------------------------------------------------------------- 快速预设
  const presetSection = createSection(t('group.presets'));
  const presetRow = createButtonRow();
  PRESETS.forEach((preset) => {
    const name = pickLabel(preset.label, locale);
    presetRow.append(createButton({
      label: name,
      title: pickLabel(preset.description, locale),
      onClick: () => {
        commitLocal(() => controller.applyPreset(preset.id));
        renderFromConfig(controller.getConfig());
        toast(`${t('message.presetApplied')} · ${name}`, 'success');
      },
    }));
  });
  presetSection.body.append(presetRow);
  root.append(presetSection.root);

  // ---------------------------------------------------------------- 导入 / 导出
  const ioSection = createDisclosure(t('group.io'));
  const exportArea = createTextarea({ value: controller.getConfigText(), rows: 7, readOnly: true });
  const importArea = createTextarea({ value: '', rows: 4, placeholder: t('action.importHint') });
  const fileInput = el('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  fileInput.style.display = 'none';

  const applyImport = (text) => {
    try {
      controller.importConfigText(text);
    } catch (error) {
      toast(`${t('message.importFailed')}: ${error?.message ?? error}`, 'error');
      return false;
    }
    renderFromConfig(controller.getConfig());
    toast(t('message.imported'), 'success');
    return true;
  };

  const copyButton = createButton({
    label: t('action.copy'),
    onClick: async () => {
      exportArea.value = controller.getConfigText();
      const copied = await copyText(exportArea.value, exportArea);
      toast(copied ? t('message.copied') : t('message.copyFailed'), copied ? 'success' : 'error');
    },
  });

  const downloadButton = createButton({
    label: t('action.download'),
    onClick: () => {
      const blob = new Blob([controller.getConfigText()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      // 下载锚点放在自己的容器里点：模组不去碰容器以外的宿主 DOM。
      const anchor = el('a');
      anchor.href = url;
      anchor.download = CONFIG_FILE_NAME;
      anchor.style.display = 'none';
      container.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast(t('message.downloaded'), 'success');
    },
  });

  const importButton = createButton({
    label: t('action.importText'),
    onClick: () => { if (applyImport(importArea.value)) importArea.value = ''; },
  });

  const pickButton = createButton({
    label: t('action.pickFile'),
    onClick: () => fileInput.click(),
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    try {
      applyImport(await file.text());
    } catch (error) {
      toast(`${t('message.fileFailed')}: ${error?.message ?? error}`, 'error');
    } finally {
      // 允许连续导入同一个文件。
      fileInput.value = '';
    }
  });

  const resetButton = createConfirmButton({
    label: t('action.reset'),
    confirmLabel: t('action.resetConfirm'),
    onConfirm: () => {
      commitLocal(() => controller.resetConfig());
      renderFromConfig(controller.getConfig());
      toast(t('message.reset'), 'success');
    },
  });

  ioSection.body.append(
    el('div', { fontSize: '11px', opacity: TOKENS.muted }, t('action.importHint')),
    exportArea,
    createButtonRow(copyButton, downloadButton),
    importArea,
    createButtonRow(importButton, pickButton, resetButton, fileInput),
  );
  root.append(ioSection.root);

  // ---------------------------------------------------------------- 诊断
  const diagnostics = createDiagnosticsView({ controller, t, variant: 'panel' });
  cleanups.push(() => diagnostics.dispose());
  const diagnosticsSection = createSection(t('group.diagnostics'));
  diagnosticsSection.body.append(diagnostics.root);
  root.append(diagnosticsSection.root);

  // ---------------------------------------------------------------- 重画
  /** 外部改动（预设、导入、重置、命令面板）：整块按新配置重画。 */
  function renderFromConfig(config) {
    renderedSignature = configSignature(config);
    switchSpecs.forEach((spec, index) => switches[index].setChecked(config.options[spec.key]));
    syncOffsetRows(config);
    lists.forEach((list) => list.update(config.layout[list.target]));
    if (ioSection.root.open) exportArea.value = controller.getConfigText();
    diagnostics.repaint();
  }

  /** 高频通路（换行、跳转、播放状态）：只刷新文本，永远不重建。 */
  const refreshLive = () => {
    const config = controller.getConfig();
    const signature = configSignature(config);
    if (signature !== renderedSignature) {
      // 正在输入自定义文本时不重建：重建会带走焦点和选区。
      if (!isFocusedInside(root)) {
        renderFromConfig(config);
        return;
      }
      renderedSignature = signature;
    }
    lists.forEach((list) => list.refreshPreview());
    if (ioSection.root.open && !isFocusedInside(exportArea)) {
      exportArea.value = controller.getConfigText();
    }
    diagnostics.repaint();
  };

  const unsubscribe = controller.subscribe(refreshLive);
  cleanups.push(unsubscribe);
  cleanups.push(() => root.remove());

  container.append(root);
  diagnostics.repaint();

  return () => {
    cleanups.splice(0).forEach((cleanup) => {
      try {
        cleanup();
      } catch { /* 卸载失败不该影响模组停用 */ }
    });
  };
};
