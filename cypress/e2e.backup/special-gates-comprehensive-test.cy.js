describe('Special Gates Comprehensive Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should test D-FF gate functionality', () => {
    // INPUT x2を配置（D, CLK用）
    cy.contains('.tool-card', 'INPUT').click();
    cy.contains('.tool-card', 'INPUT').click();
    
    // D-FFを配置
    cy.contains('.tool-card', 'D-FF').click();
    
    // OUTPUTを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const dff = state.gates.find(g => g.type === 'D-FF');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (inputs.length >= 2 && dff && output) {
          // 最初のINPUTをDピンに接続
          state.startWireDrawing(inputs[0].id, -1);
          state.endWireDrawing(dff.id, 0);
          
          // 2番目のINPUTをCLKピンに接続
          state.startWireDrawing(inputs[1].id, -1);
          state.endWireDrawing(dff.id, 1);
          
          // D-FFのQピンをOUTPUTに接続
          state.startWireDrawing(dff.id, -1);
          state.endWireDrawing(output.id, 0);
          
          // D=1, CLK=0の状態でテスト
          state.updateGateOutput(inputs[0].id, true);
          state.updateGateOutput(inputs[1].id, false);
          
          cy.wait(100);
          
          // CLKを立ち上げる
          state.updateGateOutput(inputs[1].id, true);
          
          cy.wait(100);
          
          // D-FFのQが1になることを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const dff = state.gates.find(g => g.type === 'D-FF');
            expect(dff.output).to.be.true;
          });
        }
      }
    });
  });

  it('should test SR-LATCH gate functionality', () => {
    // INPUT x2を配置（S, R用）
    cy.contains('.tool-card', 'INPUT').click();
    cy.contains('.tool-card', 'INPUT').click();
    
    // SR-LATCHを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    
    // OUTPUTを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (inputs.length >= 2 && srLatch && output) {
          // 最初のINPUTをSピンに接続
          state.startWireDrawing(inputs[0].id, -1);
          state.endWireDrawing(srLatch.id, 0);
          
          // 2番目のINPUTをRピンに接続
          state.startWireDrawing(inputs[1].id, -1);
          state.endWireDrawing(srLatch.id, 1);
          
          // SR-LATCHのQピンをOUTPUTに接続
          state.startWireDrawing(srLatch.id, -1);
          state.endWireDrawing(output.id, 0);
          
          // S=1, R=0でセット
          state.updateGateOutput(inputs[0].id, true);
          state.updateGateOutput(inputs[1].id, false);
          
          cy.wait(100);
          
          // Qが1になることを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
            expect(srLatch.output).to.be.true;
          });
          
          // S=0, R=1でリセット
          state.updateGateOutput(inputs[0].id, false);
          state.updateGateOutput(inputs[1].id, true);
          
          cy.wait(100);
          
          // Qが0になることを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const srLatch = state.gates.find(g => g.type === 'SR-LATCH');
            expect(srLatch.output).to.be.false;
          });
        }
      }
    });
  });

  it('should test MUX gate functionality', () => {
    // INPUT x3を配置（I0, I1, S用）
    cy.contains('.tool-card', 'INPUT').click();
    cy.contains('.tool-card', 'INPUT').click();
    cy.contains('.tool-card', 'INPUT').click();
    
    // MUXを配置
    cy.contains('.tool-card', 'MUX').click();
    
    // OUTPUTを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const inputs = state.gates.filter(g => g.type === 'INPUT');
        const mux = state.gates.find(g => g.type === 'MUX');
        const output = state.gates.find(g => g.type === 'OUTPUT');
        
        if (inputs.length >= 3 && mux && output) {
          // INPUTをMUXに接続
          state.startWireDrawing(inputs[0].id, -1);
          state.endWireDrawing(mux.id, 0); // I0
          
          state.startWireDrawing(inputs[1].id, -1);
          state.endWireDrawing(mux.id, 1); // I1
          
          state.startWireDrawing(inputs[2].id, -1);
          state.endWireDrawing(mux.id, 2); // S
          
          // MUXのYピンをOUTPUTに接続
          state.startWireDrawing(mux.id, -1);
          state.endWireDrawing(output.id, 0);
          
          // I0=0, I1=1, S=0でテスト（Y=I0=0になるはず）
          state.updateGateOutput(inputs[0].id, false);
          state.updateGateOutput(inputs[1].id, true);
          state.updateGateOutput(inputs[2].id, false);
          
          cy.wait(100);
          
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const mux = state.gates.find(g => g.type === 'MUX');
            expect(mux.output).to.be.false;
          });
          
          // S=1に変更（Y=I1=1になるはず）
          state.updateGateOutput(inputs[2].id, true);
          
          cy.wait(100);
          
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const mux = state.gates.find(g => g.type === 'MUX');
            expect(mux.output).to.be.true;
          });
        }
      }
    });
  });
});