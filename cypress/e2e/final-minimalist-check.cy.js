describe('Minimalist CircuitVisualizerPanel - Final Check', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('should verify new minimalist design is implemented', () => {
    // ゲートを配置
    cy.get('[data-testid="gate-AND"]').click();
    cy.get('svg.canvas').click(300, 200, { force: true });
    
    // ビジュアライザーを開く
    cy.get('button[title="ビジュアライザーを開く"]').click({ force: true });
    
    // 新しいミニマリストデザインのクラスが適用されている
    cy.get('.circuit-analyzer-compact').should('be.visible');
    cy.get('.compact-header').should('be.visible');
    cy.get('.compact-content').should('be.visible');
    cy.get('.close-compact').should('be.visible');
    
    // コンパクトビューが高さ制限されている
    cy.get('.circuit-analyzer-compact').should('have.css', 'max-height', '200px');
    
    // グラデーション背景やスタイリングが適用されている
    cy.get('.circuit-analyzer-compact').should('have.css', 'border-radius');
    cy.get('.circuit-analyzer-compact').should('have.css', 'backdrop-filter', 'blur(10px)');
    
    // 閉じるボタンが機能する
    cy.get('.close-compact').click();
    cy.get('.circuit-analyzer-compact').should('not.exist');
  });

  it('should show beautiful minimalist styling', () => {
    // ゲートを配置してビジュアライザーを開く
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('svg.canvas').click(200, 150, { force: true });
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('svg.canvas').click(400, 150, { force: true });
    
    cy.get('button[title="ビジュアライザーを開く"]').click({ force: true });
    
    // 美しいデザインの確認
    cy.get('.circuit-analyzer-compact').within(() => {
      // ヘッダーのスタイリング
      cy.get('.compact-header').should('have.css', 'background', 'rgba(255, 255, 255, 0.02)');
      
      // 解析アイコンとタイトルが表示されている
      cy.get('.compact-title').should('contain', '解析');
      cy.get('.compact-icon').should('contain', '🔬');
      
      // クローズボタンのスタイリング
      cy.get('.close-compact').should('have.css', 'border-radius');
    });
    
    // スクリーンショットを撮って美しいデザインを記録
    cy.screenshot('minimalist-design-final');
  });
});