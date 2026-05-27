/**
 * SIGN-X v8.40 階層型大統一辞書ローダー [ベクトル大群完全合流・確定版]
 * 2万4千語のベクトル活用網羅を variantKeys へ完全マウント仕様 (3.1 Pro 覚醒版)
 */
class DictLoader {
  constructor() {
    this.encodeMap = new Map();       
    this.coreKeys = [];               // 🪐【特権原子レーン】1〜2文字の絶対防衛名詞
    this.variantKeys = [];            // 🪐【通常分子レーン】3文字以上の複合分子・活用・ベクトル大群
    this.glyphToEntryMap = new Map();   
    this.macroEntries = [];           
  }

  async load() {
    console.log("📡 [DictLoader v8.40] public/dict/ パスから多次元データ層の吸引を開始（.N）...");
    
    // 🪐 6大ファイルを正確にフェッチ
    const [resMacro, resCore, resVariants, resDynamic, resUser, resVectors] = await Promise.all([
      fetch('./public/dict/macro.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/static_core.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/static_variants.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/dynamic.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/user-dict.json').then(r => r.json()).catch(() => ({ entries: [] })),
      fetch('./public/dict/vectors.json').then(r => r.json()).catch(() => ({ entries: [] }))
    ]);

    // ❶ マクロ
    if (resMacro && resMacro.entries) this.macroEntries = resMacro.entries;

    // ❷ 原子・分子・動的・ユーザーの共通登録ロジック
    const register = (res, isCoreOnly = false) => {
      if (res && res.entries) {
        res.entries.forEach(entry => {
          if (!entry || !entry.glyph) return;
          this.glyphToEntryMap.set(entry.glyph, entry);
          const vList = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
          if (entry.main && !vList.includes(entry.main)) vList.push(entry.main);
          vList.forEach(v => {
            if (!v) return;
            this.encodeMap.set(v, entry.glyph);
            if (isCoreOnly || (v.length <= 2 && !/^[ぁ-ん]+$/.test(v))) {
              this.coreKeys.push(v);
            } else {
              this.variantKeys.push(v);
            }
          });
        });
      }
    };

    register(resCore, true); // coreは特権レーンへ強制隔離
    register(resVariants, false);
    register(resDynamic, false);
    register(resUser, false);

    // ❸ 🪐【大復活：修飾ベクトル層】 2万語の活用形を全て variantKeys へドバァァッと流し込む！！！
    if (resVectors && resVectors.entries) {
      resVectors.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        // 🛡️ ベクトルは main を vList に絶対に入れない（薬が感情駅に吸い込まれるバグを防止）
        const vList = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
        vList.forEach(v => {
          if (!v) return;
          this.encodeMap.set(v, entry.glyph); 
          // 🚨🚨🚨 これだァァァ！ベクトル大群をスキャン対象（分子レーン）に完全ドッキング！！！ 🚨🚨🚨
          this.variantKeys.push(v); 
        });
      });
    }

    // 🪐【絶対重力ソート】重複を極限パージし、分子レーンを長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)]; 
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.40] 2万4千語大宇宙全覚醒完了: 原子[${this.coreKeys.length}] / 分子[${this.variantKeys.length}] (Q.E.D.)`);
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
