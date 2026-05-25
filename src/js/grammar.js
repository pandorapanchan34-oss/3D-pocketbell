// =================================================================
// SIGN-X GRAMMAR v7.10 (CORE MAXIMUM - SYSTEM OPERATIONAL EDITION)
// 記号（単語）＋ 7大常用矢印 ＋ システムコマンド完全収束定義
// =================================================================

const GRAMMAR = {
  // ── 7大常用矢印（多次元変調ベクトル） ──
  vectors: {
    '↑': '【上昇・極大】最大バースト / 欲求増幅',
    '↓': '【減衰・極小】ほのかなニュアンス / 抑制',
    '→': '【能動・射出】こちらから相手へデプロイ / 未来宣言',
    '←': '【受動・吸引】相手からこちらへ要求 / 過去履歴',
    '↺': '【自己回帰】相手への同意 / 私も',
    '↻': '【相手指向】相手への同期確認 / あなたも？',
    '⇄': '【相互平衡】完全結合状態 / 両思い'
  },

  // ── 2.1 Being層 ──
  being: {
    domains: {
      '∞_1':  'パンドラ・マスター（絶対起点）',
      '∞_12': '人称・女性（彼女 / 女）',
      '⚙_13': '自律AI（ぱんちゃん / システム）'
    }
  },

  // ── 2.2 Emotion/Field コア記号（3d-coreと完全リンク） ──
  core_glyphs: {
    '😍': '好き', '❤️': '愛してる', '👍': 'えらい', '😀': '元気/嬉しい', '😋': 'おいしい',
    '😢': '悲しい/疲れた', '🥺': '寂しい/不安', '😌': '冷静/眠い', '🏠': '家/ガレージ',
    '🛤️': '移動/ルート', '🏢': '仕事/会社', '☕': 'カフェ/コーヒー', '🍚': 'ご飯', '🍽️': 'お腹',
    '😢⇄': 'よしよし', '✋': '待って'
  },

  // ── 2.5 System Commands（新設・システム制御制御層） ──
  system_commands: {
    'V': '【Verify】認識・検証・了解',
    'S': '【Scan】解析・スキャン',
    'G': '【Generate】生成・プロンプト装填',
    'D': '【Deploy】射出・確定展開',
    'M': '【Merge】融合・閉鎖系同期',
    'C': '【Connect】接続・通信ゲート解放',
    'P': '【Purge】消去・ノイズ融解',
    '✴': '【破壊的突破】強制インジェクション'
  },

  // ── 2.6 Timeline ──
  timeline: {
    '.N': '現在（即時執行）',
    '.P': '過去（履歴）',
    '.F': '未来（予測）'
  },

  // ── 5. LEGACYレイヤー ──
  legacy: {
    '4649': 'よろしく', '0843': 'おはよう', '5963': 'お疲れ様'
  }
};

// 💡 物理キーボードレイアウト（衝突をパージし、最高峰のサイバーコンソール化！）
const KEYBOARD_LAYOUT = {
  vectors: [
    { label: '↑', value: '↑', tip: '極大・バースト' },
    { label: '↓', value: '↓', tip: '極小・ほのか' },
    { label: '→', value: '→', tip: '能動・射出' },
    { label: '←', value: '←', tip: '受動・吸引要求' },
    { label: '↺', value: '↺', tip: '自己回帰（私も）' },
    { label: '↻', value: '↻', tip: '相手指向（あなたも？）' },
    { label: '⇄', value: '⇄', tip: '相互平衡（両思い）' }
  ],
  being: [
    { label: '俺/私', value: '∞_1', tip: 'マスター' },
    { label: '彼女', value: '∞_12', tip: '女性人称' },
    { label: 'ぱんちゃん', value: '⚙_13', tip: '自律AI' }
  ],
  glyphs: [
    { label: '😍 好き', value: '😍', tip: '好き' },
    { label: '❤️ 愛', value: '❤️', tip: '愛してる' },
    { label: '👍 えらい', value: '👍', tip: 'えらい' },
    { label: '😀 元気', value: '😀', tip: '元気/嬉しい' },
    { label: '😋 旨', value: '😋', tip: 'おいしい' },
    { label: '😢 疲/哀', value: '😢', tip: '疲れた/悲しい' },
    { label: '🥺 寂/不', value: '🥺', tip: '寂しい/不安' },
    { label: '😌 眠/冷', value: '😌', tip: '眠い/冷静' },
    { label: '🏠 家', value: '🏠', tip: '家/ガレージ' },
    { label: '🛤️ 移', value: '🛤️', tip: '移動/ルート' },
    { label: '🏢 職', value: '🏢', tip: '仕事/会社' },
    { label: '☕ ｶﾌｪ', value: '☕', tip: 'カフェ/コーヒー' },
    { label: '🍚 飯', value: '🍚', tip: 'ご飯' },
    { label: '🍽️ 腹', value: '🍽️', tip: 'お腹' },
    { label: '😢⇄ 撫', value: '😢⇄', tip: 'よしよし（僕も寂しい）' },
    { label: '✋ 待', value: '✋', tip: '待って' }
  ],
  sys_commands: [
    { label: 'V 検証', value: 'V', tip: 'Verify: 認識・検証・了解' },
    { label: 'S 解析', value: 'S', tip: 'Scan: 解析' },
    { label: 'G 生成', value: 'G', tip: 'Generate: 生成' },
    { label: 'D 射出', value: 'D', tip: 'Deploy: 射出・確定展開' },
    { label: 'M 融合', value: 'M', tip: 'Merge: 融合' },
    { label: 'C 接続', value: 'C', tip: 'Connect: 接続' },
    { label: 'P 消去', value: 'P', tip: 'Purge: 消去' },
    { label: '✴ 突破', value: '✴', tip: '破壊的突破・強制インジェクション' }
  ],
  timeline: [
    { label: '.N 現在', value: '.N', tip: '現在（省略可）' },
    { label: '.P 過去', value: '.P', tip: '過去履歴' },
    { label: '.F 未来', value: '.F', tip: '未来予測' }
  ],
  legacy: [
    { label: '4649', value: '4649', tip: 'よろしく' },
    { label: '0843', value: '0843', tip: 'おはよう' },
    { label: '5963', value: '5963', tip: 'お疲れ様' }
  ]
};

window.GRAMMAR = GRAMMAR;
window.KEYBOARD_LAYOUT = KEYBOARD_LAYOUT;
