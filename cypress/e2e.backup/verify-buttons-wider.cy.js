describe('Verify All Buttons on Wider Screen', () => {
  it('should show all three header buttons on wider viewport', () => {
    cy.viewport(1600, 900);
    cy.visit('/');
    
    // ヘッダーアクションコンテナを確認
    cy.get('.header-actions').should('be.visible');
    
    // すべてのボタンを確認し、テキストをログ出力
    cy.get('.header-actions .button').each(($button, index) => {
      cy.wrap($button).should('be.visible');
      const text = $button.text();
      cy.log(`Button ${index}: ${text}`);
    });
    
    // ボタンの位置情報を取得
    cy.get('.header').then($header => {
      const headerRect = $header[0].getBoundingClientRect();
      
      cy.get('.header-actions').then($actions => {
        const actionsRect = $actions[0].getBoundingClientRect();
        cy.log(`Header width: ${headerRect.width}px`);
        cy.log(`Actions right edge: ${actionsRect.right}px`);
        cy.log(`Distance from right: ${headerRect.right - actionsRect.right}px`);
      });
    });
    
    // フルヘッダーのスクリーンショット
    cy.screenshot('wider-header-buttons');
  });
});