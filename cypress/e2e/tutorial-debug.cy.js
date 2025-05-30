describe('チュートリアルデバッグ', () => {
  it('初期状態とlocalStorageの確認', () => {
    // localStorageをクリア
    cy.clearLocalStorage();
    
    // 学習モードを設定
    cy.window().then((win) => {
      win.localStorage.setItem('selectedMode', 'learning');
      win.localStorage.setItem('modeSelectionCompleted', 'true');
      win.localStorage.setItem('circuit-app-mode', 'learning');
      
      // チュートリアル完了フラグも設定（DiscoveryTutorialを表示させないため）
      win.localStorage.setItem('logic-circuit-tutorial-completed', 'true');
      
      // LocalStorageの内容を確認
      console.log('=== LocalStorage Contents ===');
      for (let i = 0; i < win.localStorage.length; i++) {
        const key = win.localStorage.key(i);
        console.log(`${key}: ${win.localStorage.getItem(key)}`);
      }
    });
    
    cy.visit('/');
    
    // 1秒待機
    cy.wait(1000);
    
    // 現在の状態を確認
    cy.window().then((win) => {
      console.log('=== After Page Load ===');
      console.log('Current Mode:', win.localStorage.getItem('circuit-app-mode'));
      console.log('Tutorial Completed:', win.localStorage.getItem('logic-circuit-tutorial-completed'));
    });
    
    // DiscoveryTutorialが表示されていないことを確認
    cy.get('body').then(($body) => {
      const hasDiscoveryTutorial = $body.text().includes('ようこそ！論理回路プレイグラウンドへ');
      expect(hasDiscoveryTutorial).to.be.false;
    });
    
    // LearningModeManagerが表示されていることを確認
    cy.get('.learning-mode-manager').should('exist');
    
    // チュートリアル開始ボタンが表示されていることを確認
    cy.contains('button', 'チュートリアルを開始').should('exist');
  });
  
  it('チュートリアル開始ボタンクリック後の動作', () => {
    // 前のテストと同じ設定
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('selectedMode', 'learning');
      win.localStorage.setItem('modeSelectionCompleted', 'true');
      win.localStorage.setItem('circuit-app-mode', 'learning');
      win.localStorage.setItem('logic-circuit-tutorial-completed', 'true');
    });
    
    cy.visit('/');
    cy.wait(1000);
    
    // チュートリアル開始ボタンをクリック
    cy.contains('button', 'チュートリアルを開始').click({ force: true });
    
    // 少し待機
    cy.wait(500);
    
    // TutorialOverlayが表示されることを確認
    cy.contains('ようこそ論理回路の世界へ').should('exist');
    
    // DiscoveryTutorialではないことを確認（テキストの違いで判別）
    cy.get('body').then(($body) => {
      const hasDiscoveryText = $body.text().includes('論理回路の世界を探検しましょう');
      expect(hasDiscoveryText).to.be.false;
    });
  });
});