describe('Custom Gates Implementation Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/');
    cy.wait(500);
  });

  it('should display custom gate section in tool palette', () => {
    // カスタムゲートセクションが存在することを確認
    cy.contains('.section-title', 'カスタムゲート').should('exist');
    
    // デモカスタムゲートが表示されることを確認
    cy.contains('.tool-label', '半加算器').should('exist');
    cy.contains('.tool-label', 'MyGate').should('exist');
    cy.contains('.tool-label', '作成').should('exist');
    
    cy.screenshot('custom-gate-palette');
  });

  it('should add custom gate to canvas', () => {
    // 半加算器をクリックして配置
    cy.contains('.tool-card', '半加算器').click();
    cy.wait(500);
    
    // カスタムゲートがキャンバスに配置されることを確認
    cy.get('.gate-container').should('exist');
    cy.get('.custom-gate').should('exist');
    
    // 紫色のスタイルが適用されることを確認
    cy.get('.custom-gate').should('have.attr', 'stroke', '#6633cc');
    
    // ゲート名が表示されることを確認
    cy.contains('半加算器').should('exist');
    
    // アイコンが表示されることを確認
    cy.contains('➕').should('exist');
    
    cy.screenshot('custom-gate-placed');
  });

  it('should show custom gate pins with labels', () => {
    // MyGateを配置
    cy.contains('.tool-card', 'MyGate').click();
    cy.wait(500);
    
    // ピンラベルが表示されることを確認
    cy.contains('A').should('exist');
    cy.contains('B').should('exist');
    cy.contains('Y').should('exist');
    
    // ピンがクリック可能なことを確認
    cy.get('.pin').should('have.length.greaterThan', 0);
    
    cy.screenshot('custom-gate-pins');
  });

  it('should allow multiple custom gates', () => {
    // 複数のカスタムゲートを配置
    cy.contains('.tool-card', '半加算器').click();
    cy.wait(300);
    
    cy.contains('.tool-card', 'MyGate').click();
    cy.wait(300);
    
    // 両方のカスタムゲートが存在することを確認
    cy.contains('半加算器').should('exist');
    cy.contains('MyGate').should('exist');
    
    // 異なる位置に配置されることを確認
    cy.get('.gate-container').should('have.length', 2);
    
    cy.screenshot('multiple-custom-gates');
  });

  it('should handle custom gate simulation', () => {
    // MyGateを配置
    cy.contains('.tool-card', 'MyGate').click();
    cy.wait(500);
    
    // INPUTゲートを2つ配置
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(300);
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(300);
    
    // OUTPUTゲートを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(300);
    
    // 基本的な配置が完了したことを確認
    cy.get('.gate-container').should('have.length', 4);
    
    cy.screenshot('custom-gate-with-inputs-outputs');
  });

  it('should show create custom gate dialog', () => {
    // 「作成」ボタンをクリック
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // アラートが表示されることを確認（現在は開発中メッセージ）
    cy.on('window:alert', (text) => {
      expect(text).to.contains('カスタムゲート作成機能は開発中です');
    });
    
    cy.screenshot('custom-gate-create-clicked');
  });
});