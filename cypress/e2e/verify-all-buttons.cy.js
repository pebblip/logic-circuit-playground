describe('Verify All Header Buttons', () => {
  it('should show all three header buttons', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // ヘッダーアクションコンテナを確認
    cy.get('.header-actions').should('be.visible');
    
    // すべてのボタンを確認
    cy.get('.header-actions .button').should('have.length', 3);
    
    // 各ボタンの内容を確認
    cy.get('.header-actions .button').eq(0).should('contain', '保存');
    cy.get('.header-actions .button').eq(1).should('contain', '共有');
    cy.get('.header-actions .button').eq(2).should('contain', '実行');
    
    // 実行ボタンがprimaryクラスを持つか確認
    cy.get('.header-actions .button').eq(2).should('have.class', 'primary');
    
    // ヘッダー全体の幅を取得
    cy.get('.header').then($header => {
      const headerWidth = $header.width();
      cy.log(`Header width: ${headerWidth}px`);
      
      // header-actionsの位置を確認
      cy.get('.header-actions').then($actions => {
        const actionsRight = $actions[0].getBoundingClientRect().right;
        const headerRight = $header[0].getBoundingClientRect().right;
        const distanceFromRight = headerRight - actionsRight;
        
        cy.log(`Distance from right edge: ${distanceFromRight}px`);
        
        // 右端から適切な距離にあることを確認（パディングを考慮）
        expect(distanceFromRight).to.be.lessThan(30);
      });
    });
    
    // フルヘッダーのスクリーンショット
    cy.screenshot('full-header-buttons');
  });
});