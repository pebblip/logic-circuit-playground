describe('学習モードUI確認（シンプル版）', () => {
  beforeEach(() => {
    // localStorageを設定してモード選択画面をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('hasSeenModeSelector', 'true')
      win.localStorage.setItem('circuit-mode', '"learning"')
    })
    cy.visit('/')
    cy.wait(1000)
  })

  it('学習モードのUIが正しく表示される', () => {
    // ヘッダーのスクリーンショット
    cy.screenshot('01-header-with-mode-selector')
    
    // ヘッダーにあるモード選択ボタンを確認
    cy.get('header').within(() => {
      cy.contains('Logic Circuit Playground').should('be.visible')
    })
    
    // モード選択ボタンが存在するか確認（AppModeSelectorコンポーネント）
    cy.get('[class*="mode"][class*="selector"]').should('exist')
    cy.screenshot('02-mode-buttons')
    
    // 学習モード用サイドパネルの確認
    cy.get('aside').should('exist')
    cy.screenshot('03-learning-panel')
    
    // 全体レイアウト
    cy.screenshot('04-full-layout')
  })

  it('学習ガイドパネルの詳細', () => {
    // 学習ガイドの存在確認
    cy.contains('学習ガイド').should('be.visible')
    cy.contains('全体進捗').should('be.visible')
    
    // 学習ガイド部分のみのスクリーンショット
    cy.get('.learning-guide').screenshot('05-learning-guide-detail')
    
    // 学習統計の確認
    cy.contains('学習統計').should('be.visible')
    cy.get('.learning-guide').parent().screenshot('06-learning-statistics')
    
    // チュートリアル開始ボタンの確認
    cy.contains('チュートリアルを開始').should('be.visible')
    cy.screenshot('07-tutorial-button')
  })

  it('モード切り替えの動作確認', () => {
    // 現在のモード表示を確認
    cy.contains('現在のモード: learning').should('be.visible')
    
    // ボタンを直接クリックしてモードを切り替え（forceオプション使用）
    cy.contains('button', '自由モード').click({ force: true })
    cy.wait(500)
    cy.screenshot('08-free-mode')
    
    // 学習パネルが非表示になることを確認
    cy.get('aside').should('not.exist')
    
    // 学習モードに戻す
    cy.contains('button', '学習モード').click({ force: true })
    cy.wait(500)
    cy.screenshot('09-back-to-learning')
  })
})