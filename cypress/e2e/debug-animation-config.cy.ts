/**
 * 🔍 ギャラリーモードアニメーション設定デバッグテスト
 * 
 * 自動アニメーションが開始されない根本原因を特定
 */

describe('ギャラリーモードアニメーション設定デバッグ', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/')
    cy.contains('ギャラリーモード').click()
    cy.wait(500)
    cy.contains('カオス発生器').click()
    cy.wait(1000)
  })

  it('ブラウザコンソールで設定値を詳細確認', () => {
    // ブラウザのwindowオブジェクトにアクセスして設定を確認
    cy.window().then((win) => {
      // デバッグ情報を強制的に有効化
      win.localStorage.setItem('debug', 'true')
      
      // 開発者ツールのコンソールログを監視
      const logs: string[] = []
      
      cy.stub(win.console, 'log').callsFake((...args) => {
        const message = args.join(' ')
        logs.push(message)
        console.log('CAPTURED:', message)
      })
      
      // 1秒待ってからログを分析
      cy.wait(1000).then(() => {
        console.log('=== 収集されたログ ===')
        logs.forEach(log => {
          if (log.includes('Gallery') || log.includes('animation') || log.includes('config')) {
            console.log('📋', log)
          }
        })
      })
    })
    
    // DOM要素から直接情報を抽出
    cy.get('body').then(() => {
      // SVG要素の存在確認
      cy.get('svg').should('exist').then($svg => {
        console.log('SVG要素確認:', {
          exists: true,
          children: $svg.children().length
        })
      })
      
      // ギャラリー回路データの確認
      cy.window().then((win) => {
        // React DevToolsがある場合の情報取得を試行
        if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          console.log('React DevTools が利用可能')
        }
      })
    })
  })

  it('設定値の手動注入テスト', () => {
    // 強制的にアニメーションを開始するためのコードを注入
    cy.window().then((win) => {
      // カスタムデバッグ関数を注入
      win.debugGalleryAnimation = () => {
        console.log('=== ギャラリーアニメーション強制デバッグ ===')
        
        // DOM からUnifiedCanvasコンポーネントを探す
        const svgElement = win.document.querySelector('svg')
        if (svgElement) {
          console.log('SVG要素発見:', svgElement)
          
          // React Fiberから情報を取得（可能であれば）
          const fiberKey = Object.keys(svgElement).find(key => key.startsWith('__reactFiber'))
          if (fiberKey) {
            console.log('React Fiber情報あり')
          }
        }
        
        // 強制的にアニメーション関連のイベントを発火
        const customEvent = new win.CustomEvent('forceGalleryAnimation', {
          detail: { force: true }
        })
        win.document.dispatchEvent(customEvent)
      }
      
      // デバッグ関数を実行
      win.debugGalleryAnimation()
    })
    
    cy.wait(2000)
    cy.screenshot('debug-after-manual-trigger')
  })

  it('アニメーション間隔を短くして高速テスト', () => {
    // ローカルストレージに設定を上書き
    cy.window().then((win) => {
      // アニメーション間隔を100msに短縮
      win.localStorage.setItem('galleryAnimationInterval', '100')
      
      // 強制リロード
      win.location.reload()
    })
    
    cy.wait(1000)
    cy.contains('ギャラリーモード').click()
    cy.contains('カオス発生器').click()
    
    // 高速アニメーションの確認
    const states: boolean[] = []
    for (let i = 0; i < 10; i++) {
      cy.wait(200).then(() => {
        cy.get(`[data-testid="gate-out_bit3"]`).then($gate => {
          const isActive = $gate.attr('data-active') === 'true'
          states.push(isActive)
          console.log(`高速テスト ${i}: out_bit3=${isActive}`)
        })
      })
    }
    
    cy.then(() => {
      const uniqueStates = new Set(states)
      console.log('高速テスト結果:', {
        total: states.length,
        unique: uniqueStates.size,
        states: states
      })
    })
  })

  it('手動でシミュレーション実行を確認', () => {
    // Cypressから直接シミュレーション実行をトリガー
    cy.window().then((win) => {
      // カスタムイベントでシミュレーション実行
      const simulateEvent = new win.CustomEvent('manualSimulate', {
        detail: { 
          circuitId: 'chaos-generator',
          force: true 
        }
      })
      win.document.dispatchEvent(simulateEvent)
      
      console.log('手動シミュレーションイベント送信完了')
    })
    
    cy.wait(500)
    cy.screenshot('manual-simulation-trigger')
    
    // 状態変化があったかを確認
    cy.get(`[data-testid="gate-out_bit3"]`).then($gate => {
      const isActive = $gate.attr('data-active') === 'true'
      console.log('手動シミュレーション後の状態:', { out_bit3: isActive })
    })
  })
})