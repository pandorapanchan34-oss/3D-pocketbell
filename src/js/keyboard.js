/**
 * 3D-pocketbell Keyboard Engine v7.20
 * 物理インターフェース結合層 — grammar.js からレイアウトを動的インジェクション
 */

import { KEYBOARD_LAYOUT } from './grammar.js';

/**
 * ⚡ 物理キーボード動的現成マトリクス
 * app.js の初期化完了（四重辞書結合後）に、コントロールタワーから直接呼び出されます
 */
export function buildSignXKeyboard() {
  console.log('📟 物理キーボードマトリクス結合開始... (v7.20)');

  const container = document.getElementById('keyboardContainer');
  if (!container) {
    console.warn('⚠️ keyboardContainer が見つかりません。DOMマウントを保留します。');
    return;
  }

  // コンテナ内の古い残骸を完全融解（P）
  container.innerHTML = '';

  const layout = KEYBOARD_LAYOUT;
  if (!layout) {
    console.error('❌ KEYBOARD_LAYOUT が見つかりません。文法層を確認してください。');
    return;
  }

  // 💡 KEYBOARD_LAYOUTの全セクションを上からレンダリング
  Object.keys(layout).forEach(sectionKey => {
    const row = document.createElement('div');
    row.className = `keyboard-row section-${sectionKey}`;

    layout[sectionKey].forEach(btnData => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = btnData.label;
      btn.title = btnData.tip || '';
      btn.dataset.value = btnData.value;

      // 💥 クリック時に、新アセットの App.insertKey へ直結射出！
      // これにより、カーソル位置へのインジェクションや、リアルタイムエンコード・デコードが全自動連鎖します
      btn.onclick = () => {
        if (window.App && typeof window.App.insertKey === 'function') {
          window.App.insertKey(btnData.value);
        } else if (typeof window.insertKey === 'function') {
          window.insertKey(btnData.value);
        }
      };

      row.appendChild(btn);
    });

    container.appendChild(row);
  });

  console.log('✅ SIGN-X v7.20 物理キーボードマトリクス完全同期結合完了 ⚡');
}

// 💡 外部（index.html や app.js の loadDictionaries 完了後）から一撃で叩けるようにグローバル空間へマウント
window.buildSignXKeyboard = buildSignXKeyboard;
