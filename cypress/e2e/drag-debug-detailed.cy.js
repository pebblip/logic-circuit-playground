describe('Detailed Drag Debug', () => {
  it('should debug drag behavior in detail', () => {
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
    
    cy.wait(1000);
    
    // Get SVG viewport info
    cy.get('svg').then($svg => {
      const viewBox = $svg.attr('viewBox');
      const rect = $svg[0].getBoundingClientRect();
      cy.log(`SVG viewBox: ${viewBox}`);
      cy.log(`SVG rect: ${rect.width}x${rect.height} at ${rect.x},${rect.y}`);
    });
    
    // Find the gate
    cy.get('svg g[transform*="translate"]').first().as('gate');
    
    // Get initial position
    cy.get('@gate').then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Initial transform: ${transform}`);
      
      // Get the rect inside the gate
      const rect = $gate.find('rect').first();
      if (rect.length) {
        cy.log(`Found rect inside gate`);
        
        // Try dragging the rect directly
        cy.wrap(rect[0])
          .trigger('mousedown', { 
            button: 0, 
            clientX: 300, 
            clientY: 300,
            force: true 
          });
          
        cy.wait(100);
        
        // Move to new position
        cy.get('body')
          .trigger('mousemove', { 
            clientX: 500, 
            clientY: 400,
            force: true 
          });
          
        cy.wait(100);
        
        // Release
        cy.get('body')
          .trigger('mouseup', { 
            force: true 
          });
      }
    });
    
    cy.wait(500);
    
    // Check final position
    cy.get('@gate').then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Final transform: ${transform}`);
    });
    
    // Take screenshot
    cy.screenshot('drag-debug-detailed');
  });
});