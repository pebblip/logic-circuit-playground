describe('UI Improvements Test', () => {
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

  it('should enable canvas panning with space key for PC', () => {
    // Test panning with space + drag
    cy.get('svg.canvas').should('be.visible');
    
    // Add a gate first
    cy.get('[data-gate-type="AND"]').first().click();
    cy.wait(200);
    
    // Get initial gate position
    cy.get('g.gate-container').first().then($gate => {
      const initialTransform = $gate.attr('transform');
      
      // Pan with space key
      cy.get('svg.canvas').trigger('keydown', { key: ' ' });
      cy.get('svg.canvas').trigger('mousedown', { clientX: 400, clientY: 300 });
      cy.get('svg.canvas').trigger('mousemove', { clientX: 500, clientY: 400 });
      cy.get('svg.canvas').trigger('mouseup');
      cy.get('svg.canvas').trigger('keyup', { key: ' ' });
      
      // Check that viewBox has changed (canvas panned)
      cy.get('svg.canvas').should('have.attr', 'viewBox').and('not.equal', '0 0 1200 800');
    });
  });

  it('should support multi-select with drag rectangle', () => {
    // Add multiple gates
    cy.get('[data-gate-type="AND"]').first().click();
    cy.wait(200);
    cy.get('[data-gate-type="OR"]').first().click();
    cy.wait(200);
    cy.get('[data-gate-type="NOT"]').first().click();
    cy.wait(200);
    
    // Drag to select multiple gates
    cy.get('#canvas-background').trigger('mousedown', { clientX: 50, clientY: 50 });
    cy.get('svg.canvas').trigger('mousemove', { clientX: 300, clientY: 300 });
    cy.get('svg.canvas').trigger('mouseup');
    
    // Check that selection rectangle was shown
    // Multiple gates should be selected (check for selected class)
    cy.get('rect.gate.selected').should('have.length.at.least', 2);
  });

  it('should support drag-and-drop from toolbar', () => {
    // Find a gate in the toolbar
    const dataTransfer = new DataTransfer();
    
    cy.get('[data-gate-type="AND"]').first()
      .trigger('dragstart', { dataTransfer });
    
    // Drop on canvas
    cy.get('svg.canvas')
      .trigger('dragover', { clientX: 400, clientY: 300, dataTransfer })
      .trigger('drop', { clientX: 400, clientY: 300, dataTransfer });
    
    // Check that gate was added
    cy.get('g.gate-container').should('exist');
    cy.get('text.gate-text').contains('AND').should('exist');
  });

  it('should delete selected gates with delete key', () => {
    // Add a gate
    cy.get('[data-gate-type="AND"]').first().click();
    cy.wait(200);
    
    // Select it
    cy.get('g.gate-container').first().click();
    cy.wait(100);
    
    // Press delete key
    cy.get('body').type('{del}');
    
    // Gate should be removed
    cy.get('g.gate-container').should('not.exist');
  });

  it('should move multiple selected gates together', () => {
    // Add multiple gates
    cy.get('[data-gate-type="AND"]').first().click();
    cy.wait(200);
    cy.get('[data-gate-type="OR"]').first().click();
    cy.wait(200);
    
    // Select first gate
    cy.get('g.gate-container').first().click();
    
    // Add second gate to selection with Ctrl+Click
    cy.get('g.gate-container').last().click({ ctrlKey: true });
    
    // Both should be selected
    cy.get('rect.gate.selected').should('have.length', 2);
    
    // Drag one of them - both should move
    cy.get('g.gate-container').first()
      .trigger('mousedown', { clientX: 200, clientY: 200 })
      .trigger('mousemove', { clientX: 300, clientY: 300 })
      .trigger('mouseup');
    
    // Both gates should have moved
    cy.get('g.gate-container').each($gate => {
      const transform = $gate.attr('transform');
      expect(transform).to.not.include('translate(100, 100)'); // Initial position
    });
  });
});