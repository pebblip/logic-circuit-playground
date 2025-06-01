describe('Input Pin Visual Final Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show green input pins on all gate types', () => {
    // 複雑な回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        // 上段: INPUT -> NOT -> OUTPUT
        const input1 = store.addGate('INPUT', { x: 100, y: 100 });
        const notGate = store.addGate('NOT', { x: 300, y: 100 });
        const output1 = store.addGate('OUTPUT', { x: 500, y: 100 });
        
        // 中段: INPUT x2 -> AND -> OUTPUT
        const input2 = store.addGate('INPUT', { x: 100, y: 200 });
        const input3 = store.addGate('INPUT', { x: 100, y: 300 });
        const andGate = store.addGate('AND', { x: 300, y: 250 });
        const output2 = store.addGate('OUTPUT', { x: 500, y: 250 });
        
        // 下段: INPUT x2 -> OR -> OUTPUT
        const input4 = store.addGate('INPUT', { x: 100, y: 400 });
        const input5 = store.addGate('INPUT', { x: 100, y: 500 });
        const orGate = store.addGate('OR', { x: 300, y: 450 });
        const output3 = store.addGate('OUTPUT', { x: 500, y: 450 });
        
        // 接続
        // NOT回路
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(notGate.id, 0);
        store.startWireDrawing(notGate.id, -1);
        store.endWireDrawing(output1.id, 0);
        
        // AND回路
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(andGate.id, 0);
        store.startWireDrawing(input3.id, -1);
        store.endWireDrawing(andGate.id, 1);
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output2.id, 0);
        
        // OR回路
        store.startWireDrawing(input4.id, -1);
        store.endWireDrawing(orGate.id, 0);
        store.startWireDrawing(input5.id, -1);
        store.endWireDrawing(orGate.id, 1);
        store.startWireDrawing(orGate.id, -1);
        store.endWireDrawing(output3.id, 0);
      }
    });
    
    // 初期状態
    cy.screenshot('all-gates-initial');
    
    // 各回路のINPUTをONにする
    // NOT回路のINPUT
    cy.get('.switch-track').eq(0).parent().click();
    
    // AND回路の両方のINPUT
    cy.get('.switch-track').eq(1).parent().click();
    cy.get('.switch-track').eq(2).parent().click();
    
    // OR回路の片方のINPUT
    cy.get('.switch-track').eq(3).parent().click();
    
    cy.wait(100);
    
    // 最終状態
    cy.screenshot('all-gates-active');
    
    // 入力ピンが緑色になっていることを確認
    // NOTゲートの入力ピンが緑
    cy.get('.pin.active').should('have.length.at.least', 7); // 少なくとも7つのアクティブなピン
    
    // アクティブなワイヤーも確認
    cy.get('.wire.active').should('have.length.at.least', 6); // 少なくとも6本のアクティブなワイヤー
    
    // OUTPUT の状態を確認
    cy.get('circle[r="15"][fill="#00ff88"]').should('have.length', 2); // AND と OR がON
    cy.get('circle[r="15"][fill="#333"]').should('have.length', 1); // NOT がOFF
  });
});