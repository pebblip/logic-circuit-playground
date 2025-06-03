describe('Test INPUT Visual Bug', () => {
  it('should not change INPUT gate to purple rectangle on click', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    
    // Take screenshot before clicking
    cy.screenshot('input-before-click');
    
    // Click on the INPUT gate
    cy.get('g[transform*="translate"]').first().click({ force: true });
    cy.wait(500);
    
    // Take screenshot after clicking
    cy.screenshot('input-after-click');
    
    // Check that it still has the switch design
    cy.get('g[transform*="translate"]').first().within(() => {
      cy.get('rect').should('have.attr', 'rx', '15'); // Should still be rounded
      cy.get('circle').should('exist'); // Should still have the thumb
    });
  });
});