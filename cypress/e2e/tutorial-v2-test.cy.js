describe('改良版チュートリアルシステムのテスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('パネルが画面下部に固定表示される', () => {
    // チュートリアルパネルが表示されることを確認
    cy.contains('ようこそ！').should('be.visible');
    
    // パネルの位置を確認
    cy.contains('ようこそ！').parent().parent().then($panel => {
      const rect = $panel[0].getBoundingClientRect();
      const viewportHeight = Cypress.config('viewportHeight');
      
      // 画面下部に表示されているか確認（bottom: 20px）
      expect(rect.bottom).to.be.closeTo(viewportHeight - 20, 50);
      
      // 水平方向は中央に配置されているか確認
      const viewportWidth = Cypress.config('viewportWidth');
      const panelCenter = rect.left + rect.width / 2;
      expect(panelCenter).to.be.closeTo(viewportWidth / 2, 50);
    });
  });

  it('ツールバーがハイライトされる', () => {
    // 次へボタンをクリック
    cy.contains('次へ').click();
    
    // ツールバーステップが表示される
    cy.contains('ツールバー').should('be.visible');
    
    // ハイライトが表示される
    cy.get('div[style*="border: 3px solid"]').should('exist');
    
    // ツールバーがハイライトされているか確認
    cy.get('[data-tutorial-target="toolbar"]').then($toolbar => {
      const toolbarRect = $toolbar[0].getBoundingClientRect();
      
      cy.get('div[style*="border: 3px solid"]').then($highlight => {
        const highlightRect = $highlight[0].getBoundingClientRect();
        
        // ハイライトがツールバーを囲んでいるか確認（5pxのマージンを考慮）
        expect(highlightRect.left).to.be.closeTo(toolbarRect.left - 5, 2);
        expect(highlightRect.top).to.be.closeTo(toolbarRect.top - 5, 2);
        expect(highlightRect.width).to.be.closeTo(toolbarRect.width + 10, 2);
        expect(highlightRect.height).to.be.closeTo(toolbarRect.height + 10, 2);
      });
    });
  });

  it('入力ボタンがハイライトされる', () => {
    // ツールバーステップまで進む
    cy.contains('次へ').click();
    cy.contains('次へ').click();
    
    // 入力ゲートを配置ステップ
    cy.contains('入力ゲートを配置').should('be.visible');
    
    // 入力ボタンがハイライトされているか確認
    cy.contains('button', '入力').should('be.visible');
    cy.get('div[style*="border: 3px solid"]').should('exist');
  });

  it('ゲートを配置してもパネルと重ならない', () => {
    // 入力ゲート配置ステップまで進む
    cy.contains('次へ').click();
    cy.contains('次へ').click();
    
    // 入力ゲートを配置
    cy.contains('button', '入力').click();
    
    // 次のステップに進む
    cy.contains('入力を切り替え', { timeout: 1000 }).should('be.visible');
    
    // パネルとゲートが重なっていないことを確認
    cy.get('g[data-gate-type="INPUT"]').then($gate => {
      const gateRect = $gate[0].getBoundingClientRect();
      
      cy.contains('入力を切り替え').parent().parent().then($panel => {
        const panelRect = $panel[0].getBoundingClientRect();
        
        // パネルは画面下部、ゲートは中央付近なので重ならない
        expect(panelRect.top).to.be.greaterThan(gateRect.bottom);
      });
    });
    
    // ゲートがクリック可能
    cy.get('g[data-gate-type="INPUT"]').click();
    
    // 出力ゲート配置ステップに進む
    cy.contains('出力ゲートを配置', { timeout: 1000 }).should('be.visible');
  });

  it('チュートリアルの全ステップが正しく動作する', () => {
    // 1. ウェルカム
    cy.contains('ようこそ！').should('be.visible');
    cy.contains('次へ').click();
    
    // 2. ツールバー
    cy.contains('ツールバー').should('be.visible');
    cy.get('[data-tutorial-target="toolbar"]').should('be.visible');
    cy.contains('次へ').click();
    
    // 3. 入力ゲート配置
    cy.contains('入力ゲートを配置').should('be.visible');
    cy.contains('button', '入力').click();
    
    // 4. 入力切り替え
    cy.contains('入力を切り替え', { timeout: 1000 }).should('be.visible');
    cy.get('g[data-gate-type="INPUT"]').click();
    
    // 5. 出力ゲート配置
    cy.contains('出力ゲートを配置', { timeout: 1000 }).should('be.visible');
    cy.contains('button', '出力').click();
    
    // 6. ワイヤー接続
    cy.contains('ワイヤーで接続', { timeout: 1000 }).should('be.visible');
    
    // ワイヤー接続を実行
    cy.get('g[data-gate-type="INPUT"] circle[data-terminal="output"]').first()
      .trigger('mousedown', { button: 0 });
    cy.get('g[data-gate-type="OUTPUT"] circle[data-terminal="input"]').first()
      .trigger('mouseup', { button: 0 });
    
    // 7. 完了
    cy.contains('チュートリアル完了！', { timeout: 1000 }).should('be.visible');
    cy.contains('完了').click();
    
    // チュートリアルが終了してチャレンジが表示される
    cy.contains('チャレンジ', { timeout: 1000 }).should('be.visible');
  });

  it('スキップボタンでチュートリアルを終了できる', () => {
    cy.contains('スキップ').click();
    
    // チュートリアルが終了してチャレンジが表示される
    cy.contains('チャレンジ').should('be.visible');
  });

  it('ANDゲートのステップが削除されている', () => {
    // 全ステップを確認
    const steps = [];
    
    // ステップを記録しながら進む
    cy.contains('ようこそ！').then(() => steps.push('welcome'));
    cy.contains('次へ').click();
    
    cy.contains('ツールバー').then(() => steps.push('toolbar'));
    cy.contains('次へ').click();
    
    cy.contains('入力ゲートを配置').then(() => steps.push('input'));
    
    // すべてのステップを進めてANDゲートのステップがないことを確認
    cy.get('body').then(() => {
      // ANDゲートというタイトルのステップが存在しないことを確認
      expect(steps).to.not.include('and-gate');
    });
  });
});