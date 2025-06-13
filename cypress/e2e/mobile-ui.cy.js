describe('モバイルUI', () => {
  beforeEach(() => {
    // iPhone 13のビューポートサイズ
    cy.viewport(390, 844);
    cy.visit('/');
  });

  it('モバイルレイアウトの初期状態をキャプチャ', () => {
    // 少し待つ
    cy.wait(1000);
    
    // 初期状態のスクリーンショット
    cy.screenshot('mobile-initial-state', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('ツールバーを開いた状態をキャプチャ', () => {
    // ツールバーのスワイプハンドルをクリック
    cy.get('.swipe-handle').click();
    cy.wait(500);
    
    cy.screenshot('mobile-toolbar-open', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('各カテゴリーのツールをキャプチャ', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();
    cy.wait(500);
    
    // 基本カテゴリー（デフォルト）
    cy.screenshot('mobile-tools-basic', {
      capture: 'viewport',
      overwrite: true
    });
    
    // 入出力カテゴリー
    cy.get('.category-chip').contains('入出力').click();
    cy.wait(300);
    cy.screenshot('mobile-tools-io', {
      capture: 'viewport',
      overwrite: true
    });
    
    // 特殊カテゴリー
    cy.get('.category-chip').contains('特殊').click();
    cy.wait(300);
    cy.screenshot('mobile-tools-special', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('シミュレーションFABが削除されている', () => {
    // シミュレーションFABが存在しないことを確認
    cy.get('.mobile-simulation-fab').should('not.exist');
    
    cy.screenshot('mobile-no-simulation-fab', {
      capture: 'viewport',
      overwrite: true
    });
  });

  it('ゲートを配置した状態をキャプチャ', () => {
    // ツールバーを開く
    cy.get('.swipe-handle').click();
    cy.wait(500);
    
    // ANDゲートを配置
    cy.get('.tool-item').first().click();
    cy.wait(300);
    
    // ツールバーを閉じる
    cy.get('.swipe-handle').click();
    cy.wait(500);
    
    cy.screenshot('mobile-with-gate', {
      capture: 'viewport',
      overwrite: true
    });
  });
});