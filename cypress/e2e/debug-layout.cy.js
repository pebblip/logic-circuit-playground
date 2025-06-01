describe('Layout Debug', () => {
  it('should check layout structure', () => {
    cy.visit('http://localhost:5173/');
    cy.wait(2000);
    
    // モード選択画面をスキップ
    cy.get('body').then($body => {
      if ($body.text().includes('学習スタイルを選んでください')) {
        cy.contains('学習モード').click();
        cy.wait(1000);
      }
    });
    
    // app-containerを確認
    cy.get('.app-container').should('exist').then($container => {
      const styles = window.getComputedStyle($container[0]);
      console.log('app-container computed styles:', {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
        gridTemplateRows: styles.gridTemplateRows,
        width: styles.width,
        height: styles.height
      });
    });
    
    // 各要素の存在と位置を確認
    cy.get('.sidebar-left').should('exist').then($el => {
      const rect = $el[0].getBoundingClientRect();
      console.log('sidebar-left:', {
        left: rect.left,
        width: rect.width,
        right: rect.right,
        visible: rect.width > 0 && rect.height > 0
      });
    });
    
    cy.get('.main-canvas').should('exist').then($el => {
      const rect = $el[0].getBoundingClientRect();
      console.log('main-canvas:', {
        left: rect.left,
        width: rect.width,
        right: rect.right,
        visible: rect.width > 0 && rect.height > 0
      });
    });
    
    cy.get('.sidebar-right').should('exist').then($el => {
      const rect = $el[0].getBoundingClientRect();
      console.log('sidebar-right:', {
        left: rect.left,
        width: rect.width,
        right: rect.right,
        visible: rect.width > 0 && rect.height > 0,
        offScreen: rect.left >= window.innerWidth
      });
    });
    
    // 全画面のスクリーンショット
    cy.screenshot('layout-debug', {
      capture: 'fullPage',
      overwrite: true
    });
  });
});