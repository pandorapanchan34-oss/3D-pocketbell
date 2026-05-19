// ============================================
// 3D PAGER — KEYBOARD UI v6.0
// grammar.jsのKEYBOARD_LAYOUTを参照して動的生成
// ============================================

const Keyboard = (() => {

  // insertKey は app.js 側から注入
  let _insertFn = (val) => {};

  function init(insertFn) {
    _insertFn = insertFn;
    _render();
    _bindTabs();
  }

  // ============================================
  // キーボード全体をDOMに描画
  // ============================================
  function _render() {
    const container = document.getElementById('kbMain');
    if (!container) return;

    const sections = [
      { id: 'being',      label: 'BEING 存在ドメイン',   keys: KEYBOARD_LAYOUT.being },
      { id: 'depth',      label: 'DEPTH 存在深度',       keys: KEYBOARD_LAYOUT.depth },
      { id: 'emotion',    label: 'EMOTION 感情',         keys: KEYBOARD_LAYOUT.emotion },
      { id: 'intensity',  label: 'INTENSITY 強度',       keys: KEYBOARD_LAYOUT.intensity },
      { id: 'field',      label: 'FIELD 空間',           keys: KEYBOARD_LAYOUT.field },
      { id: 'transition', label: 'TRANSITION 遷移',      keys: KEYBOARD_LAYOUT.transition },
      { id: 'verb',       label: 'VERB 動詞連鎖',        keys: KEYBOARD_LAYOUT.verb },
      { id: 'timeline',   label: 'TIMELINE 時制',        keys: KEYBOARD_LAYOUT.timeline },
    ];

    const legacySection = {
      id: 'legacy', label: 'LEGACY 伝統ポケベル数字', keys: KEYBOARD_LAYOUT.legacy,
    };

    container.innerHTML = '';

    // メインパネル (SIGN-X)
    const mainPanel = document.createElement('div');
    mainPanel.id = 'panel-signx';
    mainPanel.className = 'kb-content active';
    sections.forEach(sec => {
      mainPanel.appendChild(_buildGroup(sec.label, sec.keys));
    });
    container.appendChild(mainPanel);

    // LEGACYパネル
    const legacyPanel = document.createElement('div');
    legacyPanel.id = 'panel-legacy';
    legacyPanel.className = 'kb-content';
    legacyPanel.appendChild(_buildGroup(legacySection.label, legacySection.keys, true));
    container.appendChild(legacyPanel);
  }

  // ============================================
  // キーグループのDOM生成
  // ============================================
  function _buildGroup(label, keys, isLegacy = false) {
    const group = document.createElement('div');
    group.className = 'kb-group';

    const groupLabel = document.createElement('div');
    groupLabel.className = 'kb-group-label';
    groupLabel.textContent = label;
    group.appendChild(groupLabel);

    const keysRow = document.createElement('div');
    keysRow.className = 'kb-keys';

    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = isLegacy ? 'key legacy-key' : 'key';
      btn.textContent = k.label;
      btn.title = k.tip || '';
      btn.addEventListener('click', () => _insertFn(k.value));
      keysRow.appendChild(btn);
    });

    group.appendChild(keysRow);
    return group;
  }

  // ============================================
  // タブ切り替え
  // ============================================
  function _bindTabs() {
    const tabSignx  = document.getElementById('tab-signx');
    const tabLegacy = document.getElementById('tab-legacy');
    if (!tabSignx || !tabLegacy) return;

    tabSignx.addEventListener('click', () => switchTab('signx'));
    tabLegacy.addEventListener('click', () => switchTab('legacy'));
  }

  function switchTab(mode) {
    const panels = document.querySelectorAll('.kb-content');
    panels.forEach(p => p.classList.remove('active'));

    const tabs = document.querySelectorAll('.kb-tab');
    tabs.forEach(t => t.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${mode}`);
    const targetTab   = document.getElementById(`tab-${mode}`);
    if (targetPanel) targetPanel.classList.add('active');
    if (targetTab)   targetTab.classList.add('active');
  }

  return { init, switchTab };
})();
