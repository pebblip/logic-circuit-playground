describe('学習モードUI直接確認', () => {
  beforeEach(() => {
    // 全てのlocalStorageを設定
    cy.window().then((win) => {
      win.localStorage.setItem('hasSeenModeSelector', 'true')
      win.localStorage.setItem('circuit-mode', '"learning"')
      win.localStorage.setItem('logic-circuit-preferences', JSON.stringify({
        mode: 'learning',
        tutorialCompleted: true,
        skipModeSelection: true
      }))
      win.localStorage.setItem('logic-circuit-tutorial', JSON.stringify({
        completed: true,
        currentStep: 999,
        badges: [],
        progress: {}
      }))
    })
    
    cy.visit('/')
    cy.wait(2000) // 初期化を待つ
    
    // もしまだモード選択画面が出ているなら閉じる
    cy.get('body').then(($body) => {
      if ($body.find('[style*="z-index: 2000"]').length > 0) {
        cy.log('モード選択画面を閉じます')
        // 背景をクリックしてみる
        cy.get('[style*="z-index: 2000"]').first().click({ force: true })
        cy.wait(500)
      }
    })
  })

  it('最終的なUIの確認', () => {
    // 現在の画面のスクリーンショット
    cy.screenshot('01-current-state', { capture: 'viewport' })
    
    // ヘッダーの確認
    cy.contains('Logic Circuit Playground').should('be.visible')
    cy.screenshot('02-header')
    
    // サイドパネルの有無を確認
    cy.get('body').then(($body) => {
      if ($body.find('aside').length > 0) {
        cy.log('サイドパネルが見つかりました')
        cy.get('aside').screenshot('03-side-panel')
      } else {
        cy.log('サイドパネルが見つかりません')
      }
    })
    
    // メインエリアの確認
    cy.get('main').should('exist')
    cy.screenshot('04-main-area')
    
    // ボタンやコントロールの存在確認
    cy.get('button').then($buttons => {
      cy.log(`ボタン数: ${$buttons.length}`)
      $buttons.each((i, button) => {
        cy.log(`ボタン${i}: ${button.textContent}`)
      })
    })
    
    // フルページスクリーンショット
    cy.screenshot('05-full-page', { capture: 'fullPage' })
  })
})