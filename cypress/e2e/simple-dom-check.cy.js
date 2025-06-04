describe('シンプルなDOM確認', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000);
  });

  it('基本的なDOM要素を確認', () => {
    // 自由制作モードに切り替え
    cy.contains('自由制作').click();
    cy.wait(500);
    
    // スクリーンショット撮影
    cy.screenshot('simple-dom-check');
    
    // bodyの中身をすべて出力
    cy.get('body').then(($body) => {
      cy.log('=== BODY HTML ===');
      cy.log($body.html());
    });
    
    // canvas-toolbarを探す
    cy.get('body').find('.canvas-toolbar').then(($toolbars) => {
      cy.log('=== CANVAS TOOLBAR COUNT ===');
      cy.log('Found toolbars:', $toolbars.length);
      
      if ($toolbars.length > 0) {
        $toolbars.each((index, toolbar) => {
          cy.log('Toolbar ' + index + ':', toolbar.outerHTML);
        });
      }
    });
  });
});