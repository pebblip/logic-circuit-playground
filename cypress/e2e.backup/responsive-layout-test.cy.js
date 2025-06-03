describe('Responsive Layout Test', () => {
  it('should display mobile layout on small screens', () => {
    // モバイルビューポートに設定
    cy.viewport(375, 667); // iPhone SE
    cy.visit('http://localhost:5173');
    
    // モバイルレイアウトの要素が表示されていることを確認
    cy.get('.mobile-layout').should('exist');
    cy.get('.mobile-header').should('be.visible');
    cy.get('.mobile-toolbar').should('exist');
    cy.get('.fab-container').should('be.visible');
    
    // デスクトップレイアウトの要素が表示されていないことを確認
    cy.get('.desktop-layout').should('not.exist');
    cy.get('.tool-palette').should('not.exist');
    cy.get('.property-panel').should('not.exist');
  });

  it('should display desktop layout on large screens', () => {
    // デスクトップビューポートに設定
    cy.viewport(1920, 1080);
    cy.visit('http://localhost:5173');
    
    // デスクトップレイアウトの要素が表示されていることを確認
    cy.get('.desktop-layout').should('exist');
    cy.get('.header').should('be.visible');
    cy.get('.tool-palette').should('be.visible');
    cy.get('.property-panel').should('be.visible');
    
    // モバイルレイアウトの要素が表示されていないことを確認
    cy.get('.mobile-layout').should('not.exist');
    cy.get('.mobile-toolbar').should('not.exist');
    cy.get('.fab-container').should('not.exist');
  });

  it('should display tablet layout on medium screens', () => {
    // タブレットビューポートに設定
    cy.viewport(768, 1024); // iPad
    cy.visit('http://localhost:5173');
    
    // タブレットレイアウトの要素が表示されていることを確認
    cy.get('.tablet-layout').should('exist');
    cy.get('.tablet-tool-palette').should('be.visible');
    cy.get('.tablet-property-panel').should('be.visible');
    
    // 折りたたみボタンが機能することを確認
    cy.get('.palette-toggle').should('be.visible');
    cy.get('.panel-toggle').should('be.visible');
  });

  it('should handle mobile toolbar interaction', () => {
    cy.viewport(375, 667);
    cy.visit('http://localhost:5173');
    
    // ツールバーが最初は閉じていることを確認
    cy.get('.mobile-toolbar').should('have.class', '');
    
    // スワイプハンドルをクリックしてツールバーを開く
    cy.get('.swipe-handle').click();
    cy.get('.mobile-toolbar').should('have.class', 'open');
    
    // カテゴリー切り替えをテスト
    cy.get('.category-chip').contains('特殊').click();
    cy.get('.category-chip').contains('特殊').should('have.class', 'active');
    
    // ツールアイテムが表示されることを確認
    cy.get('.tool-item').should('have.length.greaterThan', 0);
    
    // CLOCKゲートをクリック
    cy.get('.tool-item').contains('CLOCK').click();
    
    // ゲートが配置されたことを確認
    cy.window().then((win) => {
      const state = win.useCircuitStore?.getState();
      expect(state.gates).to.have.length(1);
      expect(state.gates[0].type).to.equal('CLOCK');
    });
  });

  it('should support pan and zoom on mobile', () => {
    cy.viewport(375, 667);
    cy.visit('http://localhost:5173');
    
    // INPUTゲートを配置
    cy.get('.swipe-handle').click();
    cy.get('.category-chip').contains('入出力').click();
    cy.get('.tool-item').contains('INPUT').click();
    
    // タッチイベントをシミュレート（パン）
    cy.get('svg.canvas')
      .trigger('touchstart', { 
        touches: [{ clientX: 200, clientY: 300 }] 
      })
      .trigger('touchmove', { 
        touches: [{ clientX: 100, clientY: 200 }] 
      })
      .trigger('touchend');
    
    // ViewBoxが変更されたことを確認
    cy.get('svg.canvas').invoke('attr', 'viewBox').then((viewBox) => {
      expect(viewBox).to.not.equal('0 0 1200 800');
    });
  });
});