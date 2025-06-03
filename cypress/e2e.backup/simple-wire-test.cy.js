describe('Simple Wire Test', () => {
  it('should show wire while drawing', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add gates
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(500);
    
    // Start wire drawing
    cy.get('circle.pin-hit-area').first().click({ force: true });
    cy.wait(200);
    
    // Move mouse multiple times
    cy.get('svg').first().trigger('mousemove', { clientX: 400, clientY: 250 });
    cy.wait(100);
    cy.screenshot('wire-drawing-1');
    
    cy.get('svg').first().trigger('mousemove', { clientX: 500, clientY: 300 });
    cy.wait(100);
    cy.screenshot('wire-drawing-2');
    
    cy.get('svg').first().trigger('mousemove', { clientX: 600, clientY: 350 });
    cy.wait(100);
    cy.screenshot('wire-drawing-3');
    
    // Check for wire path
    cy.get('svg path').should('exist');
  });
});