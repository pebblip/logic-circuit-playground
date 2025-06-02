describe('Test CLOCK Gate', () => {
  it('should generate periodic signals', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // CLOCKゲートを追加
    cy.get('.tool-card').contains('CLOCK').parent().click();
    cy.get('svg.canvas').click(300, 300);
    
    // OUTPUTゲートを追加（信号を確認するため）
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('svg.canvas').click(500, 300);
    
    // CLOCKゲートが追加されたことを確認
    cy.get('svg.canvas .gate-container').should('have.length', 2);
    // CLOCKゲートは時計アイコンで表示される
    cy.get('.gate-text').contains('⏰').should('exist');
    
    // CLOCKゲートの出力ピンを探す
    cy.get('.gate-container[data-gate-id]').first().within(() => {
      // 出力ピンをクリックしてワイヤー接続開始（透明なクリック領域を使用）
      cy.get('circle[cx="55"][fill="transparent"]').click();
    });
    
    // OUTPUTゲートの入力ピンに接続
    cy.get('.gate-container[data-gate-id]').last().within(() => {
      cy.get('circle[cx="-30"][fill="transparent"]').click();
    });
    
    // ワイヤーが接続されたことを確認
    cy.get('.wire').should('have.length', 1);
    
    // 初期状態を確認（CLOCKはデフォルトでOFF）
    cy.get('.wire').should('not.have.class', 'active');
    
    // CLOCKゲートをクリックして開始（時計アイコンを含む円をクリック）
    cy.get('.gate-text').contains('⏰').parent().parent().click();
    
    // 信号が周期的に変化することを確認
    // アクティブになるのを待つ
    cy.get('.wire.active', { timeout: 2000 }).should('exist');
    
    // 非アクティブになるのを待つ
    cy.get('.wire:not(.active)', { timeout: 2000 }).should('exist');
    
    // もう一度アクティブになるのを待つ
    cy.get('.wire.active', { timeout: 2000 }).should('exist');
    
    cy.screenshot('clock-gate-running');
    
    // CLOCKゲートをもう一度クリックして停止
    cy.get('.gate-text').contains('⏰').parent().parent().click();
    
    cy.wait(1000);
    cy.screenshot('clock-gate-stopped');
  });
});