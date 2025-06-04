describe('カスタムゲート問題の調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // アプリの初期化を待つ
  });

  it('1. カスタムゲートダイアログが開けるかテスト', () => {
    // カスタムゲートセクションを探す
    cy.get('body').then($body => {
      const hasCustomGateButton = $body.find('[data-testid="custom-gate-button"], .custom-gate-button, button:contains("カスタム")').length > 0;
      
      if (hasCustomGateButton) {
        cy.log('カスタムゲートボタンが見つかりました');
        
        // カスタムゲートボタンをクリック
        cy.get('[data-testid="custom-gate-button"], .custom-gate-button, button:contains("カスタム")').first().click();
        
        // ダイアログが開くか確認
        cy.get('.dialog-overlay, [data-testid="custom-gate-dialog"]', { timeout: 5000 }).should('exist');
        
        cy.log('カスタムゲートダイアログが開きました');
        
        // 2. プレビューエリアの確認
        cy.get('[data-testid="gate-preview"], .gate-preview, svg').should('exist').then(() => {
          cy.log('プレビューエリアが見つかりました');
        });
        
        // SVGプレビューの詳細確認
        cy.get('svg').within(() => {
          // ゲート本体の確認
          cy.get('rect').should('exist');
          cy.log('ゲート本体が描画されています');
          
          // ピンの確認
          cy.get('circle').should('exist');
          cy.log('ピンが描画されています');
        });
        
      } else {
        cy.log('カスタムゲートボタンが見つかりません');
        
        // ツールパレット全体の構造をログ出力
        cy.get('body').then(() => {
          cy.log('DOM構造をデバッグします');
        });
        
        // 利用可能なボタンを確認
        cy.get('button').each(($btn) => {
          cy.log(`ボタン発見: ${$btn.text()}`);
        });
      }
    });
  });

  it('2. 複数出力カスタムゲート作成テスト', () => {
    // カスタムゲートダイアログを開く
    cy.get('body').then($body => {
      const hasCustomGateButton = $body.find('[data-testid="custom-gate-button"], .custom-gate-button, button:contains("カスタム")').length > 0;
      
      if (hasCustomGateButton) {
        cy.get('[data-testid="custom-gate-button"], .custom-gate-button, button:contains("カスタム")').first().click();
        
        // ダイアログが開くまで待つ
        cy.get('.dialog-overlay', { timeout: 5000 }).should('exist');
        
        // 複数出力を追加
        cy.get('button:contains("出力を追加"), [data-testid="add-output"]').click();
        cy.get('button:contains("出力を追加"), [data-testid="add-output"]').click();
        
        // プレビューでピン位置を確認
        cy.get('svg').within(() => {
          // 出力ピンの数を確認
          cy.get('circle').then($circles => {
            const outputCircles = Array.from($circles).filter(circle => {
              const cx = parseFloat(circle.getAttribute('cx'));
              return cx > 0; // 右側（出力側）のピン
            });
            cy.log(`出力ピン数: ${outputCircles.length}`);
            
            // 出力ピンの位置を確認
            outputCircles.forEach((circle, index) => {
              const cy_val = parseFloat(circle.getAttribute('cy'));
              cy.log(`出力ピン${index}のY座標: ${cy_val}`);
            });
          });
        });
        
        // ゲート名を設定
        cy.get('input[placeholder*="内部名"], input[name="gateName"]').clear().type('TestMultiOut');
        
        // 保存
        cy.get('button:contains("作成"), button:contains("保存")').click();
        
      } else {
        cy.log('カスタムゲートボタンが見つかりません - テストをスキップ');
      }
    });
  });

  it('3. 作成したカスタムゲートの配置と接続線チェック', () => {
    // 前のテストで作成したカスタムゲートがツールパレットにあるかチェック
    cy.get('body').then($body => {
      const hasTestMultiOut = $body.find(':contains("TestMultiOut")').length > 0;
      
      if (hasTestMultiOut) {
        cy.log('作成したカスタムゲートが見つかりました');
        
        // カスタムゲートを配置
        cy.get(':contains("TestMultiOut")').first().click();
        cy.get('svg').click(400, 300); // キャンバスに配置
        
        // 配置されたゲートの出力ピン位置を確認
        cy.get('[data-gate-type="CUSTOM"]').within(() => {
          cy.get('circle').then($circles => {
            const outputCircles = Array.from($circles).filter(circle => {
              const cx = parseFloat(circle.getAttribute('cx'));
              return cx > 0; // 右側（出力側）のピン
            });
            
            outputCircles.forEach((circle, index) => {
              const cx = parseFloat(circle.getAttribute('cx'));
              const cy_val = parseFloat(circle.getAttribute('cy'));
              cy.log(`配置後の出力ピン${index}: cx=${cx}, cy=${cy_val}`);
            });
          });
        });
        
      } else {
        cy.log('作成したカスタムゲートが見つかりません');
      }
    });
  });
});