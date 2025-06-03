// 論理回路プレイグラウンド - スモークテスト
// アプリの基本起動と主要UI要素の存在確認のみ

describe('Logic Circuit Playground - Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application and display core UI elements', () => {
    // アプリの基本構造が表示されることを確認
    cy.get('.canvas-container').should('exist').and('be.visible');
    cy.get('svg.canvas').should('exist').and('be.visible');
    cy.get('.tool-palette').should('exist').and('be.visible');
    
    // 基本ゲートが利用可能であることを確認
    cy.get('[data-testid="gate-INPUT"]').should('exist');
    cy.get('[data-testid="gate-OUTPUT"]').should('exist');
    cy.get('[data-testid="gate-AND"]').should('exist');
    cy.get('[data-testid="gate-OR"]').should('exist');
    cy.get('[data-testid="gate-NOT"]').should('exist');
    
    // ヘッダーが表示されることを確認
    cy.get('header').should('exist').and('be.visible');
  });

  it('should respond to basic interactions without crashing', () => {
    // 基本的なクリック操作でクラッシュしないことを確認
    cy.get('[data-testid="gate-INPUT"]').should('be.visible');
    cy.get('[data-testid="canvas"]').should('be.visible').click();
    
    // アプリケーションが依然として動作していることを確認
    cy.get('svg.canvas').should('exist');
    cy.get('.tool-palette').should('exist');
  });
});