describe('Custom Gate Pin Rendering Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
    cy.wait(500)
  })

  it('should render custom gates with correct number of pins', () => {
    // カスタムゲートセクションを見つける
    cy.contains('カスタムゲート').should('be.visible')
    
    // デモの半加算器をクリック（2入力、2出力）
    cy.contains('.tool-card', '半加算器').click()
    cy.wait(200)
    
    // カスタムゲートが配置されているか確認（キャンバス上のゲートのみ）
    const customGates = cy.get('.canvas [data-gate-type="CUSTOM"]')
    customGates.should('have.length', 1)
    
    // ピンの数を確認
    customGates.first().within(() => {
      // 入力ピンを確認（2つあるはず）
      cy.get('.pin.input-pin').should('have.length', 2)
      
      // 出力ピンを確認（2つあるはず）
      cy.get('.pin.output-pin').should('have.length', 2)
      
      // ピンのラベルを確認
      cy.get('.pin-label').contains('A').should('be.visible')
      cy.get('.pin-label').contains('B').should('be.visible')
      cy.get('.pin-label').contains('S').should('be.visible')
      cy.get('.pin-label').contains('C').should('be.visible')
    })
    
    // デモのMyGateをクリック（2入力、1出力）
    cy.contains('.tool-card', 'MyGate').click()
    cy.wait(200)
    
    // 2つ目のカスタムゲートを確認（キャンバス上のゲートのみ）
    cy.get('.canvas [data-gate-type="CUSTOM"]').should('have.length', 2)
    
    // 2つ目のゲートのピンを確認
    cy.get('.canvas [data-gate-type="CUSTOM"]').last().within(() => {
      // 入力ピンを確認（2つあるはず）
      cy.get('.pin.input-pin').should('have.length', 2)
      
      // 出力ピンを確認（1つだけ）
      cy.get('.pin.output-pin').should('have.length', 1)
      
      // ピンのラベルを確認
      cy.get('.pin-label').contains('A').should('be.visible')
      cy.get('.pin-label').contains('B').should('be.visible')
      cy.get('.pin-label').contains('Y').should('be.visible')
    })
    
    // スクリーンショットを撮る
    cy.screenshot('custom-gates-with-pins')
  })
  
  it('should handle wire connections to custom gate pins', () => {
    // INPUTゲートを2つ配置
    cy.contains('.tool-card', 'INPUT').click()
    cy.wait(200)
    cy.contains('.tool-card', 'INPUT').click()
    cy.wait(200)
    
    // OUTPUTゲートを2つ配置
    cy.contains('.tool-card', 'OUTPUT').click()
    cy.wait(200)
    cy.contains('.tool-card', 'OUTPUT').click()
    cy.wait(200)
    
    // カスタムゲート（半加算器）を配置
    cy.contains('.tool-card', '半加算器').click()
    cy.wait(200)
    
    // INPUTゲートをカスタムゲートの近くに移動
    cy.get('.canvas [data-gate-type="INPUT"]').first().trigger('mousedown')
    cy.get('body').trigger('mousemove', { clientX: 200, clientY: 200 })
    cy.get('body').trigger('mouseup')
    
    cy.get('.canvas [data-gate-type="INPUT"]').last().trigger('mousedown')
    cy.get('body').trigger('mousemove', { clientX: 200, clientY: 250 })
    cy.get('body').trigger('mouseup')
    
    // OUTPUTゲートをカスタムゲートの右側に移動
    cy.get('.canvas [data-gate-type="OUTPUT"]').first().trigger('mousedown')
    cy.get('body').trigger('mousemove', { clientX: 500, clientY: 200 })
    cy.get('body').trigger('mouseup')
    
    cy.get('.canvas [data-gate-type="OUTPUT"]').last().trigger('mousedown')
    cy.get('body').trigger('mousemove', { clientX: 500, clientY: 250 })
    cy.get('body').trigger('mouseup')
    
    // ワイヤー接続を作成
    // INPUT1 → カスタムゲートの入力A
    cy.get('.canvas [data-gate-type="INPUT"]').first().find('circle[r="15"]').last().click()
    cy.get('.canvas [data-gate-type="CUSTOM"]').find('circle[r="15"]').first().click()
    
    // INPUT2 → カスタムゲートの入力B
    cy.get('.canvas [data-gate-type="INPUT"]').last().find('circle[r="15"]').last().click()
    cy.get('.canvas [data-gate-type="CUSTOM"]').find('g').eq(0).find('circle[r="15"]').eq(1).click()
    
    // カスタムゲートの出力S → OUTPUT1
    cy.get('.canvas [data-gate-type="CUSTOM"]').find('g').eq(0).find('circle[r="15"]').eq(2).click()
    cy.get('.canvas [data-gate-type="OUTPUT"]').first().find('circle[r="15"]').first().click()
    
    // カスタムゲートの出力C → OUTPUT2
    cy.get('.canvas [data-gate-type="CUSTOM"]').find('g').eq(0).find('circle[r="15"]').eq(3).click()
    cy.get('.canvas [data-gate-type="OUTPUT"]').last().find('circle[r="15"]').first().click()
    
    // ワイヤーが4本作成されているか確認
    cy.get('.wire').should('have.length', 4)
    
    // スクリーンショット
    cy.screenshot('custom-gate-wired')
  })
})