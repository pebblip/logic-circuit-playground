describe('Grid Layout Debug Test', () => {
  it('should debug the grid layout structure', () => {
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
    
    // #rootの情報を確認
    cy.get('#root').then($root => {
      const rect = $root[0].getBoundingClientRect();
      const computed = window.getComputedStyle($root[0]);
      
      const rootInfo = {
        width: rect.width,
        height: rect.height,
        overflow: computed.overflow,
        overflowX: computed.overflowX,
        overflowY: computed.overflowY
      };
      
      // Root情報を表示
      const rootDiv = document.createElement('div');
      rootDiv.style.cssText = 'position: fixed; top: 10px; left: 10px; background: yellow; color: black; padding: 10px; z-index: 10000; font-size: 12px;';
      rootDiv.innerHTML = '<h3>#root Debug</h3><pre>' + JSON.stringify(rootInfo, null, 2) + '</pre>';
      document.body.appendChild(rootDiv);
    });
    
    // すべての子要素の位置を確認
    cy.get('.app-container').then($container => {
      const containerRect = $container[0].getBoundingClientRect();
      const containerComputed = window.getComputedStyle($container[0]);
      
      // 各グリッドアイテムの情報を収集
      const gridItems = [];
      $container.children().each((index, child) => {
        const rect = child.getBoundingClientRect();
        const computed = window.getComputedStyle(child);
        gridItems.push({
          class: child.className,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          gridColumn: computed.gridColumn,
          display: computed.display,
          visibility: computed.visibility
        });
      });
      
      const gridInfo = {
        container: {
          width: Math.round(containerRect.width),
          gridTemplateColumns: containerComputed.gridTemplateColumns,
          actualColumnWidths: containerComputed.gridTemplateColumns.split(' ').map(w => w),
          overflow: containerComputed.overflow
        },
        items: gridItems
      };
      
      // グリッド情報を表示
      const gridDiv = document.createElement('div');
      gridDiv.style.cssText = 'position: fixed; top: 150px; left: 10px; background: lime; color: black; padding: 10px; z-index: 10000; font-size: 12px; max-width: 500px;';
      gridDiv.innerHTML = '<h3>Grid Debug</h3><pre>' + JSON.stringify(gridInfo, null, 2) + '</pre>';
      document.body.appendChild(gridDiv);
    });
    
    // 右サイドバーを赤い枠で強調
    cy.get('.sidebar-right').then($sidebar => {
      $sidebar.css({
        'outline': '5px solid red',
        'outline-offset': '-5px',
        'background': 'rgba(255, 0, 0, 0.3)'
      });
    });
    
    // PropertyPanelの存在を確認
    cy.get('.property-group').then($groups => {
      const panelInfo = {
        propertyGroupCount: $groups.length,
        firstGroupText: $groups.first().text().substring(0, 50)
      };
      
      const panelDiv = document.createElement('div');
      panelDiv.style.cssText = 'position: fixed; bottom: 10px; left: 10px; background: cyan; color: black; padding: 10px; z-index: 10000; font-size: 12px;';
      panelDiv.innerHTML = '<h3>PropertyPanel</h3><pre>' + JSON.stringify(panelInfo, null, 2) + '</pre>';
      document.body.appendChild(panelDiv);
    });
    
    // スクリーンショット
    cy.screenshot('grid-debug-test', {
      capture: 'viewport',
      overwrite: true
    });
  });
});