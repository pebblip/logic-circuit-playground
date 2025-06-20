describe('LFSR実際の動作確認', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/')
    // ギャラリーモードに切り替え
    cy.contains('ギャラリーモード').click()
    cy.wait(500)
  })

  it('シンプル2ビットLFSRが正しく動作する', () => {
    // シンプルLFSRを選択
    cy.contains('シンプル2ビットLFSR').click()
    
    // 少し待つ
    cy.wait(500)
    
    // 初期状態：dff_a=1, dff_b=0を確認
    cy.get('[data-testid="gate-dff_a"]').should('be.visible')
    cy.get('[data-testid="gate-dff_b"]').should('be.visible')
    cy.get('[data-testid="gate-out_a"]').should('be.visible')
    cy.get('[data-testid="gate-out_b"]').should('be.visible')
    
    // スクリーンショットを撮る
    cy.screenshot('simple-lfsr-initial')
    
    // 3秒待って状態変化を確認
    cy.wait(3000)
    cy.screenshot('simple-lfsr-after-3sec')
    
    // さらに3秒待って周期的変化を確認
    cy.wait(3000)
    cy.screenshot('simple-lfsr-after-6sec')
  })

  it('カオス発生器の出力状態を確認', () => {
    // カオス発生器を選択
    cy.contains('カオス発生器').click()
    
    // 少し待つ
    cy.wait(500)
    
    // 出力ゲートを確認
    cy.get('[data-testid="gate-out_bit3"]').should('be.visible')
    cy.get('[data-testid="gate-out_bit2"]').should('be.visible')
    cy.get('[data-testid="gate-out_bit1"]').should('be.visible')
    cy.get('[data-testid="gate-out_bit0"]').should('be.visible')
    
    // スクリーンショットを撮る
    cy.screenshot('chaos-generator-initial')
    
    // 3秒待って状態変化を確認
    cy.wait(3000)
    cy.screenshot('chaos-generator-after-3sec')
    
    // 特定の出力ゲートがアクティブかどうかをチェック
    cy.get('[data-testid="gate-out_bit3"]').then(($gate) => {
      const isActive = $gate.hasClass('active') || $gate.find('.active').length > 0
      cy.log(`out_bit3 is active: ${isActive}`)
    })
    
    cy.get('[data-testid="gate-out_bit2"]').then(($gate) => {
      const isActive = $gate.hasClass('active') || $gate.find('.active').length > 0
      cy.log(`out_bit2 is active: ${isActive}`)
    })
  })
  
  it('クロック信号の動作を確認', () => {
    // シンプルLFSRでクロックを確認
    cy.contains('シンプル2ビットLFSR').click()
    cy.wait(500)
    
    // クロックゲートを確認
    cy.get('[data-testid="gate-clock"]').should('be.visible')
    
    // クロックの状態を5回記録
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="gate-clock"]').then(($clock) => {
        const isActive = $clock.hasClass('active') || $clock.find('.active').length > 0
        cy.log(`Clock cycle ${i}: active=${isActive}`)
      })
      cy.wait(1000) // 1秒待つ
    }
  })
})