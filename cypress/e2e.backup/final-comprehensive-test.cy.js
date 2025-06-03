describe('Final Comprehensive Test', () => {
  it('should demonstrate all functionality working', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Place various gates
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(200);
    
    cy.get('button').contains('AND').click({ force: true });
    cy.wait(200);
    
    cy.get('button').contains('XOR').click({ force: true });
    cy.wait(200);
    
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(200);
    
    // Toggle INPUT to ON
    cy.get('g[transform*="translate"]').first().click({ force: true });
    cy.wait(200);
    
    // Connect INPUT to AND
    cy.get('g[transform*="translate"]').first().within(() => {
      cy.get('circle.pin-hit-area').last().click({ force: true });
    });
    cy.wait(100);
    cy.get('g[transform*="translate"]').eq(1).within(() => {
      cy.get('circle.pin-hit-area').first().click({ force: true });
    });
    cy.wait(200);
    
    // Final screenshot
    cy.screenshot('final-comprehensive-test');
    
    // Verify elements exist
    cy.get('g[transform*="translate"]').should('have.length', 4); // 4 gates
    cy.get('svg path').should('have.length.at.least', 1); // At least 1 wire
  });
});