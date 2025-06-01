describe('Simulation Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should simulate AND gate', () => {
    // ゲートを配置
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 100, y: 200 });
        const input2 = store.addGate('INPUT', { x: 100, y: 300 });
        const andGate = store.addGate('AND', { x: 300, y: 250 });
        const output = store.addGate('OUTPUT', { x: 500, y: 250 });
        
        // 接続
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態（両方OFF）でOUTPUTは暗い
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
    
    // INPUT1をONにする
    cy.get('.switch-track').first().parent().click();
    
    // まだOUTPUTは暗い（ANDなので）
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
    
    // INPUT2もONにする
    cy.get('.switch-track').last().parent().click();
    
    // OUTPUTが明るくなる
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').should('exist');
    
    // ワイヤーもアクティブになる
    cy.get('.wire.active').should('have.length', 3);
  });

  it('should simulate OR gate', () => {
    // ゲートを配置
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 100, y: 200 });
        const input2 = store.addGate('INPUT', { x: 100, y: 300 });
        const orGate = store.addGate('OR', { x: 300, y: 250 });
        const output = store.addGate('OUTPUT', { x: 500, y: 250 });
        
        // 接続
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(orGate.id, 0);
        
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(orGate.id, 1);
        
        store.startWireDrawing(orGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態でOUTPUTは暗い
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
    
    // INPUT1だけONにする
    cy.get('.switch-track').first().parent().click();
    
    // OUTPUTが明るくなる（ORなので）
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').should('exist');
  });

  it('should simulate NOT gate', () => {
    // ゲートを配置
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 100, y: 250 });
        const notGate = store.addGate('NOT', { x: 300, y: 250 });
        const output = store.addGate('OUTPUT', { x: 500, y: 250 });
        
        // 接続
        store.startWireDrawing(input.id, -1);
        store.endWireDrawing(notGate.id, 0);
        
        store.startWireDrawing(notGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態（INPUT OFF）でOUTPUTは明るい（反転）
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').should('exist');
    
    // INPUTをONにする
    cy.get('.switch-track').parent().click();
    
    // OUTPUTが暗くなる（反転）
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
  });

  it('should simulate XOR gate', () => {
    // ゲートを配置
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 100, y: 200 });
        const input2 = store.addGate('INPUT', { x: 100, y: 300 });
        const xorGate = store.addGate('XOR', { x: 300, y: 250 });
        const output = store.addGate('OUTPUT', { x: 500, y: 250 });
        
        // 接続
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(xorGate.id, 0);
        
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(xorGate.id, 1);
        
        store.startWireDrawing(xorGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態でOUTPUTは暗い
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
    
    // INPUT1だけONにする
    cy.get('.switch-track').first().parent().click();
    
    // OUTPUTが明るくなる（XORなので片方だけONで真）
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').should('exist');
    
    // INPUT2もONにする
    cy.get('.switch-track').last().parent().click();
    
    // OUTPUTが暗くなる（両方ONで偽）
    cy.get('circle').filter('[r="15"][fill="#333"]').should('exist');
  });

  it('should simulate complex circuit', () => {
    // 半加算器を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const inputA = store.addGate('INPUT', { x: 100, y: 200 });
        const inputB = store.addGate('INPUT', { x: 100, y: 400 });
        const xorGate = store.addGate('XOR', { x: 300, y: 200 });
        const andGate = store.addGate('AND', { x: 300, y: 400 });
        const sumOutput = store.addGate('OUTPUT', { x: 500, y: 200 });
        const carryOutput = store.addGate('OUTPUT', { x: 500, y: 400 });
        
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
    
    // 0 + 0 = 0 (carry 0)
    cy.get('circle').filter('[r="15"][fill="#333"]').should('have.length', 2);
    
    // 1 + 0 = 1 (carry 0)
    cy.get('.switch-track').first().parent().click();
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').should('have.length', 1); // SUM
    cy.get('circle').filter('[r="15"][fill="#333"]').should('have.length', 1); // CARRY
    
    // 1 + 1 = 0 (carry 1)
    cy.get('.switch-track').last().parent().click();
    cy.get('circle').filter('[r="15"][fill="#333"]').first().should('exist'); // SUM
    cy.get('circle').filter('[r="15"][fill="#00ff88"]').last().should('exist'); // CARRY
  });
});