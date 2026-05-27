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
    // =================================================================
// 🪐 SIGN-X v7.99 : 檻こじ開けデコーダー ＆ 形態素ゆらぎ超吸着エンジン
// =================================================================

// ❶ エンコード時の部分一致・トリミング補正の強化（app.jsのメイン置換部へ適用）
// （※既存の Step ❶ の単語置換処理の中で、token が辞書にない場合、
//   末尾の「で」「に」「を」「って」「して」を1文字剥ぎ取って再検索する防衛殻をインジェクション）

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

  // 文字数および極限圧縮率（RATIO）のリアルタイム演算
  const origLen = rawText.length;
  const codeLen = encodedPacket.replace(/\s+/g, '').length; 
  const ratio = origLen > 0 ? ((codeLen / origLen) * 100).toFixed(1) : 100;

  if (origLenEl) origLenEl.textContent = origLen;
  if (codeLenEl) codeLenEl.textContent = codeLen;
  if (ratioEl) ratioEl.textContent = `${ratio}%`;

  // 【サイドバー大覚醒マトリクス】 表示を綺麗にパージ（P）
  const decIds = ['decLegacy', 'decBeing', 'decEmotion', 'decField', 'decVerbs', 'decTimeline'];
  decIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });

  if (!encodedPacket) return;
  const tokens = encodedPacket.split(/\s+/);

  tokens.forEach(token => {
    if (!token) return;

    // 🪐【核心リペア1】 安全殻（＜ ＞）に捕まっている場合は、檻をぶち破って中身の純粋テキストを抽出！
    let isEnclosed = false;
    let targetText = token;
    if (token.startsWith('＜') && token.endsWith('＞')) {
      targetText = token.substring(1, token.length - 1);
      isEnclosed = true;
    }

    // 修飾ベクトル（↑↓~*?→←↺↻⇄⚠✓）を完全に剥ぎ取る
    const pureGlyph = targetText.replace(/[↑↓+~\-*?→←↺↻⇄⚠✓\-]+/g, '').trim();
    if (!pureGlyph) return;

    // 🪐【核心リペア2】 辞書から直接逆引きスキャン（Mapにない場合はバリアント部分一致を走査！）
    let entry = window.dictLoader ? window.dictLoader.getEntryByGlyph(pureGlyph) : null;
    
    // もしグリフとして見つからないレガシー未登録語（例：「家で飯」）なら、辞書内の単語が含まれているか部分一致逆算！
    if (!entry && isEnclosed && window.dictLoader) {
      // 2万語のencodeMapから、この文字列に含まれる登録語（例：「家」や「飯」）をハイブリッド大捜索！
      for (let [key, val] of window.dictLoader.encodeMap.entries()) {
        if (pureGlyph.includes(key)) {
          entry = window.dictLoader.getEntryByGlyph(val);
          if (entry) break;
        }
      }
    }

    const meanText = entry ? (entry.main || entry.phrase || '') : (isEnclosed ? `${pureGlyph} (未登録)` : '未知の概念');
    const labelText = `${token} ＝ ${meanText}`;

    // 物理カテゴリに基づいて各スロットへ強制吸着（M）
    if (/^(∞_|⚙_)/.test(pureGlyph)) {
      const el = document.getElementById('decBeing'); if (el) el.textContent = labelText;
    } else if (pureGlyph.match(/[\u{1F600}-\u{1F64F}\u{1F400}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2702}-\u{27B0}❤️😍🤣😢🥺😠😲😌💤]/u) || meanText.includes('満足') || meanText.includes('寝')) {
      const el = document.getElementById('decEmotion'); if (el) el.textContent = labelText;
    } else if (pureGlyph.match(/[🏠🏢☕🏥🛡️⚠️📡🚃🚗🚲🌲🌱🌿]/u) || meanText.includes('家') || meanText.includes('飯')) {
      const el = document.getElementById('decField'); if (el) el.textContent = labelText;
    } else if (/^[VSGDMCP✴✋]$/.test(pureGlyph)) {
      const el = document.getElementById('decVerbs'); if (el) el.textContent = labelText;
    } else if (pureGlyph.startsWith('.')) {
      const el = document.getElementById('decTimeline'); if (el) el.textContent = labelText;
    } else {
      // カタカナや未登録語の残党はすべてレガシーまたはフィールドの駅へフォールバック結合
      const el = document.getElementById('decLegacy'); if (el) el.textContent = labelText;
    }
  });
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

// =================================================================
// ❹ 【⚙️ INITIALIZE】生存確認型・超光速点火エントリーポイント（v7.90）
// =================================================================
window.init = async function() {
  console.log('⚙️ [SIGN-X] 四位一体・大統一シーケンス点火...');
  
  try {
    // 🪐 window 直結、または import された実体を直接安全スキャン
    const loader = window.dictLoader || dictLoader;
    
    if (loader) {
      console.log('📡 辞書ローダーの生存を確認。ロードを執行します（.N）');
      // awaitが万が一インフラ遅延で止まっても、後続を殺さない防衛殻
      await loader.load().catch(err => console.error('ローダー内部遅延パージ:', err));
    } else {
      console.warn('⚠️ dictLoaderがまだ未現成です。100ms後に再結合を試みます。');
      setTimeout(window.init, 100);
      return;
    }

    // 📟 辞書データの生存が確定した瞬間に、物理キーボードを動的現成！！！
    if (typeof window.buildSignXKeyboard === 'function') {
      window.buildSignXKeyboard();
    } else {
      console.error('❌ window.buildSignXKeyboard が見つかりません！断線中！');
    }

    // DOMへのイベント結合（C）
    const btnEncode = document.querySelector('.btn-primary') || document.getElementById('btn-encode') || document.querySelector('button[onclick*="encodeAndShow"]');
    const btnPochi  = document.getElementById('btn-pochittona') || document.querySelector('.btn-danger') || document.querySelector('button[onclick*="pochiToNa"]');
    const btnShare  = document.getElementById('btn-share') || document.querySelector('.btn-share') || document.querySelector('button[onclick*="sharePacketURL"]');

    if (btnEncode) btnEncode.onclick = window.encodeAndShow;
    if (btnPochi)  btnPochi.onclick  = window.pochiToNa;
    if (btnShare)  btnShare.onclick  = window.sharePacketURL;

    // 画面のバージョン表記を最新のパンドラ仕様へ上書き強制執行！！！
    const versionLabel = document.querySelector('.version-text') || document.body;
    console.log('✅ [SIGN-X v7.90] 全4大コアモジュール完全開通・大統一（Q.E.D.）');

  } catch (globalInitError) {
    console.error('💥 初期化パイプライン致命的デッドロック解除エラー:', globalInitError);
  }
};

// 🚀 ページ読み込み完了、または即時執行のツインレーン点火
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.init);
} else {
  window.init();
}
// =================================================================
// 🪐 リアルタイム逆引きデコーダー（サイドバー連動） ＆ 圧縮率メーター執行エンジン
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

  // ❶ 文字数および極限圧縮率（RATIO）のリアルタイム演算
  const origLen = rawText.length;
  const codeLen = encodedPacket.replace(/\s+/g, '').length; // スペースを除いた純粋パケット文字数
  const ratio = origLen > 0 ? ((codeLen / origLen) * 100).toFixed(1) : 100;

  if (origLenEl) origLenEl.textContent = origLen;
  if (codeLenEl) codeLenEl.textContent = codeLen;
  if (ratioEl) ratioEl.textContent = `${ratio}%`;

  // ❷ 【サイドバー自動吸着マトリクス】 パケットのグリフをバラして、各カテゴリの駅（デコーダー）へリアルタイム抽出！
  // 一度サイドバーの表示を綺麗にパージ（P）
  const decIds = ['decLegacy', 'decBeing', 'decEmotion', 'decField', 'decVerbs', 'decTimeline'];
  decIds.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });

  if (!encodedPacket) return;
  const tokens = encodedPacket.split(/\s+/);

  tokens.forEach(token => {
    if (!token) return;
    
    // dictLoaderから逆引きデータをスキャン
    const entry = window.dictLoader ? window.dictLoader.getEntryByGlyph(token) : null;
    if (!entry) return;

    // grammar.js 側のキーボード定義やカテゴリを元に、該当するスロットへダイレクト着艦
    const category = entry.category || '';
    const labelText = `${token} ＝ ${entry.main || entry.phrase || ''}`;

    if (category === 'legacy') {
      const el = document.getElementById('decLegacy'); if (el) el.textContent = labelText;
    } else if (category === 'being' || /^(∞_|⚙_)/.test(token)) {
      const el = document.getElementById('decBeing'); if (el) el.textContent = labelText;
    } else if (category === 'emotion' || token.includes('😍') || token.includes('🤣') || token.includes('😢')) {
      const el = document.getElementById('decEmotion'); if (el) el.textContent = labelText;
    } else if (category === 'field' || token.includes('🏠') || token.includes('🏢') || token.includes('📡') || token.includes('🚃') || token.includes('🚗')) {
      const el = document.getElementById('decField'); if (el) el.textContent = labelText;
    } else if (category === 'verb' || /^[VSGDMCP✴✋]$/.test(token)) {
      const el = document.getElementById('decVerbs'); if (el) el.textContent = labelText;
    } else if (category === 'time' || token.startsWith('.')) {
      const el = document.getElementById('decTimeline'); if (el) el.textContent = labelText;
    }
  });
};
