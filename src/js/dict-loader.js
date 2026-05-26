/**
 * SIGN-X 五大ディスク大統一ローダー v5.6 [確定版]
 * [vectors / dynamic / static / macro / user-dict] 役割完全分立仕様
 */
class SignXFullUnifiedLoader {
  constructor() {
    this.encodeMap = new Map();
    this.reverseMap = new Map();
    this.macroEntries = []; // 🪐マクロ専用の独立高速巡航レーン
    this.sortedKeys = [];
    this.loaded = false;
  }

  async load() {
    console.log('📡 【五大ディスク大統一層】 ツインレーン・同時点火フェッチ開始...');
    try {
      // ⚡ 5つのファイルを並列で光速同時フェッチ（帯域配分戦略・最適化）
      const fetchPromises = [
        fetch('./public/dict/vectors.json').then(r => r.json()),
        fetch('./public/dict/static.json').then(r => r.json()),
        fetch('./public/dict/dynamic.json').then(r => r.json()),
        fetch('./public/dict/macro.json').then(r => r.json()).catch(() => ({ entries: [] })),
        fetch('./public/dict/user-dict.json').then(r => r.json()).catch(() => ({ entries: [] }))
      ];

      const [vectorData, staticData, dynamicData, macroData, userData] = await Promise.all(fetchPromises);

      const vectors = vectorData.entries || [];

      // ⓪ 【最上層：マクロデータの完全隔離マウント】
      // 他の原子単語と混ぜず、純粋なマクロ配列として app.js へ引き渡す契約
      const rawMacros = macroData.entries || macroData || [];
      if (Array.isArray(rawMacros)) {
        this.macroEntries = rawMacros.map(m => ({
          trigger: m.trigger,
          replaceTo: m.replace_to
        })).filter(m => m.trigger);
      }

      // ❶ 【量子層】 vectors.json の動的マウント
      vectors.forEach(v => {
        if (!v.glyph) return;
        if (v.variants) {
          v.variants.forEach(variant => this.encodeMap.set(variant, v.glyph));
        }
        this.reverseMap.set(v.glyph, { main: v.mean, phrase: v.mean });
      });

      // ❷ 【固定・分子層】 static.json / user-dict.json のフラット結合（M）
      const fixedEntries = [
        ...(staticData.entries || []),
        ...(userData.entries || [])
      ];

      fixedEntries.forEach(entry => {
        if (!entry.glyph) return;
        this.encodeMap.set(entry.main, entry.glyph);
        if (entry.variants) {
          entry.variants.forEach(v => this.encodeMap.set(v, entry.glyph));
        }
        this.reverseMap.set(entry.glyph, entry);
      });

      // ❸ 【動的変調層】 dynamic.json を走査し、ひっぱってきた vectors と全自動掛け算
      if (dynamicData.entries) {
        dynamicData.entries.forEach(atom => {
          if (!atom.glyph) return;
          
          // 原子単体の登録 (例: 「好き」 ➔ 😍)
          this.encodeMap.set(atom.main, atom.glyph);
          if (atom.variants) {
            atom.variants.forEach(v => this.encodeMap.set(v, atom.glyph));
          }
          this.reverseMap.set(atom.glyph, atom);

          // ⚡ データ駆動・全自動ベクトル乗算レーン！
          vectors.forEach(v => {
            const combinedGlyph = atom.glyph + v.glyph; // 😍 + ↑ = 😍↑

            // 正引きの自動現成（「めっちゃ」＋「好き」 ➔ 😍↑）
            if (v.variants && atom.variants) {
              v.variants.forEach(vVariant => {
                atom.variants.forEach(aVariant => {
                  this.encodeMap.set(`${vVariant}${aVariant}`, combinedGlyph);
                  this.encodeMap.set(`${aVariant}${vVariant}`, combinedGlyph); // 語順ゆらぎ吸収
                });
              });
            }

            // 逆引き用の動的意味マウント
            this.reverseMap.set(combinedGlyph, {
              main: `${atom.main}（${v.mean}）`,
              phrase: `${atom.main}（${v.mean}）`
            });
          });
        });
      }

      // ❹ 最長一致優先（Greedy）ソートの執行
      this.sortedKeys = Array.from(this.encodeMap.keys()).sort((a, b) => b.length - a.length);
      this.loaded = true;

      console.log(`✅ SIGN-X v5.60 宇宙結合完了！ 総語彙: [${this.encodeMap.size}] 語 / マクロ: [${this.macroEntries.length}] 件`);
      return true;

    } catch (error) {
      console.error('❌ 大統一ローダー致命的エラー:', error);
      this.loaded = false;
      return false;
    }
  }

  getSortedKeys() { return this.sortedKeys; }
  getGlyph(key) { return this.encodeMap.get(key); }
  getEntryByGlyph(glyph) { return this.reverseMap.get(glyph); }
  getMacroEntries() { return this.macroEntries; } // 🪐 app.js が Step 0 で呼び出す専用口
}

export const dictLoader = new SignXFullUnifiedLoader();
window.dictLoader = dictLoader; // グローバルスコープへ安全着艦
