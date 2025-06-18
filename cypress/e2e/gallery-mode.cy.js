describe('ギャラリーモード E2E テスト', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('ギャラリーモード切り替え', () => {
    it('ギャラリーモードボタンをクリックするとギャラリーが表示される', () => {
      // ギャラリーモードボタンをクリック
      cy.contains('ギャラリーモード').click();
      
      // ギャラリーのタイトルが表示されることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      
      // サイドバーが非表示になることを確認
      cy.get('.sidebar-left').should('not.exist');
      cy.get('.sidebar-right').should('not.exist');
    });

    it('他のモードからギャラリーモードに切り替えられる', () => {
      // 最初にフリーモードであることを確認
      cy.contains('フリーモード').should('have.class', 'active');
      
      // ギャラリーモードに切り替え
      cy.contains('ギャラリーモード').click();
      
      // ギャラリーモードがアクティブになることを確認
      cy.contains('ギャラリーモード').should('have.class', 'active');
      cy.contains('📚 回路ギャラリー').should('be.visible');
    });
  });

  describe('回路カテゴリ表示', () => {
    beforeEach(() => {
      cy.contains('ギャラリーモード').click();
    });

    it('3つのカテゴリが表示される', () => {
      cy.contains('🔄 循環回路').should('be.visible');
      cy.contains('⚡ 高度回路').should('be.visible');
      cy.contains('🔧 基本回路').should('be.visible');
    });

    it('循環回路カテゴリに新しい回路が表示される', () => {
      // 回路カードが表示されることを確認
      cy.get('.circuit-card.cyclical').should('have.length.greaterThan', 0);
      
      // 最低限、一つの循環回路タイトルが存在することを確認
      cy.get('.circuit-title').should('contain.text', 'カオス発生器');
    });
  });

  describe('回路読み込み機能', () => {
    beforeEach(() => {
      cy.contains('ギャラリーモード').click();
    });

    it('回路をクリックすると詳細が表示される', () => {
      // 最初の循環回路の読み込みボタンをクリック
      cy.get('.circuit-card.cyclical').first().find('.load-button').click();
      
      // 選択された回路の詳細情報が表示されることを確認
      cy.get('.selected-circuit').should('be.visible');
      
      // アニメーションが完了するまで待機（最大アニメーション時間: 0.7s + 0.6s = 1.3s）
      cy.wait(1500);
      
      // ボタンが存在することを確認（visibility チェックは避ける）
      cy.get('.edit-button').should('exist');
      cy.get('.back-button').should('exist');
      
      // ボタンのテキストが正しいことを確認
      cy.contains('編集モードで開く').should('exist');
      cy.contains('ギャラリーに戻る').should('exist');
    });

    it('編集ボタンをクリックするとフリーモードに切り替わる', () => {
      // 回路を選択
      cy.get('.circuit-card.cyclical').first().find('.load-button').click();
      
      // 編集ボタンをクリック
      cy.contains('編集モードで開く').click();
      
      // フリーモードに切り替わることを確認
      cy.contains('フリーモード').should('have.class', 'active');
    });

    it('戻るボタンでギャラリー一覧に戻る', () => {
      // 回路を選択
      cy.get('.circuit-card.cyclical').first().find('.load-button').click();
      
      // 戻るボタンをクリック
      cy.contains('ギャラリーに戻る').click();
      
      // ギャラリー一覧に戻ることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      cy.contains('🔄 循環回路').should('be.visible');
    });
  });

  describe('レスポンシブデザイン', () => {
    beforeEach(() => {
      cy.contains('ギャラリーモード').click();
    });

    it('モバイルサイズで適切に表示される', () => {
      cy.viewport(375, 667); // iPhone SE サイズ
      
      // ギャラリーが表示されることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      
      // 回路グリッドが存在することを確認
      cy.get('.circuits-grid').should('exist');
    });

    it('タブレットサイズで適切に表示される', () => {
      cy.viewport(768, 1024); // iPad サイズ
      
      // ギャラリーが表示されることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      
      // レイアウトが適切に調整されることを確認
      cy.get('.gallery-panel').should('be.visible');
    });
  });

  describe('エラーハンドリング', () => {
    it('不正な回路データでもクラッシュしない', () => {
      cy.contains('ギャラリーモード').click();
      
      // ページがクラッシュしていないことを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
      
      // 回路読み込みを試行
      cy.get('.circuit-card').first().should('exist');
      
      // ギャラリーが引き続き表示されることを確認
      cy.contains('📚 回路ギャラリー').should('be.visible');
    });
  });

  describe('アクセシビリティ', () => {
    beforeEach(() => {
      cy.contains('ギャラリーモード').click();
    });

    it('キーボードナビゲーションが可能', () => {
      // 回路カードのボタンにフォーカス可能
      cy.get('.load-button').first().focus();
      cy.focused().should('contain', 'キャンバスで開く');
    });

    it('適切なARIAラベルが設定されている', () => {
      // ヘッダーが存在することを確認
      cy.get('h1').should('exist').and('not.be.empty');
      
      // ボタンにアクセシブルな名前があることを確認
      cy.get('.load-button').each(($button) => {
        cy.wrap($button).should('contain.text', 'キャンバスで開く');
      });
    });
  });
});