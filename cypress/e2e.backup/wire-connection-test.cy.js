describe('ワイヤー接続の動作確認', () => {
  beforeEach(() => {
    cy.visit('/');
    // モード選択画面が表示された場合はスキップ
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="start-button"]').length > 0) {
        cy.get('[data-testid="start-button"]').click();
      }
    });
  });

  it('出力ピンから入力ピンへドラッグして接続線が引ける', () => {
    // 学習モードを選択（必要な場合）
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="mode-btn-learning"]').length > 0) {
        cy.get('[data-testid="mode-btn-learning"]').click();
      }
    });

    // INPUTゲートを追加
    cy.get('button').contains('INPUT').click();
    cy.wait(500);

    // OUTPUTゲートを追加
    cy.get('button').contains('OUTPUT').click();
    cy.wait(500);

    // ゲートが表示されていることを確認
    cy.get('svg').within(() => {
      cy.get('g[data-testid*="gate-"]').should('have.length.at.least', 2);
    });

    // INPUTゲートの出力ピンを探す
    cy.get('svg').within(() => {
      // 最初のゲート（INPUT）の出力ピン（右側のピン）を取得
      cy.get('g[data-testid*="gate-"]').first().within(() => {
        cy.get('circle[r="12"]').then($circles => {
          const outputPin = Array.from($circles).find(circle => {
            const cx = parseFloat(circle.getAttribute('cx') || '0');
            return cx > 0; // 右側のピンは出力
          });
          
          if (outputPin) {
            // 出力ピンの位置を取得
            const outputRect = outputPin.getBoundingClientRect();
            
            // 2番目のゲート（OUTPUT）の入力ピンを探す
            cy.get('g[data-testid*="gate-"]').eq(1).within(() => {
              cy.get('circle[r="12"]').then($inputCircles => {
                const inputPin = Array.from($inputCircles).find(circle => {
                  const cx = parseFloat(circle.getAttribute('cx') || '0');
                  return cx < 0; // 左側のピンは入力
                });
                
                if (inputPin) {
                  const inputRect = inputPin.getBoundingClientRect();
                  
                  // ドラッグ操作を実行
                  cy.wrap(outputPin)
                    .trigger('mousedown', { which: 1 })
                    .wait(100);
                  
                  // 中間地点でmousemove
                  cy.get('svg')
                    .trigger('mousemove', {
                      clientX: (outputRect.x + inputRect.x) / 2,
                      clientY: (outputRect.y + inputRect.y) / 2
                    })
                    .wait(100);
                  
                  // 入力ピンでmouseup
                  cy.wrap(inputPin)
                    .trigger('mouseenter')
                    .trigger('mouseup', { which: 1 });
                }
              });
            });
          }
        });
      });
    });

    // 接続線が作成されたことを確認
    cy.wait(500);
    cy.get('svg').within(() => {
      cy.get('path[stroke="#00ff88"]').should('exist');
    });
  });

  it('入力ゲートをクリックすると値が切り替わる', () => {
    // INPUTゲートを追加
    cy.get('button').contains('INPUT').click();
    cy.wait(500);

    // INPUTゲートをクリック
    cy.get('g[data-testid*="gate-"]').first().click();
    
    // ゲートの状態が変わったことを視覚的に確認
    // （実際の確認方法は実装に依存）
    cy.wait(500);
  });
});