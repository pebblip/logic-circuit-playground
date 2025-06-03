describe('ANDゲート配置テスト', () => {
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

  it('ANDゲートを確実に配置する', () => {
    // 初期状態のスクリーンショット
    cy.screenshot('00-initial-state');
    
    // デモ回路集パネルが表示されている場合は隠す
    cy.get('button:contains("AND")').then($button => {
      if (!$button.is(':visible')) {
        cy.log('ANDボタンが見えない - デモ回路集パネルを探す');
        
        // パネルの△ボタンをクリックして閉じる
        cy.get('button[aria-label="Hide panel"]').click({ force: true });
        cy.wait(500);
      }
    });
    
    // ANDボタンが表示されていることを確認
    cy.contains('button', 'AND').should('be.visible');
    cy.screenshot('01-and-button-visible');
    
    // ANDゲートをクリック
    cy.contains('button', 'AND').click();
    cy.wait(2000); // 長めに待つ
    
    // 配置後のスクリーンショット
    cy.screenshot('02-after-and-click');
    
    // SVG内の要素を確認
    cy.get('svg').within(() => {
      // ANDゲートが存在するか確認
      cy.get('text').contains('AND').should('exist');
      
      // 矩形（ANDゲート本体）を確認
      cy.get('rect[rx="8"]').then($rects => {
        cy.log(`Rectangles with rounded corners: ${$rects.length}`);
        
        // ANDゲートには入力ピン2つ、出力ピン1つがあるはず
        if ($rects.length > 0) {
          // ピンの確認
          cy.get('circle[r="4"]').then($pins => {
            cy.log(`Total pins: ${$pins.length}`);
            // 最低3つのピン（INPUT出力1, OUTPUT入力1, AND入力2+出力1=3）
            expect($pins.length).to.be.at.least(3);
          });
        }
      });
    });
    
    // 最終的なスクリーンショット
    cy.screenshot('03-final-with-and-gate');
  });
});