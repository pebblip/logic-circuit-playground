describe('SR-LATCH Wire Fix Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should connect SR-LATCH Q output correctly without overlapping', () => {
    // SR-LATCHとOUTPUTを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    cy.wait(100);
    
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(100);
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (srLatch && output) {
          // SR-LATCHのQ出力ピン座標を確認
          const qPinX = srLatch.position.x + 60;
          const qPinY = srLatch.position.y - 20;
          
          // OUTPUTの入力ピン座標を確認
          const outputPinX = output.position.x - 30;
          const outputPinY = output.position.y;
          
          // ワイヤー接続
          cy.get('svg.canvas').click(qPinX, qPinY);
          cy.get('svg.canvas').click(outputPinX, outputPinY);
          
          // ワイヤーが作成されたことを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            expect(state.wires).to.have.length(1);
            
            // ワイヤーの始点がSR-LATCHのQ出力ピンの正しい位置にあることを確認
            const wire = state.wires[0];
            expect(wire.from.gateId).to.equal(srLatch.id);
            expect(wire.to.gateId).to.equal(output.id);
            
            // SVGパスが正しい位置から開始されていることを視覚的に確認
            cy.get('path.wire').should('exist');
            cy.get('path.wire').invoke('attr', 'd').then((pathData) => {
              // パスの開始点がQ出力ピンの座標と一致することを確認
              const startMatch = pathData.match(/^M\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
              if (startMatch) {
                const startX = parseFloat(startMatch[1]);
                const startY = parseFloat(startMatch[2]);
                
                // 誤差を考慮して、開始点がQ出力ピンの近くにあることを確認
                expect(Math.abs(startX - qPinX)).to.be.lessThan(5);
                expect(Math.abs(startY - qPinY)).to.be.lessThan(5);
              }
            });
          });
        }
      }
    });
  });

  it('should connect multiple special gates correctly', () => {
    // INPUT、D-FF、MUX、OUTPUTを配置して複雑な接続をテスト
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(50);
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(50);
    cy.contains('.tool-card', 'D-FF').click();
    cy.wait(50);
    cy.contains('.tool-card', 'MUX').click();
    cy.wait(50);
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(50);
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const dff = state.gates.find(g => g.type === 'D-FF');
        const mux = state.gates.find(g => g.type === 'MUX');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (inputs.length >= 2 && dff && mux && output) {
          // D-FFのQ出力をMUXのA入力に接続
          const dffQx = dff.position.x + 60;
          const dffQy = dff.position.y - 20;
          const muxAx = mux.position.x - 60;
          const muxAy = mux.position.y - 25;
          
          cy.get('svg.canvas').click(dffQx, dffQy);
          cy.get('svg.canvas').click(muxAx, muxAy);
          
          // MUXのY出力をOUTPUTに接続
          const muxYx = mux.position.x + 60;
          const muxYy = mux.position.y;
          const outputX = output.position.x - 30;
          const outputY = output.position.y;
          
          cy.get('svg.canvas').click(muxYx, muxYy);
          cy.get('svg.canvas').click(outputX, outputY);
          
          // 2本のワイヤーが正しく作成されたことを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            expect(state.wires).to.have.length(2);
          });
        }
      }
    });
  });
});