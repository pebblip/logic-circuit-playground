describe('Improved CLOCK Gate Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.wait(500);
  });

  it('should show clean CLOCK gate by default', () => {
    // CLOCKゲートを追加
    cy.contains('.tool-card', 'CLOCK').click();
    cy.get('.canvas').click(400, 300);
    cy.wait(500);
    
    // 周波数表示は非表示（ごちゃごちゃしない）
    cy.get('.gate-container').within(() => {
      cy.contains('Hz').should('not.exist');
    });
    
    // 時計アイコンのみ表示
    cy.get('.gate-container').within(() => {
      cy.contains('⏰').should('exist');
    });
    
    cy.screenshot('clean-clock-gate');
  });

  it('should show frequency on hover', () => {
    // CLOCKゲートを追加
    cy.contains('.tool-card', 'CLOCK').click();
    cy.get('.canvas').click(400, 300);
    cy.wait(500);
    
    // ホバーで周波数表示
    cy.get('.gate-container').trigger('mouseover');
    cy.wait(100);
    
    cy.get('.gate-container').within(() => {
      cy.contains('1Hz').should('exist');
      cy.contains('右クリックで変更').should('exist');
    });
    
    cy.screenshot('clock-hover-frequency');
    
    // ホバーアウトで非表示
    cy.get('.gate-container').trigger('mouseout');
    cy.wait(100);
    
    cy.get('.gate-container').within(() => {
      cy.contains('Hz').should('not.exist');
    });
  });

  it('should show frequency menu on right click', () => {
    // CLOCKゲートを追加
    cy.contains('.tool-card', 'CLOCK').click();
    cy.get('.canvas').click(400, 300);
    cy.wait(500);
    
    // 右クリックでメニュー表示
    cy.get('.gate-container').rightclick();
    cy.wait(100);
    
    // メニュー項目を確認
    cy.contains('1Hz').should('exist');
    cy.contains('2Hz').should('exist');
    cy.contains('10Hz').should('exist');
    
    cy.screenshot('clock-frequency-menu');
    
    // 2Hzを選択
    cy.contains('2Hz').click({ force: true });
    cy.wait(200);
    
    // メニューが閉じて、ホバーで2Hzと表示されることを確認
    cy.get('.gate-container').trigger('mouseover');
    cy.wait(100);
    
    cy.get('.gate-container').within(() => {
      cy.contains('2Hz').should('exist');
    });
    
    cy.screenshot('clock-changed-to-2hz');
  });
});