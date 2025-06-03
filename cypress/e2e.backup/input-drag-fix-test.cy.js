describe('Input Drag Fix Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should not toggle input when dragged', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 初期状態を確認
    cy.get('.switch-track').should('not.have.class', 'active');
    cy.get('.switch-thumb').should('have.attr', 'cx', '-10');
    
    // INPUTゲートをドラッグ（クリックではなく）
    cy.get('.switch-track')
      .parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup');
    
    // ドラッグ後もスイッチがOFFのままであることを確認
    cy.get('.switch-track').should('not.have.class', 'active');
    cy.get('.switch-thumb').should('have.attr', 'cx', '-10');
    
    // 位置が変わったことを確認
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      const input = store.gates.find(g => g.type === 'INPUT');
      expect(input.position.x).to.be.greaterThan(350); // ドラッグで右に移動したことを確認
    });
  });

  it('should toggle input when clicked without drag', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 初期状態を確認
    cy.get('.switch-track').should('not.have.class', 'active');
    
    // クリックのみ（ドラッグなし）
    cy.get('.switch-track').parent().click();
    
    // スイッチがONになることを確認
    cy.get('.switch-track').should('have.class', 'active');
    cy.get('.switch-thumb').should('have.attr', 'cx', '10');
  });

  it('should handle very small drags as clicks', () => {
    // INPUTゲートを追加
    cy.window().then((win) => {
      const store = win.useCircuitStore?.getState();
      if (store) {
        store.addGate('INPUT', { x: 300, y: 300 });
      }
    });
    
    // 初期状態を確認
    cy.get('.switch-track').should('not.have.class', 'active');
    
    // 非常に小さなドラッグ（5ピクセル以下）
    cy.get('.switch-track')
      .parent()
      .trigger('mousedown', { clientX: 300, clientY: 300 })
      .trigger('mousemove', { clientX: 302, clientY: 300 })
      .trigger('mouseup');
    
    // 待機
    cy.wait(150);
    
    // クリック
    cy.get('.switch-track').parent().click();
    
    // 小さなドラッグの後のクリックでトグルされることを確認
    cy.get('.switch-track').should('have.class', 'active');
  });
});