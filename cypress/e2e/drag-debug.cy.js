describe('Drag Debug Test', () => {
  it('should debug drag behavior', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Open console to see logs
    cy.window().then(win => {
      cy.spy(win.console, 'log');
    });
    
    // Add a gate by double-clicking
    cy.get('svg.w-full.h-full').first()
      .dblclick(400, 300, { shiftKey: true, force: true }); // INPUT gate
    cy.wait(500);
    
    // Start dragging on the gate itself
    cy.get('g[transform*="translate"]').first()
      .trigger('mousedown', { clientX: 400, clientY: 300, button: 0, force: true });
    cy.wait(100);
    
    // Check console logs
    cy.window().then(win => {
      expect(win.console.log).to.have.been.calledWith(
        '[Gate] handleMouseDown triggered'
      );
    });
    
    // Drag to new position
    cy.document().trigger('mousemove', { clientX: 500, clientY: 400 });
    cy.wait(100);
    
    // Release
    cy.document().trigger('mouseup');
    cy.wait(100);
    
    // Check if gate moved
    cy.get('g').should('contain', 'transform');
  });
});