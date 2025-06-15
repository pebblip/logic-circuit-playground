describe('タイミングチャート基本動作確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('タイミングチャートの開閉を確認', () => {
    // 初期状態: パネルは閉じている
    cy.get('.timing-chart-main-panel').should('not.exist');
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').should('be.visible');
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが表示されることを確認
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-simple-1-open', { capture: 'viewport' });
    
    // 閉じるボタンをクリック
    cy.get('.timing-chart-button[title="閉じる"]').click();
    cy.wait(500);
    
    // パネルが閉じたことを確認
    cy.get('.timing-chart-main-panel').should('not.exist');
    cy.get('.timing-chart-toggle-button').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-simple-2-closed', { capture: 'viewport' });
  });
});