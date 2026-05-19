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
  // エンコード見本（自然言語 → パケット参考）
  // ============================================
  function encodeHint(text) {
    // 完全一致で見本を返す
    for (const sample of GRAMMAR.encodeSamples) {
      if (text.includes(sample.input.slice(0, 8))) return sample.output;
    }
    // ざっくり感情推定（簡易ヒント）
    let out = '';
    if (/テンション|最高|脳汁|暴走|ヤバ/.test(text)) out += '🤩Ⅲ ';
    else if (/怒|ムカ|腹立|激|ブチ/.test(text))      out += '😡Ⅱ ';
    else if (/悲|辛|しんど|消え/.test(text))          out += '😢Ⅱ ';
    else if (/冷静|静か|落ち着/.test(text))           out += '🧊Ⅱ ';
    else                                               out += '😐Ⅰ ';

    if (/共有|みんな|全員/.test(text)) out += '🌐 ';
    else if (/家|自宅/.test(text))     out += '🏠 ';

    if (/生成|作/.test(text)) out += 'G ';
    if (/デプロイ|送|射出/.test(text)) out += 'D ';
    if (/消去|パージ/.test(text)) out += 'P ';

    out += '.N';
    return out.trim();
  }

  return { parse, decode, encodeHint };
})();
