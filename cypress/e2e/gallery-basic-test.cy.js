describe('ギャラリー基本回路動作テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
  });

  it('半加算器が正しく動作する', () => {
    cy.contains('半加算器').parent().parent().find('button').contains('詳細を見る').click();
    cy.contains('キャンバスで開く').click();
    cy.wait(2000); // モード切り替えと回路読み込みを待つ
    
    // ゲートが読み込まれているか確認
    cy.get('[data-testid="gate-input-a"]').should('exist');
    cy.get('[data-testid="gate-input-b"]').should('exist');
    cy.get('[data-testid="output-output-sum"]').should('exist');
    cy.get('[data-testid="output-output-carry"]').should('exist');
    
    // シミュレーションが安定するまで少し待つ
    cy.wait(1000);
    
    // 初期状態: 0 + 0 = 0 (carry: 0)
    cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'false');
    cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'false');
    
    // 1 + 0 = 1 (carry: 0)
    cy.get('[data-testid="gate-input-a"]').click();
    cy.wait(200);
    cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'true');
    cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'false');
    
    // 1 + 1 = 0 (carry: 1)
    cy.get('[data-testid="gate-input-b"]').click();
    cy.wait(200);
    cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'false');
    cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'true');
  });
});