describe('回路共有機能', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720);
  });

  it('回路を共有URLで共有できる', () => {
    // ゲートを配置
    cy.get('[data-testid="AND-button"]').click({ force: true });
    cy.get('.main-canvas').click(200, 200);
    cy.wait(200);
    
    cy.get('[data-testid="OR-button"]').click({ force: true });
    cy.get('.main-canvas').click(400, 200);
    cy.wait(200);

    // 共有ボタンをクリック
    cy.get('.header-actions').contains('共有').click();

    // 共有ダイアログが開く
    cy.get('.share-dialog').should('be.visible');
    
    // 回路名と説明を入力
    cy.get('#circuit-name').type('テスト回路');
    cy.get('#circuit-description').type('ANDとORゲートのテスト');

    // 共有URLを生成
    cy.get('.generate-button').click();

    // URLが生成される
    cy.get('.url-container input').should('have.value')
      .and('include', '?circuit=');

    // コピーボタンをクリック
    cy.get('.copy-button').click();
    cy.get('.copy-button').should('contain', '✅');

    // URLを取得
    cy.get('.url-container input').invoke('val').then((shareUrl) => {
      // ダイアログを閉じる
      cy.get('.close-button').click();
      
      // 回路をクリア
      cy.get('svg.circuit-canvas').rightclick();
      cy.contains('すべてクリア').click();

      // 共有URLにアクセス
      cy.visit(shareUrl);

      // 回路が読み込まれることを確認
      cy.get('.gate-container[data-gate-type="AND"]').should('exist');
      cy.get('.gate-container[data-gate-type="OR"]').should('exist');
      
      // 成功メッセージが表示される
      cy.get('[data-testid="share-load-message"]').should('be.visible');
    });
  });

  it('空の回路では共有できないことを確認', () => {
    // 共有ボタンをクリック
    cy.get('.header-actions').contains('共有').click();

    // エラーメッセージが表示される
    cy.get('.empty-circuit-message').should('be.visible');
    cy.get('[data-testid="empty-circuit-message"]').should('be.visible');
  });

  it('無効な共有URLはエラーになる', () => {
    // 無効なURLにアクセス
    cy.visit('/?circuit=invalid_data');

    // エラーは表示されないが、回路は読み込まれない
    cy.get('.gate-container').should('not.exist');
  });
});