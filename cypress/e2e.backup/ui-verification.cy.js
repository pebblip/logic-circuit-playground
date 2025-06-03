describe('UI確認 - ピン表示', () => {
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

  it('各種ゲートのピンが正しく表示される', () => {
    // 1. INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    cy.screenshot('01-input-gate-with-pin');
    
    // 2. OUTPUTゲートを配置
    cy.contains('button', 'OUTPUT').click();
    cy.wait(1000);
    cy.screenshot('02-output-gate-with-pin');
    
    // 3. ANDゲートを配置
    cy.contains('button', 'AND').click();
    cy.wait(1000);
    cy.screenshot('03-and-gate-with-pins');
    
    // 4. ピンの詳細を確認
    cy.get('svg').within(() => {
      // ピン（r="4"の円）の数を確認
      cy.get('circle[r="4"]').then($pins => {
        cy.log(`Total pins visible: ${$pins.length}`);
        expect($pins.length).to.be.greaterThan(0);
        
        // 各ピンの情報をログ
        $pins.each((index, pin) => {
          const fill = pin.getAttribute('fill');
          const stroke = pin.getAttribute('stroke');
          cy.log(`Pin ${index}: fill=${fill}, stroke=${stroke}`);
        });
      });
    });
    
    // 5. 全体のレイアウトを確認
    cy.screenshot('04-all-gates-with-pins');
    
    // 6. ズームして詳細を確認
    cy.get('svg g[transform*="translate"]').first().within(() => {
      cy.screenshot('05-close-up-gate-pin', { capture: 'viewport' });
    });
  });

  it('ピンのホバー効果とクリック可能領域', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    // ピンの上にマウスを移動
    cy.get('svg').within(() => {
      cy.get('circle[r="12"]').first().trigger('mouseover');
      cy.wait(500);
      cy.screenshot('06-pin-hover-effect');
    });
  });

  it('ダークテーマでのピン表示', () => {
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    cy.screenshot('07-dark-theme-pins');
  });

  it('モバイルビューでのピン表示', () => {
    cy.viewport('iphone-x');
    cy.wait(500);
    
    // ツールパレットを開く
    cy.get('button[aria-label="ツール"]').click();
    cy.wait(500);
    
    // INPUTゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.wait(1000);
    
    cy.screenshot('08-mobile-pins');
  });
});