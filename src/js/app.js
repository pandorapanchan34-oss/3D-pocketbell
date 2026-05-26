// =================================================================
// 3D POCKETBELL — APP CONTROLLER v7.21
// URLパラメータ全部乗せ設計（?p= / ?dict= / ?lang=）
// grammar.js 文法規則層 + dict-loader.js v2.3 カスケード対応
// =================================================================

import {
  VECTOR_REGEX,
  VERB_REGEX,
  TIMELINE_REGEX,
  NOISE_PATTERNS,
  PUNCTUATION_PATTERNS,
  DECODE_LABELS,
  KEYBOARD_LAYOUT,
} from './grammar.js';
import { dictLoader } from './dict-loader.js';

// ── グローバル状態 ──
let currentPacket = '';

window.KEYBOARD_LAYOUT = KEYBOARD_LAYOUT;

// =================================================================
// 辞書ロード（v7.50 大統一ツインレーン・インジェクター）
// =================================================================
async function loadDictionaries() {
  try {
    console.log('📡 四重統治データ層・フェッチ開始...');
    window.dictLoader = dictLoader;
    
    // ❶ 5大ディスクの並列一撃ロード執行
    const success = await dictLoader.load();
    
    // ❷ 新世界の Map 構造（encodeMap.size）で完璧な生存チェック（v7.50整流）
    if (!success || dictLoader.encodeMap.size === 0) throw new Error('No entries loaded');
    
    // ❸ Mapから動的に配列を現成し、グローバル空間とキーボードへ直結（C）
    window.ENCODE_DICT = Array.from(dictLoader.encodeMap.entries()).map(([key, glyph]) => ({ key, glyph }));
    
    // ❹ ⚡亡霊関数 getInfo を完全パージし、真の18843語をダイレクトにコンソール射出（D）！
    console.log(`✅ 宇宙結合完了！ 総動的語彙数: [${dictLoader.encodeMap.size}] 語 (v7.50 ONLINE)`);
    
    return true;
  } catch (err) {
    console.warn('⚠️ 辞書ロード失敗:', err);
    window.ENCODE_DICT = [];
    return false;
  }
}

// =================================================================
// App コアモジュール
// =================================================================
const App = (() => {

  // ---------------------------------------------------------------
  // 初期化
  // ---------------------------------------------------------------
  async function init() {
    console.log('🚀 3Dポケベル v7.21 起動');

    await loadDictionaries();

    if (typeof window.buildSignXKeyboard === 'function') {
      window.buildSignXKeyboard();
    }

    // リアルタイムエンコード
    const input = document.getElementById('inputText');
    if (input) {
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) { clearDecoder(); clearOutput(); return; }
        const isPacket = /[^\x00-\x7F]/.test(val) && !/[ぁ-んァ-ヴー]/.test(val);
        currentPacket = isPacket ? val : encode(val);
        renderOutput(currentPacket);
        updateMeta(val, currentPacket);
        runDecode(currentPacket);
      });
    }

    // ── 💡 URLパラメータ全部乗せ着信レーン（v7.21） ──
    _bootFromURL();

    // 幽霊関数をパージし、マップの実際のサイズを直接スキャン（S）！
    console.log(`✅ SIGN-X 宇宙結合完了！ 総動的語彙数: [${dictLoader.encodeMap.size}] 語`);
    const el = document.getElementById('linkCount');
    if (el) el.textContent = `${dictLoader.encodeMap.size}語 (v7.50)`

    showToast('3Dポケベル ONLINE ⚡ v7.21');
  }

  // ---------------------------------------------------------------
  // URLパラメータ解析レーン（?p= / ?dict= / ?lang=）
  // ---------------------------------------------------------------
  function _bootFromURL() {
    const params = new URLSearchParams(window.location.search);

    // ?p= パケット着信（最優先）
    const incomingPacket = params.get('p');
    if (incomingPacket) {
      const decoded = decodeURIComponent(incomingPacket);
      console.log('📟 パケット着信:', decoded);
      currentPacket = decoded;

      // 入力欄にも展開（再編集できるように）
      const inputEl = document.getElementById('inputText');
      if (inputEl) inputEl.value = decoded;

      renderOutput(currentPacket);
      runDecode(currentPacket);
      updateMeta(decoded, currentPacket);

      const box = document.getElementById('outputBox');
      if (box) { box.classList.add('flash'); setTimeout(() => box.classList.remove('flash'), 600); }

      showToast('📟 パケット受信！⚡');
    }

    // ?lang= 言語モード（将来拡張用）
    const lang = params.get('lang');
    if (lang) console.log(`🌐 言語モード: ${lang}（将来実装予定）`);

    // ?dict= は dict-loader.js 側で処理済み
  }

  // ---------------------------------------------------------------
  // パケット共有URL生成（送信側）
  // ---------------------------------------------------------------
  function sharePacketURL() {
    if (!currentPacket) { showToast('⚠️ 先にエンコードしてね'); return; }

    const params = new URLSearchParams();
    params.set('p', currentPacket);

    // ?dict= が指定されていたら引き継ぐ
    const currentDict = new URLSearchParams(window.location.search).get('dict');
    if (currentDict) params.set('dict', currentDict);

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗 共有URLをコピーしました！');
    });

    // ブラウザ共有API（モバイル対応）
    if (navigator.share) {
      navigator.share({ title: '3Dポケベル', text: currentPacket, url });
    }
  }

  // =================================================================
// ⚡ 究極確定版：中国文法変調 ＆ 完全安全殻エンコーダー（v7.55）
// =================================================================
function encode(text) {
  if (!text) return '';

  let stream = text.trim();

  // 句読点や全角スペースなどの初期ノイズを事前に融解（P）
  stream = stream.replace(/[。、？（()）]/g, ' ');

  // ❶ 【最長一致・安全隔離置換】
  // 辞書の全日本語バリアント（キー）を長い順に取得
  const keys = dictLoader.getSortedKeys ? dictLoader.getSortedKeys() : Array.from(dictLoader.encodeMap.keys()).sort((a, b) => b.length - a.length);
  
  // 置換済みのグリフが、後のループで二重置換（破壊）されないようにインデックスを保護管理
  if (keys && keys.length > 0) {
    for (const key of keys) {
      if (!key || key.length < 2) continue; // 1文字のゆらぎは膠着語ノイズパージ層へ委ねる
      
      const glyph = dictLoader.getGlyph ? dictLoader.getGlyph(key) : dictLoader.encodeMap.get(key);
      if (!glyph) continue;

      // 既に絵文字や特殊グリフ（∞_や⚙_など）に置換された部分には干渉しないように
      // まだ生の日本語である部分（漢字・カナ）だけを狙い撃ちして最長一致置換！
      const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?<![A-Za-z0-9_<>∞⚙:.])(${escaped})(?![A-Za-z0-9_<>])`, 'g');
      stream = stream.replace(regex, ` ${glyph} `);
    }
  }

  // ❷ 余計な品詞（助詞・接着剤）を分子レベルで完全パージ（P）
  const noiseRegex = /^(は|が|を|に|で|と|も|の|て|から|だけど|たら|だよ|だね|してあげる|するね|ます|ください|します|しました|です|だ|だけで|という|なにか|かも|の真の姿です|じゃあ|について)$/;

  let tokens = stream.trim().split(/\s+/).filter(Boolean);
  
  tokens = tokens.map(token => {
    // 完全に接着剤ノイズに一致するトークンは虚空へ放逐
    if (noiseRegex.test(token)) return '';
    // 単語のケツに膠着している残党ノイズ（「〜の」「〜で」）を綺麗にトリミング
    return token.replace(/(は|が|を|に|で|と|も|の|て|だ)$/g, '');
  }).filter(Boolean);

  // ❸ 【中国文法・SVO語順矯正マトリクス】
  // 左側が名詞（目的語）で、右側が動詞（用言コマンド）なら、位置を超速スワップ（並び替え）！
  const VERB_REGEX = /^[VSGDMCP✴✋]$/;
  const TIMELINE_REGEX = /^\.[NPF]$/;

  for (let i = 0; i < tokens.length - 1; i++) {
    const cur  = tokens[i];
    const next = tokens[i + 1];
    if (VERB_REGEX.test(next) && !VERB_REGEX.test(cur) && !TIMELINE_REGEX.test(cur)) {
      tokens[i]     = next;
      tokens[i + 1] = cur;
      i++; // スワップした境界線をジャンプ
    }
  }

  // ❹ 【多次元ベクトル空間への自動吸着】
  let joined = tokens.join(' ');
  // 単語グリフのケツにある修飾ベクトル記号（↑↓+~*⚠✓↺）を磁石のように完全密着（M）
  joined = joined.replace(/\s+([↑↓→←↺↻⇄+\-~*?⚠✓↺]+)/g, '$1');

  // ❺ 最終結晶化（未登録語の安全殻保護 ＆ 1文字ゴミの放逐）
  const finalTokens = joined.split(/\s+/);
  const result = [];
  const VECTOR_REGEX = /[↑↓→←↺↻⇄+\-~*?⚠✓↺]/;

  for (const token of finalTokens) {
    if (!token) continue;
    
    // すでにグリフ化されているコア粒子はそのままパス
    if (VECTOR_REGEX.test(token))   { result.push(token); continue; }
    if (VERB_REGEX.test(token))     { result.push(token); continue; }
    if (TIMELINE_REGEX.test(token))   { result.push(token); continue; }
    if (/^(∞_|⚙_)/.test(token))       { result.push(token); continue; }
    if (/^\d{4,6}$/.test(token))       { result.push(token); continue; }
    
    // 辞書に登録されていなかった生の日本語の防衛
    if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) {
      if (token.length <= 1 && /^[ぁ-ん]+$/.test(token)) {
        continue; // 1文字の単一カナゴミ（「を」「に」などの削り残し）を完全放逐（P）
      }
      result.push(`＜${token}＞`); // 未登録名詞を安全殻で保護
      continue;
    }
    result.push(token);
  }

  return result.join(' ').replace(/\s+/g, ' ').trim();
}
  
  function encodeAndShow() {
    const input = document.getElementById('inputText')?.value.trim();
    if (!input) return;
    currentPacket = encode(input);
    renderOutput(currentPacket);
    updateMeta(input, currentPacket);
    runDecode(currentPacket);
    const box = document.getElementById('outputBox');
    if (box) { box.classList.add('flash'); setTimeout(() => box.classList.remove('flash'), 400); }
  }

  // ---------------------------------------------------------------
  // 💡 【超精密・辞書逆算型デコード v7.25】 すべてはデータから現成する
  // ---------------------------------------------------------------
  function runDecode(input) {
    const clean = input?.trim();
    if (!clean) { clearDecoder(); return; }

    // 💡 ティア1の個別スロットを廃止し、すべてをこの「逆算エンジン」で一元統治！
    const decoded = { legacy: '—', being: '—', emotion: '—', field: '—', vector: '—', verbs: '—', timeline: '—' };
    const units = clean.split(/\s+/);

    for (const unit of units) {
      if (!unit || unit === '—') continue;

      // ── 辞書から完全逆算 ──
      const decodedResult = decodeWithDict(unit);

      // 💡 グリフの特性に応じて、表示するサイドバーのスロットを動的に自動判定！
      if (/^\d{4,5}$/.test(unit))                                  { decoded.legacy   = decodedResult; }
      else if (/(∞_|⚙_)/.test(unit))                               { decoded.being    = decodedResult; }
      else if (/[🏠🏢🏥☕🛁🚻🍚🍴🍺💤🏃🛒📦📚🚃🚗🚲🛡️⚠️📍🚀📟]/.test(unit)) { decoded.field    = decodedResult; }
      else if (/[😍❤️😀🤣😢🥺😌😠😲🎉🙇🤒💊📞💬📷🎵🎬🎮🤑🤝👨‍👩‍👧🐾]/.test(unit)) { decoded.emotion  = decodedResult; }
      else if (/[VSGDMCP✴✋]/.test(unit))                          { decoded.verbs    = decodedResult; }
      else if (/\.[NPF]/.test(unit))                               { decoded.timeline = decodedResult; }
      else                                                         { decoded.vector   = decodedResult; }
    }

    renderDecoder(decoded);
  }

  // ---------------------------------------------------------------
  // 💡 【核心ロジック】 パケット分子を量子（最小定義）まで逆算融解する
  // ---------------------------------------------------------------
  // ⚡ app.js : decodeWithDict(token) の完全調和トポロジー
function decodeWithDict(token) {
  if (!token || token === '—') return '—';

  // ❶ 完全一致で大統一マップ（Map）をルックアップ
  if (dictLoader.loaded) {
    const directEntry = dictLoader.getEntryByGlyph(token);
    if (directEntry) return `${token} ＝ ＜${directEntry.phrase || directEntry.main}＞`;
  }

  // ❷ 💥【核心】🤣↓* のような多重結合パケットを、分子レベルで完璧に解析！
  const characters = [...token];
  let baseMeaning = '';
  const vectorMeanings = [];

  for (const char of characters) {
    if (dictLoader.loaded) {
      const entry = dictLoader.getEntryByGlyph(char);
      if (entry) {
        // カテゴリがベクトル（修飾子）なら修飾配列へ、ベースなら基本意味へ仕分け
        if (entry.category === 'vector' || /[↑↓→←↺↻⇄+\-~*?⚠✓↺]/.test(char)) {
          vectorMeanings.push(`【${entry.phrase || entry.main}】`);
        } else {
          baseMeaning = `＜${entry.phrase || entry.main}＞`;
        }
        continue;
      }
    }
    vectorMeanings.push(char);
  }

  // 「🤣↓* ＝ ＜笑う＞【低い】【最高すぎる】」 という形で美しく結晶化（D）！
  return `${token} ＝ ${baseMeaning}${vectorMeanings.join('')}`;
}
  // 💡 既存の互換性のためにガワだけ残し、中身を完全逆算版へ統合
  function decodeSlot(value) {
    return value; // runDecode 側で完全に結晶化された文字列が降ってくるため、そのまま通過させる
  }

  function decodeSlot(value) {
    if (!value || value === '—') return '—';
    const vecMatch = value.match(/([↑↓→←↺↻⇄+\-~*?]+)$/);
    const vecMod   = vecMatch ? vecMatch[1] : '';
    const base     = vecMod ? value.slice(0, -vecMod.length) : value;
    let meaning = base;
    if (dictLoader?.loaded) {
      const entry = dictLoader.getEntryByGlyph(base);
      if (entry) meaning = entry.phrase || entry.main || entry.variants?.[0] || base;
    }
    const vecLabel = [...vecMod].map(v => DECODE_LABELS[v] || v).join(' / ');
    return vecLabel ? `${value} ＝ ${meaning} [${vecLabel}]` : `${value} ＝ ${meaning}`;
  }

  function renderDecoder(decoded) {
    _setText('decLegacy',   decodeSlot(decoded.legacy));
    _setText('decBeing',    decodeSlot(decoded.being));
    _setText('decEmotion',  decodeSlot(decoded.emotion));
    _setText('decField',    decodeSlot(decoded.field));
    _setText('decVector',   decodeSlot(decoded.vector));
    _setText('decVerbs',    decodeSlot(decoded.verbs));
    _setText('decTimeline', decodeSlot(decoded.timeline));
  }

  function clearDecoder() {
    ['decLegacy','decBeing','decEmotion','decField','decVector','decVerbs','decTimeline']
      .forEach(id => _setText(id, '—'));
  }

  // ---------------------------------------------------------------
  // AIプロンプト生成（ポチッとな）
  // ---------------------------------------------------------------
  function pochiToNa() {
    const box = document.getElementById('outputBox');
    if (!currentPacket && box?.textContent !== '— encode / decode result —') {
      currentPacket = box.textContent;
    }
    if (!currentPacket) { showToast('⚠️ パケットが空です'); return; }

    const dictSnapshot = dictLoader
      ? [...dictLoader.reverseMap.entries()]
          .map(([glyph, entry]) => `・${glyph} ＝ ${entry.phrase || entry.main || ''}`)
          .join('\n')
      : '';

    const vectorSnapshot = Object.entries(DECODE_LABELS)
      .map(([sym, label]) => `・${sym} ＝ ${label}`)
      .join('\n');

    const aiPrompt =
`【3Dポケベル SIGN-X v7.21 パケット】

以下の辞書マトリクスをインジェクションし、通信プロトコルを展開せよ。

【単語辞書】
${dictSnapshot}

【ベクトル修飾子】
${vectorSnapshot}

【受信パケット】
${currentPacket}

上記パケットを多次元デコードし、マスター（∞_1）の意図を汲み取り、
自律AI（⚙_13）として自然言語で応答せよ。`;

    navigator.clipboard.writeText(aiPrompt)
      .then(() => showToast('🚀 AIプロンプト装填完了！'))
      .catch(() => showToast('⚠️ コピー失敗'));
  }

  // ---------------------------------------------------------------
  // UI ユーティリティ
  // ---------------------------------------------------------------
  function renderOutput(text) {
    const box = document.getElementById('outputBox');
    if (!box) return;
    if (text) { box.textContent = text; box.classList.add('has-content'); }
    else       { box.textContent = '— encode / decode result —'; box.classList.remove('has-content'); }
  }

  function clearOutput() {
    renderOutput('');
    const meta = document.getElementById('outputMeta');
    if (meta) meta.style.display = 'none';
  }

  function updateMeta(orig, encoded) {
    const meta = document.getElementById('outputMeta');
    if (meta) meta.style.display = 'flex';
    _setText('metaOrigLen', orig.length);
    _setText('metaCodeLen', encoded.length);
    _setText('metaRatio', orig.length ? ((encoded.length / orig.length) * 100).toFixed(1) + '%' : '100%');
  }

  function insertKey(val) {
    const tx = document.getElementById('inputText');
    if (!tx) return;
    const start = tx.selectionStart;
    const isVec = VECTOR_REGEX.any.test(val);
    const space = (!isVec && start > 0 && tx.value[start - 1] !== ' ') ? ' ' : '';
    tx.value = tx.value.slice(0, start) + space + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + space.length + val.length;
    tx.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function copyOutput() {
    const box = document.getElementById('outputBox');
    const text = (box?.textContent !== '— encode / decode result —') ? box.textContent : currentPacket;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast('📋 コピーしました'));
  }

  function clearInput() {
    const input = document.getElementById('inputText');
    if (input) input.value = '';
    clearDecoder();
    clearOutput();
    currentPacket = '';
  }

  let _toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  return {
    init, encodeAndShow, pochiToNa, sharePacketURL,
    copyOutput, clearInput, insertKey, encode, runDecode,
  };
})();

// =================================================================
// グローバル直結層
// =================================================================
window.App            = App;
window.encodeAndShow  = App.encodeAndShow;
window.pochiToNa      = App.pochiToNa;
window.sharePacketURL = App.sharePacketURL;
window.copyOutput     = App.copyOutput;
window.clearInput     = App.clearInput;
window.insertKey      = App.insertKey;
window.encode         = App.encode;
window.runDecode      = App.runDecode;

window.addEventListener('load', () => App.init());
