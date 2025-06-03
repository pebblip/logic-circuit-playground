describe('Manual Verification of Improvements', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    cy.visit('http://localhost:5181');
    cy.wait(1000); // アプリが完全にロードされるまで待つ
  });

  it('verifies all improvements visually', () => {
    // 1. ツールパレットのクリックでゲートが配置されないことを確認
    cy.get('.sidebar-left').within(() => {
      cy.contains('AND').parent().click();
    });
    cy.wait(500);
    cy.screenshot('1-after-click-no-gate');
    
    // 2. ドラッグ＆ドロップでゲートを配置
    cy.get('.sidebar-left').within(() => {
      cy.contains('AND').parent().as('andGate');
    });
    
    // Cypressのdrag and dropシミュレーション
    cy.get('@andGate').trigger('dragstart');
    cy.get('.canvas').trigger('drop', { 
      clientX: 400, 
      clientY: 300 
    });
    cy.wait(500);
    cy.screenshot('2-after-drag-drop');
    
    // 3. 選択矩形の永続性をテスト
    // 複数のゲートを配置
    cy.get('.sidebar-left').within(() => {
      cy.contains('OR').parent().as('orGate');
    });
    cy.get('@orGate').trigger('dragstart');
    cy.get('.canvas').trigger('drop', { 
      clientX: 600, 
      clientY: 300 
    });
    
    // 選択矩形を描画
    cy.get('.canvas')
      .trigger('mousedown', 300, 200, { button: 0 })
      .trigger('mousemove', 700, 400)
      .trigger('mouseup');
    cy.wait(500);
    cy.screenshot('3-selection-rectangle-persists');
    
    // 4. スペース+ドラッグでパン
    cy.get('body').type(' ', { release: false });
    cy.wait(100);
    cy.get('.canvas')
      .trigger('mousedown', 400, 300, { button: 0 })
      .trigger('mousemove', 500, 400)
      .trigger('mouseup');
    cy.get('body').type(' '); // スペースキーを離す
    cy.wait(500);
    cy.screenshot('4-after-pan');
    
    // 5. ズームコントロールの確認
    cy.get('.zoom-controls').should('exist');
    cy.get('.zoom-button.zoom-reset').should('contain', '100%');
    
    // ズームイン
    cy.get('.zoom-controls').within(() => {
      cy.get('.zoom-button').last().click();
    });
    cy.wait(200);
    cy.get('.zoom-button.zoom-reset').should('contain', '110%');
    cy.screenshot('5-after-zoom-in');
    
    // ズームリセット
    cy.get('.zoom-button.zoom-reset').click();
    cy.wait(200);
    cy.get('.zoom-button.zoom-reset').should('contain', '100%');
    cy.screenshot('6-after-zoom-reset');
  });
});