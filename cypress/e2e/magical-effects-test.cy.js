describe('Magical Effects Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should show signal particles in active wires', () => {
    // INPUTゲートを配置
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(500);
    
    // NOTゲートを配置
    cy.get('[data-gate-type="NOT"]').click();
    cy.wait(500);
    
    // INPUTゲートをダブルクリックしてONにする
    cy.get('[data-gate-id]').first().dblclick();
    cy.wait(500);
    
    // 信号パーティクルが表示されることを確認
    cy.get('.signal-particle').should('exist');
    cy.get('.signal-particle-glow').should('exist');
  });

  it('should show pulse effects when gate outputs change', () => {
    // INPUTゲートを配置
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(500);
    
    // INPUTゲートをダブルクリック
    cy.get('[data-gate-id]').first().dblclick();
    cy.wait(1000);
    
    // パルスエフェクトの要素が存在することを確認
    cy.get('.gate-pulse-effects').should('exist');
  });

  it('should show celebration effect when lesson is completed', () => {
    // 学習モードを開く
    cy.contains('学習モード').click();
    cy.wait(500);
    
    // NOTゲートレッスンを開始
    cy.contains('NOTゲート').click();
    cy.wait(500);
    
    // レッスンを最後まで進める（手動で数回クリック）
    for (let i = 0; i < 5; i++) {
      cy.contains('button', '進む').click();
      cy.wait(1000);
    }
    
    // お祝いエフェクトが表示されることを確認
    cy.get('[style*="position: fixed"]').should('contain', '🎉 素晴らしい！ 🎉');
  });

  it('should have beautiful visual effects', () => {
    // 複数のゲートを配置して美しい回路を作成
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(200);
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(200);
    cy.get('[data-gate-type="AND"]').click();
    cy.wait(200);
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.wait(500);
    
    // INPUTゲートをONにして信号を流す
    cy.get('[data-gate-id]').first().dblclick();
    cy.wait(200);
    cy.get('[data-gate-id]').eq(1).dblclick();
    cy.wait(1000);
    
    // 美しいエフェクトが表示されることを確認
    cy.get('.wire.active').should('exist');
    cy.get('.pin.active').should('exist');
    
    // グロー効果が適用されていることを確認
    cy.get('.wire.active').should('have.css', 'filter');
  });
});