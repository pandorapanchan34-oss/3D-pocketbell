// ============================================
// 3D PAGER — APP CONTROLLER v6.0
// grammar.js / parser.js / p2p.js / keyboard.js を統合
// ============================================

const App = (() => {
  let currentTarget = 'all';
  let currentPacket = '';
  let myId = null;

  // ============================================
  // 起動
  // ============================================
  function init() {
    // キーボード初期化
    Keyboard.init(insertKey);

    // P2P初期化
    P2P.on('onOpen', (id) => {
      myId = id;
      document.getElementById('myPagerId').textContent = `📟 ${id}`;
      showToast('3Dポケベル ONLINE ⚡');
    });

    P2P.on('onConnect', (shortId) => {
      updateNetworkUI();
      showToast(`📡 CONNECTED: 📟 ${shortId}`);
    });

    P2P.on('onReceive', (shortId, data) => {
      // 受信パケットを入力欄に展開してデコード
      const input = document.getElementById('inputText');
      input.value = data;
      _runDecode(data);
      showToast(`📥 RECEIVED from 📟 ${shortId}`);
    });

    P2P.on('onClose', (shortId) => {
      if (currentTarget === shortId) currentTarget = 'all';
      updateNetworkUI();
      showToast(`🔌 DISCONNECTED: 📟 ${shortId}`);
    });

    P2P.on('onError', (err) => {
      showToast(`⚠️ ERROR: ${err.type || err}`);
    });

    P2P.init();

    // リアルタイムデコード（入力監視）
    document.getElementById('inputText').addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val.trim()) {
        _clearDecoder();
        _clearOutput();
        return;
      }
      _runDecode(val);
    });
  }

  // ============================================
  // ENCODE / DECODE ボタン
  // ============================================
  function encode() {
    const input = document.getElementById('inputText').value;
    if (!input.trim()) { clearInput(); return; }

    const parsed = Parser.parse(input);
    const decoded = Parser.decode(parsed);
    currentPacket = _buildPacketLine(parsed);

    // 出力欄
    const box = document.getElementById('outputBox');
    box.textContent = currentPacket || input;
    box.className = 'output-box has-content flash';
    setTimeout(() => box.classList.remove('flash'), 400);

    // メタ情報
    _updateMeta(input, currentPacket);

    // デコーダーUI更新
    _renderDecoder(parsed, decoded);

    showToast('PACKET EXECUTED ⚡');
  }

  // ============================================
  // ポチッとな（エンコード + 送信）
  // ============================================
  function pochiToNa() {
    encode();
    const packet = currentPacket || document.getElementById('inputText').value;
    if (!packet) return;
    P2P.send(packet, currentTarget);
    showToast('💥 BROADCASTED!');
  }

  // ============================================
  // P2P接続
  // ============================================
  function connectPeer() {
    const dest = document.getElementById('destPeerId').value.trim();
    if (!dest) return;
    const ok = P2P.connect(dest);
    if (!ok) showToast(`⚠️ MAX SLOTS (${P2P.MAX_SLOTS}) REACHED`);
  }

  // ============================================
  // ターゲット選択
  // ============================================
  function setTarget(t) {
    currentTarget = t;
    updateNetworkUI();
  }

  // ============================================
  // ネットワークUIの更新
  // ============================================
  function updateNetworkUI() {
    const slots = P2P.getSlots();
    const count = slots.length;

    document.getElementById('linkCount').textContent = `${count} / ${P2P.MAX_SLOTS}`;
    document.getElementById('statusDot').style.backgroundColor =
      count > 0 ? 'var(--success)' : 'var(--accent)';

    // スロット一覧
    const slotsList = document.getElementById('slotsList');
    slotsList.innerHTML = '';
    for (let i = 0; i < P2P.MAX_SLOTS; i++) {
      const slot = slots[i];
      const item = document.createElement('div');
      item.className = 'slot-item';
      if (slot) {
        item.innerHTML = `
          <span class="slot-id">📟 ${slot.id}</span>
          <span class="slot-status ${slot.status}">${slot.status}</span>`;
      } else {
        item.innerHTML = `
          <span class="slot-id vacant">[SLOT ${i + 1}] EMPTY</span>
          <span class="slot-status offline">VACANT</span>`;
      }
      slotsList.appendChild(item);
    }

    // ターゲットボタン
    const targetRow = document.getElementById('dynamicTargetButtons');
    targetRow.innerHTML = '';
    slots.forEach(({ id }) => {
      const btn = document.createElement('button');
      btn.className = `target-btn${currentTarget === id ? ' active' : ''}`;
      btn.textContent = `📟 ${id}`;
      btn.onclick = () => setTarget(id);
      targetRow.appendChild(btn);
    });

    // BROADCAST ボタンのアクティブ
    const broadcastBtn = document.getElementById('target-all');
    broadcastBtn.classList.toggle('active', currentTarget === 'all');
  }

  // ============================================
  // デコーダーUI 更新
  // ============================================
  function _runDecode(input) {
    const parsed  = Parser.parse(input);
    const decoded = Parser.decode(parsed);
    _renderDecoder(parsed, decoded);
  }

  function _renderDecoder(parsed, decoded) {
    _set('decLegacy',     decoded.legacy     || '—');
    _set('decBeing',      decoded.being      || '—');
    _set('decEmotion',    _emotionStr(decoded));
    _set('decField',      decoded.field      || '—');
    _set('decTransition', decoded.transition || '—');
    _set('decVerbs',      decoded.verbs      || '—');
    _set('decTimeline',   decoded.timeline   || '—');
  }

  function _emotionStr(decoded) {
    if (!decoded.emotion && !decoded.emotion2) return '—';
    if (decoded.emotion && decoded.emotion2) {
      return `${decoded.emotion} → ${decoded.emotion2}`;
    }
    return decoded.emotion || decoded.emotion2 || '—';
  }

  function _clearDecoder() {
    ['decLegacy','decBeing','decEmotion','decField','decTransition','decVerbs','decTimeline']
      .forEach(id => _set(id, '—'));
  }

  function _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ============================================
  // パケット1行生成（語順厳守）
  // [Being] [Emotion] [Field] [Transition] [Emotion'] [Verb] [Timeline]
  // ============================================
  function _buildPacketLine(parsed) {
    const parts = [];

    if (parsed.being.depth)  parts.push(parsed.being.depth);
    if (parsed.being.domain) parts.push(parsed.being.domain);

    if (parsed.emotion.face) {
      parts.push(parsed.emotion.face + (parsed.emotion.intensity || ''));
    }

    if (parsed.field.length > 0) parts.push(parsed.field.join('↔'));

    if (parsed.transition) parts.push(parsed.transition);

    if (parsed.emotion2.face) {
      parts.push(parsed.emotion2.face + (parsed.emotion2.intensity || ''));
    }

    if (parsed.verbs.length > 0) parts.push(parsed.verbs.join(' '));

    if (parsed.timeline) parts.push(parsed.timeline);

    return parts.join(' ');
  }

  // ============================================
  // ユーティリティ
  // ============================================
  function insertKey(val) {
    const tx = document.getElementById('inputText');
    const start = tx.selectionStart;
    tx.value = tx.value.slice(0, start) + val + tx.value.slice(tx.selectionEnd);
    tx.focus();
    tx.selectionStart = tx.selectionEnd = start + val.length;
    tx.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function copyOutput() {
    if (!currentPacket) return;
    navigator.clipboard.writeText(currentPacket).then(() => showToast('コピー完了 ⧉'));
  }

  function clearInput() {
    document.getElementById('inputText').value = '';
    _clearDecoder();
    _clearOutput();
    currentPacket = '';
  }

  function _clearOutput() {
    const box = document.getElementById('outputBox');
    box.textContent = '— encode / decode result —';
    box.className = 'output-box';
    document.getElementById('outputMeta').style.display = 'none';
  }

  function _updateMeta(input, output) {
    const meta = document.getElementById('outputMeta');
    meta.style.display = 'flex';
    document.getElementById('metaOrigLen').textContent = input.length;
    document.getElementById('metaCodeLen').textContent = output.length;
    const ratio = input.length
      ? ((output.length / input.length) * 100).toFixed(1) + '%'
      : '100%';
    document.getElementById('metaRatio').textContent = ratio;
  }

  let _toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // グローバルに公開（HTML onclickから呼ぶ）
  window.App = {
    encode, pochiToNa, connectPeer, setTarget,
    copyOutput, clearInput, showToast,
  };

  return { init };
})();

window.addEventListener('load', () => App.init());
