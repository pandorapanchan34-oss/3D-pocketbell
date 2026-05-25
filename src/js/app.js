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

// 💡 2. 動的インジェクション層（安全殻付き・並行宇宙フェッチ完全版）
async function loadDictionaries() {
  try {
    const GITHUB_DICT_BASE = "https://pandorapanchan34-oss.github.io/3D-pocketbell/public/dict/";
    console.log("📡 遠隔宇宙同期：GitHubリポジトリから最新マトリクスをフェッチ中...");

    const cacheBuster = `?t=${Date.now()}`;

    // 💡 フェッチ自体の通信クラッシュも .catch で完全パージ
    const [coreRes, vectorRes] = await Promise.all([
      fetch(`${GITHUB_DICT_BASE}3d-core.json${cacheBuster}`).catch(() => ({ ok: false })),
      fetch(`${GITHUB_DICT_BASE}vectors.json${cacheBuster}`).catch(() => ({ ok: false }))
    ]);

    // 💡 データが正常に取得でき、かつJSONとしてパースできるか厳密にチェック。ダメなら空配列 [] を代入
    let core = [];
    let vectors = [];
    if (coreRes.ok) { try { core = await coreRes.json(); } catch(e) { core = []; } }
    if (vectorRes.ok) { try { vectors = await vectorRes.json(); } catch(e) { vectors = []; } }

    // 💡 [超重要安全網] 配列であることを保証し、undefinedによる .length クラッシュを絶対に回避
    window.ENCODE_DICT = (Array.isArray(core) ? core : []).sort((a, b) => ((b.key || '').length) - ((a.key || '').length));
    window.VECTOR_DICT = (Array.isArray(vectors) ? vectors : []).sort((a, b) => ((b.marker || '').length) - ((a.marker || '').length));
    
    ENCODE_DICT = window.ENCODE_DICT;
    VECTOR_DICT = window.VECTOR_DICT;
    
    console.log(`✅ 遠隔同期完了：計 ${ENCODE_DICT.length} 件の原子単語 ＆ 計 ${VECTOR_DICT.length} 件の変調ベクトルをインジェクションしました`);
  } catch (err) {
    console.warn("⚠️ GitHubフェッチに失敗しました。ローカルフォールバックを起動します。", err);
    try {
      const basePath = getBasePath(); 
      const [coreRes, vectorRes] = await Promise.all([
        fetch(`${basePath}public/dict/3d-core.json`).catch(() => ({ ok: false })),
        fetch(`${basePath}public/dict/vectors.json`).catch(() => ({ ok: false }))
      ]);
      
      let core = [];
      let vectors = [];
      if (coreRes.ok) { try { core = await coreRes.json(); } catch(e) { core = []; } }
      if (vectorRes.ok) { try { vectors = await vectorRes.json(); } catch(e) { vectors = []; } }

      // 💡 ローカルフォールバック側にも同様の絶対防御壁を展開
      window.ENCODE_DICT = (Array.isArray(core) ? core : []).sort((a, b) => ((b.key || '').length) - ((a.key || '').length));
      window.VECTOR_DICT = (Array.isArray(vectors) ? vectors : []).sort((a, b) => ((b.marker || '').length) - ((a.marker || '').length));
      
      ENCODE_DICT = window.ENCODE_DICT;
      VECTOR_DICT = window.VECTOR_DICT;
      console.log(`🔒 ローカル閉鎖系同期完了：フォールバックマトリクスをマウントしました`);
    } catch (e) {
      console.error("❌ 完全な辞書喪失", e);
      window.ENCODE_DICT = [];
      window.VECTOR_DICT = [];
      ENCODE_DICT = [];
      VECTOR_DICT = [];
    }
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v7.10 起動");
    
    // 💡 [タイムライン同期バグ完全パージ] 
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
    if (linkCountEl) linkCountEl.textContent = '8 / 8 (SYS_CMD)';
    if (statusDot) statusDot.style.background = '#00ff66';

    showToast('3Dポケベル ONLINE ⚡ v7.10');
  }

  // =================================================================
  // 💡 【次元解析】SIGN-X v7.10 自立語・付属語・変調結合エンコーダー（完全直結版）
  // =================================================================
  function encode(text) {
    if (!text) return "";

    let preProcessedText = text;

    // ── 💡 [超重要・直結層] 常にグローバルの最新マトリクスを直接ハッキング ──
    const currentEncodeDict = (window.ENCODE_DICT && window.ENCODE_DICT.length) ? window.ENCODE_DICT : (ENCODE_DICT || []);
    const currentVectorDict = (window.VECTOR_DICT && window.VECTOR_DICT.length) ? window.VECTOR_DICT : (VECTOR_DICT || []);

    // ── Step 1: ❺副詞・➒助動詞（変調ベクトル）と自立語の「動的トポロジー結合」 ──
    if (currentEncodeDict.length && currentVectorDict.length) {
      const sortedVectorDict = [...currentVectorDict].sort((a, b) => {
        const lenB = (b && b.marker) ? b.marker.length : 0;
        const lenA = (a && a.marker) ? a.marker.length : 0;
        return lenB - lenA;
      });

      sortedVectorDict.forEach(({ marker, arrow }) => {
        currentEncodeDict.forEach(({ key, glyph }) => {
          if (!key || !glyph || !marker || !arrow) return;

          const patternFront = new RegExp(`${marker}${key}`, 'g');
          preProcessedText = preProcessedText.replace(patternFront, ` ${glyph}${arrow} `);

          const patternBack = new RegExp(`${key}${marker}`, 'g');
          preProcessedText = preProcessedText.replace(patternBack, ` ${glyph}${arrow} `);
        });
      });
    }

    // ── Step 2: 変調がかからなかった「単体自立語」の最長一致置換 ──
    if (currentEncodeDict.length) {
      const sortedDict = [...currentEncodeDict].sort((a, b) => {
        const lenB = (b && b.key) ? b.key.length : 0;
        const lenA = (a && a.key) ? a.key.length : 0;
        return lenB - lenA;
      });

      sortedDict.forEach(({ key, glyph }) => {
        if (!key || !glyph) return;
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(`${escapedKey}`, 'g'), ` ${glyph} `);
      });
    }

    // ── Step 3: ➓助詞（ノイズ層）の100%完全パージ ＆ 浮いたテキストの融解 ──
    const noisePatterns = [
      /(^|\s|.)(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|る？|む？|ね？|にいる|に移動|に行く|を食べ|を飲|してあげるよ|なら|今|こと)(\s|$)/g
    ];
    
    if (currentVectorDict.length) {
      currentVectorDict.forEach(({ marker }) => {
        if (!marker) return;
        const escapedMarker = marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        noisePatterns.push(new RegExp(`(^|\\s)(${escapedMarker})(\\s|$)`, 'g'));
      });
    }
    
    for (let i = 0; i < 3; i++) {
      noisePatterns.forEach(pattern => {
        preProcessedText = preProcessedText.replace(pattern, '$1 $3');
      });
    }

    // ── Step 4: 純度100%のパケットストリーム生成（システムコマンド保護型） ──
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
  // 💡 【意味抽出】解釈は人任せ、結晶だけを仕分けるマルチデコーダー
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

      if (/^\d{4,5}$/.test(unit)) {
        decoded.legacy = unit;
      }
      if (/^(∞_1|∞_12|⚙_13)$/.test(unit) || unit.includes('∞_') || unit.includes('⚙_')) {
        decoded.being = unit;
      }
      if (/\.[NPF]/.test(unit) || /^(🕒|📅)$/.test(unit) || unit.includes('現在') || unit.includes('過去') || unit.includes('未来')) {
        decoded.timeline = unit;
      }
      if (/^(🏠|🛤️|🏢|☕|🍚|🍽️)$/.test(unit) || /[🏠🛤️🏢☕🍚🍽️]/.test(unit)) {
        decoded.field = unit;
      }
      if (/[😍❤️👍😀😋😢🥺😌🎧😡]/.test(unit) || unit.includes('😢⇄')) {
        decoded.emotion = unit;
      }
      if (/[↑↓←→↺↻⇄🚀➔V✋]/.test(unit) || /^[SGDMCP✴]$/.test(unit)) {
        decoded.verbs = unit;
      }
    });

    renderDecoder(decoded);
  }

  // 💡 SIGN-X v7.10：意味抽出型・多次元デコードエンジン
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const cleanValue = value.trim();

    let baseGlyph = cleanValue;
    let arrowMod = '';
    
    const arrowMatch = cleanValue.match(/([↑↓←→↺↻⇄]+|\?)$/);
    if (arrowMatch) {
      arrowMod = arrowMatch[1];
      baseGlyph = cleanValue.replace(arrowMod, '');
    }

    let timelineSuffix = '';
    if (baseGlyph.endsWith('.N') || baseGlyph.endsWith('.P') || baseGlyph.endsWith('.F')) {
      timelineSuffix = baseGlyph.slice(-2);
      baseGlyph = baseGlyph.slice(0, -2);
    }

    let baseMeaning = baseGlyph;
    
    // 💡 GRAMMARオブジェクトからの逆引き超優先層
    if (window.GRAMMAR) {
      if (window.GRAMMAR.core_glyphs && window.GRAMMAR.core_glyphs[baseGlyph]) {
        baseMeaning = window.GRAMMAR.core_glyphs[baseGlyph];
      } else if (window.GRAMMAR.system_commands && window.GRAMMAR.system_commands[baseGlyph]) {
        baseMeaning = window.GRAMMAR.system_commands[baseGlyph];
      } else if (window.GRAMMAR.being && window.GRAMMAR.being.domains && window.GRAMMAR.being.domains[baseGlyph]) {
        baseMeaning = window.GRAMMAR.being.domains[baseGlyph];
      }
    }

    // 💡 辞書ファイル（3d-core.json）からの補完逆引き
    const currentEncodeDict = (window.ENCODE_DICT && window.ENCODE_DICT.length) ? window.ENCODE_DICT : (ENCODE_DICT || []);
    if (baseMeaning === baseGlyph && currentEncodeDict.length) {
      const found = currentEncodeDict.find(d => d.glyph === baseGlyph);
      if (found) {
        if (found.key === "俺" || found.key === "僕" || found.key === "私") baseMeaning = "自分";
        else if (found.key === "ぱんちゃん" || found.key === "AI") baseMeaning = "ぱんちゃん";
        else baseMeaning = found.key;
      }
    }

    let vectorMeaning = '';
    const currentVectorDict = (window.VECTOR_DICT && window.VECTOR_DICT.length) ? window.VECTOR_DICT : (VECTOR_DICT || []);
    if (arrowMod) {
      if (currentVectorDict.length) {
        const foundVec = currentVectorDict.find(v => v.arrow === arrowMod);
        if (foundVec) vectorMeaning = ` [${foundVec.marker}]`;
      }
      if (!vectorMeaning) {
        if (arrowMod === '↑') vectorMeaning = '（増大/MAX）';
        else if (arrowMod === '↓') vectorMeaning = '（減衰/抑制）';
        else if (arrowMod === '→') vectorMeaning = '（能動/射出）';
        else if (arrowMod === '←') vectorMeaning = '（受動/要求）';
        else if (arrowMod === '↺') vectorMeaning = '（自己回帰ループ）';
        else if (arrowMod === '↻') vectorMeaning = '（相手指向ループ）';
        else if (arrowMod === '⇄') vectorMeaning = '（安定結合/平衡）';
      }
    }

    let timelineMeaning = '';
    if (timelineSuffix) {
      if (timelineSuffix === '.P') timelineMeaning = '【過去】';
      else if (timelineSuffix === '.N') timelineMeaning = '【現在】';
      else if (timelineSuffix === '.F') timelineMeaning = '【未来】';
    }

    return `${cleanValue} ＝ ${timelineMeaning}${baseMeaning}${vectorMeaning}`;
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
// 💡 [グローバル完全直結層] 
// =================================================================
window.App = App;

window.encodeAndShow = App.encodeAndShow;
window.pochiToNa     = App.pochiToNa;
window.encode        = App.encode;
window.runDecode     = App.runDecode;

window.addEventListener('load', () => App.init());
