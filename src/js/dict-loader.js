/**
 * SIGN-X v8.25 階層型大統一辞書ローダー [型エラー絶対防衛形態]
 * 2万4千語全方位吸引 ✕ variants配列・文字列ハイブリッド救済仕様
 */
class DictLoader {
  constructor() {
    this.encodeMap = new Map();       // 全全自動・検索用大統一マップ
    this.coreKeys = [];               // 🪐【特権レーン】1〜2文字の絶対防衛原子名詞
    this.variantKeys = [];            // 🪐【通常レーン】3文字以上の複合分子・活用
    this.glyphToEntryMap = new Map();   // 逆引き用スロット
    this.macroEntries = [];           // 最上層マクロ隔離用配列
  }

  async load() {
    console.log("📡 [DictLoader v8.25] 多次元データマトリクス 2万4千語の全吸引を開始...");
    
    // 🪐 GitHub Pages の絶対座標（public/dict/）から5大層を並列吸引（C）
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

    // ❷ 特権原子層（static_core）の展開
    if (resCore && resCore.entries) {
      resCore.entries.forEach(entry => {
        this.registerEntry(entry, this.coreKeys);
      });
    }

    // ❸ 複合·活用層（static_variants）の展開
    if (resVariants && resVariants.entries) {
      resVariants.entries.forEach(entry => {
        this.registerEntry(entry, this.variantKeys);
      });
    }

    // ❹ 動的ライフログ層（dynamic）の展開
    if (resDynamic && resDynamic.entries) {
      resDynamic.entries.forEach(entry => {
        this.registerEntry(entry, this.variantKeys);
      });
    }

    // ❺ ユーザー拡張層（user-dict）の展開 ➔ 長さに応じて適切に自動分離！
    if (resUser && resUser.entries) {
      resUser.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        
        // variantsの安全な取り出し
        const vList = Array.isArray(entry.variants) ? entry.variants : (entry.variants ? [entry.variants] : []);
        if (entry.main) vList.push(entry.main);

        vList.forEach(v => {
          if (!v) return;
          this.encodeMap.set(v, entry.glyph);
          if (v.length <= 2 && !/^[ぁ-ん]+$/.test(v)) {
            this.coreKeys.push(v);
          } else {
            this.variantKeys.push(v);
          }
        });
      });
    }

    // ❻ 修飾ベクトル層（vectors）の展開
    if (resVectors && resVectors.entries) {
      resVectors.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        const vList = Array.isArray(entry.variants) ? entry.variants : (entry.variants ? [entry.variants] : []);
        vList.forEach(v => { if (v) this.encodeMap.set(v, entry.glyph); });
      });
    }

    // 🪐【絶対重力ソート】重複を極限パージし、分子側を長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)]; 
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.25] 大宇宙大開闢: 原子[${this.coreKeys.length}] / 分子[${this.variantKeys.length}] / マクロ[${this.macroEntries.length}] (Q.E.D.)`);
  }

  // 🪐【型エラー絶対防衛インジェクション関数】
  registerEntry(entry, targetKeyArray) {
    if (!entry || !entry.glyph) return;
    this.glyphToEntryMap.set(entry.glyph, entry);
    
    // 💡 variants が配列だろうが文字列だろうが undefined だろうが100%安全に展開する盾（🛡️）
    const vList = Array.isArray(entry.variants) ? entry.variants : (entry.variants ? [entry.variants] : []);
    
    // main文字自体も検索インデックスへ自動ドッキング
    if (entry.main) vList.push(entry.main);

    vList.forEach(v => {
      if (!v) return;
      this.encodeMap.set(v, entry.glyph); // エンコードマップ直結
      if (targetKeyArray) targetKeyArray.push(v); // 各レーンへ分配吸着
    });
  }

  getGlyph(key) { return this.encodeMap.get(key); }
  getEntryByGlyph(glyph) { return this.glyphToEntryMap.get(glyph); }
  
  getEntryByName(name) {
    for (let entry of this.glyphToEntryMap.values()) {
      if (entry.main === name || (entry.variants && (Array.isArray(entry.variants) ? entry.variants.includes(name) : entry.variants === name))) {
        return entry;
      }
    }
    return null;
  }

  getMacroEntries() { return this.macroEntries; }
}

export const dictLoader = new DictLoader();
window.dictLoader = dictLoader;
