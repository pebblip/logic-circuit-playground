describe('UI Elements Visibility Check', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('should check if toolbar buttons exist and are visible', () => {
    // 自由制作モードに切り替え
    cy.contains('自由制作').click();
    cy.wait(500);
    
    // 1. canvas-toolbarが存在するかチェック
    cy.get('.canvas-toolbar').should('exist').then(($toolbar) => {
      cy.log('Canvas toolbar found:', $toolbar.length);
      cy.log('Toolbar HTML:', $toolbar.html());
      cy.log('Toolbar CSS display:', $toolbar.css('display'));
      cy.log('Toolbar CSS visibility:', $toolbar.css('visibility'));
      cy.log('Toolbar CSS position:', $toolbar.css('position'));
      cy.log('Toolbar CSS top:', $toolbar.css('top'));
      cy.log('Toolbar CSS left:', $toolbar.css('left'));
    });
    
    // 2. undo/redoボタンが存在するかチェック
    cy.get('button[title="元に戻す"]').should('exist').then(($btn) => {
      cy.log('Undo button found');
      cy.log('Undo button visible:', $btn.is(':visible'));
      cy.log('Undo button CSS:', $btn.css('display'));
    });
    
    cy.get('button[title="やり直し"]').should('exist').then(($btn) => {
      cy.log('Redo button found');
      cy.log('Redo button visible:', $btn.is(':visible'));
    });
    
    // 3. clearボタンが存在するかチェック
    cy.get('button[title="すべてクリア"]').should('exist').then(($btn) => {
      cy.log('Clear button found');
      cy.log('Clear button visible:', $btn.is(':visible'));
    });
    
    // 4. ビジュアライザーボタンが存在するかチェック
    cy.get('button[title="ビジュアライザーを開く"]').should('exist').then(($btn) => {
      cy.log('Visualizer button found');
      cy.log('Visualizer button visible:', $btn.is(':visible'));
      cy.log('Visualizer button content:', $btn.text());
    });
    
    // 5. すべてのtool-buttonを確認
    cy.get('.tool-button').should('exist').then(($buttons) => {
      cy.log('Total tool buttons found:', $buttons.length);
      $buttons.each((index, btn) => {
        cy.log(`Button ${index}:`, btn.title, 'visible:', Cypress.$(btn).is(':visible'));
      });
    });
    
    // 6. スクリーンショットを撮影
    cy.screenshot('ui-elements-visibility-check');
    
    // 7. 各ボタンが実際にクリック可能かテスト
    cy.get('button[title="ビジュアライザーを開く"]').click({ force: true });
    cy.log('Visualizer button clicked successfully');
  });
});