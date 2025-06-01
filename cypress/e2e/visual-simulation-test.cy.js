describe('Visual Simulation Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show visual feedback for active circuits', () => {
    // 簡単な回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 200, y: 300 });
        const not = store.addGate('NOT', { x: 400, y: 300 });
        const output = store.addGate('OUTPUT', { x: 600, y: 300 });
        
        // 接続
        store.startWireDrawing(input.id, -1);
        store.endWireDrawing(not.id, 0);
        
        store.startWireDrawing(not.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // スクリーンショット（初期状態）
    cy.screenshot('simulation-initial-state');
    
    // INPUTをONにする
    cy.get('.switch-track').parent().click();
    
    // スクリーンショット（アクティブ状態）
    cy.screenshot('simulation-active-state');
    
    // 視覚的確認
    // - INPUTスイッチが緑色
    cy.get('.switch-track.active').should('have.css', 'stroke', 'rgb(0, 255, 136)');
    cy.get('.switch-thumb.active').should('have.css', 'fill', 'rgb(0, 255, 136)');
    
    // - 最初のワイヤーがアクティブ（緑色）
    cy.get('.wire.active').first().should('have.css', 'stroke', 'rgb(0, 255, 136)');
    
    // - NOTゲートの出力ピンは非アクティブ（反転しているため）
    // - 2番目のワイヤーは非アクティブ
    cy.get('.wire').not('.active').should('exist');
    
    // - OUTPUTは暗い（NOTで反転されているため）
    cy.get('circle[r="15"][fill="#333"]').should('exist');
  });

  it('should show complete half adder visualization', () => {
    // 半加算器を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        // 配置を整理
        const inputA = store.addGate('INPUT', { x: 100, y: 150 });
        const inputB = store.addGate('INPUT', { x: 100, y: 350 });
        const xorGate = store.addGate('XOR', { x: 350, y: 200 });
        const andGate = store.addGate('AND', { x: 350, y: 300 });
        const sumOutput = store.addGate('OUTPUT', { x: 600, y: 200 });
        const carryOutput = store.addGate('OUTPUT', { x: 600, y: 300 });
        
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
    
    // 初期状態（0 + 0）
    cy.screenshot('half-adder-0-0');
    
    // 1 + 0
    cy.get('.switch-track').first().parent().click();
    cy.wait(100);
    cy.screenshot('half-adder-1-0');
    
    // 1 + 1
    cy.get('.switch-track').last().parent().click();
    cy.wait(100);
    cy.screenshot('half-adder-1-1');
    
    // 0 + 1
    cy.get('.switch-track').first().parent().click();
    cy.wait(100);
    cy.screenshot('half-adder-0-1');
  });
});