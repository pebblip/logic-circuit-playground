describe('タイミングチャート修正確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('修正が成功したかを確認', () => {
    // 1. ボタンが重ならず右下にある
    cy.get('.timing-chart-toggle-button')
      .should('be.visible')
      .should('contain', 'タイミングチャート');
    
    // 2. パネルを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // 3. 大きなパネルが表示される
    cy.get('.timing-chart-main-panel').should('be.visible');
    
    // 4. ヘッダーが表示される
    cy.get('.timing-chart-header').should('be.visible');
    cy.contains('タイミングチャート').should('be.visible');
    
    // 5. 波形キャンバスが表示される
    cy.get('.waveform-canvas').should('be.visible');
    cy.get('.waveform-canvas canvas').should('be.visible');
    
    // 6. 使い方ガイドが表示される
    cy.get('.usage-guide').should('be.visible');
    
    // スクリーンショット
    cy.screenshot('timing-chart-verification-success', { capture: 'viewport' });
  });

  it('コンテンツが実際に見える', () => {
    // タイミングチャートを開く
    cy.get('.timing-chart-toggle-button').click();
    cy.wait(500);
    
    // コンテンツエリアが見える
    cy.get('.timing-chart-content').should('be.visible');
    
    // 波形エリアが見える
    cy.get('.timing-chart-waveforms').should('be.visible');
    
    // Canvas要素が見える
    cy.get('canvas').should('be.visible');
    
    // 使い方ガイドのテキストが見える
    cy.contains('タイミングチャートの使い方').should('be.visible');
    cy.contains('左のツールパレットからゲート').should('be.visible');
    
    cy.screenshot('timing-chart-verification-content', { capture: 'viewport' });
  });
});