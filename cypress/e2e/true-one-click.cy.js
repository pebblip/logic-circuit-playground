describe('真の1クリック配置テスト', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('ボタンを1回クリックするだけでゲートが配置される', () => {
    // 配置前：ゲートが0個
    cy.get('g[data-gate-id]').should('have.length', 0)
    
    // 入力ボタンを1回クリック
    cy.contains('button', '入力').click()
    
    // クリック後：ゲートが1個配置されている
    cy.get('g[data-gate-id]').should('have.length', 1)
    cy.get('g[data-type="INPUT"]').should('exist')
    
    // キャンバスをクリックしていないことを確認
    // （追加のゲートは配置されない）
  })

  it('連続でボタンをクリックすると複数配置される', () => {
    // ANDボタンを3回クリック
    cy.contains('button', 'AND').click()
    cy.contains('button', 'AND').click()
    cy.contains('button', 'AND').click()
    
    // 3個のANDゲートが配置される
    cy.get('g[data-type="AND"]').should('have.length', 3)
  })

  it('異なるゲートタイプも即座に配置される', () => {
    // 各ボタンを1回ずつクリック
    cy.contains('button', '入力').click()
    cy.contains('button', 'AND').click()
    cy.contains('button', 'OR').click()
    cy.contains('button', 'NOT').click()
    cy.contains('button', '出力').click()
    
    // 5個のゲートが配置される
    cy.get('g[data-gate-id]').should('have.length', 5)
    cy.get('g[data-type="INPUT"]').should('have.length', 1)
    cy.get('g[data-type="AND"]').should('have.length', 1)
    cy.get('g[data-type="OR"]').should('have.length', 1)
    cy.get('g[data-type="NOT"]').should('have.length', 1)
    cy.get('g[data-type="OUTPUT"]').should('have.length', 1)
  })

  it('配置されたゲートは重ならない', () => {
    // 10個のゲートを配置
    for (let i = 0; i < 10; i++) {
      cy.contains('button', 'AND').click()
    }
    
    // 位置情報を取得して重複がないか確認
    const positions = [];
    cy.get('g[data-type="AND"]').each(($el) => {
      const transform = $el.attr('transform');
      const match = transform.match(/translate\((\d+),\s*(\d+)\)/);
      if (match) {
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        
        // 他のゲートと80px以上離れているか確認
        positions.forEach(pos => {
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          expect(distance).to.be.at.least(80);
        });
        
        positions.push({ x, y });
      }
    });
  })
})