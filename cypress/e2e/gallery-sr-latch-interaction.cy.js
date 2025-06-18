describe('Gallery SR-LATCH Interaction Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    
    // ギャラリーモードに切り替え
    cy.get('button').contains('ギャラリーモード').click();
    cy.wait(500);
  });

  it('SR-LATCHの入力切り替えで出力が変化する', () => {
    // SR-LATCHを選択
    cy.get('.circuit-item').contains('SRラッチ').click();
    cy.wait(1000);
    
    // SVGが表示されていることを確認
    cy.get('svg.gallery-canvas').should('be.visible');
    
    // ゲートが表示されていることを確認
    cy.get('[data-testid="gate-S"]').should('exist');
    cy.get('[data-testid="gate-R"]').should('exist');
    
    // S入力の初期状態を確認（falseの場合は背景が暗い）
    cy.get('[data-testid="gate-S"]').within(() => {
      cy.get('rect').should('have.attr', 'fill', '#1a1a1a');
    });
    
    // S入力をダブルクリック
    cy.get('[data-testid="gate-S"]').dblclick();
    cy.wait(1000);
    
    // S入力がtrueになったことを確認（背景が明るくなる）
    cy.get('[data-testid="gate-S"]').within(() => {
      cy.get('rect').should('have.attr', 'fill', 'rgba(0, 255, 136, 0.1)');
    });
    
    // ワイヤーが存在することを確認
    cy.get('path.wire').should('have.length.greaterThan', 0);
    
    // アクティブなワイヤーが存在することを確認
    cy.get('path.wire.active').should('exist');
  });

  it('循環回路の警告メッセージが表示される', () => {
    // SR-LATCHを選択
    cy.get('.circuit-item').contains('SRラッチ').click();
    
    // 警告メッセージを確認
    cy.get('.cyclical-warning')
      .should('exist')
      .should('contain', 'この回路は循環構造を持ちます')
      .should('contain', 'イベント駆動シミュレーションで動作中');
  });

  it('複数回の入力切り替えでも正常動作する', () => {
    // SR-LATCHを選択
    cy.get('.circuit-item').contains('SRラッチ').click();
    cy.wait(500);
    
    // S入力を5回連続で切り替え
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="gate-S"]').dblclick();
      cy.wait(100);
    }
    
    // R入力を5回連続で切り替え
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="gate-R"]').dblclick();
      cy.wait(100);
    }
    
    // エラーが発生していないことを確認
    cy.get('.error-message').should('not.exist');
    
    // 回路がまだ表示されていることを確認
    cy.get('svg').should('be.visible');
    cy.get('[data-testid^="gate-"]').should('have.length.at.least', 6);
  });
});