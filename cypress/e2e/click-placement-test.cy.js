describe('Click Placement Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should place gate on canvas with click', () => {
    // キャンバスにゲートがないことを確認
    cy.get('.canvas').find('text').should('not.exist');
    
    // ANDゲートのツールカードをクリック
    cy.contains('.tool-card', 'AND').click();
    
    // ゲートが自動配置されたことを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
    
    // 位置を確認（自動配置なので固定位置）
    cy.get('.canvas')
      .find('g')
      .should('have.attr', 'transform')
      .and('include', 'translate(100, 100)');
  });

  it('should place multiple gates without overlap', () => {
    // 複数のゲートをクリックで配置
    cy.contains('.tool-card', 'AND').click();
    cy.contains('.tool-card', 'OR').click();
    cy.contains('.tool-card', 'NOT').click();
    cy.contains('.tool-card', 'INPUT').click();
    cy.contains('.tool-card', 'OUTPUT').click();
    
    // すべてのゲートが配置されたことを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
    cy.get('.canvas').find('text').contains('OR').should('exist');
    cy.get('.canvas').find('text').contains('NOT').should('exist');
    cy.get('.switch-track').should('exist');
    cy.contains('💡').should('exist');
    
    // 5つのゲートが異なる位置に配置されていることを確認
    const positions = [];
    cy.get('.canvas').find('g[transform]').each(($el) => {
      const transform = $el.attr('transform');
      positions.push(transform);
    }).then(() => {
      // 重複がないことを確認
      const uniquePositions = [...new Set(positions)];
      expect(uniquePositions.length).to.equal(positions.length);
    });
  });

  it('should improve wire drawing visual', () => {
    // ゲートを配置
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 200, y: 300 });
        store.addGate('OUTPUT', { x: 500, y: 300 });
      }
    });
    
    // INPUTの出力ピンをクリック
    cy.get('.canvas').find('.switch-track').parent()
      .find('circle[r="15"][fill="transparent"]').last()
      .click();
    
    // ワイヤー描画中の線が正しい位置から開始されることを確認
    cy.get('.canvas').find('line[stroke="#00ff88"][stroke-dasharray="5,5"]')
      .should('exist')
      .should(($line) => {
        const x1 = parseFloat($line.attr('x1'));
        const y1 = parseFloat($line.attr('y1'));
        // ピンの位置（235, 300）付近から開始されているはず
        expect(x1).to.be.closeTo(235, 5);
        expect(y1).to.be.closeTo(300, 5);
      });
  });

  it('should not show tool cursor styles anymore', () => {
    // ツールカードのカーソルスタイルを確認
    cy.get('.tool-card').first().should('have.css', 'cursor', 'pointer');
    
    // ドラッグ関連のスタイルがないことを確認
    cy.get('.tool-card').first().trigger('mousedown');
    cy.get('.tool-card').first().should('not.have.css', 'cursor', 'grabbing');
  });
});