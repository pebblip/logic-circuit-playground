/**
 * 学習モード最終確認テスト
 */

describe('学習モード最終確認', () => {
  it('学習モードでサイドパネルが正しく表示される', () => {
    // 学習モードで起動
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('circuit-app-mode', 'learning');
        win.localStorage.setItem('hasSeenModeSelector', 'true');
        win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
          mode: 'learning',
          tutorialCompleted: true,
          skipModeSelection: true
        }));
      }
    });
    
    cy.wait(3000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // 全体のスクリーンショット
    cy.screenshot('01-learning-mode-with-panel', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // ビューポート内のスクリーンショット
    cy.screenshot('02-learning-mode-viewport', { 
      capture: 'viewport',
      overwrite: true 
    });
  });

  it('自由モードに切り替えるとサイドパネルが消える', () => {
    cy.visit('/');
    cy.wait(3000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // 自由モードボタンをクリック
    cy.contains('button', '自由モード').click();
    cy.wait(1000);
    
    cy.screenshot('03-free-mode-no-panel', { 
      capture: 'viewport',
      overwrite: true 
    });
  });

  it('パズルモードでもサイドパネルが表示されない', () => {
    cy.visit('/');
    cy.wait(3000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // パズルモードボタンをクリック
    cy.contains('button', 'パズルモード').click();
    cy.wait(1000);
    
    cy.screenshot('04-puzzle-mode-no-panel', { 
      capture: 'viewport',
      overwrite: true 
    });
  });

  it('モードを切り替えてパネルの表示/非表示を確認', () => {
    cy.visit('/');
    cy.wait(3000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
        cy.wait(1000);
      }
    });
    
    // 学習モード
    cy.contains('button', '学習モード').click();
    cy.wait(1000);
    cy.screenshot('05-switched-to-learning', { 
      capture: 'viewport',
      overwrite: true 
    });
    
    // 自由モード
    cy.contains('button', '自由モード').click();
    cy.wait(1000);
    cy.screenshot('06-switched-to-free', { 
      capture: 'viewport',
      overwrite: true 
    });
    
    // 再び学習モード
    cy.contains('button', '学習モード').click();
    cy.wait(1000);
    cy.screenshot('07-back-to-learning', { 
      capture: 'viewport',
      overwrite: true 
    });
  });
});