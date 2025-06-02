describe('Debug Buttons Visibility', () => {
  it('should debug why buttons are not visible', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    
    // ヘッダーの存在を確認
    cy.get('.header').should('exist').should('be.visible');
    
    // header-actionsの存在を確認
    cy.get('.header-actions').should('exist').then($actions => {
      const display = window.getComputedStyle($actions[0]).display;
      const visibility = window.getComputedStyle($actions[0]).visibility;
      const opacity = window.getComputedStyle($actions[0]).opacity;
      const width = $actions[0].getBoundingClientRect().width;
      const height = $actions[0].getBoundingClientRect().height;
      
      cy.log(`header-actions display: ${display}`);
      cy.log(`header-actions visibility: ${visibility}`);
      cy.log(`header-actions opacity: ${opacity}`);
      cy.log(`header-actions width: ${width}`);
      cy.log(`header-actions height: ${height}`);
    });
    
    // ボタンの存在を確認
    cy.get('.header-actions .button').then($buttons => {
      cy.log(`Found ${$buttons.length} buttons`);
      
      $buttons.each((index, button) => {
        const rect = button.getBoundingClientRect();
        const display = window.getComputedStyle(button).display;
        const visibility = window.getComputedStyle(button).visibility;
        
        cy.log(`Button ${index}: ${button.textContent}`);
        cy.log(`  - Display: ${display}`);
        cy.log(`  - Visibility: ${visibility}`);
        cy.log(`  - Position: ${rect.left}, ${rect.top}`);
        cy.log(`  - Size: ${rect.width} x ${rect.height}`);
      });
    });
    
    // ヘッダー内の全要素を確認
    cy.get('.header').children().then($children => {
      cy.log(`Header has ${$children.length} children`);
      $children.each((index, child) => {
        cy.log(`Child ${index}: ${child.className}`);
      });
    });
    
    // スクリーンショット
    cy.screenshot('debug-visibility');
  });
});