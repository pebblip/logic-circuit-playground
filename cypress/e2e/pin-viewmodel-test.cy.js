describe('ViewModelピン情報テスト', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.clearLocalStorage();
    cy.visit('/');
    
    // チュートリアルが表示されたらスキップ
    cy.get('body').then($body => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.get('button:contains("スキップ")').click();
      }
    });
    cy.wait(500);
  });

  it('ViewModelがピン情報を正しく返しているか確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // ViewModelの状態を確認
    cy.window().then((win) => {
      const viewModel = win.debugViewModel;
      const gates = win.debugGates;
      
      expect(viewModel).to.exist;
      expect(gates).to.exist;
      expect(gates.length).to.be.greaterThan(0);
      
      // 最初のゲート（INPUT）を確認
      const inputGate = gates[0];
      cy.log('INPUT Gate:', JSON.stringify(inputGate, null, 2));
      
      expect(inputGate.type).to.equal('INPUT');
      expect(inputGate.outputs).to.exist;
      
      if (inputGate.outputs && inputGate.outputs.length > 0) {
        cy.log('OUTPUT pins found:', inputGate.outputs.length);
        
        inputGate.outputs.forEach((pin, index) => {
          cy.log(`Output pin ${index}:`, JSON.stringify(pin, null, 2));
          expect(pin.x).to.be.a('number');
          expect(pin.y).to.be.a('number');
        });
      } else {
        cy.log('WARNING: No output pins found on INPUT gate!');
      }
      
      // 内部のゲート情報も確認
      const internalGates = viewModel.circuit.getGates();
      cy.log('Internal gates:', internalGates.length);
      
      if (internalGates.length > 0) {
        const internalGate = internalGates[0];
        cy.log('Internal gate pins:', {
          inputs: internalGate.getInputPins ? internalGate.getInputPins().length : 'N/A',
          outputs: internalGate.getOutputPins ? internalGate.getOutputPins().length : 'N/A'
        });
      }
    });
    
    // ANDゲートも配置して確認
    cy.contains('button', 'AND').click();
    cy.wait(1000);
    
    cy.window().then((win) => {
      const gates = win.debugGates;
      
      expect(gates.length).to.equal(2);
      
      const andGate = gates[1];
      cy.log('AND Gate:', JSON.stringify(andGate, null, 2));
      
      expect(andGate.type).to.equal('AND');
      expect(andGate.inputs).to.exist;
      expect(andGate.outputs).to.exist;
      
      if (andGate.inputs && andGate.inputs.length > 0) {
        cy.log('INPUT pins found:', andGate.inputs.length);
      } else {
        cy.log('WARNING: No input pins found on AND gate!');
      }
    });
    
    cy.screenshot('viewmodel-pins');
  });
});