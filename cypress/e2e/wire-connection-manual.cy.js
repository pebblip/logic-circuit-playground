describe('ワイヤー接続の手動確認', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
  });

  it('手動でゲートを配置して接続を確認', () => {
    cy.visit('/');
    cy.wait(1000);
    
    // 現在の画面をスクリーンショット
    cy.screenshot('01-initial-screen');
    
    // INPUTゲートを探してクリック（右側のサイドバーで）
    cy.contains('button', 'INPUT').click();
    cy.wait(500);
    
    // 画面をスクリーンショット（INPUT追加後）
    cy.screenshot('02-after-input-added');
    
    // OUTPUTゲートを探してクリック
    cy.contains('button', 'OUTPUT').click();
    cy.wait(500);
    
    // 画面をスクリーンショット（OUTPUT追加後）
    cy.screenshot('03-after-output-added');
    
    // ゲートが追加されたか確認
    cy.get('svg').within(() => {
      // ゲートのグループ要素を探す
      cy.get('g').then($groups => {
        cy.log(`Found ${$groups.length} groups in SVG`);
        
        // ゲートらしき要素を探す
        let gateCount = 0;
        $groups.each((index, group) => {
          const $group = Cypress.$(group);
          // rectやcircleを含むグループをゲートとみなす
          if ($group.find('rect').length > 0 || $group.find('circle').length > 2) {
            gateCount++;
          }
        });
        
        cy.log(`Found ${gateCount} gates`);
        expect(gateCount).to.be.at.least(2);
      });
    });
    
    // 接続を試みる
    cy.get('svg').then($svg => {
      // INPUTゲートらしきものを探す（通常は左側に配置）
      const groups = $svg.find('g');
      let inputGate = null;
      let outputGate = null;
      
      groups.each((index, group) => {
        const transform = group.getAttribute('transform');
        if (transform && transform.includes('translate')) {
          const match = transform.match(/translate\((\d+),\s*(\d+)\)/);
          if (match) {
            const x = parseInt(match[1]);
            // x座標が小さい方をINPUT、大きい方をOUTPUTと仮定
            if (!inputGate || x < parseInt(inputGate.getAttribute('transform').match(/translate\((\d+)/)[1])) {
              outputGate = inputGate;
              inputGate = group;
            } else if (!outputGate) {
              outputGate = group;
            }
          }
        }
      });
      
      if (inputGate && outputGate) {
        // INPUTゲートの出力ピン（右側）を探す
        const inputPins = Cypress.$(inputGate).find('circle');
        let outputPin = null;
        
        inputPins.each((index, pin) => {
          const cx = parseFloat(pin.getAttribute('cx') || '0');
          const r = parseFloat(pin.getAttribute('r') || '0');
          if (cx > 20 && r > 10) { // 右側の大きな円
            outputPin = pin;
          }
        });
        
        // OUTPUTゲートの入力ピン（左側）を探す
        const outputPins = Cypress.$(outputGate).find('circle');
        let inputPin = null;
        
        outputPins.each((index, pin) => {
          const cx = parseFloat(pin.getAttribute('cx') || '0');
          const r = parseFloat(pin.getAttribute('r') || '0');
          if (cx < -20 && r > 10) { // 左側の大きな円
            inputPin = pin;
          }
        });
        
        if (outputPin && inputPin) {
          // ドラッグ操作
          cy.wrap(outputPin).trigger('mousedown', { button: 0 });
          cy.wait(100);
          cy.screenshot('04-dragging');
          
          // 入力ピンに移動
          cy.wrap(inputPin).trigger('mouseenter');
          cy.wait(100);
          
          // マウスアップ
          cy.wrap(inputPin).trigger('mouseup', { button: 0 });
          cy.wait(500);
          
          // 最終スクリーンショット
          cy.screenshot('05-after-connection-attempt');
        }
      }
    });
  });
});