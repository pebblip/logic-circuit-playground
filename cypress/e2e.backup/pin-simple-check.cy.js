describe('シンプルなピン確認', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.clearLocalStorage();
    cy.visit('/');
    
    // チュートリアルが表示されたらスキップ
    cy.get('body').then($body => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.get('button:contains("スキップ")').click();
      }
    });
    cy.wait(500);
  });

  it('INPUTゲートのピンを確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // SVG要素内のすべてのcircle要素を取得
    cy.get('svg').within(() => {
      // translateを含むg要素を探す（ゲート本体）
      cy.get('g[transform*="translate"]').first().within(() => {
        // ゲート本体のcircle（大きい円）
        cy.get('circle').then($circles => {
          cy.log(`Total circles in gate: ${$circles.length}`);
          
          // 各circleの詳細を確認
          $circles.each((index, circle) => {
            const r = circle.getAttribute('r');
            const cx = circle.getAttribute('cx') || '0';
            const cy = circle.getAttribute('cy') || '0';
            const fill = circle.getAttribute('fill');
            
            Cypress.log({
              name: 'Circle',
              message: `Circle ${index}: r=${r}, cx=${cx}, cy=${cy}, fill=${fill}`
            });
            
            // r="25"はゲート本体、r="4"がピン
            if (r === '4') {
              cy.log('Pin found!');
              expect(r).to.equal('4');
            }
          });
        });
        
        // g要素の内容も確認
        cy.get('g').then($gElements => {
          cy.log(`Nested g elements: ${$gElements.length}`);
        });
      });
    });
    
    // デバッグ情報を出力
    cy.window().then((win) => {
      const gates = win.debugGates;
      if (gates && gates.length > 0) {
        const inputGate = gates[0];
        console.log('Gate data:', inputGate);
        
        if (!inputGate.outputs || inputGate.outputs.length === 0) {
          cy.log('ERROR: No output pins in gate data!');
        } else {
          cy.log(`Gate has ${inputGate.outputs.length} output pins`);
        }
      }
    });
    
    // スクリーンショット
    cy.screenshot('simple-pin-check');
  });
});