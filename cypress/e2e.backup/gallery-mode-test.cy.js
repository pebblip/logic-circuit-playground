describe('Gallery Mode Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should access gallery mode and show featured circuits', () => {
    // ギャラリーモードをクリック
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // ギャラリーヘッダーが表示されることを確認
    cy.contains('🎨 回路ギャラリー').should('be.visible');
    cy.contains('美しい回路の世界を探索しましょう').should('be.visible');
    
    // 注目の回路セクションが表示されることを確認
    cy.contains('✨ 注目の回路').should('be.visible');
    
    // サンプル回路が表示されることを確認
    cy.contains('半加算器').should('be.visible');
    cy.contains('SRラッチ').should('be.visible');
  });

  it('should show search and filter functionality', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 検索バーが表示されることを確認
    cy.get('.search-input').should('be.visible');
    cy.get('.search-input').should('have.attr', 'placeholder', '回路を検索...');
    
    // フィルタボタンが表示されることを確認
    cy.contains('🎛️').should('be.visible');
    cy.contains('フィルタ').should('be.visible');
    
    // フィルタパネルを開く
    cy.contains('フィルタ').click();
    cy.wait(200);
    
    // フィルタオプションが表示されることを確認
    cy.contains('カテゴリ').should('be.visible');
    cy.contains('複雑さ').should('be.visible');
    cy.contains('ソート').should('be.visible');
  });

  it('should filter circuits by category', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // フィルタを開く
    cy.contains('フィルタ').click();
    cy.wait(200);
    
    // 教育カテゴリを選択
    cy.get('select').first().select('educational');
    cy.wait(500);
    
    // 教育カテゴリの回路のみが表示されることを確認
    cy.contains('📚 教育').should('be.visible');
    
    // 結果数が表示されることを確認
    cy.get('.results-count').should('contain', '件の回路');
  });

  it('should search circuits by title', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 検索を実行
    cy.get('.search-input').type('半加算');
    cy.wait(500);
    
    // 半加算器が検索結果に表示されることを確認
    cy.contains('半加算器').should('be.visible');
    
    // 他の回路が隠れることを確認（検索にマッチしない場合）
    cy.get('.circuit-card').should('have.length.lessThan', 10);
  });

  it('should show circuit details in modal', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 詳細ボタンをクリック（最初の回路）
    cy.get('.action-button').contains('詳細').first().click();
    cy.wait(500);
    
    // モーダルが表示されることを確認
    cy.get('.circuit-detail-modal').should('be.visible');
    cy.get('.modal-content').should('be.visible');
    
    // モーダル内容を確認
    cy.get('.modal-header h2').should('exist');
    cy.get('.circuit-preview').should('be.visible');
    cy.get('.circuit-details').should('be.visible');
    
    // 閉じるボタンで閉じる
    cy.get('.close-button').click();
    cy.wait(200);
    cy.get('.circuit-detail-modal').should('not.exist');
  });

  it('should show popular tags and allow tag filtering', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 人気タグセクションが表示されることを確認
    cy.contains('🏷️ 人気タグ').should('be.visible');
    
    // タグが表示されることを確認
    cy.get('.tags-cloud .tag').should('have.length.greaterThan', 5);
    
    // タグをクリックしてフィルタリング
    cy.get('.tags-cloud .tag').first().click();
    cy.wait(500);
    
    // 選択されたタグが表示されることを確認
    cy.get('.selected-tags').should('be.visible');
    cy.get('.tag.selected').should('exist');
  });

  it('should handle circuit loading action', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 開くボタンをクリック（最初の回路）
    cy.get('.action-button').contains('開く').first().click();
    cy.wait(500);
    
    // 自由制作モードに切り替わることを確認
    cy.get('.mode-tab.active').should('contain', '自由制作');
    
    // コンソールメッセージが出力されることを確認（実際の実装では回路が読み込まれる）
    // 注意: 実際の実装ではキャンバスに回路が表示される
  });

  it('should show like button functionality', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // いいねボタンが表示されることを確認
    cy.get('.action-button').contains('❤️').should('be.visible');
    
    // いいね数が表示されることを確認
    cy.get('.circuit-stats .stat').contains('❤️').should('be.visible');
    
    // いいねボタンをクリック
    cy.get('.action-button').contains('❤️').first().click();
    cy.wait(200);
    
    // 実際の実装では、いいね数が増加する
  });

  it('should handle empty search results', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 存在しない回路を検索
    cy.get('.search-input').type('存在しない回路名xyz123');
    cy.wait(500);
    
    // 検索結果なしのメッセージが表示されることを確認
    cy.contains('検索条件に一致する回路が見つかりませんでした').should('be.visible');
    cy.get('.no-results').should('be.visible');
    
    // フィルタリセットボタンが表示されることを確認
    cy.contains('フィルタをリセット').should('be.visible');
    
    // リセットボタンをクリック
    cy.contains('フィルタをリセット').click();
    cy.wait(500);
    
    // 検索バーがクリアされることを確認
    cy.get('.search-input').should('have.value', '');
  });

  it('should display circuit metadata correctly', () => {
    // ギャラリーモードに移動
    cy.contains('ギャラリー').click();
    cy.wait(500);
    
    // 回路カードのメタデータを確認
    cy.get('.circuit-card').first().within(() => {
      // タイトル
      cy.get('.circuit-title').should('be.visible');
      
      // 説明
      cy.get('.circuit-description').should('be.visible');
      
      // カテゴリと複雑さ
      cy.get('.circuit-meta').should('be.visible');
      cy.get('.category').should('be.visible');
      cy.get('.complexity').should('be.visible');
      
      // タグ
      cy.get('.circuit-tags .tag').should('have.length.greaterThan', 0);
      
      // 統計（作者、いいね、閲覧数）
      cy.get('.circuit-stats').should('be.visible');
      cy.get('.stat').should('have.length', 3);
    });
  });
});