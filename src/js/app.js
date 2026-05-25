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
import DictLoader from './dict-loader.js';

// ── グローバル状態 ──
let currentPacket = '';
let dictLoader    = null;

window.KEYBOARD_LAYOUT = KEYBOARD_LAYOUT;

// =================================================================
// 辞書ロード（v2.3 カスケード・インジェクター）
// =================================================================
async function loadDictionaries() {
  try {
    console.log('📡 四重統治データ層・フェッチ開始...');
    dictLoader = new DictLoader();
    window.dictLoader = dictLoader;
    const success = await dictLoader.load();
    if (!success || !dictLoader.entries.length) throw new Error('No entries loaded');
    window.ENCODE_DICT = dictLoader.entries.map(e => ({ key: e.key, glyph: e.glyph }));
    const info = dictLoader.getInfo();
    console.log(`✅ 宇宙結合完了: ${info.totalEntries}エントリ / ${info.encodeWords}語`);
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

    const info = dictLoader?.getInfo() || {};
    const el = document.getElementById('linkCount');
    if (el) el.textContent = `${info.totalEntries || 0}語 (v2.3)`;

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

  // ---------------------------------------------------------------
  // エンコード v7.21
  // ---------------------------------------------------------------
  function encode(text) {
    if (!text) return '';

    let stream = text;
    for (const { pattern, replace } of PUNCTUATION_PATTERNS) {
      stream = stream.replace(pattern, replace);
    }
    stream = stream.trim();

    // Step 1: 四重カスケード辞書・最長一致一括置換
    if (dictLoader?.loaded) {
      const keys = dictLoader.getSortedKeys();
      for (const key of keys) {
        if (!key) continue;
        const glyph = dictLoader.getGlyph(key);
        if (!glyph) continue;
        const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        stream = stream.replace(new RegExp(escaped, 'g'), ` ${glyph} `);
      }
    }

    // Step 2: 膠着語ノイズ除去
    for (const pattern of NOISE_PATTERNS) {
      stream = stream.replace(pattern, '$1 $3');
    }

    // Step 3: トークン分割
    let tokens = stream.trim().split(/\s+/).filter(Boolean);

    // Step 4: SVO語順矯正
    for (let i = 0; i < tokens.length - 1; i++) {
      const cur = tokens[i], next = tokens[i + 1];
      if (VERB_REGEX.test(next) && !VERB_REGEX.test(cur) && !TIMELINE_REGEX.test(cur)) {
        tokens[i] = next; tokens[i + 1] = cur; i++;
      }
    }

    // Step 5: ベクトル吸着
    let joined = tokens.join(' ');
    joined = joined.replace(/\s+([↑↓→←↺↻⇄+\-~*?]+)/g, '$1');

    // Step 6: 最終結晶化
    const result = [];
    for (const token of joined.split(/\s+/)) {
      if (!token) continue;
      if (VECTOR_REGEX.any.test(token))          { result.push(token); continue; }
      if (VERB_REGEX.test(token))                { result.push(token); continue; }
      if (TIMELINE_REGEX.test(token))            { result.push(token); continue; }
      if (/^(∞_|⚙_)/.test(token))              { result.push(token); continue; }
      if (/^\d{4,5}$/.test(token))              { result.push(token); continue; }
      if (/^[ぁ-んァ-ヶー一-龠]+$/.test(token)) { result.push(`＜${token}＞`); continue; }
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
  // デコード
  // ---------------------------------------------------------------
  function runDecode(input) {
    const clean = input?.trim();
    if (!clean) { clearDecoder(); return; }

    const decoded = { legacy:'—', being:'—', emotion:'—', field:'—', vector:'—', verbs:'—', timeline:'—' };
    for (const unit of clean.split(/\s+/)) {
      if (!unit || unit === '—') continue;
      if (/^\d{4,5}$/.test(unit))                                     decoded.legacy   = unit;
      if (/^(∞_|⚙_)/.test(unit))                                    decoded.being    = unit;
      if (TIMELINE_REGEX.test(unit))                                   decoded.timeline = unit;
      if (/[🏠🏢🏥☕🛁🚻🍚🍴🍺💤🏃🛒📦📚🚃🚗🚲🛡️⚠️]/.test(unit))  decoded.field    = unit;
      if (/[😍❤️😀🤣😢🥺😌😠😲🎉🙇🤒💊📞💬📷🎵🎬🎮🤑🤝👨‍👩‍👧🐾]/.test(unit)) decoded.emotion = unit;
      if (VERB_REGEX.test(unit))                                       decoded.verbs    = unit;
      if (VECTOR_REGEX.any.test(unit) && unit !== decoded.emotion)     decoded.vector   = unit;
    }
    renderDecoder(decoded);
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
