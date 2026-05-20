// ============================================
// 3D PAGER — P2P NETWORK LAYER v6.0
// PeerJS (WebRTC) ベース、最大5スロット
// ============================================

const P2P = (() => {
  let peer = null;
  const connections = {}; // { shortId: { conn, status } }
  const MAX_SLOTS = 5;

  // コールバック（app.jsからセット）
  const callbacks = {
    onOpen:    (myId) => {},
    onConnect: (shortId) => {},
    onReceive: (shortId, data) => {},
    onClose:   (shortId) => {},
    onError:   (err) => {},
  };

  // ============================================
  // 初期化
  // ============================================
  function init() {
    const shortId = Math.floor(1000 + Math.random() * 9000);
    peer = new Peer(`3DPAGER-${shortId}`);

    peer.on('open', (id) => {
      const displayId = id.replace('3DPAGER-', '');
      callbacks.onOpen(displayId);
    });

    peer.on('connection', (incomingConn) => {
      if (Object.keys(connections).length >= MAX_SLOTS) {
        incomingConn.close();
        return;
      }
      _register(incomingConn);
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        setTimeout(init, 500);
      } else {
        callbacks.onError(err);
      }
    });
  }

  // ============================================
  // 接続開始（発信側）
  // ============================================
  function connect(destShortId) {
    if (!peer || Object.keys(connections).length >= MAX_SLOTS) return false;
    const fullId = destShortId.startsWith('3DPAGER-')
      ? destShortId
      : `3DPAGER-${destShortId}`;
    const conn = peer.connect(fullId);
    _register(conn);
    return true;
  }

  // ============================================
  // 送信
  // ============================================
  function send(packet, targetShortId = 'all') {
    if (!packet) return;
    if (targetShortId === 'all') {
      Object.values(connections).forEach(({ conn, status }) => {
        if (status === 'online') conn.send(packet);
      });
    } else {
      const target = connections[targetShortId];
      if (target && target.status === 'online') target.conn.send(packet);
    }
  }

  // ============================================
  // 接続登録（内部）
  // ============================================
  function _register(conn) {
    const shortId = conn.peer.replace('3DPAGER-', '');
    connections[shortId] = { conn, status: 'connecting' };

    conn.on('open', () => {
      connections[shortId].status = 'online';
      callbacks.onConnect(shortId);
    });

    conn.on('data', (data) => {
      callbacks.onReceive(shortId, data);
    });

    conn.on('close', () => {
      delete connections[shortId];
      callbacks.onClose(shortId);
    });

    conn.on('error', () => {
      delete connections[shortId];
      callbacks.onClose(shortId);
    });
  }

  // ============================================
  // 状態取得
  // ============================================
  function getSlots() {
    return Object.entries(connections).map(([id, { status }]) => ({ id, status }));
  }

  function getCount() {
    return Object.keys(connections).length;
  }

  function isOnline(shortId) {
    return connections[shortId]?.status === 'online';
  }

  function on(event, fn) {
    if (callbacks[event] !== undefined) callbacks[event] = fn;
  }

  return { init, connect, send, getSlots, getCount, isOnline, on, MAX_SLOTS };
})();
