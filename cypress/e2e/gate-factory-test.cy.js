describe('Gate Factory Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should create basic gates with factory', () => {
    // 基本ゲートを作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const andGate = store.addGate('AND', { x: 200, y: 200 });
        const orGate = store.addGate('OR', { x: 200, y: 300 });
        const notGate = store.addGate('NOT', { x: 200, y: 400 });
        
        // ゲートが正しく作成されたことを確認
        expect(andGate.type).to.equal('AND');
        expect(andGate.inputs.length).to.equal(2);
        
        expect(orGate.type).to.equal('OR');
        expect(orGate.inputs.length).to.equal(2);
        
        expect(notGate.type).to.equal('NOT');
        expect(notGate.inputs.length).to.equal(1);
      }
    });
    
    // UIに表示されることを確認
    cy.get('g').contains('AND').should('exist');
    cy.get('g').contains('OR').should('exist');
    cy.get('g').contains('NOT').should('exist');
  });

  it('should create special gates with metadata', () => {
    // 特殊ゲートを作成
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const clockGate = store.addGate('CLOCK', { x: 200, y: 200 });
        const dffGate = store.addGate('D-FF', { x: 200, y: 300 });
        const srLatchGate = store.addGate('SR-LATCH', { x: 200, y: 400 });
        const muxGate = store.addGate('MUX', { x: 200, y: 500 });
        
        // メタデータが正しく設定されていることを確認
        expect(clockGate.type).to.equal('CLOCK');
        expect(clockGate.metadata).to.exist;
        expect(clockGate.metadata.frequency).to.equal(1);
        expect(clockGate.metadata.isRunning).to.equal(true);
        
        expect(dffGate.type).to.equal('D-FF');
        expect(dffGate.metadata).to.exist;
        expect(dffGate.metadata.clockEdge).to.equal('rising');
        expect(dffGate.inputs.length).to.equal(2);
        
        expect(srLatchGate.type).to.equal('SR-LATCH');
        expect(srLatchGate.metadata).to.exist;
        expect(srLatchGate.metadata.qOutput).to.equal(false);
        expect(srLatchGate.metadata.qBarOutput).to.equal(true);
        
        expect(muxGate.type).to.equal('MUX');
        expect(muxGate.metadata).to.exist;
        expect(muxGate.inputs.length).to.equal(3);
      }
    });
  });

  it('should maintain backward compatibility', () => {
    // 既存の機能が正常に動作することを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const input = store.addGate('INPUT', { x: 200, y: 200 });
        const andGate = store.addGate('AND', { x: 400, y: 200 });
        const output = store.addGate('OUTPUT', { x: 600, y: 200 });
        
        // INPUTの特殊な動作を確認
        expect(input.output).to.equal(false);
        expect(input.inputs.length).to.equal(0);
        
        // OUTPUTの特殊な動作を確認
        expect(output.inputs.length).to.equal(1);
      }
    });
  });
});