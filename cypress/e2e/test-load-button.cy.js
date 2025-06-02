describe('Test Load Button', () => {
  it('should show load button in header', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // ヘッダーが表示されるまで待つ
    cy.get('.header').should('be.visible');
    
    // ヘッダーアクションのボタンを確認
    cy.get('.header-actions .button').then($buttons => {
      cy.log(`Found ${$buttons.length} buttons in header-actions`);
      
      $buttons.each((index, button) => {
        cy.log(`Button ${index}: ${button.textContent}, title: ${button.title}`);
      });
    });
    
    // 読み込みボタンが存在することを確認
    cy.get('.header-actions .button[title="回路を読み込み"]').should('exist').should('be.visible');
    
    // 読み込みボタンをクリック
    cy.get('.header-actions .button[title="回路を読み込み"]').click();
    
    // 読み込みダイアログが表示されることを確認
    cy.get('.load-dialog').should('be.visible');
    
    cy.screenshot('load-button-test');
  });
});