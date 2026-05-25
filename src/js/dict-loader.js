/**
 * 3D-pocketbell Dictionary & Macro Loader
 * 新形式（v2.1 / Macro 融合版）- 完全整合モデル
 */

class DictLoader {
  constructor() {
    this.dictionary = new Map();   // 単語用: key → glyph
    this.reverseDict = new Map();  // 単語用: glyph → main entry
    this.entries = [];             // 単語全エントリ保持

    this.macroDict = new Map();    // 💡 マクロ用: phrase → macro_glyph
    this.macroEntries = [];        // 💡 マクロ全エントリ保持

    this.loaded = false;
  }

  /**
   * 💡 辞書 ＆ マクロを並行宇宙から一括同時読み込み
   */
  async load() {
    try {
      console.log("📡 コア辞書 ＆ マクロデータの並行フェッチを開始...");

      // コア辞書とマクロデータのソースパス（絶対安全殻フォールバック付き）
      const coreFetch = fetch('./public/dict/3d-core.json').catch(() => fetch('/dict/3d-core.json'));
      const macroFetch = fetch('./public/dict/macro.json').catch(() => fetch('/dict/macro.json'));

      // 並行処理で1ビットの遅延もなく同時取得
      const [coreRes, macroRes] = await Promise.all([coreFetch, macroFetch]);

      if (!coreRes.ok) throw new Error('3d-core.json が見つかりません');
      
      const coreData = await coreRes.json();
      this.entries = coreData.entries || [];

      // ── ❶ コア辞書の構築 ──
      this.dictionary.clear();
      this.reverseDict.clear();

      for (const entry of this.entries) {
        const glyph = entry.glyph;
        const main = entry.main;

        if (entry.variants && Array.isArray(entry.variants)) {
          for (const variant of entry.variants) {
            this.dictionary.set(variant, glyph);
          }
        }
        this.dictionary.set(main, glyph);
        
        if (!this.reverseDict.has(glyph)) {
          this.reverseDict.set(glyph, entry);
        }
      }

      // ── ❷ マクロ辞書の自動インジェクション ──
      this.macroDict.clear();
      if (macroRes.ok) {
        try {
          const macroData = await macroRes.json();
          this.macroEntries = macroData.entries || [];

          for (const mEntry of this.macroEntries) {
            const mglyph = mEntry.macro_glyph;
            const phrase = mEntry.phrase;

            // 表記ゆれフレーズをすべてマクロ登録
            if (mEntry.variants && Array.isArray(mEntry.variants)) {
              for (const variant of mEntry.variants) {
                this.macroDict.set(variant, mglyph);
              }
            }
            // 代表フレーズも登録
            if (phrase) {
              this.macroDict.set(phrase, mglyph);
            }
          }
          console.log(`💡 マクロ展開層結合完了: ${this.macroEntries.length} マクロマウント`);
        } catch (me) {
          console.warn("⚠️ macro.json のパースに失敗しました。スキップします。", me);
        }
      } else {
        console.log("ℹ️ macro.json が存在しないため、単語置換のみで稼働します。");
      }

      this.loaded = true;
      console.log(`✅ ユニバーサルロード完了: 計 ${this.entries.length} 概念 / 計 ${this.macroDict.size} 定型マクロ`);
      return true;

    } catch (error) {
      console.error('❌ ローダー致命的エラー:', error);
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
   * 💡 マクロ用フレーズから複合グリフを取得
   */
  getMacro(phrase) {
    if (!this.loaded) return null;
    return this.macroDict.get(phrase) || null;
  }

  /**
   * 💡 現在ロードされているすべてのマクロキーを最長一致ソートして取得
   */
  getSortedMacroKeys() {
    if (!this.loaded) return [];
    return Array.from(this.macroDict.keys()).sort((a, b) => b.length - a.length);
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
    return this.entries.filter(entry => entry.tags && entry.tags.includes(tag));
  }

  /**
   * 現在の辞書・マクロ情報を一括取得
   */
  getInfo() {
    return {
      version: "2.2",
      totalEntries: this.entries.length,
      totalWords: this.dictionary.size,
      totalMacros: this.macroDict.size,
      loaded: this.loaded
    };
  }
}

export default DictLoader;
