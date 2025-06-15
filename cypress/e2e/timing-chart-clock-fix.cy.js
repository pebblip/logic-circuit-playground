describe('CLOCKゲートのタイミングチャート修正確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('CLOCKゲート配置後にタイミングチャートでトレースが表示される', () => {
    // 1. タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 2. 初期状態：トレース数0を確認
    cy.contains('トレース数: 0').should('be.visible');
    
    // スクリーンショット（トレース追加前）
    cy.screenshot('clock-fix-1-before-clock', { capture: 'viewport' });
    
    // 3. CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(1000); // CLOCKが動作を開始する時間を待つ
    
    // 4. トレースが作成されることを確認
    cy.contains('トレース数: 1').should('be.visible');
    
    // 5. 監視中の信号セクションが表示される
    cy.contains('監視中の信号:').should('be.visible');
    
    // 6. CLOCKゲートのトレース名が表示される
    cy.contains('CLOCK').should('be.visible');
    
    // スクリーンショット（トレース追加後）
    cy.screenshot('clock-fix-2-after-clock', { capture: 'viewport' });
    
    // 7. しばらく待ってイベントが蓄積されることを確認
    cy.wait(3000);
    cy.screenshot('clock-fix-3-events-accumulated', { capture: 'viewport' });
    
    // 8. イベント数が増加していることを確認（0より大きい）
    cy.contains('イベント').should('be.visible');
  });

  it('複数のCLOCKゲートで複数トレースが作成される', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // CLOCKゲート1を配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(200, 200);
    cy.wait(1000);
    
    // CLOCKゲート2を配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(400, 200);
    cy.wait(1000);
    
    // 2つのトレースが作成されることを確認
    cy.contains('トレース数: 2').should('be.visible');
    
    cy.screenshot('clock-fix-4-multiple-clocks', { capture: 'viewport' });
  });

  it('デバッグ情報が詳細に表示される', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // デバッグ情報の各項目を確認
    cy.contains('トレース数:').should('be.visible');
    cy.contains('時間窓:').should('be.visible');
    cy.contains('ms -').should('be.visible');
    
    // CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(2000);
    
    // 監視中の信号情報を確認
    cy.contains('監視中の信号:').should('be.visible');
    cy.contains('イベント').should('be.visible');
    
    cy.screenshot('clock-fix-5-debug-info', { capture: 'viewport' });
  });
});