describe('Tablet Header Test', () => {
  it('should display header buttons correctly in tablet view', () => {
    // タブレットビューポート
    cy.viewport(768, 1024);
    cy.visit('/');
    cy.wait(2000);
    
    // ヘッダーの構造を確認
    cy.get('.header').should('be.visible');
    cy.get('.logo').should('contain', '論理回路プレイグラウンド');
    cy.get('.mode-tabs').should('be.visible');
    
    // アクションボタンを確認
    cy.get('.header-actions').should('be.visible');
    cy.get('.header-actions button').should('have.length', 3);
    
    // 各ボタンの存在を確認
    cy.get('.header-actions button').eq(0).should('contain', '保存');
    cy.get('.header-actions button').eq(1).should('contain', '共有');
    cy.get('.header-actions button').eq(2).should('contain', '実行');
    
    // ボタンがbutton要素であることを確認
    cy.get('.header-actions button').each(($btn) => {
      cy.wrap($btn).should('have.prop', 'tagName', 'BUTTON');
      cy.wrap($btn).should('have.class', 'action-button');
    });
    
    // スクリーンショット
    cy.screenshot('tablet-header-check');
  });
});