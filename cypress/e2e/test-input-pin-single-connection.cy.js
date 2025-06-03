describe('Input Pin Single Connection Validation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(500);
  });

  it('should prevent multiple wires connecting to the same input pin', () => {
    // Add two input gates and one AND gate
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 100);
    
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 200);
    
    cy.get('[data-testid="gate-AND"]').click();
    cy.get('svg').click(300, 150);
    
    // Connect first input to AND gate's first input pin
    cy.get('svg').within(() => {
      // Click on first INPUT gate's output pin
      cy.get('circle[data-testid*="output-pin"]').first().click();
      // Click on AND gate's first input pin  
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Verify first wire was created
    cy.get('path[stroke="#00ff88"]').should('have.length', 1);
    
    // Try to connect second input to the same AND gate input pin
    cy.get('svg').within(() => {
      // Click on second INPUT gate's output pin
      cy.get('circle[data-testid*="output-pin"]').eq(1).click();
      // Try to click on AND gate's SAME first input pin again
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Verify only one wire exists (second connection should be rejected)
    cy.get('path[stroke="#00ff88"]').should('have.length', 1);
    
    // Log success
    cy.log('✅ Input pin validation works correctly - prevented duplicate connection');
  });

  it('should allow connecting to different input pins on the same gate', () => {
    // Add two input gates and one AND gate
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 100);
    
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 200);
    
    cy.get('[data-testid="gate-AND"]').click();
    cy.get('svg').click(300, 150);
    
    // Connect first input to AND gate's first input pin
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').first().click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Connect second input to AND gate's second input pin
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').eq(1).click();
      cy.get('circle[data-testid*="input-pin"]').eq(1).click();
    });
    
    // Verify both wires were created
    cy.get('path[stroke="#00ff88"]').should('have.length', 2);
    
    cy.log('✅ Multiple input pins on same gate can be connected correctly');
  });

  it('should validate input pins on special gates (D-FF)', () => {
    // Add input gate and D-FF
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 100);
    
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 200);
    
    cy.get('[data-testid="gate-D-FF"]').click();
    cy.get('svg').click(300, 150);
    
    // Connect first input to D-FF's D input
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').first().click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Try to connect second input to same D input
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').eq(1).click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Should only have one wire (second connection rejected)
    cy.get('path[stroke="#00ff88"]').should('have.length', 1);
    
    cy.log('✅ D-FF input pin validation works correctly');
  });

  it('should validate input pins on custom gates', () => {
    // Create a simple custom gate first
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 100);
    
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('svg').click(300, 100);
    
    // Connect input to output
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').first().click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Create custom gate from circuit
    cy.get('[data-testid="create-custom-gate"]').click();
    cy.get('input[placeholder="Enter gate name"]').type('TEST_GATE');
    cy.get('button').contains('Create').click();
    
    // Clear circuit and test custom gate
    cy.get('[data-testid="clear-all"]').click();
    
    // Add two inputs and the custom gate
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 100);
    
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg').click(100, 200);
    
    cy.get('[data-testid="gate-TEST_GATE"]').click();
    cy.get('svg').click(300, 150);
    
    // Connect first input to custom gate
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').first().click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Try to connect second input to same pin
    cy.get('svg').within(() => {
      cy.get('circle[data-testid*="output-pin"]').eq(1).click();
      cy.get('circle[data-testid*="input-pin"]').first().click();
    });
    
    // Should only have one wire
    cy.get('path[stroke="#00ff88"]').should('have.length', 1);
    
    cy.log('✅ Custom gate input pin validation works correctly');
  });
});