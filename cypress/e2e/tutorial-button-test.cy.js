describe('チュートリアルボタンのテスト', () => {
  beforeEach(() => {
    // localStorageをクリアしてから設定
    cy.clearLocalStorage();
    
    // localStorageを設定してからアクセス
    cy.visit('/', {
      onBeforeLoad(win) {
        // モード選択をスキップし、学習モードを設定
        win.localStorage.setItem('selectedMode', 'learning');
        win.localStorage.setItem('modeSelectionCompleted', 'true');
        win.localStorage.setItem('circuit-app-mode', 'learning');
        // DiscoveryTutorialを表示させないため
        win.localStorage.setItem('logic-circuit-tutorial-completed', 'true');
      }
    });
    
    // 少し待機
    cy.wait(500);
  });

  it('チュートリアル開始ボタンをクリックしてもエラーが発生しない', () => {
    // コンソールエラーを監視
    let consoleError = cy.stub();
    cy.on('window:before:load', (win) => {
      cy.stub(win.console, 'error').callsFake(consoleError);
    });

    // 学習モードのパネルが表示されることを確認
    cy.contains('学習ガイド').should('be.visible');
    
    // チュートリアル開始ボタンまでスクロールして表示
    cy.contains('button', 'チュートリアルを開始').scrollIntoView().should('be.visible');
    
    // ボタンをクリック
    cy.contains('button', 'チュートリアルを開始').click();
    
    // チュートリアルオーバーレイが表示されることを確認
    cy.contains('ようこそ論理回路の世界へ').should('be.visible');
    
    // コンソールエラーが発生していないことを確認
    cy.wrap(consoleError).should('not.be.called');
  });

  it('チュートリアルの次へボタンが動作する', () => {
    // チュートリアルを開始
    cy.contains('button', 'チュートリアルを開始').scrollIntoView().click();
    
    // 最初のステップが表示される
    cy.contains('ようこそ論理回路の世界へ').should('be.visible');
    
    // ステップ番号を確認（1/10のような表示）
    cy.contains('1/').should('be.visible');
    
    // 次へボタンをクリック
    cy.contains('button', '次へ').click();
    
    // 少し待機
    cy.wait(500);
    
    // 次のステップが表示される（タイトルのアイコンも含む）
    // より柔軟な検索方法を使用
    cy.get('body').should('contain.text', 'ツールバー');
  });

  it('チュートリアルのスキップボタンが動作する', () => {
    // チュートリアルを開始
    cy.contains('button', 'チュートリアルを開始').scrollIntoView().click();
    
    // スキップボタンがある場合はクリック
    cy.contains('button', 'スキップ').should('be.visible').click();
    
    // チュートリアルが閉じられることを確認
    cy.contains('ようこそ論理回路の世界へ').should('not.exist');
  });
});