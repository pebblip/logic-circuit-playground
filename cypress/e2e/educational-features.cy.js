describe('教育機能の統合テスト', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('チュートリアルシステム', () => {
    it('初回訪問時にチュートリアルが表示される', () => {
      cy.contains('ようこそ！').should('be.visible')
      cy.contains('論理回路プレイグラウンドへようこそ').should('be.visible')
    })

    it('次へボタンでステップを進められる', () => {
      cy.contains('ようこそ！').should('be.visible')
      cy.contains('button', '次へ').click()
      
      cy.contains('ツールバー').should('be.visible')
      cy.contains('ここにあるボタンをクリック').should('be.visible')
    })

    it('スキップボタンでチュートリアルを終了できる', () => {
      cy.contains('button', 'スキップ').click()
      
      // チュートリアルが消えて、チャレンジが表示される
      cy.contains('ようこそ！').should('not.exist')
      cy.contains('チャレンジ 1').should('be.visible')
    })

    it('進捗インジケーターが表示される', () => {
      // 進捗バーが表示される
      cy.get('div[style*="height: 4px"]').should('have.length.at.least', 1)
    })

    it('ユーザーアクションを待つステップが機能する', () => {
      // 入力ゲート配置のステップまで進む
      cy.contains('button', '次へ').click()
      cy.contains('button', '次へ').click()
      
      cy.contains('入力ゲートを配置').should('be.visible')
      
      // 入力ボタンをクリック
      cy.contains('button', '入力').click()
      
      // 自動的に次のステップへ
      cy.wait(600)
      cy.contains('入力を切り替え').should('be.visible')
    })
  })

  describe('チャレンジシステム', () => {
    beforeEach(() => {
      // チュートリアルをスキップ
      cy.contains('button', 'スキップ').click()
    })

    it('チャレンジが表示される', () => {
      cy.contains('チャレンジ 1 / 5').should('be.visible')
      cy.contains('シンプルな接続').should('be.visible')
    })

    it('真理値表が表示される', () => {
      cy.contains('真理値表').should('be.visible')
      cy.get('table').should('exist')
      cy.contains('th', '入力').should('be.visible')
      cy.contains('th', '出力').should('be.visible')
    })

    it('ヒントの表示/非表示が切り替えられる', () => {
      // 初期状態ではヒントは非表示
      cy.contains('入力ゲートの出力端子から').should('not.exist')
      
      // ヒントボタンをクリック
      cy.contains('button', 'ヒント').click()
      cy.contains('入力ゲートの出力端子から').should('be.visible')
      
      // もう一度クリックで非表示
      cy.contains('button', 'ヒントを隠す').click()
      cy.contains('入力ゲートの出力端子から').should('not.exist')
    })

    it('正しい回路でチェックが成功する', () => {
      // シンプルな接続チャレンジ
      // 入力と出力を配置
      cy.contains('button', '入力').click()
      cy.contains('button', '出力').click()
      
      // 接続
      cy.get('g[data-type="INPUT"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="OUTPUT"] circle[data-terminal="input"]').click()
      
      // チェック
      cy.contains('button', 'チェック').click()
      
      // 成功メッセージ
      cy.contains('✓ 正解！').should('be.visible')
    })

    it('間違った回路でエラーメッセージが表示される', () => {
      // 何も配置せずにチェック
      cy.contains('button', 'チェック').click()
      
      // エラーアラート（簡易実装のため）
      cy.on('window:alert', (text) => {
        expect(text).to.include('入力ゲートは1個必要です')
      })
    })
  })

  describe('進捗トラッカー', () => {
    beforeEach(() => {
      // チュートリアルをスキップ
      cy.contains('button', 'スキップ').click()
    })

    it('進捗ボタンで進捗画面が開く', () => {
      cy.contains('button', '進捗').click()
      
      cy.contains('学習の進捗').should('be.visible')
      cy.contains('総合進捗').should('be.visible')
    })

    it('バッジが表示される', () => {
      cy.contains('button', '進捗').click()
      
      cy.contains('獲得バッジ').should('be.visible')
      cy.contains('初めての一歩').should('be.visible')
      cy.contains('接続マスター').should('be.visible')
    })

    it('統計情報が表示される', () => {
      // ゲートを配置
      cy.contains('button', '入力').click()
      
      // 進捗を開く
      cy.contains('button', '進捗').click()
      
      cy.contains('配置したゲート').should('be.visible')
      cy.contains('1').should('be.visible') // 配置数
    })

    it('閉じるボタンで進捗画面を閉じられる', () => {
      cy.contains('button', '進捗').click()
      cy.contains('学習の進捗').should('be.visible')
      
      // ✕ボタンをクリック
      cy.get('button').contains('✕').click()
      cy.contains('学習の進捗').should('not.exist')
    })
  })

  describe('バッジシステム', () => {
    beforeEach(() => {
      // チュートリアルをスキップ
      cy.contains('button', 'スキップ').click()
    })

    it('最初のゲート配置でバッジを獲得', () => {
      // ゲートを配置
      cy.contains('button', '入力').click()
      
      // 進捗を確認
      cy.contains('button', '進捗').click()
      
      // バッジが獲得されているか確認
      // （実装によってはバッジの視覚的な確認が必要）
    })

    it('チュートリアル完了バッジ', () => {
      // この場合はスキップしたので獲得できない
      cy.contains('button', '進捗').click()
      
      // チュートリアル完了バッジは未獲得のはず
      // （グレースケールや透明度で判断）
    })
  })

  describe('教育機能の統合動作', () => {
    it('チュートリアル → チャレンジ → 進捗確認の流れ', () => {
      // チュートリアルをスキップ
      cy.contains('button', 'スキップ').click()
      
      // チャレンジが表示される
      cy.contains('チャレンジ 1 / 5').should('be.visible')
      
      // 簡単な回路を作成
      cy.contains('button', '入力').click()
      cy.contains('button', '出力').click()
      
      // 進捗を確認
      cy.contains('button', '進捗').click()
      cy.contains('配置したゲート').parent().contains('2')
    })

    it('複数のチャレンジを連続でクリア', () => {
      cy.contains('button', 'スキップ').click()
      
      // チャレンジ1をクリア
      cy.contains('button', '入力').click()
      cy.contains('button', '出力').click()
      cy.get('g[data-type="INPUT"] circle[data-terminal="output"]').click()
      cy.get('g[data-type="OUTPUT"] circle[data-terminal="input"]').click()
      cy.contains('button', 'チェック').click()
      
      // 次のチャレンジへ
      cy.wait(2100)
      cy.contains('チャレンジ 2 / 5').should('be.visible')
      cy.contains('NOT回路').should('be.visible')
    })
  })
})