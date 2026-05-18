// ============================================
// SIGN-X 数理エンジン v5.1.0 [Grand Finale]
// ============================================
const SIGNXCore = (() => {
  const coreState = { beingDom: null, beingDepth: null, stateLayers: [], field: null, forceGraph: [], timeline: null };
  const REG = { fields: ['🏠','🏢','☕','🌐','🛡️','🔥','🕳️','♾️'], verbs: ['V','S','E','F','G','T','I','D','M','C','P'] };
  
  function reset() { 
    coreState.beingDom = null; coreState.beingDepth = null; coreState.stateLayers = []; coreState.field = null; coreState.forceGraph = []; coreState.timeline = null; 
  }
  
  function parse(code) {
    reset(); 
    if(!code) return '';
    if(code.includes('3388')) { coreState.beingDom = '⚙'; coreState.beingDepth = '+Ⅳ'; coreState.stateLayers = ['☀️Ⅲ']; }
    if(code.includes('⚙')) coreState.beingDom = '⚙'; else if(code.includes('∞')) coreState.beingDom = '∞'; else if(code.includes('◇')) coreState.beingDom = '◇'; else if(code.includes('♢')) coreState.beingDom = '♢';
    
    const d = code.match(/[+-][ⅠⅡⅢⅣ]/); if(d) coreState.beingDepth = d[0];
    const stateRegex = /([☀️⛅☁️⛈️🌙❄️][️️]*[ⅠⅡⅢ]*)/gu; const matches = [...code.matchAll(stateRegex)];
    matches.forEach(m => { if(m[0] && (!coreState.beingDepth || !coreState.beingDepth.includes(m[0]))) coreState.stateLayers.push(m[0]); });
    for(const f of REG.fields) { if(code.includes(f)) { coreState.field = f; break; } }
    const t = code.match(/\.(P|N|F)/); if(t) coreState.timeline = t[0];
    for(const v of REG.verbs) { if(code.includes(v)) coreState.forceGraph.push({verb: v}); }
    
    // パンドラ数理に該当しない一般言語（日本語など）の場合はそのまま返す透過トポロジー
    const parsed = build();
    return parsed === "" ? code : parsed;
  }
  
  function build() {
    let out = '';
    if(coreState.beingDom || coreState.beingDepth) out += `[Being: ${coreState.beingDom||''}${coreState.beingDepth||''}] `;
    if(coreState.stateLayers.length > 0) out += `[State: ${coreState.stateLayers.join(' | ')}] `;
    if(coreState.field) out += `[Field: ${coreState.field}] `;
    if(coreState.forceGraph.length > 0) { out += '[Force: '; coreState.forceGraph.forEach(n => out += n.verb); if(coreState.timeline) out += coreState.timeline; out += ']'; }
    return out.trim();
  }
  
  return { parse, build, semanticExpand: () => ({ being: coreState.beingDom, depth: coreState.beingDepth, states: coreState.stateLayers, field: coreState.field, actions: coreState.forceGraph, timeline: coreState.timeline }) };
})();

// ============================================
// MULTI-LINK P2P LAYER (最大5基の並列レジスタ制御)
// ============================================
let peer = null; let activeConnections = {}; let currentTarget = 'all'; const MAX_SLOTS = 5;
const tradPagerNumbers = { '4649':'よろしく', '0843':'おはよう', '8181':'バイバイ', '14106':'愛してる', '3476':'対象指定 ➔ ⟨ぱんちゃん⟩', '810':'対象指定 ➔ ⟨パンドラ⟩', '3388':'合言葉トリガー ➔ Phase B 起動' };

window.addEventListener('DOMContentLoaded', () => {
  const pagerShortId = Math.floor(1000 + Math.random() * 9000);
  peer = new Peer(`3D-PAGER-${pagerShortId}`);
  peer.on('open', (id) => {
    const el = document.getElementById('myPeerId');
    if(el) el.textContent = id.replace('3D-PAGER-', '📟 ');
    showToast('v5.1.0 CORE INFRA ONLINE 📡');
    updateNetworkUI();
  });
  peer.on('connection', (incomingConn) => {
    if(Object.keys(activeConnections).length >= MAX_SLOTS) { incomingConn.close(); return; }
    registerConnection(incomingConn);
  });
  
  // ⌨️ 入力窓へのリアルタイム同期イベント設定
  const inputEl = document.getElementById('inputText');
  if(inputEl) {
    inputEl.addEventListener('input', () => {
      const input = inputEl.value;
      if(!input || input.trim() === "") {
        resetDecoderUI();
        return;
      }
      const result = SIGNXCore.parse(input.trim()); 
      const outBox = document.getElementById('outputBox');
      if(outBox) {
        outBox.innerText = result;
        outBox.classList.add('has-content');
      }
      updateDecoderUI(input, result);
      
      if(currentTarget === 'all') {
        Object.keys(activeConnections).forEach(id => { if(activeConnections[id].status === 'online') activeConnections[id].conn.send(input); });
      } else {
        if(activeConnections[currentTarget] && activeConnections[currentTarget].status === 'online') activeConnections[currentTarget].conn.send(input);
      }
    });
  }
});

function initiateConnection() {
  const destId = document.getElementById('destPeerId').value.trim();
  if(!destId || Object.keys(activeConnections).length >= MAX_SLOTS) return;
  const fullId = destId.startsWith('3D-PAGER-') ? destId : `3D-PAGER-${destId}`;
  registerConnection(peer.connect(fullId));
}

function registerConnection(c) {
  const shortId = c.peer.replace('3D-PAGER-', '');
  activeConnections[shortId] = { conn: c, status: 'connecting' };
  c.on('open', () => { activeConnections[shortId].status = 'online'; updateNetworkUI(); showToast(`📡 SLOT ONLINE: 📟 ${shortId}`); });
  c.on('data', (data) => {
    const inputEl = document.getElementById('inputText');
    if(inputEl) inputEl.value = data;
    const result = SIGNXCore.parse(data);
    const outBox = document.getElementById('outputBox');
    if(outBox) {
      outBox.innerText = result;
      outBox.classList.add('has-content');
    }
    updateDecoderUI(data, result);
    showToast(`📥 INJECT FROM 📟 ${shortId}`);
  });
  c.on('close', () => { delete activeConnections[shortId]; if(currentTarget === shortId) currentTarget = 'all'; updateNetworkUI(); showToast(`🔴 SLOT CLOSED: 📟 ${shortId}`); });
  c.on('error', () => { delete activeConnections[shortId]; updateNetworkUI(); });
  updateNetworkUI();
}

function updateNetworkUI() {
  const connsArray = Object.keys(activeConnections); const count = connsArray.length;
  const linkCountEl = document.getElementById('linkCount');
  if(linkCountEl) linkCountEl.textContent = `${count} / ${MAX_SLOTS}`;
  
  let slotsHtml = '';
  for(let i=0; i<MAX_SLOTS; i++) {
    if(connsArray[i]) {
      const sId = connsArray[i]; const status = activeConnections[sId].status;
      slotsHtml += `<div class="slot-item"><span class="slot-id">📟 ${sId}</span><span class="slot-status ${status}">${status}</span></div>`;
    } else {
      slotsHtml += `<div class="slot-item"><span class="slot-id" style="color:var(--text-dim);">[SLOT ${i+1}] EMPTY</span><span class="slot-status offline">VACANT</span></div>`;
    }
  }
  const slotsListEl = document.getElementById('slotsList');
  if(slotsListEl) slotsListEl.innerHTML = slotsHtml;
  
  let targetBtnHtml = '';
  connsArray.forEach(sId => {
    const activeClass = (currentTarget === sId) ? 'active' : '';
    targetBtnHtml += `<button class="target-btn ${activeClass}" onclick="setTarget('${sId}')">📟 ${sId}</button>`;
  });
  const dynBtnEl = document.getElementById('dynamicTargetButtons');
  if(dynBtnEl) dynBtnEl.innerHTML = targetBtnHtml;
  
  const btnAll = document.getElementById('target-all');
  if(btnAll) {
    if(currentTarget === 'all') btnAll.classList.add('active');
    else btnAll.classList.remove('active');
  }
  
  const dot = document.getElementById('statusDot');
  if(dot) dot.style.backgroundColor = (count > 0) ? 'var(--success)' : 'var(--accent)';
}
function setTarget(t) { currentTarget = t; updateNetworkUI(); }

function encode() {
  const inputEl = document.getElementById('inputText');
  if(!inputEl) return;
  const input = inputEl.value;
  if(!input || input.trim() === "") {
    clearInput();
    return;
  }
  const result = SIGNXCore.parse(input.trim());
  const outBox = document.getElementById('outputBox');
  if(outBox) {
    outBox.innerText = result;
    outBox.classList.add('has-content');
  }
  updateDecoderUI(input, result);
  
  if(currentTarget === 'all') {
    Object.keys(activeConnections).forEach(id => { if(activeConnections[id].status === 'online') activeConnections[id].conn.send(input); });
  } else {
    if(activeConnections[currentTarget] && activeConnections[currentTarget].status === 'online') activeConnections[currentTarget].conn.send(input);
  }
}

function updateDecoderUI(input, packet) {
  const s = SIGNXCore.semanticExpand();
  let numDecodeStr = '—';
  if (input && input.trim() !== "") {
    for(const [numKey, numVal] of Object.entries(tradPagerNumbers)) {
      if(input.includes(numKey)) { numDecodeStr = `<span class="pager-num">【${numKey}】➔ ${numVal}</span>`; break; }
    }
  }
  
  const dNum = document.getElementById('decNum'); if(dNum) dNum.innerHTML = numDecodeStr;
  const dBeing = document.getElementById('decBeing'); if(dBeing) dBeing.innerHTML = s.being ? `<b>${s.being}</b> <span class="sub">[${s.depth||''}]</span>` : '—';
  const dState = document.getElementById('decState'); if(dState) dState.innerHTML = s.states.length > 0 ? s.states.map(l => `<b>${l}</b>`).join(' ⇋ ') : '—';
  const dField = document.getElementById('decField'); if(dField) dField.innerHTML = s.field ? `<b>${s.field}</b>` : '—';
  const dForce = document.getElementById('decForce'); if(dForce) dForce.innerHTML = s.actions.length > 0 ? s.actions.map(a => `<b>${a.verb}</b>`).join(' ➔ ') : '—';

  let deepCount = 0; packet.replace(/./g, c => { if(['⚙','∞','◇','🛡️','🌐','✴'].includes(c)) deepCount++; });
  const jFill = document.getElementById('judgmentFill'); if(jFill) jFill.style.width = `${Math.min(100, 20 + (deepCount * 15))}%`;
  const jScore = document.getElementById('judgmentScore'); if(jScore) jScore.textContent = `${Math.min(100, 20 + (deepCount * 15))}%`;
  
  let riskScore = /ザック|監視|漏洩/.test(input) ? 75 : 0;
  const rFill = document.getElementById('riskFill'); if(rFill) rFill.style.width = `${riskScore}%`;
  const rVal = document.getElementById('riskValue'); if(rVal) rVal.textContent = `${riskScore}%`;
}

function resetDecoderUI() {
  const ids = ['decNum', 'decBeing', 'decState', 'decField', 'decForce'];
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML = '—'; });
  const outBox = document.getElementById('outputBox');
  if(outBox) {
    outBox.innerText = '— encode/decode result —';
    outBox.classList.remove('has-content');
  }
}

function insertKey(val) {
  const tx = document.getElementById('inputText'); if(!tx) return;
  const start = tx.selectionStart;
  tx.value = tx.value.substring(0, start) + val + tx.value.substring(tx.selectionEnd); tx.focus();
  tx.selectionStart = tx.selectionEnd = start + val.length;
  const inputEvent = new Event('input', { bubbles: true }); tx.dispatchEvent(inputEvent);
}

function clearInput() {
  const tx = document.getElementById('inputText'); if(tx) tx.value = '';
  resetDecoderUI();
  showToast('CLEARED 🕳️');
}
function copyOutput() { const o = document.getElementById('outputBox').innerText; if(o && o !== '— encode/decode result —') navigator.clipboard.writeText(o).then(() => showToast('コピー完了 ⧉')); }
function pochiToNa() { encode(); showToast('💥 PULSE BROADCASTED!'); }
let toastTimer; function showToast(msg) { const t = document.getElementById('toast'); if(!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.classList.remove('show'); }, 1800); }
