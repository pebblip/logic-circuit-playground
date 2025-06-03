describe('Check Current UI', () => {
  it('should take screenshot of current UI', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    cy.wait(1000); // 確実に読み込まれるまで待つ
    
    // ヘッダーが表示されているか確認
    cy.get('.header').should('be.visible');
    
    // スクリーンショットを撮る
    cy.screenshot('current-ui-state', { capture: 'fullPage' });
  });
});