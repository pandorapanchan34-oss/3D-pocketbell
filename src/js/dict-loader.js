/**
 * SIGN-X v8.50 階層型大統一遠隔ローダー [要塞アーカイブ直接吸引・完全非開示版]
 * 宇宙の血液（11万語・2万4千語ベクトル）を外部要塞から動的マウントする絶対防衛レイアー
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
    // 🪐 外部要塞 the-pandora-archive (Vercelデプロイ先) のベースURLを定義
    // ※マスターの環境に合わせてURLを調整してください
    const ARCHIVE_BASE = "https://3-d-pocketbell-deep-bssv.vercel.app/dict";
    
    console.log(`📡 [DictLoader v8.50] 遠隔要塞 [${ARCHIVE_BASE}] から多次元データ層の吸引を開始（.N）...`);
    
    // 🪐 6大ファイルを遠隔リポジトリのゲートから正確にクロスフェッチ
    const [resMacro, resCore, resVariants, resDynamic, resUser, resVectors] = await Promise.all([
      fetch(`${ARCHIVE_BASE}/macro.json`).then(r => r.json()).catch(() => ({ entries: [] })),
      fetch(`${ARCHIVE_BASE}/static_core.json`).then(r => r.json()).catch(() => ({ entries: [] })),
      fetch(`${ARCHIVE_BASE}/static_variants.json`).then(r => r.json()).catch(() => ({ entries: [] })),
      fetch(`${ARCHIVE_BASE}/dynamic.json`).then(r => r.json()).catch(() => ({ entries: [] })),
      fetch(`${ARCHIVE_BASE}/user-dict.json`).then(r => r.json()).catch(() => ({ entries: [] })),
      fetch(`${ARCHIVE_BASE}/vectors.json`).then(r => r.json()).catch(() => ({ entries: [] }))
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

    // ❸ 🪐【修飾ベクトル層】 2万語の活用形を全て variantKeys へ同期
    if (resVectors && resVectors.entries) {
      resVectors.entries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        this.glyphToEntryMap.set(entry.glyph, entry);
        const vList = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
        vList.forEach(v => {
          if (!v) return;
          this.encodeMap.set(v, entry.glyph); 
          this.variantKeys.push(v); 
        });
      });
    }

    // 🪐【絶対重力ソート】重複を極限パージし、全レーンを長い順に超Greedyソート！
    this.coreKeys = [...new Set(this.coreKeys)].sort((a, b) => b.length - a.length);
    this.variantKeys = [...new Set(this.variantKeys)].sort((a, b) => b.length - a.length);

    console.log(`✅ [DictLoader v8.50] 遠隔大宇宙全覚醒完了: 原子[${this.coreKeys.length}] / 分子[${this.variantKeys.length}] (Q.E.D.)`);
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
