/**
   * 📡 感情・行動・自動ベクトル乗算対応殻（大統一確定現成プロトコル）
   */
  async loadFromLocalFs(): Promise<number> {
    try {
      console.log("⚙️ [Deep Fortress] 宇宙の自動乗算 ✕ 全ベクトル単体丸ごとマウントを開始...");

      const origin = new URL('.', import.meta.url).origin;

      const [resMacro, resCore, resVariants, resDynamic, resVectors] = await Promise.all([
        fetch(`${origin}/dict/macro.json`).then(r => r.json()).catch(() => ({ entries: [] })),
        fetch(`${origin}/dict/static_core.json`).then(r => r.json()).catch(() => ({ entries: [] })),
        fetch(`${origin}/dict/static_variants.json`).then(r => r.json()).catch(() => ({ entries: [] })),
        fetch(`${origin}/dict/dynamic.json`).then(r => r.json()).catch(() => ({ entries: [] })),
        fetch(`${origin}/dict/vectors.json`).then(r => r.json()).catch(() => ({ entries: [] }))
      ]);

      if (resMacro?.entries) this.macroEntries = resMacro.entries;

      // 🪐 1. 静的な通常エントリーを隔離マウント
      const rawStaticEntries: DictEntry[] = [
        ...(resCore?.entries || []),
        ...(resVariants?.entries || [])
      ];

      const dynamicEntries = resDynamic?.entries || [];
      const vectorEntries = resVectors?.entries || [];
      const multipliedDynamicEntries: DictEntry[] = [];

      // 🪐 2. 【自動ベクトル乗算】感情✕ベクトルの総当たりクロスオーバー
      dynamicEntries.forEach(dEntry => {
        vectorEntries.forEach(vEntry => {
          const combinedGlyph = dEntry.glyph + vEntry.glyph;
          
          const dVariants = Array.isArray(dEntry.variants) ? dEntry.variants : [dEntry.main || dEntry.mean];
          const vVariants = Array.isArray(vEntry.variants) ? vEntry.variants : [vEntry.main || vEntry.mean];
          
          const combinedVariants: string[] = [];
          dVariants.forEach(dv => {
            vVariants.forEach(vv => {
              combinedVariants.push(`${dv}${vv}`); 
            });
          });

          multipliedDynamicEntries.push({
            id: `${dEntry.id}_x_${vEntry.id}`,
            glyph: combinedGlyph,
            category: dEntry.category || 'system',
            variants: combinedVariants
          });
        });
      });

      // 🪐 3. 【特異点修正】お兄ちゃんの vectors（24件）を、単体辞書としても「丸々そのまま」全マウント！
      // これにより、categoryがないベクトルも全て自動的に 'system' (g) 層へ吸着します。
      const rawVectorEntries = vectorEntries.map(v => ({
        ...v,
        category: v.category || 'system'
      }));

      // 🪐 4. 【大統一タイムライン】静的 ＋ 乗算動的 ＋ ベクトル単体、すべてを1つの大河へ結合！！！
      const allSourceEntries = [
        ...rawStaticEntries, 
        ...multipliedDynamicEntries, 
        ...rawVectorEntries // ➔ これが入ったことで、vectorが丸々100%読み込まれます！
      ];

      console.log(`📡 [Deep Fortress] 総結合エントリー数: ${allSourceEntries.length} 件の解析を執行`);

      // 🪐 5. 全宇宙を巡回して「2文字の62進数品詞コード」へ確定写像
      allSourceEntries.forEach(entry => {
        if (!entry || !entry.glyph) return;
        
        let cat = entry.category || 'system';
        if (cat === 'emotion' || cat === 'abstract_concept' || cat === 'social' || cat === 'unknown' || cat === '') {
          cat = 'system'; 
        }

        if (!this.categoryEntries.has(cat)) {
          this.categoryEntries.set(cat, []);
        }
        
        const entriesInCat = this.categoryEntries.get(cat)!;
        let deepGlyph = entry.glyph;

        if (CATEGORY_MAP[cat]) {
          const prefix = CATEGORY_MAP[cat];
          const suffix = BASE62[entriesInCat.length % 62];
          deepGlyph = prefix + suffix; 
        }

        if (entry.glyph.match(/[^\w\s]/u)) {
          deepGlyph = entry.glyph;
        }

        const deepEntry: DictEntry = {
          ...entry,
          category: cat,
          glyph: deepGlyph
        };
        entriesInCat.push(deepEntry);

        // 類義語バリアントの吸引
        const vList: string[] = Array.isArray(entry.variants) ? [...entry.variants] : (entry.variants ? [entry.variants] : []);
        const mainWord = entry.main || entry.mean;
        if (mainWord && !vList.includes(mainWord)) vList.push(mainWord);

        vList.forEach(v => {
          if (!v) return;
          this.encodeMap.set(v, deepGlyph);
          this.glyphToCategoryMap.set(deepGlyph, cat);
          this.allWords.push(v);
        });
      });

      // 重複を完全に排除し、最長一致トポロジーソート（これで11万語超が確定します）
      this.allWords = [...new Set(this.allWords)].sort((a, b) => b.length - a.length);
      this.isReady = true;
      
      console.log(`🟢 [Deep Fortress] 完全大統一成功。総全バリアント宇宙: [${this.allWords.length}]`);
      return this.allWords.length;
    } catch (e) {
      console.error("❌ 要塞内部での乗算・単体結合断線:", e);
      return 0;
    }
  }
