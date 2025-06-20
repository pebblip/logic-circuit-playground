describe('パズルモード統合テスト', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('パズルモードに切り替えできる', () => {
    // パズルモードボタンをクリック
    cy.get('[data-testid="mode-selector-puzzle"]').click();
    
    // パズルモードがアクティブになっていることを確認
    cy.get('[data-testid="mode-selector-puzzle"]').should('have.class', 'active');
    
    // パズルパネルが表示されていることを確認
    cy.get('.puzzle-panel').should('be.visible');
    
    // パズル一覧が表示されていることを確認
    cy.get('[data-testid="puzzle-panel-title"]').should('be.visible');
    cy.get('[data-testid="puzzle-panel-description"]').should('be.visible');
  });

  it('パズルを選択して詳細を表示できる', () => {
    // パズルモードに切り替え
    cy.get('[data-testid="mode-selector-puzzle"]').click();
    
    // 初級パズルが表示されていることを確認
    cy.get('[data-testid="difficulty-label-beginner"]').should('be.visible');
    
    // 最初のパズルをクリック
    cy.get('.puzzle-card').first().click();
    
    // パズル詳細が表示されていることを確認
    cy.get('.puzzle-detail').should('be.visible');
    cy.get('[data-testid="constraints-title"]').should('be.visible');
    cy.get('[data-testid="test-cases-title"]').should('be.visible');
    cy.get('[data-testid="learning-objectives-title"]').should('be.visible');
    
    // 戻るボタンが機能することを確認
    cy.get('[data-testid="puzzle-back-button"]').click();
    cy.get('.puzzle-list').should('be.visible');
  });

  it('ツールパレットが非表示になっている', () => {
    // パズルモードに切り替え
    cy.get('[data-testid="mode-selector-puzzle"]').click();
    
    // ツールパレット（左サイドバー）が非表示であることを確認
    cy.get('.sidebar-left').should('not.exist');
  });

  it('フリーモードに戻れる', () => {
    // パズルモードに切り替え
    cy.get('[data-testid="mode-selector-puzzle"]').click();
    
    // パズルパネルが表示されている
    cy.get('.puzzle-panel').should('be.visible');
    
    // フリーモードに戻る
    cy.get('[data-testid="mode-selector-free"]').click();
    
    // フリーモードがアクティブになっている
    cy.get('[data-testid="mode-selector-free"]').should('have.class', 'active');
    
    // パズルパネルが非表示になっている
    cy.get('.puzzle-panel').should('not.exist');
    
    // ツールパレットが再表示されている
    cy.get('.sidebar-left').should('be.visible');
  });
});