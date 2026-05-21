// ============================================
// 3D POCKETBELL — KEYBOARD UI v6.1 (Syntax Fix)
// ============================================

const Keyboard = (() => {
  let insertFn = null;

  function init(insertFunction) {
    insertFn = insertFunction;
    renderKeyboard();
    bindTabs();
  }

  // 💡 最新の KEYBOARD_LAYOUT マトリクスに完全適応させるパネル生成
  function renderKeyboard() {
    const main = document.getElementById('kbMain');
    if (!main) return;
    main.innerHTML = '';

    // SIGN-X タブ用のパネル（全スロットを縦に並べてグループ化）
    const signxPanel = createPanel('signx');
    signxPanel.id = 'panel-signx';
    signxPanel.classList.add('kb-content', 'active'); // 初期表示

    // LEGACY タブ用のパネル
    const legacyPanel = createPanel('legacy');
    legacyPanel.id = 'panel-legacy';
    legacyPanel.classList.add('kb-content');

    main.appendChild(signxPanel);
    main.appendChild(legacyPanel);
  }

  function createPanel(mode) {
    const panel = document.createElement('div');
    panel.className = 'kb-panel-content';

    // グローバルに展開された最新の KEYBOARD_LAYOUT を参照
    const layout = window.KEYBOARD_LAYOUT || (typeof KEYBOARD_LAYOUT !== 'undefined' ? KEYBOARD_LAYOUT : null);
    if (!layout) return panel;

    if (mode === 'signx') {
      const slots = ['being', 'depth', 'emotion', 'intensity', 'field', 'transition', 'verb', 'timeline'];
      
      slots.forEach(slotName => {
        if (layout[slotName] && Array.isArray(layout[slotName])) {
          const group = document.createElement('div');
          group.className = `kb-group slot-${slotName}`;
          
          const keysContainer = document.createElement('div');
          keysContainer.className = 'kb-keys';

          layout[slotName].forEach(keyObj => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.textContent = keyObj.label;
            btn.title = keyObj.tip || keyObj.label;
            btn.addEventListener('click', () => {
              if (insertFn) insertFn(keyObj.value);
            });
            keysContainer.appendChild(btn);
          });

          group.appendChild(keysContainer);
          panel.appendChild(group);
        }
      });

    } else if (mode === 'legacy') {
      if (layout.legacy && Array.isArray(layout.legacy)) {
        const group = document.createElement('div');
        group.className = 'kb-group slot-legacy';
        
        const keysContainer = document.createElement('div');
        keysContainer.className = 'kb-keys';

        layout.legacy.forEach(keyObj => {
          const btn = document.createElement('button');
          btn.className = 'key legacy-key';
          btn.textContent = keyObj.label;
          btn.title = keyObj.tip || keyObj.label;
          btn.addEventListener('click', () => {
            if (insertFn) insertFn(keyObj.value);
          });
          keysContainer.appendChild(btn);
        });

        group.appendChild(keysContainer);
        panel.appendChild(group);
      }
    }

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

  // 💡 外側に init メソッドを公開して終了
  return { init };
})();

// 💡 グローバルウィンドウへバインドを確定
window.Keyboard = Keyboard;
