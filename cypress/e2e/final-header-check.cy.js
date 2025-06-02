describe('Final Header Check', () => {
  it('should show all buttons properly positioned', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // ヘッダーアクションコンテナを確認
    cy.get('.header-actions').should('be.visible');
    
    // すべてのボタンが表示されているか確認
    cy.get('.header-actions .button').should('have.length', 3);
    
    // 各ボタンを確認
    cy.get('.header-actions .button').eq(0).should('contain', '保存').should('be.visible');
    cy.get('.header-actions .button').eq(1).should('contain', '共有').should('be.visible');
    cy.get('.header-actions .button').eq(2).should('contain', '実行').should('be.visible');
    
    // 実行ボタンが完全に表示されているか確認
    cy.get('.header-actions .button.primary').then($btn => {
      const btnRect = $btn[0].getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // ボタンの右端がビューポート内にあることを確認
      expect(btnRect.right).to.be.lessThan(viewportWidth);
      
      // 適切なマージンがあることを確認
      const rightMargin = viewportWidth - btnRect.right;
      expect(rightMargin).to.be.greaterThan(20);
      
      cy.log(`Execute button right margin: ${rightMargin}px`);
    });
    
    // 最終的なスクリーンショット
    cy.screenshot('final-header-buttons');
  });
  
  it('should also work on wider screens', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    
    // すべてのボタンが表示されているか確認
    cy.get('.header-actions .button').should('have.length', 3).should('be.visible');
    
    cy.screenshot('final-header-buttons-wide');
  });
});