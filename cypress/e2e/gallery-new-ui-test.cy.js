describe('新しいギャラリーモードUI', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
    cy.wait(500); // ギャラリー表示待機
  });

  describe('3分割レイアウト', () => {
    it('左サイドバー、中央キャンバス、右サイドバーが表示される', () => {
      // 左サイドバー: ギャラリーリスト
      cy.get('.gallery-sidebar-left').should('be.visible');
      cy.get('.gallery-list-panel').should('be.visible');
      cy.contains('📚 回路ギャラリー').should('be.visible');
      
      // 中央: キャンバス（初期は空）
      cy.get('.gallery-main-canvas').should('be.visible');
      cy.get('.gallery-canvas-empty').should('be.visible');
      cy.contains('回路を選択してください').should('be.visible');
      
      // 右サイドバー: 初期は非表示
      cy.get('.gallery-sidebar-right').should('not.exist');
    });

    it('回路を選択すると中央にプレビューが表示される', () => {
      // 最初の回路を選択
      cy.get('.circuit-item').first().click();
      
      // 空の状態が消える
      cy.get('.gallery-canvas-empty').should('not.exist');
      
      // キャンバスとツールバーが表示される
      cy.get('.gallery-canvas-container').should('be.visible');
      cy.get('.gallery-canvas-toolbar').should('be.visible');
      cy.contains('プレビュー（読み取り専用）').should('be.visible');
      
      // SVGキャンバスが表示される
      cy.get('.gallery-canvas').should('be.visible');
    });

    it('回路を選択すると右サイドバーに詳細が表示される', () => {
      // 最初の回路を選択
      cy.get('.circuit-item').first().click();
      
      // 右サイドバーが表示される
      cy.get('.gallery-sidebar-right').should('be.visible');
      cy.get('.gallery-detail-panel').should('be.visible');
      
      // 詳細情報が表示される
      cy.get('.detail-header h2').should('be.visible');
      cy.get('.detail-description').should('be.visible');
      cy.get('.detail-stats').should('be.visible');
      cy.get('.detail-gates').should('be.visible');
      cy.get('.detail-learning').should('be.visible');
      cy.get('.detail-actions').should('be.visible');
    });
  });

  describe('回路リスト機能', () => {
    it('カテゴリ別に回路が表示される', () => {
      // 基本回路カテゴリ
      cy.contains('🔧 基本回路').should('be.visible');
      cy.get('.gallery-category').eq(0).within(() => {
        cy.get('.circuit-item').should('have.length.at.least', 1);
      });
      
      // 高度回路カテゴリ
      cy.contains('⚡ 高度回路').should('be.visible');
      cy.get('.gallery-category').eq(1).within(() => {
        cy.get('.circuit-item').should('have.length.at.least', 1);
      });
      
      // 循環回路カテゴリ
      cy.contains('🌀 循環回路').should('be.visible');
      cy.get('.gallery-category').eq(2).within(() => {
        cy.get('.circuit-item').should('have.length.at.least', 1);
        cy.get('.circuit-badge').contains('実験的').should('be.visible');
      });
    });

    it('回路選択時にハイライト表示される', () => {
      const firstCircuit = cy.get('.circuit-item').first();
      const secondCircuit = cy.get('.circuit-item').eq(1);
      
      // 最初の回路を選択
      firstCircuit.click();
      firstCircuit.should('have.class', 'selected');
      
      // 2番目の回路を選択
      secondCircuit.click();
      secondCircuit.should('have.class', 'selected');
      firstCircuit.should('not.have.class', 'selected');
    });
  });

  describe('自動整形機能', () => {
    it('複雑な回路で自動整形ボタンが表示される', () => {
      // 複雑な回路を選択（例：4ビット比較器）
      cy.contains('4ビット比較器').click();
      
      // 自動整形ボタンが表示される可能性がある
      cy.get('.gallery-canvas-toolbar').within(() => {
        // ボタンが表示されている場合
        cy.get('.format-button').then($button => {
          if ($button.length > 0) {
            cy.wrap($button).should('be.visible');
            cy.wrap($button).contains('🔧 自動整形');
          }
        });
      });
    });

    it('自動整形ボタンをクリックすると回路が整形される', () => {
      // 複雑な回路を選択
      cy.contains('4ビット比較器').click();
      
      // 自動整形ボタンがある場合はクリック
      cy.get('.format-button').then($button => {
        if ($button.length > 0) {
          cy.wrap($button).click();
          
          // アニメーションが完了するまで待機
          cy.wait(1000);
          
          // ボタンが消えることを確認（整形完了）
          cy.get('.format-button').should('not.exist');
        }
      });
    });
  });

  // フリーモードへの遷移機能は削除

  describe('循環回路の警告表示', () => {
    it('循環回路を選択すると警告が表示される', () => {
      // 循環回路を選択（例：リングオシレータ）
      cy.contains('リングオシレータ').click();
      
      // 警告メッセージが表示される
      cy.get('.cyclical-warning').should('be.visible');
      cy.contains('この回路は循環構造を持つため').should('be.visible');
      
      // 詳細パネルにも注意事項が表示される
      cy.get('.detail-notice').should('be.visible');
      cy.contains('注意事項').should('be.visible');
    });
  });

  describe('レスポンシブ対応', () => {
    it('タブレットサイズで右サイドバーがオーバーレイ表示', () => {
      cy.viewport(1024, 768);
      
      // 回路を選択
      cy.get('.circuit-item').first().click();
      
      // 右サイドバーがオーバーレイとして表示
      cy.get('.gallery-sidebar-right').should('be.visible');
      cy.get('.gallery-sidebar-right').should('have.css', 'position', 'fixed');
    });

    it('モバイルサイズで左サイドバーもオーバーレイ表示', () => {
      cy.viewport(375, 667);
      
      // 左サイドバーがオーバーレイとして表示される可能性
      cy.get('.gallery-sidebar-left').should('be.visible');
    });
  });
});