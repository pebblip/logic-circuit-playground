describe('Toggle Debug Test', () => {
  it('should debug toggle functionality', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate using button
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT') || 
        btn.textContent?.includes('入力')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    
    cy.wait(1000);
    
    // Find the INPUT gate
    cy.get('svg g[transform*="translate"]').should('exist');
    
    // Log initial state
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const textContent = $gate.find('text').text();
      cy.log(`Initial text content: ${textContent}`);
    });
    
    // Try double-click on the entire gate group
    cy.get('svg g[transform*="translate"]').first()
      .trigger('dblclick', { force: true });
    
    cy.wait(1000);
    
    // Log state after double-click
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const textContent = $gate.find('text').text();
      cy.log(`Text after dblclick: ${textContent}`);
    });
    
    // Also try clicking on the rect element directly
    cy.get('svg g[transform*="translate"]').first()
      .find('rect').first()
      .trigger('dblclick', { force: true });
      
    cy.wait(1000);
    
    // Log state after rect double-click
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const textContent = $gate.find('text').text();
      cy.log(`Text after rect dblclick: ${textContent}`);
    });
    
    // Take final screenshot
    cy.screenshot('toggle-debug-final');
  });
});