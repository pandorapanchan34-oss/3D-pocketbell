/**
 * SIGN-X v9.60 本家大統一リモート・マウントゲート [キーボード完全連動版]
 * ローカル資産ゼロ。要塞の共通コア（core.js）から全知能とUIマトリクスを同期吸着する
 */
// 🪐 Vercelで完璧に復活した、要塞の共通コアURL
const FORTRESS_CORE = "https://3-d-pocketbell-deep-bssv.vercel.app/core.js";

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  try {
    // ❶ 要塞から大統一知能（encode / decode / initSystem、そしてUIビルダ）を一撃吸引
    const core = await import(FORTRESS_CORE);
    
    // ❷ 要塞の辞書システムを起動（11万語の遠隔ロードを執行）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    // ❸ 🪐 物理キーボードエンジン（v7.85）の知能をグローバル空間へ完全バインド
    window.insertKey = function(value) {
      const inputBox = document.getElementById('input-box');
      if (!inputBox) return;

      const startPos = inputBox.selectionStart;
      const endPos = inputBox.selectionEnd;
      const text = inputBox.value;
      const insertText = value + ' '; // トークン結合をスムーズにする防衛殻

      inputBox.value = text.substring(0, startPos) + insertText + text.substring(endPos);
      
      inputBox.focus();
      inputBox.selectionStart = inputBox.selectionEnd = startPos + insertText.length;

      // 文字が入った瞬間にエンコーダーを一撃自動キック！
      if (typeof window.encodeAndShow === 'function') {
        window.encodeAndShow();
      }
    };

    // ❹ 要塞側に内包されたビルダ、または共通コアから供給されるレイアウトでキーボードを現成
    // ※ core.buildSignXKeyboard があればそれを実行し、なければこの場で展開します
    if (core.buildSignXKeyboard) {
      core.buildSignXKeyboard();
    } else if (core.KEYBOARD_LAYOUT) {
      // 要塞からレイアウトを直接吸い上げて、このゲート側で安全に組み立てるフォールバック
      executeLocalBuild(core.KEYBOARD_LAYOUT);
    }

    if (badge && syncResult.success) {
      badge.innerText = `● ${syncResult.totalWords || 116753} / ∞←`;
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
    }

    // ❺ 本家の HTML インライン onclick 関数群を要塞コアと吸着
    const inputBox = document.getElementById('input-box');
    const packetBox = document.getElementById('packet-box');

    window.encodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value;
      
      // 要塞のエンコーダーを直撃
      const packet = core.encode(text);
      packetBox.innerText = packet || "— encode / decode result —";
      
      updateMetaCounters(text, packet);
    };

    window.pochiToNa = () => {
      if (!inputBox) return;
      inputBox.value = "今から病院行って薬を貰う";
      window.encodeAndShow();
    };

    // リアルタイム自動連動
    if (inputBox) {
      inputBox.addEventListener('input', window.encodeAndShow);
    }

    console.log("🟢 [Gate] 本家UI、キーボードマトリクス、および要塞共通コアの遠隔同期に完全成功。Q.E.D.");

  } catch (error) {
    console.error("❌ [Gate] 共通コアまたはキーボードマトリクスのマウントに失敗:", error);
    if (badge) badge.innerText = "● CORE OFFLINE";
    if (statusDot) statusDot.style.background = "#ef4444";
  }
});

/**
 * 要塞から届いた KEYBOARD_LAYOUT を元に、DOMへマトリクスを射出するスタンドアロン関数
 */
function executeLocalBuild(layout) {
  const container = document.getElementById('keyboardContainer');
  if (!container) return;
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
      btn.onclick = () => window.insertKey(btnData.value);
      row.appendChild(btn);
    });
    container.appendChild(row);
  });
  console.log('✅ [Gate] 遠隔レイアウトベースでの物理キーボードマトリクス同期完了 ⚡');
}

// カウンター計算ロジック
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
