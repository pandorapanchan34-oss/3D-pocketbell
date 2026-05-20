// ============================================
// 3D POCKETBELL — APP CONTROLLER v6.1 (Fix ReferenceError)
// ============================================

let currentPacket = '';
let ENCODE_DICT = [];

// 💡 1. 依存される関数を最上部に配置して ReferenceError を完全に回避
const getBasePath = () => {
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
};

// 💡 2. 次に loadDictionaries を配置
async function loadDictionaries() {
  try {
    const basePath = getBasePath(); 
    console.log(`📡 辞書フェッチ起点: ${window.location.origin}${basePath}dict/`);

    const [macroRes, legacyRes, coreRes] = await Promise.all([
      fetch(`${basePath}public/dict/macro.json`),
      fetch(`${basePath}public/dict/legacy.json`),
      fetch(`${basePath}public/dict/3d-core.json`)
    ]);

    const macro = macroRes.ok ? await macroRes.json() : [];
    const legacy = legacyRes.ok ? await legacyRes.json() : [];
    const core = coreRes.ok ? await coreRes.json() : [];

    ENCODE_DICT = [...macro, ...legacy, ...core]
      .sort((a, b) => b.key.length - a.key.length);

    console.log(`✅ 辞書ロード完了: ${ENCODE_DICT.length}件`);
  } catch (err) {
    console.error("❌ 辞書読み込み失敗", err);
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v6.1 起動");
    
    // keyboard.js を明示的にインポートしてロード順を確定
    const basePath = getBasePath();
    try {
      await import(`${basePath}src/js/keyboard.js`);
    } catch (e) {
      console.warn("⚠️ keyboard.js の非同期ロードを無視しました（すでに展開されている可能性があります）");
    }

    // 辞書展開
    await loadDictionaries();

    // キーボード初期化
    if (window.Keyboard && typeof window.Keyboard.init === "function") {
      window.Keyboard.init(insertKey);
      console.log("⌨️ Keyboard モジュール接続完了");
    } else {
      console.warn("⚠️ Keyboard モジュールへの接続に失敗しました。ロード順を確認してください。");
    }

    const input = document.getElementById('inputText');
    if (input) {
      input.addEventListener('input', (e) => {
        if (e.target.value.trim()) {
          runDecode(e.target.value.trim());
        } else {
          clearDecoder();
          clearOutput();
        }
      });
    }

    showToast('3Dポケベル ONLINE ⚡');
  }

  // ... (以降の encode, encodeAndShow 等の下部メソッドは一切変更なし)

  function encode(text) {
    if (!text || !ENCODE_DICT.length) return text;
    let packet = text;
    ENCODE_DICT.forEach(({ key, glyph }) => {
      packet = packet.replace(new RegExp(key, 'g'), glyph);
    });
    return packet.replace(/\s+/g, ' ').trim();
  }

  function encodeAndShow() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) return;

    const encoded = encode(input);
    currentPacket = encoded;

    const box = document.getElementById('outputBox');
    if (box) {
      box.textContent = currentPacket;
      box.classList.add('has-content', 'flash');
      setTimeout(() => box.classList.remove('flash'), 400);
    }

    updateMeta(input, currentPacket);
    runDecode(currentPacket);
  }

  function pochiToNa() {
    encodeAndShow();
    showToast('💥 PACKET EXECUTED!');
  }

  function runDecode(input) {
    if (typeof Parser === 'undefined' && typeof window.Parser === 'undefined') return;
    const currentParser = typeof Parser !== 'undefined' ? Parser : window.Parser;
    const parsed = currentParser.parse(input);
    const decoded = currentParser.decode(parsed);
    renderDecoder(decoded);
  }

  // 💡 SIGN-X GRAMMAR v6.0 の構造を直接引きにいく動的トランスレーター
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const G = window.GRAMMAR || (typeof GRAMMAR !== 'undefined' ? GRAMMAR : null);
    if (!G) return value; // GRAMMARがなければ生の記号をフォールバック

    // 各スロットごとのマトリクス引き
    switch (slotName) {
      case 'being':
        // ドメインと次元深度の混在に対応（例: "+Ⅲ", "⚙"）
        const domainText = G.being.domains[value];
        const depthText = G.being.depth[value];
        return domainText || depthText || value;

      case 'emotion':
        // 複合パターン（例: "🤩Ⅲ", "😌Ⅱ", "G *~" 等のゆらぎ）をパース
        // 絵文字と強度修飾子に分解して結合する
        let emotionResult = [];
        const chars = value.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|Ⅲ✨|Ⅲ🔥|\*~|.)/g) || [value];
        
        chars.forEach(ch => {
          const token = ch.trim();
          if (!token) return;
          if (G.emotion.faces[token]) {
            emotionResult.push(`${G.emotion.faces[token].meaning}`);
          } else if (G.emotion.intensity[token]) {
            emotionResult.push(`➔ [${G.emotion.intensity[token]}]`);
          } else {
            emotionResult.push(token);
          }
        });
        return emotionResult.join(' ') || value;

      case 'field':
        // 複合フィールド（例: "🏠↔🛤️"）を分解して翻訳
        return value.split('↔').map(f => G.field[f.trim()] || f).join(' ↔ ') || value;

      case 'transition':
        return G.transition[value] || value;

      case 'verbs':
        // 動詞連鎖（例: "G D" や "M✴"）を1文字ずつ分解して連続実行を列挙
        let verbResult = [];
        const vTokens = value.match(/(!>|✴|.)/g) || [value];
        vTokens.forEach(v => {
          const token = v.trim();
          if (!token) return;
          if (G.verb[token]) {
            verbResult.push(G.verb[token]);
          } else {
            verbResult.push(token);
          }
        });
        return verbResult.join(' ➔ ') || value;

      case 'timeline':
        return G.timeline[value] || value;

      case 'legacy':
        return G.legacy[value] || value;

      default:
        return value;
    }
  }

  // 💡 メイン描画処理のアップデート
  function renderDecoder(decoded) {
    // Parserが各スロットにパースした記号を、GRAMMARマトリクスを通して完全翻訳
    setText('decLegacy', decodeSlot('legacy', decoded.legacy));
    setText('decBeing', decodeSlot('being', decoded.being));
    // emotion または emotion2 のどちらから来ても綺麗に吸い上げる
    setText('decEmotion', decodeSlot('emotion', decoded.emotion || decoded.emotion2));
    setText('decField', decodeSlot('field', decoded.field));
    setText('decTransition', decodeSlot('transition', decoded.transition));
    setText('decVerbs', decodeSlot('verbs', decoded.verbs));
    setText('decTimeline', decodeSlot('timeline', decoded.timeline));
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function clearDecoder() {
    ['decLegacy','decBeing','decEmotion','decField','decTransition','decVerbs','decTimeline']
      .forEach(id => setText(id, '—'));
  }

  function updateMeta(orig, encoded) {
    const meta = document.getElementById('outputMeta');
    if (meta) meta.style.display = 'flex';
    
    const origLenEl = document.getElementById('metaOrigLen');
    const codeLenEl = document.getElementById('metaCodeLen');
    const ratioEl = document.getElementById('metaRatio');

    if (origLenEl) origLenEl.textContent = orig.length;
    if (codeLenEl) codeLenEl.textContent = encoded.length;
    if (ratioEl) {
      const ratio = orig.length ? ((encoded.length / orig.length) * 100).toFixed(1) + '%' : '100%';
      ratioEl.textContent = ratio;
    }
  }

  function insertKey(val) {
    const tx = document.getElementById('inputText');
    if (!tx) return;
    const start = tx.selectionStart;
    tx.value = tx.value.slice(0, start) + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + val.length;
    tx.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function copyOutput() {
    if (!currentPacket) return;
    navigator.clipboard.writeText(currentPacket).then(() => showToast('📋 コピーしました'));
  }

  function clearInput() {
    const input = document.getElementById('inputText');
    if (input) input.value = '';
    clearDecoder();
    clearOutput();
    currentPacket = '';
  }

  function clearOutput() {
    const box = document.getElementById('outputBox');
    if (box) {
      box.textContent = '— encode / decode result —';
      box.className = 'output-box';
    }
    const meta = document.getElementById('outputMeta');
    if (meta) meta.style.display = 'none';
  }

  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // 💡 ここが超重要：type="module" のスコープからグローバル(HTML)へブリッジ
  window.App = { init, encodeAndShow, pochiToNa, copyOutput, clearInput };

  return { init };
})();

// ドムツリーとグローバル依存が解決した時点で起動シグナルを送信
window.addEventListener('load', () => App.init());
