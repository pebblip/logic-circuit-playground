describe('Visual Debug Test', () => {
  it('should check current visual state', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add AND gate
    cy.get('button').then($buttons => {
      const andBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('AND')
      );
      if (andBtn) {
        cy.wrap(andBtn).click();
      }
    });
    
    cy.wait(500);
    
    // Add OR gate
    cy.get('button').then($buttons => {
      const orBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('OR')
      );
      if (orBtn) {
        cy.wrap(orBtn).click();
      }
    });
    
    cy.wait(1000);
    
    // Log all text elements in the SVG
    cy.get('svg text').each(($text, index) => {
      cy.log(`Text ${index}: ${$text.text()}, class: ${$text.attr('class')}`);
    });
    
    // Take screenshot
    cy.screenshot('visual-debug-current-state');
  });
});