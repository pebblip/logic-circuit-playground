describe('ピンレンダリングテスト', () => {
  it('テストページでピン情報を確認', () => {
    cy.viewport(1280, 720);
    cy.visit('/?test=pins');
    cy.wait(500);
    
    // ボタンをクリックしてゲートを追加
    cy.contains('button', 'Add INPUT Gate').click();
    cy.wait(500);
    
    // コンソールログを確認
    cy.window().then((win) => {
      // gate dataが表示されているか確認
      cy.get('pre').should('exist');
      cy.get('pre').invoke('text').then((text) => {
        cy.log('Gate data:', text);
        
        // JSONをパース
        try {
          const gates = JSON.parse(text);
          expect(gates).to.be.an('array');
          expect(gates.length).to.equal(1);
          
          const gate = gates[0];
          cy.log('First gate:', JSON.stringify(gate, null, 2));
          
          // ピン情報の確認
          if (gate.outputs) {
            cy.log(`Gate has ${gate.outputs.length} output pins`);
            expect(gate.outputs).to.be.an('array');
            expect(gate.outputs.length).to.be.greaterThan(0);
          } else {
            cy.log('WARNING: No outputs found in gate data!');
          }
        } catch (e) {
          cy.log('Failed to parse JSON:', e);
        }
      });
    });
    
    // SVG内のcircle要素を確認
    cy.get('svg circle').then($circles => {
      cy.log(`Total circles in SVG: ${$circles.length}`);
      
      // 赤いピン（r=6）があるか確認
      const redPins = Array.from($circles).filter(circle => 
        circle.getAttribute('r') === '6' && 
        circle.getAttribute('fill') === 'red'
      );
      
      cy.log(`Red pins found: ${redPins.length}`);
      
      if (redPins.length === 0) {
        cy.log('No red pins found - pin rendering issue confirmed!');
      }
    });
    
    cy.screenshot('test-pin-rendering');
  });
});