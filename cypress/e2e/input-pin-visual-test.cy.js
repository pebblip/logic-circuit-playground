describe('Input Pin Visual Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show green input pins when receiving signal', () => {
    // NOT回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 200, y: 300 });
        const notGate = store.addGate('NOT', { x: 400, y: 300 });
        const output = store.addGate('OUTPUT', { x: 600, y: 300 });
        
        // 接続
        store.startWireDrawing(input.id, -1);
        store.endWireDrawing(notGate.id, 0);
        
        store.startWireDrawing(notGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 初期状態（信号なし）
    cy.screenshot('input-pins-initial');
    
    // INPUTをONにする
    cy.get('.switch-track').parent().click();
    cy.wait(100);
    
    // 信号がある状態
    cy.screenshot('input-pins-with-signal');
    
    // NOTゲートの入力ピンが緑色になっていることを確認
    cy.get('g').contains('NOT').parent().within(() => {
      cy.get('circle[cx="-45"][r="6"]').should('have.class', 'active');
      cy.get('line[x1="-35"]').should('have.class', 'active');
    });
    
    // OUTPUTゲートの入力ピンは信号なし（NOTで反転されているため）
    cy.get('text').contains('💡').parent().parent().within(() => {
      cy.get('circle[cx="-30"][r="6"]').should('not.have.class', 'active');
    });
  });

  it('should show multiple green input pins on AND gate', () => {
    // AND回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 100, y: 250 });
        const input2 = store.addGate('INPUT', { x: 100, y: 350 });
        const andGate = store.addGate('AND', { x: 350, y: 300 });
        const output = store.addGate('OUTPUT', { x: 600, y: 300 });
        
        // 接続
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 片方のINPUTをONにする
    cy.get('.switch-track').first().parent().click();
    cy.wait(100);
    cy.screenshot('and-gate-one-input');
    
    // ANDゲートの上側の入力ピンだけが緑色
    cy.get('g').contains('AND').parent().within(() => {
      cy.get('circle[cx="-45"][cy="-10"][r="6"]').should('have.class', 'active');
      cy.get('circle[cx="-45"][cy="10"][r="6"]').should('not.have.class', 'active');
    });
    
    // 両方のINPUTをONにする
    cy.get('.switch-track').eq(1).parent().click();
    cy.wait(100);
    cy.screenshot('and-gate-both-inputs');
    
    // ANDゲートの両方の入力ピンが緑色
    cy.get('g').contains('AND').parent().within(() => {
      cy.get('circle[cx="-45"][cy="-10"][r="6"]').should('have.class', 'active');
      cy.get('circle[cx="-45"][cy="10"][r="6"]').should('have.class', 'active');
    });
    
    // OUTPUTゲートの入力ピンも緑色
    cy.get('text').contains('💡').parent().parent().within(() => {
      cy.get('circle[cx="-30"][r="6"]').should('have.class', 'active');
    });
  });
});