describe('LEDボタンのデバッグ', () => {
  it('ビジュアライザーボタンの状態を確認', () => {
    cy.visit('/');
    
    // ビジュアライザーボタンを探す
    cy.get('.fab--primary').as('visualizerButton');
    
    // 初期状態の確認
    cy.get('@visualizerButton').should('exist');
    cy.get('@visualizerButton').should('be.visible');
    cy.get('@visualizerButton').should('not.have.class', 'active');
    
    // スクリーンショットを撮る
    cy.screenshot('01-initial-state');
    
    // ボタンをクリック
    cy.get('@visualizerButton').click();
    
    // クリック後の状態を確認
    cy.wait(500);
    cy.get('@visualizerButton').should('have.class', 'active');
    cy.screenshot('02-after-click');
    
    // 右サイドバーにビジュアライザーパネルが表示されているか確認
    cy.get('.sidebar-right').should('exist');
    cy.contains('回路モニター').should('be.visible');
    cy.screenshot('03-visualizer-panel');
    
    // もう一度クリックして閉じる
    cy.get('@visualizerButton').click();
    cy.wait(500);
    cy.get('@visualizerButton').should('not.have.class', 'active');
    cy.screenshot('04-closed-state');
  });
  
  it('ズームコントロールの配置を確認', () => {
    cy.visit('/');
    
    // ズームコントロールを探す
    cy.get('.zoom-controls').as('zoomControls');
    
    // canvas-container内にあることを確認
    cy.get('.canvas-container').first().within(() => {
      cy.get('.zoom-controls').should('exist');
      cy.get('.zoom-controls').should('be.visible');
    });
    
    // スクリーンショット
    cy.screenshot('05-zoom-controls-position');
    
    // ズームボタンをテスト
    cy.get('.zoom-button').contains('＋').click();
    cy.wait(100);
    cy.get('.zoom-button.zoom-reset').should('contain', '%');
    cy.screenshot('06-after-zoom-in');
  });
});