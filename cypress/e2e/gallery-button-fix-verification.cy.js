describe('ギャラリーパネル ボタンクリック修正検証', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
    cy.wait(500); // ギャラリー表示待機
  });

  describe('修正後の動作確認', () => {
    it('タイミングチャートパネルがギャラリーモードで非表示になることを確認', () => {
      // タイミングチャートパネルが存在しないことを確認
      cy.get('.timing-chart-panel').should('not.exist');
      cy.get('.timing-chart-horizontal-panel').should('not.exist');
    });

    it('ロードボタンが全領域でクリック可能になることを確認', () => {
      // 最初の回路カードのロードボタンをテスト
      cy.get('.circuit-card .load-button').first().then(($button) => {
        const buttonRect = $button[0].getBoundingClientRect();
        
        // ボタンが完全に表示されていることを確認
        cy.wrap($button).should('be.visible').and('not.be.covered');
        
        // ボタンのz-indexが適切に設定されていることを確認
        cy.wrap($button).should('have.css', 'z-index', '100');
        
        // ボタンのpointer-eventsが有効であることを確認
        cy.wrap($button).should('have.css', 'pointer-events', 'auto');
      });
    });

    it('ボタンの左側、中央、右側すべてでクリックが機能することを確認', () => {
      const clickPositions = [
        { name: '左側', ratio: 0.25 },
        { name: '中央', ratio: 0.5 },
        { name: '右側', ratio: 0.75 }
      ];

      clickPositions.forEach((position) => {
        // 各位置でクリックをテスト
        cy.get('.circuit-card .load-button').first().then(($button) => {
          const rect = $button[0].getBoundingClientRect();
          const x = rect.width * position.ratio;
          const y = rect.height * 0.5;
          
          cy.log(`${position.name}クリック位置: x=${x}, y=${y}`);
          
          // クリック実行
          cy.wrap($button).click({ x, y });
          
          // 選択された回路画面が表示されることを確認
          cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
          
          // 戻る
          cy.contains('ギャラリーに戻る').click();
          cy.wait(300);
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

    it('回路カードのレイアウトが正しく配置されていることを確認', () => {
      cy.get('.circuit-card').first().within(() => {
        // 要素が正しい順序で配置されていることを確認
        cy.get('.circuit-header').should('be.visible');
        cy.get('.circuit-description').should('be.visible');
        cy.get('.circuit-meta').should('be.visible');
        cy.get('.load-button').should('be.visible');
        
        // load-buttonが他の要素に隠れていないことを確認
        cy.get('.load-button').should('not.be.covered');
      });
    });

    it('ホバー効果が正常に動作することを確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        // ホバー前の状態
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

  describe('他のモードからの切り替えテスト', () => {
    it('フリーモードからギャラリーモードに切り替えてもボタンが機能することを確認', () => {
      // フリーモードに戻る
      cy.contains('フリーモード').click();
      cy.wait(300);
      
      // 再度ギャラリーモードに切り替え
      cy.contains('ギャラリーモード').click();
      cy.wait(500);
      
      // ボタンが機能することを確認
      cy.get('.circuit-card .load-button').first().click();
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
    });
  });
});