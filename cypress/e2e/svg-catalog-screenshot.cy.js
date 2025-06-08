// SVG図表カタログのスクリーンショット撮影
// 各図表タイプの表示品質を確認するため

describe('SVG Diagram Catalog Screenshots', () => {
  beforeEach(() => {
    // LocalStorageで学習モードを設定
    cy.window().then((win) => {
      win.localStorage.setItem('circuit-mode', JSON.stringify('learning'));
      win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
        mode: 'learning',
        tutorialCompleted: true,
        skipModeSelection: true
      }));
      win.localStorage.setItem('hasSeenModeSelector', 'true');
    });
    
    cy.visit('/');
    cy.wait(2000);
  });

  it('should capture all diagram types in the catalog', () => {
    // カタログレッスンを探してクリック
    cy.contains('SVG図表カタログ').click();
    cy.wait(500);
    
    // レッスンを開始
    cy.contains('レッスンを開始').click();
    cy.wait(1000);
    
    // 1. ゲート記号
    cy.screenshot('svg-catalog/01-gate-symbols', {
      capture: 'viewport'
    });
    
    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 2. 回路接続図
    cy.screenshot('svg-catalog/02-circuit-connections', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 3. 複合回路（半加算器）
    cy.screenshot('svg-catalog/03-complex-circuits', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 4. 電気回路アナロジー
    cy.screenshot('svg-catalog/04-electrical-analogies', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 5. 信号波形
    cy.screenshot('svg-catalog/05-signal-waveforms', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 6. 真理値表
    cy.screenshot('svg-catalog/06-truth-tables', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 7. ブロック図
    cy.screenshot('svg-catalog/07-block-diagrams', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 8. タイミング図
    cy.screenshot('svg-catalog/08-timing-diagrams', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 9. データフロー図
    cy.screenshot('svg-catalog/09-data-flow', {
      capture: 'viewport'
    });
    
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 10. まとめ
    cy.screenshot('svg-catalog/10-summary', {
      capture: 'viewport'
    });
  });

  it('should test responsive behavior', () => {
    // カタログレッスンを開く
    cy.contains('SVG図表カタログ').click();
    cy.contains('レッスンを開始').click();
    cy.wait(1000);
    
    // デスクトップサイズ
    cy.viewport(1920, 1080);
    cy.screenshot('svg-catalog/responsive-desktop', {
      capture: 'viewport'
    });
    
    // タブレットサイズ
    cy.viewport(768, 1024);
    cy.screenshot('svg-catalog/responsive-tablet', {
      capture: 'viewport'
    });
    
    // モバイルサイズ
    cy.viewport(375, 667);
    cy.screenshot('svg-catalog/responsive-mobile', {
      capture: 'viewport'
    });
  });

  it('should check SVG quality and rendering', () => {
    cy.contains('SVG図表カタログ').click();
    cy.contains('レッスンを開始').click();
    cy.wait(1000);
    
    // SVG要素の存在確認
    cy.get('svg.circuit-diagram').should('exist').and('have.length.greaterThan', 0);
    
    // 各SVG要素の品質チェック
    cy.get('svg.circuit-diagram').each(($svg, index) => {
      // viewBoxが設定されているか
      expect($svg.attr('viewBox')).to.exist;
      
      // テキスト要素が読み取れるか
      cy.wrap($svg).find('text').should('be.visible');
      
      // パスやラインが正しく描画されているか
      cy.wrap($svg).find('path, line, rect, circle').should('exist');
    });
    
    // 特定の要素をズームしてスクリーンショット
    cy.get('.circuit-diagram-container').first().screenshot('svg-catalog/zoom-first-diagram', {
      padding: 20
    });
  });
});