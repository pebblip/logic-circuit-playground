describe('チュートリアルエラー調査', () => {
  it('コンソールエラーの詳細を確認', () => {
    // コンソールログを収集
    const consoleLogs = [];
    const consoleErrors = [];
    
    cy.on('window:before:load', (win) => {
      // console.logとconsole.errorを監視
      const originalLog = win.console.log;
      const originalError = win.console.error;
      
      win.console.log = (...args) => {
        consoleLogs.push(args);
        originalLog.apply(win.console, args);
      };
      
      win.console.error = (...args) => {
        consoleErrors.push(args);
        originalError.apply(win.console, args);
      };
    });
    
    // localStorage設定
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('selectedMode', 'learning');
        win.localStorage.setItem('modeSelectionCompleted', 'true');
      }
    });
    
    // モード選択画面が表示される場合
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("学ぼう")').length > 0) {
        cy.contains('button', '学ぼう').click();
      }
    });
    
    // 少し待機
    cy.wait(1000);
    
    // LearningModeManagerコンポーネントが存在するか確認
    cy.get('.learning-mode-manager').should('exist');
    
    // チュートリアル開始ボタンを探す - forceオプションを使用
    cy.contains('button', 'チュートリアルを開始')
      .should('exist')
      .click({ force: true });
    
    // エラーログを確認
    cy.wait(500).then(() => {
      if (consoleErrors.length > 0) {
        console.log('=== Console Errors ===');
        consoleErrors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`, error);
        });
      }
      
      // エラーが発生していないことを確認
      expect(consoleErrors).to.have.length(0);
    });
    
    // チュートリアルオーバーレイが表示されるか確認
    cy.contains('ようこそ論理回路の世界へ').should('be.visible');
  });
  
  it('TutorialOverlayコンポーネントのprops確認', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('selectedMode', 'learning');
        win.localStorage.setItem('modeSelectionCompleted', 'true');
      }
    });
    
    // モード選択画面をスキップ
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("学ぼう")').length > 0) {
        cy.contains('button', '学ぼう').click();
      }
    });
    
    // Reactコンポーネントのpropsを確認
    cy.window().then((win) => {
      const reactRoot = win.document.querySelector('#root')._reactRootContainer;
      console.log('React Root:', reactRoot);
    });
  });
});