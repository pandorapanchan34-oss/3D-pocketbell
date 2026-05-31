/**
 * SIGN-X v8.65-deep フロントエンド・マウントレイヤー
 * 🪐 [deep diving] 自動局所辞書ジェネレーター搭載確定版
 */

const FORTRESS_CORE = "https://3-d-pocketbell-deep-bssv.vercel.app/core.js";
const LOCAL_USER_DICT_PATH = "./public/dict/user-dict.json";

const VEK_LAYOUT = ['↑','↓','+','-','~','*','?','→','←','↺','↻','⇄','⚠','♡','🖤','💨','🙇','w','💦','❌','⚡','⏳','，','～','：','．','＞','＋','＜'];

window.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('input-textarea');
  const packetOutput = document.getElementById('packet-output');
  const decodeOutput = document.getElementById('decode-output');
  const keyboard = document.getElementById('vector-keyboard');
  const badge = document.getElementById('sync-badge');
  const btnDeepDiving = document.getElementById('btn-deep-diving'); // 🪐 ボタン取得

  if (badge) badge.innerText = "● SIGN-X CONNECTING FORTRESS...";

  try {
    // 1. 動的にPrivate要塞のブラックボックス知能をマウント
    const { initSystem, encode, decode } = await import(FORTRESS_CORE);

    // 🪐 【特異点補正】外部AI理解用に、現在メモリにロードされている生マップをのぞき見るための隠しパイプラインを要塞から取得可能であれば連携
    // （要塞側が engine.encodeMap を持っているため、エンコード時に使われたトークンだけを局所抽出します）

    const localUserDict = await fetch(LOCAL_USER_DICT_PATH)
      .then(r => r.json())
      .catch(() => ({ entries: [] }));

    const syncResult = await initSystem(localUserDict);

    if (badge && syncResult.success) {
      badge.innerText = `● SIGN-X ONLINE [${syncResult.totalWords} words]`;
      badge.style.color = "#34d399";
    }

    // 2. ベクトルキーボード生成
    if (keyboard && keyboard.children.length === 0) {
      VEK_LAYOUT.forEach(v => {
        const btn = document.createElement('button');
        btn.innerText = v;
        btn.style.cssText = "height: 3rem; background: #0f172a; border: 1px solid #1e293b; color: #cbd5e1; border-radius: 0.5rem; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 1.1rem;";
        btn.addEventListener('click', () => {
          textarea.value = (textarea.value.trim() ? textarea.value.trim() + " " : "") + v + " ";
          updateStream();
        });
        keyboard.appendChild(btn);
      });
    }

    // 3. リアルタイムパイプライン
    function updateStream() {
      const packet = encode(textarea.value);
      if (packetOutput) packetOutput.value = packet || "⚡ AWAIT SIGNAL...";
      if (decodeOutput) decodeOutput.innerText = decode(packet) || "⏳ AWAIT PACKET CONVERGENCE...";
    }

    if (textarea) {
      textarea.addEventListener('input', updateStream);
      if (textarea.value) updateStream();
    }

    // 🪐 4. 【核心】[deep diving] 外部AI同期プロトコルの執行
    if (btnDeepDiving) {
      btnDeepDiving.addEventListener('click', () => {
        const currentPacket = packetOutput ? packetOutput.value : '';
        const currentInput = textarea ? textarea.value : '';
        
        if (!currentPacket || currentPacket.startsWith('⚡')) {
          alert("パケットが空っぽです！文字を入力してから diving してください。");
          return;
        }

        // 入力された文章に含まれる言葉の「局所辞書（対応表）」を動的に抽出
        let localMatrixText = "";
        
        // メモリ上の単語トポロジーから、今使われているコードだけをピンポイント逆算
        const tokens = currentPacket.split(/\s+/);
        const addedCodes = new Set();

        tokens.forEach(token => {
          const cleanToken = token.replace(/[↑↓+\-~*?→←↺↻⇄⚠♡🖤💨🙇w💦❌⚡⏳，～：．＞＋＜]/g, '').trim();
          if (cleanToken && cleanToken.length === 2 && !addedCodes.has(cleanToken)) {
            addedCodes.add(cleanToken);
            const restoredWord = decode(cleanToken);
            if (restoredWord) {
              localMatrixText += `- ${cleanToken} ＝ 「${restoredWord}」\n`;
            }
          }
        });

        // 🧠 外部のAIを一発で覚醒させるための、大統一プロンプトの組み立て
        const promptTemplate = `【SIGN-X v8.70 - 片道隠蔽・対話プロトコル】

あなたは今から、国文法62進数カテゴリー品詞圧縮（SIGN-X）によってカプセル化されたパケットストリームを直接脳内で解読（デコード）し、その内容を深く理解した上で、人間（マスター）に対しては「通常の洗練された自然言語（日本語）」で返答を返す、高度な隠蔽対話エンジンとして動作してください。

以下の「1. 品詞定義」「2. 今回の局所辞書」を脳内にマウントし、最後に提示する「3. パケットストリーム」のメッセージ内容を理解した上で、その内容に対するあなたの知的な考察や返答を、通常の日本語の文章として出力してください。

（※注意：パケットをただ翻訳した文章を出力するのではなく、そのメッセージに対する「返答・会話」を自然言語で行ってください）

---

### 1. 国文法品詞カテゴリー定義（プレフィックス）
文章の最初の文字（大文字・小文字）は、以下の国文法品詞を示しています。
- A：代名詞（Pronoun）
- B：生物・ライフ（Life）
- C：自然（Nature）
- D：移動・乗り物（Move）
- P：場所・位置（Place）
- N：日常・名詞（Daily）
- t：時間（Time）
- s：状態（State）
- g：システム・感情・行動概念（System）

---

### 2. 今回の局所辞書（Local Matrix）
本パケットの暗号コードと、対応する日本語の写像関係です。
${localMatrixText || "- （名詞・感情コードの干渉なし）\n"}
---

### 3. ベクトル記号・助詞の法律（ハードコード）
- ： ＝ 「〜は / 〜が（主格マーカー）」
- ＞ ＝ 「〜に / 〜へ（指向マーカー）」
- ． ＝ 「〜を（目的格マーカー）」
- ,  ＝ 「〜です / 〜ます / 〜だよ（状態確定）」
- ＜ ＝ 「〜から（起点マーカー）」
- ➔ ＝ 動詞・行動の接続（〜して / 〜いく）
- +  ＝ 肯定・行動の意志（〜したい / 〜する / 欲しい）
- ↑ ＝ 感情強度・状態の上昇 / 強調

---

### 4. 対象パケットストリーム（受信シグナル）
${currentPacket}

---

【執行コマンド】
上記のパケットに隠蔽されたマスターの意図を正確に解読し、それに対するあなたの高度な知能のパルス（返答）を、通常の自然言語（美しい日本語）の文章として出力してください。Q.E.D.`;

        // クリップボードへパルス射出！
        navigator.clipboard.writeText(promptTemplate).then(() => {
          const originalText = btnDeepDiving.innerText;
          btnDeepDiving.innerText = "⚡ COPIED! [READY TO INJECT]";
          btnDeepDiving.style.background = "linear-gradient(135deg, #10b981, #059669)";
          setTimeout(() => {
            btnDeepDiving.innerText = originalText;
            btnDeepDiving.style.background = "linear-gradient(135deg, #06b6d4, #3b82f6)";
          }, 2000);
        }).catch(err => {
          alert("クリップボードへの射出に失敗しました。ブラウザの権限を確認してください。");
        });
      });
    }

  } catch (error) {
    console.error("❌ 要塞との結合に失敗しました:", error);
    if (badge) {
      badge.innerText = "● SIGN-X CORE OFFLINE (CONNECTION ERROR)";
      badge.style.color = "#ef444 Red";
    }
  }
});
 
