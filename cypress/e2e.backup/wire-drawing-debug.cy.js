describe('Wire Drawing Debug', () => {
  it('should show wire while drawing', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add two gates
    cy.get('button').contains('INPUT').click({ force: true });
    cy.wait(500);
    cy.get('button').contains('OUTPUT').click({ force: true });
    cy.wait(500);
    
    // Find and click the output pin of INPUT gate
    cy.get('circle.pin-hit-area').first().click({ force: true });
    cy.wait(200);
    
    // Move mouse to simulate drawing
    for (let i = 0; i < 10; i++) {
      cy.get('svg').trigger('mousemove', { 
        clientX: 400 + (i * 20), 
        clientY: 250 + (i * 10),
        force: true 
      });
      cy.wait(50);
      
      // Check for drawing wire at each step
      cy.get('svg path').then($paths => {
        const drawingPath = Array.from($paths).find(path => {
          const strokeDasharray = path.getAttribute('stroke-dasharray');
          const className = path.getAttribute('class');
          return strokeDasharray || className?.includes('animate-pulse');
        });
        
        if (drawingPath) {
          console.log(`Drawing path found at step ${i}:`, {
            d: drawingPath.getAttribute('d'),
            stroke: drawingPath.getAttribute('stroke'),
            strokeDasharray: drawingPath.getAttribute('stroke-dasharray'),
            className: drawingPath.getAttribute('class')
          });
        } else {
          console.log(`No drawing path found at step ${i}`);
        }
      });
    }
    
    cy.screenshot('wire-drawing-debug');
  });
});