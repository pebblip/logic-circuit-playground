describe('チュートリアルオーバーレイの動作確認', () => {
  beforeEach(() => {
    // ローカルストレージを完全にクリア
    cy.clearLocalStorage();
    // モード選択をスキップしないようにURLパラメータを指定
    cy.visit('/?skipMode=false', {
      onBeforeLoad: (win) => {
        win.localStorage.clear();
      }
    });
  });

  it('学習モードでチュートリアルが表示される', () => {
    // モード選択画面が表示される
    cy.contains('論理回路プレイグラウンドへようこそ！').should('be.visible');
    
    // 学習モードを選択
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // 学習モードに入ったことを確認
    cy.contains('学習ガイド').should('be.visible');
    cy.contains('学習統計').should('be.visible');
    
    // チュートリアル開始ボタンが表示される
    cy.contains('チュートリアルを開始').should('be.visible');
  });

  it('チュートリアル開始ボタンをクリックするとオーバーレイが表示される', () => {
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // チュートリアルを開始
    cy.contains('チュートリアルを開始').click();
    
    // チュートリアルオーバーレイが表示される
    cy.contains('🎉 ようこそ論理回路の世界へ！').should('be.visible');
    cy.contains('このプレイグラウンドでは、コンピュータの心臓部である論理回路を楽しく学べます。').should('be.visible');
    
    // ステップインジケータが表示される
    cy.contains('1/10').should('be.visible');
    
    // ボタンが表示される
    cy.contains('スキップ').should('be.visible');
    cy.contains('次へ').should('be.visible');
  });

  it('チュートリアルのスキップボタンが機能する', () => {
    // 学習モードでチュートリアルを開始
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    cy.contains('チュートリアルを開始').click();
    
    // チュートリアルが表示される
    cy.contains('🎉 ようこそ論理回路の世界へ！').should('be.visible');
    
    // スキップボタンをクリック
    cy.contains('スキップ').click();
    
    // チュートリアルが閉じられる
    cy.contains('🎉 ようこそ論理回路の世界へ！').should('not.exist');
    
    // 元の画面に戻る
    cy.contains('チュートリアルを開始').should('be.visible');
  });

  it('チュートリアルの次へボタンをクリックするとTODOアラートが表示される', () => {
    // alertをスタブ化
    cy.on('window:alert', (text) => {
      expect(text).to.include('TODO: ステップ進行機能は未実装です');
      expect(text).to.include('現在の実装:');
      expect(text).to.include('チュートリアルコンテンツの表示 ✅');
      expect(text).to.include('未実装:');
      expect(text).to.include('次のステップへの遷移');
    });
    
    // 学習モードでチュートリアルを開始
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    cy.contains('チュートリアルを開始').click();
    
    // 次へボタンをクリック
    cy.contains('次へ').click();
  });

  it('デモ回路一覧が表示される', () => {
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // デモ回路セクションが表示される
    cy.contains('🎮 デモ回路を試してみよう').should('be.visible');
    
    // デモ回路が表示される
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    cy.contains('D フリップフロップ').should('be.visible');
  });

  it('デモ回路をクリックすると詳細が展開される', () => {
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // デモ回路をクリック
    cy.contains('AND ゲートの基本').click();
    
    // 詳細が表示される
    cy.contains('2つの入力とANDゲートを使った最も簡単な回路です').should('be.visible');
    cy.contains('この回路を読み込む').should('be.visible');
  });

  it('デモ回路の読み込みボタンをクリックするとTODOアラートが表示される', () => {
    // alertをスタブ化
    cy.on('window:alert', (text) => {
      expect(text).to.include('TODO: デモ回路の読み込み機能は未実装です');
      expect(text).to.include('読み込もうとした回路: AND ゲートの基本');
      expect(text).to.include('現在の実装:');
      expect(text).to.include('デモ回路の一覧表示 ✅');
    });
    
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // デモ回路を展開
    cy.contains('AND ゲートの基本').click();
    
    // 読み込みボタンをクリック
    cy.contains('この回路を読み込む').click();
  });

  it('学習ガイドのレッスンをクリックするとTODOアラートが表示される', () => {
    // alertをスタブ化
    cy.on('window:alert', (text) => {
      expect(text).to.include('TODO: レッスン切り替え機能は未実装です');
      expect(text).to.include('選択されたレッスン: レッスン1');
      expect(text).to.include('現在の実装:');
      expect(text).to.include('レッスン一覧の表示 ✅');
    });
    
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // レッスンをクリック
    cy.contains('プレイグラウンドの基本操作').click();
  });

  it('タグフィルターが機能する', () => {
    // 学習モードに入る
    cy.contains('📚 学習モード').click();
    cy.contains('選択する').click();
    
    // 初期状態では全てのデモが表示される
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    cy.contains('D フリップフロップ').should('be.visible');
    
    // 基本タグをクリック
    cy.contains('button', '基本').click();
    
    // 基本タグのデモのみ表示される
    cy.contains('AND ゲートの基本').should('be.visible');
    cy.contains('OR と NOT の組み合わせ').should('be.visible');
    cy.contains('D フリップフロップ').should('not.exist');
    
    // メモリタグをクリック
    cy.contains('button', 'メモリ').click();
    
    // メモリタグのデモのみ表示される
    cy.contains('AND ゲートの基本').should('not.exist');
    cy.contains('OR と NOT の組み合わせ').should('not.exist');
    cy.contains('D フリップフロップ').should('be.visible');
  });
});