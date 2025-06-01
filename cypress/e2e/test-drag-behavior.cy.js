describe('Test Drag Behavior', () => {
  it('should test gate dragging with detailed logging', () => {
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
    
    cy.wait(1000);
    
    // Get the gate element
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const initialTransform = $gate.attr('transform');
      console.log(`Initial transform: ${initialTransform}`);
      
      // Parse initial position
      const match = initialTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        const initialX = parseFloat(match[1]);
        const initialY = parseFloat(match[2]);
        console.log(`Initial position: x=${initialX}, y=${initialY}`);
      }
      
      // Find the gate's rect element
      const rect = $gate.find('rect').first();
      if (rect.length) {
        // Get rect bounds
        const rectElement = rect[0];
        const bbox = rectElement.getBBox();
        console.log(`Rect BBox: x=${bbox.x}, y=${bbox.y}, width=${bbox.width}, height=${bbox.height}`);
      }
    });
    
    // Try different drag approaches
    
    // Approach 1: Direct mousedown on g element
    cy.get('svg g[transform*="translate"]').first()
      .trigger('mousedown', { button: 0, force: true })
      .wait(100);
    
    cy.get('svg').first()
      .trigger('mousemove', { clientX: 600, clientY: 300, force: true })
      .wait(100);
    
    cy.get('svg').first()
      .trigger('mouseup', { force: true })
      .wait(500);
    
    // Check position after first drag attempt
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      console.log(`After drag attempt 1: ${transform}`);
    });
    
    // Approach 2: Drag from the rect inside the g element
    cy.get('svg g[transform*="translate"]').first().within(() => {
      cy.get('rect').first()
        .trigger('mousedown', { button: 0, clientX: 400, clientY: 250, force: true });
    });
    
    cy.wait(100);
    
    // Move using body element
    cy.get('body').trigger('mousemove', { clientX: 600, clientY: 400, force: true });
    cy.wait(100);
    cy.get('body').trigger('mouseup', { force: true });
    
    cy.wait(500);
    
    // Check final position
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const finalTransform = $gate.attr('transform');
      console.log(`Final transform: ${finalTransform}`);
    });
    
    // Take screenshot
    cy.screenshot('drag-behavior-test');
  });
});