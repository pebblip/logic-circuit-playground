describe('最終改善版タイミングチャート', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('タイミングチャートが劇的に改善されている', () => {
    // 右下にタイミングチャートボタンが目立つ位置にある
    cy.get('.timing-chart-toggle-button')
      .should('be.visible')
      .and('contain', 'タイミングチャート');
    
    // ボタンをクリック
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 大きなパネルが表示される
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // 使い方ガイドが表示される
    cy.contains('タイミングチャートの使い方').should('be.visible');
    cy.contains('左のツールパレットからゲートをドラッグ').should('be.visible');
    
    // デモ波形が表示される
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-final-improved', { capture: 'viewport' });
  });

  it('使い方ガイドが明確で親切', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 使い方の各ステップが表示される
    cy.contains('1️⃣ 左のツールパレットからゲートをドラッグ').should('be.visible');
    cy.contains('2️⃣ ゲートのピンをクリックして接続').should('be.visible');
    cy.contains('3️⃣ CLOCKゲートを追加すると').should('be.visible');
    cy.contains('4️⃣ 入力ゲートをクリックして').should('be.visible');
    cy.contains('上記はCLOCK信号のデモ波形です').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-final-guide', { capture: 'viewport' });
  });

  it('閉じるボタンで正しく閉じられる', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが表示されている
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // 閉じるボタンをクリック
    cy.get('.timing-chart-button[title="閉じる"]').click();
    cy.wait(500);
    
    // パネルが閉じている
    cy.get('.timing-chart-main-panel').should('not.exist');
    
    // トグルボタンは残っている
    cy.get('.timing-chart-toggle-button').should('be.visible');
  });
});