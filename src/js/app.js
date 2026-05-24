// =================================================================
// 3D POCKETBELL — APP CONTROLLER v7.10 (Vector Modulation Edition)
// =================================================================

let currentPacket = '';
let ENCODE_DICT = [];

// 💡 1. 依存される基盤関数
const getBasePath = () => {
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
};

// 💡 2. GitHub OSS リポジトリ直結・動的インジェクション層
async function loadDictionaries() {
  try {
    const GITHUB_DICT_BASE = "https://pandorapanchan34-oss.github.io/3D-pocketbell/public/dict/";
    console.log("📡 遠隔宇宙同期：GitHubリポジトリから最新マトリクスをフェッチ中...");

    const cacheBuster = `?t=${Date.now()}`;

    // 常用矢印化により、コアは 3d-core.json ひとつで完全に飽和します
    const [coreRes] = await Promise.all([
      fetch(`${GITHUB_DICT_BASE}3d-core.json${cacheBuster}`)
    ]);

    const core = coreRes.ok ? await coreRes.json() : [];

    ENCODE_DICT = [...core].sort((a, b) => b.key.length - a.key.length);
    console.log(`✅ 遠隔同期完了：GitHubより計 ${ENCODE_DICT.length} 件の原子単語をインジェクションしました`);
  } catch (err) {
    console.warn("⚠️ GitHubフェッチに失敗しました。ローカルフォールバックを起動します。", err);
    try {
      const basePath = getBasePath(); 
      const [coreRes] = await Promise.all([
        fetch(`${basePath}public/dict/3d-core.json`)
      ]);
      const core = coreRes.ok ? await coreRes.json() : [];
      ENCODE_DICT = [...core].sort((a, b) => b.key.length - a.key.length);
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

    // UIステータス層のVercel最適化
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    const statusDot = document.querySelector('.status-dot');

    if (pagerIdEl) pagerIdEl.textContent = '📟 V7.10-CORE';
    if (linkCountEl) linkCountEl.textContent = '7 / 7 (VECTORS)';
    if (statusDot) statusDot.style.background = '#00ff66';

    showToast('3Dポケベル ONLINE ⚡ v7.10');
  }

  // 💡 SIGN-X v7.10：中国文法配置型・超圧縮エンコーダー
  function encode(text) {
    if (!text) return "";

    // ── Step 1: 42件の精鋭原子単語辞書（3d-core.json）による最優先一発置換 ──
    let preProcessedText = text;
    if (ENCODE_DICT && ENCODE_DICT.length) {
      ENCODE_DICT.forEach(({ key, glyph }) => {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // ── Step 2: 助詞ノイズのパージ ＆ 連続スペースの統合 ──
    // 旧バージョンの面倒な品詞分解ロジックはすべて廃棄し、超軽量にストリーム化
    const tokens = preProcessedText.trim().split(/\s+/);
    let encodedStream = [];

    tokens.forEach(token => {
      if (!token) return;
      // 助詞単体（は、が、を、に、で、と、も、の）を完全にパージ
      if (/^(は|が|を|に|で|と|も|の|て|から|だけど|たら)$/.test(token)) return;
      encodedStream.push(token);
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 💡 ポチっとな等の裏側で走る簡易デコード
  function decode(text) {
    if (!text || !ENCODE_DICT.length) return text;
    let plainText = text;
    const DECODE_DICT = [...ENCODE_DICT].sort((a, b) => b.glyph.length - a.glyph.length);

    DECODE_DICT.forEach(({ key, glyph }) => {
      if (!glyph) return;
      const escapedGlyph = glyph.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      plainText = plainText.replace(new RegExp(escapedGlyph, 'g'), key);
    });
    return plainText;
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

  // 💡 7大常用矢印・列挙型デコード（右側仕分け表示パネル用）
  function runDecode(input) {
    const cleanInput = input.trim();
    
    // 仕分け状態を初期化
    let decoded = { legacy: '—', being: '—', emotion: '—', field: '—', transition: '—', verbs: '—', timeline: '—' };
    const units = cleanInput.split(/\s+/);

    units.forEach(unit => {
      // 1. LEGACY（ポケベル数字）
      if (/^\d{4,5}$/.test(unit)) {
        decoded.legacy = unit;
      }
      // 2. BEING（マスター、彼女、ぱんちゃん）
      else if (/^(∞_1|∞_12|⚙_13)$/.test(unit)) {
        decoded.being = unit;
      }
      // 3. TIMELINE
      else if (/^\.[NPF]$/.test(unit) || /^(🕒|📅)$/.test(unit)) {
        decoded.timeline = unit;
      }
      // 4. FIELD / OBJECT
      else if (/^(🏠|🛤️|🏢|☕|🍚|🍽️)$/.test(unit)) {
        decoded.field = unit;
      }
      // 5. EMOTION / VERB / EXPRESSION（常用矢印を含む複合体）
      else {
        // 絵文字やコア記号を抽出して各スロットへマウント
        if (/[😍❤️👍😀😋😢🥺😌🫶V✋]/.test(unit)) {
          if (/[😍❤️👍😀😋😢🥺😌]/.test(unit)) {
            decoded.emotion = unit; // 感情系
          } else {
            decoded.verbs = unit; // 行動・ベクトル系
          }
        }
      }
    });

    renderDecoder(decoded);
  }

  // 💡 SIGN-X v7.10対応：3次元手話（矢印変調）翻訳エンジン
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const G = window.GRAMMAR || {};
    const cleanValue = value.trim();

    // ── [v7.10 核の処理]：単語記号から「常用矢印」を分離して多次元デコード ──
    let baseGlyph = cleanValue;
    let arrowMod = '';
    
    // 末尾の矢印（↑↓←→↺↻⇄）をパース
    const arrowMatch = cleanValue.match(/([↑↓←→↺↻⇄])$/);
    if (arrowMatch) {
      arrowMod = arrowMatch[1];
      baseGlyph = cleanValue.replace(arrowMod, '');
    }

    // 時制マーカーが引っかかっている場合のトリミング
    let timelineSuffix = '';
    if (baseGlyph.endsWith('.N') || baseGlyph.endsWith('.P') || baseGlyph.endsWith('.F')) {
      timelineSuffix = baseGlyph.slice(-2);
      baseGlyph = baseGlyph.slice(0, -2);
    }

    // ベースとなる単語の日本語訳を取得
    let baseMeaning = G.core_glyphs?.[baseGlyph] || G.being?.domains?.[baseGlyph] || baseGlyph;
    // 辞書展開から日本語に引っ張られた時の逆引きフォールバック
    if (baseMeaning === baseGlyph) {
      const foundInDict = ENCODE_DICT.find(d => d.glyph === baseGlyph);
      if (foundInDict) baseMeaning = foundInDict.key;
    }

    // 矢印ベクトルの翻訳文をマウント
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

  function insertKey(val) {
    const tx = document.getElementById('inputText');
    if (!tx) return;
    const start = tx.selectionStart;
    
    // 矢印が連続タップされた時、直前のコア記号の直後に密着（変調）させるためのインテリジェントスペースロジック
    const isArrow = /[↑↓←→↺↻⇄]/.test(val);
    const space = (start > 0 && !isArrow && tx.value[start-1] !== ' ') ? ' ' : '';
    
    tx.value = tx.value.slice(0, start) + space + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + space.length + val.length;
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

  // ── 330行目付近：各種ユーティリティ関数（showToast等）の直下 ──

  // 💡 [334行目：完全同期] 各種公開関数を window.App オブジェクトへマウント
  window.App = { 
    init, 
    encodeAndShow, 
    decodeAndShow, 
    pochiToNa, 
    copyOutput, 
    clearInput, 
    insertKey 
  };

  // 💡 仕様変更に伴うデコーダー自動リンク（グローバルショートカット）
  window.encode = encode;
  window.runDecode = runDecode;

  return { init };
}）(); // 💡 [341行目：即時実行関数の完全閉鎖トポロジー]

// 💡 競合を完全パージする最安定の起動タイミング
window.addEventListener('load', () => App.init());
