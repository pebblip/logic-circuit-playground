describe('Visual Particle Animation Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show signal particles on active wires', () => {
    // シンプルな回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 200, y: 300 });
        const output = store.addGate('OUTPUT', { x: 600, y: 300 });
        
        // 接続
        store.startWireDrawing(input.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態（信号なし）
    cy.get('.signal-particle').should('not.exist');
    
    // INPUTをONにする
    cy.get('.switch-track').parent().click();
    
    // 信号粒子が表示されることを確認
    cy.get('.signal-particle').should('exist');
    cy.get('.signal-particle').should('have.attr', 'r', '6');
    
    // アニメーションが動作していることを確認
    cy.get('animateMotion').should('exist');
    cy.get('animateMotion').should('have.attr', 'dur', '1.5s');
    cy.get('animateMotion').should('have.attr', 'repeatCount', 'indefinite');
    
    // スクリーンショット
    cy.screenshot('signal-particle-animation');
  });

  it('should show multiple particles on complex circuits', () => {
    // AND回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const inputA = store.addGate('INPUT', { x: 100, y: 200 });
        const inputB = store.addGate('INPUT', { x: 100, y: 400 });
        const andGate = store.addGate('AND', { x: 350, y: 300 });
        const output = store.addGate('OUTPUT', { x: 600, y: 300 });
        
        // 接続
        store.startWireDrawing(inputA.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        store.startWireDrawing(inputB.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 両方のINPUTをONにする
    cy.get('.switch-track').first().parent().click();
    cy.get('.switch-track').last().parent().click();
    
    // 3つの信号粒子が表示されることを確認（各アクティブワイヤーに1つずつ）
    cy.get('.signal-particle').should('have.length', 3);
    
    // スクリーンショット
    cy.screenshot('multiple-particles-animation');
  });
});