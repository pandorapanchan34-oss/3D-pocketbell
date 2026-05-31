// 本家側の src/js/main.js
const FORTRESS_CORE = "https://3-d-pocketbell-deep-bssv.vercel.app/core.js";

window.addEventListener('DOMContentLoaded', async () => {
  try {
    // deepと全く同じ、完璧に動いている要塞知能をマウント！
    const { initSystem, encode, decode } = await import(FORTRESS_CORE);
    
    // あとは、この得られた encode / decode を本家のテキストボックスや
    // ボタン（window.encodeAndShow）にバインドするだけ！
    
  } catch (e) {
    console.error("要塞コアの同期に失敗", e);
  }
});
