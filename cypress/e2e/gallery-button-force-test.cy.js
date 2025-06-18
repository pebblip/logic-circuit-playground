describe('ギャラリーパネル ボタンクリック強制テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
    cy.wait(500); // ギャラリー表示待機
  });

  describe('強制クリックテスト', () => {
    it('forceオプションを使用してボタンクリックが機能することを確認', () => {
      // 最初の回路カードのロードボタンを強制クリック
      cy.get('.circuit-card .load-button').first().click({ force: true });
      
      // 選択された回路画面が表示されることを確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
      
      // ボタンが機能していることを確認
      cy.contains('編集モードで開く').should('be.visible');
      cy.contains('ギャラリーに戻る').should('be.visible');
    });

    it('複数のボタンをforceクリックで順次テスト', () => {
      // 最初の3つのロードボタンをテスト
      cy.get('.load-button').then(($buttons) => {
        const testCount = Math.min($buttons.length, 3);
        
        for (let i = 0; i < testCount; i++) {
          cy.get('.load-button').eq(i).click({ force: true });
          cy.get('.selected-circuit', { timeout: 2000 }).should('be.visible');
          cy.contains('ギャラリーに戻る').click({ force: true });
          cy.wait(200);
        }
      });
    });

    it('ボタンのDOMプロパティを詳細チェック', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        // ボタンの位置情報とスタイルを詳細チェック
        const computedStyle = window.getComputedStyle($button[0]);
        const rect = $button[0].getBoundingClientRect();
        
        cy.log('ボタンの詳細情報:');
        cy.log(`位置: top=${rect.top}, left=${rect.left}, bottom=${rect.bottom}, right=${rect.right}`);
        cy.log(`サイズ: width=${rect.width}, height=${rect.height}`);
        cy.log(`z-index: ${computedStyle.zIndex}`);
        cy.log(`position: ${computedStyle.position}`);
        cy.log(`display: ${computedStyle.display}`);
        cy.log(`visibility: ${computedStyle.visibility}`);
        cy.log(`overflow: ${computedStyle.overflow}`);
        cy.log(`pointer-events: ${computedStyle.pointerEvents}`);
        
        // 親要素の調査
        let parent = $button[0].parentElement;
        let level = 1;
        while (parent && level <= 5) {
          const parentStyle = window.getComputedStyle(parent);
          cy.log(`親要素 ${level}: ${parent.tagName}.${parent.className}`);
          cy.log(`  position: ${parentStyle.position}`);
          cy.log(`  overflow: ${parentStyle.overflow}`);
          cy.log(`  z-index: ${parentStyle.zIndex}`);
          
          parent = parent.parentElement;
          level++;
        }
      });
    });

    it('ビューポートでの位置確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        const rect = $button[0].getBoundingClientRect();
        const viewportHeight = Cypress.config('viewportHeight');
        const viewportWidth = Cypress.config('viewportWidth');
        
        cy.log(`ビューポート: ${viewportWidth}x${viewportHeight}`);
        cy.log(`ボタン位置: top=${rect.top}, bottom=${rect.bottom}`);
        cy.log(`ビューポート内: ${rect.top >= 0 && rect.bottom <= viewportHeight ? 'Yes' : 'No'}`);
        
        // ボタンがビューポート外にある場合はスクロールして表示
        if (rect.top < 0 || rect.bottom > viewportHeight) {
          cy.wrap($button).scrollIntoView();
          cy.wait(500);
        }
        
        // スクロール後再度確認
        cy.wrap($button).then(($btn) => {
          const newRect = $btn[0].getBoundingClientRect();
          cy.log(`スクロール後ボタン位置: top=${newRect.top}, bottom=${newRect.bottom}`);
        });
      });
    });

    it('他の要素との重複チェック', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        const rect = $button[0].getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // ボタン中央の座標で最上位の要素を取得
        const topElement = document.elementFromPoint(centerX, centerY);
        
        cy.log(`ボタン中央座標: (${centerX}, ${centerY})`);
        cy.log(`最上位要素: ${topElement?.tagName}.${topElement?.className}`);
        cy.log(`ボタン自身または子要素か: ${topElement === $button[0] || $button[0].contains(topElement)}`);
        
        // タイミングチャートパネルが存在しないことを確認
        cy.get('.timing-chart-panel').should('not.exist');
        cy.get('.timing-chart-horizontal-panel').should('not.exist');
      });
    });
  });
});