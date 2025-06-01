describe('Minimal Test', () => {
  it('should test INPUT switch and wire drawing', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    
    // Check INPUT design
    cy.get('svg g[transform*="translate"]').first().within(() => {
      // Should have switch elements
      cy.get('rect[rx="15"]').should('exist'); // Switch track
      cy.get('circle[r="10"]').should('exist'); // Switch thumb
    });
    
    // Add OUTPUT
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(500);
    
    // Start connection
    cy.get('circle.pin-hit-area').first().click({ force: true });
    cy.wait(200);
    
    // Move mouse and check for drawing line
    cy.get('svg').first().trigger('mousemove', { clientX: 500, clientY: 300 });
    cy.wait(200);
    
    // Check if drawing wire exists
    cy.get('svg path').should('exist');
    
    cy.screenshot('minimal-test-result');
  });
});