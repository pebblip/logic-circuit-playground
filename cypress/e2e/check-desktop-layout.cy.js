describe('Check Desktop Layout', () => {
  it('should confirm desktop layout is being used', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    
    // デスクトップレイアウトのクラスを確認
    cy.get('.app-container').should('exist');
    
    // ヘッダーのコンテンツを確認
    cy.get('.header').within(() => {
      // ロゴを確認
      cy.get('.logo').should('contain', '論理回路プレイグラウンド');
      
      // モードタブを確認
      cy.get('.mode-tabs').should('exist');
      cy.get('.mode-tab').should('have.length', 3);
      
      // header-actionsを確認
      cy.get('.header-actions').should('exist').then($actions => {
        cy.log(`header-actions HTML: ${$actions.html()}`);
      });
    });
    
    // デバッグ：ブレークポイントを確認
    cy.window().then(win => {
      cy.log(`Window width: ${win.innerWidth}`);
      cy.log(`Expected desktop (>1024): ${win.innerWidth > 1024}`);
    });
    
    // スクリーンショット
    cy.screenshot('desktop-layout-check');
  });
});