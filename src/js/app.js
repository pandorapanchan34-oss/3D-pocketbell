// ============================================
// 3D POCKETBELL — APP CONTROLLER v6.1
// ============================================

let currentPacket = '';
let ENCODE_DICT = [];

async function loadDictionaries() {
  try {
    const [macroRes, legacyRes, coreRes] = await Promise.all([
      fetch('/dict/macro.json'),
      fetch('/dict/legacy.json'),
      fetch('/dict/3d-core.json')
    ]);

    const macro = macroRes.ok ? await macroRes.json() : [];
    const legacy = legacyRes.ok ? await legacyRes.json() : [];
    const core = coreRes.ok ? await coreRes.json() : [];

    ENCODE_DICT = [...macro, ...legacy, ...core]
      .sort((a, b) => b.key.length - a.key.length);

    console.log(`✅ 辞書ロード完了: ${ENCODE_DICT.length}件`);
  } catch (err) {
    console.error("辞書読み込み失敗", err);
  }
}

const App = (() => {

  async function init() {
    console.log("🚀 3Dポケベル v6.1 起動");
    await loadDictionaries();

    if (typeof Keyboard !== "undefined") {
      Keyboard.init(insertKey);
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

    showToast('3Dポケベル ONLINE ⚡');
  }

  function encode(text) {
    if (!text || !ENCODE_DICT.length) return text;
    let packet = text;
    ENCODE_DICT.forEach(({ key, glyph }) => {
      packet = packet.replace(new RegExp(key, 'g'), glyph);
    });
    return packet.replace(/\s+/g, ' ').trim();
  }

  function encodeAndShow() {
    const input = document.getElementById('inputText').value.trim();
    if (!input) return;

    const encoded = encode(input);
    currentPacket = encoded;

    const box = document.getElementById('outputBox');
    box.textContent = currentPacket;
    box.classList.add('has-content', 'flash');
    setTimeout(() => box.classList.remove('flash'), 400);

    updateMeta(input, currentPacket);
    runDecode(currentPacket);
  }

  function pochiToNa() {
    encodeAndShow();
    showToast('💥 PACKET EXECUTED!');
  }

  function runDecode(input) {
    if (typeof Parser === 'undefined') return;
    const parsed = Parser.parse(input);
    const decoded = Parser.decode(parsed);
    renderDecoder(decoded);
  }

  function renderDecoder(decoded) {
    setText('decLegacy', decoded.legacy || '—');
    setText('decBeing', decoded.being || '—');
    setText('decEmotion', decoded.emotion || decoded.emotion2 || '—');
    setText('decField', decoded.field || '—');
    setText('decTransition', decoded.transition || '—');
    setText('decVerbs', decoded.verbs || '—');
    setText('decTimeline', decoded.timeline || '—');
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
    document.getElementById('metaOrigLen').textContent = orig.length;
    document.getElementById('metaCodeLen').textContent = encoded.length;
    const ratio = orig.length ? ((encoded.length / orig.length) * 100).toFixed(1) + '%' : '100%';
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

  window.App = { init, encodeAndShow, pochiToNa, copyOutput, clearInput };

  return { init };
})();

window.addEventListener('load', () => App.init());
