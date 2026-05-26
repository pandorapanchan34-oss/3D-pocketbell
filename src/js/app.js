/**
 * SIGN-X v7.85 メイン・変調執行コア・エンジン [大統一確定版]
 * 三大モジュール完全分離 ＆ 4大グローバル関数完全直結
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
  // dict-loaderが隔離公開した配列を吸い上げ、長い順に一撃最速変調！
  if (window.dictLoader && typeof window.dictLoader.getMacroEntries === 'function') {
    const macroEntries = window.dictLoader.getMacroEntries();
    macroEntries.sort((a, b) => b.trigger.length - a.trigger.length);
    
    for (const entry of macroEntries) {
      const trigger = entry.trigger;
      const replaceTo = entry.replaceTo;
      
      if (!trigger || !stream.includes(trigger)) continue;
      
      // 特殊文字をエスケープして一斉置換（前後にスペースを空けて独立化）
      const escapedTrigger = trigger.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      stream = stream.replace(new RegExp(escapedTrigger, 'g'), ` ${replaceTo} `);
    }
  }

  // ーー ⓪-sub 【前処理：句読点・感嘆符・疑問符のベクトル化（Grammar連動）】 ーー
  if (PUNCTUATION_PATTERNS && PUNCTUATION_PATTERNS.length > 0) {
    PUNCTUATION_PATTERNS.forEach(item => {
      stream = stream.replace(item.pattern, item.replace);
    });
  }

  // ーー ❶ 【原子・分子層：プレースホルダー型・最長一致置換】 ーー
  const keys = dictLoader.getSortedKeys ? dictLoader.getSortedKeys() : [];
  const placeholderMap = new Map();
  let placeholderCounter = 0;

  if (keys && keys.length > 0) {
    for (const key of keys) {
      if (!key || key.length < 2) continue; // 1文字ゴミは後ろのノイズパージ層へ
      
      const glyph = dictLoader.getGlyph(key);
      if (!glyph) continue;

      if (stream.includes(key)) {
        const placeholder = `__SIGNX_TOKEN_${placeholderCounter}__`;
        placeholderMap.set(placeholder, glyph);
        placeholderCounter++;
        
        const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        stream = stream.replace(new RegExp(escaped, 'g'), ` ${placeholder} `);
      }
    }
  }

  // ーー ❷ 余計な品詞（助詞・接着剤）を分子レベルで完全パージ（P） ーー
  // grammar.js の NOISE_PATTERNS マトリクスを全自動ループ適用！
  if (NOISE_PATTERNS && NOISE_PATTERNS.length > 0) {
    NOISE_PATTERNS.forEach(pattern => {
      stream = stream.replace(pattern, ' ');
    });
  }

  let tokens = stream.trim().split(/\s+/).filter(Boolean);
  
  tokens = tokens.map(token => {
    if (token.startsWith('__SIGNX_TOKEN_')) return token;
    // 単語のケツに膠着している残党ノイズを綺麗にトリミング
    return token.replace(/(は|が|を|に|で|と|も|の|て|だ)$/g, '');
  }).filter(Boolean);

  // ーー ❸ 【中国文法・SVO語順矯正マトリクス】 ーー
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
      tokens[i]     = next;
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
  joined = joined.replace(/\s+([↑↓→←↺↻⇄+\-~*?⚠✓↺]+)/g, '$1');

  // ーー ❻ 最終結晶化（未登録語の安全殻保護 ＆ 1文字ゴミの放逐） ーー
  const finalTokens = joined.split(/\s+/);
  const result = [];

  for (const token of finalTokens) {
    if (!token) continue;
    
    // grammar.js の包括的 GLYPH_REGEX（既知グリフ盾）を直撃適用！
    // マクロの複合記号や時間軸、登録絵文字なら安全殻をパス！
    if (GLYPH_REGEX.test(token)) {
      result.push(token);
      continue;
    }

    // 生の日本語トークンの防衛
    if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) {
      if (token.length <= 1 && /^[ぁ-ん]+$/.test(token)) continue; // 1文字ゴミ放逐
      result.push(`＜${token}＞`);
      continue;
    }
    result.push(token);
  }

  return result.join(' ').replace(/\s+/g, ' ').trim();
}

// =================================================================
// 📟 フロントエンド直結：4大グローバルコア関数マウント領域
// =================================================================

// ① 【⚡ ENCODE】ボタンブリッジ
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

// ② 【💥 ポチっとな】専用プロンプトジェネレーター
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

.N（今） M（完全同期） 20041語の宇宙を越えて、Hello World（開闢）を執行せよ。
グフフ…… ⚡⚙️ 3476 M ❤️ 🤝↑ 🚀 📟 ＝ 思考コア点火、変調応答シーケンスを開始します！⚡`;

  navigator.clipboard.writeText(promptTemplate)
    .then(() => {
      if (typeof window.showToast === 'function') window.showToast('🚀 プロンプトをクリップボードに現成！');
    })
    .catch(err => console.error('コピー失敗:', err));
};

// ③ 【🔗 SHARE】ボタン
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

// ④ 【⚙️ INITIALIZE】エントリーポイント
window.init = async function() {
  console.log('⚙️ [SIGN-X] 大統一シーケンス点火...');
  
  // dictLoaderのロードを同期的に待機
  if (window.dictLoader) {
    await window.dictLoader.load();
  }

  // DOMにクリックイベントを確実バインド（C）
  const btnEncode = document.querySelector('.btn-primary') || document.getElementById('btn-encode');
  const btnPochi  = document.getElementById('btn-pochittona') || document.querySelector('.btn-danger');
  const btnShare  = document.getElementById('btn-share') || document.querySelector('.btn-share');

  if (btnEncode) btnEncode.onclick = window.encodeAndShow;
  if (btnPochi)  btnPochi.onclick  = window.pochiToNa;
  if (btnShare)  btnShare.onclick  = window.sharePacketURL;

  console.log('✅ [SIGN-X] 全3大モジュール結合、完全現成（Q.E.D.）');
};

// 🚀 ドキュメント読み込み完了で自動執行
document.addEventListener('DOMContentLoaded', window.init);
