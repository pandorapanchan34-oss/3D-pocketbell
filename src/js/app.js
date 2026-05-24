// ============================================
// 3D POCKETBELL — APP CONTROLLER v6.2 (Universal 3D Morphological Engine)
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
    console.log("🚀 3Dポケベル v6.2 起動");
    
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

    // 💡 P2Pオミットに伴う、UIステータス層のVercel最適化（モック型スタンドアロン仕様）
    const pagerIdEl = document.getElementById('myPagerId');
    const linkCountEl = document.getElementById('linkCount');
    const statusDot = document.querySelector('.status-dot');

    if (pagerIdEl) pagerIdEl.textContent = '📟 VERCEL-HOST';
    if (linkCountEl) linkCountEl.textContent = '1 / 1 (CORE)';
    if (statusDot) statusDot.style.background = '#00ff66';

    showToast('3Dポケベル ONLINE ⚡');
  }

  // 💡 【大着替え：ユニバーサル多次元品詞マッピング・エンジン】
  function encode(text) {
    if (!text) return "";
    const G = window.GRAMMAR || {};

    // --- Step 1: 既存の特製登録辞書（105件）による最優先記号化 ---
    let preProcessedText = text;
    if (ENCODE_DICT && ENCODE_DICT.length) {
      ENCODE_DICT.forEach(({ key, glyph }) => {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        preProcessedText = preProcessedText.replace(new RegExp(escapedKey, 'g'), ` ${glyph} `);
      });
    }

    // --- Step 2: 10品詞の多次元トポロジカル・マッピング分割 ---
    // 漢字・カタカナ・ひらがな・サロゲート絵文字の境界で疑似トークン化
    const tokens = preProcessedText.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[A-Za-z0-9\.\+\*-]+|⚙|∞|◇|♢|[🤩😀😡🤯😢🥺😌🧊😐]+[ⅠⅡⅢ✨🔥\*~]*|[一-龠]+|[ぁ-ん]+|[ァ-ヴー]+|.)/g) || [preProcessedText];
    let encodedStream = [];

    tokens.forEach(rawToken => {
      const token = rawToken.trim();
      if (!token) return;

      // すでにStep 1でSIGN-X記号化されているトークンは無条件パス
      if (/[\uD800-\uDBFF][\uDC00-\uDFFF]|⚙|∞|◇|♢|→|~|⇋|↔|\.[NPF]/.test(token) || G.verb?.[token] || G.timeline?.[token]) {
        encodedStream.push(token);
        return;
      }

      // 【1. 代名詞 ➔ 人称空間軸プロット】
      if (/^(私|わたし|僕|ぼく|俺|おれ|自分)$/.test(token)) {
        encodedStream.push("[Φ_1ST(軸:S_ORIGIN)]");
        return;
      }
      if (/^(あなた|君|きみ|お前)$/.test(token)) {
        encodedStream.push("[Φ_2ND(軸:S_FRONT)]");
        return;
      }
      if (/^(彼|彼女|あいつ|そいつ)$/.test(token)) {
        encodedStream.push("[Φ_3RD(軸:S_SIDE)]");
        return;
      }

      // 【10. 助詞のパージ（中国語文法化・孤立化）】
      if (/^(は|が|を|に|の|と|で|へ|も|より|から|まで)$/.test(token)) {
        if (token === "から" || token === "まで") {
          encodedStream.push(`[DIR:${token}]`); // 起点・終点ヒントは残す
        }
        return; // それ以外の格助詞は完全パージ
      }

      // 【9. 助動詞 ➔ 手話 Non-Manuals 表現 ＆ 完了】
      if (/^(ない|ぬ|なかった)$/.test(token)) {
        encodedStream.push("[NMM:NEG(首振り)]");
        return;
      }
      if (/^(たい|たがっている|そうだ|らしい)$/.test(token)) {
        encodedStream.push(`[NMM:MOOD(${token.slice(0, 2)})]`);
        return;
      }
      if (/^(た|だ|おわった)$/.test(token)) {
        encodedStream.push("[VEC_TIME:PAST(後方)]");
        return;
      }

      // 【2. 動詞 ➔ 空間移動ベクトル】
      if (/[一-龠]+(する|やる|いく|走る|見る|聴く|話す|食べる)/.test(token) || /^[一-龠]{2,}(す|く|む|ぶ|う)$/.test(token)) {
        encodedStream.push(`[${token}(型:VEC_MOVE)]`);
        return;
      }

      // 【3＆4. 形容詞・形状詞 ➔ オブジェクトメタデータ】
      if (token.endsWith("い") && token.length > 2) {
        encodedStream.push(`[${token}(型:OBJ_META)]`);
        return;
      }

      // 【5. 副詞 ➔ ベクトル速度・大きさ修飾子】
      if (/^(とても|すごく|非常に|速く|ゆっくり|完全に|かなり)$/.test(token)) {
        encodedStream.push(`[${token}(型:VEC_SPEED)]`);
        return;
      }

      // 【7. 接続詞 ➔ シーン切り替え】
      if (/^(が|しかし|だが|そして|だから|それでは)$/.test(token)) {
        encodedStream.push(`[${token}(型:SCENE_LINK)]`);
        return;
      }

      // ひらがな2文字以下の残骸ノイズパージ
      if (/^[ぁ-ん]{1,2}$/.test(token)) return;

      // 【1. 一般名詞 ➔ 空間オブジェクト】（最終フォールバック）
      encodedStream.push(`[${token}(型:OBJ)]`);
    });

    return encodedStream.join(' ').replace(/\s+/g, ' ').trim();
  }

  // 💡 【新規実装】「SIGN-X ➔ 自然言語」の逆変換（ glyph から key へ ）
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

  function pochiToNa() {
    encodeAndShow();
    showToast('💥 PACKET EXECUTED!');
  }

  // 💡 SIGN-X v6.2：手話トポロジーパケット動的仕分け対応デコーダー
  function runDecode(input) {
    if (typeof Parser === 'undefined' && typeof window.Parser === 'undefined') return;
    const currentParser = typeof Parser !== 'undefined' ? Parser : window.Parser;
    
    // 1. まずは従来のパーサーにかけさせる
    let parsed = currentParser.parse(input);
    let decoded = currentParser.decode(parsed);

    // 2. 💡【手話拡張】入力が新世代の手話パケット構造だった場合、動的に各スロットへ引き抜いてマッピング
    if (input.includes('[') && input.includes(']')) {
      // 一旦スロットを空にしてから、パケット内の該当要素を動的に割り当て
      decoded.being = '—';
      decoded.emotion = '—';
      decoded.field = '—';
      decoded.verbs = '—';
      decoded.timeline = '—';
      decoded.legacy = '—';

      // スペース区切りで各トークンをスキャン
      const tokens = input.match(/(\[[^\]]+\])/g) || [];
      let verbTokens = [];

      tokens.forEach(token => {
        // A. 人称軸 ➔ BEING層へマッピング
        if (token.includes('Φ_')) {
          decoded.being = token;
        }
        // B. 感情フラグ ➔ EMOTION層へマッピング
        else if (token.includes('EMO_FLAG') || token.includes('OBJ_META')) {
          decoded.emotion = token;
        }
        // C. 空間オブジェクト ➔ FIELD層へマッピング
        else if (token.includes('型:OBJ') || token.includes('DIR:')) {
          decoded.field = token;
        }
        // D. 移動ベクトル・助動詞・否定 ➔ VERBS（連鎖）層へ蓄積
        else if (token.includes('VEC_MOVE') || token.includes('VEC_SPEED') || token.includes('NEG') || token.includes('MOOD')) {
          verbTokens.push(token);
        }
        // E. 時間ベクトル ➔ TIMELINE層へマッピング
        else if (token.includes('VEC_TIME')) {
          decoded.timeline = token;
        }
      });

      if (verbTokens.length) {
        decoded.verbs = verbTokens.join(' ');
      }
    }

    // 4桁〜5桁の純粋数字（LEGACYパケット）の救済ルートも維持
    if (/^\d{4,5}$/.test(input.trim())) {
      decoded.legacy = input.trim();
    }

    // 最終翻訳を行ってレンダリング
    renderDecoder(decoded);
  }

  // 💡 SIGN-X v6.2：手話的トポロジーパケット動的解析対応トランスレーター
  function decodeSlot(slotName, value) {
    if (!value || value === '—') return '—';
    const G = window.GRAMMAR || (typeof GRAMMAR !== 'undefined' ? GRAMMAR : null);
    if (!G) return value;

    const cleanValue = value.trim();

    // ── 【新規救済層】SudachiPy移植エンジンが生成した [単語(型:〇〇)] や [Φ_人称] 構造の動的解釈 ──
    if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
      // 1. 人称軸マッピングの抽出
      if (cleanValue.includes('Φ_1ST')) return '手話: 1人称軸（原点プロット）';
      if (cleanValue.includes('Φ_2ND')) return '手話: 2人称軸（正面配置）';
      if (cleanValue.includes('Φ_3RD')) return '手話: 3人称軸（側方配置）';

      // 2. 時制（助動詞「た」など）の抽出
      if (cleanValue.includes('PAST')) return '手話: 過去（後方空間への動作）';
      if (cleanValue.includes('NEG')) return '手話: 否定（Non-Manuals: 首振り）';
      if (cleanValue.includes('MOOD')) {
        const moodMatch = cleanValue.match(/MOOD\(([^)]+)\)/);
        return moodMatch ? `手話: 叙法（表情表現: ${moodMatch[1]}）` : '手話: 叙法空間表現';
      }

      // 3. 起点・終点の格助詞
      if (cleanValue.includes('DIR:')) {
        const dirMatch = cleanValue.match(/DIR:([^\)]+)/);
        return dirMatch ? `格方向: 【${dirMatch[1]}】ベクトル方向` : '方向ベクトル';
      }

      // 4. 一般的な 10品詞型オブジェクトのパージ＆日本語ラベル化
      // 例: "[食べる(型:VEC_MOVE)]" ➔ "食べる ➔ [型: 空間移動ベクトル]"
      const objMatch = cleanValue.match(/^\[([^(\s]+)\(型:([^)]+)\)\]$/);
      if (objMatch) {
        const word = objMatch[1];
        const type = objMatch[2];
        
        const typeLabels = {
          'OBJ': '空間配置オブジェクト',
          'VEC_MOVE': '空間移動ベクトル（矢印）',
          'OBJ_META': 'オブジェクト状態データ（色・形）',
          'VEC_SPEED': 'ベクトル速度モディファイア',
          'OBJ_LIMIT': '空間オブジェクト限定子',
          'SCENE_LINK': '全体シーン切り替えトリガー',
          'EMO_FLAG': '全体感情エフェクト'
        };

        return `${word} ➔ [${typeLabels[type] || type}]`;
      }
    }

    // ── 従来の完全一致型辞書マトリクス（既存の記号用フォールバック） ──
    switch (slotName) {
      case 'being':
        const domainText = G.being?.domains?.[cleanValue];
        const depthText = G.being?.depth?.[cleanValue];
        return domainText || depthText || cleanValue;

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
        return cleanValue.split('↔').map(f => G.field?.[f.trim()] || f).join(' ↔ ') || cleanValue;

      case 'transition':
        return G.transition?.[cleanValue] || cleanValue;

      case 'verbs':
        let verbResult = [];
        // 動詞スロットに来たトポロジー括弧トークンや個別記号を安全に分割
        const vTokens = cleanValue.match(/(\[[^\]]+\]|!>|✴|.)/g) || [cleanValue];
        vTokens.forEach(v => {
          const token = v.trim();
          if (!token) return;
          if (G.verb?.[token]) {
            verbResult.push(G.verb[token]);
          } else {
            // [食べる(型:VEC_MOVE)] などの構造をそのまま上の動的変換へバイパス
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
