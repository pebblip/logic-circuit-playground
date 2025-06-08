// SVG図表システムの簡易テスト
// モード切り替えを使わずに、直接学習モードでテスト

describe('SVG Diagram System - Simple Test', () => {
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
    cy.wait(2000); // アプリの完全な読み込みを待つ
  });

  it('should show the demo lesson in the lesson list', () => {
    // レッスンリストが表示されることを確認
    cy.get('.lesson-panel').should('be.visible');
    
    // デモレッスンが存在することを確認
    cy.contains('図表表示の新しい方法').should('exist');
    
    // スクリーンショットを撮影
    cy.screenshot('svg-diagram-demo/00-lesson-list', {
      capture: 'viewport'
    });
  });

  it('should open and display SVG diagrams correctly', () => {
    // デモレッスンをクリック
    cy.contains('図表表示の新しい方法').click();
    cy.wait(500);
    
    // レッスン開始ボタンをクリック
    cy.contains('レッスンを開始').click();
    cy.wait(1000);
    
    // SVG要素が存在することを確認
    cy.get('svg.circuit-diagram').should('exist');
    
    // スクリーンショットを撮影
    cy.screenshot('svg-diagram-demo/01-comparison', {
      capture: 'viewport'
    });
    
    // 次のステップへ進む
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 信号フロー図のスクリーンショット
    cy.screenshot('svg-diagram-demo/02-signal-flow', {
      capture: 'viewport'
    });
    
    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 接続図のスクリーンショット
    cy.screenshot('svg-diagram-demo/03-connection', {
      capture: 'viewport'
    });
    
    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);
    
    // 真理値表のスクリーンショット
    cy.get('.truth-table').should('exist');
    cy.screenshot('svg-diagram-demo/04-truth-table', {
      capture: 'viewport'
    });
    
    // 次のステップへ
    cy.contains('次へ').click();
    cy.wait(500);
    
    // カスタムSVGのスクリーンショット
    cy.screenshot('svg-diagram-demo/05-custom-svg', {
      capture: 'viewport'
    });
  });

  it('should render SVG elements without distortion', () => {
    // デモレッスンを開く
    cy.contains('図表表示の新しい方法').click();
    cy.contains('レッスンを開始').click();
    cy.wait(1000);
    
    // SVG要素の品質をチェック
    cy.get('svg.circuit-diagram').then(($svg) => {
      // SVGがviewBoxを持つことを確認
      expect($svg.attr('viewBox')).to.exist;
      
      // SVG内のテキストが読みやすいことを確認
      cy.wrap($svg).find('text').should('be.visible');
    });
    
    // 各種図表要素が正しくレンダリングされることを確認
    cy.get('.circuit-diagram-container').should('exist');
    cy.get('.diagram-content').should('exist');
    
    // CSSが正しく適用されていることを確認
    cy.get('.circuit-diagram-container').should('have.css', 'background-color');
    cy.get('.circuit-diagram-container').should('have.css', 'border-radius');
  });
});