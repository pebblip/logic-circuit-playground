describe('Mockup UI Test', () => {
  it('should demonstrate the new mockup-style UI', () => {
    cy.visit('/');
    cy.wait(2000);
    
    // Header elements check
    cy.get('.logo').should('contain', '論理回路プレイグラウンド');
    cy.get('.mode-tabs .mode-tab.active').should('contain', '学習モード');
    cy.get('.header-actions button').should('have.length', 3);
    
    // Left sidebar tools check
    cy.get('.sidebar-left .section-title').should('contain', '基本ゲート');
    cy.get('.sidebar-left .section-title').should('contain', '入出力');
    cy.get('.sidebar-left .section-title').should('contain', '特殊ゲート');
    
    // Main canvas check
    cy.get('.main-canvas').should('be.visible');
    cy.get('.canvas-toolbar .tool-button').should('have.length.at.least', 7);
    cy.get('.status-bar').should('contain', 'シミュレーション実行中');
    
    // Place an AND gate
    cy.get('.tool-card').contains('AND').click({ force: true });
    cy.wait(500);
    
    // Check if gate was placed
    cy.get('svg g[transform*="translate"]').should('have.length.at.least', 1);
    
    // Click on the gate to select it (avoiding drag behavior)
    cy.get('svg g[transform*="translate"]').first().trigger('mousedown', { which: 1 });
    cy.get('svg g[transform*="translate"]').first().trigger('mouseup', { which: 1 });
    cy.wait(1000);
    
    // Right sidebar should show gate properties (or just verify UI structure works)
    cy.get('.sidebar-right').should('be.visible');
    cy.get('.sidebar-right .section-title').should('contain', 'プロパティ');
    
    // Take final screenshot
    cy.screenshot('mockup-ui-complete');
  });
});