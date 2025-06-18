describe('フィボナッチカウンターデバッグ', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
  });

  it('フィボナッチカウンターのCLOCKが動作する', () => {
    // フィボナッチカウンターを選択
    cy.contains('🌸 フィボナッチカウンター').click();
    
    // 初期状態を確認
    cy.get('[data-gate-type="CLOCK"]').should('exist');
    cy.get('[data-gate-type="D-FF"]').should('have.length', 10); // 10個のD-FFゲート
    cy.get('[data-gate-type="OUTPUT"]').should('have.length', 4); // 4個の出力ゲート
    
    // CLOCKゲートの初期状態
    cy.get('[data-gate-type="CLOCK"]').should('have.attr', 'data-gate-id', 'clock');
    
    // CLOCKゲートが点滅するか確認（2Hz = 500ms間隔）
    cy.get('[data-gate-type="CLOCK"]').then($clock => {
      const initialClass = $clock.attr('class');
      const hasActiveClass = initialClass.includes('active');
      
      // 600ms待って状態が変わるか確認
      cy.wait(600);
      
      cy.get('[data-gate-type="CLOCK"]').then($clockAfter => {
        const afterClass = $clockAfter.attr('class');
        const hasActiveClassAfter = afterClass.includes('active');
        
        // 状態が変わっているはず
        expect(hasActiveClassAfter).to.not.equal(hasActiveClass);
      });
    });
    
    // さらに600ms待って再度確認
    cy.wait(600);
    
    // 出力ゲートの状態を確認
    cy.get('[data-gate-type="OUTPUT"]').each(($output, index) => {
      cy.log(`OUTPUT ${index} の状態を確認`);
    });
    
    // 2秒待って状態が変化するか確認
    cy.wait(2000);
    
    // D-FFゲートのメタデータを確認（コンソールログを通じて）
    cy.window().then(win => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        const dffGates = store.gates.filter(g => g.type === 'D-FF');
        console.log('D-FF ゲートの状態:', dffGates);
        
        dffGates.forEach(gate => {
          console.log(`${gate.id}:`, {
            output: gate.output,
            metadata: gate.metadata,
            inputs: gate.inputs
          });
        });
      }
    });
  });

  it('D-FFの状態が更新される', () => {
    cy.contains('🌸 フィボナッチカウンター').click();
    
    // 初期状態を記録
    let initialStates = {};
    cy.get('[data-gate-type="D-FF"]').each(($dff) => {
      const gateId = $dff.attr('data-gate-id');
      const hasActive = $dff.find('.gate-body').hasClass('active');
      initialStates[gateId] = hasActive;
    });
    
    // 3秒待つ（複数のクロックサイクル）
    cy.wait(3000);
    
    // 状態が変化したか確認
    let changedCount = 0;
    cy.get('[data-gate-type="D-FF"]').each(($dff) => {
      const gateId = $dff.attr('data-gate-id');
      const hasActive = $dff.find('.gate-body').hasClass('active');
      
      if (initialStates[gateId] !== hasActive) {
        changedCount++;
        cy.log(`${gateId} の状態が変化しました`);
      }
    });
    
    // 少なくとも1つのD-FFの状態が変化しているはず
    cy.wrap(changedCount).should('be.greaterThan', 0);
  });
});