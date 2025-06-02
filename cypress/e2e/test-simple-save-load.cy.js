describe('Simple Save and Load Test', () => {
  it('should save and load a simple circuit', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // 1. シンプルな回路を作成（INPUTとOUTPUTのみ）
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(300, 300);
    
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('svg.canvas').click(500, 300);
    
    // キャンバス上のゲートが2つあることを確認
    cy.get('svg.canvas .gate-container').should('have.length', 2);
    
    // 2. 回路を保存
    cy.get('.header-actions .button[title="回路を保存"]').click();
    cy.get('.save-dialog').should('be.visible');
    
    cy.get('#circuit-name').clear().type('シンプルテスト回路');
    cy.get('.dialog-footer .button.primary').click();
    
    // 保存ダイアログが閉じるのを待つ
    cy.get('.save-dialog').should('not.exist');
    cy.wait(1000);
    
    // 3. ページをリロード（回路がクリアされる）
    cy.reload();
    cy.wait(500);
    
    // キャンバス上にゲートがないことを確認
    cy.get('svg.canvas .gate-container').should('not.exist');
    
    // 4. 保存した回路を読み込む
    cy.get('.header-actions .button[title="回路を読み込み"]').click();
    cy.get('.load-dialog').should('be.visible');
    
    // 保存した回路がリストに表示されているか確認
    cy.get('.circuit-card').should('exist');
    cy.get('.circuit-name').contains('シンプルテスト回路').should('exist');
    
    // 回路をクリックして選択
    cy.get('.circuit-card').first().click();
    
    // 読み込みボタンをクリック
    cy.get('.load-dialog .button.primary').contains('読み込み').click();
    
    // 5. 回路が復元されたか確認
    cy.wait(1000);
    cy.get('.gate').should('have.length', 2);
    
    cy.screenshot('simple-load-success');
  });
});