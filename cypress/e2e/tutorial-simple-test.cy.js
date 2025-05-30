describe('チュートリアル機能の基本テスト', () => {
  it('学習モードが既定で表示される', () => {
    // アプリケーションをロード（forceSkipModeSelectionで学習モードに入る）
    cy.visit('/');
    
    // 学習モードの要素が表示されることを確認
    cy.contains('学習ガイド').should('be.visible');
    cy.contains('学習統計').should('be.visible');
    cy.contains('チュートリアルを開始').should('be.visible');
  });

  it('チュートリアル開始ボタンが機能する', () => {
    cy.visit('/');
    
    // チュートリアル開始ボタンをクリック
    cy.contains('チュートリアルを開始').click();
    
    // チュートリアルオーバーレイが表示される
    cy.contains('ようこそ論理回路の世界へ').should('be.visible');
    cy.contains('次へ').should('be.visible');
    cy.contains('スキップ').should('be.visible');
  });

  it('チュートリアルをスキップできる', () => {
    cy.visit('/');
    cy.contains('チュートリアルを開始').click();
    
    // スキップボタンをクリック
    cy.contains('スキップ').click();
    
    // チュートリアルが閉じられる
    cy.contains('ようこそ論理回路の世界へ').should('not.exist');
    cy.contains('チュートリアルを開始').should('be.visible');
  });

  it('デモ回路セクションが表示される', () => {
    cy.visit('/');
    
    // デモ回路セクションの要素を確認
    cy.contains('デモ回路を試してみよう').should('be.visible');
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    cy.contains('D フリップフロップ').should('be.visible');
  });

  it('デモ回路の詳細を展開できる', () => {
    cy.visit('/');
    
    // デモ回路をクリックして展開
    cy.contains('AND ゲートの基本').click();
    
    // 詳細が表示される
    cy.contains('2つの入力とANDゲートを使った最も簡単な回路です').should('be.visible');
    cy.contains('この回路を読み込む').should('be.visible');
    
    // もう一度クリックして閉じる
    cy.contains('AND ゲートの基本').click();
    cy.contains('2つの入力とANDゲートを使った最も簡単な回路です').should('not.exist');
  });

  it('タグフィルターが機能する', () => {
    cy.visit('/');
    
    // 基本タグをクリック
    cy.contains('button', '基本').click();
    
    // 基本タグのデモのみ表示される
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    // D フリップフロップは表示されない
    cy.get('div.demo-circuits').within(() => {
      cy.contains('D フリップフロップ').should('not.exist');
    });
    
    // メモリタグをクリック
    cy.contains('button', 'メモリ').click();
    
    // メモリタグのデモのみ表示される
    cy.contains('D フリップフロップ').should('be.visible');
    cy.get('div.demo-circuits').within(() => {
      cy.contains('AND ゲートの基本').should('not.exist');
      cy.contains('OR と NOT の組み合わせ').should('not.exist');
    });
    
    // すべてタグをクリック
    cy.contains('button', 'すべて').click();
    
    // 全てのデモが表示される
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    cy.contains('D フリップフロップ').should('be.visible');
  });

  it('学習ガイドのレッスンが表示される', () => {
    cy.visit('/');
    
    // 学習ガイドの各レッスンが表示される
    cy.contains('プレイグラウンドの基本操作').should('be.visible');
    cy.contains('ANDゲートの世界').should('be.visible');
    cy.contains('ORゲートとNOTゲート').should('be.visible');
    cy.contains('組み合わせ回路を作ろう').should('be.visible');
    cy.contains('カスタムゲートの作成').should('be.visible');
    cy.contains('実践的な回路設計').should('be.visible');
  });

  it('学習統計が表示される', () => {
    cy.visit('/');
    
    // 統計の各項目が表示される
    cy.contains('0%').should('be.visible'); // 完了率
    cy.contains('0h 0m').should('be.visible'); // 学習時間
    
    // 統計項目のラベル
    cy.contains('完了率').should('be.visible');
    cy.contains('実績解除').should('be.visible');
    cy.contains('学習時間').should('be.visible');
    cy.contains('連続日数').should('be.visible');
  });
});