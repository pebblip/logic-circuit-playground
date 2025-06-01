describe('UI Screenshot', () => {
  it('should capture current UI state', () => {
    // アプリケーションを開く
    cy.visit('http://localhost:5173/');
    
    // 少し待機して完全に読み込まれるのを待つ
    cy.wait(2000);
    
    // モード選択画面が表示されている場合は学習モードを選択
    cy.get('body').then($body => {
      // タイトルで判定
      if ($body.text().includes('学習スタイルを選んでください')) {
        cy.contains('学習モード').click();
        cy.wait(1000);
      }
    });
    
    // 全画面のスクリーンショット
    cy.screenshot('current-ui-full', {
      capture: 'fullPage',
      overwrite: true
    });
    
    // ビューポートのスクリーンショット
    cy.screenshot('current-ui-viewport', {
      capture: 'viewport',
      overwrite: true
    });
    
    // モバイルビュー
    cy.viewport('iphone-x');
    cy.wait(500);
    cy.screenshot('current-ui-mobile', {
      capture: 'viewport',
      overwrite: true
    });
    
    // タブレットビュー
    cy.viewport('ipad-2');
    cy.wait(500);
    cy.screenshot('current-ui-tablet', {
      capture: 'viewport',
      overwrite: true
    });
    
    // デスクトップビュー（広い幅）
    cy.viewport(2560, 1440);
    cy.wait(500);
    cy.screenshot('current-ui-desktop-wide', {
      capture: 'viewport',
      overwrite: true
    });
    
    // デスクトップビュー（通常）
    cy.viewport(1920, 1080);
    cy.wait(500);
    cy.screenshot('current-ui-desktop', {
      capture: 'viewport',
      overwrite: true
    });
  });
});