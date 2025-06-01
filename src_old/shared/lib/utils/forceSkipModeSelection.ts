// モード選択画面を強制的にスキップ
export function forceSkipModeSelection() {
  // LocalStorageに必要な設定を強制的に書き込み
  const preferences = {
    mode: 'learning',
    tutorialCompleted: true,
    skipModeSelection: true
  };
  
  localStorage.setItem('logic-circuit-preferences', JSON.stringify(preferences));
  
  // チュートリアル状態も設定
  const tutorialState = {
    completed: true,
    currentStep: 999,
    badges: [],
    progress: {}
  };
  
  localStorage.setItem('logic-circuit-tutorial', JSON.stringify(tutorialState));
  
  // モード選択済みフラグ
  localStorage.setItem('hasSeenModeSelector', 'true');
  localStorage.setItem('circuit-mode', '"learning"');
}

// ページロード時に実行
// 開発時のデバッグ用：URLパラメータで制御
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  const skipMode = urlParams.get('skipMode');
  
  // skipMode=falseが指定されていない限り、モード選択をスキップ
  if (skipMode !== 'false') {
    forceSkipModeSelection();
  }
}