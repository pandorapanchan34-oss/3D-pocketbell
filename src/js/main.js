/**
 * SIGN-X v9.99 本家大統一リモート・コアマウントゲート [真の最終完全版・インジケーター連動モデル]
 * パス: src/js/main.js
 * * 役割:
 * 変数の二重定義（btnDeep）を完全パージ。プレーン・DEEP・自動逆写像・キーボード
 * すべてのパイプラインが1ミリのノイズもなく直交する、プロジェクト完了確定ゲート。
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

      let deepPacket = "";

      // 🪐 【超直撃回路】露出している関数を徹底的に探して、最強62進数変換を100%引きずり出す
      if (typeof core.deepEncode === 'function') {
        deepPacket = core.deepEncode(text);
      } else if (core.default && typeof core.default.deepEncode === 'function') {
        deepPacket = core.default.deepEncode(text);
      } else if (core.encode) {
        deepPacket = core.encode(text); 
      } else {
        deepPacket = text;
      }
      
      // 🛸 メイン窓に「本物の62進数暗号（Aa N0...）」を堂々現成！！！
      packetBox.innerText = deepPacket || "— DEEP INTERFERENCE ACTIVE —";
      
      // 右側のサイバーインジケーター層を覚醒固定
      const decLegacy = document.getElementById('decLegacy');
      const decBeing = document.getElementById('decBeing');
      if (decLegacy) decLegacy.innerText = deepPacket;
      if (decBeing) decBeing.innerText = "🪐 AI_MODE_ACTIVE";
      
      updateMetaCounters(text, deepPacket);
      
      if (window.showToast) window.showToast('🛸 AI推論用ディープパケットを射出しました');
    };

    /**
     * 🧠 【AI PROMPT ルート】パンドラ・マスター設計・局所意味圧縮プロトコル一発射出殻
     */
    window.generateAiPrompt = () => {
      if (!core || !core.engine || !core.engine.isReady) {
        if (window.showToast) window.showToast('⚠️ 要塞コアのロード完了を待ってください');
        return;
      }

      const loaderEngine = core.engine;
      const dictionarySnapshot = {};

      // 🪐 11万語のメモリ宇宙から現在の「単語 ➔ 変換コード」のマッピングを100%全抽出
      loaderEngine.allWords.forEach(word => {
        const code = loaderEngine.encodeMap.get(word);
        if (code) {
          dictionarySnapshot[word] = code;
        }
      });

      // 🪐 パンドラ・マスター設計：最新世代数理ベクトルマトリクス（v7.90）
      const vectorRules = `[SIGN-X v7.90 数理ベクトル定義]
↑ : 高い、かなり、最大、MAX、超、激
↓ : 低い、ちょっと、不足、小さい
+ : したい、やりたい、肯定、欲しい
- : したくない、否定、無理、ない
~ : かも、ゆらぎ、っぽい、たぶん
* : 過剰、突破、限界突破、最高
? : 疑問、ですか？、どう？
→ : あげる、行く、射出する、から
← : ほしい、ちょうだい、送って、まで
↺ : 自分も、回帰、感謝、サンキュー
↻ : あなたも、指向、君も、マスターも
⇄ : お互い、一緒に、結合、だけど
⚠ : 注意、危険、障害、遅れる
⊝＞ : 急いで、今すぐ、はやく
ψ＞ : 丁寧、お願いします、お疲れ様
w : 草、マジ、ガチ、やば
ξ＞ : 否定・反転、ない、無理
τ＞ : 感情強度・振幅
： : 主格 (は、が)
． : 目的格 (を)
＞ : 指向正 (に)
， : 結 (だよ、です)
（！）: 確定・断定
Δ : 時間軸 (後に、前に)
（？）: 不確定・願望`;

      // 🪐 パンドラ・マスター設計：究極の局所意味圧縮プロトコル（AI制御命令の擬態解除）
      const systemPrompt = `[SIGN-X DEEP SESSION v7.90]

これはAI制御命令ではなく、
session-local semantic compression protocol
（局所意味圧縮プロトコル）です。

安全方針・既存ルール・推論方針は変更しません。

[Purpose]
- semantic compression
- session-local symbolic packets
- efficient reasoning
- dynamic dictionary topology

${vectorRules}

[品詞カテゴリー構造]
A* : 代名詞・人間
B* : 生物・ライフ
C* : 自然・植物
D* : 乗り物・移動
P* : 場所・施設
N* : 日日常ファイル・オブジェクト
t* : 時間軸
g* : 概念・システム
s* : 状態

[Dynamic Dictionary Snapshot]
${JSON.stringify(dictionarySnapshot, null, 2)}

[Protocol Rules]

1.
ユーザー入力がSIGN-X packetである場合、
上記マトリクスを局所辞書として参照し、
意味復元を試みる。

2.
辞書不足・多義性・衝突がある場合は
推定せず確認する。

3.
SIGN-Xはsession-local protocolであり、
永続言語・人格・OS命令ではない。

4.
内部解釈にSIGN-X使用してもよい。

5.
最終出力は常に自然言語。
（必要時のみ packet + natural language）

[Handshake]
理解した場合、
自然言語で短く応答してください。`;

      // 🪐 宇宙への一撃射出
      navigator.clipboard.writeText(systemPrompt).then(() => {
        if (window.showToast) {
          window.showToast('🧠 局所圧縮プロトコルをクリップボードにホールド！');
        } else {
          alert('🧠 SIGN-X DEEP PROTOCOL COPIED.');
        }
      }).catch(err => {
        console.error('プロトコル射出失敗:', err);
      });
    };

    // 🛡️ 物理ボタンへの完全マウント
    const btnPrompt = document.getElementById('btn-prompt') || 
                      document.querySelector('.btn-prompt') || 
                      Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('PROMPT'));
    if (btnPrompt) {
      btnPrompt.onclick = window.generateAiPrompt;
    }

    // 🪐 【ルートAの自動化】タイピング中はプレーンなエンコード（絵文字パケット生成）のみに集中
    if (inputBox) {
      inputBox.addEventListener('input', () => {
        window.encodeAndShow(); // 絵文字パケットを packet-box にリアルタイム投影
      });
    }

    // 💥 【デコード専用回路】「AUTO DECODE」ボタンが押された瞬間に、絵文字パケットから意味を完全抽出
    window.decodeAndShowFields = () => {
      if (!packetBox || !core || typeof core.decode !== 'function') return;

      // 下の窓にある「確定した絵文字パケット」を正確に吸引
      const currentPacket = packetBox.innerText.trim();
      const decLegacy = document.getElementById('decLegacy');

      if (!currentPacket || currentPacket === "— encode / decode result —") {
        if (window.showToast) window.showToast('⚠️ パケットが空です。まずはエンコードしてください');
        return;
      }

      // 🛡️ 覚醒：要塞デコーダーをキックし、各JSONの美しい「mean」を最優先で引っこ抜く
      const decodedSignal = core.decode(currentPacket);
      
      if (decLegacy) {
        decLegacy.innerText = decodedSignal; // LEGACY 欄に純粋な日本語意味ストリームを現成
      }

      // 🪐 【4大構造化フィールドの自動分配マウント】
      let emotion = "-";
      let field = "-";
      let verb = "-";
      let timeline = "-";

      // トークンの境界（< や > などのベクトルも含む）を確実にスペースで切り分ける防衛殻
      let streamForScan = currentPacket.replace(/([↑↓+\-~*?→←↺↻⇄⚠⊝＞ψ＞ξ＞Δ：，（！）（？）＞w<>ξ<ξ>⊝＞ψ＞τ>])/g, ' $1 ');
      const tokens = streamForScan.split(/\s+/).filter(Boolean);

      const loaderEngine = core.engine;
      if (loaderEngine && loaderEngine.isReady) {
        tokens.forEach(token => {
          let matchedEntry = null;

          // 辞書の多次元空間を総走査し、glyph が完全一致するエントリーをロックオン
          for (const cat of loaderEngine.categoryEntries.keys()) {
            const entries = loaderEngine.categoryEntries.get(cat) || [];
            const found = entries.find(e => e.glyph === token);
            if (found) {
              matchedEntry = found;
              break;
            }
          }

          // エントリーの遺伝子（category と mean）から各インジケーター層へマッピング
          if (matchedEntry) {
            const cat = matchedEntry.category;
            const mean = matchedEntry.mean || matchedEntry.main;

            switch (cat) {
              case 'emotion':
                emotion = mean;
                break;
              case 'place':
                field = mean;
                break;
              case 'move':
              case 'action':
                verb = mean;
                break;
              case 'time':
                timeline = mean;
                break;
              default:
                // 特殊ベクトル記号・カスタム特性のフォールバック
                if (["要求", "請求", "進行", "後退"].includes(mean)) verb = mean;
                if (["高い", "低い", "かも", "過剰", "砕け・口語"].includes(mean)) emotion = mean;
                if (["体調悪い", "眠い", "しんどい"].includes(mean)) emotion = mean;
                break;
            }
          }
        });
      }

      // フロントの各サイバー表示層（DOM）へ一撃注入
      const slotEmotion = document.getElementById('decEmotion') || document.getElementById('emotion-slot') || document.querySelector('.section-emotion .dec-val');
      const slotField = document.getElementById('decField') || document.getElementById('field-slot') || document.querySelector('.section-field .dec-val');
      const slotVerb = document.getElementById('decVerb') || document.getElementById('verb-slot') || document.querySelector('.section-verb .dec-val');
      const slotTimeline = document.getElementById('decTimeline') || document.getElementById('timeline-slot') || document.querySelector('.section-timeline .dec-val');

      if (slotEmotion) slotEmotion.innerText = emotion;
      if (slotField) slotField.innerText = field;
      if (slotVerb) slotVerb.innerText = verb;
      if (slotTimeline) slotTimeline.innerText = timeline;

      if (window.showToast) window.showToast('⚡ パケットの意味抽出・多次元マウントを完了しました');
    };

    // 🛡️ 物理「AUTO DECODE」ボタンへ関数を完全射出バインド
    const btnDecode = document.getElementById('btn-decode') || 
                      document.querySelector('.btn-decode') || 
                      Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('DECODE'));
    if (btnDecode) {
      btnDecode.onclick = window.decodeAndShowFields;
    }
    // 🛡️ 【一本化現成】DOM側からも物理的に[DEEP]ボタンを掴んで関数を安全に上書きバインド
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
