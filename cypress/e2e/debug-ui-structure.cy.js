describe('UI構造の調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(3000);
  });

  it('現在のUI構造を詳細調査', () => {
    // 全体のDOM構造を確認
    cy.get('body').then(() => {
      cy.log('=== DOM構造の詳細調査 ===');
    });
    
    // ツールパレット関連の要素を探す
    cy.get('body').find('*').each(($el) => {
      const tagName = $el.prop('tagName');
      const className = $el.attr('class') || '';
      const id = $el.attr('id') || '';
      const testId = $el.attr('data-testid') || '';
      const text = $el.text().trim();
      
      // カスタム、ツールパレット、ボタン関連の要素をフィルタ
      if (
        className.includes('custom') ||
        className.includes('tool') ||
        className.includes('palette') ||
        className.includes('gate') ||
        text.includes('カスタム') ||
        text.includes('Custom') ||
        testId.includes('custom') ||
        id.includes('custom') ||
        tagName === 'BUTTON'
      ) {
        cy.log(`要素発見: ${tagName} class="${className}" id="${id}" testid="${testId}" text="${text.substring(0, 50)}"`);
      }
    });
    
    // ボタン要素を詳細確認
    cy.get('button').each(($btn) => {
      const text = $btn.text().trim();
      const className = $btn.attr('class') || '';
      const id = $btn.attr('id') || '';
      const testId = $btn.attr('data-testid') || '';
      
      cy.log(`ボタン: text="${text}" class="${className}" id="${id}" testid="${testId}"`);
    });
    
    // SVG要素の確認
    cy.get('svg').then(($svgs) => {
      cy.log(`SVG要素数: ${$svgs.length}`);
      $svgs.each((index, svg) => {
        const className = svg.getAttribute('class') || '';
        const id = svg.getAttribute('id') || '';
        const width = svg.getAttribute('width') || '';
        const height = svg.getAttribute('height') || '';
        cy.log(`SVG${index}: class="${className}" id="${id}" size="${width}x${height}"`);
      });
    });
    
    // セクション要素の確認
    cy.get('div, section, main').each(($el) => {
      const className = $el.attr('class') || '';
      const id = $el.attr('id') || '';
      const testId = $el.attr('data-testid') || '';
      
      if (
        className.includes('tool') ||
        className.includes('palette') ||
        className.includes('custom') ||
        className.includes('gate') ||
        id.includes('tool') ||
        id.includes('custom') ||
        testId.includes('tool') ||
        testId.includes('custom')
      ) {
        const tagName = $el.prop('tagName');
        cy.log(`コンテナ: ${tagName} class="${className}" id="${id}" testid="${testId}"`);
      }
    });
  });

  it('クリック可能な要素を探して試行', () => {
    // カスタムという文字を含む要素を探す
    cy.get('body').then($body => {
      const customElements = $body.find(':contains("カスタム"), :contains("Custom"), :contains("custom")');
      
      if (customElements.length > 0) {
        cy.log(`カスタム関連要素を${customElements.length}個発見`);
        
        customElements.each((index, el) => {
          const $el = Cypress.$(el);
          const tagName = $el.prop('tagName');
          const text = $el.text().trim().substring(0, 30);
          const className = $el.attr('class') || '';
          
          cy.log(`カスタム要素${index}: ${tagName} "${text}" class="${className}"`);
          
          // クリック可能そうな要素なら試行
          if (tagName === 'BUTTON' || className.includes('button') || className.includes('clickable')) {
            cy.wrap($el).click({ force: true });
            cy.wait(1000);
            
            // ダイアログが開いたかチェック
            cy.get('body').then($body2 => {
              if ($body2.find('.dialog-overlay, [role="dialog"]').length > 0) {
                cy.log('ダイアログが開きました！');
                
                // ダイアログの内容を確認
                cy.get('.dialog-overlay, [role="dialog"]').within(() => {
                  cy.get('*').each(($dialogEl) => {
                    const dialogText = $dialogEl.text().trim();
                    if (dialogText.includes('プレビュー') || dialogText.includes('preview')) {
                      cy.log('プレビュー要素が見つかりました');
                    }
                  });
                });
                
                // ダイアログを閉じる
                cy.get('body').type('{esc}');
                cy.wait(1000);
              } else {
                cy.log('ダイアログは開きませんでした');
              }
            });
          }
        });
      } else {
        cy.log('カスタム関連要素が見つかりません');
        
        // ツールパレット要素を探す
        const toolElements = $body.find('[class*="tool"], [class*="palette"], [class*="gate"]');
        cy.log(`ツール関連要素を${toolElements.length}個発見`);
        
        toolElements.slice(0, 5).each((index, el) => {
          const $el = Cypress.$(el);
          const className = $el.attr('class') || '';
          const text = $el.text().trim().substring(0, 30);
          cy.log(`ツール要素${index}: "${text}" class="${className}"`);
        });
      }
    });
  });
});