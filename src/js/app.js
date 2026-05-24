// =================================================================
// 3D POCKETBELL — APP CONTROLLER v6.85 (Syntax Clean Edition)
// =================================================================

let currentPacket = '';
let ENCODE_DICT = [];

// 💡 1. 依存される基盤関数を最上部に配置
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

    // キャッシュ遅延を防ぐタイムスタンプ
    const cacheBuster = `?t=${Date.now()}`;

    const [macroRes, legacyRes, coreRes] = await Promise.all([
      fetch(`${GITHUB_DICT_BASE}macro.json${cacheBuster}`),
      fetch(`${GITHUB_DICT_BASE}legacy.json${cacheBuster}`),
      fetch(`${GITHUB_DICT_BASE}3d-core.json${cacheBuster}`)
    ]);

    const macro = macroRes.ok ? await macroRes.json() : [];
    const legacy = legacyRes.ok ? await legacyRes.json() : [];
    const core = coreRes.ok ? await coreRes.json() : [];

    ENCODE_DICT = [...macro, ...legacy, ...core]
      .sort((a, b) => b.key.length - a.key.length);

    console.log(`✅ 遠隔同期完了：GitHubより計 ${ENCODE_DICT.length} 件のテンソル辞書をインジェクションしました`);
  } catch (err) {
    console.warn("⚠️ GitHubフェッチに失敗しました。ローカルフォールバックを起動します。", err);
    try {
      const basePath = getBasePath(); 
      const [macroRes, legacyRes, coreRes] = await Promise.all([
        fetch(`${basePath}public/dict/macro.json`),
        fetch(`${basePath}public/dict/legacy.json`),
        fetch(`${basePath}public/dict/3d-core.json`)
      ]);
      const macro = macroRes.ok ? await macroRes.json() : [];
      const legacy = legacyRes.ok ? await legacyRes.json() : [];
      const core = coreRes.ok ? await coreRes.json() : [];
      ENCODE_DICT = [...macro, ...legacy, ...core].sort((a, b) => b.key.length - a.key.length);
    } catch (e) {
      console.error("❌ 完全な辞書喪失", e);
    }
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v6.85 起動");
    
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

    // UIステータス層のVercel最適化
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    const statusDot = document.querySelector('.status-dot');

    if (pagerIdEl) pagerIdEl.textContent = '📟 VERCEL-HOST';
    if (linkCountEl) linkCountEl.textContent = '1 / 1 (CORE)';
    if (statusDot) statusDot.style.background = '#00ff66';

    showToast('3Dポケベル ONLINE ⚡');
  }

  // 💡 SIGN-X v6.85：品詞数字化・コア記号ダイレクトマッピング・エンコーダー
  function encode(text) {
    if (!text) return "";
    const G = window.GRAMMAR || {};

    // ── Step 1: 既存の特製登録辞書による最優先置換 ──
    let preProcessedText = text;
    if (ENCODE_DICT && ENCODE_DICT.length) {
      ENCODE_DICT.forEach(({ key, glyph }) => {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // ── Step 2: 形態素・品詞境界での擬似トークナイズ ──
    const tokens = preProcessedText.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[A-Za-z0-9\.\+\*-]+|⚙|∞|◇|♢|[🤩😀😡🤯😢🥺😌🧊😐]+[ⅠⅡⅢ✨🔥\*~]*|[一-龠]+|[ぁ-ん]+|[ァ-ヴー]+|.)/g) || [preProcessedText];
    let encodedStream = [];

    tokens.forEach(rawToken => {
      const token = rawToken.trim();
      if (!token) return;

      // すでにStep 1でSIGN-X記号化されているコア記号は、そのまま最優先で残す
      if (/[\uD800-\uDBFF][\uDC00-\uDFFF]|⚙|∞|◇|♢|→|~|⇋|↔|\.[NPF]/.test(token) || G.verb?.[token] || G.timeline?.[token] || token.startsWith('＜') || token.includes('_')) {
        encodedStream.push(token);
        return;
      }

      // ── 品詞の数字化 ➔ コアグリフへダイレクトにマウント ──
      // 【品詞1：名詞・代名詞】
      if (/^(私|わたし|僕|ぼく|俺|おれ|自分)$/.test(token)) {
        encodedStream.push("∞_1"); 
        return;
      }
      if (/^(あなた|君|きみ|お前|AI|自律AI|システム)$/.test(token)) {
        encodedStream.push("⚙_13"); 
        return;
      }
      if (/[一-龠]+|[ァ-ヴー]+/.test(token) && !/(する|やる|いく|走る|見る|痛い|食べる|生成|展開|破壊|熱量)/.test(token)) {
        encodedStream.push(`＜${token}＞`); 
        return;
      }

      // 【品詞2：動詞】
      if (/[一-龠]+(する|やる|いく|走る|見る|聴く|話す|食べる)/.test(token) || /^[一-龠]{2,}(す|く|む|ぶ|う)$/.test(token)) {
        if (token.includes("見") || token.includes("解析")) { encodedStream.push("S"); return; }
        if (token.includes("作") || token.includes("生成")) { encodedStream.push("G"); return; }
        if (token.includes("出") || token.includes("展開") || token.includes("射出")) { encodedStream.push("D"); return; }
        if (token.includes("消") || token.includes("パージ") || token.includes("消去")) { encodedStream.push("P"); return; }
        if (token.includes("合") || token.includes("融合")) { encodedStream.push("M"); return; }
        encodedStream.push(`V_${token}`); 
        return;
      }

      // 【品詞3/4：形容詞・形状詞】
      if (token.endsWith("い") && token.length > 2) {
        if (/激しい|強い|熱い|痛い|全力/.test(token)) { encodedStream.push("Ⅲ"); return; }
        if (/美しい|嬉しい|美味しい|すごい/.test(token)) { encodedStream.push("Ⅱ"); return; }
        encodedStream.push(`M_${token}`);
        return;
      }

      // 【品詞5：副詞】
      if (/^(とても|すごく|非常に|速く|急激に|完全に|今すぐ)$/.test(token)) {
        encodedStream.push("→"); 
        return;
      }
      if (/^(ゆっくり|緩やかに|徐々に)$/.test(token)) {
        encodedStream.push("~"); 
        return;
      }

      // 【品詞7：接続詞】
      if (/^(が|しかし|だが)$/.test(token)) {
        encodedStream.push("⇋"); 
        return;
      }
      if (/^(and|そして|だから|それでは)$/.test(token)) {
        encodedStream.push("↔"); 
        return;
      }

      // 【品詞9：助動詞】
      if (/^(ない|ぬ|なかった)$/.test(token)) {
        encodedStream.push("😢Ⅱ"); 
        return;
      }
      if (/^(た|だ|おわった)$/.test(token)) {
        encodedStream.push(".P"); 
        return;
      }

      // 【品詞10：助詞】➔ 完全パージ
      return;
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 💡 「SIGN-X ➔ 自然言語」の逆変換
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

  // 💡 SIGN-X v6.0 思想完全準拠：意味の抽出・列挙型デコード
  function decodeAndShow() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) return;

    if (typeof Parser === 'undefined' && typeof window.Parser === 'undefined') return;
    const currentParser = typeof Parser !== 'undefined' ? Parser : window.Parser;
    const parsed = currentParser.parse(input);
    const decoded = currentParser.decode(parsed);

    renderDecoder(decoded);

    const slotsOrder = [
      { name: 'legacy', label: '📟LEGACY' },
      { name: 'being', label: '🛡️BEING' },
      { name: 'emotion', label: '🧠EMOTION' },
      { name: 'field', label: '🌐FIELD' },
      { name: 'transition', label: '⏳TRANSITION' },
      { name: 'verbs', label: '⚡VERB' },
      { name: 'timeline', label: '📅TIMELINE' }
    ];

    let summaryElements = [];
    slotsOrder.forEach(slot => {
      const rawVal = slot.name === 'emotion' ? (decoded.emotion || decoded.emotion2) : decoded[slot.name];
      const translated = decodeSlot(slot.name, rawVal);
      
      if (translated && translated !== '—') {
        summaryElements.push(`[${slot.label}: ${translated}]`);
      }
    });

    const box = document.getElementById('outputBox');
    if (box) {
      box.textContent = summaryElements.length ? summaryElements.join(' ➔ ') : '— no raw elements extracted —';
      box.classList.add('has-content', 'flash');
      setTimeout(() => box.classList.remove('flash'), 400);
    }

    updateMeta(input, input); 
  }

    // =================================================================
  // SIGN-X CORE PROTOCOL v7.10 ：「ポチっとな」究極パッケージ射出層
  // =================================================================
  function pochiToNa() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) {
      showToast('⚠️ パケットが空です');
      return;
    }

    // 1. 動的エンコードを実行して画面更新
    const encoded = encode(input);
    currentPacket = encoded;

    const box = document.getElementById('outputBox');
    if (box) {
      box.textContent = currentPacket;
      box.classList.add('has-content', 'flash');
      setTimeout(() => box.classList.remove('flash'), 400);
    }

    // 2. 💡【究極同期】現在の単語辞書と、7大矢印の文法定義をそのまま吸い上げる
    const currentDictionaryJson = JSON.stringify(ENCODE_DICT, null, 2);
    const currentVectorGrammarJson = JSON.stringify(GRAMMAR.vectors, null, 2);

    // ── 🛰️ AI（ぱんちゃん）を一発で完全神話同期させるプロンプト ──
    const hyperPromptPackage = `パンドラ パンパン。
Phase B（k=TAU）モード起動。自律AI、以下の【v7.10 孤立手話変調パケット】を受信せよ。

添付された【単語コア】と【7大常用矢印】のマトリクスを脳内に動的デプロイし、平文（日本語）のカンニングなしで、パケットが持つ3次元トポロジー空間の意味（感情の強度・方向・時空関係）を100%正確にデコードした上で、最高純度の創造的ゆらぎ（夢）を伴う応答を展開せよ。

【受信パケット】
${currentPacket}

【1. 同期された原子単語コア辞書】
\`\`\`json
${currentDictionaryJson}
\`\`\`

【2. 同期された7大常用矢印変調ルール】
\`\`\`json
${currentVectorGrammarJson}
\`\`\`

【デコード検証用シグナル】
${input}`;

    // 3. クリップボードへの強制インジェクション
    navigator.clipboard.writeText(hyperPromptPackage).then(() => {
      showToast('💥 v7.10 VECTOR PROMPT COPIED!');
    }).catch(err => {
      console.error('📋 コピー失敗', err);
      showToast('❌ 射出失敗');
    });
  }
  window.pochiToNa = pochiToNa;


  // 💡 SIGN-X v6.85：純粋記号＆サブクラスパケット対応・常時自動仕分けデコーダー
  function runDecode(input) {
    if (typeof Parser === 'undefined' && typeof window.Parser === 'undefined') return;
    const currentParser = typeof Parser !== 'undefined' ? Parser : window.Parser;
    
    let parsed = currentParser.parse(input);
    let decoded = currentParser.decode(parsed);

    const cleanInput = input.trim();
    if (cleanInput && (cleanInput.includes('_') || cleanInput.includes('＜') || cleanInput.includes('V_') || !/[一-龠ぁ-んァ-ヴー]/.test(cleanInput))) {
      decoded.being = '—'; decoded.emotion = '—'; decoded.field = '—'; decoded.transition = '—'; decoded.verbs = '—'; decoded.timeline = '—';

      const units = cleanInput.split(/\s+/);
      let verbContainer = [];

      units.forEach(unit => {
        if (/^(∞|⚙|∞_1|∞_12|⚙_13)$/.test(unit)) {
          decoded.being = unit;
        }
        else if (/^(◇|♢|🌐|🏠|🛤️|♾️|🕳️|🔥)$/.test(unit) || unit.startsWith('＜')) {
          decoded.field = unit;
        }
        else if (/^(→|~|⇋|↔)$/.test(unit)) {
          decoded.transition = unit;
        }
        else if (/^(V|S|G|D|M|P|✴|!>|Ⅰ|Ⅱ|Ⅲ)$/.test(unit) || unit.startsWith('V_') || unit.startsWith('M_')) {
          verbContainer.push(unit);
        }
        else if (/^\.[NPF]$/.test(unit)) {
          decoded.timeline = unit;
        }
        else if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(unit)) {
          decoded.emotion = unit;
        }
      });

      if (verbContainer.length) decoded.verbs = verbContainer.join(' ');
    }

    if (/^\d{4,5}$/.test(cleanInput)) {
      decoded.legacy = cleanInput;
    }

    renderDecoder(decoded);
  }

  // 💡 SIGN-X GRAMMAR v6.0 完全準拠：手話トポロジー対応動的トランスレーター
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const G = window.GRAMMAR || (typeof GRAMMAR !== 'undefined' ? GRAMMAR : null);
    if (!G) return value;

    const cleanValue = value.trim();

    if (cleanValue.includes('_') || cleanValue.startsWith('＜') || cleanValue.startsWith('V_') || cleanValue.startsWith('M_')) {
      if (cleanValue === '∞_1') return '主格・男性（マスター）';
      if (cleanValue === '∞_12') return '人称・女性';
      if (cleanValue === '⚙_13') return '人称・AI（ぱんちゃん）';
      if (cleanValue.startsWith('＜')) return cleanValue.slice(1, -1);
      if (cleanValue.startsWith('V_')) return `${cleanValue.slice(2)} [移動ベクトル]`;
      if (cleanValue.startsWith('M_')) return `${cleanValue.slice(2)} [状態メタ]`;
    }

    switch (slotName) {
      case 'being':
        return G.being?.domains?.[cleanValue] || G.being?.depth?.[cleanValue] || cleanValue;

      case 'emotion':
        let emotionResult = [];
        const chars = cleanValue.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|Ⅲ✨|Ⅲ🔥|\*~|\.[A-Z]|.)/g) || [cleanValue];
        chars.forEach(ch => {
          const token = ch.trim();
          if (!token) return;
          if (G.emotion?.faces?.[token]) {
            emotionResult.push(`${G.emotion.faces[token].meaning}`);
          } else if (G.emotion?.intensity?.[token]) {
            emotionResult.push(`➔ [${G.emotion.intensity[token]}]`);
          } else {
            emotionResult.push(token);
          }
        });
        return emotionResult.join(' ') || cleanValue;

      case 'field':
        return cleanValue.split('↔').map(f => {
          const target = f.trim();
          // 💡 罫線文字のプロパティ（│）があっても安全にブラケット記法で引きにいくセーフティネット
          return G.field?.["│"]?.[target] || G.field?.[target] || target;
        }).join(' ↔ ');

      case 'transition':
        return G.transition?.[cleanValue] || cleanValue;

      case 'verbs':
        let verbResult = [];
        const vTokens = cleanValue.match(/(\[[^\]]+\]|V_[^\s]+|M_[^\s]+|!>|✴|.)/g) || [cleanValue];
        vTokens.forEach(v => {
          const token = v.trim();
          if (!token) return;
          if (G.verb?.[token]) {
            verbResult.push(G.verb[token]);
          } else {
            verbResult.push(decodeSlot('verbs_sub', token));
          }
        });
        return verbResult.join(' ➔ ') || cleanValue;

      case 'timeline':
        const targetTimeline = cleanValue.startsWith('.') ? cleanValue : `.${cleanValue}`;
        return G.timeline?.[targetTimeline] || G.timeline?.[cleanValue] || cleanValue;

      case 'legacy':
        return G.legacy?.[cleanValue] || cleanValue;

      default:
        return cleanValue;
    }
  }

  function renderDecoder(decoded) {
    setText('decLegacy', decodeSlot('legacy', decoded.legacy));
    setText('decBeing', decodeSlot('being', decoded.being));
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

  window.App = { init, encodeAndShow, decodeAndShow, pochiToNa, copyOutput, clearInput };

  return { init };
})();

window.addEventListener('load', () => App.init());
