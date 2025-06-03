describe('Debug Wire Complete', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should complete wire connection', () => {
    // INPUTとNOTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('NOT', { x: 400, y: 300 });
      }
    });
    
    // 接続前のワイヤー数を確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      cy.log('Initial wires:', store.wires.length);
      expect(store.wires.length).to.equal(0);
    });
    
    // INPUTの出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // ワイヤー描画中であることを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      cy.log('After first click:', {
        isDrawingWire: store.isDrawingWire,
        wireStart: store.wireStart
      });
      expect(store.isDrawingWire).to.equal(true);
    });
    
    // NOTゲートの入力ピンをクリック
    cy.get('g').contains('NOT').parent().within(() => {
      cy.get('circle[cx="-45"][r="15"]').click();
    });
    
    // 接続後の状態を確認
    cy.wait(100);
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      cy.log('After second click:', {
        isDrawingWire: store.isDrawingWire,
        wireStart: store.wireStart,
        wires: store.wires
      });
      
      // ワイヤーが作成されたか確認
      expect(store.wires.length).to.equal(1);
      expect(store.isDrawingWire).to.equal(false);
      expect(store.wireStart).to.be.null;
      
      // ワイヤーの詳細を確認
      const wire = store.wires[0];
      cy.log('Wire details:', {
        from: wire.from,
        to: wire.to,
        isActive: wire.isActive
      });
    });
  });
});