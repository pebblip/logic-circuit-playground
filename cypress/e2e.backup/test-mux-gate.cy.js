describe('Test MUX Gate', () => {
  it('should select input based on selector', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // MUXゲートを追加
    cy.get('.tool-card').contains('MUX').parent().click();
    cy.get('svg.canvas').click(400, 300);
    
    // INPUTゲート（A入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 200);
    
    // INPUTゲート（B入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 300);
    
    // INPUTゲート（SEL入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 400);
    
    // OUTPUTゲート（出力確認用）を追加
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('svg.canvas').click(600, 300);
    
    // ゲートが5つ追加されたことを確認
    cy.get('svg.canvas .gate-container').should('have.length', 5);
    
    // ワイヤー接続
    // 1. A入力 -> MUXのA入力（上）
    cy.get('.gate-container[data-gate-id]').eq(1).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="-25"][fill="transparent"]').click();
    });
    
    // 2. B入力 -> MUXのB入力（中）
    cy.get('.gate-container[data-gate-id]').eq(2).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="0"][fill="transparent"]').click();
    });
    
    // 3. SEL入力 -> MUXのSEL入力（下）
    cy.get('.gate-container[data-gate-id]').eq(3).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="25"][fill="transparent"]').click();
    });
    
    // 4. MUXの出力 -> OUTPUTゲート
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="60"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(4).within(() => {
      cy.get('circle[cx="-30"][fill="transparent"]').click();
    });
    
    // 初期状態：A=0, B=0, SEL=0 → OUT=0（Aが選択）
    cy.get('.gate-container[data-gate-id]').eq(4).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    cy.screenshot('mux-initial');
    
    // テスト1：SEL=0でA入力が出力される
    cy.get('.gate-container[data-gate-id]').eq(1).click(); // A入力をON
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(4).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    cy.screenshot('mux-sel0-a1');
    
    // テスト2：SEL=1でB入力が出力される
    cy.get('.gate-container[data-gate-id]').eq(3).click(); // SEL入力をON
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(4).find('circle[r="15"]').should('have.attr', 'fill', '#333'); // B=0なのでOFF
    
    cy.get('.gate-container[data-gate-id]').eq(2).click(); // B入力をON
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(4).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    cy.screenshot('mux-sel1-b1');
    
    // テスト3：SEL=1のままA入力を変更しても出力は変わらない
    cy.get('.gate-container[data-gate-id]').eq(1).click(); // A入力をOFF
    cy.wait(500);
    cy.get('.gate-container[data-gate-id]').eq(4).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88'); // B=1のまま
    
    cy.screenshot('mux-sel1-a0-b1');
  });
});