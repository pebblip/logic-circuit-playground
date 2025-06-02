describe('Test Save and Load Circuit', () => {
  it('should save a circuit and then load it back', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // 1. 回路を作成
    // ANDゲートを追加
    cy.get('.tool-card').contains('AND').parent().click();
    cy.get('.canvas-container').click(400, 300);
    
    // INPUTゲートを2つ追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('.canvas-container').click(200, 250);
    cy.get('.canvas-container').click(200, 350);
    
    // OUTPUTゲートを追加
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('.canvas-container').click(600, 300);
    
    // ゲート数を確認
    cy.get('.gate').should('have.length', 4);
    
    // 2. 回路を保存
    cy.get('.header-actions .button[title="回路を保存"]').click();
    cy.get('#circuit-name').type('テストAND回路');
    cy.get('#circuit-description').type('AND回路の保存・読み込みテスト');
    cy.get('#circuit-tags').type('テスト');
    cy.get('.add-tag-button').click();
    cy.get('.dialog-footer .button.primary').click();
    
    // 保存ダイアログが閉じるのを待つ
    cy.get('.save-dialog').should('not.exist');
    cy.wait(500);
    
    // 3. 回路をクリア（新規作成）
    cy.get('.gate').each(($gate) => {
      cy.wrap($gate).click();
      cy.get('body').type('{del}');
    });
    
    // ゲートがすべて削除されたことを確認
    cy.get('.gate').should('have.length', 0);
    
    // 4. 保存した回路を読み込む
    cy.get('.header-actions .button[title="回路を読み込み"]').click();
    
    // 読み込みダイアログが表示される
    cy.get('.load-dialog').should('be.visible');
    
    // 保存した回路が表示されているか確認
    cy.get('.circuit-card').contains('テストAND回路').should('exist');
    
    // 回路をクリックして読み込む
    cy.get('.circuit-card').contains('テストAND回路').click();
    cy.get('.button.primary').contains('読み込み').click();
    
    // 5. 回路が正しく復元されたか確認
    cy.wait(1000);
    cy.get('.gate').should('have.length', 4);
    
    cy.screenshot('load-success');
  });
});