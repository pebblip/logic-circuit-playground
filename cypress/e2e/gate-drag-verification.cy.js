describe('Gate Drag Verification', () => {
  it('should verify gate position changes after dragging', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add INPUT gate by clicking button
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    
    cy.wait(1000);
    
    // Store initial position
    let initialX, initialY;
    
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Initial transform: ${transform}`);
      
      // Parse position from transform
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        initialX = parseFloat(match[1]);
        initialY = parseFloat(match[2]);
        cy.log(`Initial position: x=${initialX}, y=${initialY}`);
      }
    });
    
    // Perform drag operation on the gate's rect element
    cy.get('svg g[transform*="translate"]').first().within(() => {
      cy.get('rect').first()
        .trigger('mousedown', { button: 0, force: true });
    });
    
    cy.wait(100);
    
    // Move mouse to new position using document
    cy.document().trigger('mousemove', { clientX: 500, clientY: 300 });
    cy.wait(100);
    cy.document().trigger('mouseup');
    
    cy.wait(500);
    
    // Verify position changed
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      cy.log(`Final transform: ${transform}`);
      
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        const finalX = parseFloat(match[1]);
        const finalY = parseFloat(match[2]);
        cy.log(`Final position: x=${finalX}, y=${finalY}`);
        
        // Assert that position has changed
        expect(finalX).to.not.equal(initialX, 'X position should change after drag');
        expect(finalY).to.not.equal(initialY, 'Y position should change after drag');
        
        // Check that the gate moved a reasonable distance
        const deltaX = Math.abs(finalX - initialX);
        const deltaY = Math.abs(finalY - initialY);
        cy.log(`Position delta: dx=${deltaX}, dy=${deltaY}`);
        
        // At least one coordinate should change significantly
        expect(deltaX + deltaY).to.be.greaterThan(20, 'Gate should move at least 20 pixels');
      }
    });
    
    cy.screenshot('gate-drag-verified');
  });
  
  it('should drag gate using native events', () => {
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
    
    // Get initial position
    let initialPos;
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        initialPos = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
        cy.log(`Initial: ${initialPos.x}, ${initialPos.y}`);
      }
      
      // Get the rect element inside the gate
      const rect = $gate.find('rect')[0];
      const rectBounds = rect.getBoundingClientRect();
      const centerX = rectBounds.x + rectBounds.width / 2;
      const centerY = rectBounds.y + rectBounds.height / 2;
      
      // Use native mouse events
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        clientX: centerX,
        clientY: centerY
      });
      rect.dispatchEvent(mouseDownEvent);
    });
    
    cy.wait(100);
    
    // Move mouse
    cy.window().then(win => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: win,
        clientX: 400,
        clientY: 300
      });
      win.document.dispatchEvent(mouseMoveEvent);
    });
    
    cy.wait(100);
    
    // Mouse up
    cy.window().then(win => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: win,
        button: 0
      });
      win.document.dispatchEvent(mouseUpEvent);
    });
    
    cy.wait(500);
    
    // Verify position changed
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const transform = $gate.attr('transform');
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match && initialPos) {
        const finalPos = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
        cy.log(`Final: ${finalPos.x}, ${finalPos.y}`);
        
        const moved = finalPos.x !== initialPos.x || finalPos.y !== initialPos.y;
        expect(moved).to.be.true;
      }
    });
  });
});