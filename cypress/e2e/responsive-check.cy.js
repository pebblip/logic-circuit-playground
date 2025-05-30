/**
 * レスポンシブデザイン確認用テスト
 */

describe('レスポンシブデザイン確認', () => {
  const viewports = [
    { name: 'mobile-portrait', width: 375, height: 667 },
    { name: 'mobile-landscape', width: 667, height: 375 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    it(`${viewport.name}での表示確認`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/');
      
      // 初回起動モーダルをスキップ
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("スキップ")').length > 0) {
          cy.contains('button', 'スキップ').click({ force: true });
        }
      });
      
      cy.wait(1000);
      cy.screenshot(`responsive-${viewport.name}`, {
        capture: 'fullPage',
        overwrite: true
      });
    });
  });

  it('モバイルでの操作性確認', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // 初回起動モーダルをスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("スキップ")').length > 0) {
        cy.contains('button', 'スキップ').click({ force: true });
      }
    });
    
    cy.wait(1000);
    
    // モバイルでの要素の可視性確認
    cy.get('[data-testid="mode-btn-learning"]').should('be.visible');
    
    // サイドパネルの表示確認
    cy.get('aside').then($aside => {
      if ($aside.length > 0) {
        const width = $aside.width();
        cy.log(`サイドパネル幅: ${width}px`);
        
        // モバイルでは320pxは広すぎる可能性
        if (width >= 320) {
          cy.log('⚠️ モバイルには広すぎる可能性があります');
        }
      }
    });
    
    cy.screenshot('mobile-iphone-x', {
      capture: 'fullPage',
      overwrite: true
    });
  });
});