describe('SR-LATCH Direct Connection Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should display SR-LATCH and OUTPUT correctly and create wire via store', () => {
    // SR-LATCHとOUTPUTを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    cy.wait(100);
    
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(100);
    
    // 直接ストアAPIを使ってワイヤーを接続
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (srLatch && output) {
          // 直接ストアのAPIを使ってワイヤーを作成
          state.startWireDrawing(srLatch.id, -1); // Q出力
          state.endWireDrawing(output.id, 0);
          
          // ワイヤーが作成されたことを確認
          cy.window().then((win) => {
            const newState = win.useCircuitStore?.getState();
            expect(newState.wires).to.have.length(1);
            
            const wire = newState.wires[0];
            expect(wire.from.gateId).to.equal(srLatch.id);
            expect(wire.to.gateId).to.equal(output.id);
            
            // ワイヤーのSVGパスを確認
            cy.get('path.wire').should('exist');
            
            // SR-LATCHのQ出力位置を確認
            const expectedStartX = srLatch.position.x + 60;
            const expectedStartY = srLatch.position.y - 20;
            
            // OUTPUTの入力位置を確認
            const expectedEndX = output.position.x - 30;
            const expectedEndY = output.position.y;
            
            cy.log(`SR-LATCH Q: (${expectedStartX}, ${expectedStartY})`);
            cy.log(`OUTPUT Input: (${expectedEndX}, ${expectedEndY})`);
            
            // パスデータを確認
            cy.get('path.wire').invoke('attr', 'd').then((pathData) => {
              cy.log(`Path data: ${pathData}`);
              
              // パスの開始点を確認
              const startMatch = pathData.match(/^M\s*([\d.]+)\s+([\d.]+)/);
              if (startMatch) {
                const startX = parseFloat(startMatch[1]);
                const startY = parseFloat(startMatch[2]);
                cy.log(`Actual start: (${startX}, ${startY})`);
                
                // 開始点がSR-LATCHのQ出力に近いことを確認
                expect(Math.abs(startX - expectedStartX)).to.be.lessThan(1);
                expect(Math.abs(startY - expectedStartY)).to.be.lessThan(1);
              }
            });
          });
        }
      }
    });
  });

  it('should test all special gates wire connections', () => {
    // すべての特殊ゲートとOUTPUTの接続をテスト
    const specialGates = ['CLOCK', 'D-FF', 'SR-LATCH', 'MUX'];
    
    specialGates.forEach((gateType, index) => {
      cy.contains('.tool-card', gateType).click();
      cy.wait(50);
    });
    
    // OUTPUT x4
    for (let i = 0; i < 4; i++) {
      cy.contains('.tool-card', 'OUTPUT').click();
      cy.wait(50);
    }
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const clock = state.gates.find(g => g.type === 'CLOCK');
        const dff = state.gates.find(g => g.type === 'D-FF');
        const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
        const mux = state.gates.find(g => g.type === 'MUX');
        const outputs = state.gates.filter(g => g.type === 'OUTPUT');
        
        if (clock && dff && srLatch && mux && outputs.length >= 4) {
          // 各特殊ゲートからOUTPUTへ接続
          state.startWireDrawing(clock.id, -1);
          state.endWireDrawing(outputs[0].id, 0);
          
          state.startWireDrawing(dff.id, -1);
          state.endWireDrawing(outputs[1].id, 0);
          
          state.startWireDrawing(srLatch.id, -1);
          state.endWireDrawing(outputs[2].id, 0);
          
          state.startWireDrawing(mux.id, -1);
          state.endWireDrawing(outputs[3].id, 0);
          
          // 4本のワイヤーが作成されたことを確認
          cy.window().then((win) => {
            const newState = win.useCircuitStore?.getState();
            expect(newState.wires).to.have.length(4);
            
            // すべてのワイヤーが表示されていることを確認
            cy.get('path.wire').should('have.length', 4);
          });
        }
      }
    });
  });
});