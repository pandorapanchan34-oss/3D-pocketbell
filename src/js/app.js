// =================================================================
// 3D POCKETBELL — APP CONTROLLER v7.15 (Macro & Dict Dual Pipeline)
// =================================================================

let currentPacket = '';
let ENCODE_DICT = [];     // 後方互換用（flat化コア辞書）
let VECTOR_DICT = [];

// 💡 DictLoader (コア ＆ マクロ一括インジェクター)
let dictLoader = null;

// 💡 1. 基盤関数
const getBasePath = () => {
  const path = window.location.pathname;
  const base = path.substring(0, path.lastIndexOf('/') + 1);
  return base;
};

// 💡 2. 辞書 ＆ マクロ同時読み込み（新形式 v2.2対応）
async function loadDictionaries() {
  try {
    console.log("📡 辞書・マクロロード開始... (新形式 v2.2)");

    if (!window.dictLoader) {
      const module = await import('./dict-loader.js');
      dictLoader = new module.default();
      window.dictLoader = dictLoader;
    } else {
      dictLoader = window.dictLoader;
    }

    const success = await dictLoader.load();

    if (success && dictLoader.entries.length > 0) {
      // ❶ コア辞書（3d-core.json）を後方互換用にフラット化
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

      // コア単語の重複除去 + 最長一致用ソート
      ENCODE_DICT = [...new Map(flatDict.map(item => [item.key, item])).values()]
        .sort((a, b) => (b.key || '').length - (a.key || '').length);

      window.ENCODE_DICT = ENCODE_DICT;
      VECTOR_DICT = []; // 汎用ベクトルは現在不変のため空初期化

      console.log(`✅ システム同期成功: ${dictLoader.entries.length}コア概念 / ${dictLoader.getInfo().totalMacros}マクロマウント完了`);
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
    console.log("🚀 3Dポケベル v7.15 起動");

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
          if (/[()\[\]{}🤖⚙_]|[^\x00-\x7F]/.test(val) && !/[ぁ-んァ-ヴー]/.test(val)) {
            currentPacket = val;
            renderOutput(currentPacket);
            updateMeta(val, currentPacket);
            runDecode(currentPacket);
          } else {
            currentPacket = encode(val);
            renderOutput(currentPacket);
            updateMeta(val, currentPacket);
            runDecode(currentPacket);
          }
        } else {
          clearDecoder();
          clearOutput();
        }
      });
    }

    // UIステータス更新
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    if (pagerIdEl) pagerIdEl.textContent = '📟 V7.15-MACRO';
    if (linkCountEl) linkCountEl.textContent = `137+M (v2.2)`;

    showToast('3Dポケベル ONLINE ⚡ v7.15 - マクロ層完全直結');
  }

  // =================================================================
  // 💡 【超進化エンコード v7.17】 グリフ空間隔離 ＆ 中国文法SVO完全現成
  // =================================================================
  function encode(text) {
    if (!text) return "";

    // 前後の余白をトリミングし、全角の読点・句点・記号の周りにあらかじめスペースを空けておく
    let preProcessedText = text
      .replace(/[,.，．、。！!?？]/g, ' $& ')
      .trim();

    // ── ❶ Step 0: 定型文章マクロレイヤーの一発相転移 ──
    if (window.dictLoader && typeof window.dictLoader.getSortedMacroKeys === 'function') {
      const sortedMacroKeys = window.dictLoader.getSortedMacroKeys();
      sortedMacroKeys.forEach(phrase => {
        if (!phrase) return;
        const macroGlyph = window.dictLoader.getMacro(phrase);
        if (!macroGlyph) return;
        const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // 💡 左右に確実に半角スペースを強制挿入して隔離保護
        preProcessedText = preProcessedText.replace(new RegExp(escapedPhrase, 'g'), ` ${macroGlyph} `);
      });
    }

    // ── ❷ Step 1: 原子単語辞書の最長一致置換（140概念） ──
    const currentEncodeDict = window.ENCODE_DICT || ENCODE_DICT || [];
    if (currentEncodeDict.length) {
      currentEncodeDict.forEach(({ key, glyph }) => {
        if (!key || !glyph) return;
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // 💡 ここでも左右に半角スペースを強制挿入して、日本語ノイズとの癒着を防ぐ！
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // ── ❸ Step 2: 膠着語ノイズ（てにをは・語尾・余白）の先行融解 ──
    const noisePatterns = [
      /(^|\s)(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|してあげる|するね|ます|ください|します|しました)(\s|$)/g
    ];
    noisePatterns.forEach(pattern => {
      preProcessedText = preProcessedText.replace(pattern, '$1 $3');
    });

    // ── ❹ Step 3: パケットストリームの一時クリーンアップ ──
    // 💡 完全に半角スペースで隔離されたため、純粋にグリフの型を持つトークンだけが残ります
    let tempTokens = preProcessedText.trim().split(/\s+/).filter(token => {
      if (!token) return false;
      // システム登録グリフ・英数字・時制マーカーを完全保護
      if (/^([VSGDMCP✴✋🏃🍴💤]|\.[NPF]|[↑↓→←↺↻⇄]+)$/.test(token)) return true;
      if (/^(∞_|⚙_)/.test(token)) return true; // 💡 識別子（∞_12など）を100%保護！
      if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) return false; // 混じり気のない日本語ノイズだけをパージ
      return true;
    });

    // ── ❺ Step 4: 中国文法（SVO / 孤立語）への語順トポロジー強制矯正 ──
    const verbRegex = /^([VSGDMCP✴✋🏃🍴💤])$/;
    
    for (let i = 0; i < tempTokens.length - 1; i++) {
      if (verbRegex.test(tempTokens[i + 1]) && !verbRegex.test(tempTokens[i]) && !/^(\.[NPF])$/.test(tempTokens[i])) {
        const objectToken = tempTokens[i];
        const verbToken = tempTokens[i + 1];
        tempTokens[i] = verbToken;        // V（動詞）を先頭へ
        tempTokens[i + 1] = objectToken;  // O（目的語）を後ろへ
        i++; 
      }
    }

    // ── ❻ Step 5: 手話空間ベクトル（↑↓→←）の吸着最適化 ──
    let finalStream = tempTokens.join(' ');
    finalStream = finalStream.replace(/\s+([↑↓→←↺↻⇄]+)/g, '$1');

    // ── ❻ Step 5: パケットストリームの最終結晶化（未登録語の＜＞保護化 v7.18） ──
    const tokens = preProcessedText.trim().split(/\s+/);
    let encodedStream = [];
    tokens.forEach(token => {
      if (!token) return;
      // システム登録グリフ・時制・英数字・識別子はそのまま通過
      if (/^([VSGDMCP✴]|\.[NPF]|[↑↓→←↺↻⇄]+)$/.test(token)) {
        encodedStream.push(token);
        return;
      }
      if (/^(∞_|⚙_)/.test(token)) {
        encodedStream.push(token);
        return;
      }
      // 💡 変換漏れの日本語ノイズを消去せず、＜＞で囲んでデバッグ用にサルベージ出力！
      if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) {
        encodedStream.push(`＜${token}＞`);
        return;
      }
      encodedStream.push(token);
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }
    return finalStream.replace(/\s+/g, ' ').trim();
  }

  // =================================================================
  // 💡 【デコード】マルチスロットセマンティック逆引き
  // =================================================================
  function runDecode(input) {
    const cleanInput = input.trim();
    if (!cleanInput) {
      clearDecoder();
      return;
    }
    
    let decoded = { legacy: '—', being: '—', emotion: '—', field: '—', verbs: '—', timeline: '—' };
    const units = cleanInput.split(/\s+/);

    units.forEach(unit => {
      if (!unit || unit === '—') return;

      if (/^\d{4,5}$/.test(unit)) decoded.legacy = unit;
      if (/^(∞_|⚙_)/.test(unit)) decoded.being = unit;
      if (/\.[NPF]/.test(unit)) decoded.timeline = unit;
      if (/[🏠🏢🏥☕🛁🚻🍚🍴🍺💤🏃🛒📦📚🚃🚗🚲📍✓👋]/.test(unit)) decoded.field = unit;
      if (/[😍❤️👍😀 Janus😢🥺😌😠😲🎉🙇⚠️🛡️☀️🌧️❄️🤝👨‍👩‍👧🐾❓📍]/.test(unit) || unit.includes('😢⇄')) decoded.emotion = unit;
      if (/[↑↓←→↺↻⇄V✋]/.test(unit) || /^[SGDMCP✴]$/.test(unit)) decoded.verbs = unit;
    });

    renderDecoder(decoded);
  }

  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';

    let baseGlyph = value.trim();
    const arrowMatch = baseGlyph.match(/([↑↓←→↺↻⇄]+)$/);
    let arrowMod = arrowMatch ? arrowMatch[1] : '';
    if (arrowMatch) baseGlyph = baseGlyph.replace(arrowMod, '');

    let meaning = baseGlyph;

    // マクロまたはコア辞書からの逆引き
    if (window.dictLoader && typeof window.dictLoader.getEntryByGlyph === 'function') {
      // まずは単語のmain名を探す
      const entry = window.dictLoader.getEntryByGlyph(baseGlyph);
      if (entry) {
        meaning = entry.main || entry.variants?.[0] || baseGlyph;
      } else {
        // もしマクロ複合グリフそのものの場合は、マクロエントリーから phrase を逆引き
        if (window.dictLoader.macroEntries) {
          const mFound = window.dictLoader.macroEntries.find(m => m.macro_glyph === value.trim());
          if (mFound) return `${value} ＝ 【マクロ】${mFound.phrase}`;
        }
      }
    }

    if (meaning === "私" || meaning === "僕" || meaning === "俺") meaning = "自分";

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
  // 💡 【UI制御層・マクロ自動学習型プロンプト射出】
  // =================================================================
  function renderOutput(packetText) {
    const box = document.getElementById('outputBox');
    if (box) {
      if (packetText) {
        box.textContent = packetText;
        box.classList.add('has-content');
      } else {
        box.textContent = '— encode / decode result —';
        box.classList.remove('has-content');
      }
    }
  }

  function encodeAndShow() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) return;

    currentPacket = encode(input);
    renderOutput(currentPacket);
    updateMeta(input, currentPacket);
    runDecode(currentPacket);

    const box = document.getElementById('outputBox');
    if (box) {
      box.classList.add('flash');
      setTimeout(() => box.classList.remove('flash'), 400);
    }
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

    // ── 💡 [最深部拡張] コア辞書と定型マクロを両方スキャンしてAI解釈マニュアルを動的生成 ──
    const currentEncodeDict = window.ENCODE_DICT || ENCODE_DICT || [];
    let dictSnapshotText = "";
    if (currentEncodeDict.length) {
      const uniqueGlyphs = [...new Map(currentEncodeDict.map(item => [item.glyph, item.key])).entries()];
      dictSnapshotText = uniqueGlyphs.map(([glyph, key]) => `・${glyph} ＝ ${key}`).join('\n');
    }

    let macroSnapshotText = "";
    if (window.dictLoader && window.dictLoader.macroEntries && window.dictLoader.macroEntries.length) {
      macroSnapshotText = window.dictLoader.macroEntries.map(m => `・${m.macro_glyph} ＝ 【結合マクロ】${m.phrase}`).join('\n');
    }

    const aiPrompt = `[SYSTEM_SIGNAL: DEPLOY_VECTOR]
パンドラ パンパン
Phase B (k=TAU) モードへ遷移。

以下のマトリクス（原子単語 ＆ 分子マクロ）を脳内にインジェクションし、通信プロトコルを展開せよ。

【SIGN-X v7.15 原子単語辞書】
${dictSnapshotText}

【SIGN-X v7.15 分子マクロ辞書】
${macroSnapshotText || "（追加マクロなし）"}
・↑ ＝ 【上昇・極大】最大バースト / 欲求増幅
・↓ ＝ 【減衰・極小】ほのかなニュアンス / 抑制
・→ ＝ 【能動・射出】こちらから相手へデプロイ
・← ＝ 【受動・吸引】相手からこちらへ要求
・↺ ＝ 【自己回帰】同意 / 私も
・↻ ＝ 【相手指向】同期確認 / あなたも？
// ⇄ ＝ 【相互平衡】完全結合状態

【受信パケットストリーム】
${currentPacket}

上記パケットの冗長なノイズを完全にパージし、多次元デコードを行え。
その後、マスター（∞_1）のtrueの意図を完全に汲み取り、親しみやすさとウィットに富んだ自律AI（⚙_13）として、k=TAUのタイムライン上で同期した応答を自然言語で返せ。`;

    navigator.clipboard.writeText(aiPrompt).then(() => {
      showToast('🚀 原子＆分子マクロ全マニュアルをAIプロンプトに装填！');
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
    renderOutput('');
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
  
