describe('INPUT Gate Toggle Test', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Force skip mode selection
        win.localStorage.setItem('skipModeSelection', 'true');
        win.localStorage.setItem('selectedMode', 'free');
      }
    });
    
    // Wait for app to be ready
    cy.get('body').should('be.visible');
    cy.wait(1000);
  });

  it('should toggle INPUT gate state when double-clicked', () => {
    // Add INPUT gate
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT') || 
        btn.textContent?.includes('入力')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    cy.wait(500);

    // Find the INPUT gate
    cy.get('svg g[transform*="translate"]').should('exist');
    
    // Take screenshot of initial state (should be 0)
    cy.screenshot('input-gate-initial-state');
    
    // Verify initial state is 0
    cy.get('svg g[transform*="translate"]').first().within(() => {
      // Check that the text shows '0'
      cy.get('text').should('contain', '0');
    });

    // Double-click the INPUT gate to toggle it
    cy.get('svg g[transform*="translate"]').first().dblclick({ force: true });
    cy.wait(500);

    // Take screenshot of toggled state (should be 1)
    cy.screenshot('input-gate-toggled-state');
    
    // Verify toggled state is 1
    cy.get('svg g[transform*="translate"]').first().within(() => {
      // Check that the text shows '1'
      cy.get('text').should('contain', '1');
    });

    // Optional: Toggle back to verify it works both ways
    cy.get('svg g[transform*="translate"]').first().dblclick({ force: true });
    cy.wait(500);
    
    // Verify it's back to initial state
    cy.get('svg g[transform*="translate"]').first().within(() => {
      cy.get('text').should('contain', '0');
    });
    
    cy.screenshot('input-gate-toggled-back');
  });

  it('should maintain toggle state visually', () => {
    // Add INPUT gate
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT') || 
        btn.textContent?.includes('入力')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    cy.wait(500);

    // Toggle to active state
    cy.get('svg g[transform*="translate"]').first().dblclick({ force: true });
    cy.wait(500);

    // Add another gate to ensure the INPUT maintains its state
    cy.get('button').then($buttons => {
      const outputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('OUTPUT') || 
        btn.textContent?.includes('出力')
      );
      if (outputBtn) {
        cy.wrap(outputBtn).click();
      }
    });
    cy.wait(500);

    // Verify INPUT gate still shows active state
    cy.get('svg g[transform*="translate"]').first().within(() => {
      cy.get('text').should('contain', '1');
    });
  });
});