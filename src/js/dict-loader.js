// src/js/dict-loader.js
export class DictLoader {
  static async loadAll() {
    const dicts = {
      macro:      '/dict/macro.json',
      legacy:     '/dict/legacy.json',
      being:      '/dict/being.json',
      emotion:    '/dict/emotion.json',
      field:      '/dict/field.json',
      transition: '/dict/transition.json',
      verb:       '/dict/verb.json',
      timeline:   '/dict/timeline.json',
    };

    const loaded = {};

    for (const [key, url] of Object.entries(dicts)) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${key}`);
        loaded[key] = await res.json();
      } catch (err) {
        console.warn(`[DictLoader] ${key} の読み込み失敗:`, err);
        loaded[key] = []; // フォールバック
      }
    }

    console.log('✅ SIGN-X辞書 全ロード完了', Object.keys(loaded));
    return loaded;
  }
}
