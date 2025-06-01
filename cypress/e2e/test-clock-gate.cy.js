describe('Test CLOCK Gate', () => {
  it('should place CLOCK gate correctly', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add CLOCK gate
    cy.get('button').contains('CLOCK').click({ force: true });
    cy.wait(500);
    
    // Take screenshot
    cy.screenshot('clock-gate-test');
    
    // Check that a gate was placed
    cy.get('g[transform*="translate"]').should('have.length', 1);
    
    // Verify it's not an INPUT gate (should be circular, not rectangular)
    cy.get('g[transform*="translate"]').first().within(() => {
      cy.get('circle').should('have.attr', 'r', '40'); // Clock should have large circle
    });
  });
});