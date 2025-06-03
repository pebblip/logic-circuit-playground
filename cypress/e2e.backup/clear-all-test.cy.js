describe('Clear All機能テスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('Clear Allボタンですべての回路を削除できる', () => {
    // 1. いくつかゲートを配置
    cy.get('[data-gate-type="AND"]').click();
    cy.get('svg.canvas').click(300, 200);
    
    cy.get('[data-gate-type="OR"]').click();
    cy.get('svg.canvas').click(500, 200);
    
    cy.get('[data-gate-type="NOT"]').click();
    cy.get('svg.canvas').click(400, 400);
    
    cy.wait(500);
    
    // 2. ゲートが配置されていることを確認
    cy.get('[data-gate-id]').should('have.length', 3);
    cy.screenshot('gates-placed');
    
    // 3. Clear Allボタンをクリック
    cy.get('button[title="すべてクリア"]').click();
    
    // 4. 確認ダイアログでOKを押す
    cy.on('window:confirm', () => true);
    
    cy.wait(500);
    
    // 5. すべてのゲートが削除されたことを確認
    cy.get('[data-gate-id]').should('have.length', 0);
    cy.screenshot('gates-cleared');
  });

  it('Clear Allをキャンセルした場合、ゲートは削除されない', () => {
    // 1. ゲートを配置
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(300, 300);
    
    cy.wait(500);
    cy.get('[data-gate-id]').should('have.length', 1);
    
    // 2. Clear Allボタンをクリック
    cy.get('button[title="すべてクリア"]').click();
    
    // 3. 確認ダイアログでキャンセルを押す
    cy.on('window:confirm', () => false);
    
    cy.wait(500);
    
    // 4. ゲートが削除されていないことを確認
    cy.get('[data-gate-id]').should('have.length', 1);
  });
});