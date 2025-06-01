describe('Debug: Gate Pin Rendering', () => {
  it('should show pin data in gates', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // INPUTゲートを追加
    cy.get('button').contains('INPUT').click();
    cy.wait(500);
    
    // デバッグ用：SVGの構造を確認
    cy.get('svg').then($svg => {
      const svg = $svg[0];
      console.log('SVG innerHTML:', svg.innerHTML);
      
      // g要素（ゲート）を探す
      const gates = svg.querySelectorAll('g[transform]');
      console.log(`Found ${gates.length} gates`);
      
      gates.forEach((gate, index) => {
        console.log(`Gate ${index}:`, gate.innerHTML);
        
        // pin-groupクラスを持つ要素を探す
        const pinGroups = gate.querySelectorAll('.pin-group');
        console.log(`  Pin groups found: ${pinGroups.length}`);
        
        // circle要素を探す
        const circles = gate.querySelectorAll('circle');
        console.log(`  Circles found: ${circles.length}`);
        circles.forEach((circle, i) => {
          console.log(`    Circle ${i}: r=${circle.getAttribute('r')}, fill=${circle.getAttribute('fill')}`);
        });
        
        // line要素を探す
        const lines = gate.querySelectorAll('line');
        console.log(`  Lines found: ${lines.length}`);
      });
    });
    
    // スクリーンショット
    cy.screenshot('debug-gate-pins');
  });
});