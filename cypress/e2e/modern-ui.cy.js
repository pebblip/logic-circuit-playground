describe('ModernLogicCircuit - ドラッグ機能', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ゲートをドラッグして移動できる', () => {
    // INPUTゲートを追加
    cy.get('button[title="入力 (I)"]').click();
    
    // ゲートが配置されるのを待つ
    cy.get('.gate-rect').should('exist');
    
    // 初期位置を記録
    cy.get('.gate-rect').then($gate => {
      const initialX = parseFloat($gate.attr('x'));
      const initialY = parseFloat($gate.attr('y'));
      
      // ドラッグ操作
      cy.get('.gate-rect')
        .trigger('mousedown', { button: 0 })
        .wait(100);
      
      cy.get('svg')
        .trigger('mousemove', { clientX: initialX + 200, clientY: initialY + 100 })
        .wait(100)
        .trigger('mouseup');
      
      // 位置が変更されたことを確認
      cy.get('.gate-rect').should(($gate) => {
        const newX = parseFloat($gate.attr('x'));
        const newY = parseFloat($gate.attr('y'));
        
        expect(newX).to.not.equal(initialX);
        expect(newY).to.not.equal(initialY);
      });
    });
  });

  it('複数のゲートを個別にドラッグできる', () => {
    // 2つのゲートを追加
    cy.get('button[title="入力 (I)"]').click();
    cy.wait(100);
    cy.get('button[title="出力 (O)"]').click();
    
    // 2つのゲートが存在することを確認
    cy.get('.gate-rect').should('have.length', 2);
    
    // 最初のゲートをドラッグ
    cy.get('.gate-rect').first().then($gate => {
      const initialX = parseFloat($gate.attr('x'));
      
      cy.get('.gate-rect').first()
        .trigger('mousedown', { button: 0 })
        .wait(100);
      
      cy.get('svg')
        .trigger('mousemove', { clientX: initialX + 150, clientY: 200 })
        .wait(100)
        .trigger('mouseup');
    });
    
    // 2番目のゲートの位置は変わっていないことを確認
    cy.get('.gate-rect').eq(1).then($gate => {
      const x = parseFloat($gate.attr('x'));
      const y = parseFloat($gate.attr('y'));
      
      // 元の位置付近にあることを確認（自動配置のオフセットを考慮）
      expect(x).to.be.within(-50, 50);
      expect(y).to.be.within(-50, 50);
    });
  });
});