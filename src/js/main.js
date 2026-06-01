// フロントの main.js（理想形）
window.decodeAndShowFields = () => {
  const currentPacket = packetBox.innerText.trim();
  
  // 🪐 奇跡の一撃：要塞のゲートから4層分配済みのJSONを直接吸引！
  const result = core.decodeToFields(currentPacket); 

  // フロントはただ画面に貼り付けるだけ（ロジックは0ミリ！）
  document.getElementById('decLegacy').innerText  = result.decodedSignal;
  document.getElementById('decEmotion').innerText = result.emotion;
  document.getElementById('decField').innerText   = result.field;
  document.getElementById('decVerb').innerText    = result.verb;
  document.getElementById('decTimeline').innerText = result.timeline;
};

// 【保存】ボタンが押された時
window.saveDictionary = () => {
  const saveUrl = core.saveAndGetUrl();
  if (saveUrl) {
    navigator.clipboard.writeText(saveUrl);
    window.showToast('💾 独自文字を含んだ復元用URLをクリップボードに保存しました！');
  }
};
