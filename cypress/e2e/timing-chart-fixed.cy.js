describe('修正されたタイミングチャート', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('ボタンの位置が修正され？ボタンと重ならない', () => {
    // ？ボタンの位置を確認
    cy.get('.floating-help-button').should('be.visible');
    
    // タイミングチャートボタンの位置を確認（重ならない位置）
    cy.get('.timing-chart-toggle-button')
      .should('be.visible')
      .should('have.css', 'right', '80px'); // ？ボタンとの間隔
    
    // スクリーンショット
    cy.screenshot('timing-chart-fixed-1-button-position', { capture: 'viewport' });
  });

  it('パネルが大きく表示される', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが大きく表示されることを確認
    cy.get('.timing-chart-main-panel')
      .should('be.visible')
      .should('have.css', 'min-height', '60vh');
    
    // 波形キャンバスが表示される
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-fixed-2-large-panel', { capture: 'viewport' });
  });

  it('CLOCKゲート配置後にタイミングチャートで波形が見える', () => {
    // CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(500);
    
    // CLOCKゲートを開始
    cy.get('g[data-gate-id] circle').first().click(); // CLOCKゲートをクリックして開始
    cy.wait(1000); // CLOCKが動作する時間を待つ
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが表示される
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // 波形キャンバスが表示される
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // スクリーンショット（実際の波形を確認）
    cy.screenshot('timing-chart-fixed-3-clock-waves', { capture: 'viewport' });
    
    // しばらく待って動的に更新されることを確認
    cy.wait(2000);
    cy.screenshot('timing-chart-fixed-4-clock-waves-updated', { capture: 'viewport' });
  });

  it('使い方ガイドが明確に表示される', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 使い方ガイドが表示される
    cy.contains('タイミングチャートの使い方').should('be.visible');
    cy.contains('左のツールパレットからゲートをドラッグ').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-fixed-5-usage-guide', { capture: 'viewport' });
  });
});