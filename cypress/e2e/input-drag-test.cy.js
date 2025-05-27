describe('入力ゲートのドラッグテスト', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('入力ゲートをドラッグしても値が変わらない', () => {
    // 入力ゲートを配置
    cy.contains('button', '入力').click()
    
    // 初期状態はOFF
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'false')
    
    // クリックしてONにする
    cy.get('g[data-type="INPUT"]').click()
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
    
    // ドラッグする
    cy.get('g[data-type="INPUT"]')
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 400, clientY: 400 })
      .trigger('mouseup')
    
    // 値は変わらずONのまま
    cy.wait(200) // setTimeoutを考慮
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
  })

  it('ドラッグせずにクリックした場合は値が切り替わる', () => {
    // 入力ゲートを配置
    cy.contains('button', '入力').click()
    
    // 初期状態はOFF
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'false')
    
    // クリックしてONにする
    cy.get('g[data-type="INPUT"]').click()
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
    
    // もう一度クリックしてOFFにする
    cy.get('g[data-type="INPUT"]').click()
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'false')
  })

  it('わずかな移動（5px以下）はドラッグとみなさない', () => {
    // 入力ゲートを配置
    cy.contains('button', '入力').click()
    
    // ONにする
    cy.get('g[data-type="INPUT"]').click()
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
    
    // わずかに動かす（3px）
    cy.get('g[data-type="INPUT"]').then($el => {
      const transform = $el.attr('transform')
      const match = transform.match(/translate\((\d+),\s*(\d+)\)/)
      const x = parseInt(match[1])
      const y = parseInt(match[2])
      
      cy.get('g[data-type="INPUT"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: x + 3, clientY: y })
        .trigger('mouseup')
    })
    
    // 値はONのまま
    cy.wait(200)
    cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
  })
})