describe('Debug Wire Connection', () => {
  it('should debug wire connections with better logging', () => {
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
    
    // Find gates
    cy.get('svg g[transform*="translate"]').then($gates => {
      console.log(`Found ${$gates.length} gates`);
      
      $gates.each((index, gate) => {
        const transform = gate.getAttribute('transform');
        console.log(`Gate ${index}: ${transform}`);
        
        // Find circles (pins) inside each gate
        const circles = gate.querySelectorAll('circle');
        console.log(`  Gate ${index} has ${circles.length} circles`);
        
        circles.forEach((circle, cIndex) => {
          const cx = circle.getAttribute('cx');
          const cy = circle.getAttribute('cy');
          const r = circle.getAttribute('r');
          console.log(`    Circle ${cIndex}: cx=${cx}, cy=${cy}, r=${r}`);
        });
      });
    });
    
    // Try to click on the first gate's output pin
    cy.get('svg g[transform*="translate"]').first().within(() => {
      // Find circles with positive cx (likely output pins)
      cy.get('circle').then($circles => {
        const outputPin = Array.from($circles).find(circle => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          return cx > 0;
        });
        
        if (outputPin) {
          console.log('Found output pin, clicking...');
          cy.wrap(outputPin).click({ force: true });
        }
      });
    });
    
    cy.wait(500);
    
    // Try to click on the second gate's input pin
    cy.get('svg g[transform*="translate"]').eq(1).within(() => {
      // Find circles with negative cx (likely input pins)
      cy.get('circle').then($circles => {
        const inputPin = Array.from($circles).find(circle => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          return cx < 0;
        });
        
        if (inputPin) {
          console.log('Found input pin, clicking...');
          cy.wrap(inputPin).click({ force: true });
        }
      });
    });
    
    cy.wait(500);
    
    // Check if any path (wire) was created
    cy.get('svg path').then($paths => {
      console.log(`Found ${$paths.length} paths after connection attempt`);
      
      $paths.each((index, path) => {
        const d = path.getAttribute('d');
        console.log(`Path ${index}: ${d}`);
      });
    });
    
    // Take screenshot
    cy.screenshot('debug-wire-connection-result');
  });
});