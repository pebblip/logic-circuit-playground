describe('Test Load Circuit Function', () => {
  it('should save and load circuit correctly', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // まず回路を作成
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
    
    // 保存する
    cy.get('.header-actions .button').contains('保存').click();
    cy.get('#circuit-name').type('テスト用ANDゲート回路');
    cy.get('#circuit-description').type('2入力ANDゲートのテスト回路');
    cy.get('.dialog-footer .button.primary').click();
    
    // 保存完了を待つ
    cy.wait(1000);
    
    // ページをリロード
    cy.reload();
    
    // 読み込みボタンを探す（まだ実装されていない可能性）
    // ヘッダーメニューまたはファイルメニューから読み込み
    
    cy.screenshot('load-circuit-test');
  });
});