/**
 * SIGN-X v9.50 本家大統一リモート・コアマウントゲート
 * ローカル資産ゼロ。要塞の共通コア（core.js）を吸引し、本家UIへ完全写像する
 */
// 🪐 Vercelで完璧に復活した、要塞の共通コアURL
const FORTRESS_CORE = "https://3-d-pocketbell-deep-bssv.vercel.app/core.js";

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  try {
    // ❶ 要塞から、100%動いている大統一知能を一撃で動的吸引
    const { initSystem, encode, decode } = await import(FORTRESS_CORE);
    
    // ❷ 要塞の辞書ローダーを起動（11万語の遠隔ロードを執行）
    const localUserDict = { entries: [] };
    const syncResult = await initSystem(localUserDict);

    if (badge && syncResult.success) {
      // 画面右上のバッジに、吸引完了した11万語超の数を美しく現成！
      badge.innerText = `● ${syncResult.totalWords || 116753} / ∞←`;
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
    }

    // ❸ 本家の HTML インライン onclick 関数（window.XXXX）を要塞コアと完全吸着バインド
    const inputBox = document.getElementById('input-box');
    const packetBox = document.getElementById('packet-box');

    window.encodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value;
      
      // 要塞のエンコーダーを直撃してパケット化
      const packet = encode(text);
      packetBox.innerText = packet || "— encode / decode result —";
      
      // メタ情報（文字数カウンターなど）の同期
      updateMetaCounters(text, packet);
    };

    window.pochiToNa = () => {
      if (!inputBox) return;
      inputBox.value = "今から病院行って薬を貰う"; // 例の神パルス
      window.encodeAndShow();
    };

    // ❹ リアルタイム・自動デコードパイプラインの結合
    if (inputBox) {
      inputBox.addEventListener('input', window.encodeAndShow);
    }

    console.log("🟢 [Gate] 本家UI ＆ 要塞共通コアの遠隔マウントに完全成功。Q.E.D.");

  } catch (error) {
    console.error("❌ [Gate] 要塞共通コアの吸引・結合に失敗:", error);
    if (badge) badge.innerText = "● CORE OFFLINE";
    if (statusDot) statusDot.style.background = "#ef4444"; // 拒絶の赤パルス
  }
});

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
