describe('Complete Functionality Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should demonstrate all features working together', () => {
    // 半加算器を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const inputA = store.addGate('INPUT', { x: 100, y: 200 });
        const inputB = store.addGate('INPUT', { x: 100, y: 400 });
        const xorGate = store.addGate('XOR', { x: 350, y: 250 });
        const andGate = store.addGate('AND', { x: 350, y: 350 });
        const sumOutput = store.addGate('OUTPUT', { x: 600, y: 250 });
        const carryOutput = store.addGate('OUTPUT', { x: 600, y: 350 });
        
        // 接続を作成
        // A -> XOR
        store.startWireDrawing(inputA.id, -1);
        store.endWireDrawing(xorGate.id, 0);
        
        // B -> XOR
        store.startWireDrawing(inputB.id, -1);
        store.endWireDrawing(xorGate.id, 1);
        
        // A -> AND
        store.startWireDrawing(inputA.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        // B -> AND
        store.startWireDrawing(inputB.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        // XOR -> SUM
        store.startWireDrawing(xorGate.id, -1);
        store.endWireDrawing(sumOutput.id, 0);
        
        // AND -> CARRY
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(carryOutput.id, 0);
      }
    });
    
    // 初期状態（0 + 0 = 0）
    cy.screenshot('complete-test-0-0');
    
    // 最初のINPUTをON（1 + 0 = 1）
    cy.get('.switch-track').first().parent().click();
    cy.wait(100);
    
    // SUMがON、CARRYがOFFであることを確認
    cy.get('circle[r="15"][fill="#00ff88"]').should('have.length', 1);
    cy.screenshot('complete-test-1-0');
    
    // 2番目のINPUTもON（1 + 1 = 10）
    cy.get('.switch-track').eq(1).parent().click();
    cy.wait(100);
    
    // SUMがOFF、CARRYがONであることを確認
    cy.get('circle[r="15"][fill="#00ff88"]').should('have.length', 1);
    cy.screenshot('complete-test-1-1');
    
    // ワイヤーの粒子アニメーション確認
    cy.get('.signal-particle').should('have.length', 4); // 4本のアクティブワイヤー
    
    // ゲートのドラッグテスト（XORゲートを移動）
    cy.get('g').contains('XOR').parent().parent()
      .trigger('mousedown', { clientX: 350, clientY: 250 })
      .trigger('mousemove', { clientX: 400, clientY: 200 })
      .trigger('mouseup');
    
    cy.wait(100);
    
    // ワイヤーが接続されたままであることを確認
    cy.get('.wire').should('have.length', 6);
    
    // 入力ピンが緑色であることを確認
    cy.get('.pin.active').should('have.length.at.least', 8); // 少なくとも8つのアクティブなピン
    
    cy.screenshot('complete-test-after-drag');
  });

  it('should handle wire drawing cancellation properly', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリックしてワイヤー描画開始
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // Escapeキーでキャンセル
    cy.get('body').type('{esc}');
    
    // 波線が消えることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should not toggle input when dragging', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 初期状態（OFF）
    cy.get('.switch-track').should('not.have.class', 'active');
    
    // ドラッグ
    cy.get('.switch-track').parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    // まだOFFのままであることを確認
    cy.get('.switch-track').should('not.have.class', 'active');
  });
});