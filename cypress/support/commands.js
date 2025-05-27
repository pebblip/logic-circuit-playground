// ***********************************************
// カスタムコマンドを定義
// 実装に依存しない再利用可能なアクション
// ***********************************************

// ゲートを配置するコマンド
Cypress.Commands.add('placeGate', (gateType, x, y) => {
  // ゲートタイプを選択
  cy.contains('button', gateType).click();
  
  // キャンバス上の指定位置をクリック
  cy.get('svg').click(x, y);
});

// モードを切り替えるコマンド
Cypress.Commands.add('switchMode', (mode) => {
  const modeText = mode === 'place' ? '配置モード' : '接続モード';
  cy.contains('button', modeText).click();
});

// ワイヤーを接続するコマンド（実装に依存しない方法）
Cypress.Commands.add('connectWire', (fromGate, fromTerminal, toGate, toTerminal) => {
  // 出力端子から入力端子へドラッグ
  cy.get('svg').within(() => {
    // 出力端子を見つける
    const fromSelector = fromTerminal === 'output' ? 'circle:last' : 'circle:first';
    cy.contains('text', fromGate).parent()
      .find(fromSelector)
      .trigger('mousedown', { button: 0 });
    
    // 入力端子を見つける
    const toSelector = toTerminal === 'input' ? 'circle:first' : 'circle:last';
    cy.contains('text', toGate).parent()
      .find(toSelector)
      .trigger('mouseup', { button: 0 });
  });
});

// ゲートが存在することを確認
Cypress.Commands.add('assertGateExists', (gateType, count = 1) => {
  cy.get('svg').within(() => {
    cy.get('text:contains("' + gateType + '")').should('have.length', count);
  });
});

// 接続線が存在することを確認
Cypress.Commands.add('assertConnectionExists', (count = 1) => {
  if (count === 0) {
    cy.get('svg').within(() => {
      cy.get('line').should('not.exist');
    });
  } else {
    cy.get('svg').within(() => {
      // 破線でない実線の接続線をカウント
      cy.get('line').not('[stroke-dasharray]').should('have.length', count);
    });
  }
});

// INPUTゲートの値を切り替え
Cypress.Commands.add('toggleInput', (inputIndex = 0) => {
  cy.get('svg').within(() => {
    cy.get('text:contains("INPUT")').eq(inputIndex).parent()
      .find('rect').click({ force: true });
  });
});

// ゲートの状態（アクティブ/非アクティブ）を確認
Cypress.Commands.add('assertGateState', (gateType, index, isActive) => {
  const expectedColor = isActive ? '#10b981' : '#6b7280';
  
  cy.get('svg').within(() => {
    cy.get('text:contains("' + gateType + '")').eq(index).parent()
      .find('rect').should('have.attr', 'fill', expectedColor);
  });
});

// キャンバスをクリア（すべてのゲートを削除）
Cypress.Commands.add('clearCanvas', () => {
  cy.get('svg').within(() => {
    // すべてのゲートを右クリックで削除
    cy.get('rect').each(($rect) => {
      cy.wrap($rect).rightclick();
    });
  });
});

// ドラッグでゲートを移動（改善版）
Cypress.Commands.add('dragGate', (gateType, index, deltaX, deltaY) => {
  cy.get('svg').then($svg => {
    const svg = $svg[0];
    const svgRect = svg.getBoundingClientRect();
    
    cy.get('svg').within(() => {
      cy.contains('text', gateType).eq(index).parent()
        .find('rect')
        .then($rect => {
          const rect = $rect[0].getBoundingClientRect();
          const startX = rect.left + rect.width / 2;
          const startY = rect.top + rect.height / 2;
          const endX = startX + deltaX;
          const endY = startY + deltaY;
          
          cy.wrap($rect)
            .trigger('mousedown', { 
              button: 0,
              clientX: startX,
              clientY: startY,
              bubbles: true,
              view: window
            })
            .wait(50); // 状態更新を待つ
            
          // SVG全体でmousemoveを実行
          cy.get('svg').trigger('mousemove', {
              clientX: endX,
              clientY: endY,
              bubbles: true,
              view: window
            })
            .trigger('mouseup', {
              button: 0,
              clientX: endX,
              clientY: endY,
              bubbles: true,
              view: window
            });
        });
    });
  });
});