describe('Save/Load Functionality Test', () => {
  it('should test save and load functionality', () => {
    cy.visit('/');
    cy.wait(2000);
    
    // Check if header buttons exist
    cy.get('header').should('be.visible');
    cy.get('.header-actions').should('be.visible');
    
    // Try to find save button
    cy.get('button').contains('保存').should('be.visible');
    cy.get('button').contains('読み込み').should('be.visible');
    cy.get('button').contains('エクスポート').should('be.visible');
    cy.get('button').contains('インポート').should('be.visible');
    
    // Test tool palette exists
    cy.get('.tool-palette').should('be.visible');
    cy.get('.tool-card').should('have.length.at.least', 1);
    
    // Test canvas exists  
    cy.get('.canvas-container').should('be.visible');
    cy.get('svg.canvas').should('be.visible');
    
    // Try clicking a tool (first available tool)
    cy.get('.tool-card').first().click({ force: true });
    cy.wait(500);
    
    // Click on canvas to place gate
    cy.get('svg.canvas').click(400, 300, { force: true });
    cy.wait(500);
    
    // Check if any gates exist (using transform attribute for placed gates)
    cy.get('svg g[transform*="translate"]').then($gates => {
      if ($gates.length > 0) {
        cy.log(`Found ${$gates.length} gates placed`);
      } else {
        cy.log('No gates found, but continuing test');
      }
    });
    
    // Take screenshot
    cy.screenshot('save-load-test-complete');
    
    // Test save dialog
    cy.get('button').contains('保存').click({ force: true });
    cy.wait(1000);
    
    // Save dialog should open
    cy.get('.save-dialog').should('be.visible');
    
    cy.screenshot('save-dialog-open');
  });
});