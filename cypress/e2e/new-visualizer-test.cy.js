describe('新しいビジュアライザーテスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('新しいビジュアライザーの基本機能をテスト', () => {
    // 自由制作モードに切り替え
    cy.contains('自由制作').click();
    cy.wait(500);
    
    // 1. ビジュアライザーボタンをクリック
    cy.get('button[title="ビジュアライザーを開く"]').click();
    cy.wait(500);
    
    // 2. 新しいタイトル「回路モニター」が表示されているか確認
    cy.contains('回路モニター').should('be.visible');
    cy.log('✅ 新しいタイトル「回路モニター」が表示されています');
    
    // 3. 初期状態では「動作状況が表示されます」が表示
    cy.contains('動作状況が表示されます').should('be.visible');
    cy.log('✅ 初期状態のメッセージが表示されています');
    
    // 4. 新しいビジュアライザーパネルが存在することを確認
    cy.get('.circuit-visualizer-panel').should('exist');
    cy.log('✅ 新しいビジュアライザーパネルが表示されています');
    
    // 5. もう一度ビジュアライザーボタンをクリックして非表示にする
    cy.get('button[title="ビジュアライザーを開く"]').click();
    cy.wait(500);
    
    // 6. 回路モニターが非表示になることを確認
    cy.contains('回路モニター').should('not.exist');
    cy.log('✅ ビジュアライザーボタンでのトグル動作を確認');
    
    // スクリーンショット撮影
    cy.screenshot('new-visualizer-test');
  });

  it('回路があるときのビジュアライザー表示をテスト', () => {
    // 自由制作モードに切り替え
    cy.contains('自由制作').click();
    cy.wait(500);
    
    // 1. ANDゲートを配置（何でもいいのでゲートを1つ）
    cy.get('.tools-grid').contains('AND').click();
    cy.get('.main-canvas').click(300, 200);
    cy.wait(200);
    
    // 2. ビジュアライザーを開く
    cy.get('button[title="ビジュアライザーを開く"]').click();
    cy.wait(500);
    
    // 3. 新しいビジュアライザーが表示されることを確認
    cy.contains('回路モニター').should('be.visible');
    cy.log('✅ 回路モニターが表示されています');
    
    // 4. 何らかの回路情報が表示されることを確認
    cy.get('.circuit-visualizer-panel').should('exist');
    cy.log('✅ ビジュアライザーパネルが存在します');
    
    // スクリーンショット撮影
    cy.screenshot('visualizer-with-circuit');
  });
});