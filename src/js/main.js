/**
 * SIGN-X v10.0 本家大統一リモート・コアマウントゲート [真の無色透明モデル]
 * パス: src/js/main.js
 * 役割: フロント側の重いパースロジックを0ミリ化。
 * 要塞（core.ts）から降ってくる高密度オブジェクトをただDOMにハイドレートするだけの純粋な「器」。
 */
const FORTRESS_BASE = "https://3-d-pocketbell-deep-bssv.vercel.app";
const FORTRESS_CORE = `${FORTRESS_BASE}/core.js`;
const FORTRESS_LAYOUT = `${FORTRESS_BASE}/dict/keyboard_layout.json`; 

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
    // ❶ 要塞コア（core.js）と、キーボードレイアウトJSONを並行して動的吸引
    const [coreModule, layoutRes] = await Promise.all([
      import(FORTRESS_CORE),
      fetch(FORTRESS_LAYOUT).then(r => r.json()).catch(() => null)
    ]);
    
    // 安定マウントのための core オブジェクト抽出
    const core = coreModule.core || coreModule.default || coreModule;

    // ❷ 要塞の辞書システムをキック（11万語の遠隔ロードを執行）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    // ❸ 物理キーボードエンジンの入力インジェクション知能を展開
    window.insertKey = function(value) {
      const inputBox = document.getElementById('input-box');
      if (!inputBox) return;

      const startPos = inputBox.selectionStart;
      const endPos = inputBox.selectionEnd;
      const text = inputBox.value;
      const insertText = value + ' ';

      inputBox.value = text.substring(0, startPos) + insertText + text.substring(endPos);
      
      inputBox.focus();
      inputBox.selectionStart = inputBox.selectionEnd = startPos + insertText.length;

      // キー入力時は自動判定エンコードへ連携
      if (typeof window.encodeAndShow === 'function') {
        window.encodeAndShow();
      }
    };

    // ❹ 🪐 要塞から降ってきた大統一レイアウトを使って物理キーボードマトリクスを現成
    if (layoutRes) {
      buildSignXKeyboard(layoutRes);
    } else {
      console.warn('⚠️ 要塞側から keyboard_layout.json を吸引できませんでした。');
    }

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

      // 先頭文字から直パケット入力か通常の自然言語かを自動検知
      const isDirectPacket = /^[.A-Z*↑↓+\-~*?→←↺↻⇄⚠⊝＞ψ＞ξ＞Δ：，（！）（？）＞w<>🏥💊🏢⚙️😌∞]/.test(text);
      let packet = text;

      if (!isDirectPacket && typeof core.encodePlain === 'function') {
        packet = core.encodePlain(text);
      }
      
      packetBox.innerText = packet || "— encode / decode result —";
      updateMetaCounters(text, packet);
    };

    // 🛸 【3. DEEP】62進数暗号ベクトル化（AI推論用パケット 出力窓ダイレクト射出回路）
    window.encodeDeep = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value.trim();
      if (!text) {
        if (window.showToast) window.showToast('⚠️ 入力窓が空です');
        return;
      }

      // 🛡️ 覚醒：タイピング中の闇鍋パケットを完全に無視し、上のテキストから直接ディープパケットを現成！
      let deepPacket = text;
      if (typeof core.deepEncode === 'function') {
        deepPacket = core.deepEncode(text);
      }
      
      // 🪐 出力窓へダイレクトインジェクション！
      packetBox.innerText = deepPacket || "— DEEP INTERFERENCE ACTIVE —";
      
      const decLegacy = document.getElementById('decLegacy');
      const decBeing = document.getElementById('decBeing');
      if (decLegacy) decLegacy.innerText = deepPacket;
      if (decBeing) decBeing.innerText = "🪐 AI_MODE_ACTIVE";
      
      // 下段のメターカウンターもディープ仕様に完全同期
      updateMetaCounters(text, deepPacket);
      if (window.showToast) window.showToast('🛸 AI推論用ディープパケットを出力窓に展開しました！');
    };
    // 🧠 【4. AI PROMPT】要塞のメモリ宇宙から辞書スナップショットを一撃生成
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

    // ⚡ 【2. DECODE】生パケット・DEEP両対応・4層自動マウントオブジェクト一撃吸引
    window.decodeAndShowFields = () => {
      if (!packetBox || typeof core.decodeToFields !== 'function') return;

      const currentPacket = packetBox.innerText.trim();
      if (!currentPacket || currentPacket === "— encode / decode result —") return;

      // 🪐 奇跡の一撃：要塞側（decoder.ts）の統合解析知能から、分配済みのオブジェクトを直接吸引！
      const result = core.decodeToFields(currentPacket);

      // フロント側は一切頭を使わず、ただ降ってきた結果をDOMにマッピングするだけ（ロジック0ミリ）
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

      if (window.showToast) window.showToast('⚡ パケットの意味解析・4層マウント完了');
    };

    // 💾 【5. SAVE】独自文字を含んだブックマーク用永続化URLのパッキング生成
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

    // タイピング中のリアルタイムプレーンエンコード自動追従
    if (inputBox) {
      inputBox.addEventListener('input', () => {
        window.encodeAndShow(); 
      });
    }

    console.log("🟢 [Gate] 5大コントロールパイプラインの完全一本化現成に成功。Q.E.D.");

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
 * 💥 ポチッとな（お遊び用レガシー回路の防衛）
 */
window.pochiToNa = function() {
  if (window.showToast) window.showToast('💥 ぱんちゃん「システムに異常はありません、マスター！」');
};

/**
 * 📟 物理キーボード動的現成マトリクス
 */
function buildSignXKeyboard(layout) {
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
      btn.onclick = () => { window.insertKey(btnData.value); };
      row.appendChild(btn);
    });
    container.appendChild(row);
  });
}

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
