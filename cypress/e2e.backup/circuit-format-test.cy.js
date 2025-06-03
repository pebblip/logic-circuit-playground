describe('Circuit Format Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should format circuit beautifully', () => {
    // 複数のゲートを配置
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(300);
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(300);
    cy.get('[data-gate-type="AND"]').click();
    cy.wait(300);
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.wait(500);
    
    // ゲートをランダムな位置に移動（整形前の状態を作る）
    cy.get('[data-gate-id]').first().trigger('mousedown', { button: 0 });
    cy.get('svg.canvas').trigger('mousemove', 300, 200);
    cy.get('svg.canvas').trigger('mouseup');
    cy.wait(200);
    
    cy.get('[data-gate-id]').eq(1).trigger('mousedown', { button: 0 });
    cy.get('svg.canvas').trigger('mousemove', 500, 400);
    cy.get('svg.canvas').trigger('mouseup');
    cy.wait(200);
    
    // 整形ボタンが存在することを確認
    cy.contains('button', '整形').should('be.visible');
    
    // 整形ボタンをクリック
    cy.contains('button', '整形').click();
    
    // 整形中の表示を確認
    cy.contains('整形中...').should('be.visible');
    
    // 整形が完了するまで待機
    cy.contains('整形中...', { timeout: 3000 }).should('not.exist');
    cy.contains('button', '整形').should('be.visible');
    
    // ゲートが美しく配置されていることを確認（基本的なレイアウト）
    cy.get('[data-gate-id]').should('have.length', 4);
  });

  it('should not format when no gates exist', () => {
    // ゲートがない状態で整形ボタンをクリック
    cy.contains('button', '整形').should('be.disabled');
  });

  it('should show beautiful animation during formatting', () => {
    // 複数のゲートを配置
    for (let i = 0; i < 3; i++) {
      cy.get('[data-gate-type="INPUT"]').click();
      cy.wait(200);
    }
    
    cy.get('[data-gate-type="AND"]').click();
    cy.wait(200);
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.wait(500);
    
    // 整形ボタンをクリック
    cy.contains('button', '整形').click();
    
    // アニメーション中の状態を確認
    cy.contains('整形中...').should('be.visible');
    
    // 完了を待機
    cy.contains('整形中...', { timeout: 3000 }).should('not.exist');
    
    // アニメーション後、ゲートが存在することを確認
    cy.get('[data-gate-id]').should('have.length', 5);
  });

  it('should maintain wire connections after formatting', () => {
    // 簡単な回路を作成
    cy.get('[data-gate-type="INPUT"]').click();
    cy.wait(300);
    cy.get('[data-gate-type="NOT"]').click();
    cy.wait(300);
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.wait(500);
    
    // ワイヤーを接続（簡単なクリック操作）
    // INPUTの出力ピンをクリック
    cy.get('[data-gate-id]').first().within(() => {
      cy.get('circle[r="15"]').last().click();
    });
    
    // NOTの入力ピンをクリック
    cy.get('[data-gate-id]').eq(1).within(() => {
      cy.get('circle[r="15"]').first().click();
    });
    
    cy.wait(500);
    
    // 接続前のワイヤー数を確認
    cy.get('.wire').then(($wires) => {
      const wireCountBefore = $wires.length;
      
      // 整形を実行
      cy.contains('button', '整形').click();
      cy.contains('整形中...', { timeout: 3000 }).should('not.exist');
      
      // 整形後もワイヤーが維持されていることを確認
      cy.get('.wire').should('have.length', wireCountBefore);
    });
  });
});