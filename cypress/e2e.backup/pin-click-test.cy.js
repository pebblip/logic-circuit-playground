describe('ピンクリックのテスト', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
  });

  it('ピンが存在し、クリック可能か確認', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // INPUTゲートを追加
    cy.contains('button', 'INPUT').click();
    cy.wait(500);
    
    // SVG内の要素を調査
    cy.get('svg').within(() => {
      // 全てのcircle要素を取得
      cy.get('circle').then($circles => {
        cy.log(`Total circles: ${$circles.length}`);
        
        // 各circleの属性をログ出力
        $circles.each((index, circle) => {
          const r = circle.getAttribute('r');
          const cx = circle.getAttribute('cx');
          const fill = circle.getAttribute('fill');
          const style = circle.getAttribute('style');
          
          cy.log(`Circle ${index}: r=${r}, cx=${cx}, fill=${fill}, style=${style}`);
          
          // r="12"のピンを探す
          if (r === '12') {
            // このピンにイベントハンドラーがあるか確認
            const hasMouseDown = circle.onmousedown !== null;
            const hasMouseUp = circle.onmouseup !== null;
            const hasMouseEnter = circle.onmouseenter !== null;
            
            cy.log(`Pin found! Events: mousedown=${hasMouseDown}, mouseup=${hasMouseUp}, mouseenter=${hasMouseEnter}`);
            
            // クリックしてみる
            cy.wrap(circle).click();
            cy.wait(100);
            
            // trigger('mousedown')も試す
            cy.wrap(circle).trigger('mousedown', { button: 0 });
            cy.wait(100);
          }
        });
      });
      
      // g要素（ゲートグループ）の構造も確認
      cy.get('g').then($groups => {
        cy.log(`Total g elements: ${$groups.length}`);
        
        // data-testidを持つグループを探す
        $groups.each((index, group) => {
          const testId = group.getAttribute('data-testid');
          if (testId && testId.includes('gate-')) {
            cy.log(`Gate group found: ${testId}`);
            
            // このグループ内のcircle要素を確認
            const circles = group.querySelectorAll('circle');
            cy.log(`  - Contains ${circles.length} circles`);
          }
        });
      });
    });
    
    cy.screenshot('pin-investigation');
  });
});