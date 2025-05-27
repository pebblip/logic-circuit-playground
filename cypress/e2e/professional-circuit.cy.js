describe('Professional Circuit UI/UX Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('日本語UI', () => {
    it('すべてのUI要素が日本語で表示される', () => {
      // ヘッダー
      cy.contains('h1', '論理回路プレイグラウンド').should('be.visible')
      cy.contains('button', 'ヘルプ').should('be.visible')
      cy.contains('button', 'クリア').should('be.visible')
      
      // ツールバー
      cy.contains('button', '入力').should('be.visible')
      cy.contains('button', '出力').should('be.visible')
      cy.contains('button', 'AND').should('be.visible')
      cy.contains('button', 'OR').should('be.visible')
      cy.contains('button', 'NOT').should('be.visible')
    })
  })

  describe('ゲート配置', () => {
    it('1クリックで入力ゲートを配置できる', () => {
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.get('g[data-type="INPUT"]').should('have.length', 1)
      cy.get('g[data-type="INPUT"] text').contains('▶')
    })

    it('1クリックで出力ゲートを配置できる', () => {
      cy.contains('button', '出力').click()
      cy.get('svg').click(200, 100)
      cy.get('g[data-type="OUTPUT"]').should('have.length', 1)
      cy.get('g[data-type="OUTPUT"] text').contains('■')
    })

    it('ANDゲートを配置できる', () => {
      cy.contains('button', 'AND').click()
      cy.get('svg').click(150, 150)
      cy.get('g[data-type="AND"]').should('have.length', 1)
      cy.get('g[data-type="AND"] text').contains('AND')
    })

    it('ORゲートを配置できる', () => {
      cy.contains('button', 'OR').click()
      cy.get('svg').click(150, 150)
      cy.get('g[data-type="OR"]').should('have.length', 1)
      cy.get('g[data-type="OR"] text').contains('OR')
    })

    it('NOTゲートを配置できる', () => {
      cy.contains('button', 'NOT').click()
      cy.get('svg').click(150, 150)
      cy.get('g[data-type="NOT"]').should('have.length', 1)
      cy.get('g[data-type="NOT"] text').contains('NOT')
    })
  })

  describe('ワイヤー接続', () => {
    beforeEach(() => {
      // 入力、AND、出力を配置
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.contains('button', 'AND').click()
      cy.get('svg').click(250, 100)
      cy.contains('button', '出力').click()
      cy.get('svg').click(400, 100)
    })

    it('入力からANDゲートに接続できる', () => {
      // 入力の出力端子から
      cy.get('g[data-type="INPUT"] circle[data-terminal="output"]').click()
      // ANDの入力端子へ
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:first').click()
      
      cy.get('line.wire').should('have.length', 1)
    })

    it('ANDゲートに2つの入力を接続できる', () => {
      // 2つ目の入力を追加
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 200)
      
      // 1つ目の接続
      cy.get('g[data-type="INPUT"]:first circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:first').click()
      
      // 2つ目の接続
      cy.get('g[data-type="INPUT"]:last circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:last').click()
      
      cy.get('line.wire').should('have.length', 2)
    })

    it('ANDゲートから出力に接続できる', () => {
      cy.get('g[data-type="AND"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="OUTPUT"] circle[data-terminal="input"]').click()
      
      cy.get('line.wire').should('have.length', 1)
    })
  })

  describe('回路シミュレーション', () => {
    beforeEach(() => {
      // AND回路を構築
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 200)
      cy.contains('button', 'AND').click()
      cy.get('svg').click(250, 150)
      cy.contains('button', '出力').click()
      cy.get('svg').click(400, 150)
      
      // 接続
      cy.get('g[data-type="INPUT"]:first circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:first').click()
      cy.get('g[data-type="INPUT"]:last circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:last').click()
      cy.get('g[data-type="AND"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="OUTPUT"] circle[data-terminal="input"]').click()
    })

    it('AND論理が正しく動作する', () => {
      // 両方OFF -> 出力OFF
      cy.get('g[data-type="OUTPUT"]').should('have.attr', 'data-active', 'false')
      
      // 1つ目をON
      cy.get('g[data-type="INPUT"]:first').click()
      cy.get('g[data-type="OUTPUT"]').should('have.attr', 'data-active', 'false')
      
      // 両方ON -> 出力ON
      cy.get('g[data-type="INPUT"]:last').click()
      cy.get('g[data-type="OUTPUT"]').should('have.attr', 'data-active', 'true')
    })
  })

  describe('ドラッグ操作', () => {
    it('ゲートをドラッグで移動できる', () => {
      cy.contains('button', 'AND').click()
      cy.get('svg').click(200, 200)
      
      cy.get('g[data-type="AND"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300, clientY: 300 })
        .trigger('mouseup')
      
      cy.get('g[data-type="AND"]').should('have.attr', 'transform', 'translate(300, 300)')
    })

    it('接続されたワイヤーも追従する', () => {
      // 入力とANDを配置して接続
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.contains('button', 'AND').click()
      cy.get('svg').click(250, 100)
      
      cy.get('g[data-type="INPUT"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:first').click()
      
      // ANDを移動
      cy.get('g[data-type="AND"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300, clientY: 200 })
        .trigger('mouseup')
      
      // ワイヤーの終点が新しい位置に
      cy.get('line.wire')
        .should('have.attr', 'x2', '260')
        .should('have.attr', 'y2', '180')
    })
  })

  describe('UIインタラクション', () => {
    it('クリアボタンですべてのゲートが削除される', () => {
      // いくつかゲートを配置
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.contains('button', 'AND').click()
      cy.get('svg').click(200, 100)
      
      cy.get('g[data-gate-id]').should('have.length', 2)
      
      // クリア
      cy.contains('button', 'クリア').click()
      cy.get('g[data-gate-id]').should('have.length', 0)
    })

    it('ツールバーボタンの選択状態が視覚的にわかる', () => {
      cy.contains('button', 'AND').click()
      cy.contains('button', 'AND').should('have.class', 'bg-blue-100')
      
      cy.contains('button', 'OR').click()
      cy.contains('button', 'AND').should('not.have.class', 'bg-blue-100')
      cy.contains('button', 'OR').should('have.class', 'bg-blue-100')
    })

    it('ESCキーで選択解除', () => {
      cy.contains('button', 'AND').click()
      cy.contains('button', 'AND').should('have.class', 'bg-blue-100')
      
      cy.get('body').type('{esc}')
      cy.contains('button', 'AND').should('not.have.class', 'bg-blue-100')
    })
  })

  describe('視覚的デザイン', () => {
    it('ゲートに適切な内部余白がある', () => {
      cy.contains('button', 'AND').click()
      cy.get('svg').click(200, 200)
      
      // ANDゲートのサイズを確認
      cy.get('g[data-type="AND"] path').then($path => {
        const d = $path.attr('d')
        expect(d).to.include('M 160') // x-40
        expect(d).to.include('L 260') // x+20 to x+40
      })
    })

    it('アイコンが明確に見える', () => {
      cy.contains('button', '入力').click()
      cy.get('svg').click(100, 100)
      cy.contains('button', '出力').click()
      cy.get('svg').click(200, 100)
      
      // フォントサイズとウェイトを確認
      cy.get('g[data-type="INPUT"] text')
        .should('have.attr', 'font-size', '20')
        .should('have.attr', 'font-weight', '700')
      
      cy.get('g[data-type="OUTPUT"] text')
        .should('have.attr', 'font-size', '20')
        .should('have.attr', 'font-weight', '700')
    })
  })
})