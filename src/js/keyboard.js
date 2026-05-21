// ============================================
// 3D POCKETBELL — KEYBOARD UI v6.1
// ============================================

const Keyboard = (() => {

  let insertFn = null;

  function init(insertFunction) {
    insertFn = insertFunction;
    renderKeyboard();
    bindTabs();
  }

  function renderKeyboard() {
    const container = document.getElementById('kbMain');
    if (!container) return;

    container.innerHTML = '';

    // SIGN-X タブ
    const signxPanel = createPanel('signx', 'SIGN-X 3Dポケベル', KEYBOARD_LAYOUT.signx, false);
    container.appendChild(signxPanel);

    // LEGACY タブ
    const legacyPanel = createPanel('legacy', 'LEGACY 伝統ポケベル', KEYBOARD_LAYOUT.legacy, true);
    container.appendChild(legacyPanel);

    // 最初はSIGN-Xを表示
    signxPanel.classList.add('active');
  }

  function createPanel(id, title, groups, isLegacy) {
    const panel = document.createElement('div');
    panel.id = `panel-${id}`;
    panel.className = 'kb-content';

    const h = document.createElement('div');
    h.className = 'kb-group-label';
    h.textContent = title;
    panel.appendChild(h);

    groups.forEach(rowKeys => {
      const group = document.createElement('div');
      group.className = 'kb-group';

      const keysContainer = document.createElement('div');
      keysContainer.className = 'kb-keys';

      rowKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = isLegacy ? 'key legacy-key' : 'key';
        btn.textContent = key;
        btn.title = key;
        btn.addEventListener('click', () => {
          if (insertFn) insertFn(key);
        });
        keysContainer.appendChild(btn);
      });

      group.appendChild(keysContainer);
      panel.appendChild(group);
    });

    return panel;
  }

  function bindTabs() {
    const tabSignx = document.getElementById('tab-signx');
    const tabLegacy = document.getElementById('tab-legacy');

    if (tabSignx) {
      tabSignx.addEventListener('click', () => switchTab('signx'));
    }
    if (tabLegacy) {
      tabLegacy.addEventListener('click', () => switchTab('legacy'));
    }
  }

  function switchTab(mode) {
    document.querySelectorAll('.kb-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.kb-tab').forEach(t => t.classList.remove('active'));

    const panel = document.getElementById(`panel-${mode}`);
    const tab = document.getElementById(`tab-${mode}`);

    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
  }

    // グローバル公開
  window.Keyboard = { init };

  return { init };
})();

