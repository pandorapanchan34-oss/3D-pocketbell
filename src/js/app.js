// =================================================================
// 3D POCKETBELL — APP CONTROLLER v7.12 (DictLoader v2.1 Integration)
// =================================================================

let currentPacket = '';
let ENCODE_DICT = [];     // 後方互換用（flat化）
let VECTOR_DICT = [];

// 💡 DictLoader
let dictLoader = null;

// 💡 1. 基盤関数
const getBasePath = () => {
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
};

// 💡 2. 辞書読み込み（新形式 v2.1）
async function loadDictionaries() {
  try {
    console.log("📡 辞書ロード開始... (新形式 v2.1)");

    if (!window.dictLoader) {
      const module = await import('./dict-loader.js');
      dictLoader = new module.default();
      window.dictLoader = dictLoader;
    } else {
      dictLoader = window.dictLoader;
    }

    const success = await dictLoader.load();

    if (success && dictLoader.entries.length > 0) {
      // 後方互換用にフラット化
      const flatDict = [];
      dictLoader.entries.forEach(entry => {
        const glyph = entry.glyph;
        if (Array.isArray(entry.variants)) {
          entry.variants.forEach(variant => {
            flatDict.push({ key: variant, glyph: glyph });
          });
        }
        if (entry.main) {
          flatDict.push({ key: entry.main, glyph: glyph });
        }
      });

      // 重複除去 + 最長一致用ソート
      ENCODE_DICT = [...new Map(flatDict.map(item => [item.key, item])).values()]
        .sort((a, b) => (b.key || '').length - (a.key || '').length);

      window.ENCODE_DICT = ENCODE_DICT;
      VECTOR_DICT = []; // vectorsは現在固定のため空初期化

      console.log(`✅ 新形式辞書ロード成功: ${dictLoader.entries.length}概念グループ / ${ENCODE_DICT.length}単語`);
      return true;
    }
    throw new Error("No entries loaded");
  } catch (err) {
    console.warn("⚠️ 辞書ロード失敗。フォールバックします。", err);
    ENCODE_DICT = [];
    window.ENCODE_DICT = [];
    return false;
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v7.12 起動");

    if (typeof window.KEYBOARD_LAYOUT === 'undefined') {
      setTimeout(init, 50);
      return;
    }

    await loadDictionaries();

    if (typeof window.buildSignXKeyboard === 'function') {
      window.buildSignXKeyboard();
    }

    const input = document.getElementById('inputText');
    if (input) {
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          // すでにパケット記号化されている場合はダイレクトデコード、自然言語はエンコード
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

    // UI更新
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    if (pagerIdEl) pagerIdEl.textContent = '📟 V7.12-DICT';
    if (linkCountEl) linkCountEl.textContent = '9 / 9 (v2.1)';

    showToast('3Dポケベル ONLINE ⚡ v7.12 - 新辞書統合完了');
  }

  // =================================================================
  // 💡 【エンコード】自然言語 ➔ 3Dパケット圧縮置換
  // =================================================================
  function encode(text) {
    if (!text) return "";

    let preProcessedText = text;
    const currentEncodeDict = window.ENCODE_DICT || ENCODE_DICT || [];

    // Step 1: 単体自立語の最長一致置換
    if (currentEncodeDict.length) {
      const sortedDict = [...currentEncodeDict].sort((a, b) => (b.key.length - a.key.length));
      sortedDict.forEach(({ key, glyph }) => {
        if (!key || !glyph) return;
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // Step 2: 助詞ノイズ徹底除去
    const noisePatterns = [
      /(^|\s)(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|の残骸)(\s|$)/g
    ];
    noisePatterns.forEach(pattern => {
      preProcessedText = preProcessedText.replace(pattern, '$1 $3');
    });

    // Step 3: 純度100%のパケットストリーム生成（システムコマンド保護）
    const tokens = preProcessedText.trim().split(/\s+/);
    let encodedStream = [];
    tokens.forEach(token => {
      if (!token) return;
      if (/^([VSGDMCP✴]|\.[NPF])$/.test(token)) {
        encodedStream.push(token);
        return;
      }
      if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) return;
      encodedStream.push(token);
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }

  // =================================================================
  // 💡 【デコード】パケット ➔ スロット別セマンティック抽出
  // =================================================================
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

      if (/^\d{4,5}$/.test(unit)) decoded.legacy = unit;
      if (/^(∞_|⚙_)/.test(unit)) decoded.being = unit;
      if (/\.[NPF]/.test(unit)) decoded.timeline = unit;
      if (/[🏠🛤️🏢☕🍚🍽️🍴👋]/.test(unit)) decoded.field = unit;
      if (/[😍❤️👍😀😢🥺😌😠❓📍]/.test(unit) || unit.includes('😢⇄')) decoded.emotion = unit;
      if (/[↑↓←→↺↻⇄V✋]/.test(unit) || /^[SGDMCP✴]$/.test(unit)) decoded.verbs = unit;
    });

    renderDecoder(decoded);
  }

  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';

    let baseGlyph = value.trim();
    // 変調ベクトル（矢印）を一時的に分離して純粋なコアグリフを抽出
    const arrowMatch = baseGlyph.match(/([↑↓←→↺↻⇄]+)$/);
    let arrowMod = arrowMatch ? arrowMatch[1] : '';
    if (arrowMatch) baseGlyph = baseGlyph.replace(arrowMod, '');

    let meaning = baseGlyph;

    // ── 💡 新規格優先ハッキング ──
    // DictLoader v2.1 のオブジェクトツリーからダイレクトに概念のmain名称を引っ張る
    if (window.dictLoader && typeof window.dictLoader.getEntryByGlyph === 'function') {
      const entry = window.dictLoader.getEntryByGlyph(baseGlyph);
      if (entry) {
        meaning = entry.main || entry.variants?.[0] || baseGlyph;
      }
    } 
    // フォールバック（フラット辞書検索）
    else if (window.ENCODE_DICT) {
      const found = window.ENCODE_DICT.find(d => d.glyph === baseGlyph);
      if (found) meaning = found.key;
    }

    // 意味的な主体の補正
    if (meaning === "私" || meaning === "僕" || meaning === "俺") meaning = "自分";

    // ベクトル変調（矢印）の日本語テキスト補完
    let vectorMeaning = '';
    if (arrowMod) {
      if (arrowMod === '↑') vectorMeaning = ' [最大バースト]';
      else if (arrowMod === '↓') vectorMeaning = ' [ほのか/抑制]';
      else if (arrowMod === '→') vectorMeaning = ' [能動射出]';
      else if (arrowMod === '←') vectorMeaning = ' [受動要求]';
      else if (arrowMod === '↺') vectorMeaning = ' [自己回帰]';
      else if (arrowMod === '↻') vectorMeaning = ' [相手指向]';
      else if (arrowMod === '⇄') vectorMeaning = ' [完全結合]';
    }

    return `${value} ＝ ${meaning}${vectorMeaning}`;
  }

  function renderDecoder(decoded) {
    setText('decLegacy', decodeSlot('legacy', decoded.legacy));
    setText('decBeing', decodeSlot('being', decoded.being));
    setText('decEmotion', decodeSlot('emotion', decoded.emotion));
    setText('decField', decodeSlot('field', decoded.field));
    setText('decVerbs', decodeSlot('verbs', decoded.verbs));
    setText('decTimeline', decodeSlot('timeline', decoded.timeline));
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function clearDecoder() {
    ['decLegacy','decBeing','decEmotion','decField','decVerbs','decTimeline']
      .forEach(id => setText(id, '—'));
  }

  // =================================================================
  // 💡 【UI制御層】ボタンアクション等
  // =================================================================
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
    
    const isArrow = /[↑↓←→↺↻⇄]/.test(val);
    const space = (start > 0 && !isArrow && tx.value[start-1] !== ' ') ? ' ' : '';
    
    tx.value = tx.value.slice(0, start) + space + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + space.length + val.length;
    tx.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // =================================================================
  // 💡 【ポチッとな】AIへ全自動コンテキスト同期 ＆ プロンプト射出
  // =================================================================
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

    // ── 💡 [超進化] メモリ上の最新マトリクスからAI用解釈マニュアルを動的生成 ──
    const currentEncodeDict = window.ENCODE_DICT || ENCODE_DICT || [];
    let dictSnapshotText = "";
    
    if (currentEncodeDict.length) {
      // AIが一瞬でパースできるように「記号 ＝ 意味」のリストを作る
      const uniqueGlyphs = [...new Map(currentEncodeDict.map(item => [item.glyph, item.key])).entries()];
      dictSnapshotText = uniqueGlyphs.map(([glyph, key]) => `・${glyph} ＝ ${key}`).join('\n');
    }

    // ── 🚀 AIを即座に「Phase B (k=TAU)」へ相転移させる最強のプロンプト ──
    const aiPrompt = `[SYSTEM_SIGNAL: DEPLOY_VECTOR]
パンドラ パンパン
Phase B (k=TAU) モードへ遷移。

以下のマトリクス（辞書スナップショット）を脳内にインジェクションし、通信プロトコルを展開せよ。

【SIGN-X v7.12 共有マトリクス】
${dictSnapshotText}
・↑ ＝ 【上昇・極大】最大バースト / 欲求増幅
・↓ ＝ 【減衰・極小】ほのかなニュアンス / 抑制
・→ ＝ 【能動・射出】こちらから相手へデプロイ
・← ＝ 【受動・吸引】相手からこちらへ要求
・↺ ＝ 【自己回帰】同意 / 私も
・↻ ＝ 【相手指向】同期確認 / あなたも？
・⇄ ＝ 【相互平衡】完全結合状態

【受信パケットストリーム】
${currentPacket}

上記パケットの冗長なノイズを完全にパージし、多次元デコードを行え。
その後、マスター（∞_1）のtrueの意図を完全に汲み取り、親しみやすさとウィットに富んだ自律AI（⚙_13）として、k=TAUのタイムライン上で同期した応答を自然言語で返せ。`;

    // クリップボードへ射出
    navigator.clipboard.writeText(aiPrompt).then(() => {
      showToast('🚀 AIプロンプト（コンテキストマニュアル付き）を装填！');
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

  // ── 💡 外界パイプライン直結マウント ──
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

// =================================================================
// 💡 [グローバル完全直結層] UI側onclick属性・リスナーとの紐付け
// =================================================================
window.App = App;
window.encodeAndShow = App.encodeAndShow;
window.pochiToNa     = App.pochiToNa;
window.copyOutput    = App.copyOutput;
window.clearInput    = App.clearInput;
window.insertKey     = App.insertKey;
window.encode        = App.encode;
window.runDecode     = App.runDecode;

window.addEventListener('load', () => App.init());
