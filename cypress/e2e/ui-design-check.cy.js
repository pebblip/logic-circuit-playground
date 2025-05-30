/**
 * UIデザイン確認用テスト
 */

describe('UIデザイン確認', () => {
  it('学習モードのデザインを確認', () => {
    // LocalStorageをクリアして初回起動状態にする
    cy.clearLocalStorage();
    cy.visit('/');
    
    // アプリケーションが完全に読み込まれるまで待つ
    cy.wait(2000);
    
    // 初回起動モーダルがある場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
      }
    });
    
    // 学習モードが選択されていることを確認
    cy.wait(1000);
    cy.screenshot('01-initial-state', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // 自由モードに切り替え
    cy.get('[data-testid="mode-btn-free"]').should('be.visible').click();
    cy.wait(1000);
    cy.screenshot('02-free-mode', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // パズルモードに切り替え
    cy.get('[data-testid="mode-btn-puzzle"]').should('be.visible').click();
    cy.wait(1000);
    cy.screenshot('03-puzzle-mode', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // 学習モードに戻る
    cy.get('[data-testid="mode-btn-learning"]').should('be.visible').click();
    cy.wait(1000);
    cy.screenshot('04-learning-mode-with-panel', { 
      capture: 'fullPage',
      overwrite: true 
    });
  });

  it('モードボタンのデザインと状態を確認', () => {
    cy.setupApp({ mode: 'learning', skipWelcome: true });
    
    // モードセレクター部分をズーム
    cy.wait(1000);
    cy.get('[data-testid="mode-btn-learning"]').parent().parent().screenshot('05-mode-selector-learning', {
      overwrite: true
    });
    
    // 各モードのホバー状態をキャプチャ
    cy.get('[data-testid="mode-btn-free"]').trigger('mouseover');
    cy.wait(500);
    cy.get('[data-testid="mode-btn-learning"]').parent().parent().screenshot('06-mode-selector-hover-free', {
      overwrite: true
    });
    
    // アクティブ状態を確認
    cy.get('[data-testid="mode-btn-free"]').click();
    cy.wait(500);
    cy.get('[data-testid="mode-btn-learning"]').parent().parent().screenshot('07-mode-selector-active-free', {
      overwrite: true
    });
  });

  it('学習ガイドパネルの詳細デザインを確認', () => {
    cy.setupApp({ mode: 'learning', skipWelcome: true });
    cy.wait(1000);
    
    // 学習ガイドパネルが表示されていることを確認
    cy.get('[data-testid="learning-guide"]').should('be.visible');
    
    // パネル部分のスクリーンショット
    cy.get('[data-testid="learning-guide"]').screenshot('08-learning-guide-panel', {
      overwrite: true
    });
    
    // レッスンアイテムをクリックして展開
    cy.get('[role="button"][aria-label*="レッスン2"]').first().click();
    cy.wait(500);
    cy.get('[data-testid="learning-guide"]').screenshot('09-learning-guide-expanded', {
      overwrite: true
    });
  });

  it('ツールパレットとキャンバスのデザインを確認', () => {
    cy.setupApp({ mode: 'free', skipWelcome: true });
    cy.wait(1000);
    
    // 全体的なレイアウト
    cy.screenshot('10-free-mode-full-layout', { 
      capture: 'fullPage',
      overwrite: true 
    });
    
    // ツールパレット部分（サイドバーが表示されている場合）
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="tool-palette"]').length > 0) {
        cy.get('[data-testid="tool-palette"]').screenshot('11-tool-palette', {
          overwrite: true
        });
      } else {
        // ツールパレットが見つからない場合は画面全体の一部をキャプチャ
        cy.screenshot('11-tool-palette-not-found', {
          overwrite: true
        });
      }
    });
  });
});