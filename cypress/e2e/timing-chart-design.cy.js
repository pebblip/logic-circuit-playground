describe('タイミングチャートのデザイン確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('タイミングチャートパネルのデザインを確認', () => {
    // トグルボタンが表示されていることを確認
    cy.get('.timing-chart-toggle-button').should('be.visible');
    
    // タイミングチャートのトグルボタンをクリック
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // タイミングチャートパネルが表示されることを確認
    cy.get('.timing-chart-panel').should('be.visible');
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // デザイン確認用のスクリーンショット
    cy.screenshot('timing-chart-design-1-panel-open', { capture: 'viewport' });
    
    // 設定ボタンをクリック
    cy.get('.timing-chart-button[title="設定"]').click();
    cy.wait(300);
    
    // 設定パネルが表示されている状態
    cy.screenshot('timing-chart-design-2-settings-open', { capture: 'viewport' });
    
    // 設定を閉じる
    cy.get('.timing-chart-button[title="設定"]').click();
    cy.wait(300);
    
    // パネルを閉じる
    cy.get('.timing-chart-button[title="閉じる"]').click();
    cy.wait(300);
    
    // パネルが閉じた状態
    cy.screenshot('timing-chart-design-3-panel-closed', { capture: 'viewport' });
    
    // トグルボタンのホバー状態を確認
    cy.get('.timing-chart-toggle-button').trigger('mouseover');
    cy.wait(100);
    cy.screenshot('timing-chart-design-4-toggle-hover', { capture: 'viewport' });
  });

  it('空の状態のデザインを確認', () => {
    // タイミングチャートを開く（回路なし）
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 空の状態のデザイン
    cy.screenshot('timing-chart-design-5-empty-state', { capture: 'viewport' });
  });
});