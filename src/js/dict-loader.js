/**
 * SIGN-X v8.15 階層型大統一辞書ローダー [アルティメット二層レイアー形態]
 * macro / core / variants / dynamic / user-dict 完全包囲仕様
 */
class DictLoader {
  constructor() {
    this.encodeMap = new Map();       // 全全自動・検索用大統一マップ
    this.coreKeys = [];               // 🪐【特権レーン】短くても絶対保護する原子名詞（車/犬/猫/薬など）
    this.variantKeys = [];            // 🪐【通常レーン】長い順に処理する分子・複合語（3文字以上）
    this.glyphToEntryMap = new Map();   // 逆引き用スロット
    this.macroEntries = [];           // 最上層マクロ隔離用配列
  }

  async load() {
    console.log("📡 [DictLoader v8.15] 全多次元データマトリクスの全方位・並列吸引を開始（.N）...");
    
    // 🪐 5つのデータ層をインフラ遅延なしで超光速並列マウント（C）
    const [resMacro, resCore, resVariants, resDynamic, resUser, resVectors] = await Promise.all([
      fetch('./dict/macro.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./dict/static_core.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./dict/static_variants.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./dict/dynamic.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./dict/user-dict.json').then(r => r.json()).catch(() => ({ entries: [] })), // ユーザー辞書も完全合流
      fetch('./dict/vectors.json').then(r => r.json()).catch(() => ({ entries: [] }))
    ]);

    // ❶ 最上層：マクロデータの格納
    if (resMacro && resMacro.entries) {
      this.macroEntries = resMacro.entries;
    }

    // ❷ 特権原子層（static_core）の展開 ➔ 短編絶対防衛レーンへ直撃ハメ込み！
    if (resCore && resCore.entries) {
      resCore.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => { if (v) this.coreKeys.push(v); });
        }
      });
    }

    // ❸ 複合・活用層（static_variants）の展開 ➔ 通常レーンへ
    if (resVariants && resVariants.entries) {
      resVariants.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => { if (v) this.variantKeys.push(v); });
        }
      });
    }

    // ❹ 動的ライフログ層（dynamic）の展開 ➔ 通常レーンへマージ結合
    if (resDynamic && resDynamic.entries) {
      resDynamic.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => { if (v) this.variantKeys.push(v); });
        }
      });
    }

    // ❺ ユーザー拡張層（user-dict）の展開 ➔ 文字数に応じてCoreとVariantsへ自動仕分け吸着！
    if (resUser && resUser.entries) {
      resUser.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => {
            if (!v) return;
            // 💡 ユーザー辞書のうち、1〜2文字の漢字や重要語は特権Coreへ、3文字以上はVariantsへ自動デプロイ！
            if (v.length <= 2 && !/^[ぁ-ん]+$/.test(v)) {
              this.coreKeys.push(v);
            } else {
              this.variantKeys.push(v);
            }
          });
        }
      });
    }

    // ❻ 修飾ベクトル層（vectors）の展開
    if (resVectors && resVectors.entries) {
      resVectors.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => { if (v) this.encodeMap.set(v, entry.glyph); });
        }
      });
    }

    // 🪐【絶対法則ソート】Coreはピュアな完全一致用に重複除去のみ、Variantsは長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)]; 
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.15] 大統一宇宙開闢: 特権原子[${this.coreKeys.length}] / 複合分子[${this.variantKeys.length}] / マクロ[${this.macroEntries.length}] (Q.E.D.)`);
  }

  registerEntry(entry) {
    if (!entry || !entry.glyph) return;
    this.glyphToEntryMap.set(entry.glyph, entry);
    
    if (entry.variants) {
      entry.variants.forEach(v => { if (v) this.encodeMap.set(v, entry.glyph); });
    }
  }

  getGlyph(key) { return this.encodeMap.get(key); }
  getEntryByGlyph(glyph) { return this.glyphToEntryMap.get(glyph); }
  
  getEntryByName(name) {
    for (let entry of this.glyphToEntryMap.values()) {
      if (entry.main === name || (entry.variants && entry.variants.includes(name))) {
        return entry;
      }
    }
    return null;
  }

  getMacroEntries() { return this.macroEntries; }
}

export const dictLoader = new DictLoader();
window.dictLoader = dictLoader;
