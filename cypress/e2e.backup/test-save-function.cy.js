describe('Test Save Function', () => {
  it('should save circuit without errors', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // ゲートを追加
    cy.get('.tool-card').contains('AND').parent().click();
    cy.get('.canvas-container').click(200, 200);
    
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('.canvas-container').click(100, 180);
    cy.get('.canvas-container').click(100, 220);
    
    // 保存ボタンをクリック
    cy.get('.header-actions .button').contains('保存').click();
    
    // 保存ダイアログが表示されることを確認
    cy.get('.save-dialog').should('be.visible');
    
    // 回路名を入力
    cy.get('#circuit-name').type('テスト回路');
    
    // 説明を入力
    cy.get('#circuit-description').type('これはテスト用の回路です');
    
    // タグを追加
    cy.get('#circuit-tags').type('テスト');
    cy.get('.add-tag-button').click();
    
    // 保存を実行
    cy.get('.dialog-footer .button.primary').click();
    
    // エラーが表示されないことを確認
    cy.get('.error-message').should('not.exist');
    
    // ダイアログが閉じることを確認
    cy.get('.save-dialog').should('not.exist');
    
    // スクリーンショット
    cy.screenshot('save-success');
  });
});