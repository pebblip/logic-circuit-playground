describe('Wire Bidirectional Connection Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should connect from output pin to input pin', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('AND', { x: 400, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('.canvas').find('.switch-track').parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ANDの入力ピンをクリック
    cy.get('.canvas').find('text').contains('AND').parent()
      .find('circle[r="15"][fill="transparent"]').first()
      .click();
    
    // ワイヤーが作成されたことを確認
    cy.get('.wire').should('exist');
  });

  it('should connect from input pin to output pin (reversed)', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('AND', { x: 200, y: 300 });
        store.addGate('OUTPUT', { x: 400, y: 300 });
      }
    });
    
    // OUTPUTの入力ピンを先にクリック
    cy.get('.canvas').find('text').contains('💡').parent()
      .find('circle[r="15"][fill="transparent"]')
      .click();
    
    // ANDの出力ピンをクリック
    cy.get('.canvas').find('text').contains('AND').parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ワイヤーが作成されたことを確認
    cy.get('.wire').should('exist');
    
    // ワイヤーが正しく表示されていることを確認（両端が接続されている）
    cy.get('.wire').should(($path) => {
      const d = $path.attr('d');
      // パスが正しく描画されていることを確認（Mで始まりTで終わる）
      expect(d).to.match(/^M\s*[\d.]+\s*[\d.]+.*T\s*[\d.]+\s*[\d.]+$/);
    });
  });

  it('should not connect input to input', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('AND', { x: 200, y: 300 });
        store.addGate('OR', { x: 400, y: 300 });
      }
    });
    
    // ANDの入力ピンをクリック
    cy.get('.canvas').find('text').contains('AND').parent()
      .find('circle[r="15"][fill="transparent"]').first()
      .click();
    
    // ORの入力ピンをクリック
    cy.get('.canvas').find('text').contains('OR').parent()
      .find('circle[r="15"][fill="transparent"]').first()
      .click();
    
    // ワイヤーが作成されないことを確認
    cy.get('.wire').should('not.exist');
  });

  it('should not connect output to output', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 250 });
        store.addGate('INPUT', { x: 200, y: 350 });
      }
    });
    
    // 最初のINPUTの出力ピンをクリック
    cy.get('.switch-track').first().parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // 2番目のINPUTの出力ピンをクリック
    cy.get('.switch-track').last().parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ワイヤーが作成されないことを確認
    cy.get('.wire').should('not.exist');
  });

  it('should create complex circuit with bidirectional connections', () => {
    // 複雑な回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input1 = store.addGate('INPUT', { x: 100, y: 200 });
        const input2 = store.addGate('INPUT', { x: 100, y: 400 });
        const and = store.addGate('AND', { x: 300, y: 250 });
        const or = store.addGate('OR', { x: 300, y: 350 });
        const xor = store.addGate('XOR', { x: 500, y: 300 });
        const output = store.addGate('OUTPUT', { x: 700, y: 300 });
        
        // 逆方向からも含めて接続
        // AND入力1 <- INPUT1出力（逆方向）
        store.startWireDrawing(and.id, 0);
        store.endWireDrawing(input1.id, -1);
        
        // OR入力2 <- INPUT2出力（逆方向）
        store.startWireDrawing(or.id, 1);
        store.endWireDrawing(input2.id, -1);
        
        // XOR <- AND, OR（順方向）
        store.startWireDrawing(and.id, -1);
        store.endWireDrawing(xor.id, 0);
        
        store.startWireDrawing(or.id, -1);
        store.endWireDrawing(xor.id, 1);
        
        // OUTPUT <- XOR（順方向）
        store.startWireDrawing(xor.id, -1);
        store.endWireDrawing(output.id, 0);
      }
    });
    
    // 5本のワイヤーが作成されたことを確認
    cy.get('.wire').should('have.length', 5);
    
    // すべてのワイヤーが正しく表示されていることを確認
    cy.get('.wire').each(($wire) => {
      const d = $wire.attr('d');
      // パスが正しく描画されていることを確認
      expect(d).to.match(/^M\s*[\d.]+\s*[\d.]+.*T\s*[\d.]+\s*[\d.]+$/);
    });
  });
});