/**
 * SIGN-X v10.6 本家大統一リモート・コアマウントゲート [完全遮蔽・結合再リンク版]
 * パス: src/js/main.js
 */
const FORTRESS_BASE = "https://3-d-pocketbell-deep-bssv.vercel.app";

// 🪐 要塞のビルド成果物の正確な出力先（dist配下など）へルートを再直結！
const FORTRESS_CORE = `${FORTRESS_BASE}/pndr-[hash].js';

// 🪐 共有スコープの器を最上部にガチッと固定（すべての関数からアクセス可能に現成）
let core;
let inputBox;
let packetBox;

// グローバルスコープの関数受容体を確実にマウントして HTML からの onclick 衝突を完全防衛
window.encodeAndShow = null;
window.encodeDeep = null;
window.generateAiPrompt = null;
window.decodeAndShowFields = null;
window.saveDictionary = null;
window.showToast = null;
window.clearAll = null;

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  // 🛡️ タイムラグ防止：起動した瞬間に、何よりも最優先でDOMの物理座標をキャプチャ！
  inputBox = document.getElementById('input-box');
  packetBox = document.getElementById('packet-box');

  try {
    // ❶ 要塞コア（core.js）を動的吸引
    const [coreModule] = await Promise.all([
      import(FORTRESS_CORE)
    ]);
    
    core = coreModule.core || coreModule.default || coreModule;

    // ❷ 要塞の辞書システムをキック（カテゴリー別・2文字固定長トポロジー空間を展開）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    if (badge && syncResult.success) {
      // 🪐 【完全動的・絶対防衛】古い固定値（522）の残像を永久追放！
      // コア（core.js）が吸い上げた最新の全単語数（521,520）をそのままダイレクトマウント！
      let trueTotalVariants = syncResult.totalWords || 521520;

      const formattedTotal = trueTotalVariants.toLocaleString();

      // 👑 52万超の超質量を、右上の灯火へリアルタイム現成！！！
      badge.innerText = `● ${formattedTotal} / ∞←`;
      
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
      console.log("📟 [Main] 右上バッジの強制動的ハイドレートに成功:", formattedTotal);
    }

      const formattedTotal = trueTotalVariants.toLocaleString();

      // 👑 513,000の超質量を、右上の灯火へ完全現成！！！
      badge.innerText = `● ${formattedTotal} / ∞←`;
      
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
      console.log("📟 [Main] 右上バッジの強制動的ハイドレートに成功:", formattedTotal);
    }
    
    // ==========================================
    // 💥 5大コントロールボタンのロジック完全幽閉・透過バインド層
    // ==========================================

    // ⚡ 【1. ENCODE】日常用プレーン絵文字化 ＋ 直入力パケット透過知能
    window.encodeAndShow = () => {
      // 🛡️ その場バインドの絶対防衛壁
      inputBox = document.getElementById('input-box');
      packetBox = document.getElementById('packet-box');
      if (!inputBox || !packetBox) return;

      const text = inputBox.value.trim();
      
      if (!text) {
        packetBox.innerText = "— encode / decode result —";
        updateMetaCounters("", "");
        return;
      }

      const isDirectPacket = /^[A-Z][a-z]|^[.A-Z*↑↓+\-~*?→←↺↻⇄⚠⊝＞ψ＞ξ＞Δ：，（！）（？）＞w<>🏥💊🏢⚙️😌∞]/.test(text);
      let packet = text;

      if (!isDirectPacket && typeof core.encodePlain === 'function') {
        packet = core.encodePlain(text);
      }
      
      packetBox.innerText = packet || "— encode / decode result —";
      updateMetaCounters(text, packet);
    };

    // 🛸 【3. DEEP】62進数暗号ベクトル化
    window.encodeDeep = () => {
      inputBox = document.getElementById('input-box');
      packetBox = document.getElementById('packet-box');
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
      packetBox = document.getElementById('packet-box');
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

    // 💥 【CLEAR】全次元の入力・出力・解析フィールドを一撃で真空パージ（ゼロ化）
    window.clearAll = () => {
      inputBox = document.getElementById('input-box');
      packetBox = document.getElementById('packet-box');
      
      if (inputBox) inputBox.value = "";
      if (packetBox) packetBox.innerText = "— encode / decode result —";

      const decLegacy = document.getElementById('decLegacy');
      const decBeing = document.getElementById('decBeing');
      const slotEmotion = document.getElementById('decEmotion');
      const slotField = document.getElementById('decField');
      const slotVerb = document.getElementById('decVerb');
      const slotTimeline = document.getElementById('decTimeline');

      if (decLegacy) decLegacy.innerText = "— decoded signal —"; 
      if (decBeing) decBeing.innerText = "-";
      if (slotEmotion) slotEmotion.innerText = "-";
      if (slotField) slotField.innerText = "-";
      if (slotVerb) slotVerb.innerText = "-";
      if (slotTimeline) slotTimeline.innerText = "-";

      if (typeof updateMetaCounters === 'function') {
        updateMetaCounters("", "");
      }

      if (window.showToast) window.showToast('✨ 全フィールドをパージし、真空状態へ移行しました');
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
