describe('Verify INPUT Switch Design', () => {
  it('should display INPUT as a switch', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    
    // Check for switch elements
    cy.get('svg g[transform*="translate"]').first().within(() => {
      // Should have a rect (switch track)
      cy.get('rect').should('exist').then($rect => {
        const rect = $rect[0];
        console.log('Switch track:', {
          x: rect.getAttribute('x'),
          y: rect.getAttribute('y'),
          width: rect.getAttribute('width'),
          height: rect.getAttribute('height'),
          rx: rect.getAttribute('rx'),
          fill: rect.getAttribute('fill'),
          stroke: rect.getAttribute('stroke')
        });
      });
      
      // Should have circles (switch thumb and pins)
      cy.get('circle').should('have.length.at.least', 1).then($circles => {
        console.log(`Found ${$circles.length} circles`);
        $circles.each((index, circle) => {
          console.log(`Circle ${index}:`, {
            cx: circle.getAttribute('cx'),
            cy: circle.getAttribute('cy'),
            r: circle.getAttribute('r'),
            fill: circle.getAttribute('fill')
          });
        });
      });
    });
    
    // Check the rendered output
    cy.screenshot('input-switch-verification');
  });
});