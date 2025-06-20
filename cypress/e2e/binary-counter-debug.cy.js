/// <reference types="cypress" />

describe('BINARY_COUNTER Debug', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // アプリの初期化を待つ
  });

  it('should find BINARY_COUNTER button', () => {
    // ツールパレットが表示されているか確認
    cy.get('.tool-palette').should('be.visible');
    
    // BINARY_COUNTERボタンが存在するか確認
    cy.get('[data-testid="BINARY_COUNTER-button"]').should('be.visible');
    
    // スクリーンショット撮影
    cy.screenshot('debug-tool-palette');
  });

  it('should click BINARY_COUNTER button and check selection', () => {
    // BINARY_COUNTERボタンをクリック
    cy.get('[data-testid="BINARY_COUNTER-button"]').click();
    cy.wait(500);
    
    // 選択されたことを確認
    cy.get('[data-testid="BINARY_COUNTER-button"]').should('have.class', 'selected');
    
    // スクリーンショット撮影
    cy.screenshot('debug-button-selected');
  });

  it('should place BINARY_COUNTER gate', () => {
    // BINARY_COUNTERボタンをクリック
    cy.get('[data-testid="BINARY_COUNTER-button"]').click();
    cy.wait(500);
    
    // キャンバスをクリックして配置
    cy.get('[data-testid="canvas"]').click(400, 300, { force: true });
    cy.wait(1000);
    
    // キャンバス全体のスクリーンショット
    cy.screenshot('debug-gate-placed');
    
    // ゲートが存在するかどうか確認（ゆるい条件で）
    cy.get('[data-testid="canvas"]').within(() => {
      // 何らかのSVG要素が存在するか確認
      cy.get('g').should('exist');
      cy.get('rect').should('exist');
    });
  });

  it('should check all gate elements in canvas', () => {
    // BINARY_COUNTERボタンをクリック
    cy.get('[data-testid="BINARY_COUNTER-button"]').click();
    cy.wait(500);
    
    // キャンバスをクリックして配置
    cy.get('[data-testid="canvas"]').click(400, 300, { force: true });
    cy.wait(1000);
    
    // キャンバス内の全要素をログ出力
    cy.get('[data-testid="canvas"]').within(() => {
      cy.get('*').then($elements => {
        console.log('Canvas elements:', $elements.length);
        $elements.each((index, element) => {
          console.log(`Element ${index}:`, element.tagName, element.getAttribute('data-testid'), element.getAttribute('class'));
        });
      });
    });
    
    // text要素を探す
    cy.get('[data-testid="canvas"]').within(() => {
      cy.get('text').then($texts => {
        console.log('Text elements found:', $texts.length);
        $texts.each((index, text) => {
          console.log(`Text ${index}:`, text.textContent, text.getAttribute('data-testid'));
        });
      });
    });
  });
});