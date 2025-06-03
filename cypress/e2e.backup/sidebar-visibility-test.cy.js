describe('Sidebar Visibility Test', () => {
  it('should check right sidebar visibility and position', () => {
    cy.visit('http://localhost:5173/');
    cy.wait(2000);
    
    // モード選択画面をスキップ
    cy.get('body').then($body => {
      if ($body.text().includes('学習スタイルを選んでください')) {
        cy.contains('学習モード').click();
        cy.wait(1000);
      }
    });
    
    // ビューポートを明示的に設定
    cy.viewport(1920, 1080);
    cy.wait(500);
    
    // 右サイドバーの存在と位置を詳細に確認
    cy.get('.sidebar-right').should('exist').then($sidebar => {
      const rect = $sidebar[0].getBoundingClientRect();
      const computed = window.getComputedStyle($sidebar[0]);
      
      const debugInfo = {
        position: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        },
        computedStyles: {
          display: computed.display,
          visibility: computed.visibility,
          position: computed.position,
          gridColumn: computed.gridColumn,
          gridRow: computed.gridRow,
          width: computed.width,
          minWidth: computed.minWidth,
          maxWidth: computed.maxWidth,
          overflow: computed.overflow
        },
        isVisibleInViewport: rect.right <= window.innerWidth,
        windowWidth: window.innerWidth
      };
      
      // デバッグ情報を画面に表示
      const debugDiv = document.createElement('div');
      debugDiv.style.cssText = 'position: fixed; top: 70px; right: 10px; background: rgba(255,0,255,0.9); color: white; padding: 20px; z-index: 10000; font-size: 14px; max-width: 400px;';
      debugDiv.innerHTML = '<h3>Right Sidebar Debug</h3><pre>' + JSON.stringify(debugInfo, null, 2) + '</pre>';
      document.body.appendChild(debugDiv);
    });
    
    // app-containerの情報も確認
    cy.get('.app-container').then($container => {
      const rect = $container[0].getBoundingClientRect();
      const computed = window.getComputedStyle($container[0]);
      
      const containerInfo = {
        containerWidth: rect.width,
        gridTemplateColumns: computed.gridTemplateColumns,
        gridTemplateRows: computed.gridTemplateRows,
        overflow: computed.overflow,
        display: computed.display
      };
      
      // コンテナ情報も画面に表示
      const containerDiv = document.createElement('div');
      containerDiv.style.cssText = 'position: fixed; top: 400px; right: 10px; background: rgba(0,255,255,0.9); color: black; padding: 20px; z-index: 10000; font-size: 14px; max-width: 400px;';
      containerDiv.innerHTML = '<h3>App Container Debug</h3><pre>' + JSON.stringify(containerInfo, null, 2) + '</pre>';
      document.body.appendChild(containerDiv);
    });
    
    // 一時的に背景色を追加して視覚的に確認
    cy.get('.sidebar-right').then($el => {
      $el.css('background-color', 'rgba(255, 0, 255, 0.5)');
      $el.css('z-index', '9999');
    });
    
    // スクリーンショット
    cy.screenshot('sidebar-visibility-test', {
      capture: 'viewport',
      overwrite: true
    });
  });
});