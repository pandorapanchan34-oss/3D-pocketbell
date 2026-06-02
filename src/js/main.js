/**
 * SIGN-X v10.0 本家大統一リモート・コアマウントゲート [真の無色透明・スリム版]
 * パス: src/js/main.js
 * 役割: フロント側の不要なUI回路を完全パージ。
 * 要塞から降ってくるシグナルをただDOMにハイドレートするだけの高効率な「器」。
 */
const FORTRESS_BASE = "https://3-d-pocketbell-deep-bssv.vercel.app";
const FORTRESS_CORE = `${FORTRESS_BASE}/core.js`;

// グローバルスコープの関数受容体を確実にマウントして HTML からの onclick 衝突を完全防衛
window.encodeAndShow = null;
window.encodeDeep = null;
window.generateAiPrompt = null;
window.decodeAndShowFields = null;
window.saveDictionary = null;
window.showToast = null;

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  try {
    // ❶ 要塞コア（core.js）を動的吸引（レイアウトJSONのFetchは物理パージ）
    const [coreModule] = await Promise.all([
      import(FORTRESS_CORE)
    ]);
    
    const core = coreModule.core || coreModule.default || coreModule;

    // ❷ 要塞の辞書システムをキック（カテゴリー別・2文字固定長トポロジー空間を展開）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    if (badge && syncResult.success) {
      badge.innerText = `● ${syncResult.totalWords || 116753} / ∞←`;
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
    }

    const inputBox = document.getElementById('input-box');
    const packetBox = document.getElementById('packet-box');

    // ==========================================
    // 💥 5大コントロールボタンのロジック完全幽閉・透過バインド層
    // ==========================================

    // ⚡ 【1. ENCODE】日常用プレーン絵文字化 ＋ 直入力パケット透過知能
    window.encodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value.trim();
      
      if (!text) {
        packetBox.innerText = "— encode / decode result —";
        updateMetaCounters("", "");
        return;
      }

      // 🪐 進化：2文字固定長の英字パケット、および各種生ベクトル記号群を確実に自動検知
      const isDirectPacket = /^[A-Z][a-z]|^[.A-Z*↑↓+\-~*?→←↺↻⇄⚠⊝＞ψ＞ξ＞Δ：，（！）（？）＞w<>🏥💊🏢⚙️😌∞]/.test(text);
      let packet = text;

      if (!isDirectPacket && typeof core.encodePlain === 'function') {
        packet = core.encodePlain(text);
      }
      
      packetBox.innerText = packet || "— encode / decode result —";
      updateMetaCounters(text, packet);
    };

    // 🛸 【3. DEEP】62進数暗号ベクトル化（大文字カテゴリー＋小文字細分 2文字固定長射出回路）
    window.encodeDeep = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value.trim();
      if (!text) {
        if (window.showToast) window.showToast('⚠️ 入力窓が空です');
        return;
      }

      let deepPacket = text;
      if (typeof core.deepEncode === 'function') {
        deepPacket = core.deepEncode(text);
      }
      
      packetBox.innerText = deepPacket || "— DEEP INTERFERENCE ACTIVE —";
      
      const decLegacy = document.getElementById('decLegacy');
      const decBeing = document.getElementById('decBeing');
      if (decLegacy) decLegacy.innerText = deepPacket;
      if (decBeing) decBeing.innerText = "🪐 AI_MODE_ACTIVE";
      
      updateMetaCounters(text, deepPacket);
      if (window.showToast) window.showToast('🛸 AI推論用2文字固定長パケットを射出しました！');
    };

    // 🧠 【4. AI PROMPT】メモリ宇宙の辞書スナップショットを一撃生成
    window.generateAiPrompt = () => {
      if (typeof core.generateAiPrompt === 'function') {
        const promptText = core.generateAiPrompt();
        navigator.clipboard.writeText(promptText).then(() => {
          if (window.showToast) window.showToast('🧠 局所圧縮プロトコルをクリップボードに保持！');
        }).catch(() => {
          alert('🧠 SIGN-X DEEP PROTOCOL COPIED.');
        });
      }
    };

    // ⚡ 【2. DECODE】生パケット・2文字DEEPパケット両対応の統合解析知能
    window.decodeAndShowFields = () => {
      if (!packetBox || typeof core.decodeToFields !== 'function') return;

      const currentPacket = packetBox.innerText.trim();
      if (!currentPacket || currentPacket === "— encode / decode result —") return;

      const result = core.decodeToFields(currentPacket);

      const decLegacy = document.getElementById('decLegacy');
      if (decLegacy) decLegacy.innerText = result.decodedSignal || currentPacket;

      const slotEmotion = document.getElementById('decEmotion');
      const slotField = document.getElementById('decField');
      const slotVerb = document.getElementById('decVerb');
      const slotTimeline = document.getElementById('decTimeline');

      if (slotEmotion) slotEmotion.innerText = result.emotion || "-";
      if (slotField) slotField.innerText = result.field || "-";
      if (slotVerb) slotVerb.innerText = result.verb || "-";
      if (slotTimeline) slotTimeline.innerText = result.timeline || "-";

      if (window.showToast) window.showToast('⚡ 2文字パケットの多次元逆解析・4層マウント完了');
    };

    // 💾 【5. SAVE】永続化URLのパッキング生成
    window.saveDictionary = () => {
      if (typeof core.saveAndGetUrl === 'function') {
        const saveUrl = core.saveAndGetUrl();
        if (saveUrl) {
          navigator.clipboard.writeText(saveUrl).then(() => {
            if (window.showToast) window.showToast('💾 復元用URLをクリップボードに保存しました！');
          });
        }
      }
    };

    // リアルタイムプレーンエンコード自動追従
    if (inputBox) {
      inputBox.addEventListener('input', () => {
        window.encodeAndShow(); 
      });
    }

    console.log("🟢 [Gate] スリム版パイプラインの完全一本化現成に成功。Q.E.D.");

  } catch (error) {
    console.error("❌ [Gate] 大統一ストリームの結合断線:", error);
    if (badge) badge.innerText = "● CORE OFFLINE";
    if (statusDot) statusDot.style.background = "#ef4444";
  }
});

/**
 * ⚡ トースト通知の物理現成
 */
window.showToast = function(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
};

/**
 * メタ情報カウンター同期計算
 */
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
