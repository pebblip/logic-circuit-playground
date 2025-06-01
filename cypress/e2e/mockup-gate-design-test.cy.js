describe('Mockup Gate Design Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should render special gates with mockup design', () => {
    // CLOCKゲートを配置
    cy.contains('.tool-card', 'CLOCK').click();
    
    // CLOCKゲートが円形で表示されることを確認
    cy.get('svg.canvas').within(() => {
      cy.get('circle[r="40"]').should('exist'); // 円形デザイン
      cy.contains('⏰').should('exist'); // 時計アイコン
    });

    // D-FFゲートを配置
    cy.contains('.tool-card', 'D-FF').click();
    
    // D-FFゲートが100x80サイズで表示されることを確認
    cy.get('svg.canvas').within(() => {
      cy.get('rect[width="100"][height="80"]').should('exist');
      cy.contains('D-FF').should('exist');
    });

    // SR-LATCHゲートを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    
    // SR-LATCHゲートが正しく表示されることを確認
    cy.get('svg.canvas').within(() => {
      cy.get('rect[width="100"][height="80"]').should('have.length.greaterThan', 1);
      cy.contains('SR').should('exist');
      cy.contains('LATCH').should('exist');
    });

    // MUXゲートを配置
    cy.contains('.tool-card', 'MUX').click();
    
    // MUXゲートが正しく表示されることを確認
    cy.get('svg.canvas').within(() => {
      cy.contains('MUX').should('exist');
      cy.contains('A').should('exist');
      cy.contains('B').should('exist');
      cy.contains('S').should('exist');
      cy.contains('Y').should('exist');
    });
  });

  it('should connect SR-LATCH Q output correctly', () => {
    // SR-LATCHとOUTPUTを配置
    cy.contains('.tool-card', 'SR-LATCH').click();
    cy.contains('.tool-card', 'OUTPUT').click();
    
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
            
            // ワイヤーが正しく接続されていることを確認
            const wire = state.wires[0];
            expect(wire.from.gateId).to.equal(srLatch.id);
            expect(wire.to.gateId).to.equal(output.id);
          });
        }
      }
    });
  });
});