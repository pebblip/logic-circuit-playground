/**
 * Cypressテスト用のセレクタヘルパー
 * data-testid属性を使用した堅牢な要素選択を提供
 */

import { TEST_IDS } from '../../constants/testIds';

/**
 * data-testidによるセレクタを生成
 */
export const byTestId = (testId: string) => `[data-testid="${testId}"]`;

/**
 * ARIA属性によるセレクタを生成
 */
export const byRole = (role: string, name?: string) => {
  return name ? `[role="${role}"][aria-label="${name}"]` : `[role="${role}"]`;
};

/**
 * 特定の属性によるセレクタを生成
 */
export const byAttribute = (attr: string, value: string) => `[${attr}="${value}"]`;

/**
 * 複合セレクタの生成
 */
export const selectors = {
  // モード選択
  modeSelector: {
    root: () => byTestId(TEST_IDS.modeSelector.root),
    learningButton: () => byTestId(TEST_IDS.modeSelector.learningModeBtn),
    freeButton: () => byTestId(TEST_IDS.modeSelector.freeModeBtn),
    puzzleButton: () => byTestId(TEST_IDS.modeSelector.puzzleModeBtn),
    activeMode: () => `${byTestId(TEST_IDS.modeSelector.root)} button[aria-pressed="true"]`
  },

  // 学習モード
  learning: {
    sidePanel: () => byTestId(TEST_IDS.learning.sidePanel),
    guide: () => byTestId(TEST_IDS.learning.guide),
    progress: () => byTestId(TEST_IDS.learning.progress),
    statistics: () => byTestId(TEST_IDS.learning.statistics),
    lessonList: () => byTestId(TEST_IDS.learning.lessonList),
    lesson: (id: number) => byTestId(TEST_IDS.learning.lessonItem(id)),
    tutorialButton: () => byTestId(TEST_IDS.learning.tutorialBtn)
  },

  // チュートリアル
  tutorial: {
    overlay: () => byTestId(TEST_IDS.tutorial.overlay),
    panel: () => byTestId(TEST_IDS.tutorial.panel),
    nextButton: () => byTestId(TEST_IDS.tutorial.nextBtn),
    skipButton: () => byTestId(TEST_IDS.tutorial.skipBtn),
    progressBar: () => byTestId(TEST_IDS.tutorial.progressBar)
  },

  // 初回起動モーダル
  welcomeModal: {
    root: () => byTestId(TEST_IDS.welcomeModal.root),
    skipButton: () => byTestId(TEST_IDS.welcomeModal.skipBtn),
    nextButton: () => byTestId(TEST_IDS.welcomeModal.nextBtn)
  },

  // ヘッダー
  header: {
    root: () => byTestId(TEST_IDS.header.root),
    logo: () => byTestId(TEST_IDS.header.logo),
    currentMode: () => byTestId(TEST_IDS.header.currentModeDisplay)
  },

  // 汎用モーダル
  modal: {
    backdrop: () => byTestId(TEST_IDS.modal.backdrop),
    content: () => byTestId(TEST_IDS.modal.content),
    closeButton: () => byTestId(TEST_IDS.modal.closeBtn)
  }
};

// Cypress専用のヘルパー関数（実際の実装はcypress/support/test-helpers.jsで行う）
// ここではセレクタの生成のみを担当