describe('タイミングチャートと回路の連携', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('CLOCKゲートの波形を確認', () => {
    // CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(500);
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが正しく表示されることを確認
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // プレースホルダー表示を確認
    cy.get('.waveform-placeholder').should('be.visible');
    cy.contains('トレース数: 0').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-circuit-1-clock-only', { capture: 'viewport' });
  });

  it('複数ゲートの回路を確認', () => {
    // ANDゲートを配置
    cy.get('.tool-card[data-gate-type="AND"]').click();
    cy.get('svg[data-testid="canvas"]').click(200, 200);
    cy.wait(300);
    
    // 入力ゲートを2つ配置
    cy.get('.tool-card[data-gate-type="INPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(100, 150);
    cy.wait(300);
    
    cy.get('.tool-card[data-gate-type="INPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(100, 250);
    cy.wait(300);
    
    // 出力ゲートを配置
    cy.get('.tool-card[data-gate-type="OUTPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(350, 200);
    cy.wait(300);
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // プレースホルダーに回路情報が表示されることを確認
    cy.contains('トレース数:').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-circuit-2-and-gate', { capture: 'viewport' });
  });

  it('設定パネルの動作を確認', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 設定ボタンをクリック
    cy.get('.timing-chart-button[title="設定"]').click();
    cy.wait(300);
    
    // 設定パネルが表示されることを確認
    cy.get('.timing-chart-settings').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-circuit-3-settings', { capture: 'viewport' });
    
    // 設定を閉じる
    cy.get('.timing-chart-button[title="設定"]').click();
    cy.wait(300);
    
    // 設定パネルが非表示になることを確認
    cy.get('.timing-chart-settings').should('not.exist');
  });

  it('空の状態の表示を確認', () => {
    // タイミングチャートを開く（回路なし）
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 空の状態メッセージを確認
    cy.contains('回路にゲートを追加してシミュレーションを実行すると').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-circuit-4-empty', { capture: 'viewport' });
  });
});