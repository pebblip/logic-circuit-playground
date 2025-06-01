describe('Gate Placement and Movement Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should place gate on canvas with click', () => {
    // キャンバス内にゲートがないことを確認
    cy.get('.canvas').find('text').should('not.exist');
    
    // ANDゲートをクリック
    cy.contains('.tool-card', 'AND').click();
    
    // ゲートが配置されたことを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
  });

  it('should move gate by dragging', () => {
    // ゲートを直接追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('OR', { x: 300, y: 200 });
      }
    });
    
    // ORゲートの初期位置を確認
    cy.get('.canvas')
      .find('g')
      .should('have.attr', 'transform')
      .and('include', 'translate(300, 200)');
    
    // ゲートをドラッグして移動
    cy.get('.canvas').find('text').contains('OR').parent()
      .trigger('mousedown', { button: 0, clientX: 300, clientY: 200 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    // 位置が変更されたことを確認（おおよその位置）
    cy.get('.canvas')
      .find('g')
      .should('have.attr', 'transform')
      .and('not.include', 'translate(300, 200)');
  });

  it('should select gate on click', () => {
    // ゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('NOT', { x: 400, y: 300 });
      }
    });
    
    // ゲートをクリック
    cy.get('.canvas').find('text').contains('NOT').parent().click();
    
    // ゲートが選択されたことを確認
    cy.get('.gate.selected').should('exist');
    cy.contains('選択中: NOT ゲート').should('be.visible');
  });

  it('should handle multiple gates', () => {
    // 複数のゲートをクリックで配置
    cy.contains('.tool-card', 'AND').click();
    cy.contains('.tool-card', 'OR').click();
    cy.contains('.tool-card', 'NOT').click();
    
    // すべてのゲートが配置されたことを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
    cy.get('.canvas').find('text').contains('OR').should('exist');
    cy.get('.canvas').find('text').contains('NOT').should('exist');
    
    // ゲートが重ならずに配置されていることを確認
    let positions = [];
    cy.get('.canvas').find('g[transform]').each(($el) => {
      const transform = $el.attr('transform');
      positions.push(transform);
    }).then(() => {
      // 重複がないことを確認
      const uniquePositions = [...new Set(positions)];
      expect(uniquePositions.length).to.equal(positions.length);
    });
  });
});