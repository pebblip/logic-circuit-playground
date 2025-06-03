describe('ピン表示の確認', () => {
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

  it('ゲートにピンが表示される', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // デバッグ情報を出力
    cy.window().then((win) => {
      console.log('Window object:', win);
    });
    
    // SVG内のcircle要素を確認（ピンは小さい円で表示される）
    cy.get('svg circle').then($circles => {
      cy.log(`Found ${$circles.length} circles`);
      
      // 各circleの情報を出力
      const circleInfo = [];
      $circles.each((index, circle) => {
        const r = circle.getAttribute('r');
        const cx = circle.getAttribute('cx');
        const cy = circle.getAttribute('cy');
        const fill = circle.getAttribute('fill');
        circleInfo.push(`Circle ${index}: r=${r}, cx=${cx}, cy=${cy}, fill=${fill}`);
      });
      console.log('Circle info:', circleInfo);
    });
    
    cy.screenshot('pin-check-1');
    
    // ANDゲートも配置して確認
    cy.contains('button', 'AND').click();
    cy.wait(1000);
    
    cy.get('svg circle').then($circles => {
      cy.log(`After AND gate: Found ${$circles.length} circles`);
    });
    
    cy.screenshot('pin-check-2');
    
    // ピンが存在することを確認（半径4のcircleがピン）
    cy.get('svg circle[r="4"]').should('exist');
    cy.get('svg circle[r="4"]').should('have.length.at.least', 1);
  });
});