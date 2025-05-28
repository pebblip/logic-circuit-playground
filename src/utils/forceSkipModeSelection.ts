// モード選択画面を強制的にスキップ
export function forceSkipModeSelection() {
  // LocalStorageに必要な設定を強制的に書き込み
  const preferences = {
    mode: 'discovery',
    tutorialCompleted: false,
    skipModeSelection: true
  };
  
  localStorage.setItem('logic-circuit-preferences', JSON.stringify(preferences));
  
  // チュートリアル状態も設定
  const tutorialState = {
    completed: false,
    currentStep: 0,
    badges: [],
    progress: {}
  };
  
  localStorage.setItem('logic-circuit-tutorial', JSON.stringify(tutorialState));
}

// ページロード時に実行
if (typeof window !== 'undefined') {
  forceSkipModeSelection();
}