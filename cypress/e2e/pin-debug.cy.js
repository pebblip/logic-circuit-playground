describe('ピン描画デバッグ', () => {
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

  it('ゲートのピン情報を詳細に確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // SVG要素の階層を確認
    cy.get('svg').then($svg => {
      console.log('SVG element:', $svg[0]);
      
      // 全てのg要素を確認
      const allG = $svg.find('g');
      console.log(`Total g elements: ${allG.length}`);
      
      // gate_で始まるIDを持つg要素を探す
      allG.each((index, g) => {
        const transform = g.getAttribute('transform');
        if (transform && transform.includes('translate')) {
          console.log(`G[${index}] transform:`, transform);
          
          // 子要素を確認
          const children = g.children;
          console.log(`  Children count: ${children.length}`);
          
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            console.log(`  Child[${i}]:`, {
              tagName: child.tagName,
              key: child.getAttribute('key'),
              cx: child.getAttribute('cx'),
              cy: child.getAttribute('cy'),
              r: child.getAttribute('r'),
              fill: child.getAttribute('fill')
            });
          }
        }
      });
    });
    
    // circle要素を詳細に確認
    cy.get('svg circle').then($circles => {
      console.log(`Total circles: ${$circles.length}`);
      
      $circles.each((index, circle) => {
        const r = circle.getAttribute('r');
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        const fill = circle.getAttribute('fill');
        const stroke = circle.getAttribute('stroke');
        
        console.log(`Circle[${index}]:`, {
          r, cx, cy, fill, stroke,
          parent: circle.parentElement?.tagName,
          parentKey: circle.parentElement?.getAttribute('key')
        });
      });
    });
    
    // ViewModelの状態も確認
    cy.window().then(win => {
      console.log('Window:', win);
      // React DevToolsがある場合は、コンポーネント状態を確認
      if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('React DevTools available');
      }
    });
    
    cy.screenshot('pin-debug');
  });
});