// =================================================================
// SIGN-X KEYBOARD ENGINE v7.10
// 矢印変調レーン ＆ コア記号自動マウントシステム
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('keyboardContainer');
  if (!container) return;

  // コンテナを完全クリア
  container.innerHTML = '';

  // 💡 KEYBOARD_LAYOUTの全セクションを上からレンダリング
  Object.keys(KEYBOARD_LAYOUT).forEach(sectionKey => {
    const row = document.createElement('div');
    row.className = `keyboard-row section-${sectionKey}`;

    KEYBOARD_LAYOUT[sectionKey].forEach(btnData => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = btnData.label;
      btn.title = btnData.tip;
      btn.dataset.value = btnData.value;

      // タップした瞬間にエミュレータのインプットにインジェクション
      btn.addEventListener('click', () => {
        const inputField = document.getElementById('inputText');
        if (inputField) {
          const space = inputField.value.length > 0 ? ' ' : '';
          inputField.value += space + btnData.value;
          // 動的エンコード発動
          if (typeof encode === 'function') {
            document.getElementById('outputBox').textContent = encode(inputField.value);
          }
        }
      });

      row.appendChild(btn);
    });

    container.appendChild(row);
  });
  console.log('⚙️ SIGN-X v7.10 物理キーボードマトリクス結合完了');
});
