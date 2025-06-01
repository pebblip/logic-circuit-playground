describe('ワイヤー接続の簡単な確認', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
  });

  it('実際に接続線が引けるか確認', () => {
    cy.visit('/');
    
    // アプリケーションの初期化を待つ
    cy.wait(1000);
    
    // INPUTボタンをクリック（右側のサイドバー内）
    cy.get('[data-testid="gate-button-INPUT"]').should('be.visible').click();
    cy.wait(1000);
    
    // OUTPUTボタンをクリック
    cy.get('[data-testid="gate-button-OUTPUT"]').should('be.visible').click();
    cy.wait(1000);
    
    // ゲートが追加されたことを確認
    cy.get('svg').within(() => {
      cy.get('g[data-testid*="gate-"]').should('have.length', 2);
    });
    
    // スクリーンショットを撮る（ゲートが配置された状態）
    cy.screenshot('gates-added');
    
    // 接続操作のシミュレーション
    // まず最初のゲート（INPUT）を探す
    cy.get('g[data-testid*="gate-"]').first().then($gate1 => {
      // INPUTゲートの出力ピン（右側の円）を探す
      cy.wrap($gate1).find('circle').then($circles => {
        let outputPin = null;
        $circles.each((i, circle) => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const r = parseFloat(circle.getAttribute('r') || '0');
          // 右側（cx > 0）かつ大きな円（r=12）が出力ピンのクリック領域
          if (cx > 0 && r === 12) {
            outputPin = circle;
          }
        });
        
        if (outputPin) {
          // 2番目のゲート（OUTPUT）を探す
          cy.get('g[data-testid*="gate-"]').eq(1).then($gate2 => {
            // OUTPUTゲートの入力ピン（左側の円）を探す
            cy.wrap($gate2).find('circle').then($inputCircles => {
              let inputPin = null;
              $inputCircles.each((i, circle) => {
                const cx = parseFloat(circle.getAttribute('cx') || '0');
                const r = parseFloat(circle.getAttribute('r') || '0');
                // 左側（cx < 0）かつ大きな円（r=12）が入力ピンのクリック領域
                if (cx < 0 && r === 12) {
                  inputPin = circle;
                }
              });
              
              if (inputPin) {
                // ドラッグ操作を実行
                cy.wrap(outputPin).trigger('mousedown', { button: 0 });
                cy.wait(100);
                
                // マウスを移動
                cy.get('svg').trigger('mousemove', { clientX: 400, clientY: 300 });
                cy.wait(100);
                
                // 入力ピンにマウスを入れる
                cy.wrap(inputPin).trigger('mouseenter');
                cy.wait(100);
                
                // マウスアップ
                cy.wrap(inputPin).trigger('mouseup', { button: 0 });
                cy.wait(500);
                
                // 接続線が作成されたか確認（pathまたはlineタグ）
                cy.get('svg').then($svg => {
                  const paths = $svg.find('path').length;
                  const lines = $svg.find('line').length;
                  cy.log(`Paths: ${paths}, Lines: ${lines}`);
                  
                  // スクリーンショットを撮る（接続後）
                  cy.screenshot('after-connection-attempt');
                  
                  // 接続線が存在することを確認
                  expect(paths + lines).to.be.greaterThan(0);
                });
              }
            });
          });
        }
      });
    });
  });
});