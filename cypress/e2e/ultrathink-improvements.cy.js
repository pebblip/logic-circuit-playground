describe('Ultrathink Philosophy Improvements', () => {
  beforeEach(() => {
    // エラーハンドリング
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false;
    });
    
    cy.visit('http://localhost:5181');
  });

  describe('Drag-only placement (no auto-placement)', () => {
    it('should not place gates on click, only on drag-drop', () => {
      // ツールパレットのANDゲートをクリック
      cy.get('.tool-card[data-gate-type="AND"]').first().click();
      
      // ゲートが配置されていないことを確認
      cy.get('.gate-container').should('not.exist');
      
      // ドラッグ&ドロップでのみ配置可能
      cy.get('.tool-card[data-gate-type="AND"]').first().trigger('dragstart');
      cy.get('.canvas').trigger('drop', { clientX: 400, clientY: 300 });
      cy.get('.canvas').trigger('dragend');
      
      // ゲートが配置されたことを確認
      cy.get('.gate-container').should('have.length', 1);
    });
  });

  describe('Selection rectangle persistence', () => {
    it('should keep selection rectangle visible after selecting gates', () => {
      // まずゲートを配置
      cy.get('.tool-card[data-gate-type="AND"]').first().trigger('dragstart');
      cy.get('.canvas').trigger('drop', { clientX: 300, clientY: 300 });
      cy.get('.canvas').trigger('dragend');
      
      cy.get('.tool-card[data-gate-type="OR"]').first().trigger('dragstart');
      cy.get('.canvas').trigger('drop', { clientX: 500, clientY: 300 });
      cy.get('.canvas').trigger('dragend');
      
      // 選択矩形でゲートを選択
      cy.get('.canvas')
        .trigger('mousedown', { clientX: 200, clientY: 200 })
        .trigger('mousemove', { clientX: 600, clientY: 400 })
        .trigger('mouseup');
      
      // 選択矩形が表示されていることを確認
      cy.get('rect[fill="rgba(0, 255, 136, 0.1)"]').should('exist');
      
      // 背景をクリックして選択解除
      cy.get('.canvas').click(100, 100);
      
      // 選択矩形が消えることを確認
      cy.get('rect[fill="rgba(0, 255, 136, 0.1)"]').should('not.exist');
    });
  });

  describe('Space+drag for canvas panning', () => {
    it('should pan canvas when dragging with space key held', () => {
      // ゲートを配置
      cy.get('.tool-card[data-gate-type="INPUT"]').first().trigger('dragstart');
      cy.get('.canvas').trigger('drop', { clientX: 400, clientY: 300 });
      cy.get('.canvas').trigger('dragend');
      
      // Spaceキーを押しながらドラッグ
      cy.get('body').type(' ', { release: false });
      cy.get('.canvas')
        .trigger('mousedown', { clientX: 400, clientY: 300 })
        .trigger('mousemove', { clientX: 500, clientY: 400 })
        .trigger('mouseup');
      cy.get('body').type(' '); // Release space
      
      // ViewBoxが変更されたことを確認（パンされた）
      cy.get('.canvas').should(($svg) => {
        const viewBox = $svg.attr('viewBox');
        expect(viewBox).to.not.equal('0 0 1200 800');
      });
    });
  });

  describe('Zoom control UI', () => {
    it('should show zoom controls with percentage', () => {
      // ズームコントロールが表示されていることを確認
      cy.get('.zoom-controls').should('exist');
      cy.get('.zoom-button').should('have.length', 3);
      
      // 初期値は100%
      cy.get('.zoom-button.zoom-reset').should('contain', '100%');
      
      // ズームイン
      cy.get('.zoom-button').last().click();
      cy.get('.zoom-button.zoom-reset').should('contain', '110%');
      
      // ズームアウト
      cy.get('.zoom-button').first().click();
      cy.get('.zoom-button.zoom-reset').should('contain', '100%');
      
      // リセット
      cy.get('.zoom-button').last().click(); // 110%
      cy.get('.zoom-button').last().click(); // 121%
      cy.get('.zoom-button.zoom-reset').click(); // Reset to 100%
      cy.get('.zoom-button.zoom-reset').should('contain', '100%');
    });
    
    it('should disable mouse wheel zoom', () => {
      // マウスホイールでのズームが無効になっていることを確認
      cy.get('.zoom-button.zoom-reset').should('contain', '100%');
      
      // マウスホイールイベント
      cy.get('.canvas').trigger('wheel', { deltaY: -100 });
      
      // ズームレベルが変わらないことを確認
      // （実際にはpreventDefaultしているので、ブラウザのデフォルト動作は防がれる）
      cy.get('.zoom-button.zoom-reset').should('contain', '100%');
    });
  });
});