describe('改善されたタイミングチャート', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('タイミングチャートが大きく見やすく表示される', () => {
    // タイミングチャートボタンが目立つ位置にあることを確認
    cy.get('.timing-chart-toggle-button')
      .should('be.visible')
      .should('have.css', 'position', 'fixed')
      .should('have.css', 'right', '20px')
      .should('have.css', 'bottom', '20px');
    
    // ボタンをクリック
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが大きく表示されることを確認
    cy.get('.timing-chart-main-panel')
      .should('be.visible')
      .should('have.css', 'min-height', '400px');
    
    // Canvas要素が表示されることを確認
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // 使い方ガイドが表示されることを確認
    cy.contains('タイミングチャートの使い方').should('be.visible');
    cy.contains('左のツールパレットからゲートをドラッグ').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-improved-1-guide', { capture: 'viewport' });
  });

  it('CLOCKゲートで実際の波形が表示される', () => {
    // CLOCKゲートを配置
    cy.get('.tool-card[data-gate-type="CLOCK"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(500);
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 波形キャンバスが表示されることを確認
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-improved-2-clock', { capture: 'viewport' });
  });

  it('AND回路の波形を確認', () => {
    // ANDゲートを配置
    cy.get('.tool-card[data-gate-type="AND"]').click();
    cy.get('svg[data-testid="canvas"]').click(300, 200);
    cy.wait(300);
    
    // 入力ゲートを2つ配置
    cy.get('.tool-card[data-gate-type="INPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(150, 150);
    cy.wait(300);
    
    cy.get('.tool-card[data-gate-type="INPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(150, 250);
    cy.wait(300);
    
    // 出力ゲートを配置
    cy.get('.tool-card[data-gate-type="OUTPUT"]').click();
    cy.get('svg[data-testid="canvas"]').click(450, 200);
    cy.wait(300);
    
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // パネルが大きく表示されることを確認
    cy.get('.timing-chart-main-panel').should('be.visible');
    cy.get('.waveform-canvas').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-improved-3-and-circuit', { capture: 'viewport' });
  });

  it('トグルボタンのデザインが改善されている', () => {
    // ボタンのスタイルを確認
    cy.get('.timing-chart-toggle-button')
      .should('have.css', 'border', '2px solid rgb(0, 255, 136)')
      .should('have.css', 'color', 'rgb(0, 255, 136)')
      .should('have.css', 'box-shadow');
    
    // ホバー効果を確認
    cy.get('.timing-chart-toggle-button').trigger('mouseover');
    cy.wait(100);
    
    // スクリーンショット
    cy.screenshot('timing-chart-improved-4-button-hover', { capture: 'viewport' });
  });
});