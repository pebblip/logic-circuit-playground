/**
 * Cypressテストヘルパー関数
 * テキストに依存しない安定したテストを実現
 */

// セレクタヘルパーのインポート
// import { selectors } from '../../src/test/helpers/selectors';

/**
 * アプリケーションの初期化を待つ
 */
export function waitForAppInit() {
  // アプリケーションが完全に読み込まれるまで待つ
  cy.get('body').should('be.visible');
  // ヘッダーが表示されるまで待つ
  cy.get('#root').should('exist');
  cy.wait(1000); // 追加の安定化待機
}

/**
 * 初回起動画面をスキップ
 */
export function skipWelcomeScreen() {
  cy.get('body').then(($body) => {
    // data-testidで判定
    const welcomeModal = $body.find('[data-testid="welcome-modal-root"]');
    if (welcomeModal.length > 0) {
      cy.get('[data-testid="welcome-skip-btn"]').click();
      cy.wait(500);
    }
    
    // フォールバック: z-indexで判定
    const highZIndexModal = $body.find('[style*="z-index: 2000"]');
    if (highZIndexModal.length > 0) {
      // スキップボタンを探す（複数の方法で）
      const skipButton = highZIndexModal.find('button:contains("スキップ")');
      if (skipButton.length > 0) {
        cy.wrap(skipButton).first().click({ force: true });
      }
    }
  });
}

/**
 * LocalStorageの設定
 */
export function setLocalStorage(key, value) {
  cy.window().then((win) => {
    win.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
}

/**
 * 初期設定でアプリケーションを起動
 */
export function setupApp(options = {}) {
  const defaults = {
    skipWelcome: true,
    mode: 'learning',
    tutorialCompleted: true
  };
  
  const settings = { ...defaults, ...options };
  
  // LocalStorageを設定
  if (settings.skipWelcome) {
    setLocalStorage('hasSeenModeSelector', 'true');
    setLocalStorage('circuit-mode', JSON.stringify(settings.mode));
    setLocalStorage('logic-circuit-preferences', {
      mode: settings.mode,
      tutorialCompleted: settings.tutorialCompleted,
      skipModeSelection: true
    });
    setLocalStorage('logic-circuit-tutorial', {
      completed: settings.tutorialCompleted,
      currentStep: 999,
      badges: [],
      progress: {}
    });
  }
  
  cy.visit('/');
  waitForAppInit();
  
  if (settings.skipWelcome) {
    skipWelcomeScreen();
  }
}

/**
 * モードを切り替える（アクセシビリティクエリ優先）
 */
export function switchMode(targetMode) {
  const modeNames = {
    learning: '学習モード',
    free: '自由モード',
    puzzle: 'パズルモード'
  };
  
  if (modeNames[targetMode]) {
    // 優先: aria-labelで取得
    cy.get(`[aria-label="${modeNames[targetMode]}に切り替え"]`).click();
    cy.wait(500);
  } else {
    throw new Error(`Unknown mode: ${targetMode}`);
  }
}

/**
 * 現在のモードを確認（アクセシビリティ属性を活用）
 */
export function assertCurrentMode(expectedMode) {
  const modeNames = {
    learning: '学習モード',
    free: '自由モード',
    puzzle: 'パズルモード'
  };
  
  // アクティブなボタンの確認（aria-pressed属性を使用）
  cy.get(`[aria-label="${modeNames[expectedMode]}に切り替え"][aria-pressed="true"]`).should('exist');
  
  // フォールバック: data-testidベースの確認
  // cy.get(selectors.header.currentMode()).should('contain', expectedMode);
}

/**
 * サイドパネルの存在確認
 */
export function assertSidePanelVisible(shouldBeVisible = true) {
  const assertion = shouldBeVisible ? 'exist' : 'not.exist';
  // cy.get(selectors.learning.sidePanel()).should(assertion);
  cy.get('[data-testid="side-panel"]').should(assertion);
}

/**
 * スクリーンショットを撮る（ラベル付き）
 */
export function takeScreenshot(label, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${label}_${timestamp}`;
  cy.screenshot(filename, options);
}

/**
 * アクセシビリティクエリヘルパー
 */
export function getByRole(role, options = {}) {
  let selector = `[role="${role}"]`;
  
  if (options.name) {
    // テキストコンテンツまたはaria-labelで検索
    return cy.contains(selector, options.name);
  }
  
  if (options.label) {
    selector += `[aria-label="${options.label}"]`;
  }
  
  return cy.get(selector);
}

export function getByAriaLabel(label) {
  return cy.get(`[aria-label="${label}"]`);
}

// Cypressコマンドとして登録
Cypress.Commands.add('setupApp', setupApp);
Cypress.Commands.add('switchMode', switchMode);
Cypress.Commands.add('assertCurrentMode', assertCurrentMode);
Cypress.Commands.add('assertSidePanelVisible', assertSidePanelVisible);
Cypress.Commands.add('takeScreenshot', takeScreenshot);
Cypress.Commands.add('getByRole', getByRole);
Cypress.Commands.add('getByAriaLabel', getByAriaLabel);