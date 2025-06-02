describe('Check Header Buttons', () => {
  it('should show header buttons on desktop', () => {
    cy.viewport(1440, 900);
    cy.visit('/');
    
    // ヘッダーが表示されるまで待つ
    cy.get('.header').should('be.visible');
    
    // モードタブが表示されているか確認
    cy.get('.mode-tabs').should('be.visible');
    
    // header-actionsが存在するか確認
    cy.get('.header-actions').should('exist');
    
    // header-actionsの表示状態を確認
    cy.get('.header-actions').then($el => {
      const display = window.getComputedStyle($el[0]).display;
      const visibility = window.getComputedStyle($el[0]).visibility;
      const opacity = window.getComputedStyle($el[0]).opacity;
      
      cy.log(`header-actions display: ${display}`);
      cy.log(`header-actions visibility: ${visibility}`);
      cy.log(`header-actions opacity: ${opacity}`);
    });
    
    // ボタンが存在するか確認
    cy.get('.header-actions .button').should('have.length', 3);
    
    // 各ボタンの表示状態を確認
    cy.get('.header-actions .button').each(($button, index) => {
      cy.wrap($button).should('be.visible');
      cy.wrap($button).then($el => {
        const text = $el.text();
        cy.log(`Button ${index}: "${text}"`);
      });
    });
    
    // スクリーンショットを撮る
    cy.screenshot('header-buttons-check');
  });
});