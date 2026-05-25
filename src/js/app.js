// =================================================================
// 3D POCKETBELL — APP CONTROLLER v7.10 (Vector Modulation Edition)
// =================================================================

let currentPacket = '';
let ENCODE_DICT = [];
let VECTOR_DICT = []; // 💡 ベクトル辞書用の格納レーン

// 💡 1. 依存される基盤関数
const getBasePath = () => {
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
};

// 💡 2. 動的インジェクション層（2つの並行宇宙からフェッチ）
async function loadDictionaries() {
  try {
    const GITHUB_DICT_BASE = "https://pandorapanchan34-oss.github.io/3D-pocketbell/public/dict/";
    console.log("📡 遠隔宇宙同期：GitHubリポジトリから最新マトリクスをフェッチ中...");

    const cacheBuster = `?t=${Date.now()}`;

    // 💡 3d-core.json と vectors.json を同時フェッチ
    const [coreRes, vectorRes] = await Promise.all([
      fetch(`${GITHUB_DICT_BASE}3d-core.json${cacheBuster}`),
      fetch(`${GITHUB_DICT_BASE}vectors.json${cacheBuster}`)
    ]);

    const core = coreRes.ok ? await coreRes.json() : [];
    const vectors = vectorRes.ok ? await vectorRes.json() : [];

    ENCODE_DICT = [...core].sort((a, b) => b.key.length - a.key.length);
    VECTOR_DICT = [...vectors].sort((a, b) => b.marker.length - a.marker.length);
    
    console.log(`✅ 遠隔同期完了：計 ${ENCODE_DICT.length} 件の原子単語 ＆ 計 ${VECTOR_DICT.length} 件の変調ベクトルをインジェクションしました`);
  } catch (err) {
    console.warn("⚠️ GitHubフェッチに失敗しました。ローカルフォールバックを起動します。", err);
    try {
      const basePath = getBasePath(); 
      const [coreRes, vectorRes] = await Promise.all([
        fetch(`${basePath}public/dict/3d-core.json`),
        fetch(`${basePath}public/dict/vectors.json`)
      ]);
      ENCODE_DICT = coreRes.ok ? await coreRes.json() : [];
      VECTOR_DICT = vectorRes.ok ? await vectorRes.json() : [];
      ENCODE_DICT.sort((a, b) => b.key.length - a.key.length);
      VECTOR_DICT.sort((a, b) => b.marker.length - a.marker.length);
      console.log(`🔒 ローカル閉鎖系同期完了：フォールバックマトリクスをマウントしました`);
    } catch (e) {
      console.error("❌ 完全な辞書喪失", e);
    }
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v7.10 起動");
    
    // 💡 [タイムライン同期バグ完全パージ] 
    // keyboard.jsが確実にグローバル展開(window.KEYBOARD_LAYOUT)されるまで安全にスピンホールド
    if (typeof window.KEYBOARD_LAYOUT === 'undefined') {
      console.log("⏳ Keyboard モジュールの展開を待機中... (タイムライン再調整)");
      setTimeout(init, 50);
      return;
    }

    // 辞書展開
    await loadDictionaries();

    // 💡 確実にデータが揃ったタイミングで物理キーボード実体をレンダリング
    if (typeof window.buildSignXKeyboard === 'function') {
      window.buildSignXKeyboard();
    }

    console.log("⌨️ Keyboard モジュール接続完了 (v7.10同期)");

    const input = document.getElementById('inputText');
    if (input) {
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          // 入力された文字列がパケット（記号列）ならそのままデコード、日本語ならエンコード結果を流す
          if (/[()\[\]{}🤖⚙_]|[^\x00-\x7F]/.test(val) && !/[ぁ-んァ-ヴー]/.test(val)) {
            runDecode(val);
          } else {
            runDecode(encode(val));
          }
        } else {
          clearDecoder();
          clearOutput();
        }
      });
    }

    // UIステータス層の最適化
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    const statusDot = document.querySelector('.status-dot');

    if (pagerIdEl) pagerIdEl.textContent = '📟 V7.10-CORE';
    if (linkCountEl) linkCountEl.textContent = '7 / 7 (VECTORS)';
    if (statusDot) statusDot.style.background = '#00ff66';

    showToast('3Dポケベル ONLINE ⚡ v7.10');
  }

  // 💡 SIGN-X v7.10：外部辞書同期型・多次元変調エンコーダー
  function encode(text) {
    if (!text) return "";

    let preProcessedText = text;

    // ── Step 1: 外部辞書（VECTOR_DICT）とコア辞書による動的結合マトリクス ──
    if (ENCODE_DICT.length && VECTOR_DICT.length) {
      ENCODE_DICT.forEach(({ key, glyph }) => {
        if (!key || !glyph) return;

        VECTOR_DICT.forEach(({ marker, arrow }) => {
          // パターンA：「激アツ」＋「好き」 ➔ 「 😍↑ 」
          const patternFront = new RegExp(`${marker}${key}`, 'g');
          preProcessedText = preProcessedText.replace(patternFront, ` ${glyph}${arrow} `);

          // パターンB：「好き」＋「も」 ➔ 「 😍↺ 」
          const patternBack = new RegExp(`${key}${marker}`, 'g');
          preProcessedText = preProcessedText.replace(patternBack, ` ${glyph}${arrow} `);
        });
      });
    }

    // ── Step 2: 変調がかからなかった単語の通常最長一致置換 ──
    if (ENCODE_DICT.length) {
      const sortedDict = [...ENCODE_DICT].sort((a, b) => b.key.length - a.key.length);
      sortedDict.forEach(({ key, glyph }) => {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // ── Step 3: 日本語の環境ノイズ・浮いたマーカーの完全融解 ──
    const noisePatterns = [
      /(^|\s|.)(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|る？|む？|にいる|に移動)(\s|$)/g
    ];
    // ロードされたマーカー自体の残りカスも動的にパージリストへ追加
    VECTOR_DICT.forEach(({ marker }) => {
      noisePatterns.push(new RegExp(`(^|\\s)(${marker})(\\s|$)`, 'g'));
    });
    
    noisePatterns.forEach(pattern => {
      preProcessedText = preProcessedText.replace(pattern, '$1 $3');
    });

    // ── Step 4: トークンストリームのクリーンアップ ──
    const tokens = preProcessedText.trim().split(/\s+/);
    let encodedStream = [];
    tokens.forEach(token => {
      if (!token) return;
      if (/^(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|いる|ある)$/.test(token)) return;
      encodedStream.push(token);
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 💡 ボタンから叩かれる明示的エンコード＆表示処理
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

  // 💡 7大常用矢印・列挙型デコード（マルチレーンスキャン版）
  function runDecode(input) {
    const cleanInput = input.trim();
    if (!cleanInput) {
      clearDecoder();
      return;
    }
    
    let decoded = { legacy: '—', being: '—', emotion: '—', field: '—', transition: '—', verbs: '—', timeline: '—' };
    const units = cleanInput.split(/\s+/);

    units.forEach(unit => {
      if (!unit || unit === '—') return;

      // 1. LEGACY（ポケベル数字）
      if (/^\d{4,5}$/.test(unit)) {
        decoded.legacy = unit;
      }
      // 2. BEING（マスター、彼女、ぱんちゃん等）
      if (/^(∞_1|∞_12|⚙_13)$/.test(unit) || unit.includes('∞_') || unit.includes('⚙_')) {
        decoded.being = unit;
      }
      // 3. TIMELINE (.N, .P, .F および時計・カレンダー)
      if (/\.[NPF]/.test(unit) || /^(🕒|📅)$/.test(unit) || unit.includes('現在') || unit.includes('過去') || unit.includes('未来')) {
        decoded.timeline = unit;
      }
      // 4. FIELD / OBJECT (環境グリフ)
      if (/^(🏠|🛤️|🏢|☕|🍚|🍽️)$/.test(unit) || /[🏠🛤️🏢☕🍚🍽️]/.test(unit)) {
        decoded.field = unit;
      }
      // 5. EMOTION (感情系)
      if (/[😍❤️👍😀😋😢🥺😌🎧😡]/.test(unit)) {
        decoded.emotion = unit;
      }
      // 6. VERBS / TRANSITION (矢印移動・ベクトル系)
      if (/[↑↓←→↺↻⇄🚀➔V✋]/.test(unit)) {
        decoded.verbs = unit;
      }
    });

    renderDecoder(decoded);
  }

  // 💡 SIGN-X手話変調翻訳エンジン
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const G = window.GRAMMAR || {};
    const cleanValue = value.trim();

    let baseGlyph = cleanValue;
    let arrowMod = '';
    
    // 末尾の矢印（↑↓←→↺↻⇄）をパース
    const arrowMatch = cleanValue.match(/([↑↓←→↺↻⇄])$/);
    if (arrowMatch) {
      arrowMod = arrowMatch[1];
      baseGlyph = cleanValue.replace(arrowMod, '');
    }

    let timelineSuffix = '';
    if (baseGlyph.endsWith('.N') || baseGlyph.endsWith('.P') || baseGlyph.endsWith('.F')) {
      timelineSuffix = baseGlyph.slice(-2);
      baseGlyph = baseGlyph.slice(0, -2);
    }

    let baseMeaning = G.core_glyphs?.[baseGlyph] || G.being?.domains?.[baseGlyph] || baseGlyph;
    if (baseMeaning === baseGlyph) {
      const foundInDict = ENCODE_DICT.find(d => d.glyph === baseGlyph);
      if (foundInDict) baseMeaning = foundInDict.key;
    }

    let vectorMeaning = arrowMod ? ` ➔ ${G.vectors?.[arrowMod] || arrowMod}` : '';
    let timelineMeaning = timelineSuffix ? ` [時制:${G.timeline?.[timelineSuffix]}]` : '';

    switch (slotName) {
      case 'legacy':
        return G.legacy?.[cleanValue] || cleanValue;
      case 'being':
        return G.being?.domains?.[cleanValue] || baseMeaning;
      case 'emotion':
      case 'verbs':
        return `${baseMeaning}${vectorMeaning}${timelineMeaning}`;
      case 'field':
        return G.field?.[cleanValue] || baseMeaning;
      case 'timeline':
        return G.timeline?.[cleanValue] || baseMeaning;
      default:
        return cleanValue;
    }
  }

  function renderDecoder(decoded) {
    setText('decLegacy', decodeSlot('legacy', decoded.legacy));
    setText('decBeing', decodeSlot('being', decoded.being));
    setText('decEmotion', decodeSlot('emotion', decoded.emotion));
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

  // 💡 キーボード入力用スペースインテリジェント制御
  function insertKey(val) {
    const tx = document.getElementById('inputText');
    if (!tx) return;
    const start = tx.selectionStart;
    
    const isArrow = /[↑↓←→↺↻⇄]/.test(val);
    const space = (start > 0 && !isArrow && tx.value[start-1] !== ' ') ? ' ' : '';
    
    tx.value = tx.value.slice(0, start) + space + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + space.length + val.length;
    tx.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // 💡 pochiToNa：圧縮パケットをAI一発理解プロンプトとしてクリップボードにマウント
  function pochiToNa() {
    if (!currentPacket) {
      const box = document.getElementById('outputBox');
      if (box && box.textContent && box.textContent !== '— encode / decode result —') {
        currentPacket = box.textContent;
      }
    }

    if (!currentPacket) {
      showToast('⚠️ 送信するパケット（空）がありません');
      return;
    }

    const aiPrompt = `[SYSTEM_SIGNAL: DEPLOY_VECTOR]\n${currentPacket}\n\n上記パケットを多次元デコードし、コンテキスト（k=TAU）を同期して応答せよ。`;

    navigator.clipboard.writeText(aiPrompt).then(() => {
      showToast('🚀 AIプロンプトを装填しました！');
      const box = document.getElementById('outputBox');
      if (box) {
        box.classList.add('flash');
        setTimeout(() => box.classList.remove('flash'), 500);
      }
    }).catch(err => {
      console.error("🚀 インジェクション失敗", err);
    });
  }

  function copyOutput() {
    const box = document.getElementById('outputBox');
    const textToCopy = (box && box.textContent !== '— encode / decode result —') ? box.textContent : currentPacket;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => showToast('📋 コピーしました'));
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

  // =================================================================
  // 💡 [マウント処理] 内部の関数をスコープ外へ露出させるための準備
  // =================================================================
  const exports = { 
    init, 
    encodeAndShow, 
    pochiToNa, 
    copyOutput, 
    clearInput, 
    insertKey,
    encode,
    runDecode
  };

  return exports;
})(); 
// 🛡️ カプセル（防衛殻）閉鎖完了 ─────────────────────────────────────

// =================================================================
// 💡 [グローバル完全直結層] 
// =================================================================
window.App = App;

// HTMLや外部モジュールからのバイパスを二重架橋
window.encodeAndShow = App.encodeAndShow;
window.pochiToNa     = App.pochiToNa;
window.encode        = App.encode;
window.runDecode     = App.runDecode;

// 💡 競合を完全パージする最安定の起動タイミング
window.addEventListener('load', () => App.init());
