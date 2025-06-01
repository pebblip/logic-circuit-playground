describe('Wire Start Position Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should update wire start position when gate moves', () => {
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
    
    // 初期の波線の位置を記録
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').then(($line) => {
      const initialX1 = $line.attr('x1');
      const initialY1 = $line.attr('y1');
      
      // ゲートを少し移動
      cy.get('g').contains('NOT').parent().parent()
        .trigger('mousedown', { clientX: 300, clientY: 300 })
        .trigger('mousemove', { clientX: 350, clientY: 300 })
        .trigger('mouseup');
      
      cy.wait(100);
      
      // 波線の起点が更新されたことを確認
      cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').then(($updatedLine) => {
        const updatedX1 = $updatedLine.attr('x1');
        expect(parseFloat(updatedX1)).to.be.greaterThan(parseFloat(initialX1));
      });
    });
    
    // スクリーンショット
    cy.screenshot('wire-start-updated-after-move');
  });

  it('should maintain correct wire position through multiple moves', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
      }
    });
    
    // 出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // 複数回小さく移動
    for (let i = 0; i < 3; i++) {
      cy.get('.switch-track').parent().parent()
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 200 + (i + 1) * 30, clientY: 300 })
        .trigger('mouseup');
      cy.wait(50);
    }
    
    // 波線がまだ正しい位置にあることを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const inputGate = store.gates.find(g => g.type === 'INPUT');
      
      // 波線の起点がゲートの出力ピン位置と一致することを確認
      cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').then(($line) => {
        const x1 = parseFloat($line.attr('x1'));
        expect(x1).to.be.closeTo(inputGate.position.x + 35, 5);
      });
    });
    
    cy.screenshot('wire-start-after-multiple-moves');
  });

  it('should not affect wire start for other gates', () => {
    // 2つのゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 200 });
        store.addGate('AND', { x: 400, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('circle[cx="35"][r="15"]').click();
    
    // ANDゲートを移動（INPUTからワイヤー描画中）
    cy.get('g').contains('AND').parent().parent()
      .trigger('mousedown', { clientX: 400, clientY: 300 })
      .trigger('mousemove', { clientX: 500, clientY: 350 })
      .trigger('mouseup');
    
    // 波線の起点がINPUTゲートの位置のままであることを確認
    cy.get('line[stroke="#00ff88"][stroke-dasharray="5,5"]').then(($line) => {
      const x1 = parseFloat($line.attr('x1'));
      expect(x1).to.be.closeTo(235, 5); // 200 + 35
    });
  });
});