/**
 * SIGN-X v8.30 階層型大統一辞書ローダー [ベクトル独立·完全調和形態]
 * 2万4千語全吸引 ✕ 1文字漢字絶対保護 ✕ ベクトル掛け算完全解放仕様
 */
class DictLoader {
  constructor() {
    this.encodeMap = new Map();       // 全全自動·検索用大統一マップ
    this.coreKeys = [];               // 🪐【特権原子レーン】1〜2文字の絶対防衛名詞（車/犬/猫/薬）
    this.variantKeys = [];            // 🪐【通常分子レーン】3文字以上の複合分子·活用
    this.glyphToEntryMap = new Map();   // 逆引き用スロット
    this.macroEntries = [];           // 最上層マクロ隔離用配列
  }

  async load() {
    console.log("📡 [DictLoader v8.30] public/dict/ パスから2万4千語の完全吸引を開始（.N）...");
    
    // 🪐 GitHub Pages の絶対座標から5大データ層を並列ロード
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

    // ❷ 特権原子層（static_core）の展開 ➔ 1〜2文字漢字を前線で絶対保護！
    if (resCore && resCore.entries) {
      resCore.entries.forEach(entry => {
        this.registerEntry(entry, this.coreKeys, true);
      });
    }

    // ❸ 複合·活用層（static_variants）の展開 ➔ 通常レーンへ
    if (resVariants && resVariants.entries) {
      resVariants.entries.forEach(entry => {
        this.registerEntry(entry, this.variantKeys, true);
      });
    }

    // ❹ 動的ライフログ層（dynamic）の展開 ➔ 通常レーンへマージ
    if (resDynamic && resDynamic.entries) {
      resDynamic.entries.forEach(entry => {
        this.registerEntry(entry, this.variantKeys, true);
      });
    }

    // ❺ ユーザー拡張層（user-dict）の展開 ➔ 自動長さ判定仕分け
    if (resUser && resUser.entries) {
      resUser.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        
        const vList = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
        if (entry.main && !vList.includes(entry.main)) vList.push(entry.main);

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

    // ❻ 🪐【超リペア：修飾ベクトル層】ベクトルデータに名詞 main の混入を絶対阻止（🛡️）！
    if (resVectors && resVectors.entries) {
      resVectors.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        
        // ベクトルは純粋に variants 配列のみをインデックスに直結させ、名詞を上書きさせない！
        const vList = Array.isArray(entry.variants) ? entry.variants : (entry.variants ? [entry.variants] : []);
        vList.forEach(v => {
          if (v) this.encodeMap.set(v, entry.glyph);
        });
      });
    }

    // 🪐【絶対重力ソート】重複を極限パージし、分子側を長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)]; 
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.30] 大宇宙復旧完了: 原子[${this.coreKeys.length}] / 分子[${this.variantKeys.length}] (Q.E.D.)`);
  }

  // 🪐 単語登録用の安全殻関数
  registerEntry(entry, targetKeyArray, includeMain) {
    if (!entry || !entry.glyph) return;
    this.glyphToEntryMap.set(entry.glyph, entry);
    
    // 元の配列を破壊しないようにシャドウコピーを展開
    const vList = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
    
    if (includeMain && entry.main && !vList.includes(entry.main)) {
      vList.push(entry.main);
    }

    vList.forEach(v => {
      if (!v) return;
      this.encodeMap.set(v, entry.glyph); // 単語盤マップへダイレクト吸着
      if (targetKeyArray) targetKeyArray.push(v);
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
