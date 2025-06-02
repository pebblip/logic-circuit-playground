describe('Test Load Functionality', () => {
  it('should successfully load a previously saved circuit', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // 1. まず回路を保存（事前準備）
    // シンプルなANDゲート回路を作成
    cy.get('.tool-card').contains('AND').parent().click();
    cy.get('svg.canvas').click(400, 300);
    
    // 保存
    cy.get('.header-actions .button[title="回路を保存"]').click();
    cy.get('#circuit-name').clear().type('読み込みテスト回路');
    cy.get('.dialog-footer .button.primary').click();
    cy.wait(1000);
    
    // 2. ページをリロードして回路をクリア
    cy.reload();
    cy.wait(500);
    
    // 3. 読み込み機能をテスト
    cy.get('.header-actions .button[title="回路を読み込み"]').click();
    
    // 読み込みダイアログの確認
    cy.get('.load-dialog').should('be.visible');
    
    // 保存した回路の存在確認
    cy.get('.circuit-card').should('exist');
    cy.get('.circuit-name').should('contain', '読み込みテスト回路');
    
    // 回路情報の確認
    cy.get('.circuit-meta').should('contain', '1ゲート');
    
    // 回路を選択
    cy.get('.circuit-card').first().click();
    
    // 読み込みボタンをクリック
    cy.get('.load-dialog .button.primary').click();
    
    // ダイアログが閉じることを確認
    cy.get('.load-dialog').should('not.exist');
    
    // 4. 回路が正しく読み込まれたか確認
    cy.wait(1000);
    
    // ANDゲートが復元されているか確認
    cy.get('svg.canvas .gate-container').should('have.length', 1);
    cy.get('.gate-text').should('contain', 'AND');
    
    cy.screenshot('load-test-success');
  });
});