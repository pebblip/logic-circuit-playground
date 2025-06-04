describe('DOM構造の詳細診断', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('キャンバスツールバーのDOM構造を詳しく調査', () => {
    // 自由制作モードに切り替え
    cy.contains('自由制作').click();
    cy.wait(500);
    
    // 1. 全体のレイアウト構造を確認
    cy.get('.app-container').should('exist').then(($appContainer) => {
      cy.log('App container found');
      cy.log('App container HTML:', $appContainer.html());
    });
    
    // 2. main-canvasを探す
    cy.get('.main-canvas').should('exist').then(($mainCanvas) => {
      cy.log('Main canvas found');
      cy.log('Main canvas HTML:', $mainCanvas.html());
      cy.log('Main canvas CSS overflow:', $mainCanvas.css('overflow'));
      cy.log('Main canvas position:', $mainCanvas.css('position'));
    });
    
    // 3. canvas-toolbarが存在するかチェック
    cy.get('body').then(($body) => {
      // すべてのcanvas-toolbarクラスを探す
      const toolbars = $body.find('.canvas-toolbar');
      cy.log('Canvas toolbar count:', toolbars.length);
      
      if (toolbars.length > 0) {
        toolbars.each((index, toolbar) => {
          cy.log(`Toolbar ${index}:`);
          cy.log('HTML:', toolbar.outerHTML);
          cy.log('Computed styles:', window.getComputedStyle(toolbar));
          cy.log('Position:', window.getComputedStyle(toolbar).position);
          cy.log('Display:', window.getComputedStyle(toolbar).display);
          cy.log('Visibility:', window.getComputedStyle(toolbar).visibility);
          cy.log('Opacity:', window.getComputedStyle(toolbar).opacity);
          cy.log('Z-index:', window.getComputedStyle(toolbar).zIndex);
          cy.log('Top:', window.getComputedStyle(toolbar).top);
          cy.log('Left:', window.getComputedStyle(toolbar).left);
        });
      } else {
        cy.log('❌ No canvas-toolbar found in DOM!');
      }
    });
    
    // 4. canvas-containerを探す
    cy.get('.canvas-container').should('exist').then(($canvasContainer) => {
      cy.log('Canvas container found');
      cy.log('Canvas container HTML:', $canvasContainer.html());
    });
    
    // 5. DesktopLayoutコンポーネントの確認
    cy.get('[data-testid="desktop-layout"], .desktop-layout, .app-container > div').then(($layout) => {
      cy.log('Layout structure:', $layout.html());
    });
    
    // 6. スクリーンショット撮影
    cy.screenshot('dom-structure-debug');
    
    // 7. すべてのtool-buttonも確認
    cy.get('body').then(($body) => {
      const buttons = $body.find('.tool-button, button[title="元に戻す"], button[title="やり直し"], button[title="すべてクリア"], button[title="ビジュアライザーを開く"]');
      cy.log('Tool buttons count:', buttons.length);
      
      buttons.each((index, button) => {
        cy.log(`Button ${index}:`, button.outerHTML);
        cy.log('Button visible:', Cypress.$(button).is(':visible'));
        cy.log('Button display:', window.getComputedStyle(button).display);
      });
    });
  });
});