/**
 * 3D-pocketbell Dictionary Loader v2.3
 * カスケード・インジェクター — 四重統治データ層
 *
 * 優先順位（上が勝つ）:
 *   user-dict.json  ← URLパラメータで差し替え可能
 *   macro.json      ← フレーズ定型文
 *   vectors.json    ← 修飾子ベクトル
 *   3d-core.json    ← 不変コア
 */

class DictLoader {
  constructor() {
    // 統合フラットマトリクス（最長一致ソート済み）
    this.entries = [];

    // 逆引き用 Map: glyph → entry
    this.reverseMap = new Map();

    // エンコード用 Map: variant/main → glyph（最速ルックアップ）
    this.encodeMap = new Map();

    this.loaded = false;
  }

  // ============================================================
  // メインロード（四重並列フェッチ → カスケード結合）
  // ============================================================
  async load() {
    try {
      console.log('📡 四重統治データ層・フェッチ開始...');

      const base = this._getBasePath();

      // ❶ 3大コア宇宙の並列フェッチ
      const [coreRes, macroRes, vectorRes] = await Promise.all([
        fetch(`${base}public/dict/3d-core.json`).catch(() => fetch('/dict/3d-core.json')),
        fetch(`${base}public/dict/macro.json`).catch(() => fetch('/dict/macro.json')),
        fetch(`${base}public/dict/vectors.json`).catch(() => fetch('/dict/vectors.json')),
      ]);

      if (!coreRes.ok) throw new Error('3d-core.json が見つかりません');

      const [coreData, macroData, vectorData] = await Promise.all([
        coreRes.json(),
        macroRes.ok ? macroRes.json() : Promise.resolve({ entries: [] }),
        vectorRes.ok ? vectorRes.json() : Promise.resolve({ entries: [] }),
      ]);

      // ❷ URLパラメータからユーザー辞書を動的判定
      //    例: ?dict=https://gist.githubusercontent.com/.../user-dict.json
      const urlParams = new URLSearchParams(window.location.search);
      const userDictUrl = urlParams.get('dict') || `${base}public/dict/user-dict.json`;
      let userDictData = { entries: [] };

      try {
        const userRes = await fetch(userDictUrl);
        if (userRes.ok) {
          userDictData = await userRes.json();
          console.log(`✅ ユーザー辞書接続成功: ${userDictUrl}`);
        }
      } catch {
        console.log('ℹ️ ユーザー辞書なし（スタンドアローンモード）');
      }

      // ❸ 4層をカスケード結合（先頭が最優先）
      const allEntries = [
        ...(userDictData.entries  || []),  // 最優先
        ...(macroData.entries     || []),  // フレーズ定型文
        ...(vectorData.entries    || []),  // 修飾子ベクトル
        ...(coreData.entries      || []),  // 不変コア
      ];

      // ❹ フラット化 → 重複排除 → 最長一致ソート
      this.entries = this._buildFlatEntries(allEntries);

      // ❺ 各種 Map を構築
      this._buildMaps();

      this.loaded = true;
      console.log(`✅ 宇宙結合完了: ${this.entries.length}エントリ / encodeMap: ${this.encodeMap.size}語`);
      return true;

    } catch (err) {
      console.error('❌ ローダー致命的エラー:', err);
      return false;
    }
  }

  // ============================================================
  // フラット化 + 重複排除 + 最長一致ソート
  // ============================================================
  _buildFlatEntries(allEntries) {
    const seen = new Set();
    const flat = [];

    for (const entry of allEntries) {
      // glyph は macro_glyph でも glyph でも受け付ける
      const glyph = entry.macro_glyph || entry.glyph;
      if (!glyph) continue;

      // バリアント群を収集
      const keys = [
        entry.phrase || entry.main,
        ...(entry.variants || []),
      ].filter(Boolean);

      for (const key of keys) {
        if (seen.has(key)) continue; // 上位レイヤーが勝つ
        seen.add(key);
        flat.push({ key, glyph, entry });
      }
    }

    // 最長一致優先ソート
    return flat.sort((a, b) => b.key.length - a.key.length);
  }

  // ============================================================
  // Map 構築（エンコード用 & 逆引き用）
  // ============================================================
  _buildMaps() {
    this.encodeMap.clear();
    this.reverseMap.clear();

    for (const { key, glyph, entry } of this.entries) {
      this.encodeMap.set(key, glyph);

      // 逆引き: 最初に登録したものが勝つ
      if (!this.reverseMap.has(glyph)) {
        this.reverseMap.set(glyph, entry);
      }
    }
  }

  // ============================================================
  // 公開 API
  // ============================================================

  /** 単語 → glyph */
  getGlyph(text) {
    return this.encodeMap.get(text) || null;
  }

  /** glyph → entry */
  getEntryByGlyph(glyph) {
    return this.reverseMap.get(glyph) || null;
  }

  /** 最長一致ソート済みキー一覧（encode ループ用） */
  getSortedKeys() {
    return this.entries.map(e => e.key);
  }

  /** glyph 一覧（デコード用） */
  getAllGlyphs() {
    return [...this.reverseMap.keys()];
  }

  /** 現在の辞書情報 */
  getInfo() {
    return {
      version:      '2.3',
      totalEntries: this.entries.length,
      encodeWords:  this.encodeMap.size,
      loaded:       this.loaded,
    };
  }

  // ============================================================
  // 後方互換レイヤー（v2.2 → v2.3 移行用）
  // ============================================================

  /** @deprecated getSortedKeys() を使用 */
  getSortedMacroKeys() { return this.getSortedKeys(); }

  /** @deprecated getGlyph() を使用 */
  getMacro(phrase) { return this.getGlyph(phrase); }

  // ============================================================
  // ユーティリティ
  // ============================================================
  _getBasePath() {
    const path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1);
  }
}

export default DictLoader;
