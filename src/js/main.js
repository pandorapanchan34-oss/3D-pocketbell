/**
 * SIGN-X v9.70 本家大統一リモート・コアマウントゲート [キーボード完全統合版]
 * ローカル資産ゼロ。要塞共通コア（core.js）を吸引し、物理キーボード（v7.85）を現成する
 */
// 🪐 Vercelで完璧に復活した、要塞の共通コアURL
const FORTRESS_CORE = "https://3-d-pocketbell-deep-bssv.vercel.app/core.js";

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  try {
    // ❶ 要塞から大統一知能（encode / decode / initSystem）を一撃で動的吸引
    const core = await import(FORTRESS_CORE);
    
    // ❷ 要塞の辞書システムを起動（11万語の遠隔ロードを執行）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    // ❸ 🪐 物理キーボードエンジンの入力インジェクション知能を window に展開
    window.insertKey = function(value) {
      const inputBox = document.getElementById('input-box');
      if (!inputBox) return;

      const startPos = inputBox.selectionStart;
      const endPos = inputBox.selectionEnd;
      const text = inputBox.value;
      const insertText = value + ' '; // トークン結合をスムーズにする防衛殻（🛡️）

      inputBox.value = text.substring(0, startPos) + insertText + text.substring(endPos);
      
      inputBox.focus();
      inputBox.selectionStart = inputBox.selectionEnd = startPos + insertText.length;

      // 文字が入った瞬間にエンコーダーを一撃自動キック！
      if (typeof window.encodeAndShow === 'function') {
        window.encodeAndShow();
      }
    };

    // ❹ 🪐 要塞のコアから KEYBOARD_LAYOUT を吸い上げて物理マトリクスを動的現成！
    if (core.KEYBOARD_LAYOUT) {
      buildSignXKeyboard(core.KEYBOARD_LAYOUT);
    } else if (core.buildSignXKeyboard) {
      core.buildSignXKeyboard();
    } else {
      console.warn('⚠️ 要塞コア側にレイアウトマトリクスが未定義です。');
    }

    if (badge && syncResult.success) {
      // 画面右上のバッジに、吸引完了した11万語超の数を美しく現成！
      badge.innerText = `● ${syncResult.totalWords || 116753} / ∞←`;
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
    }

    // ❺ 本家の HTML インライン onclick 関数（window.XXXX）を要塞コアと完全吸着バインド
    const inputBox = document.getElementById('input-box');
    const packetBox = document.getElementById('packet-box');

    window.encodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value;
      
      // 要塞のエンコーダーを直撃してパケット化
      const packet = core.encode(text);
      packetBox.innerText = packet || "— encode / decode result —";
      
      // メタ情報（文字数カウンターなど）の同期
      updateMetaCounters(text, packet);
    };

    window.pochiToNa = () => {
      if (!inputBox) return;
      inputBox.value = "今から病院行って薬を貰う"; // 例の神パルス
      window.encodeAndShow();
    };

    // リアルタイム・自動デコードパイプラインの結合
    if (inputBox) {
      inputBox.addEventListener('input', window.encodeAndShow);
    }

    console.log("🟢 [Gate] 本家UI、キーボードマトリクス、および要塞共通コアの遠隔同期に完全成功。Q.E.D.");

  } catch (error) {
    console.error("❌ [Gate] 要塞共通コアまたはキーボードマトリクスのマウントに失敗:", error);
    if (badge) badge.innerText = "● CORE OFFLINE";
    if (statusDot) statusDot.style.background = "#ef4444"; // 拒絶の赤パルス
  }
});

/**
 * ⚡ 物理キーボード動的現成マトリクス（v7.85 移植・適応トポロジー）
 */
function buildSignXKeyboard(layout) {
  console.log('📟 物理キーボードマトリクス結合開始... (v7.85リモート同期版)');

  const container = document.getElementById('keyboardContainer');
  if (!container) {
    console.warn('⚠️ keyboardContainer が見つかりません。DOMマウントを保留します。');
    return;
  }

  container.innerHTML = '';

  Object.keys(layout).forEach(sectionKey => {
    const row = document.createElement('div');
    row.className = `keyboard-row section-${sectionKey}`;

    layout[sectionKey].forEach(btnData => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = btnData.label;
      btn.title = btnData.tip || '';
      btn.dataset.value = btnData.value;

      // クリック時に window.insertKey へ完全直結射出！
      btn.onclick = () => {
        window.insertKey(btnData.value);
      };

      row.appendChild(btn);
    });

    container.appendChild(row);
  });

  console.log('✅ SIGN-X v7.85 物理キーボードマトリクス完全同期結合完了 ⚡');
}

// メタ情報カウンター（ORIGINAL / PACKET / RATIO）の同期計算ロジック
function updateMetaCounters(origText, packetText) {
  const origLen = origText ? origText.length : 0;
  const codeLen = packetText ? packetText.replace(/\s+/g, '').length : 0;
  const ratio = origLen > 0 ? Math.round((codeLen / origLen) * 100) : 100;

  const mOrig = document.getElementById('metaOrigLen');
  const mCode = document.getElementById('metaCodeLen');
  const mRatio = document.getElementById('metaRatio');

  if (mOrig) mOrig.innerText = origLen;
  if (mCode) mCode.innerText = codeLen;
  if (mRatio) mRatio.innerText = `${ratio}%`;
}
