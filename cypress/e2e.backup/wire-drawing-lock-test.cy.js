describe('Wire Drawing Lock Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should prevent gate movement while drawing wire from it', () => {
    // NOTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 300, y: 300 });
      }
    });
    
    // 初期位置を記録
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const notGate = store.gates.find(g => g.type === 'NOT');
      cy.wrap(notGate.position.x).as('initialX');
    });
    
    // 出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="45"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // ゲートを移動しようとする
    cy.get('g').contains('NOT').parent().parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    cy.wait(100);
    
    // ゲートが移動していないことを確認
    cy.get('@initialX').then((initialX) => {
      cy.window().then((win) => {
        const store = win.useCircuitStore?.getState();
        const notGate = store.gates.find(g => g.type === 'NOT');
        expect(notGate.position.x).to.equal(initialX);
      });
    });
    
    // 波線がまだ表示されていることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    cy.screenshot('gate-locked-during-wire-drawing');
  });

  it('should allow other gates to move while drawing wire', () => {
    // 2つのゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('AND', { x: 400, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // ANDゲートを移動（これは許可される）
    cy.get('g').contains('AND').parent().parent()
      .trigger('mousedown', { clientX: 400, clientY: 300 })
      .trigger('mousemove', { clientX: 500, clientY: 350 })
      .trigger('mouseup');
    
    cy.wait(100);
    
    // ANDゲートが移動したことを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const andGate = store.gates.find(g => g.type === 'AND');
      expect(andGate.position.x).to.be.greaterThan(450);
    });
    
    // 波線がまだ表示されていることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
  });

  it('should allow gate movement after canceling wire drawing', () => {
    // NOTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="45"][r="15"]').click();
    
    // Escapeキーでワイヤー描画をキャンセル
    cy.get('body').type('{esc}');
    
    // 波線が消えたことを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
    
    // ゲートを移動
    cy.get('g').contains('NOT').parent().parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    // ゲートが移動したことを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const notGate = store.gates.find(g => g.type === 'NOT');
      expect(notGate.position.x).to.be.greaterThan(350);
    });
  });
});