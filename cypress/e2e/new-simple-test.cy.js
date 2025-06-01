describe('New Simple Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show basic UI elements', () => {
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
    
    // キャンバスの確認
    cy.get('.canvas').should('be.visible');
    
    // プロパティパネルの確認
    cy.get('.property-panel').should('be.visible');
    cy.contains('プロパティ').should('be.visible');
  });

  it('should manually add gates using store', () => {
    // ストアを直接操作してゲートを追加
    cy.window().then((win) => {
      // @ts-ignore
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('AND', { x: 400, y: 300 });
        store.addGate('INPUT', { x: 200, y: 250 });
        store.addGate('INPUT', { x: 200, y: 350 });
        store.addGate('OUTPUT', { x: 600, y: 300 });
      }
    });
    
    // ゲートが表示されることを確認
    cy.get('.canvas').find('text').contains('AND').should('exist');
    cy.get('.switch-track').should('have.length', 2);
    cy.contains('💡').should('exist');
  });

  it('should select gate and show properties', () => {
    // ゲートを追加
    cy.window().then((win) => {
      // @ts-ignore
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('XOR', { x: 400, y: 300 });
      }
    });
    
    // ゲートをクリックして選択
    cy.get('.canvas').find('text').contains('XOR').parent().click();
    
    // プロパティパネルに情報が表示されることを確認
    cy.contains('選択中: XOR ゲート').should('be.visible');
    cy.contains('真理値表').should('be.visible');
  });
});