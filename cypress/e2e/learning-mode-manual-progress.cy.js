describe('Learning Mode Manual Progress Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should use manual progression only', () => {
    // 学習モードを開く
    cy.contains('学習モード').click();
    cy.wait(500);
    
    // NOTゲートレッスンを開始
    cy.contains('NOTゲート').click();
    cy.wait(500);
    
    // プログレスバーと進捗インジケーターが表示されることを確認
    cy.get('.step-progress').should('be.visible');
    cy.get('.progress-bar').should('be.visible');
    cy.get('.step-indicators').should('be.visible');
    
    // 初期状態の確認
    cy.get('.step-dot').first().should('have.class', 'current');
    cy.get('.progress-fill').should('have.attr', 'style').and('include', 'width: 0%');
    
    // 手動で次へ進む
    cy.contains('button', '進む').click();
    cy.wait(500);
    
    // 進捗が更新されることを確認
    cy.get('.step-dot').eq(0).should('have.class', 'completed');
    cy.get('.step-dot').eq(1).should('have.class', 'current');
    
    // NOTゲートを配置
    cy.get('[data-gate-type="NOT"]').click();
    cy.wait(500);
    
    // 検証状態が視覚的に表示されることを確認
    cy.get('.step-dot.current').should('have.class', 'validated');
    
    // 次へ進む
    cy.contains('button', '進む').click();
    cy.wait(500);
    
    // プログレスバーが更新されることを確認
    cy.get('.progress-fill').should('have.attr', 'style').and('not.include', 'width: 0%');
  });
});