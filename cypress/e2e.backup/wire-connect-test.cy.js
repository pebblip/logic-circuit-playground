describe('Wire Connection Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should connect two gates with wire', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('OUTPUT', { x: 500, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('.canvas').find('.switch-track').parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ワイヤー描画中の線が表示されることを確認
    cy.get('.canvas').find('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // OUTPUTの入力ピンをクリック
    cy.get('.canvas').find('text').contains('💡').parent()
      .find('circle[r="15"][fill="transparent"]')
      .click();
    
    // ワイヤーが作成されたことを確認
    cy.get('.wire').should('exist');
  });

  it('should toggle INPUT and propagate signal', () => {
    // ゲートを追加して接続
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 200, y: 300 });
        const output = store.addGate('OUTPUT', { x: 500, y: 300 });
        
        // ワイヤーで接続（INPUTの出力ピンは-1、OUTPUTの入力ピンは0）
        store.startWireDrawing(input.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // INPUTをトグル（親のg要素をクリック）
    cy.get('.switch-track').parent().click();
    
    // INPUTがアクティブになることを確認
    cy.get('.switch-track.active').should('exist');
    cy.get('.switch-thumb.active').should('exist');
    
    // TODO: 信号伝播の実装後に、OUTPUTが点灯することを確認
  });

  it('should cancel wire drawing on canvas click', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('AND', { x: 300, y: 300 });
      }
    });
    
    // ピンをクリックしてワイヤー描画開始
    cy.get('.canvas').find('text').contains('AND').parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ワイヤー描画中の線が表示されることを確認
    cy.get('.canvas').find('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // キャンバスの空白部分をクリック
    cy.get('.canvas').click(100, 100);
    
    // ワイヤー描画がキャンセルされたことを確認
    cy.get('.canvas').find('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should create complex circuit', () => {
    // 複数のゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        // 入力
        const input1 = store.addGate('INPUT', { x: 100, y: 250 });
        const input2 = store.addGate('INPUT', { x: 100, y: 350 });
        
        // ANDゲート
        const andGate = store.addGate('AND', { x: 300, y: 300 });
        
        // 出力
        const output = store.addGate('OUTPUT', { x: 500, y: 300 });
        
        // 接続を作成
        // INPUT1の出力(-1) -> ANDの入力1(0)
        store.startWireDrawing(input1.id, -1);
        store.endWireDrawing(andGate.id, 0);
        
        // INPUT2の出力(-1) -> ANDの入力2(1)
        store.startWireDrawing(input2.id, -1);
        store.endWireDrawing(andGate.id, 1);
        
        // ANDの出力(-1) -> OUTPUTの入力(0)
        store.startWireDrawing(andGate.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // ワイヤーが3本作成されたことを確認
    cy.get('.wire').should('have.length', 3);
    
    // ゲートが4つ表示されていることを確認
    cy.get('.switch-track').should('have.length', 2);
    cy.get('.canvas').find('text').contains('AND').should('exist');
    cy.contains('💡').should('exist');
  });
});