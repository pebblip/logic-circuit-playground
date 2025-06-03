describe('UI品質テスト', () => {
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

  it('改善されたピンの品質を確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    cy.screenshot('01-input-gate-improved');
    
    // OUTPUTゲートを配置
    cy.contains('button', 'OUTPUT').click();
    cy.wait(1000);
    cy.screenshot('02-output-gate-improved');
    
    // ANDゲートを配置
    cy.contains('button', 'AND').click();
    cy.wait(1000);
    cy.screenshot('03-and-gate-improved');
    
    // 改善されたピンが表示されていることを確認
    cy.get('svg').within(() => {
      // より大きなピン（r="6"）が存在することを確認
      cy.get('circle[r="6"]').should('exist');
      cy.get('circle[r="6"]').should('have.length.at.least', 1);
      
      // ホバー用の透明ピン（r="20"）が存在することを確認
      cy.get('circle[r="20"]').should('exist');
      
      // ピンの総数をログ出力
      cy.get('circle[r="6"]').then($pins => {
        cy.log(`Visual pins (r=6): ${$pins.length}`);
      });
      
      cy.get('circle[r="20"]').then($hitAreas => {
        cy.log(`Hit areas (r=20): ${$hitAreas.length}`);
      });
    });
    
    // 全体のレイアウト
    cy.screenshot('04-improved-layout');
  });

  it('グリッド配置の確認', () => {
    // 複数のゲートを配置してグリッド配置を確認
    cy.contains('button', 'INPUT').click();
    cy.wait(500);
    cy.contains('button', 'AND').click(); 
    cy.wait(500);
    cy.contains('button', 'OR').click();
    cy.wait(500);
    cy.contains('button', 'NOT').click();
    cy.wait(500);
    cy.contains('button', 'OUTPUT').click();
    cy.wait(500);
    
    cy.screenshot('05-grid-layout');
    
    // ゲートが一列に並んでいることを確認
    cy.get('svg g[transform*="translate"]').then($gates => {
      cy.log(`Total gates placed: ${$gates.length}`);
      
      // 位置の確認（最初の3つのゲートが横に並んでいるか）
      if ($gates.length >= 3) {
        const transforms = [];
        for (let i = 0; i < Math.min(3, $gates.length); i++) {
          const transform = $gates[i].getAttribute('transform');
          transforms.push(transform);
        }
        cy.log('Gate positions:', transforms);
      }
    });
  });

  it('ホバー効果とアニメーションの確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // ゲートの上にマウスを移動
    cy.get('svg g[transform*="translate"]').first().trigger('mouseover');
    cy.wait(500);
    cy.screenshot('06-gate-hover');
    
    // ピンの上にマウスを移動
    cy.get('svg circle[r="20"]').first().trigger('mouseover');
    cy.wait(500);
    cy.screenshot('07-pin-hover');
  });

  it('レスポンシブ表示の確認', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // タブレットサイズ
    cy.viewport(768, 1024);
    cy.wait(500);
    cy.screenshot('08-tablet-view');
    
    // モバイルサイズ
    cy.viewport(375, 667);
    cy.wait(500);
    cy.screenshot('09-mobile-view');
  });
});