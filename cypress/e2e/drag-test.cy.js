describe('Gate Drag Test', () => {
  it('should drag gates properly', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    
    cy.wait(500);
    
    // Get initial position
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Initial transform: ${transform}`);
      
      // Try to drag the gate
      cy.wrap($gate)
        .trigger('mousedown', { button: 0, force: true })
        .wait(100)
        .trigger('mousemove', { clientX: 400, clientY: 400, force: true })
        .wait(100)
        .trigger('mouseup', { force: true });
    });
    
    cy.wait(500);
    
    // Check new position
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Final transform: ${transform}`);
    });
    
    // Take screenshot
    cy.screenshot('drag-test-result');
  });
});