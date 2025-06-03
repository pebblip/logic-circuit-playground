describe('Wire Drawing Cancel Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should cancel wire drawing when clicking on empty canvas', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // キャンバスの空白部分をクリック
    cy.get('#canvas-background').click({ x: 600, y: 600, force: true });
    
    // 波線が消えることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should cancel wire drawing when pressing Escape key', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // Escapeキーを押す
    cy.get('body').type('{esc}');
    
    // 波線が消えることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should cancel wire drawing when starting to drag a gate', () => {
    // INPUTゲートとANDゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('AND', { x: 400, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="35"][r="15"]').first().click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // ANDゲートをドラッグ
    cy.get('g').contains('AND').parent()
      .trigger('mousedown', { clientX: 400, clientY: 300 })
      .trigger('mousemove', { clientX: 450, clientY: 300 })
      .trigger('mouseup');
    
    // 波線が消えることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
  });

  it('should not leave dangling wire when moving gate after clicking output pin', () => {
    // NOTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリック
    cy.get('circle[cx="45"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // 同じゲートをドラッグ
    cy.get('g').contains('NOT').parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    // 波線が消えることを確認（残っていない）
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('not.exist');
    
    // スクリーンショット
    cy.screenshot('no-dangling-wire-after-move');
  });
});