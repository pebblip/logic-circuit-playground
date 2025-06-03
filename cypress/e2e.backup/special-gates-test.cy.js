describe('Special Gates Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should create and display special gates', () => {
    // 特殊ゲートセクションが表示されることを確認
    cy.contains('特殊ゲート').should('be.visible');
    
    // CLOCKゲートをクリックして配置
    cy.contains('.tool-card', 'CLOCK').click();
    
    // D-FFゲートをクリックして配置
    cy.contains('.tool-card', 'D-FF').click();
    
    // SR-LATCHゲートをクリックして配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    
    // MUXゲートをクリックして配置
    cy.contains('.tool-card', 'MUX').click();
    
    // ゲートが表示されることを確認
    cy.get('svg.canvas').should((svg) => {
      // 各ゲートのテキストが表示されることを確認
      expect(svg.text()).to.include('1Hz'); // CLOCK
      expect(svg.text()).to.include('D'); // D-FF
      expect(svg.text()).to.include('S'); // SR-LATCH
      expect(svg.text()).to.include('I0'); // MUX
    });
  });

  it('should connect wires to special gates', () => {
    // INPUTゲートを配置
    cy.contains('.tool-card', 'INPUT').click();
    
    // D-FFゲートを配置
    cy.contains('.tool-card', 'D-FF').click();
    
    // OUTPUTゲートを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    
    // INPUTからD-FFのDピンへワイヤー接続
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const inputGate = state.gates.find(g => g.type === 'INPUT');
        const dffGate = state.gates.find(g => g.type === 'D-FF');
        const outputGate = state.gates.find(g => g.type === 'OUTPUT');
        
        if (inputGate && dffGate && outputGate) {
          // INPUTの出力ピンをクリック
          cy.get('svg.canvas').click(inputGate.position.x + 35, inputGate.position.y);
          // D-FFのDピンをクリック
          cy.get('svg.canvas').click(dffGate.position.x - 50, dffGate.position.y - 10);
          
          // D-FFのQピンからOUTPUTへワイヤー接続
          cy.get('svg.canvas').click(dffGate.position.x + 50, dffGate.position.y - 10);
          cy.get('svg.canvas').click(outputGate.position.x - 30, outputGate.position.y);
          
          // ワイヤーが2本作成されたことを確認
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            expect(state.wires).to.have.length(2);
          });
        }
      }
    });
  });
});