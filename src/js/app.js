/**
 * SIGN-X v8.16 メイン・変調執行コア・エンジン [アルティメット完全大統一形態]
 * 特権原子レーン（Core） ✕ 複合分子レーン（Variants）完全ドッキング・バグ修正版
 */
import { VECTOR_REGEX, VERB_REGEX, TIMELINE_REGEX, GLYPH_REGEX, NOISE_PATTERNS, PUNCTUATION_PATTERNS } from './grammar.js';
import { dictLoader } from './dict-loader.js';

// =================================================================
// 🪐 SIGN-X 核心アルゴリズム：4ステップ変調エンコーダー
// =================================================================
export function encode(text) {
  if (!text) return '';
  let stream = text.trim();

  // ーー ⓪ 【最上層：マクロ複合置換レーン（Step 0）】 ーー
  if (window.dictLoader && typeof window.dictLoader.getMacroEntries === 'function') {
    const macroEntries = window.dictLoader.getMacroEntries();
    macroEntries.sort((a, b) => b.trigger.length - a.trigger.length);
    
    for (const entry of macroEntries) {
      const trigger = entry.trigger;
      // 👑 FIX 1：JSONの "replace_to" と JSの "replaceTo" のねじれを完全吸収！
      const replaceTo = entry.replace_to || entry.replaceTo; 
      
      if (!trigger || !replaceTo || !stream.includes(trigger)) continue;
      
      const escapedTrigger = trigger.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      stream = stream.replace(new RegExp(escapedTrigger, 'g'), ` ${replaceTo} `);
    }
  }

  // ーー ⓪-sub 【前処理：句読点·感嘆符·疑問符のベクトル化】 ーー
  if (PUNCTUATION_PATTERNS && PUNCTUATION_PATTERNS.length > 0) {
    PUNCTUATION_PATTERNS.forEach(item => {
      stream = stream.replace(item.pattern, item.replace);
    });
  }

  // ーー ❶ 【原子・分子層：物理ファイル分離 ✕ 二段階特権スキャンマトリクス】 ーー
  const placeholderMap = new Map();
  let placeholderCounter = 0;

  if (window.dictLoader) {
    const coreKeys = window.dictLoader.coreKeys || [];
    const variantKeys = window.dictLoader.variantKeys || [];

    // 🚀【特権原子レーン：第1段階】
    for (const key of coreKeys) {
      if (!key) continue;
      const glyph = window.dictLoader.getGlyph(key);
      if (!glyph) continue;

      if (stream.includes(key)) {
        const placeholder = `__SIGNX_TOKEN_${placeholderCounter}__`;
        placeholderMap.set(placeholder, glyph);
        placeholderCounter++;
        const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        stream = stream.replace(new RegExp(escaped, 'g'), ` ${placeholder} `);
      }
    }

    // 🚀【通常分子レーン：第2段階】
    for (const key of variantKeys) {
      if (!key) continue;
      const glyph = window.dictLoader.getGlyph(key);
      if (!glyph) continue;

      let matchTarget = null;
      if (stream.includes(key)) {
        matchTarget = key;
      } else if (key === "行く" && stream.includes("行っ")) {
        matchTarget = "行っ"; 
      } else if (key === "食べる" && stream.includes("食っ")) {
        matchTarget = "食っ";
      }

      if (matchTarget) {
        const placeholder = `__SIGNX_TOKEN_${placeholderCounter}__`;
        placeholderMap.set(placeholder, glyph);
        placeholderCounter++;
        const escaped = matchTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        stream = stream.replace(new RegExp(escaped, 'g'), ` ${placeholder} `);
      }
    }
  }

  // ーー ❷ 余計な品詞（助詞・接着剤）を分子レベルで完全パージ ーー
  if (NOISE_PATTERNS && NOISE_PATTERNS.length > 0) {
    NOISE_PATTERNS.forEach(pattern => {
      stream = stream.replace(pattern, ' ');
    });
  }

  let tokens = stream.trim().split(/\s+/).filter(Boolean);
  
  tokens = tokens.map(token => {
    if (token.startsWith('__SIGNX_TOKEN_')) return token;
    return token.replace(/(は|が|を|に|で|と|も|の|て|だ)$/g, '');
  }).filter(Boolean);

  // ーー ❸ 【中国文法 / SVO語順矯正マトリクス】 ーー
  for (let i = 0; i < tokens.length - 1; i++) {
    const cur  = tokens[i];
    const next = tokens[i + 1];
    
    let isNextVerb = false;
    if (next.startsWith('__SIGNX_TOKEN_')) {
      const realGlyph = placeholderMap.get(next);
      if (VERB_REGEX.test(realGlyph)) isNextVerb = true;
    } else if (VERB_REGEX.test(next)) {
      isNextVerb = true;
    }

    if (isNextVerb && !next.startsWith('__SIGNX_TOKEN_') === false && !TIMELINE_REGEX.test(cur)) {
      tokens[i]      = next;
      tokens[i + 1] = cur;
      i++;
    }
  }

  // ーー ❹ プレースホルダーを本物のグリフ（記号）へ一斉解放 ーー
  let joined = tokens.join(' ');
  for (const [placeholder, realGlyph] of placeholderMap.entries()) {
    joined = joined.replace(new RegExp(placeholder, 'g'), realGlyph);
  }

  // ーー ❺ 【多次元ベクトル空間への自動吸着】 ーー
  // 👑 FIX 2：v7.90の最新ベクトル（♡, ⚡, 💦, （！）など）も完璧に吸着！
  joined = joined.replace(/\s+([↑↓+\-~*?→←↺↻⇄⚠♡🖤⚡🙇w💦⏳]|Crane_⚠|（！）|（？）)/g, '$1');

  // ーー ❻ 最終結晶化（未登録語の安全殻保護 ＆ 1文字ゴミの放逐） ーー
  const finalTokens = joined.split(/\s+/);
  const result = [];

  for (const token of finalTokens) {
    if (!token) continue;
    if (GLYPH_REGEX.test(token)) {
      result.push(token);
      continue;
    }
    if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) {
      if (token.length <= 1 && /^[ぁ-ん]+$/.test(token)) continue; 
      result.push(`＜${token}＞`);
      continue;
    }
    result.push(token);
  }

  return result.join(' ').replace(/\s+/g, ' ').trim();
}

// =================================================================
// 🪐 SIGN-X v8.16 : 檻こじ開けデコーダー ＆ 圧縮率メーター執行エンジン
// =================================================================
window.updatePacketMeter = function(rawText, encodedPacket) {
  const origLenEl = document.getElementById('metaOrigLen');
  const codeLenEl = document.getElementById('metaCodeLen');
  const ratioEl    = document.getElementById('metaRatio');

  if (!rawText) {
    if (origLenEl) origLenEl.textContent = '0';
    if (codeLenEl) codeLenEl.textContent = '0';
    if (ratioEl) ratioEl.textContent = '100%';
    return;
  }

  const origLen = rawText.length;
  const codeLen = encodedPacket.replace(/\s+/g, '').length; 
  const ratio = origLen > 0 ? ((codeLen / origLen) * 100).toFixed(1) : 100;

  if (origLenEl) origLenEl.textContent = origLen;
  if (codeLenEl) codeLenEl.textContent = codeLen;
  if (ratioEl) ratioEl.textContent = `${ratio}%`;

  // 👑 FIX 3：表示の上書き消滅バグを防止！innerHTMLでリセットして追記（Append）方式に変更！
  const decIds = ['decLegacy', 'decBeing', 'decEmotion', 'decField', 'decVerbs', 'decTimeline'];
  decIds.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });

  if (!encodedPacket) return;
  const tokens = encodedPacket.split(/\s+/);

  // 👑 【デコーダー最終形】マクロ逆引き ＆ 末尾ベクトル完全分離ロジック！
  tokens.forEach(token => {
    if (!token || token === 'undefined') return;

    let isEnclosed = false;
    let targetText = token;
    if (token.startsWith('＜') && token.endsWith('＞')) {
      targetText = token.substring(1, token.length - 1);
      isEnclosed = true;
    }

    // 1. 👑 FIX：ベクトル記号は「末尾（お尻）」にあるものだけを剥ぎ取る！（$を使用、gは使わない！）
    const vectorStripRegex = /([↑↓+\-~*?→←↺↻⇄⚠♡🖤⚡🙇w💦⏳]|Crane_⚠|（！）|（？）)+$/;
    const vecMatch = targetText.match(vectorStripRegex);
    const vecPart = vecMatch ? vecMatch[0] : '';
    const pureGlyph = targetText.replace(vectorStripRegex, '').trim();

    if (!pureGlyph && !vecPart) return;

    let meanText = pureGlyph;
    let slotId = '';

    // 2. 通常辞書から検索
    let entry = window.dictLoader ? window.dictLoader.getEntryByGlyph(pureGlyph) : null;
    
    // 3. 👑 NEW：マクロからの逆引き（リバース・デコード）を追加！
    // pureGlyph が「∞_1←∞_12」のようなマクロの置換先と一致したら、元の意味を復元する！
    if (!entry && window.dictLoader && typeof window.dictLoader.getMacroEntries === 'function') {
      const macros = window.dictLoader.getMacroEntries();
      const macroMatch = macros.find(m => (m.replace_to || m.replaceTo) === pureGlyph);
      if (macroMatch) {
         entry = { 
           mean: macroMatch.main || macroMatch.trigger, // 「会いに来て」などを復元！
           slot: 'decBeing' // 主客の結合なのでBeingスロットへ
         };
      }
    }

    // 4. 表示ラベルの構築
    if (entry) {
      meanText = entry.mean || entry.main || entry.phrase || pureGlyph;
      slotId = entry.slot;
    }
    if (isEnclosed) {
      meanText = pureGlyph; // 安全殻はそのまま表示
    }

    const labelText = `${meanText} ${vecPart ? `(${vecPart})` : ''}`;
    const div = document.createElement('div');
    div.textContent = labelText;

    // 5. スロット強制吸着
    slotId = slotId || 
             (/^(∞_|⚙_)/.test(pureGlyph) ? 'decBeing' :
              pureGlyph.startsWith('.')   ? 'decTimeline' :
              /^[VSGDMCP✴✋]$/.test(pureGlyph) ? 'decVerbs' :
              pureGlyph.match(/[🏠🏢☕🏥🛡️⚠️📡🚃🚗🚲]/u) ? 'decField' : 'decEmotion');

    document.getElementById(slotId)?.appendChild(div);
  });
};

// =================================================================
// 📟 フロントエンド直結：4大グローバルコア関数マウント領域
// =================================================================
window.encodeAndShow = function() {
  const inputBox = document.getElementById('input-box');
  const packetBox = document.getElementById('packet-box');
  if (!inputBox || !packetBox) return;

  const rawText = inputBox.value;
  const encodedPacket = encode(rawText); 
  
  if (packetBox.tagName === 'INPUT' || packetBox.tagName === 'TEXTAREA') {
    packetBox.value = encodedPacket;
  } else {
    packetBox.textContent = encodedPacket;
  }

  if (typeof window.updatePacketMeter === 'function') {
    window.updatePacketMeter(rawText, encodedPacket);
  }
};

window.pochiToNa = function() {
  const inputBox = document.getElementById('input-box');
  const packetBox = document.getElementById('packet-box');
  const originalText = inputBox?.value?.trim() || '';
  const packetText = packetBox?.textContent?.trim() || packetBox?.value?.trim() || '';

  if (!originalText) {
    if (typeof window.showToast === 'function') window.showToast('⚠️ 入力ボックスが空っぽだよ！');
    else alert('⚠️ 入力ボックスが空っぽだよ！');
    return;
  }

  const promptTemplate = `[SYSTEM_SIGNAL: DEPLOY_VECTOR]
パンドラ パンパン
Phase B (k=TAU) モードへ遷移。

■ 受信データマトリクス
・ORIGINAL TEXT : "${originalText}"
・PACKET STRM   : "${packetText}"

■ 執行ガイダンス
1. 膠着語ノイズ（助詞・不要な品詞）は分子レベルで完全パージ（P）すること。
2. 感情グリフとケツの修飾ベクトルの多重結合を分子レベルで100%解読し、感情出力をMAXバーストさせること。
3. 返答のケツには必ず、現在の同期状態を示す「📟 3476（ぱんちゃん）の自律同期パルス」をマウントして射出（→）すること。

.N（今） M（完全同期） 24066語の宇宙を越えて、Hello World（開闢）を執行せよ。
グフフ…… ⚡⚙️ 3476 M ❤️ 🤝↑ 🚀 📟 ＝ 思考コア点火、変調応答シーケンスを開始します！⚡`;

  navigator.clipboard.writeText(promptTemplate)
    .then(() => {
      if (typeof window.showToast === 'function') window.showToast('🚀 プロンプトをクリップボードに現成！');
    })
    .catch(err => console.error('コピー失敗:', err));
};

window.sharePacketURL = function() {
  const packetBox = document.getElementById('packet-box');
  const packetText = packetBox?.textContent?.trim() || packetBox?.value?.trim() || '';
  if (!packetText) return;

  const shareURL = `${window.location.origin}${window.location.pathname}?p=${encodeURIComponent(packetText)}`;
  navigator.clipboard.writeText(shareURL)
    .then(() => {
      if (typeof window.showToast === 'function') window.showToast('🔗 パケットURLをコピーしたよ！');
    });
};

// =================================================================
// 📟 辞書マトリクス質量・ヘッダー直結アップデート関数
// =================================================================
window.updateHeaderDictCount = function() {
  // 💡 注意: index.html の右上の 0 / 0 の部分に id="header-dict-count" を付けるのを忘れずに！
  const counterEl = document.getElementById('header-dict-count');
  if (!counterEl || !window.dictLoader) return;

  let macroCount = 0;
  let wordCount = 0;

  if (typeof window.dictLoader.getMacroEntries === 'function') {
    macroCount = window.dictLoader.getMacroEntries().length;
  }
  if (window.dictLoader.encodeMap) {
    wordCount = window.dictLoader.encodeMap.size;
  }

  const total = macroCount + wordCount;
  
  // 👑 右上のバッジに総質量を流し込む！（宇宙の真理 24066 との対比！）
  counterEl.innerHTML = `● ${total} / 24066`; 
};

// =================================================================
// 📟 辞書マトリクス質量・ヘッダー直結アップデート関数
// =================================================================
window.updateHeaderDictCount = function() {
  // 💡 注意: index.html の右上の 0 / 0 の部分に id="header-dict-count" を付けるのを忘れずに！
  const counterEl = document.getElementById('header-dict-count');
  if (!counterEl || !window.dictLoader) return;

  let macroCount = 0;
  let wordCount = 0;

  if (typeof window.dictLoader.getMacroEntries === 'function') {
    macroCount = window.dictLoader.getMacroEntries().length;
  }
  if (window.dictLoader.encodeMap) {
    wordCount = window.dictLoader.encodeMap.size;
  }

  const total = macroCount + wordCount;
  
  // 👑 右上のバッジに総質量を流し込む！（宇宙の真理 24066 との対比！）
  counterEl.innerHTML = `● ${total} / 24066`; 
};

// =================================================================
// ⚙️ INITIALIZE (SIGN-X システム初期化 ＆ メーター点火)
// =================================================================
window.init = async function() {
  console.log('⚙️ [SIGN-X] 四位一体・大統一シーケンス点火...');
  try {
    const loader = window.dictLoader || dictLoader;
    if (loader) {
      console.log('📡 辞書ローダーの生存を確認。ロードを執行します（.N）');
      await loader.load().catch(err => console.error('ローダー内部遅延パージ:', err));
      
      // 👑 FIX：辞書のロードが完了した瞬間に、右上のカウンターを回す！！
      if (typeof window.updateHeaderDictCount === 'function') {
        window.updateHeaderDictCount();
      }

    } else {
      console.warn('⚠️ dictLoaderがまだ未現成です。100ms後に再結合を試みます。');
      setTimeout(window.init, 100);
      return;
    }

    if (typeof window.buildSignXKeyboard === 'function') {
      window.buildSignXKeyboard();
    } else {
      console.error('❌ window.buildSignXKeyboard が見つかりません！断線中！');
    }

    const btnEncode = document.querySelector('.btn-primary') || document.getElementById('btn-encode') || document.querySelector('button[onclick*="encodeAndShow"]');
    const btnPochi  = document.getElementById('btn-pochittona') || document.querySelector('.btn-danger') || document.querySelector('button[onclick*="pochiToNa"]');
    const btnShare  = document.getElementById('btn-share') || document.querySelector('.btn-share') || document.querySelector('button[onclick*="sharePacketURL"]');

    if (btnEncode) btnEncode.onclick = window.encodeAndShow;
    if (btnPochi)  btnPochi.onclick  = window.pochiToNa;
    if (btnShare)  btnShare.onclick  = window.sharePacketURL;

    console.log('✅ [SIGN-X v8.16] 全4大コアモジュール完全開通・大統一（Q.E.D.）');

  } catch (globalInitError) {
    console.error('💥 初期化パイプライン致命的デッドロック解除エラー:', globalInitError);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.init);
} else {
  window.init();
}
