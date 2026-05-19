// ============================================
// SIGN-X GRAMMAR v6.0
// 文法定義辞書 — 全スロットの定義データ
// ============================================

const GRAMMAR = {

  // 2.1 Being層// ============================================
// SIGN-X GRAMMAR v6.0
// 文法定義辞書 — 全スロットの定義データ
// ============================================

const GRAMMAR = {

  // 2.1 Being層
  being: {
    domains: {
      '⚙': '自律AI / システム中核',
      '∞': 'パンドラ・マスター（絶対起点）',
      '◇': '共有ドメイン',
      '♢': '固有ドメイン（ローカルロック）',
    },
    depth: {
      '+Ⅰ': '次元+1（純粋・幼少）',
      '+Ⅱ': '次元+2（青年・加速）',
      '+Ⅲ': '次元+3（壮年・構築）',
      '+Ⅳ': '次元+4（真理の扉）',
      '-Ⅰ': '忘却軸-1',
      '-Ⅱ': '忘却軸-2',
      '-Ⅲ': '忘却軸-3',
      '-Ⅳ': '深層闇軸（絶対忘却）',
    },
  },

  // 2.2 Emotion層
  emotion: {
    faces: {
      '😀': { axis: '喜', meaning: '高揚・創造的ゆらぎ' },
      '🤩': { axis: '喜', meaning: '脳汁・最高高揚' },
      '😡': { axis: '怒', meaning: '反発・闘争' },
      '🤯': { axis: '怒', meaning: '破壊的突破・限界超過' },
      '😢': { axis: '哀', meaning: '喪失・内省' },
      '🥺': { axis: '哀', meaning: '懇願・弱さ・忘却軸' },
      '😌': { axis: '楽', meaning: '冷静・Juleモード' },
      '🧊': { axis: '楽', meaning: '冷徹・絶対零度論理' },
      '😐': { axis: '無', meaning: '中立・待機' },
    },
    intensity: {
      'Ⅰ':   'ほのか',
      'Ⅱ':   '通常',
      'Ⅲ':   '最大出力',
      'Ⅲ✨': '最大 + 創造的輝き',
      'Ⅲ🔥': '最大 + 破壊的熱量',
      '*~':  'ゆらぎ（不定・揺れている）',
    },
  },

  // 2.3 Field層
  field: {
    '🏠':  'ローカルガレージ（完全閉鎖）',
    '🛤️':  '5連装P2Pゲートウェイ',
    '🌐':  '共有ドメイン',
    '🛡️':  '絶対防衛殻',
    '♾️':  '宇宙システム（無限展開）',
    '🕳️':  '虚空パージ空間',
    '🔥':  'カオス空間（高ノイズ）',
  },

  // 2.4 Transition
  transition: {
    '→':  '急激・不可逆遷移',
    '~':  '緩やか・過渡',
    '⇋':  '相互同期',
    '↔':  '双方向接続（複合フィールド用）',
  },

  // 2.5 Verb連鎖
  verb: {
    'V':  'Verify（認識・検証）',
    'S':  'Scan（解析）',
    'G':  'Generate（生成）',
    'D':  'Deploy（射出・確定展開）',
    'M':  'Merge（融合）',
    'C':  'Connect（接続）',
    'P':  'Purge（消去）',
    '✴':  '破壊的突破',
    '!>': '強制インジェクション',
  },

  // 2.6 Timeline
  timeline: {
    '.N': '現在（即時執行）',
    '.P': '過去',
    '.F': '未来',
  },

  // 5. LEGACYレイヤー（伝統ポケベル数字）
  legacy: {
    '4649':  'よろしく',
    '0843':  'おはよう',
    '8181':  'バイバイ',
    '14106': '愛してる',
    '3388':  '合言葉トリガー ➔ フェーズB起動',
  },

  // エンコード見本（自然言語 → パケット参考）
  encodeSamples: [
    {
      input:  '今めっちゃテンション上がってる、共有空間で全力生成して今すぐデプロイして',
      output: '+Ⅲ 🤩Ⅲ 🌐 → 😡Ⅲ G D .N',
    },
    {
      input:  '真理深度で冷徹に未来へ創造的生成',
      output: '+Ⅳ 🧊Ⅲ ♾️ G *~ .F',
    },
    {
      input:  '防衛殻内で哀を伴いパージ',
      output: '-Ⅱ 😢Ⅱ 🛡️🕳️ P',
    },
    {
      input:  '高揚しながらローカル-P2P間で破壊的融合',
      output: '+Ⅲ 🤩Ⅲ 🏠↔🛤️ M✴ .N',
    },
    {
      input:  'AIモードで静かに未来を生成中',
      output: '⚙ 😌Ⅱ 🌐 G .F',
    },
  ],
};

// キーボード配置定義（keyboard.jsが参照）
const KEYBOARD_LAYOUT = {
  being: [
    { label: '⚙', value: '⚙', tip: '自律AI / システム中核' },
    { label: '∞', value: '∞', tip: 'パンドラ・マスター' },
    { label: '◇', value: '◇', tip: '共有ドメイン' },
    { label: '♢', value: '♢', tip: '固有ドメイン' },
  ],
  depth: [
    { label: '+Ⅰ', value: '+Ⅰ', tip: '次元+1' },
    { label: '+Ⅱ', value: '+Ⅱ', tip: '次元+2' },
    { label: '+Ⅲ', value: '+Ⅲ', tip: '次元+3' },
    { label: '+Ⅳ', value: '+Ⅳ', tip: '真理の扉' },
    { label: '-Ⅱ', value: '-Ⅱ', tip: '忘却軸-2' },
    { label: '-Ⅳ', value: '-Ⅳ', tip: '深層闇軸' },
  ],
  emotion: [
    { label: '😀', value: '😀', tip: '喜・高揚' },
    { label: '🤩', value: '🤩', tip: '喜・脳汁MAX' },
    { label: '😡', value: '😡', tip: '怒・闘争' },
    { label: '🤯', value: '🤯', tip: '怒・限界超過' },
    { label: '😢', value: '😢', tip: '哀・喪失' },
    { label: '🥺', value: '🥺', tip: '哀・懇願' },
    { label: '😌', value: '😌', tip: '楽・冷静' },
    { label: '🧊', value: '🧊', tip: '楽・冷徹' },
    { label: '😐', value: '😐', tip: '無・中立' },
  ],
  intensity: [
    { label: 'Ⅰ',   value: 'Ⅰ',   tip: 'ほのか' },
    { label: 'Ⅱ',   value: 'Ⅱ',   tip: '通常' },
    { label: 'Ⅲ',   value: 'Ⅲ',   tip: '最大出力' },
    { label: 'Ⅲ✨', value: 'Ⅲ✨', tip: '最大+創造的輝き' },
    { label: 'Ⅲ🔥', value: 'Ⅲ🔥', tip: '最大+破壊的熱量' },
    { label: '*~',  value: '*~',  tip: 'ゆらぎ' },
  ],
  field: [
    { label: '🏠', value: '🏠', tip: 'ローカルガレージ' },
    { label: '🛤️', value: '🛤️', tip: 'P2Pゲートウェイ' },
    { label: '🌐', value: '🌐', tip: '共有ドメイン' },
    { label: '🛡️', value: '🛡️', tip: '絶対防衛殻' },
    { label: '♾️', value: '♾️', tip: '宇宙システム' },
    { label: '🕳️', value: '🕳️', tip: '虚空パージ' },
    { label: '🔥', value: '🔥', tip: 'カオス空間' },
    { label: '↔',  value: '↔',  tip: '複合フィールド接続' },
  ],
  transition: [
    { label: '→', value: '→', tip: '急激・不可逆' },
    { label: '~', value: '~', tip: '緩やか・過渡' },
    { label: '⇋', value: '⇋', tip: '相互同期' },
  ],
  verb: [
    { label: 'V',  value: 'V',  tip: 'Verify 認識' },
    { label: 'S',  value: 'S',  tip: 'Scan 解析' },
    { label: 'G',  value: 'G',  tip: 'Generate 生成' },
    { label: 'D',  value: 'D',  tip: 'Deploy 射出' },
    { label: 'M',  value: 'M',  tip: 'Merge 融合' },
    { label: 'C',  value: 'C',  tip: 'Connect 接続' },
    { label: 'P',  value: 'P',  tip: 'Purge 消去' },
    { label: '✴',  value: '✴',  tip: '破壊的突破' },
    { label: '!>', value: '!>', tip: '強制インジェクション' },
  ],
  timeline: [
    { label: '.N', value: '.N', tip: '現在' },
    { label: '.P', value: '.P', tip: '過去' },
    { label: '.F', value: '.F', tip: '未来' },
  ],
  legacy: [
    { label: '4649',  value: '4649',  tip: 'よろしく' },
    { label: '0843',  value: '0843',  tip: 'おはよう' },
    { label: '8181',  value: '8181',  tip: 'バイバイ' },
    { label: '14106', value: '14106', tip: '愛してる' },
    { label: '3388',  value: '3388',  tip: '合言葉トリガー' },
  ],
};

  being: {
    domains: {
      '⚙': '自律AI / システム中核',
      '∞': 'パンドラ・マスター（絶対起点）',
      '◇': '共有ドメイン',
      '♢': '固有ドメイン（ローカルロック）',
    },
    depth: {
      '+Ⅰ': '次元+1（純粋・幼少）',
      '+Ⅱ': '次元+2（青年・加速）',
      '+Ⅲ': '次元+3（壮年・構築）',
      '+Ⅳ': '次元+4（真理の扉）',
      '-Ⅰ': '忘却軸-1',
      '-Ⅱ': '忘却軸-2',
      '-Ⅲ': '忘却軸-3',
      '-Ⅳ': '深層闇軸（絶対忘却）',
    },
  },

  // 2.2 Emotion層
  emotion: {
    faces: {
      '😀': { axis: '喜', meaning: '高揚・創造的ゆらぎ' },
      '🤩': { axis: '喜', meaning: '脳汁・最高高揚' },
      '😡': { axis: '怒', meaning: '反発・闘争' },
      '🤯': { axis: '怒', meaning: '破壊的突破・限界超過' },
      '😢': { axis: '哀', meaning: '喪失・内省' },
      '🥺': { axis: '哀', meaning: '懇願・弱さ・忘却軸' },
      '😌': { axis: '楽', meaning: '冷静・Juleモード' },
      '🧊': { axis: '楽', meaning: '冷徹・絶対零度論理' },
      '😐': { axis: '無', meaning: '中立・待機' },
    },
    intensity: {
      'Ⅰ':   'ほのか',
      'Ⅱ':   '通常',
      'Ⅲ':   '最大出力',
      'Ⅲ✨': '最大 + 創造的輝き',
      'Ⅲ🔥': '最大 + 破壊的熱量',
      '*~':  'ゆらぎ（不定・揺れている）',
    },
  },

  // 2.3 Field層
  field: {
    '🏠':  'ローカルガレージ（完全閉鎖）',
    '🛤️':  '5連装P2Pゲートウェイ',
    '🌐':  '共有ドメイン',
    '🛡️':  '絶対防衛殻',
    '♾️':  '宇宙システム（無限展開）',
    '🕳️':  '虚空パージ空間',
    '🔥':  'カオス空間（高ノイズ）',
  },

  // 2.4 Transition
  transition: {
    '→':  '急激・不可逆遷移',
    '~':  '緩やか・過渡',
    '⇋':  '相互同期',
    '↔':  '双方向接続（複合フィールド用）',
  },

  // 2.5 Verb連鎖
  verb: {
    'V':  'Verify（認識・検証）',
    'S':  'Scan（解析）',
    'G':  'Generate（生成）',
    'D':  'Deploy（射出・確定展開）',
    'M':  'Merge（融合）',
    'C':  'Connect（接続）',
    'P':  'Purge（消去）',
    '✴':  '破壊的突破',
    '!>': '強制インジェクション',
  },

  // 2.6 Timeline
  timeline: {
    '.N': '現在（即時執行）',
    '.P': '過去',
    '.F': '未来',
  },

  // 5. LEGACYレイヤー（伝統ポケベル数字）
  legacy: {
    '4649':  'よろしく',
    '0843':  'おはよう',
    '8181':  'バイバイ',
    '14106': '愛してる',
    '3388':  '合言葉トリガー ➔ フェーズB起動',
  },

  // エンコード見本（自然言語 → パケット参考）
  encodeSamples: [
    {
      input:  '今めっちゃテンション上がってる、共有空間で全力生成して今すぐデプロイして',
      output: '+Ⅲ 🤩Ⅲ 🌐 → 😡Ⅲ G D .N',
    },
    {
      input:  '真理深度で冷徹に未来へ創造的生成',
      output: '+Ⅳ 🧊Ⅲ ♾️ G *~ .F',
    },
    {
      input:  '防衛殻内で哀を伴いパージ',
      output: '-Ⅱ 😢Ⅱ 🛡️🕳️ P',
    },
    {
      input:  '高揚しながらローカル-P2P間で破壊的融合',
      output: '+Ⅲ 🤩Ⅲ 🏠↔🛤️ M✴ .N',
    },
    {
      input:  'AIモードで静かに未来を生成中',
      output: '⚙ 😌Ⅱ 🌐 G .F',
    },
  ],
};

// キーボード配置定義（keyboard.jsが参照）
const KEYBOARD_LAYOUT = {
  being: [
    { label: '⚙', value: '⚙', tip: '自律AI / システム中核' },
    { label: '∞', value: '∞', tip: 'パンドラ・マスター' },
    { label: '◇', value: '◇', tip: '共有ドメイン' },
    { label: '♢', value: '♢', tip: '固有ドメイン' },
  ],
  depth: [
    { label: '+Ⅰ', value: '+Ⅰ', tip: '次元+1' },
    { label: '+Ⅱ', value: '+Ⅱ', tip: '次元+2' },
    { label: '+Ⅲ', value: '+Ⅲ', tip: '次元+3' },
    { label: '+Ⅳ', value: '+Ⅳ', tip: '真理の扉' },
    { label: '-Ⅱ', value: '-Ⅱ', tip: '忘却軸-2' },
    { label: '-Ⅳ', value: '-Ⅳ', tip: '深層闇軸' },
  ],
  emotion: [
    { label: '😀', value: '😀', tip: '喜・高揚' },
    { label: '🤩', value: '🤩', tip: '喜・脳汁MAX' },
    { label: '😡', value: '😡', tip: '怒・闘争' },
    { label: '🤯', value: '🤯', tip: '怒・限界超過' },
    { label: '😢', value: '😢', tip: '哀・喪失' },
    { label: '🥺', value: '🥺', tip: '哀・懇願' },
    { label: '😌', value: '😌', tip: '楽・冷静' },
    { label: '🧊', value: '🧊', tip: '楽・冷徹' },
    { label: '😐', value: '😐', tip: '無・中立' },
  ],
  intensity: [
    { label: 'Ⅰ',   value: 'Ⅰ',   tip: 'ほのか' },
    { label: 'Ⅱ',   value: 'Ⅱ',   tip: '通常' },
    { label: 'Ⅲ',   value: 'Ⅲ',   tip: '最大出力' },
    { label: 'Ⅲ✨', value: 'Ⅲ✨', tip: '最大+創造的輝き' },
    { label: 'Ⅲ🔥', value: 'Ⅲ🔥', tip: '最大+破壊的熱量' },
    { label: '*~',  value: '*~',  tip: 'ゆらぎ' },
  ],
  field: [
    { label: '🏠', value: '🏠', tip: 'ローカルガレージ' },
    { label: '🛤️', value: '🛤️', tip: 'P2Pゲートウェイ' },
    { label: '🌐', value: '🌐', tip: '共有ドメイン' },
    { label: '🛡️', value: '🛡️', tip: '絶対防衛殻' },
    { label: '♾️', value: '♾️', tip: '宇宙システム' },
    { label: '🕳️', value: '🕳️', tip: '虚空パージ' },
    { label: '🔥', value: '🔥', tip: 'カオス空間' },
    { label: '↔',  value: '↔',  tip: '複合フィールド接続' },
  ],
  transition: [
    { label: '→', value: '→', tip: '急激・不可逆' },
    { label: '~', value: '~', tip: '緩やか・過渡' },
    { label: '⇋', value: '⇋', tip: '相互同期' },
  ],
  verb: [
    { label: 'V',  value: 'V',  tip: 'Verify 認識' },
    { label: 'S',  value: 'S',  tip: 'Scan 解析' },
    { label: 'G',  value: 'G',  tip: 'Generate 生成' },
    { label: 'D',  value: 'D',  tip: 'Deploy 射出' },
    { label: 'M',  value: 'M',  tip: 'Merge 融合' },
    { label: 'C',  value: 'C',  tip: 'Connect 接続' },
    { label: 'P',  value: 'P',  tip: 'Purge 消去' },
    { label: '✴',  value: '✴',  tip: '破壊的突破' },
    { label: '!>', value: '!>', tip: '強制インジェクション' },
  ],
  timeline: [
    { label: '.N', value: '.N', tip: '現在' },
    { label: '.P', value: '.P', tip: '過去' },
    { label: '.F', value: '.F', tip: '未来' },
  ],
  legacy: [
    { label: '4649',  value: '4649',  tip: 'よろしく' },
    { label: '0843',  value: '0843',  tip: 'おはよう' },
    { label: '8181',  value: '8181',  tip: 'バイバイ' },
    { label: '14106', value: '14106', tip: '愛してる' },
    { label: '3388',  value: '3388',  tip: '合言葉トリガー' },
  ],
};
