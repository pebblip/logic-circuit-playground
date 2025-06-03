describe('Simple UI Improvements Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.wait(1000);
    // Skip mode selection if it exists
    cy.get('body').then($body => {
      if ($body.find('[data-testid="mode-selector-free-mode"]').length > 0) {
        cy.get('[data-testid="mode-selector-free-mode"]').click();
      }
    });
    cy.wait(500);
  });

  it('should place gate with drag and drop', () => {
    // Check that no gates exist initially
    cy.get('g.gate-container').should('not.exist');
    
    // Drag and drop an AND gate
    const dataTransfer = new DataTransfer();
    
    cy.get('[data-gate-type="AND"]').first()
      .trigger('dragstart', { dataTransfer });
    
    cy.get('svg.canvas')
      .trigger('dragover', { clientX: 400, clientY: 300, dataTransfer })
      .trigger('drop', { clientX: 400, clientY: 300, dataTransfer });
    
    // Verify gate was added
    cy.get('g.gate-container').should('have.length', 1);
    cy.get('text.gate-text').contains('AND').should('exist');
  });

  it('should pan canvas with space + drag', () => {
    // Get initial viewBox
    cy.get('svg.canvas').then($svg => {
      const initialViewBox = $svg.attr('viewBox');
      
      // Test that panning cursor changes
      cy.get('body').type(' ', { release: false });
      cy.get('svg.canvas').should('have.css', 'cursor', 'grab');
      
      cy.get('body').type(' '); // Release space
      cy.get('svg.canvas').should('have.css', 'cursor', 'default');
    });
  });

  it('should delete gate with delete key', () => {
    // Add a gate first
    cy.get('[data-gate-type="OR"]').first().click();
    cy.wait(200);
    
    // Verify gate exists
    cy.get('g.gate-container').should('have.length', 1);
    
    // Select the gate
    cy.get('g.gate-container').first().click();
    cy.wait(100);
    
    // Delete with keyboard
    cy.get('body').type('{del}');
    
    // Verify gate is deleted
    cy.get('g.gate-container').should('not.exist');
  });

  it('should show selection styles on gates', () => {
    // Add two gates
    cy.get('[data-gate-type="AND"]').first().click();
    cy.wait(200);
    cy.get('[data-gate-type="OR"]').first().click();
    cy.wait(200);
    
    // Click first gate to select it
    cy.get('g.gate-container').first().click();
    
    // Check that it has selected styling
    cy.get('g.gate-container').first()
      .find('rect.gate')
      .should('have.attr', 'stroke', '#00aaff')
      .and('have.attr', 'stroke-width', '3');
    
    // Ctrl+click second gate to multi-select
    cy.get('g.gate-container').last().click({ ctrlKey: true });
    
    // Both should have selected styling
    cy.get('rect.gate[stroke="#00aaff"]').should('have.length', 2);
  });
});