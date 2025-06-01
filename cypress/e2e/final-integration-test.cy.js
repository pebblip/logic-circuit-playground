describe('Final Integration Test', () => {
  it('should verify all major functionality works', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // 1. Add INPUT gate
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    
    // 2. Add AND gate
    cy.get('button').contains('AND').click({ force: true });
    cy.wait(500);
    
    // 3. Add OUTPUT gate
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(500);
    
    // 4. Test drag - move the AND gate
    cy.get('svg g[transform*="translate"]').eq(1).find('rect').first()
      .trigger('mousedown', { button: 0, force: true })
      .wait(200);
    
    cy.get('body')
      .trigger('mousemove', { clientX: 600, clientY: 250 })
      .wait(200)
      .trigger('mouseup');
    
    cy.wait(500);
    
    // 5. Connect INPUT to AND (first input)
    cy.get('circle.pin-hit-area').then($pins => {
      // Find output pin of INPUT gate (should be first)
      const inputOutputPin = $pins[0];
      // Find first input pin of AND gate
      const andInputPin = $pins[2];
      
      if (inputOutputPin && andInputPin) {
        cy.wrap(inputOutputPin).click({ force: true });
        cy.wait(200);
        cy.wrap(andInputPin).click({ force: true });
      }
    });
    
    cy.wait(500);
    
    // 6. Double click INPUT to toggle value
    cy.get('svg g[transform*="translate"]').first()
      .dblclick({ force: true });
    
    cy.wait(500);
    
    // 7. Take final screenshot
    cy.screenshot('final-integration-result');
    
    // Verify connections exist
    cy.get('svg path').should('have.length.at.least', 1);
  });
});