describe('Drag Visual Feedback Test', () => {
  it('should show visual feedback during gate dragging', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add a gate by double-clicking on the main canvas SVG
    cy.get('svg.w-full.h-full').first()
      .dblclick(400, 300, { shiftKey: true, force: true }); // Shift for INPUT gate
    cy.wait(500);
    
    // Start dragging
    cy.get('g[transform*="translate"]').first()
      .trigger('mousedown', { clientX: 400, clientY: 300 });
    cy.wait(100);
    
    // Drag to different positions and take screenshots
    cy.document().trigger('mousemove', { clientX: 450, clientY: 350 });
    cy.wait(100);
    cy.screenshot('dragging-1');
    
    cy.document().trigger('mousemove', { clientX: 500, clientY: 400 });
    cy.wait(100);
    cy.screenshot('dragging-2');
    
    // Release
    cy.document().trigger('mouseup');
    cy.wait(100);
    cy.screenshot('dragging-complete');
    
    // Check if gate moved
    cy.get('g[transform*="translate(500, 400)"]').should('exist');
  });
});