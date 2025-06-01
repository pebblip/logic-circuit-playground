describe('UI with Selection', () => {
  it('should show PropertyPanel content when gate is selected', () => {
    cy.visit('http://localhost:5173/');
    cy.wait(2000);
    
    // モード選択画面をスキップ
    cy.get('body').then($body => {
      if ($body.text().includes('学習スタイルを選んでください')) {
        cy.contains('学習モード').click();
        cy.wait(1000);
      }
    });
    
    cy.viewport(1920, 1080);
    
    // ツールパレットからANDゲートをドラッグ
    cy.get('.tool-card').first().trigger('mousedown', { button: 0 });
    cy.get('.main-canvas').trigger('mousemove', { clientX: 500, clientY: 300 });
    cy.get('.main-canvas').trigger('mouseup');
    cy.wait(500);
    
    // ゲートをクリックして選択
    cy.get('.gate').first().click();
    cy.wait(500);
    
    // スクリーンショット
    cy.screenshot('ui-with-selection', {
      capture: 'viewport',
      overwrite: true
    });
  });
});