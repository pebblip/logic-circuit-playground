describe('Final Drag Demo', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should demonstrate drag without toggle', () => {
    // 複数のINPUTゲートを作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 200, y: 200 });
        const input2 = store.addGate('INPUT', { x: 200, y: 300 });
        const andGate = store.addGate('AND', { x: 400, y: 250 });
        const output = store.addGate('OUTPUT', { x: 600, y: 250 });
        
        // 接続
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 最初のINPUTをクリックしてONにする
    cy.get('.switch-track').first().parent().click();
    cy.wait(100);
    
    // スクリーンショット（1つON）
    cy.screenshot('demo-one-input-on');
    
    // 2番目のINPUTをドラッグ（ONにならないはず）
    cy.get('.switch-track').eq(1)
      .parent()
      .trigger('mousedown', { clientX: 200, clientY: 300 })
      .trigger('mousemove', { clientX: 250, clientY: 350 })
      .trigger('mouseup');
    
    cy.wait(100);
    
    // スクリーンショット（ドラッグ後もOFFのまま）
    cy.screenshot('demo-after-drag-still-off');
    
    // 2番目のINPUTをクリックしてONにする
    cy.get('.switch-track').eq(1).parent().click();
    cy.wait(100);
    
    // スクリーンショット（両方ON）
    cy.screenshot('demo-both-inputs-on');
    
    // 検証
    cy.get('.switch-track.active').should('have.length', 2);
    // OUTPUTゲートの内側の円を確認（r="15"の円）
    cy.get('circle[r="15"][fill="#00ff88"]').should('exist'); // OUTPUTがON
  });
});