describe('基本的なワイヤー接続テスト', () => {
  it('ゲートを配置してワイヤーで接続できる', () => {
    cy.visit('/');
    
    // モード選択をスキップ（既に選択済みの場合）
    cy.wait(1000);
    
    // INPUTゲートを追加（ボタンを探す）
    cy.get('button').then($buttons => {
      const inputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('INPUT') || 
        btn.textContent?.includes('入力')
      );
      if (inputBtn) {
        cy.wrap(inputBtn).click();
      }
    });
    
    cy.wait(500);
    
    // OUTPUTゲートを追加
    cy.get('button').then($buttons => {
      const outputBtn = Array.from($buttons).find(btn => 
        btn.textContent?.includes('OUTPUT') || 
        btn.textContent?.includes('出力')
      );
      if (outputBtn) {
        cy.wrap(outputBtn).click();
      }
    });
    
    cy.wait(1000);
    
    // ゲートが2つ配置されたことを確認
    cy.get('svg g').should('have.length.at.least', 2);
    
    // スクリーンショットを撮る（デバッグ用）
    cy.screenshot('gates-placed');
    
    // ピンを見つけてドラッグ
    cy.get('svg').then($svg => {
      // 全てのcircle要素を取得
      const circles = $svg.find('circle').toArray();
      
      // r=20のcircle（ヒットエリア）を探す
      const hitAreas = circles.filter(circle => {
        const r = circle.getAttribute('r');
        return r === '20';
      });
      
      cy.log(`Found ${hitAreas.length} hit areas`);
      
      if (hitAreas.length >= 2) {
        // 最初のピンから2番目のピンへドラッグ
        const firstPin = hitAreas[0];
        const secondPin = hitAreas[1];
        
        // ドラッグ操作
        cy.wrap(firstPin)
          .trigger('mousedown', { button: 0 });
          
        cy.wait(100);
        
        cy.wrap(secondPin)
          .trigger('mousemove')
          .trigger('mouseup');
          
        cy.wait(500);
        
        // 接続線が作成されたか確認
        cy.get('svg path').should('exist');
        cy.screenshot('wire-connected');
      }
    });
  });
});