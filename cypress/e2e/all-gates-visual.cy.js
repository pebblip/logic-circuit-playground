describe('All Gates Visual Test', () => {
  it('should display all gate types correctly', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // Add different gate types by key combinations
    const gates = [
      { pos: [200, 200], key: { shiftKey: true }, label: 'INPUT' },
      { pos: [300, 200], key: { altKey: true }, label: 'OUTPUT' },
      { pos: [200, 300], key: {}, label: 'AND' },
      { pos: [300, 300], key: { shiftKey: true, altKey: true }, label: 'OR' },
      { pos: [400, 200], key: { ctrlKey: true }, label: 'NOT' },
    ];
    
    gates.forEach(gate => {
      cy.get('svg.w-full.h-full').first()
        .dblclick(gate.pos[0], gate.pos[1], { ...gate.key, force: true });
      cy.wait(200);
    });
    
    cy.screenshot('all-gates-visual');
    
    // Check that gates are displayed
    cy.get('g[transform*="translate"]').should('have.length.at.least', 5);
  });
});