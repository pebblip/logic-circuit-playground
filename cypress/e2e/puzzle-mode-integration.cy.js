describe('パズルモード統合テスト', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('パズルモードに切り替えできる', () => {
    // パズルモードボタンをクリック
    cy.contains('button', 'パズルモード').click();
    
    // パズルモードがアクティブになっていることを確認
    cy.contains('button', 'パズルモード').should('have.class', 'active');
    
    // パズルパネルが表示されていることを確認
    cy.get('.puzzle-panel').should('be.visible');
    
    // パズル一覧が表示されていることを確認
    cy.contains('🧩 パズル・チャレンジ').should('be.visible');
    cy.contains('制約条件の中で目標回路を作成してください').should('be.visible');
  });

  it('パズルを選択して詳細を表示できる', () => {
    // パズルモードに切り替え
    cy.contains('button', 'パズルモード').click();
    
    // 初級パズルが表示されていることを確認
    cy.contains('🟢 初級').should('be.visible');
    
    // 最初のパズルをクリック
    cy.get('.puzzle-card').first().click();
    
    // パズル詳細が表示されていることを確認
    cy.get('.puzzle-detail').should('be.visible');
    cy.contains('📋 制約条件').should('be.visible');
    cy.contains('🧪 テストケース').should('be.visible');
    cy.contains('🎯 学習目標').should('be.visible');
    
    // 戻るボタンが機能することを確認
    cy.contains('button', '← 戻る').click();
    cy.get('.puzzle-list').should('be.visible');
  });

  it('ツールパレットが非表示になっている', () => {
    // パズルモードに切り替え
    cy.contains('button', 'パズルモード').click();
    
    // ツールパレット（左サイドバー）が非表示であることを確認
    cy.get('.sidebar-left').should('not.exist');
  });

  it('フリーモードに戻れる', () => {
    // パズルモードに切り替え
    cy.contains('button', 'パズルモード').click();
    
    // パズルパネルが表示されている
    cy.get('.puzzle-panel').should('be.visible');
    
    // フリーモードに戻る
    cy.contains('button', 'フリーモード').click();
    
    // フリーモードがアクティブになっている
    cy.contains('button', 'フリーモード').should('have.class', 'active');
    
    // パズルパネルが非表示になっている
    cy.get('.puzzle-panel').should('not.exist');
    
    // ツールパレットが再表示されている
    cy.get('.sidebar-left').should('be.visible');
  });
});