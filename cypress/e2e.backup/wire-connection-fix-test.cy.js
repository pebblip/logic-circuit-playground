describe('Wire Connection Fix Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should connect wires between gates', () => {
    // INPUTとOUTPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('OUTPUT', { x: 600, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // OUTPUTの入力ピンをクリック
    cy.get('circle[cx="-30"][r="15"]').click();
    
    // ワイヤーが作成されることを確認
    cy.get('.wire').should('have.length', 1);
    
    // 波線が消えることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should connect multiple wires to AND gate', () => {
    // 回路を作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 100, y: 250 });
        store.addGate('INPUT', { x: 100, y: 350 });
        store.addGate('AND', { x: 350, y: 300 });
        store.addGate('OUTPUT', { x: 600, y: 300 });
      }
    });
    
    // 最初のINPUT -> AND上ピン
    cy.get('circle[cx="35"][r="15"]').eq(0).click();
    cy.get('g').contains('AND').parent().within(() => {
      cy.get('circle[cx="-45"][cy="-10"][r="15"]').click();
    });
    
    // 2番目のINPUT -> AND下ピン
    cy.get('circle[cx="35"][r="15"]').eq(1).click();
    cy.get('g').contains('AND').parent().within(() => {
      cy.get('circle[cx="-45"][cy="10"][r="15"]').click();
    });
    
    // AND -> OUTPUT
    cy.get('g').contains('AND').parent().within(() => {
      cy.get('circle[cx="45"][r="15"]').click();
    });
    cy.get('circle[cx="-30"][r="15"]').click();
    
    // 3本のワイヤーが作成されることを確認
    cy.get('.wire').should('have.length', 3);
    
    // スクリーンショット
    cy.screenshot('wire-connections-working');
  });

  it('should still allow gate dragging', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 300, y: 300 });
      }
    });
    
    // ゲートの初期位置を確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const notGate = store.gates.find(g => g.type === 'NOT');
      expect(notGate.position.x).to.equal(300);
    });
    
    // ゲートをドラッグ
    cy.get('g').contains('NOT').parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 400 })
      .trigger('mouseup');
    
    // ゲートが移動したことを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const notGate = store.gates.find(g => g.type === 'NOT');
      expect(notGate.position.x).to.be.greaterThan(350);
    });
  });
});