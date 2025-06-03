describe('Mockup Screenshots', () => {
  it('should capture desktop mockup', () => {
    // デスクトップモックアップを開く
    cy.visit('file://' + Cypress.config('projectRoot') + '/docs/design/mockups/desktop-ui.html');
    cy.wait(1000);
    
    // デスクトップビューポート
    cy.viewport(1920, 1080);
    cy.screenshot('mockup-desktop', {
      capture: 'viewport',
      overwrite: true
    });
  });
  
  it('should capture mobile mockup', () => {
    // モバイルモックアップを開く
    cy.visit('file://' + Cypress.config('projectRoot') + '/docs/design/mockups/mobile-ui.html');
    cy.wait(1000);
    
    // モバイルビューポート
    cy.viewport('iphone-x');
    cy.screenshot('mockup-mobile', {
      capture: 'viewport',
      overwrite: true
    });
  });
  
  it('should capture gate design mockup', () => {
    // ゲートデザインモックアップを開く
    cy.visit('file://' + Cypress.config('projectRoot') + '/docs/design/mockups/final-gate-design.html');
    cy.wait(1000);
    
    // 大きめのビューポート
    cy.viewport(1440, 900);
    cy.screenshot('mockup-gate-design', {
      capture: 'fullPage',
      overwrite: true
    });
  });
});