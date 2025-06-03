describe('Test INPUT Toggle', () => {
  it('should toggle INPUT gate when clicked', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(300);
    
    // Get the INPUT gate and check initial state
    cy.get('g[transform*="translate"]').first().within(() => {
      // Check initial state (off)
      cy.get('rect').first().should('exist');
      cy.get('circle').first().should('have.attr', 'cx', '-5');
      
      // Click the switch
      cy.get('rect').first().click({ force: true });
    });
    
    cy.wait(300);
    
    // Check toggled state (on)
    cy.get('g[transform*="translate"]').first().within(() => {
      cy.get('circle').first().should('have.attr', 'cx', '5');
    });
    
    cy.screenshot('input-toggle-test');
  });
});