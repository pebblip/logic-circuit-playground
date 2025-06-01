describe('Clock Gate Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should create and animate CLOCK gate', () => {
    // CLOCKゲートを配置
    cy.contains('.tool-card', 'CLOCK').click();
    
    // OUTPUTゲートを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    
    // CLOCKからOUTPUTへワイヤー接続
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      if (state) {
        const clockGate = state.gates.find(g => g.type === 'CLOCK');
        const outputGate = state.gates.find(g => g.type === 'OUTPUT');
        
        if (clockGate && outputGate) {
          // CLOCKの出力ピンをクリック
          cy.get('svg.canvas').click(clockGate.position.x + 50, clockGate.position.y);
          // OUTPUTの入力ピンをクリック
          cy.get('svg.canvas').click(outputGate.position.x - 30, outputGate.position.y);
          
          // CLOCKゲートが動作していることを確認
          cy.wait(600); // 0.6秒待つ（1Hzの半周期より少し長い）
          
          cy.window().then((win) => {
            const state = win.useCircuitStore?.getState();
            const clockGate = state.gates.find(g => g.type === 'CLOCK');
            expect(clockGate.output).to.be.true;
            
            // もう一度待ってfalseになることを確認
            cy.wait(600);
            cy.window().then((win) => {
              const state = win.useCircuitStore?.getState();
              const clockGate = state.gates.find(g => g.type === 'CLOCK');
              expect(clockGate.output).to.be.false;
            });
          });
        }
      }
    });
  });

  it('should show frequency in CLOCK gate', () => {
    // CLOCKゲートを配置
    cy.contains('.tool-card', 'CLOCK').click();
    
    // 周波数表示を確認
    cy.get('svg.canvas').should((svg) => {
      expect(svg.text()).to.include('1Hz');
    });
  });
});