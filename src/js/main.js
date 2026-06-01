/**
 * SIGN-X v9.99 本家大統一リモート・コアマウントゲート [究極完全版]
 * パス: src/js/main.js
 * * 役割:
 * ローカル資産ゼロ。要塞の共通コアとレイアウトストリームを同時結合し、
 * プレーン絵文字とDEEP暗号、そしてデコードの全パイプラインを完璧に直結する。
 */
const FORTRESS_BASE = "https://3-d-pocketbell-deep-bssv.vercel.app";
const FORTRESS_CORE = `${FORTRESS_BASE}/core.js`;
const FORTRESS_LAYOUT = `${FORTRESS_BASE}/dict/keyboard_layout.json`; 

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('header-dict-count');
  const statusDot = document.querySelector('.status-dot');
  
  if (badge) badge.innerText = "● SIGN-X CONNECTING...";
  if (statusDot) statusDot.style.background = "#38bdf8"; // 接続中の青パルス

  try {
    // ❶ 要塞コアと、要塞側に追加したレイアウトJSONを並行して動的吸引
    const [core, layoutRes] = await Promise.all([
      import(FORTRESS_CORE),
      fetch(FORTRESS_LAYOUT).then(r => r.json()).catch(() => null)
    ]);
    
    // ❷ 要塞の辞書システムをキック（11万語の遠隔ロードを執行）
    const localUserDict = { entries: [] };
    const syncResult = await core.initSystem(localUserDict);

    // ❸ 物理キーボードエンジンの入力インジェクション知能を展開
    window.insertKey = function(value) {
      const inputBox = document.getElementById('input-box');
      if (!inputBox) return;

      const startPos = inputBox.selectionStart;
      const endPos = inputBox.selectionEnd;
      const text = inputBox.value;
      const insertText = value + ' '; // トークン結合をスムーズにする防衛殻（🛡️）

      inputBox.value = text.substring(0, startPos) + insertText + text.substring(endPos);
      
      inputBox.focus();
      inputBox.selectionStart = inputBox.selectionEnd = startPos + insertText.length;

      // キー入力時はプレーン側でリアルタイム連動
      if (typeof window.encodeAndShow === 'function') {
        window.encodeAndShow();
      }
    };

    // ❹ 🪐 要塞から降ってきたプレーンな大統一レイアウトを使ってマトリクスを現成！
    if (layoutRes) {
      buildSignXKeyboard(layoutRes);
    } else {
      console.warn('⚠️ 要塞側から keyboard_layout.json を吸引できませんでした。');
    }

    if (badge && syncResult.success) {
      // 画面右上のバッジに、吸引完了した語彙数を美しく現成！
      badge.innerText = `● ${syncResult.totalWords || 116753} / ∞←`;
      if (statusDot) statusDot.style.background = "#34d399"; // 完全覚醒の緑パルス
    }

    // ❺ 💥 大統一・HTMLインライン onclick 関数群の完全吸着バインド
    const inputBox = document.getElementById('input-box');
    const packetBox = document.getElementById('packet-box');

    // 【ルートA】⚡ ENCODE ボタン（日常用プレーン宇宙）
    window.encodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value;
      
      // 要塞のプレーン変換（生絵文字・数理ベクトル宇宙）
      const packet = core.encode ? core.encode(text) : text;
      packetBox.innerText = packet || "— encode / decode result —";
      
      updateMetaCounters(text, packet);
    };

    // 【ルートB】🛸 DEEP ボタン（AI推論用 62進数カテゴリーパケット）
    window.encodeDeep = window.deepEncodeAndShow = () => {
      if (!inputBox || !packetBox) return;
      const text = inputBox.value;

      // 🪐 要塞の最強62進数ディープパケットを直撃射出！
      const deepPacket = core.deepEncode ? core.deepEncode(text) : (core.encode ? core.encode(text) : text);
      
      // 中央のメイン出力窓にディープ暗号を堂々現成！
      packetBox.innerText = deepPacket || "— DEEP INTERFERENCE ACTIVE —";
      
      // 🪐 【マルチマッピング】右側のサイバーインジケーター層（DECODER OUTPUT）にも
      // ディープパケットの断片を美しく写像（ホールド）させる！
      const decLegacy = document.getElementById('decLegacy');
      const decBeing = document.getElementById('decBeing');
      if (decLegacy) decLegacy.innerText = deepPacket;
      if (decBeing) decBeing.innerText = "🪐 AI_MODE_ACTIVE";
      
      // カウンターもディープパケットの文字数で同期再計算
      updateMetaCounters(text, deepPacket);
      
      if (window.showToast) window.showToast('🛸 AI推論用ディープパケットを射出しました');
    };

    // 💥 ポチッとなボタン
    window.pochiToNa = () => {
      if (!inputBox) return;
      inputBox.value = "今から可愛い犬と遊ぶ"; 
      window.encodeAndShow();
    };

    // リアルタイム・自動デコードパイプラインの結合
    if (inputBox) {
      inputBox.addEventListener('input', () => {
        // 🚨 ユーザーが文字をタイピングしている間は、日常用の「プレーン絵文字」でリアルタイム追従
        window.encodeAndShow();
        
        // 🔓 【自動逆写像（デコード）】
        // 入力欄に直接「Aa N0...」などのディープ暗号パケットがコピペされた場合は、自動で自然言語へ復元
        const currentText = inputBox.value.trim();
        const decLegacy = document.getElementById('decLegacy');
        
        if (currentText && core.decode) {
          const decodedSignal = core.decode(currentText);
          // パケットが解析できた場合のみ、デコーダーの最上段に復元テキストを流す
          if (decLegacy && decodedSignal !== currentText) {
            decLegacy.innerText = decodedSignal;
          }
        }
      });
    }

    // 🛡️ DOM側からも物理的に[DEEP]ボタンを掴んで完全結合
    const btnDeep = document.getElementById('btn-deep') || 
                    document.querySelector('.btn-deep') || 
                    Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('DEEP'));
    if (btnDeep) {
      btnDeep.onclick = window.encodeDeep;
    }
    console.log("🟢 [Gate] 本家UI、要塞分散辞書ストリームの遠隔同期に完全成功。Q.E.D.");

  } catch (error) {
    console.error("❌ [Gate] 大統一ストリームの結合断線:", error);
    if (badge) badge.innerText = "● CORE OFFLINE";
    if (statusDot) statusDot.style.background = "#ef4444"; // 拒絶の赤パルス
  }
});

/**
 * ⚡ 物理キーボード動的現成マトリクス（v7.85 移植版）
 */
function buildSignXKeyboard(layout) {
  console.log('📟 物理キーボードマトリクス結合開始... (v7.85リモート同期版)');

  const container = document.getElementById('keyboardContainer');
  if (!container) {
    console.warn('⚠️ keyboardContainer が見つかりません。DOMマウントを保留します。');
    return;
  }

  container.innerHTML = '';

  Object.keys(layout).forEach(sectionKey => {
    const row = document.createElement('div');
    row.className = `keyboard-row section-${sectionKey}`;

    layout[sectionKey].forEach(btnData => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.textContent = btnData.label;
      btn.title = btnData.tip || '';
      btn.dataset.value = btnData.value;

      btn.onclick = () => {
        window.insertKey(btnData.value);
      };

      row.appendChild(btn);
    });

    container.appendChild(row);
  });

  console.log('✅ SIGN-X v7.85 物理キーボードマトリクス完全同期結合完了 ⚡');
}

// メタ情報カウンター（ORIGINAL / PACKET / RATIO）の同期計算ロジック
function updateMetaCounters(origText, packetText) {
  const origLen = origText ? origText.length : 0;
  const codeLen = packetText ? packetText.replace(/\s+/g, '').length : 0;
  const ratio = origLen > 0 ? Math.round((codeLen / origLen) * 100) : 100;

  const mOrig = document.getElementById('metaOrigLen');
  const mCode = document.getElementById('metaCodeLen');
  const mRatio = document.getElementById('metaRatio');

  if (mOrig) mOrig.innerText = origLen;
  if (mCode) mCode.innerText = codeLen;
  if (mRatio) mRatio.innerText = `${ratio}%`;
}
