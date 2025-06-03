describe('Ultra Gallery Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should show simple gallery layout', () => {
    // ギャラリーモードをクリック
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // シンプルなヘッダー
    cy.contains('驚きの回路').should('be.visible');
    
    // グリッドレイアウトの確認
    cy.get('.circuit-grid').should('be.visible');
    cy.get('.circuit-tile').should('have.length', 6);
    
    // 各タイルが小さく表示されていることを確認
    cy.get('.circuit-tile').first().then(($tile) => {
      const width = $tile.width();
      const height = $tile.height();
      expect(width).to.be.lessThan(200); // 小さなタイル
      expect(height).to.be.lessThan(200);
    });
  });

  it('should display circuit tiles with icons', () => {
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 各タイルの内容を確認
    cy.contains('.circuit-tile', '7セグ').should('be.visible');
    cy.contains('.circuit-tile', '加算器').should('be.visible');
    cy.contains('.circuit-tile', 'カウンタ').should('be.visible');
    cy.contains('.circuit-tile', 'じゃんけん').should('be.visible');
    
    // アイコンが表示されていることを確認
    cy.get('.tile-icon').should('have.length', 6);
    cy.contains('.tile-icon', '🔢').should('be.visible');
    cy.contains('.tile-icon', '🧮').should('be.visible');
    cy.contains('.tile-icon', '🔄').should('be.visible');
    cy.contains('.tile-icon', '🎮').should('be.visible');
  });

  it('should load circuit when tile is clicked', () => {
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 7セグタイルをクリック
    cy.contains('.circuit-tile', '7セグ').click();
    cy.wait(500);
    
    // 自由制作モードに切り替わることを確認
    cy.get('.mode-tab.active').should('contain', '自由制作');
    
    // 回路が読み込まれることを確認（7セグ用のゲートが配置される）
    cy.get('[data-gate-id]').should('have.length.greaterThan', 0);
  });

  it('should show coming soon for unimplemented circuits', () => {
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 準備中バッジが表示されることを確認
    cy.get('.coming-soon').should('be.visible');
    cy.contains('.coming-soon', '準備中').should('exist');
    
    // 準備中のタイルは無効化されていることを確認
    cy.contains('.circuit-tile', 'スロット').should('have.attr', 'disabled');
    cy.contains('.circuit-tile', 'メロディ').should('have.attr', 'disabled');
  });

  it('should show hint at bottom', () => {
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // ヒントが表示されることを確認
    cy.get('.gallery-hint').should('be.visible');
    cy.contains('💡 ヒント').should('be.visible');
    cy.contains('カウンタは自動で00→01→10→11を繰り返すよ').should('be.visible');
  });

  it('should load binary counter with clock', () => {
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // カウンタタイルをクリック
    cy.contains('.circuit-tile', 'カウンタ').click();
    cy.wait(500);
    
    // CLOCKゲートが存在することを確認
    cy.get('[data-gate-type="CLOCK"]').should('exist');
    
    // D-FFが存在することを確認
    cy.get('[data-gate-type="D-FF"]').should('have.length', 2);
    
    // 出力が存在することを確認
    cy.get('[data-gate-type="OUTPUT"]').should('have.length', 2);
  });

  it('should be responsive on mobile', () => {
    // モバイルビューポート
    cy.viewport(375, 667);
    
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // グリッドが縮小されることを確認
    cy.get('.circuit-tile').first().then(($tile) => {
      const width = $tile.width();
      expect(width).to.be.lessThan(120); // さらに小さく
    });
    
    // 説明テキストが非表示になることを確認（CSSで制御）
    cy.get('.tile-desc').should('not.be.visible');
  });
});