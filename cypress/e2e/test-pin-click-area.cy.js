describe('Test Pin Click Area', () => {
  it('should identify correct pin click areas', () => {
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
    
    // Find all circles and analyze them
    cy.get('svg').then($svg => {
      const allCircles = $svg.find('circle').toArray();
      console.log(`Total circles found: ${allCircles.length}`);
      
      // Group circles by their properties
      const hitAreas = [];
      const visibleCircles = [];
      
      allCircles.forEach((circle, index) => {
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        const r = circle.getAttribute('r');
        const fill = circle.getAttribute('fill');
        const className = circle.getAttribute('class');
        
        console.log(`Circle ${index}: cx=${cx}, cy=${cy}, r=${r}, fill="${fill}", class="${className}"`);
        
        // Hit areas are usually transparent with larger radius
        if (fill === 'transparent' || className?.includes('hit-area')) {
          hitAreas.push({ element: circle, index, cx, cy, r });
        } else {
          visibleCircles.push({ element: circle, index, cx, cy, r });
        }
      });
      
      console.log(`Found ${hitAreas.length} hit areas and ${visibleCircles.length} visible circles`);
    });
    
    // Try clicking on hit areas specifically
    cy.get('circle.pin-hit-area').then($hitAreas => {
      console.log(`Found ${$hitAreas.length} pin hit areas`);
      
      if ($hitAreas.length >= 2) {
        // Click on the first hit area (should be an output pin)
        cy.wrap($hitAreas[0]).click({ force: true });
        cy.wait(500);
        
        // Click on a different hit area (should be an input pin)
        cy.wrap($hitAreas[$hitAreas.length - 1]).click({ force: true });
        cy.wait(500);
      }
    });
    
    // Check if connection was created
    cy.get('svg path').then($paths => {
      console.log(`Paths found after connection attempt: ${$paths.length}`);
    });
    
    cy.screenshot('pin-click-area-test');
  });
});