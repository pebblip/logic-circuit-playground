describe('UltraModernCircuit - 基本機能テスト', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  // キャンバスのセレクタを定義
  const canvas = () => cy.get('svg[width="100%"][height="calc(100% - 60px)"]')

  describe('1クリック配置', () => {
    it('ツールを選択して1クリックでゲートを配置できる', () => {
      // 入力ゲートを選択
      cy.contains('button', '入力').click()
      
      // キャンバスを1回クリック
      canvas().click(200, 200)
      
      // ゲートが配置されていることを確認
      cy.get('g[data-gate-id]').should('have.length', 1)
      cy.get('g[data-type="INPUT"]').should('exist')
    })

    it('複数のゲートを連続で配置できる', () => {
      // ANDゲートを選択
      cy.contains('button', 'AND').click()
      
      // 3つ配置
      canvas().click(100, 100)
      canvas().click(200, 100)
      canvas().click(300, 100)
      
      // 3つのANDゲートが配置されていることを確認
      cy.get('g[data-type="AND"]').should('have.length', 3)
    })

    it('ESCキーで選択を解除できる', () => {
      // ORゲートを選択
      cy.contains('button', 'OR').click()
      
      // ESCキーを押す
      cy.get('body').type('{esc}')
      
      // キャンバスをクリックしてもゲートが配置されない
      canvas().click(200, 200)
      cy.get('g[data-gate-id]').should('have.length', 0)
    })
  })

  describe('ワイヤー接続', () => {
    beforeEach(() => {
      // 入力、AND、出力を配置
      cy.contains('button', '入力').click()
      canvas().click(100, 200)
      cy.contains('button', 'AND').click()
      canvas().click(250, 200)
      cy.contains('button', '出力').click()
      canvas().click(400, 200)
      cy.get('body').type('{esc}') // 選択解除
    })

    it('ゲート間を接続できる', () => {
      // 入力からANDへ接続
      cy.get('g[data-type="INPUT"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="AND"] circle[data-terminal="input"]:first').click()
      
      cy.get('path.wire').should('have.length', 1)
    })
  })

  describe('入力トグル', () => {
    it('入力ゲートをクリックでON/OFFできる', () => {
      cy.contains('button', '入力').click()
      canvas().click(200, 200)
      cy.get('body').type('{esc}')
      
      // 初期状態はOFF
      cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'false')
      
      // クリックしてONに
      cy.get('g[data-type="INPUT"]').click()
      cy.get('g[data-type="INPUT"]').should('have.attr', 'data-active', 'true')
    })
  })

  describe('ゲート削除', () => {
    it('右クリックでゲートを削除できる', () => {
      cy.contains('button', 'NOT').click()
      canvas().click(200, 200)
      cy.get('body').type('{esc}')
      
      cy.get('g[data-type="NOT"]').should('exist')
      
      // 右クリックで削除
      cy.get('g[data-type="NOT"]').rightclick()
      cy.get('g[data-type="NOT"]').should('not.exist')
    })
  })

  describe('UI要素', () => {
    it('日本語UIが表示される', () => {
      cy.contains('h1', '論理回路プレイグラウンド').should('be.visible')
      cy.contains('button', 'ヘルプ').should('be.visible')
      cy.contains('button', 'クリア').should('be.visible')
    })

    it('クリアボタンで全ゲートが削除される', () => {
      // いくつかゲートを配置
      cy.contains('button', '入力').click()
      canvas().click(100, 100)
      canvas().click(200, 100)
      cy.get('body').type('{esc}')
      
      cy.get('g[data-gate-id]').should('have.length', 2)
      
      // クリア
      cy.contains('button', 'クリア').click()
      cy.get('g[data-gate-id]').should('have.length', 0)
    })

    it('ヘルプが右サイドに表示される', () => {
      cy.contains('button', 'ヘルプ').click()
      
      // ヘルプウィンドウが右側に表示される
      cy.contains('h2', '操作方法')
        .parent()
        .should('have.css', 'right', '20px')
        .should('have.css', 'top', '80px')
    })
  })
})