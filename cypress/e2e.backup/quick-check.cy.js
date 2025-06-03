describe('Quick Check', () => {
  it('should load the application', () => {
    cy.visit('http://localhost:5181');
    cy.wait(2000); // Wait for app to load
    cy.screenshot('app-loaded');
    
    // アプリケーションの基本要素を確認
    cy.get('.app-container').should('exist');
    cy.get('.sidebar-left').should('exist');
    cy.get('.canvas').should('exist');
  });
});