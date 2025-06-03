describe('Final UI Check', () => {
  it('should display clean UI without errors', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Check no console errors
    cy.window().then((win) => {
      cy.spy(win.console, 'error');
      cy.spy(win.console, 'warn');
    });
    
    // Add INPUT and OUTPUT gates
    cy.get('svg.w-full.h-full').first()
      .dblclick(200, 200, { shiftKey: true, force: true }); // INPUT
    cy.wait(300);
    
    cy.get('svg.w-full.h-full').first()
      .dblclick(400, 200, { altKey: true, force: true }); // OUTPUT
    cy.wait(300);
    
    // Try clicking on INPUT to toggle
    cy.get('g[transform*="translate(200, 200)"] rect').first().click({ force: true });
    cy.wait(300);
    
    cy.screenshot('final-ui-clean');
    
    // Verify gates exist
    cy.get('g[transform*="translate"]').should('have.length', 2);
    
    // Check no errors in console
    cy.window().then((win) => {
      expect(win.console.error).not.to.have.been.called;
    });
  });
});