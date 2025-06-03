describe('Test Load Circuit on Mobile', () => {
  it('should save and load circuit on mobile view', () => {
    // モバイルビューに設定
    cy.viewport(375, 667);
    cy.visit('/');
    
    cy.wait(500);
    
    // FloatingActionButtonsが表示されているか確認
    cy.get('.fab.main-fab').should('be.visible');
    
    // メインFABをクリックして展開
    cy.get('.fab.main-fab').click();
    
    // 読み込みボタンが表示されるか確認
    cy.get('.fab.secondary[title="読み込み"]').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('mobile-fab-menu');
    
    // 読み込みボタンをクリック
    cy.get('.fab.secondary[title="読み込み"]').click();
    
    // 読み込みダイアログが表示されるか確認
    cy.get('.load-dialog').should('be.visible');
    
    cy.screenshot('load-dialog');
  });
});