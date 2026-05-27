/**
 * SIGN-X v8.20 階層型大統一辞書ローダー [GitHub Pages 階層完全直結仕様]
 * public/dict/ への絶対通信パス開通形態
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
    console.log("📡 [DictLoader v8.20] public/dict/ パスへのダイレクト吸引を開始（.N）...");
    
    // 🪐【絶対開通パッチ】ブラウザのルートから見た「public/dict/」の絶対座標へ全ファイルを確実に誘導！！！
    const [resMacro, resCore, resVariants, resDynamic, resUser, resVectors] = await Promise.all([
      fetch('./public/dict/macro.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/static_core.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/static_variants.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/dynamic.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/user-dict.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/vectors.json').then(r => r.json()).catch(() => ({ entries: [] }))
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

    // ❸ 複合·活用層（static_variants）の展開 ➔ 通常レーンへ
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

    // ❺ ユーザー拡張層（user-dict）の展開 ➔ 自動仕分け吸着！
    if (resUser && resUser.entries) {
      resUser.entries.forEach(entry => {
        this.registerEntry(entry);
        if (entry.variants) {
          entry.variants.forEach(v => {
            if (!v) return;
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

    // 🪐 Coreは重複除去のみ、Variantsは長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)]; 
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.20] 完全開通: 原子[${this.coreKeys.length}] / 分子[${this.variantKeys.length}] (Q.E.D.)`);
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
