describe('Manual Drag Test', () => {
  it('should test drag with visual confirmation', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add AND gate
    cy.get('button').contains('AND').click({ force: true });
    cy.wait(500);
    
    // Take initial screenshot
    cy.screenshot('before-drag');
    
    // Get initial position
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Initial: ${transform}`);
    });
    
    // Perform drag - target the rect inside the gate
    cy.get('svg g[transform*="translate"]').first().find('rect').first()
      .trigger('mousedown', { button: 0, clientX: 400, clientY: 250, force: true })
      .wait(200);
    
    // Move across screen
    cy.get('body')
      .trigger('mousemove', { clientX: 700, clientY: 400 })
      .wait(200)
      .trigger('mouseup');
    
    cy.wait(500);
    
    // Get final position
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Final: ${transform}`);
    });
    
    // Take final screenshot
    cy.screenshot('after-drag');
  });
});