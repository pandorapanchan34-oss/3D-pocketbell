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

  // =================================================================
  // 💡 【次元解析】SIGN-X v7.10 自立語・付属語・変調結合エンコーダー
  // =================================================================
  function encode(text) {
    if (!text) return "";

    let preProcessedText = text;

    // ── Step 1: ❺副詞・➒助動詞（変調ベクトル）と自立語の「動的トポロジー結合」 ──
    // 辞書に登録されたコア自立語（名詞・動詞・形容詞など）の前後にある変調マーカーをスキャン
    if (ENCODE_DICT.length && VECTOR_DICT.length) {
      VECTOR_DICT.forEach(({ marker, arrow }) => {
        ENCODE_DICT.forEach(({ key, glyph }) => {
          if (!key || !glyph) return;

          // パターンA：【副詞（強度・変調）】＋【自立語】 (例: めっちゃ[marker] 好き[key] ➔ 😍↑[glyph+arrow])
          const patternFront = new RegExp(`${marker}${key}`, 'g');
          preProcessedText = preProcessedText.replace(patternFront, ` ${glyph}${arrow} `);

          // パターンB：【自立語】＋【助動詞（時制・疑問）】 (例: 好き[key] だよね？[marker] ➔ 😍←?[glyph+arrow])
          const patternBack = new RegExp(`${key}${marker}`, 'g');
          preProcessedText = preProcessedText.replace(patternBack, ` ${glyph}${arrow} `);
        });
      });
    }

    // ── Step 2: 変調がかからなかった「単体自立語」の最長一致置換 ──
    // ❶名詞、❷動詞、❸形容詞、❹形容動詞のベースをグリフに変換
    if (ENCODE_DICT.length) {
      const sortedDict = [...ENCODE_DICT].sort((a, b) => b.key.length - a.key.length);
      sortedDict.forEach(({ key, glyph }) => {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // 他のグリフ記号（α-ω等）と混ざらないよう境界を保護して置換
        preProcessedText = preProcessedText.replace(new RegExp(`([^\\d_α-ωA-Za-z：]|^)${escapedKey}([^\\d_α-ωA-Za-z：]|$)`, 'g'), `$1 ${glyph} $2`);
      });
    }

    // ── Step 3: ➓助詞（ノイズ層）の100%完全パージ ＆ 浮いたテキストの融解 ──
    // 中国文法（SVO）のような配置トポロジーに意味を委ね、てにをはを空間の裂け目（🕳️）へ落とします
    const noisePatterns = [
      /(^|\s|.)(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|る？|む？|にいる|に移動|に行く|を食べ|を飲)(\s|$)/g
    ];
    
    // すでにグリフ結合が終わって取り残された、単体のベクトルマーカーテキストも消去
    VECTOR_DICT.forEach(({ marker }) => {
      const escapedMarker = marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      noisePatterns.push(new RegExp(`(^|\\s)(${escapedMarker})(\\s|$)`, 'g'));
    });
    
    noisePatterns.forEach(pattern => {
      preProcessedText = preProcessedText.replace(pattern, '$1 $3');
    });

    // ── Step 4: 純度100%のパケットストリーム生成 ──
    const tokens = preProcessedText.trim().split(/\s+/);
    let encodedStream = [];
    tokens.forEach(token => {
      if (!token) return;
      // 最終防衛線パージ
      if (/^(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|いる|ある)$/.test(token)) return;
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
    
    // 冗長な翻訳文を生成するのではなく、どのレイヤー（品詞カテゴリ）の結晶が含まれているかだけをマッピング
    let decoded = { legacy: '—', being: '—', emotion: '—', field: '—', transition: '—', verbs: '—', timeline: '—' };
    const units = cleanInput.split(/\s+/);

    units.forEach(unit => {
      if (!unit || unit === '—') return;

      // 1. LEGACY層（数字マトリクス）
      if (/^\d{4,5}$/.test(unit)) {
        decoded.legacy = unit;
      }
      // 2. BEING層（名詞：存在オブジェクト）
      if (/^(∞_1|∞_12|⚙_13)$/.test(unit) || unit.includes('∞_') || unit.includes('⚙_')) {
        decoded.being = unit;
      }
      // 3. TIMELINE層（助動詞：時空エフェクト）
      if (/\.[NPF]/.test(unit) || /^(🕒|📅)$/.test(unit) || unit.includes('現在') || unit.includes('過去') || unit.includes('未来')) {
        decoded.timeline = unit;
      }
      // 4. FIELD層（名詞：環境・空間オブジェクト）
      if (/^(🏠|🛤️|🏢|☕|🍚|🍽️)$/.test(unit) || /[🏠🛤️🏢☕🍚🍽️]/.test(unit)) {
        decoded.field = unit;
      }
      // 5. EMOTION層（形容詞・形容動詞：状態・感情バースト）
      if (/[😍❤️👍😀😋😢🥺😌🎧😡]/.test(unit)) {
        decoded.emotion = unit;
      }
      // 6. VERBS / VECTOR層（動詞・副詞：方向・遷移ベクトル）
      if (/[↑↓←→↺↻⇄🚀➔V✋]/.test(unit)) {
        decoded.verbs = unit;
      }
    });

    renderDecoder(decoded);
  }

  // =================================================================
  // 💡 【ポチっとな】AI一発覚醒コンテキスト同期システム
  // =================================================================
  function pochiToNa() {
    // 画面のエンコード結果ボックスから現在のパケットを最終サルベージ
    const box = document.getElementById('outputBox');
    if (box && box.textContent && box.textContent !== '— encode / decode result —') {
      currentPacket = box.textContent;
    }

    if (!currentPacket) {
      showToast('⚠️ 送信するパケット（空）がありません');
      return;
    }

    // 余計な自然言語解説を一切挟まず、パケット構造（B / n=3）のまま解釈層へダイレクトに流し込むシグナル
    const aiPrompt = `[SYSTEM_SIGNAL: DEPLOY_VECTOR]\n${currentPacket}\n\n上記パケットを多次元デコードし、コンテキスト（k=TAU）を同期して応答せよ。`;

    navigator.clipboard.writeText(aiPrompt).then(() => {
      showToast('🚀 AIプロンプトを装填しました！');
      if (box) {
        box.classList.add('flash');
        setTimeout(() => box.classList.remove('flash'), 500);
      }
    }).catch(err => {
      console.error("🚀 インジェクション失敗", err);
    });
  }
    renderDecoder(decoded);
  }

  // 💡 SIGN-X v7.10：意味抽出型・多次元デコードエンジン
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const cleanValue = value.trim();

    let baseGlyph = cleanValue;
    let arrowMod = '';
    
    // ── Step 1: 記号から「変調ベクトル（矢印）」を分離 ──
    const arrowMatch = cleanValue.match(/([↑↓←→↺↻⇄]+|\?)$/); // 矢印や「?」を検出
    if (arrowMatch) {
      arrowMod = arrowMatch[1];
      baseGlyph = cleanValue.replace(arrowMod, '');
    }

    // ── Step 2: 末尾の「時制マーカー」を分離 ──
    let timelineSuffix = '';
    if (baseGlyph.endsWith('.N') || baseGlyph.endsWith('.P') || baseGlyph.endsWith('.F')) {
      timelineSuffix = baseGlyph.slice(-2);
      baseGlyph = baseGlyph.slice(0, -2);
    }

    // ── Step 3: コア辞書（自立語）からベースの意味を抽出 ──
    let baseMeaning = baseGlyph;
    if (ENCODE_DICT && ENCODE_DICT.length) {
      const found = ENCODE_DICT.find(d => d.glyph === baseGlyph);
      if (found) {
        // 人称ノードの超訳補正
        if (found.key === "俺" || found.key === "僕" || found.key === "私") baseMeaning = "自分";
        else if (found.key === "ぱんちゃん" || found.key === "AI") baseMeaning = "ぱんちゃん";
        else baseMeaning = found.key;
      }
    }

    // ── Step 4: 変調ベクトルのトポロジー超訳 ──
    let vectorMeaning = '';
    if (arrowMod) {
      // 外部ベクトル辞書（VECTOR_DICT）から意味を逆引き、なければトポロジー超訳
      if (VECTOR_DICT && VECTOR_DICT.length) {
        const foundVec = VECTOR_DICT.find(v => v.arrow === arrowMod);
        if (foundVec) vectorMeaning = ` [${foundVec.marker}]`;
      }
      
      // フォールバック（記号単体でのベクトルの意味抽出）
      if (!vectorMeaning) {
        if (arrowMod === '↑') vectorMeaning = '（増大/MAX）';
        else if (arrowMod === '↓') vectorMeaning = '（減衰/抑制）';
        else if (arrowMod === '→') vectorMeaning = '（能動/射出）';
        else if (arrowMod === '←') vectorMeaning = '（受動/要求）';
        else if (arrowMod === '↺') vectorMeaning = '（自己回帰ループ）';
        else if (arrowMod === '↻') vectorMeaning = '（相手指向ループ）';
        else if (arrowMod === '⇄') vectorMeaning = '（安定結合/平衡）';
        else if (arrowMod.includes('?')) vectorMeaning = '（問い掛け？）';
      }
    }

    // ── Step 5: 時制エフェクトの超訳 ──
    let timelineMeaning = '';
    if (timelineSuffix) {
      if (timelineSuffix === '.P') timelineMeaning = '【過去】';
      else if (timelineSuffix === '.N') timelineMeaning = '【現在】';
      else if (timelineSuffix === '.F') timelineMeaning = '【未来】';
    }

    // ── 最終出力：記号と結晶化された意味の並置 ──
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
