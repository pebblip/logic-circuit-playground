describe('New Basic Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show header and tool palette', () => {
    // ヘッダーの確認
    cy.contains('論理回路プレイグラウンド').should('be.visible');
    
    // ツールパレットの確認
    cy.contains('基本ゲート').should('be.visible');
    cy.contains('入出力').should('be.visible');
    
    // ゲートカードの確認
    cy.contains('AND').should('be.visible');
    cy.contains('OR').should('be.visible');
    cy.contains('NOT').should('be.visible');
    cy.contains('INPUT').should('be.visible');
    cy.contains('OUTPUT').should('be.visible');
  });

  it('should place gate on canvas with click', () => {
    // ANDゲートのツールカードをクリック
    cy.contains('.tool-card', 'AND').click();
    
    // ゲートが配置されたことを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
  });

  it('should toggle INPUT gate', () => {
    // INPUTゲートをクリックで配置
    cy.contains('.tool-card', 'INPUT').click();
    
    // INPUTゲートをクリックしてトグル
    cy.get('.switch-track').parent().click();
    cy.get('.switch-track.active').should('exist');
    cy.get('.switch-thumb.active').should('exist');
  });
});