describe('Simple Wire Start Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show wire drawing and update position', () => {
    // NOTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 300, y: 300 });
      }
    });
    
    // 出力ピンをクリックしてワイヤー描画を開始
    cy.get('circle[cx="45"][r="15"]').click();
    
    // 波線が表示されることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // ゲートを右に50px移動
    cy.get('g').contains('NOT').parent().parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 350, clientY: 300 })
      .trigger('mouseup');
    
    cy.wait(100);
    
    // 波線がまだ存在することを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').should('exist');
    
    // ゲートの新しい位置を確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const notGate = store.gates.find(g => g.type === 'NOT');
      cy.log('Gate position after move:', notGate.position);
      
      // wireStartの位置も確認
      cy.log('Wire start position:', store.wireStart?.position);
      
      // 波線の起点がゲートに追従しているか確認
      if (store.wireStart) {
        expect(store.wireStart.position.x).to.be.closeTo(notGate.position.x + 45, 5);
      }
    });
    
    cy.screenshot('wire-start-after-gate-move');
  });
});