describe('LFSR動作の正確な検証', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-testid="mode-selector-gallery"]').click()
    cy.wait(1000)
  })

  it('カオス発生器の実際の動作状態を検証', () => {
    // カオス発生器を選択
    cy.get('[data-testid="gallery-circuit-chaos-generator"]').click()
    cy.wait(2000)

    // 複数の方法で出力状態を記録
    const states = []
    
    for (let i = 0; i < 10; i++) {
      cy.get('body').then(() => {
        // 方法1: data-testid による検出
        cy.get('[data-testid*="out_bit"]').then($outputs => {
          if ($outputs.length > 0) {
            const currentState = Array.from($outputs).map(el => 
              el.classList.contains('active') || 
              el.querySelector('.active') !== null ||
              window.getComputedStyle(el).opacity === '1'
            )
            cy.log(`State ${i}: ${currentState}`)
          }
        })
        
        // 方法2: SVG要素の色を確認
        cy.get('svg').within(() => {
          cy.get('circle, rect').then($elements => {
            $elements.each((idx, el) => {
              const fill = window.getComputedStyle(el).fill
              const isActive = fill.includes('rgb(0, 255, 0)') || fill.includes('#00ff00')
              if (isActive) cy.log(`Element ${idx} is active`)
            })
          })
        })
      })
      
      cy.wait(1000) // 1秒間隔で確認
    }
    
    // スクリーンショット
    cy.screenshot(`chaos-generator-cycle-${Date.now()}`)
  })

  it('開発者ツールコンソールを監視', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // コンソールログを捕捉
        cy.stub(win.console, 'log').as('consoleLog')
        cy.stub(win.console, 'error').as('consoleError')
        cy.stub(win.console, 'warn').as('consoleWarn')
      }
    })
    
    cy.get('[data-testid="mode-selector-gallery"]').click()
    cy.get('[data-testid="gallery-circuit-chaos-generator"]').click()
    cy.wait(5000)
    
    // コンソールログを確認
    cy.get('@consoleLog').should('have.been.called')
    cy.get('@consoleLog').then((log) => {
      // ログの内容を分析
      log.getCalls().forEach(call => {
        cy.log(`Console: ${call.args.join(' ')}`)
      })
    })
  })

  it('実際のデータフローを追跡', () => {
    cy.get('[data-testid="gallery-circuit-chaos-generator"]').click()
    
    // ブラウザの開発者ツールを使用してメモリ上の状態を確認
    cy.window().then((win) => {
      // グローバルストアの状態を確認
      const store = win.__CIRCUIT_STORE__ // もしグローバルに公開されていれば
      if (store) {
        cy.log('Store state:', store.getState())
      }
    })
    
    // DOM MutationObserverで変化を監視
    cy.window().then((win) => {
      return new Promise((resolve) => {
        const observer = new win.MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class') {
              cy.log(`Class changed on ${mutation.target.tagName}`)
            }
          })
        })
        
        observer.observe(win.document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class', 'style']
        })
        
        setTimeout(() => {
          observer.disconnect()
          resolve()
        }, 10000)
      })
    })
  })
})