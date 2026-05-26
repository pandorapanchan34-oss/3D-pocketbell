/**
 * 3D-pocketbell Keyboard Engine v7.85 [大統一確定版]
 * 物理インターフェース結合層 — grammar.js からレイアウトを動的インジェクション
 */
import { KEYBOARD_LAYOUT } from './grammar.js';

/**
 * 💥 物理キーボードに入力文字をインジェクションし、即時リアルタイムエンコードをキックする無敵関数
 */
window.insertKey = function(value) {
  const inputBox = document.getElementById('input-box');
  if (!inputBox) return;

  // 現在のカーソル位置（セクション）を取得して、綺麗に文字を挟み込む（手話的同時表現対応）
  const startPos = inputBox.selectionStart;
  const endPos = inputBox.selectionEnd;
  const text = inputBox.value;

  // 文字の後ろに自動で半角スペースを空けて、トークンの結合をスムーズにする防衛殻（🛡️）
  const insertText = value + ' ';

  inputBox.value = text.substring(0, startPos) + insertText + text.substring(endPos);
  
  // カーソル位置を挿入した文字の後ろへ自動移動
  inputBox.focus();
  inputBox.selectionStart = inputBox.selectionEnd = startPos + insertText.length;

  // 🪐 文字が入った瞬間に、app.js の大統一エンコーダーを一撃自動キック！！！
  if (typeof window.encodeAndShow === 'function') {
    window.encodeAndShow();
  }
};

/**
 * ⚡ 物理キーボード動的現成マトリクス
 * app.js の初期化完了（window.init 内）から直接呼び出されます
 */
export function buildSignXKeyboard() {
  console.log('📟 物理キーボードマトリクス結合開始... (v7.85確定版)');

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

  // 💡 KEYBOARD_LAYOUTの全セクション（being, emotion, vector...）を上からレンダリング
  Object.keys(layout).forEach(sectionKey => {
    // legacy などの古い12ケタ数字セクションは、有限帯域Bのノイズになるならここでスキップも可能（今回は全展開）
    const row = document.createElement('div');
    row.className = `keyboard-row section-${sectionKey}`;

    layout[sectionKey].forEach(btnData => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = btnData.label;
      btn.title = btnData.tip || '';
      btn.dataset.value = btnData.value;

      // 💥 クリック時に、さっき上で定義した window.insertKey へ完全直結射出！
      btn.onclick = () => {
        window.insertKey(btnData.value);
      };

      row.appendChild(btn);
    });

    container.appendChild(row);
  });

  console.log('✅ SIGN-X v7.85 物理キーボードマトリクス完全同期結合完了 ⚡');
}

// 💡 外部（app.js の window.init）から一撃で叩けるようにグローバル空間へマウント
window.buildSignXKeyboard = buildSignXKeyboard;
