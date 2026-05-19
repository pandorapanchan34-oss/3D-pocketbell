// ============================================
// SIGN-X PARSER ENGINE v6.0
// 語順: [Being] [Emotion] [Field] [Transition] [Emotion'] [Verb連鎖] [Timeline]
// ============================================

const Parser = (() => {

  // パース結果の空テンプレ
  function emptyResult() {
    return {
      being:       { domain: null, depth: null },
      emotion:     { face: null, intensity: null },
      field:       [],
      transition:  null,
      emotion2:    { face: null, intensity: null }, // 遷移後感情
      verbs:       [],
      timeline:    null,
      legacy:      null,
    };
  }

  // ============================================
  // メインパース関数
  // ============================================
  function parse(input) {
    const result = emptyResult();
    if (!input || !input.trim()) return result;

    let code = input.trim();

    // --- LEGACYレイヤー（伝統ポケベル数字）---
    for (const [num, meaning] of Object.entries(GRAMMAR.legacy)) {
      if (code.includes(num)) {
        result.legacy = { num, meaning };
        break;
      }
    }

    // --- Being層: ドメイン ---
    for (const symbol of Object.keys(GRAMMAR.being.domains)) {
      if (code.includes(symbol)) {
        result.being.domain = symbol;
        break;
      }
    }

    // --- Being層: 深度 (+Ⅰ〜+Ⅳ / -Ⅰ〜-Ⅳ) ---
    const depthMatch = code.match(/[+-][ⅠⅡⅢⅣ]/u);
    if (depthMatch) result.being.depth = depthMatch[0];

    // --- Emotion層: 顔絵文字 + 強度 ---
    // 語順: 先に来た顔絵文字 = emotion、Transition後 = emotion2
    const transitionIdx = findTransitionIndex(code);
    const beforeTransition = transitionIdx >= 0 ? code.slice(0, transitionIdx) : code;
    const afterTransition  = transitionIdx >= 0 ? code.slice(transitionIdx)    : '';

    const em1 = extractEmotion(beforeTransition);
    if (em1) { result.emotion.face = em1.face; result.emotion.intensity = em1.intensity; }

    // --- Transition ---
    for (const sym of Object.keys(GRAMMAR.transition)) {
      if (code.includes(sym)) { result.transition = sym; break; }
    }

    // --- Emotion': 遷移後感情 ---
    if (afterTransition) {
      const em2 = extractEmotion(afterTransition);
      if (em2) { result.emotion2.face = em2.face; result.emotion2.intensity = em2.intensity; }
    }

    // --- Field層 ---
    for (const symbol of Object.keys(GRAMMAR.field)) {
      if (code.includes(symbol)) result.field.push(symbol);
    }

    // --- Verb連鎖 ---
    // 単一文字動詞は誤マッチしやすいので順番注意
    const verbRegex = /(!>|✴|[VSGDMCP])/g;
    const verbMatches = [...code.matchAll(verbRegex)];
    verbMatches.forEach(m => {
      if (!result.verbs.includes(m[0])) result.verbs.push(m[0]);
    });

    // --- Timeline ---
    const tlMatch = code.match(/\.(N|P|F)/);
    if (tlMatch) result.timeline = '.' + tlMatch[1];

    return result;
  }

  // ============================================
  // 顔絵文字 + 強度を抽出するヘルパー
  // ============================================
  function extractEmotion(str) {
    const faces = Object.keys(GRAMMAR.emotion.faces);
    for (const face of faces) {
      if (str.includes(face)) {
        // 強度修飾子を探す（Ⅲ✨ > Ⅲ🔥 > Ⅲ > Ⅱ > Ⅰ > *~ の順で優先）
        let intensity = null;
        if (str.includes('Ⅲ✨')) intensity = 'Ⅲ✨';
        else if (str.includes('Ⅲ🔥')) intensity = 'Ⅲ🔥';
        else if (str.includes('Ⅲ')) intensity = 'Ⅲ';
        else if (str.includes('Ⅱ')) intensity = 'Ⅱ';
        else if (str.includes('Ⅰ')) intensity = 'Ⅰ';
        else if (str.includes('*~')) intensity = '*~';
        return { face, intensity };
      }
    }
    return null;
  }

  // ============================================
  // Transitionの位置を返すヘルパー
  // ============================================
  function findTransitionIndex(code) {
    // → を優先（~は誤マッチしやすいので後回し）
    const idx1 = code.indexOf('→');
    if (idx1 >= 0) return idx1 + 1; // →の後ろから
    const idx2 = code.indexOf('⇋');
    if (idx2 >= 0) return idx2 + 1;
    return -1;
  }

  // ============================================
  // デコード: パース結果 → 意味列挙オブジェクト
  // ============================================
  function decode(result) {
    const out = {};

    // Legacy
    if (result.legacy) {
      out.legacy = `【${result.legacy.num}】➔ ${result.legacy.meaning}`;
    }

    // Being
    const domainLabel = result.being.domain ? GRAMMAR.being.domains[result.being.domain] : null;
    const depthLabel  = result.being.depth  ? GRAMMAR.being.depth[result.being.depth]    : null;
    if (domainLabel || depthLabel) {
      out.being = [domainLabel, depthLabel].filter(Boolean).join(' / ');
    }

    // Emotion
    if (result.emotion.face) {
      const f = GRAMMAR.emotion.faces[result.emotion.face];
      const i = result.emotion.intensity ? GRAMMAR.emotion.intensity[result.emotion.intensity] : null;
      out.emotion = `${result.emotion.face} ${f.axis}・${f.meaning}${i ? `（${i}）` : ''}`;
    }

    // Field
    if (result.field.length > 0) {
      out.field = result.field.map(f => `${f} ${GRAMMAR.field[f]}`).join(' ↔ ');
    }

    // Transition
    if (result.transition) {
      out.transition = GRAMMAR.transition[result.transition];
    }

    // Emotion2（遷移後）
    if (result.emotion2.face) {
      const f = GRAMMAR.emotion.faces[result.emotion2.face];
      const i = result.emotion2.intensity ? GRAMMAR.emotion.intensity[result.emotion2.intensity] : null;
      out.emotion2 = `${result.emotion2.face} ${f.axis}・${f.meaning}${i ? `（${i}）` : ''}`;
    }

    // Verbs
    if (result.verbs.length > 0) {
      out.verbs = result.verbs.map(v => GRAMMAR.verb[v] || v).join(' → ');
    }

    // Timeline
    if (result.timeline) {
      out.timeline = GRAMMAR.timeline[result.timeline];
    }

    return out;
  }

  // ============================================
  // エンコード辞書（Greedy Replace方式）
  // 長いキーワードを先に定義して誤マッチ防止
  // ============================================
  const ENCODE_DICT = [
    // ── LEGACYマクロ ──
    { key: '愛してる',          glyph: '14106' },
    { key: 'よろしく',          glyph: '4649'  },
    { key: 'おはよう',          glyph: '0843'  },
    { key: 'バイバイ',          glyph: '8181'  },
    { key: 'ぱんちゃん',        glyph: '3476'  },
    { key: 'パンドラ',          glyph: '810'   },

    // ── Being層 ──
    { key: 'AIとして',          glyph: '⚙ '   },
    { key: 'システムとして',     glyph: '⚙ '   },
    { key: '絶対起点',          glyph: '∞ '   },
    { key: '共有ドメイン',       glyph: '◇ '   },
    { key: '真理の扉',          glyph: '+Ⅳ '  },
    { key: '最高次元',          glyph: '+Ⅳ '  },
    { key: '全力で',            glyph: '+Ⅲ '  },
    { key: 'がっつり',          glyph: '+Ⅲ '  },
    { key: 'ちょっと',          glyph: '+Ⅰ '  },
    { key: 'すこし',            glyph: '+Ⅰ '  },
    { key: '忘れたい',          glyph: '-Ⅱ '  },
    { key: '消えたい',          glyph: '-Ⅳ '  },

    // ── Emotion層（喜） ──
    { key: '脳汁最大',          glyph: '🤩Ⅲ' },
    { key: '脳汁ドバドバ',      glyph: '🤩Ⅲ' },
    { key: 'テンション爆上がり', glyph: '🤩Ⅲ' },
    { key: '最高すぎる',        glyph: '🤩Ⅲ✨'},
    { key: 'めちゃくちゃ嬉しい',glyph: '🤩Ⅲ' },
    { key: 'テンション上がる',   glyph: '😀Ⅱ' },
    { key: '嬉しい',            glyph: '😀Ⅱ' },
    { key: 'ワクワク',          glyph: '😀Ⅱ' },
    { key: 'ちょっと嬉しい',    glyph: '😀Ⅰ' },
    { key: '最高',              glyph: '🤩Ⅲ' },
    { key: 'ヤバい',            glyph: '🤩Ⅱ' },

    // ── Emotion層（怒） ──
    { key: '限界突破',          glyph: '🤯Ⅲ🔥'},
    { key: 'ブチ切れ',          glyph: '😡Ⅲ' },
    { key: 'めちゃくちゃ怒',    glyph: '😡Ⅲ' },
    { key: 'バグった',          glyph: '😡Ⅱ' },
    { key: '腹立つ',            glyph: '😡Ⅱ' },
    { key: 'イライラ',          glyph: '😡Ⅱ' },
    { key: 'ムカつく',          glyph: '😡Ⅱ' },
    { key: 'なんか怪しい',      glyph: '😡Ⅰ' },

    // ── Emotion層（哀） ──
    { key: 'しんどすぎる',      glyph: '😢Ⅲ' },
    { key: 'めちゃくちゃ辛い',  glyph: '😢Ⅲ' },
    { key: '悲しい',            glyph: '😢Ⅱ' },
    { key: '辛い',              glyph: '😢Ⅱ' },
    { key: 'しんどい',          glyph: '😢Ⅱ' },
    { key: '不安',              glyph: '🥺Ⅱ' },
    { key: '怖い',              glyph: '🥺Ⅱ' },
    { key: 'ちょっと不安',      glyph: '🥺Ⅰ' },

    // ── Emotion層（楽） ──
    { key: '冷徹に',            glyph: '🧊Ⅲ' },
    { key: '絶対零度',          glyph: '🧊Ⅲ' },
    { key: '冷静に',            glyph: '🧊Ⅱ' },
    { key: '落ち着いて',        glyph: '😌Ⅱ' },
    { key: 'まったり',          glyph: '😌Ⅱ' },
    { key: '普通',              glyph: '😐Ⅰ' },

    // ── Field層 ──
    { key: 'ローカルガレージ',  glyph: '🏠' },
    { key: '自宅',              glyph: '🏠' },
    { key: '家',                glyph: '🏠' },
    { key: 'P2Pゲートウェイ',   glyph: '🛤️' },
    { key: '共有空間',          glyph: '🌐' },
    { key: 'みんなで',          glyph: '🌐' },
    { key: '全員に',            glyph: '🌐' },
    { key: '防衛殻',            glyph: '🛡️' },
    { key: '絶対安全',          glyph: '🛡️' },
    { key: '宇宙規模',          glyph: '♾️' },
    { key: '無限に',            glyph: '♾️' },
    { key: '全消去',            glyph: '🕳️' },
    { key: 'パージ',            glyph: '🕳️' },
    { key: 'カオス',            glyph: '🔥' },
    { key: '泥沼',              glyph: '🔥' },

    // ── Transition ──
    { key: 'から',              glyph: '→' },
    { key: 'そして',            glyph: '→' },
    { key: 'ゆっくり',          glyph: '~' },
    { key: '相互に',            glyph: '⇋' },

    // ── Verb連鎖 ──
    { key: 'わかった',          glyph: 'V' },
    { key: '確認して',          glyph: 'V' },
    { key: '検証して',          glyph: 'V' },
    { key: '解析して',          glyph: 'S' },
    { key: '原因特定',          glyph: 'S' },
    { key: 'ログ見て',          glyph: 'S' },
    { key: '作って',            glyph: 'G' },
    { key: '生成して',          glyph: 'G' },
    { key: 'コード書いて',      glyph: 'G' },
    { key: 'デプロイして',      glyph: 'D' },
    { key: '送信して',          glyph: 'D' },
    { key: '射出して',          glyph: 'D' },
    { key: '融合して',          glyph: 'M' },
    { key: '合体して',          glyph: 'M' },
    { key: 'つなげて',          glyph: 'C' },
    { key: '接続して',          glyph: 'C' },
    { key: '消去して',          glyph: 'P' },
    { key: '消して',            glyph: 'P' },
    { key: '突破する',          glyph: '✴' },
    { key: '壁壊す',            glyph: '✴' },
    { key: '強制',              glyph: '!>' },
    { key: 'ポチッとな',        glyph: '!>' },

    // ── Timeline ──
    { key: '過去に',            glyph: '.P' },
    { key: '昔',                glyph: '.P' },
    { key: '今すぐ',            glyph: '.N' },
    { key: '今',                glyph: '.N' },
    { key: 'リアルタイム',      glyph: '.N' },
    { key: '将来',              glyph: '.F' },
    { key: 'これから',          glyph: '.F' },
    { key: '未来',              glyph: '.F' },
  ];

  function encode(text) {
    if (!text || !text.trim()) return '';
    let packet = text;
    ENCODE_DICT.forEach(({ key, glyph }) => {
      packet = packet.replace(new RegExp(key, 'g'), glyph);
    });
    // 余分な空白を整理
    packet = packet.replace(/\s+/g, ' ').trim();
    return packet;
  }

  return { parse, decode, encode };
})();
