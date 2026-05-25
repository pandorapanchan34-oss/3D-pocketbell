/**
 * 3D-pocketbell Dictionary Loader
 * 新形式（v2.1）対応 - 概念グループ化版
 */

class DictLoader {
  constructor() {
    this.dictionary = new Map(); // key → glyph
    this.reverseDict = new Map(); // glyph → main entry
    this.entries = []; // 全エントリ保持
    this.loaded = false;
  }

  /**
   * 辞書を読み込む
   */
  async load() {
    try {
      const response = await fetch('/dict/3d-core.json');
      if (!response.ok) throw new Error('辞書ファイルが見つかりません');

      const data = await response.json();
      
      this.entries = data.entries || [];
      this.dictionary.clear();
      this.reverseDict.clear();

      // 辞書を構築
      for (const entry of this.entries) {
        const glyph = entry.glyph;
        const main = entry.main;

        // すべてのvariantsを登録
        if (entry.variants && Array.isArray(entry.variants)) {
          for (const variant of entry.variants) {
            this.dictionary.set(variant, glyph);
          }
        }

        // mainも登録
        this.dictionary.set(main, glyph);
        
        // リバース辞書（glyph → エントリ）
        if (!this.reverseDict.has(glyph)) {
          this.reverseDict.set(glyph, entry);
        }
      }

      this.loaded = true;
      console.log(`✅ 辞書読み込み完了: \( {this.entries.length} 概念グループ ( \){this.dictionary.size} 単語)`);
      return true;

    } catch (error) {
      console.error('❌ 辞書読み込み失敗:', error);
      return false;
    }
  }

  /**
   * 単語からglyphを取得
   */
  getGlyph(text) {
    if (!this.loaded) return null;
    return this.dictionary.get(text) || null;
  }

  /**
   * glyphからエントリを取得
   */
  getEntryByGlyph(glyph) {
    if (!this.loaded) return null;
    return this.reverseDict.get(glyph) || null;
  }

  /**
   * 複数の単語を一括変換
   */
  translate(text) {
    if (!this.loaded || !text) return text;

    // 長い単語から順に置換（greedy）
    const sortedKeys = Array.from(this.dictionary.keys())
      .sort((a, b) => b.length - a.length);

    let result = text;
    for (const key of sortedKeys) {
      const glyph = this.dictionary.get(key);
      const regex = new RegExp(key, 'g');
      result = result.replace(regex, glyph);
    }

    return result;
  }

  /**
   * カテゴリでフィルタリング
   */
  getByCategory(category) {
    if (!this.loaded) return [];
    return this.entries.filter(entry => entry.category === category);
  }

  /**
   * タグで検索
   */
  searchByTag(tag) {
    if (!this.loaded) return [];
    return this.entries.filter(entry => 
      entry.tags && entry.tags.includes(tag)
    );
  }

  /**
   * 現在の辞書情報を取得
   */
  getInfo() {
    return {
      version: "2.1",
      totalEntries: this.entries.length,
      totalWords: this.dictionary.size,
      loaded: this.loaded
    };
  }
}

// グローバルインスタンス
const dictLoader = new DictLoader();

// 自動読み込み（必要なら）
window.addEventListener('load', () => {
  dictLoader.load();
});

// エクスポート
export default dictLoader;
