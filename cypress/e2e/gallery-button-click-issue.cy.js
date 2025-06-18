describe('ギャラリーパネル ボタンクリック問題調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
    cy.wait(500); // ギャラリー表示待機
  });

  describe('ボタンクリック範囲の調査', () => {
    it('ロードボタンの左側クリックが機能することを確認', () => {
      // 最初の回路カードを取得
      cy.get('.circuit-card').first().within(() => {
        cy.get('.load-button').first().then(($button) => {
          const buttonRect = $button[0].getBoundingClientRect();
          
          // ボタンの左端から1/4の位置でクリック
          const leftClickX = buttonRect.left + (buttonRect.width * 0.25);
          const centerY = buttonRect.top + (buttonRect.height * 0.5);
          
          cy.log(`ボタン位置: left=${buttonRect.left}, width=${buttonRect.width}`);
          cy.log(`左側クリック位置: x=${leftClickX}, y=${centerY}`);
          
          // 左側をクリック
          cy.get('.load-button').first().click({ x: leftClickX - buttonRect.left, y: centerY - buttonRect.top });
        });
      });
      
      // 選択された回路画面が表示されるか確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
    });

    it('ロードボタンの右側クリックが機能することを確認', () => {
      // 最初の回路カードを取得
      cy.get('.circuit-card').first().within(() => {
        cy.get('.load-button').first().then(($button) => {
          const buttonRect = $button[0].getBoundingClientRect();
          
          // ボタンの右端から1/4の位置でクリック
          const rightClickX = buttonRect.right - (buttonRect.width * 0.25);
          const centerY = buttonRect.top + (buttonRect.height * 0.5);
          
          cy.log(`ボタン位置: right=${buttonRect.right}, width=${buttonRect.width}`);
          cy.log(`右側クリック位置: x=${rightClickX}, y=${centerY}`);
          
          // 右側をクリック
          cy.get('.load-button').first().click({ x: rightClickX - buttonRect.left, y: centerY - buttonRect.top });
        });
      });
      
      // 右側クリックでも機能するか確認
      cy.get('.selected-circuit', { timeout: 3000 }).should('be.visible');
    });

    it('ボタンの計算されたスタイルを確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        const computedStyle = window.getComputedStyle($button[0]);
        
        cy.log('ボタンのスタイル情報:');
        cy.log(`position: ${computedStyle.position}`);
        cy.log(`z-index: ${computedStyle.zIndex}`);
        cy.log(`pointer-events: ${computedStyle.pointerEvents}`);
        cy.log(`width: ${computedStyle.width}`);
        cy.log(`height: ${computedStyle.height}`);
        cy.log(`display: ${computedStyle.display}`);
        cy.log(`overflow: ${computedStyle.overflow}`);
        
        // 重要なスタイルが正しく設定されているか確認
        expect(computedStyle.pointerEvents).to.not.equal('none');
        expect(computedStyle.display).to.not.equal('none');
      });
    });

    it('ボタン要素の重複や重なりを確認', () => {
      cy.get('.circuit-card').first().within(() => {
        // ボタンが一つだけ存在することを確認
        cy.get('.load-button').should('have.length', 1);
        
        // ボタンの親要素を確認
        cy.get('.load-button').parent().then(($parent) => {
          const parentStyle = window.getComputedStyle($parent[0]);
          cy.log(`親要素のposition: ${parentStyle.position}`);
          cy.log(`親要素のz-index: ${parentStyle.zIndex}`);
          cy.log(`親要素のoverflow: ${parentStyle.overflow}`);
        });
      });
    });

    it('ボタン上に他の要素が重なっていないか確認', () => {
      cy.get('.circuit-card .load-button').first().then(($button) => {
        const buttonRect = $button[0].getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;
        
        // ボタンの中央座標で最上位の要素を取得
        const topElement = document.elementFromPoint(centerX, centerY);
        
        cy.log(`ボタン中央の最上位要素: ${topElement?.tagName} ${topElement?.className}`);
        
        // ボタン自身または子要素が最上位にあることを確認
        expect(topElement === $button[0] || $button[0].contains(topElement)).to.be.true;
      });
    });

    it('複数のボタンで問題が発生するか確認', () => {
      // すべてのload-buttonを取得してテスト
      cy.get('.load-button').each(($button, index) => {
        cy.wrap($button).then(() => {
          const buttonRect = $button[0].getBoundingClientRect();
          
          // 左側をクリック
          cy.wrap($button).click({ x: buttonRect.width * 0.25, y: buttonRect.height * 0.5 });
          
          // レスポンスがあることを確認（詳細画面または何らかの反応）
          cy.wait(200);
          
          // 詳細画面が表示された場合は戻る
          cy.get('body').then(($body) => {
            if ($body.find('.selected-circuit').length > 0) {
              cy.contains('ギャラリーに戻る').click();
              cy.wait(300);
            }
          });
        });
      });
    });
  });

  describe('CSSレイアウト問題の調査', () => {
    it('回路カード内の要素配置を確認', () => {
      cy.get('.circuit-card').first().within(() => {
        // 各要素が期待される順序で配置されているか確認
        cy.get('.circuit-header').should('exist');
        cy.get('.circuit-description').should('exist');
        cy.get('.circuit-meta').should('exist');
        cy.get('.load-button').should('exist');
        
        // load-buttonが最後の要素であることを確認
        cy.get('.load-button').should('be.visible').and('not.be.covered');
      });
    });

    it('フレックスボックスレイアウトの確認', () => {
      cy.get('.circuits-grid').then(($grid) => {
        const gridStyle = window.getComputedStyle($grid[0]);
        cy.log(`Grid display: ${gridStyle.display}`);
        cy.log(`Grid template columns: ${gridStyle.gridTemplateColumns}`);
      });
      
      cy.get('.circuit-card').first().then(($card) => {
        const cardStyle = window.getComputedStyle($card[0]);
        cy.log(`Card display: ${cardStyle.display}`);
        cy.log(`Card position: ${cardStyle.position}`);
        cy.log(`Card flex-direction: ${cardStyle.flexDirection}`);
      });
    });
  });
});