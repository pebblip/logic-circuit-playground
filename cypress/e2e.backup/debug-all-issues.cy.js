describe('Debug All Issues', () => {
  it('should debug drag, wire drawing, and INPUT display', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Open console to see debug logs
    cy.window().then((win) => {
      win.console.log('=== STARTING DEBUG TEST ===');
    });
    
    // Add INPUT gate
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    
    // Add OUTPUT gate
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(500);
    
    // Check INPUT gate appearance
    cy.get('svg').then($svg => {
      const inputGate = $svg.find('g[transform*="translate"]').first();
      const rect = inputGate.find('rect');
      const circle = inputGate.find('circle');
      
      console.log('INPUT gate elements:');
      console.log('- Rect count:', rect.length);
      console.log('- Circle count:', circle.length);
      
      // Should have a switch track (rect) and thumb (circle)
      if (rect.length > 0) {
        console.log('Switch track found:', {
          x: rect.attr('x'),
          y: rect.attr('y'),
          width: rect.attr('width'),
          height: rect.attr('height'),
          rx: rect.attr('rx')
        });
      }
    });
    
    // Test dragging with console logs
    cy.window().then((win) => {
      win.console.log('=== STARTING DRAG TEST ===');
    });
    
    cy.get('svg g[transform*="translate"]').first().then($gate => {
      const initialTransform = $gate.attr('transform');
      console.log('Initial transform:', initialTransform);
    });
    
    // Drag the INPUT gate
    cy.get('svg g[transform*="translate"]').first().find('rect').first()
      .trigger('mousedown', { button: 0, force: true });
    
    // Move incrementally to see updates
    for (let i = 1; i <= 5; i++) {
      cy.wait(100);
      cy.get('body').trigger('mousemove', { 
        clientX: 400 + (i * 40), 
        clientY: 250,
        force: true 
      });
      
      // Log position after each move
      cy.get('svg g[transform*="translate"]').first().then($gate => {
        const transform = $gate.attr('transform');
        console.log(`Position after move ${i}:`, transform);
      });
    }
    
    cy.get('body').trigger('mouseup', { force: true });
    cy.wait(500);
    
    // Test wire drawing
    cy.window().then((win) => {
      win.console.log('=== STARTING WIRE DRAWING TEST ===');
    });
    
    // Click on OUTPUT pin of INPUT gate
    cy.get('circle.pin-hit-area').first().click({ force: true });
    cy.wait(200);
    
    // Check if drawing state exists
    cy.window().then((win) => {
      // Access the store state if possible
      win.console.log('Wire drawing started');
    });
    
    // Move mouse to see if wire follows
    cy.get('svg').trigger('mousemove', { clientX: 500, clientY: 300 });
    cy.wait(100);
    cy.get('svg').trigger('mousemove', { clientX: 600, clientY: 350 });
    cy.wait(100);
    
    // Check for drawing wire
    cy.get('svg path').then($paths => {
      console.log('Number of paths (wires):', $paths.length);
      $paths.each((index, path) => {
        const d = path.getAttribute('d');
        const strokeDasharray = path.getAttribute('stroke-dasharray');
        console.log(`Path ${index}:`, {
          d: d,
          strokeDasharray: strokeDasharray,
          className: path.className
        });
      });
    });
    
    // Click on INPUT pin of OUTPUT gate to complete
    cy.get('circle.pin-hit-area').last().click({ force: true });
    cy.wait(500);
    
    // Final screenshot
    cy.screenshot('debug-all-issues-result');
  });
});