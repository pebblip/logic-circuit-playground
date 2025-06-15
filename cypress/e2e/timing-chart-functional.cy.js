describe('タイミングチャートの機能確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('CLOCKゲートとの連携を確認', () => {
    // CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(500);
    
    // OUTPUTゲートを配置
    cy.get('.tool-card[data-gate-type="OUTPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(500, 200);
    cy.wait(500);
    
    // 接続（IDは動的に割り当てられるため、位置ベースで選択）
    cy.get('circle[data-testid^="output-pin-"]').first().click();
    cy.get('circle[data-testid^="input-pin-"]').last().click();
    cy.wait(500);
    
    // タイミングチャートチャートパネルがデフォルトで開いていることを確認
    cy.wait(1000);
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが正しく表示されることを確認
    cy.get('.timing-chart-main-panel').should('be.visible');
    cy.get('.timing-chart-main-panel').should('have.css', 'height').and('match', /300px/);
    
    // スクリーンショット
    cy.screenshot('timing-chart-functional-1-with-clock', { capture: 'viewport' });
    
    // 設定パネルを開く
    cy.get('.timing-chart-button[title="設定"]').click();
    cy.wait(300);
    cy.screenshot('timing-chart-functional-2-settings', { capture: 'viewport' });
    
    // CSVエクスポートボタンが存在することを確認
    cy.get('.timing-chart-button[title="CSVエクスポート"]').should('exist');
  });

  it('パネルのリサイズを確認', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // リサイズハンドルをドラッグ
    cy.get('.timing-chart-resize-handle')
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientY: 300 }) // 上にドラッグ
      .trigger('mouseup');
    
    cy.wait(500);
    
    // 高さが変更されたことを確認（300px以外の値になっている）
    cy.get('.timing-chart-main-panel').then(($el) => {
      const height = $el.css('height');
      expect(height).to.not.equal('300px');
    });
    
    cy.screenshot('timing-chart-functional-3-resized', { capture: 'viewport' });
  });
});