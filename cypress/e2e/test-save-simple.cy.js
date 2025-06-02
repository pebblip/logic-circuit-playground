describe('Test Save Without Gates', () => {
  it('should handle save dialog correctly', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    cy.wait(500);
    
    // 保存ボタンをクリック
    cy.get('.header-actions .button').contains('保存').click();
    
    // 保存ダイアログが表示されることを確認
    cy.get('.save-dialog').should('be.visible');
    
    // エラーメッセージが表示されることを確認（ゲートがない場合）
    cy.get('#circuit-name').type('空の回路');
    cy.get('.dialog-footer .button.primary').click();
    
    // エラーメッセージを確認
    cy.get('.error-message').should('contain', '保存する回路がありません');
    
    // キャンセルボタンでダイアログを閉じる
    cy.get('.dialog-footer .button.secondary').click();
    
    // ダイアログが閉じることを確認
    cy.get('.save-dialog').should('not.exist');
    
    // スクリーンショット
    cy.screenshot('save-dialog-test');
  });
});