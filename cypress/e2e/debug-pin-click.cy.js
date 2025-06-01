describe('Debug Pin Click', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should debug pin click events', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
        
        // ストアの状態を確認
        console.log('Initial state:', {
          gates: store.gates,
          isDrawingWire: store.isDrawingWire,
          wireStart: store.wireStart
        });
      }
    });
    
    // 出力ピンをクリック前の状態を確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      cy.log('Before click:', {
        isDrawingWire: store.isDrawingWire,
        wireStart: store.wireStart
      });
    });
    
    // 出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // クリック後の状態を確認
    cy.wait(100);
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      cy.log('After click:', {
        isDrawingWire: store.isDrawingWire,
        wireStart: store.wireStart
      });
      
      // ワイヤー描画が開始されているか確認
      expect(store.isDrawingWire).to.equal(true);
      expect(store.wireStart).to.not.be.null;
    });
  });
});