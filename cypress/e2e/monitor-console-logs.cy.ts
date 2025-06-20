/**
 * 🔍 コンソールログ監視テスト
 * 
 * useUnifiedCanvasに追加したデバッグログを監視して問題を特定
 */

describe('コンソールログ監視', () => {
  beforeEach(() => {
    // コンソールログをキャプチャ
    cy.visit('http://localhost:5176/', {
      onBeforeLoad: (win) => {
        cy.stub(win.console, 'log').as('consoleLog')
        cy.stub(win.console, 'error').as('consoleError')
        cy.stub(win.console, 'warn').as('consoleWarn')
      }
    })
  })

  it('自動アニメーション開始条件を詳細確認', () => {
    // ギャラリーモードに移行
    cy.contains('ギャラリーモード').click()
    cy.wait(500)
    
    // カオス発生器を選択
    cy.contains('カオス発生器').click()
    cy.wait(2000)
    
    // コンソールログを分析
    cy.get('@consoleLog').then((log) => {
      const calls = log.getCalls()
      
      // 関連するログのみを抽出
      const galleryLogs = calls.filter(call => 
        call.args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('Gallery Animation') || arg.includes('自動アニメーション'))
        )
      )
      
      console.log('=== Gallery Animation関連ログ ===')
      galleryLogs.forEach((call, index) => {
        console.log(`${index + 1}:`, call.args)
      })
      
      // 条件チェックログを詳細分析
      const conditionLogs = calls.filter(call =>
        call.args.some(arg =>
          typeof arg === 'string' && arg.includes('自動アニメーション開始条件チェック')
        )
      )
      
      if (conditionLogs.length > 0) {
        console.log('=== 条件チェック詳細 ===')
        conditionLogs.forEach((call, index) => {
          console.log(`条件チェック ${index + 1}:`)
          call.args.forEach(arg => {
            if (typeof arg === 'object') {
              console.log('設定値:', JSON.stringify(arg, null, 2))
            } else {
              console.log('メッセージ:', arg)
            }
          })
        })
      }
      
      // 失敗ログを確認
      const failureLogs = calls.filter(call =>
        call.args.some(arg =>
          typeof arg === 'string' && arg.includes('条件不満足')
        )
      )
      
      if (failureLogs.length > 0) {
        console.log('=== 失敗原因詳細 ===')
        failureLogs.forEach((call, index) => {
          console.log(`失敗 ${index + 1}:`)
          call.args.forEach(arg => {
            if (typeof arg === 'object') {
              console.log('失敗理由:', JSON.stringify(arg, null, 2))
            }
          })
        })
      }
    })
    
    // スクリーンショット
    cy.screenshot('console-log-analysis')
  })

  it('設定値の詳細確認', () => {
    cy.contains('ギャラリーモード').click()
    cy.contains('カオス発生器').click()
    cy.wait(1000)
    
    // 設定値の詳細確認
    cy.get('@consoleLog').then((log) => {
      const calls = log.getCalls()
      
      // 設定に関するログを抽出
      const configLogs = calls.filter(call =>
        call.args.some(arg =>
          typeof arg === 'object' && 
          (arg.hasOwnProperty('autoSimulation') || 
           arg.hasOwnProperty('mode') ||
           arg.hasOwnProperty('galleryOptions'))
        )
      )
      
      console.log('=== 設定値詳細 ===')
      configLogs.forEach((call, index) => {
        call.args.forEach(arg => {
          if (typeof arg === 'object') {
            Object.entries(arg).forEach(([key, value]) => {
              console.log(`${key}:`, value)
            })
          }
        })
      })
    })
  })

  it('アニメーション実行ログの確認', () => {
    cy.contains('ギャラリーモード').click()
    cy.contains('カオス発生器').click()
    cy.wait(3000) // 十分な時間待機
    
    cy.get('@consoleLog').then((log) => {
      const calls = log.getCalls()
      
      // アニメーション実行に関するログ
      const animationLogs = calls.filter(call =>
        call.args.some(arg =>
          typeof arg === 'string' && 
          (arg.includes('startAnimation') || 
           arg.includes('Before evaluation') ||
           arg.includes('After evaluation'))
        )
      )
      
      console.log('=== アニメーション実行ログ ===')
      console.log(`アニメーション関連ログ数: ${animationLogs.length}`)
      
      if (animationLogs.length === 0) {
        console.log('❌ アニメーションが全く実行されていません')
      } else {
        console.log('✅ アニメーションログを検出')
        animationLogs.slice(0, 5).forEach((call, index) => {
          console.log(`${index + 1}:`, call.args)
        })
      }
    })
  })
})