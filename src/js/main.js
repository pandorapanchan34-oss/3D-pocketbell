/**
 * SIGN-X v9.00 本家大統一リモート・マウントゲート
 * 全てのロジック（loader, grammar, app）を遠隔要塞からダイレクトマウントする
 */
const ARCHIVE_CORE_URL = "https://3-d-pocketbell-deep-bssv.vercel.app/assets/honke-core.js";

window.addEventListener('DOMContentLoaded', async () => {
  const badge = document.getElementById('sync-badge') || document.querySelector('.status-badge');
  if (badge) badge.innerText = "● SIGN-X CONNECTING ARCHIVE...";

  try {
    // 🪐 要塞からビルド済みの本家大統一知能を一撃で吸引・起動
    const { initHonkeApp } = await import(ARCHIVE_CORE_URL);
    
    // アプリケーションの完全起動シグナル
    await initHonkeApp();
    
    console.log("🟢 [Gate] 本家大統一システム、遠隔マウント成功。Q.E.D.");
  } catch (error) {
    console.error("❌ [Gate] 要塞ロジックの吸引に失敗:", error);
    if (badge) {
      badge.innerText = "● SIGN-X CORE OFFLINE (CORS/CONNECTION ERROR)";
      badge.style.color = "#ef4444";
    }
  }
});
