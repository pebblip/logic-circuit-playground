describe('Measure Grid and Buttons', () => {
  it('should measure grid and button positions', () => {
    cy.viewport(1600, 900);
    cy.visit('/');
    
    cy.wait(500);
    
    // 実行ボタンを強調表示
    cy.get('.header-actions .button.primary').then($btn => {
      $btn.css('background', 'red');
      $btn.css('border', '2px solid yellow');
    });
    
    // 画面幅全体のスクリーンショット
    cy.screenshot('full-width-check', { 
      capture: 'viewport',
      overwrite: true,
      clip: { x: 0, y: 0, width: 1600, height: 100 }
    });
    
    // コンソールログに寸法を出力
    cy.window().then((win) => {
      const container = win.document.querySelector('.app-container');
      const header = win.document.querySelector('.header');
      const execBtn = win.document.querySelector('.header-actions .button.primary');
      
      console.log('=== Grid Layout Debug ===');
      console.log('Viewport width:', win.innerWidth);
      console.log('Container width:', container.getBoundingClientRect().width);
      console.log('Grid columns:', win.getComputedStyle(container).gridTemplateColumns);
      console.log('Header width:', header.getBoundingClientRect().width);
      console.log('Execute button right edge:', execBtn.getBoundingClientRect().right);
      console.log('Distance from right edge:', win.innerWidth - execBtn.getBoundingClientRect().right);
    });
  });
});