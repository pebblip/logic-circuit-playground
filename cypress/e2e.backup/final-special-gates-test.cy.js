describe('Final Special Gates Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should display all special gates in the palette', () => {
    // 特殊ゲートセクションの確認
    cy.contains('特殊ゲート').should('be.visible');
    
    // 各特殊ゲートが表示されることを確認
    cy.contains('.tool-card', 'CLOCK').should('be.visible');
    cy.contains('.tool-card', 'D-FF').should('be.visible');
    cy.contains('.tool-card', 'SR-LATCH').should('be.visible');
    cy.contains('.tool-card', 'MUX').should('be.visible');
  });

  it('should create all special gates on canvas', () => {
    // CLOCKゲートを配置
    cy.contains('.tool-card', 'CLOCK').click();
    cy.wait(100);
    
    // D-FFゲートを配置
    cy.contains('.tool-card', 'D-FF').click();
    cy.wait(100);
    
    // SR-LATCHゲートを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    cy.wait(100);
    
    // MUXゲートを配置
    cy.contains('.tool-card', 'MUX').click();
    cy.wait(100);
    
    // 各ゲートがキャンバスに表示されることを確認
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      
      // 4つの特殊ゲートが作成されたことを確認
      const specialGates = state.gates.filter(g => 
        ['CLOCK', 'D-FF', 'SR-LATCH', 'MUX'].includes(g.type)
      );
      expect(specialGates).to.have.length(4);
      
      // 各ゲートの存在確認
      expect(state.gates.find(g => g.type === 'CLOCK')).to.exist;
      expect(state.gates.find(g => g.type === 'D-FF')).to.exist;
      expect(state.gates.find(g => g.type === 'SR-LATCH')).to.exist;
      expect(state.gates.find(g => g.type === 'MUX')).to.exist;
    });
  });

  it('should properly render special gates with correct visual elements', () => {
    // 各ゲートを配置
    cy.contains('.tool-card', 'CLOCK').click();
    cy.contains('.tool-card', 'D-FF').click();
    cy.contains('.tool-card', 'SR-LATCH').click();
    cy.contains('.tool-card', 'MUX').click();
    
    // CLOCKゲートの表示確認
    cy.get('svg.canvas').should((svg) => {
      expect(svg.text()).to.include('1Hz'); // 周波数表示
    });
    
    // D-FFゲートの表示確認
    cy.get('svg.canvas').should((svg) => {
      expect(svg.text()).to.include('D');
      expect(svg.text()).to.include('CLK');
      expect(svg.text()).to.include('Q');
    });
    
    // SR-LATCHゲートの表示確認
    cy.get('svg.canvas').should((svg) => {
      expect(svg.text()).to.include('S');
      expect(svg.text()).to.include('R');
    });
    
    // MUXゲートの表示確認
    cy.get('svg.canvas').should((svg) => {
      expect(svg.text()).to.include('I0');
      expect(svg.text()).to.include('I1');
      expect(svg.text()).to.include('S');
      expect(svg.text()).to.include('Y');
    });
  });
});