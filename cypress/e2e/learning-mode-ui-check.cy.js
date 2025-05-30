describe('学習モードUI確認', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // 初回起動時のモード選択画面を閉じる
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("次へ")').length > 0) {
        cy.contains('button', '次へ').click({ force: true })
        cy.wait(500)
      }
    })
  })

  it('初期表示とモード切り替えを確認', () => {
    // 初期表示のスクリーンショット
    cy.screenshot('01-initial-view')
    
    // モード選択ボタンが表示されているか確認
    cy.contains('📚 学習モード').should('be.visible')
    cy.contains('🎨 自由モード').should('be.visible')
    cy.contains('🧩 パズルモード').should('be.visible')
    
    // 学習モードの状態を確認
    cy.screenshot('02-learning-mode-active')
    
    // 自由モードに切り替え
    cy.contains('🎨 自由モード').click()
    cy.wait(500)
    cy.screenshot('03-free-mode-active')
    
    // パズルモードに切り替え
    cy.contains('🧩 パズルモード').click()
    cy.wait(500)
    cy.screenshot('04-puzzle-mode-active')
  })

  it('学習モードの詳細UI確認', () => {
    // 学習モードに戻る
    cy.contains('📚 学習モード').click()
    cy.wait(500)
    
    // 学習ガイドパネルの存在確認
    cy.contains('学習ガイド').should('be.visible')
    cy.contains('全体進捗').should('be.visible')
    
    // レッスン一覧のスクリーンショット
    cy.screenshot('05-learning-guide-panel')
    
    // 最初のレッスンをクリックして展開
    cy.contains('プレイグラウンドの基本操作').click()
    cy.wait(500)
    cy.screenshot('06-lesson-expanded')
    
    // 学習統計の確認
    cy.contains('学習統計').should('be.visible')
    cy.screenshot('07-learning-statistics')
  })

  it('チュートリアルオーバーレイの確認', () => {
    // チュートリアル開始ボタンを探す
    cy.contains('チュートリアルを開始').click()
    cy.wait(1000)
    
    // チュートリアルオーバーレイのスクリーンショット
    cy.screenshot('08-tutorial-overlay')
    
    // チュートリアルの次へボタンをクリック
    cy.contains('次へ').click()
    cy.wait(500)
    cy.screenshot('09-tutorial-step2')
  })

  it('全体レイアウトの確認', () => {
    // ウィンドウサイズを変更して異なる解像度でのレイアウト確認
    cy.viewport(1920, 1080)
    cy.screenshot('10-fullhd-layout')
    
    cy.viewport(1366, 768)
    cy.screenshot('11-laptop-layout')
    
    cy.viewport(768, 1024)
    cy.screenshot('12-tablet-layout')
    
    cy.viewport(375, 667)
    cy.screenshot('13-mobile-layout')
  })
})