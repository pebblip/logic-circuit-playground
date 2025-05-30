/**
 * テスト用のdata-testid定数
 * UIテストで要素を特定するための安定したIDを提供
 */

export const TEST_IDS = {
  // ヘッダー関連
  header: {
    root: 'header-root',
    logo: 'header-logo',
    modeSelector: 'header-mode-selector',
    currentModeDisplay: 'header-current-mode'
  },

  // モード選択関連
  modeSelector: {
    root: 'mode-selector-root',
    learningModeBtn: 'mode-btn-learning',
    freeModeBtn: 'mode-btn-free',
    puzzleModeBtn: 'mode-btn-puzzle',
    activeIndicator: 'mode-active-indicator'
  },

  // 学習モード関連
  learning: {
    sidePanel: 'learning-side-panel',
    guide: 'learning-guide',
    progress: 'learning-progress',
    statistics: 'learning-statistics',
    lessonList: 'learning-lesson-list',
    lessonItem: (id: number) => `learning-lesson-${id}`,
    tutorialBtn: 'learning-tutorial-btn',
    achievementNotification: 'learning-achievement-notification'
  },

  // チュートリアル関連
  tutorial: {
    overlay: 'tutorial-overlay',
    panel: 'tutorial-panel',
    title: 'tutorial-title',
    content: 'tutorial-content',
    nextBtn: 'tutorial-next-btn',
    skipBtn: 'tutorial-skip-btn',
    progressBar: 'tutorial-progress-bar'
  },

  // 回路エディタ関連
  circuit: {
    canvas: 'circuit-canvas',
    gate: (id: string) => `circuit-gate-${id}`,
    connection: (id: string) => `circuit-connection-${id}`,
    toolbar: 'circuit-toolbar',
    toolbarItem: (tool: string) => `toolbar-${tool}`
  },

  // 初回起動モード選択
  welcomeModal: {
    root: 'welcome-modal-root',
    skipBtn: 'welcome-skip-btn',
    nextBtn: 'welcome-next-btn',
    content: 'welcome-content'
  },

  // 汎用
  modal: {
    backdrop: 'modal-backdrop',
    content: 'modal-content',
    closeBtn: 'modal-close-btn'
  }
} as const;

// Type helper for TypeScript
export type TestId = typeof TEST_IDS;