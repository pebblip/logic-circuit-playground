/**
 * 学習モードパネル表示確認テスト
 */

describe('学習モードパネル表示確認', () => {
  it('学習モードでサイドパネルが表示される', () => {
    // LocalStorageを設定して学習モードで起動
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('circuit-app-mode', 'learning');
        win.localStorage.setItem('hasSeenModeSelector', 'true');
        win.localStorage.setItem('circuit-mode', JSON.stringify('learning'));
        win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
          mode: 'learning',
          tutorialCompleted: true,
          skipModeSelection: true
        }));
      }
    });
    
    // アプリケーションが読み込まれるまで待つ
    cy.wait(2000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
      }
    });
    
    cy.wait(1000);
    
    // スクリーンショットを撮る
    cy.screenshot('01-learning-mode-initial', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // 学習ガイドパネルが表示されているか確認
    cy.get('[data-testid="learning-guide"]').should('be.visible');
    
    // パネルのスクリーンショット
    cy.get('[data-testid="learning-guide"]').screenshot('02-learning-guide-panel', {
      overwrite: true
    });
    
    // モードが学習モードになっているか確認
    cy.get('[aria-label="学習モードに切り替え"][aria-pressed="true"]').should('exist');
  });

  it('自由モードではサイドパネルが表示されない', () => {
    // LocalStorageを設定して自由モードで起動
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('circuit-app-mode', 'free');
        win.localStorage.setItem('hasSeenModeSelector', 'true');
        win.localStorage.setItem('circuit-mode', JSON.stringify('free'));
        win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
          mode: 'free',
          tutorialCompleted: true,
          skipModeSelection: true
        }));
      }
    });
    
    cy.wait(2000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
      }
    });
    
    cy.wait(1000);
    
    // スクリーンショットを撮る
    cy.screenshot('03-free-mode', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // 学習ガイドパネルが表示されていないことを確認
    cy.get('[data-testid="learning-guide"]').should('not.exist');
    
    // モードが自由モードになっているか確認
    cy.get('[aria-label="自由モードに切り替え"][aria-pressed="true"]').should('exist');
  });

  it('モード切り替えでパネルが表示/非表示される', () => {
    cy.visit('/');
    cy.wait(2000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
      }
    });
    
    cy.wait(1000);
    
    // 学習モードに切り替え
    cy.get('[aria-label="学習モードに切り替え"]').click();
    cy.wait(500);
    
    // パネルが表示されることを確認
    cy.get('[data-testid="learning-guide"]').should('be.visible');
    cy.screenshot('04-after-switch-to-learning', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // 自由モードに切り替え
    cy.get('[aria-label="自由モードに切り替え"]').click();
    cy.wait(500);
    
    // パネルが非表示になることを確認
    cy.get('[data-testid="learning-guide"]').should('not.exist');
    cy.screenshot('05-after-switch-to-free', { 
      capture: 'fullPage',
      overwrite: true 
    });
  });
});