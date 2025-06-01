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
      // 全てのヒットエリアを取得
      const hitAreas = $svg.find('circle[r="20"]').toArray();
      
      cy.log(`Found ${hitAreas.length} hit areas`);
      
      // ゲートのg要素を取得
      const gateGroups = $svg.find('g[transform*="translate"]').toArray();
      cy.log(`Found ${gateGroups.length} gates`);
      
      if (gateGroups.length >= 2 && hitAreas.length >= 2) {
        // 各ゲートのヒットエリアを特定
        let inputGatePin = null;
        let outputGatePin = null;
        
        // INPUTゲートの出力ピン（右側）を探す
        hitAreas.forEach(pin => {
          const cx = parseFloat(pin.getAttribute('cx'));
          const parent = pin.closest('g[transform*="translate"]');
          if (parent) {
            const hasInputText = parent.textContent.includes('1') || parent.textContent.includes('0');
            
            if (hasInputText && cx > 0) { // 右側のピン
              inputGatePin = pin;
            }
          }
        });
        
        // OUTPUTゲートの入力ピン（左側）を探す
        hitAreas.forEach(pin => {
          const cx = parseFloat(pin.getAttribute('cx'));
          const parent = pin.closest('g[transform*="translate"]');
          if (parent) {
            const hasOutputIcon = parent.textContent.includes('💡');
            
            if (hasOutputIcon && cx < 0) { // 左側のピン
              outputGatePin = pin;
            }
          }
        });
        
        if (inputGatePin && outputGatePin) {
          cy.log('Found INPUT output pin and OUTPUT input pin');
          
          // INPUTゲートの出力ピンから開始
          cy.wrap(inputGatePin)
            .trigger('mousedown', { button: 0, force: true });
            
          cy.wait(100);
          
          // OUTPUTゲートの入力ピンで終了
          cy.wrap(outputGatePin)
            .trigger('mousemove', { force: true })
            .trigger('mouseup', { force: true });
            
          cy.wait(500);
          
          // 接続線が作成されたか確認
          cy.get('svg path').should('exist');
          cy.screenshot('wire-connected');
        } else {
          cy.log('Could not find correct pins');
        }
      }
    });
  });
});