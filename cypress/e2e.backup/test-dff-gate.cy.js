describe('Test D-FF Gate', () => {
  it('should hold data on clock edge', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // D-FFゲートを追加
    cy.get('.tool-card').contains('D-FF').parent().click();
    cy.get('svg.canvas').click(400, 300);
    
    // INPUTゲート（データ入力用）を追加
    cy.get('.tool-card').contains('INPUT').parent().click();
    cy.get('svg.canvas').click(200, 250);
    
    // CLOCKゲートを追加
    cy.get('.tool-card').contains('CLOCK').parent().click();
    cy.get('svg.canvas').click(200, 350);
    
    // OUTPUTゲート（出力確認用）を追加
    cy.get('.tool-card').contains('OUTPUT').parent().click();
    cy.get('svg.canvas').click(600, 250);
    
    // ゲートが4つ追加されたことを確認
    cy.get('svg.canvas .gate-container').should('have.length', 4);
    
    // ワイヤー接続
    // 1. INPUTゲート -> D-FFのD入力
    cy.get('.gate-container[data-gate-id]').eq(1).within(() => {
      cy.get('circle[cx="35"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="-20"][fill="transparent"]').click();
    });
    
    // 2. CLOCKゲート -> D-FFのCLK入力
    cy.get('.gate-container[data-gate-id]').eq(2).within(() => {
      cy.get('circle[cx="55"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="-60"][cy="20"][fill="transparent"]').click();
    });
    
    // 3. D-FFのQ出力 -> OUTPUTゲート
    cy.get('.gate-container[data-gate-id]').eq(0).within(() => {
      cy.get('circle[cx="60"][cy="-20"][fill="transparent"]').click();
    });
    cy.get('.gate-container[data-gate-id]').eq(3).within(() => {
      cy.get('circle[cx="-30"][fill="transparent"]').click();
    });
    
    // 初期状態：入力OFF、出力OFFを確認
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    // INPUTをONに設定
    cy.get('.gate-container[data-gate-id]').eq(1).click();
    
    // CLOCKを開始（まだ出力は変わらない）
    cy.get('.gate-container[data-gate-id]').eq(2).click();
    
    // クロックエッジで出力がONになることを確認
    cy.wait(1500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    cy.screenshot('dff-data-captured');
    
    // INPUTをOFFに戻す
    cy.get('.gate-container[data-gate-id]').eq(1).click();
    
    // 出力は保持されていることを確認
    cy.wait(1500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#00ff88');
    
    // 次のクロックエッジで出力がOFFになることを確認
    cy.wait(1500);
    cy.get('.gate-container[data-gate-id]').eq(3).find('circle[r="15"]').should('have.attr', 'fill', '#333');
    
    cy.screenshot('dff-data-updated');
    
    // CLOCKを停止（選択を解除してからクリック）
    cy.get('svg.canvas').click(700, 100); // 空いている場所をクリックして選択解除
    cy.get('.gate-container[data-gate-id]').eq(2).click();
  });
});