// ============================================
// SIGN-X DICT LOADER v6.1
// public/dict/ 以下の辞書を一括読み込み
// ============================================

export class DictLoader {
  static async loadAll() {
    const files = {
      macro:     './dict/macro.json',
      legacy:    './dict/legacy.json',
      core:      './dict/3d-core.json'
      // ai:     './dict/ai-optimize.json'  // 将来追加用
    };

    const dicts = {};

    for (const [name, url] of Object.entries(files)) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`⚠️ ${name}.json の読み込みに失敗: ${response.status}`);
          dicts[name] = [];
          continue;
        }
        dicts[name] = await response.json();
        console.log(`✅ Loaded ${name}.json (${dicts[name].length}件)`);
      } catch (error) {
        console.error(`❌ ${name}.json 読み込みエラー:`, error);
        dicts[name] = [];
      }
    }

    // 全辞書を結合して長い順にソート（重要！）
    const allEntries = [
      ...dicts.macro,
      ...dicts.legacy,
      ...dicts.core
    ];

    // 長いキーを先に置換するためのソート
    const sortedDict = allEntries.sort((a, b) => {
      return b.key.length - a.key.length;
    });

    console.log(`🎉 SIGN-X 全辞書ロード完了: ${sortedDict.length}件`);
    return sortedDict;
  }
}
