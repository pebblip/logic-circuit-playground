describe('新しい回路図レンダラーV2のテスト', () => {
  it('レッスン7で新しいCircuitDiagramRendererV2が動作する', () => {
    // 直接レッスンURLにアクセス
    cy.visit('/#learning/half-adder');
    
    // レッスンが読み込まれるまで少し待機
    cy.wait(1000);
    
    // レッスンタイトルが表示されることを確認
    cy.contains('半加算器').should('be.visible');
    
    // レッスンの2番目のステップ（concept）に移動
    cy.contains('次へ').click();
    
    // 新しい回路図レンダラーV2が表示されるかチェック
    cy.get('.circuit-diagram-v2', { timeout: 10000 }).should('exist');
    cy.get('.lesson-circuit-svg', { timeout: 10000 }).should('exist');
    
    // スクリーンショットを撮影
    cy.screenshot('new-circuit-diagram-v2-half-adder');
  });
});