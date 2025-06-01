describe('ワイヤー接続のデバッグテスト', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
  });

  it('コンソールログを確認しながら接続を試みる', () => {
    // コンソールログをキャプチャ
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('consoleLog');
      }
    });
    
    cy.wait(1000);
    
    // INPUTゲートを追加
    cy.contains('button', 'INPUT').click();
    cy.wait(500);
    
    // OUTPUTゲートを追加
    cy.contains('button', 'OUTPUT').click();
    cy.wait(500);
    
    // ゲートを探す
    cy.get('svg').within(() => {
      // 全てのcircle要素を探す
      cy.get('circle').then($circles => {
        cy.log(`Total circles found: ${$circles.length}`);
        
        // r=12のピンを探す
        let pins12 = 0;
        let pins4 = 0;
        $circles.each((index, circle) => {
          const r = parseFloat(circle.getAttribute('r') || '0');
          if (r === 12) pins12++;
          if (r === 4) pins4++;
        });
        
        cy.log(`Pins with r=12: ${pins12}`);
        cy.log(`Pins with r=4: ${pins4}`);
        
        // 接続を試みる
        // 最初の大きなピン（r=12）を探す
        let outputPin = null;
        let inputPin = null;
        
        $circles.each((index, circle) => {
          const r = parseFloat(circle.getAttribute('r') || '0');
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          
          if (r === 12) {
            if (cx > 0 && !outputPin) {
              outputPin = circle;
              cy.log(`Found output pin at cx=${cx}`);
            } else if (cx < 0 && !inputPin) {
              inputPin = circle;
              cy.log(`Found input pin at cx=${cx}`);
            }
          }
        });
        
        if (outputPin && inputPin) {
          cy.log('Both pins found, attempting connection');
          
          // mousedownイベント
          cy.wrap(outputPin).trigger('mousedown', { button: 0 });
          cy.wait(100);
          
          // コンソールログを確認
          cy.get('@consoleLog').should('have.been.called');
          
          // mousemoveイベント
          cy.get('svg').trigger('mousemove', { clientX: 400, clientY: 300 });
          cy.wait(100);
          
          // mouseenterイベント
          cy.wrap(inputPin).trigger('mouseenter');
          cy.wait(100);
          
          // コンソールログを確認（mouseenterハンドラーが呼ばれているか）
          cy.get('@consoleLog').should('have.been.calledWithMatch', '[DEBUG]');
          
          // mouseupイベント
          cy.wrap(inputPin).trigger('mouseup', { button: 0 });
          cy.wait(500);
          
          // 接続線が作成されたか確認
          cy.get('svg').within(() => {
            cy.get('path').should('exist');
          });
        } else {
          cy.log('ERROR: Could not find both pins!');
          if (!outputPin) cy.log('Output pin (r=12, cx>0) not found');
          if (!inputPin) cy.log('Input pin (r=12, cx<0) not found');
        }
      });
    });
    
    // 最終スクリーンショット
    cy.screenshot('debug-final-state');
  });
});