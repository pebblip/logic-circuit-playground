describe('Connection Test', () => {
  it('should test connection between gates', () => {
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
    
    // Add OUTPUT gate
    cy.get('button').then($buttons => {
      const outputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('OUTPUT')
      );
      if (outputBtn) {
        cy.wrap(outputBtn).click();
      }
    });
    
    cy.wait(1000);
    
    // Try to find pins
    cy.get('svg').then($svg => {
      // Find all circles that might be pins
      const circles = $svg.find('circle').toArray();
      cy.log(`Found ${circles.length} circles`);
      
      // Look for pin elements
      circles.forEach((circle, index) => {
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        const r = circle.getAttribute('r');
        const fill = circle.getAttribute('fill');
        const stroke = circle.getAttribute('stroke');
        cy.log(`Circle ${index}: cx=${cx}, cy=${cy}, r=${r}, fill=${fill}, stroke=${stroke}`);
      });
    });
    
    // Try clicking on a pin position directly
    // Assuming INPUT gate is at around (400, 250) and output pin is at +35x
    cy.get('svg')
      .trigger('mousedown', { clientX: 435, clientY: 250, force: true })
      .wait(100)
      .trigger('mousemove', { clientX: 500, clientY: 250, force: true })
      .wait(100)
      .trigger('mouseup', { clientX: 565, clientY: 250, force: true });
    
    cy.wait(500);
    
    // Check if any path (wire) was created
    cy.get('svg path').then($paths => {
      cy.log(`Found ${$paths.length} paths`);
    });
    
    // Take screenshot
    cy.screenshot('connection-test-result');
  });
});