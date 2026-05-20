// ============================================
// SIGN-X PARSER ENGINE v6.1
// 語順: [Being] [Emotion] [Field] [Transition] [Emotion'] [Verb] [Timeline]
// ============================================

let ENCODE_DICT = []; // dict-loader から注入される

const Parser = (() => {

  function emptyResult() {
    return {
      being:       { domain: null, depth: null },
      emotion:     { face: null, intensity: null },
      field:       [],
      transition:  null,
      emotion2:    { face: null, intensity: null },
      verbs:       [],
      timeline:    null,
      legacy:      null,
    };
  }

  // ============================================
  // メイン・パース関数
  // ============================================
  function parse(input) {
    const result = emptyResult();
    if (!input || !input.trim()) return result;

    let code = input.trim();

    // Legacy（ポケベル数字）
    const legacyMatch = code.match(/\b\d{3,6}\b/);
    if (legacyMatch) {
      result.legacy = legacyMatch[0];
    }

    // Being層（深度）
    const depthMatch = code.match(/[+-][ⅠⅡⅢⅣ]/u);
    if (depthMatch) result.being.depth = depthMatch[0];

    // Being層（ドメイン）
    if (code.includes('⚙')) result.being.domain = '⚙';
    if (code.includes('∞')) result.being.domain = '∞';
    if (code.includes('◇')) result.being.domain = '◇';
    if (code.includes('♢')) result.being.domain = '♢';

    // Emotion + Transition + Emotion2
    const transitionIdx = findTransitionIndex(code);
    const before = transitionIdx >= 0 ? code.slice(0, transitionIdx) : code;
    const after = transitionIdx >= 0 ? code.slice(transitionIdx) : '';

    const em1 = extractEmotion(before);
    if (em1) {
      result.emotion.face = em1.face;
      result.emotion.intensity = em1.intensity;
    }

    // Transition
    if (code.includes('→')) result.transition = '→';
    else if (code.includes('~')) result.transition = '~';
    else if (code.includes('⇋')) result.transition = '⇋';

    // Emotion2（遷移後）
    const em2 = extractEmotion(after);
    if (em2) {
      result.emotion2.face = em2.face;
      result.emotion2.intensity = em2.intensity;
    }

    // Field
    const fields = ['🏠', '🛤️', '🌐', '🛡️', '♾️', '🕳️', '🔥'];
    fields.forEach(f => {
      if (code.includes(f)) result.field.push(f);
    });

    // Verb連鎖
    const verbRegex = /(!>|✴|[VSGDMCP])/g;
    const verbMatches = [...code.matchAll(verbRegex)];
    result.verbs = [...new Set(verbMatches.map(m => m[0]))];

    // Timeline
    const tlMatch = code.match(/\.(N|P|F)/);
    if (tlMatch) result.timeline = '.' + tlMatch[1];

    return result;
  }

  // ============================================
  // 感情抽出ヘルパー
  // ============================================
  function extractEmotion(str) {
    const faces = ['😀','🤩','😡','🤯','😢','🥺','😌','🧊','😐'];
    for (const face of faces) {
      if (str.includes(face)) {
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

  function findTransitionIndex(code) {
    let idx = code.indexOf('→');
    if (idx >= 0) return idx;
    idx = code.indexOf('⇋');
    if (idx >= 0) return idx;
    idx = code.indexOf('~');
    return idx;
  }

  // ============================================
  // デコード（意味列挙）
  // ============================================
  function decode(result) {
    const out = {};

    if (result.legacy) out.legacy = `【${result.legacy}】 伝統ポケベル`;
    if (result.being.depth || result.being.domain) {
      out.being = [result.being.depth, result.being.domain].filter(Boolean).join(' ');
    }

    // Emotion
    if (result.emotion.face) {
      out.emotion = result.emotion.face + (result.emotion.intensity || '');
    }
    if (result.emotion2.face) {
      out.emotion2 = result.emotion2.face + (result.emotion2.intensity || '');
    }

    if (result.field.length > 0) {
      out.field = result.field.join(' ↔ ');
    }
    if (result.transition) out.transition = result.transition;
    if (result.verbs.length > 0) {
      out.verbs = result.verbs.join(' → ');
    }
    if (result.timeline) out.timeline = result.timeline;

    return out;
  }

  return { parse, decode };
})();

// グローバル公開（他のモジュールから利用可能）
window.Parser = Parser;
