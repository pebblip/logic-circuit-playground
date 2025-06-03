describe('Test Wire Connection', () => {
  it('should connect wires between gates', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT and OUTPUT gates
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(200);
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(200);
    
    // Try to connect from INPUT to OUTPUT
    // Click on the output pin of INPUT gate
    cy.get('g[transform*="translate"]').first().within(() => {
      cy.get('circle.pin-hit-area').last().click({ force: true });
    });
    
    cy.wait(200);
    
    // Check if drawing wire is visible
    cy.get('svg path').should('exist');
    
    // Click on the input pin of OUTPUT gate
    cy.get('g[transform*="translate"]').eq(1).within(() => {
      cy.get('circle.pin-hit-area').first().click({ force: true });
    });
    
    cy.wait(200);
    
    cy.screenshot('wire-connection-test');
    
    // Check if connection was created
    cy.get('svg path').should('have.length.at.least', 1);
  });
});