// parser.js の先頭付近
let ENCODE_DICT = [];

export async function initParser() {
  const dicts = await DictLoader.loadAll();
  
  ENCODE_DICT = [
    ...dicts.macro,
    ...dicts.legacy,
    ...dicts.being,
    ...dicts.emotion,
    ...dicts.field,
    ...dicts.transition,
    ...dicts.verb,
    ...dicts.timeline,
  ].sort((a, b) => b.key.length - a.key.length); // 長い順で置換（重要）
}

export function encode(text) {
  if (!ENCODE_DICT.length) {
    console.warn("辞書がまだロードされていません");
    return text;
  }
  // 既存のエンコードロジック...
}
