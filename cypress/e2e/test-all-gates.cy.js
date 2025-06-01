describe('Test All Gate Types', () => {
  it('should place all gate types', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Test all gate types
    const gateTypes = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'INPUT', 'OUTPUT', 'CLOCK'];
    
    gateTypes.forEach((gateType, index) => {
      cy.get('button').contains(gateType).click({ force: true });
      cy.wait(200);
    });
    
    // Take screenshot
    cy.screenshot('all-gate-types');
    
    // Check that gates were placed
    cy.get('g[transform*="translate"]').should('have.length.at.least', gateTypes.length);
  });
});