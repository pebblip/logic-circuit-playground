describe('Debug Grid Layout Issue', () => {
  it('should check grid and header dimensions', () => {
    cy.viewport(1600, 900);
    cy.visit('/');
    
    // グリッドコンテナの幅を確認
    cy.get('.app-container').then($container => {
      const containerWidth = $container[0].getBoundingClientRect().width;
      const viewportWidth = window.innerWidth;
      
      cy.log(`Container width: ${containerWidth}px`);
      cy.log(`Viewport width: ${viewportWidth}px`);
      cy.log(`Container exceeds viewport: ${containerWidth > viewportWidth}`);
      
      // コンピューテッドスタイルを確認
      const computed = window.getComputedStyle($container[0]);
      cy.log(`Grid columns: ${computed.gridTemplateColumns}`);
    });
    
    // ヘッダーの位置を確認
    cy.get('.header').then($header => {
      const headerRect = $header[0].getBoundingClientRect();
      cy.log(`Header width: ${headerRect.width}px`);
      cy.log(`Header right edge: ${headerRect.right}px`);
    });
    
    // 実行ボタンの位置を確認
    cy.get('.header-actions .button.primary').then($btn => {
      const btnRect = $btn[0].getBoundingClientRect();
      cy.log(`Execute button right edge: ${btnRect.right}px`);
      cy.log(`Execute button visible: ${$btn.is(':visible')}`);
      
      // ボタンがビューポート内にあるか確認
      const inViewport = btnRect.right <= window.innerWidth;
      cy.log(`Execute button in viewport: ${inViewport}`);
    });
    
    cy.screenshot('grid-debug');
  });
});