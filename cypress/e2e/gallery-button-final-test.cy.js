describe('ギャラリーパネル ボタンクリック最終修正テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
    cy.wait(500); // ギャラリー表示待機
  });

  describe('修正後の詳細画面表示機能', () => {
    it('ロードボタンをクリックして詳細画面が表示されることを確認', () => {
      // タイミングチャートパネルが表示されていないことを確認
      cy.get('.timing-chart-panel').should('not.exist');
      cy.get('.timing-chart-horizontal-panel').should('not.exist');
      
      // 最初の回路カードのロードボタンをクリック
      cy.get('.circuit-card .load-button').first().click();
      
      // 詳細画面が表示されることを確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
      
      // 詳細画面の要素が表示されることを確認
      cy.get('.circuit-info h2').should('be.visible');
      cy.get('.circuit-description-full').should('be.visible');
      cy.get('.circuit-stats').should('be.visible');
      cy.get('.circuit-actions').should('be.visible');
      
      // アクションボタンが表示されることを確認
      cy.contains('キャンバスで開く').should('be.visible');
      cy.contains('ギャラリーに戻る').should('be.visible');
    });

    it('ボタンの左側、中央、右側すべてでクリックが機能することを確認', () => {
      const clickPositions = [
        { name: '左側', ratio: 0.25 },
        { name: '中央', ratio: 0.5 },
        { name: '右側', ratio: 0.75 }
      ];

      clickPositions.forEach((position, index) => {
        // 詳細画面が表示されている場合は戻る
        cy.get('body').then(($body) => {
          if ($body.find('.selected-circuit').length > 0) {
            cy.contains('ギャラリーに戻る').click();
            cy.wait(300);
          }
        });

        // 各位置でクリックをテスト
        cy.get('.circuit-card .load-button').first().then(($button) => {
          const rect = $button[0].getBoundingClientRect();
          const x = rect.width * position.ratio;
          const y = rect.height * 0.5;
          
          cy.log(`${position.name}クリック位置: x=${x}, y=${y}`);
          
          // クリック実行
          cy.wrap($button).click({ x, y });
          
          // 詳細画面が表示されることを確認
          cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
        });
      });
    });

    it('複数の回路カードのボタンがすべて機能することを確認', () => {
      // すべてのロードボタンをテスト（最初の3つ）
      cy.get('.load-button').then(($buttons) => {
        const testCount = Math.min($buttons.length, 3); // 最大3つまでテスト
        
        for (let i = 0; i < testCount; i++) {
          cy.get('.load-button').eq(i).click();
          cy.get('.selected-circuit', { timeout: 2000 }).should('be.visible');
          cy.contains('ギャラリーに戻る').click();
          cy.wait(200);
        }
      });
    });

    it('詳細画面から「キャンバスで開く」でフリーモードに切り替わることを確認', () => {
      // 詳細画面を表示
      cy.get('.circuit-card .load-button').first().click();
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
      
      // 「キャンバスで開く」ボタンをクリック
      cy.contains('キャンバスで開く').click();
      
      // フリーモードに切り替わることを確認
      cy.contains('フリーモード').should('have.class', 'active');
      
      // キャンバスが表示されることを確認
      cy.get('.main-canvas').should('be.visible');
      cy.get('.sidebar-left').should('be.visible');
    });

    it('戻るボタンでギャラリー一覧に戻ることを確認', () => {
      // 詳細画面を表示
      cy.get('.circuit-card .load-button').first().click();
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
      
      // 戻るボタンをクリック
      cy.contains('ギャラリーに戻る').click();
      
      // ギャラリー一覧に戻ることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      cy.contains('🔄 循環回路').should('be.visible');
      cy.get('.circuits-grid').should('be.visible');
    });

    it('ボタンが正しく表示され、他の要素に覆われていないことを確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        // ボタンが完全に表示されていることを確認
        cy.wrap($button).should('be.visible').and('not.be.covered');
        
        // ボタンのスタイルが適切に設定されていることを確認
        cy.wrap($button).should('have.css', 'pointer-events', 'auto');
        cy.wrap($button).should('have.css', 'z-index', '100');
        
        // ボタンのテキストが正しいことを確認
        cy.wrap($button).should('contain.text', '詳細を見る');
      });
    });

    it('ホバー効果が正常に動作することを確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        // ホバー前の背景色を取得
        const initialBg = window.getComputedStyle($button[0]).backgroundColor;
        
        // ホバー
        cy.wrap($button).trigger('mouseover');
        
        // ホバー効果の確認（色の変化）
        cy.wrap($button).should(($btn) => {
          const hoveredBg = window.getComputedStyle($btn[0]).backgroundColor;
          expect(hoveredBg).to.not.equal(initialBg);
        });
        
        // ホバー解除
        cy.wrap($button).trigger('mouseout');
      });
    });
  });

  describe('レスポンシブ対応', () => {
    it('モバイルサイズでもボタンが機能することを確認', () => {
      cy.viewport(375, 667); // iPhone SE サイズ
      
      // ボタンをクリック
      cy.get('.circuit-card .load-button').first().click();
      
      // 詳細画面が表示されることを確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
    });

    it('タブレットサイズでもボタンが機能することを確認', () => {
      cy.viewport(768, 1024); // iPad サイズ
      
      // ボタンをクリック
      cy.get('.circuit-card .load-button').first().click();
      
      // 詳細画面が表示されることを確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
    });
  });
});