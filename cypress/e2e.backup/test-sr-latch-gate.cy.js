describe('Test SR-LATCH Gate', () => {
  it('should set and reset state correctly', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // SR-LATCHゲートを追加
    cy.get('.tool-card').contains('SR-LATCH').parent().click();
    cy.get('svg.canvas').click(400, 300);
    
    // INPUTゲート（S入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 250);
    
    // INPUTゲート（R入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 350);
    
    // OUTPUTゲート（Q出力確認用）を追加
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('svg.canvas').click(600, 250);
    
    // ゲートが4つ追加されたことを確認
    cy.get('svg.canvas .gate-container').should('have.length', 4);
    
    // ワイヤー接続
    // 1. S入力 -> SR-LATCHのS入力
    cy.get('.gate-container[data-gate-id]').eq(1).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="-20"][fill="transparent"]').click();
    });
    
    // 2. R入力 -> SR-LATCHのR入力
    cy.get('.gate-container[data-gate-id]').eq(2).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="20"][fill="transparent"]').click();
    });
    
    // 3. SR-LATCHのQ出力 -> OUTPUTゲート
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="60"][cy="-20"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(3).within(() => {
      cy.get('circle[cx="-30"][fill="transparent"]').click();
    });
    
    // 初期状態：S=0, R=0, Q=0を確認
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    cy.screenshot('sr-latch-initial');
    
    // SET動作：S=1, R=0 → Q=1
    cy.get('.gate-container[data-gate-id]').eq(1).click(); // S入力をON
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    cy.screenshot('sr-latch-set');
    
    // 状態保持：S=0, R=0 → Q=1（保持）
    cy.get('.gate-container[data-gate-id]').eq(1).click(); // S入力をOFF
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    cy.screenshot('sr-latch-hold-set');
    
    // RESET動作：S=0, R=1 → Q=0
    cy.get('.gate-container[data-gate-id]').eq(2).click(); // R入力をON
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    cy.screenshot('sr-latch-reset');
    
    // 状態保持：S=0, R=0 → Q=0（保持）
    cy.get('.gate-container[data-gate-id]').eq(2).click(); // R入力をOFF
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    cy.screenshot('sr-latch-hold-reset');
  });
});