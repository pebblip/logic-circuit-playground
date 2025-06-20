/// <reference types="cypress" />

describe('Gate Placement Test', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('should place INPUT gate successfully', () => {
    // INPUTゲートを配置
    cy.get('[data-testid="INPUT-button"]').click();
    cy.wait(1000);
    
    // 選択状態を確認
    cy.get('[data-testid="INPUT-button"]').should('have.class', 'selected');
    
    // キャンバスをクリック
    cy.get('[data-testid="canvas"]').click(300, 200, { force: true });
    cy.wait(2000);
    
    // SVG内に何らかの要素が追加されたことを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      cy.get('*').should('have.length.greaterThan', 0);
      // INPUTゲートの特徴的な要素を探す
      cy.get('circle').should('exist'); // INPUTゲートの丸い形状
    });
    
    cy.screenshot('input-gate-placed');
  });

  it('should test canvas SVG structure', () => {
    // SVGキャンバスの基本構造を確認
    cy.get('svg[data-testid="canvas"]').should('exist');
    cy.get('svg[data-testid="canvas"]').should('be.visible');
    
    // キャンバスの属性を確認
    cy.get('svg[data-testid="canvas"]').then($svg => {
      const svg = $svg[0];
      expect(svg.tagName.toLowerCase()).to.equal('svg');
      cy.log('SVG viewBox:', svg.getAttribute('viewBox'));
      cy.log('SVG dimensions:', `${svg.getAttribute('width')} x ${svg.getAttribute('height')}`);
    });
  });

  it('should place BINARY_COUNTER after successful INPUT placement', () => {
    // まずINPUTゲートが配置できることを確認
    cy.get('[data-testid="INPUT-button"]').click();
    cy.wait(1000);
    cy.get('[data-testid="canvas"]').click(200, 200, { force: true });
    cy.wait(2000);
    
    // INPUTが配置されたことを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      cy.get('circle').should('exist');
    });
    
    // 次にBINARY_COUNTERを配置
    cy.get('[data-testid="BINARY_COUNTER-button"]').click();
    cy.wait(1000);
    cy.get('[data-testid="BINARY_COUNTER-button"]').should('have.class', 'selected');
    
    cy.get('[data-testid="canvas"]').click(400, 300, { force: true });
    cy.wait(3000);
    
    // BINARY_COUNTERが配置されたことを確認
    cy.get('svg[data-testid="canvas"]').within(() => {
      // BINARY_COUNTERの特徴的な要素を探す
      cy.get('rect[width="120"]').should('exist'); // BINARY_COUNTERの四角い形状
      
      // testid要素が存在するか確認
      cy.get('[data-testid="counter-label"]', { timeout: 5000 }).should('exist');
      cy.get('[data-testid="counter-bit-label"]', { timeout: 5000 }).should('exist');
      cy.get('[data-testid="counter-value"]', { timeout: 5000 }).should('exist');
    });
    
    cy.screenshot('binary-counter-placed');
  });
});