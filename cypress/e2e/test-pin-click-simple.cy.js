describe('Pin Click Simple Test', () => {
  it('should handle pin clicks', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Place INPUT gate at (400, 400)
    cy.get('svg.w-full.h-full').first()
      .dblclick(400, 400, { shiftKey: true, force: true });
    cy.wait(500);
    
    // Click on the OUTPUT pin of INPUT gate
    // INPUT gate center is at (400, 400)
    // OUTPUT pin should be at (400 + 35, 400) = (435, 400)
    cy.get('svg.w-full.h-full').first()
      .click(435, 400, { force: true });
    
    cy.wait(100);
    
    // Move mouse to see if wire is being drawn
    cy.get('svg.w-full.h-full').first()
      .trigger('mousemove', 500, 400, { force: true });
    
    cy.wait(100);
    cy.screenshot('pin-click-result');
    
    // Check if path exists (wire is being drawn)
    cy.get('path').should('exist');
  });
});