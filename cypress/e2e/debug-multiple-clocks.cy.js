describe('複数CLOCKゲート同期問題のデバッグ', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('複数のCLOCKゲートが独立して動作することを確認', () => {
    // 1つ目のCLOCKゲートを配置
    cy.get('[data-testid="gate-CLOCK"]').should('be.visible');
    cy.get('[data-testid="gate-CLOCK"]')
      .trigger('dragstart')
      .wait(100);
    
    cy.get('[data-testid="canvas"]')
      .trigger('dragover', 200, 200)
      .trigger('drop', 200, 200);
    
    // 2つ目のCLOCKゲートを配置
    cy.get('[data-testid="gate-CLOCK"]')
      .trigger('dragstart')
      .wait(100);
    
    cy.get('[data-testid="canvas"]')
      .trigger('dragover', 400, 200)
      .trigger('drop', 400, 200);

    // CLOCKゲートが2つ配置されたことを確認
    cy.get('[data-gate-id]').should('have.length', 2);
    
    // 1つ目のCLOCKゲートの設定を開く
    cy.get('[data-gate-id]').first().click();
    
    // クロックを開始
    cy.get('button').contains('Start').should('be.visible').click();
    cy.wait(500);
    
    // 2つ目のCLOCKゲートの設定を開く  
    cy.get('[data-gate-id]').last().click();
    
    // 2つ目のクロックも開始
    cy.get('button').contains('Start').should('be.visible').click();
    cy.wait(500);

    // 両方のCLOCKゲートの出力状態を監視
    let clock1States = [];
    let clock2States = [];
    
    // 数秒間状態を記録
    for (let i = 0; i < 10; i++) {
      cy.wait(200);
      cy.get('[data-gate-id]').first().then($el => {
        const isActive = $el.find('[stroke="#00ff88"]').length > 0;
        clock1States.push(isActive);
      });
      
      cy.get('[data-gate-id]').last().then($el => {
        const isActive = $el.find('[stroke="#00ff88"]').length > 0;
        clock2States.push(isActive);
      });
    }
    
    // 状態をログ出力して確認
    cy.then(() => {
      console.log('Clock 1 states:', clock1States);
      console.log('Clock 2 states:', clock2States);
      
      // 両方のクロックが同じ状態遷移をしている場合は同期している
      const isSynchronized = JSON.stringify(clock1States) === JSON.stringify(clock2States);
      
      if (isSynchronized) {
        cy.log('❌ CLOCKゲートが同期している（バグ）');
      } else {
        cy.log('✅ CLOCKゲートが独立して動作している');
      }
      
      // 実際にはランダムな時差があることを期待
      expect(isSynchronized).to.be.false;
    });
  });

  it('CLOCKゲートのstartTimeを開発者ツールで確認', () => {
    // 複数のCLOCKゲートを配置
    cy.get('[data-testid="gate-CLOCK"]')
      .trigger('dragstart');
    cy.get('[data-testid="canvas"]')
      .trigger('dragover', 200, 200)
      .trigger('drop', 200, 200);
      
    cy.get('[data-testid="gate-CLOCK"]')
      .trigger('dragstart');
    cy.get('[data-testid="canvas"]')
      .trigger('dragover', 400, 200)
      .trigger('drop', 400, 200);

    // 両方のクロックを開始
    cy.get('[data-gate-id]').first().click();
    cy.get('button').contains('Start').click();
    cy.wait(100);
    
    cy.get('[data-gate-id]').last().click();
    cy.get('button').contains('Start').click();
    cy.wait(1000);

    // ストア状態をコンソールに出力
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState?.();
      if (store) {
        const clockGates = store.gates.filter(g => g.type === 'CLOCK');
        console.log('CLOCK gates metadata:', clockGates.map(g => ({
          id: g.id,
          startTime: g.metadata?.startTime,
          isRunning: g.metadata?.isRunning,
          frequency: g.metadata?.frequency
        })));
        
        // startTimeの差を確認
        if (clockGates.length >= 2) {
          const timeDiff = Math.abs(
            (clockGates[0].metadata?.startTime || 0) - 
            (clockGates[1].metadata?.startTime || 0)
          );
          console.log('StartTime difference:', timeDiff, 'ms');
          
          if (timeDiff < 10) {
            console.log('⚠️ StartTime差が小さすぎる（同期の原因かも）');
          }
        }
      }
    });
  });
});