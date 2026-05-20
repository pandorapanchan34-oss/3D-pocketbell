// ============================================
// 3D POCKETBELL — APP CONTROLLER v6.1
// P2P完全削除 + 静的辞書対応版
// ============================================

let currentPacket = '';
let ENCODE_DICT = [];

const App = (() => {

  // ============================================
  // 起動
  // ============================================
  async function init() {
    console.log("🚀 3Dポケベル v6.1 起動");

    // 辞書読み込み
    await loadDictionaries();

    // キーボード初期化
    if (typeof Keyboard !== 'undefined') {
      Keyboard.init(insertKey);
    }

    // リアルタイムデコード
    const input = document.getElementById('inputText');
    if (input) {
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          runDecode(val);
        } else {
          clearDecoder();
          clearOutput();
        }
      });
    }

    showToast('3Dポケベル ONLINE ⚡');
  }

  // ============================================
  // 辞書読み込み
  // ============================================
  async function loadDictionaries() {
    try {
      const [macroRes, legacyRes, coreRes] = await Promise.all([
        fetch('/dict/macro.json').catch(() => ({})),
        fetch('/dict/legacy.json').catch(() => ({})),
        fetch('/dict/3d-core.json').catch(() => ({}))
      ]);

      const macro = macroRes.ok ? await macroRes.json() : [];
      const legacy = legacyRes.ok ? await legacyRes.json() : [];
      const core = coreRes.ok ? await coreRes.json() : [];

      ENCODE_DICT = [...macro, ...legacy, ...core]
        .sort((a, b) => b.key.length - a.key.length); // 長い語句を優先

      console.log(`✅ 辞書ロード完了: ${ENCODE_DICT.length}件`);
    } catch (err) {
      console.error("辞書読み込みエラー", err);
    }
  }

  // ============================================
  // ENCODE
  // ============================================
  function encode(text) {
    if (!text || !ENCODE_DICT.length) return text;

    let packet = text;
    ENCODE_DICT.forEach(({ key, glyph }) => {
      const regex = new RegExp(key, 'g');
      packet = packet.replace(regex, glyph);
    });

    // 余分な空白を整理
    packet = packet.replace(/\s+/g, ' ').trim();
    return packet;
  }

  // ============================================
  // ENCODE / DECODE ボタン
  // ============================================
  function encodeAndShow() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) return;

    const encoded = encode(input);
    currentPacket = encoded || input;

    // 出力表示
    const box = document.getElementById('outputBox');
    box.textContent = currentPacket;
    box.classList.add('has-content', 'flash');
    setTimeout(() => box.classList.remove('flash'), 400);

    // メタ情報
    updateMeta(input, currentPacket);

    // デコーダー
    runDecode(currentPacket);
    showToast('ENCODE完了 ⚡');
  }

  // ============================================
  // ポチッとな（エンコード → 表示）
  // ============================================
  function pochiToNa() {
    encodeAndShow();
    // 将来ここに送信処理を追加可能
    showToast('💥 PACKET EXECUTED!');
  }

  // ============================================
  // デコード実行
  // ============================================
  function runDecode(input) {
    if (typeof Parser === 'undefined') return;
    const parsed = Parser.parse(input);
    const decoded = Parser.decode(parsed);
    renderDecoder(parsed, decoded);
  }

  function renderDecoder(parsed, decoded) {
    setText('decLegacy', decoded.legacy || '—');
    setText('decBeing', decoded.being || '—');
    setText('decEmotion', formatEmotion(decoded));
    setText('decField', decoded.field || '—');
    setText('decTransition', decoded.transition || '—');
    setText('decVerbs', decoded.verbs || '—');
    setText('decTimeline', decoded.timeline || '—');
  }

  function formatEmotion(decoded) {
    if (decoded.emotion && decoded.emotion2) {
      return `${decoded.emotion} → ${decoded.emotion2}`;
    }
    return decoded.emotion || decoded.emotion2 || '—';
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function clearDecoder() {
    ['decLegacy','decBeing','decEmotion','decField','decTransition','decVerbs','decTimeline']
      .forEach(id => setText(id, '—'));
  }

  // ============================================
  // ユーティリティ
  // ============================================
  function updateMeta(original, encoded) {
    const meta = document.getElementById('outputMeta');
    if (meta) meta.style.display = 'flex';

    document.getElementById('metaOrigLen').textContent = original.length;
    document.getElementById('metaCodeLen').textContent = encoded.length;

    const ratio = original.length 
      ? ((encoded.length / original.length) * 100).toFixed(1) + '%' 
      : '100%';
    document.getElementById('metaRatio').textContent = ratio;
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
    navigator.clipboard.writeText(currentPacket).then(() => {
      showToast('📋 コピーしました');
    });
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

  // グローバル公開
  window.App = {
    init,
    encodeAndShow,
    pochiToNa,
    copyOutput,
    clearInput,
    showToast
  };

  return { init };
})();

// ページロード時に起動
window.addEventListener('load', () => {
  App.init();
});
