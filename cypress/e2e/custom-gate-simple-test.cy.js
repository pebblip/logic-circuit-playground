describe('Custom Gate Simple Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
    cy.wait(500)
  })

  it('should render custom gates with correct pins and labels', () => {
    // カスタムゲートセクションを見つける
    cy.contains('カスタムゲート').should('be.visible')
    
    // デモの半加算器をクリック（2入力、2出力）
    cy.contains('.tool-card', '半加算器').click()
    cy.wait(200)
    
    // カスタムゲートが配置されているか確認
    cy.get('.canvas [data-gate-type="CUSTOM"]').should('have.length', 1)
    
    // カスタムゲートの詳細を確認
    cy.get('.canvas [data-gate-type="CUSTOM"]').first().within(() => {
      // ゲート本体の確認
      cy.get('.custom-gate-border').should('exist')
      cy.get('.custom-gate').should('exist')
      
      // アイコンの確認
      cy.contains('➕').should('be.visible')
      
      // 入力ピンのラベルを確認
      cy.get('.pin-label').contains('A').should('be.visible')
      cy.get('.pin-label').contains('B').should('be.visible')
      
      // 出力ピンのラベルを確認
      cy.get('.pin-label').contains('S').should('be.visible')
      cy.get('.pin-label').contains('C').should('be.visible')
      
      // ピンの数を確認（各ピンに対して透明な円とビジュアルな円があるため）
      cy.get('circle[r="6"]').should('have.length', 4) // 2入力 + 2出力
    })
    
    // スクリーンショット
    cy.screenshot('custom-gate-halfadder')
    
    // MyGateも確認
    cy.contains('.tool-card', 'MyGate').click()
    cy.wait(200)
    
    cy.get('.canvas [data-gate-type="CUSTOM"]').should('have.length', 2)
    
    // MyGateの詳細を確認
    cy.get('.canvas [data-gate-type="CUSTOM"]').last().within(() => {
      // ゲート本体の確認
      cy.get('.custom-gate-border').should('exist')
      cy.get('.custom-gate').should('exist')
      
      // アイコンの確認
      cy.contains('🔧').should('be.visible')
      
      // 入力ピンのラベルを確認
      cy.get('.pin-label').contains('A').should('be.visible')
      cy.get('.pin-label').contains('B').should('be.visible')
      
      // 出力ピンのラベルを確認
      cy.get('.pin-label').contains('Y').should('be.visible')
      
      // ピンの数を確認
      cy.get('circle[r="6"]').should('have.length', 3) // 2入力 + 1出力
    })
    
    // 最終スクリーンショット
    cy.screenshot('custom-gates-both')
  })
})