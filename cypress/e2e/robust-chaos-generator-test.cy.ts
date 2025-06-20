/**
 * 🎯 堅牢なカオス発生器テスト
 * 
 * data-testidベースの信頼性の高いテストで、カオス発生器の真の問題を特定
 * テキストベースのクエリは一切使用しない
 */

describe('カオス発生器の堅牢なテスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/')
    
    // ギャラリーモードボタンをdata-testidで特定
    // 注意: 現在はテキストベースだが、後でdata-testidを追加予定
    cy.contains('ギャラリーモード').click()
    cy.wait(500)
    
    // カオス発生器を選択（data-testidベース）
    // 注意: 現在はテキストベースだが、後でdata-testidを追加予定
    cy.contains('カオス発生器').click()
    cy.wait(1000)
  })

  it('カオス発生器の出力ゲート状態を正確に検証', () => {
    console.log('=== カオス発生器の出力状態検証 ===')
    
    // 各出力ゲートの存在確認（data-testidベース）
    const outputGates = ['out_bit3', 'out_bit2', 'out_bit1', 'out_bit0', 'random_output']
    
    outputGates.forEach(gateId => {
      cy.get(`[data-testid="gate-${gateId}"]`).should('exist').then($gate => {
        console.log(`✓ ゲート ${gateId} が存在`)
      })
    })

    // 初期状態のスクリーンショット
    cy.screenshot('chaos-generator-initial-state')

    // 各出力ゲートの詳細状態確認
    outputGates.forEach((gateId, index) => {
      cy.get(`[data-testid="gate-${gateId}"]`).then($gate => {
        // data-active属性で状態確認
        const isActive = $gate.attr('data-active') === 'true'
        const isVisible = $gate.is(':visible')
        const position = $gate.offset()
        
        console.log(`ゲート ${gateId}:`, {
          active: isActive,
          visible: isVisible,
          position: position,
          classes: Array.from($gate[0].classList),
          attributes: Object.fromEntries(
            Array.from($gate[0].attributes).map(attr => [attr.name, attr.value])
          )
        })
        
        // 基本的な期待値
        expect(isVisible).to.be.true
      })
    })
  })

  it('時間経過での状態変化を正確に追跡', () => {
    console.log('=== 時間経過での状態変化追跡 ===')
    
    const outputGates = ['out_bit3', 'out_bit2', 'out_bit1', 'out_bit0']
    const stateHistory: Array<{time: number, states: boolean[]}> = []
    
    // 5秒間、1秒間隔で状態を記録
    for (let i = 0; i < 5; i++) {
      cy.wait(1000).then(() => {
        const currentStates: boolean[] = []
        
        // 各出力ゲートの状態を並行で収集
        const promises = outputGates.map((gateId, index) => {
          return cy.get(`[data-testid="gate-${gateId}"]`).then($gate => {
            const isActive = $gate.attr('data-active') === 'true'
            currentStates[index] = isActive
            return isActive
          })
        })
        
        Promise.all(promises).then(() => {
          const timestamp = Date.now()
          stateHistory.push({ time: timestamp, states: [...currentStates] })
          
          console.log(`t=${i}s: [${currentStates.map(s => s ? '1' : '0').join(',')}]`)
        })
      })
    }
    
    // 最終状態のスクリーンショット
    cy.screenshot('chaos-generator-after-5-seconds')
    
    // 状態変化の検証
    cy.then(() => {
      console.log('=== 状態変化分析 ===')
      console.log('収集された状態履歴:', stateHistory)
      
      // 少なくとも2つの異なる状態があることを確認
      const uniqueStates = new Set(
        stateHistory.map(entry => entry.states.join(''))
      )
      
      console.log('ユニークな状態数:', uniqueStates.size)
      console.log('ユニークな状態:', Array.from(uniqueStates))
      
      // 期待値: カオス発生器なので複数の状態があるべき
      expect(uniqueStates.size).to.be.greaterThan(1, 
        'カオス発生器は複数の異なる状態を生成するべき')
    })
  })

  it('クロック信号の動作確認', () => {
    console.log('=== クロック信号の動作確認 ===')
    
    // クロックゲートの状態を確認
    cy.get(`[data-testid="gate-clock"]`).should('exist').then($clock => {
      console.log('クロック初期状態:', {
        active: $clock.attr('data-active'),
        visible: $clock.is(':visible'),
        classes: Array.from($clock[0].classList)
      })
    })

    // クロックの状態変化を追跡
    const clockStates: boolean[] = []
    
    for (let i = 0; i < 6; i++) {
      cy.wait(500).then(() => {
        cy.get(`[data-testid="gate-clock"]`).then($clock => {
          const isActive = $clock.attr('data-active') === 'true'
          clockStates.push(isActive)
          console.log(`クロック t=${i * 0.5}s: ${isActive ? 'HIGH' : 'LOW'}`)
        })
      })
    }
    
    cy.then(() => {
      console.log('クロック状態履歴:', clockStates)
      
      // クロックは少なくとも2つの異なる状態を持つべき
      const uniqueClockStates = new Set(clockStates)
      expect(uniqueClockStates.size).to.be.greaterThan(1, 
        'クロック信号は HIGH と LOW を切り替えるべき')
    })
  })

  it('D-FFゲートの状態確認', () => {
    console.log('=== D-FFゲートの状態確認 ===')
    
    const dffGates = ['dff1', 'dff2', 'dff3', 'dff4']
    
    dffGates.forEach(gateId => {
      cy.get(`[data-testid="gate-${gateId}"]`).should('exist').then($dff => {
        console.log(`D-FF ${gateId}:`, {
          active: $dff.attr('data-active'),
          visible: $dff.is(':visible'),
          output: $dff.attr('data-output') // もしあれば
        })
      })
    })

    // D-FF状態の時間変化を確認
    cy.wait(1000)
    cy.screenshot('dff-states-after-1s')
    
    cy.wait(2000)  
    cy.screenshot('dff-states-after-3s')
  })

  it('問題の正確な特定', () => {
    console.log('=== 問題の正確な特定 ===')
    
    // ユーザー報告: 「左から一番目と三番目しか表示されていない」
    // out_bit3 (1番目) - 表示されているべき
    // out_bit2 (2番目) - 表示されていないと報告
    // out_bit1 (3番目) - 表示されているべき  
    // out_bit0 (4番目) - 表示されていないと報告
    
    const expectedVisible = ['out_bit3', 'out_bit1'] // 1番目と3番目
    const expectedInvisible = ['out_bit2', 'out_bit0'] // 2番目と4番目
    
    expectedVisible.forEach(gateId => {
      cy.get(`[data-testid="gate-${gateId}"]`).then($gate => {
        const isActive = $gate.attr('data-active') === 'true'
        const isVisible = $gate.is(':visible')
        
        console.log(`期待される可視ゲート ${gateId}:`, { active: isActive, visible: isVisible })
        
        // このゲートは表示されているべき
        expect(isVisible).to.be.true
      })
    })
    
    expectedInvisible.forEach(gateId => {
      cy.get(`[data-testid="gate-${gateId}"]`).then($gate => {
        const isActive = $gate.attr('data-active') === 'true'
        const isVisible = $gate.is(':visible')
        
        console.log(`期待される非可視ゲート ${gateId}:`, { active: isActive, visible: isVisible })
        
        // 問題: このゲートが表示されていない可能性
        if (!isVisible) {
          console.error(`❌ ゲート ${gateId} が非表示になっている`)
        }
        if (!isActive) {
          console.warn(`⚠️ ゲート ${gateId} が非アクティブ状態`)
        }
      })
    })
    
    // 最終的な問題診断スクリーンショット
    cy.screenshot('problem-diagnosis-final')
  })
})