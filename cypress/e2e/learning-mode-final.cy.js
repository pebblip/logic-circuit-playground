describe('学習モードUI最終確認', () => {
  it('初回起動画面を閉じて実際のUIを確認', () => {
    cy.visit('/')
    
    // 初回起動画面を確認
    cy.contains('ようこそ！論理回路プレイグラウンドへ').should('be.visible')
    cy.screenshot('01-welcome-screen')
    
    // 左上の「スキップ」ボタンをクリック
    cy.contains('スキップ').click()
    cy.wait(1000)
    
    // UIが表示されるのを待つ
    cy.contains('⚡ Logic Circuit Playground').should('be.visible')
    
    // 現在の画面をスクリーンショット
    cy.screenshot('02-after-closing-welcome')
    
    // ヘッダーのモードボタンを確認
    cy.contains('button', '📚 学習モード').should('be.visible')
    cy.contains('button', '🎨 自由モード').should('be.visible')
    cy.contains('button', '🧩 パズルモード').should('be.visible')
    cy.screenshot('03-header-with-modes')
    
    // 学習モードが選択されているか確認
    cy.contains('現在のモード: learning').should('be.visible')
    
    // サイドパネルの存在確認
    cy.get('aside').should('exist')
    cy.screenshot('04-with-side-panel')
    
    // 学習ガイドの確認
    cy.contains('学習ガイド').should('be.visible')
    cy.contains('全体進捗').should('be.visible')
    cy.screenshot('05-learning-guide')
    
    // 学習統計の確認
    cy.contains('学習統計').should('be.visible')
    cy.screenshot('06-learning-statistics')
    
    // 自由モードに切り替え
    cy.contains('button', '🎨 自由モード').click()
    cy.wait(500)
    cy.screenshot('07-free-mode')
    
    // サイドパネルが消えることを確認
    cy.get('aside').should('not.exist')
    
    // 学習モードに戻す
    cy.contains('button', '📚 学習モード').click()
    cy.wait(500)
    cy.screenshot('08-back-to-learning-mode')
    
    // サイドパネルが再表示されることを確認
    cy.get('aside').should('exist')
    
    // フルレイアウトのスクリーンショット
    cy.screenshot('09-full-layout', { capture: 'fullPage' })
  })
})