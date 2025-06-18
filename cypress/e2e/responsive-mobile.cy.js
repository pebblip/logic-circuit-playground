describe('レスポンシブ対応 - モバイル', () => {
  beforeEach(() => {
    // モバイルビューポートに設定
    cy.viewport(375, 667); // iPhone 8サイズ
    cy.visit('http://localhost:5173');
  });

  it('モバイルレイアウトが正しく表示される', () => {
    // モバイルレイアウトコンテナが表示される
    cy.get('.mobile-layout').should('be.visible');
    
    // デスクトップレイアウトは表示されない
    cy.get('.desktop-layout').should('not.exist');
    
    // モバイルヘッダーが表示される
    cy.get('.mobile-header').should('be.visible');
    
    // モバイルツールバーが表示される
    cy.get('.mobile-toolbar').should('be.visible');
  });

  it('モバイル警告バナーが表示される', () => {
    // モバイル警告バナーを確認
    cy.get('.mobile-warning-banner')
      .should('be.visible')
      .should('contain', 'モバイル');
    
    // 閉じるボタンをクリック
    cy.get('.mobile-warning-banner button').click();
    
    // バナーが非表示になる
    cy.get('.mobile-warning-banner').should('not.exist');
  });

  it('ハンバーガーメニューが動作する', () => {
    // ハンバーガーメニューボタンをクリック
    cy.get('[data-testid="mobile-menu-button"]').click();
    
    // サイドメニューが表示される
    cy.get('.mobile-menu').should('be.visible');
    
    // メニュー項目が表示される
    cy.get('.mobile-menu').within(() => {
      cy.contains('フリーモード').should('be.visible');
      cy.contains('学習モード').should('be.visible');
      cy.contains('ギャラリーモード').should('be.visible');
      cy.contains('パズルモード').should('be.visible');
    });
    
    // メニュー外をクリックして閉じる
    cy.get('.mobile-menu-overlay').click();
    cy.get('.mobile-menu').should('not.be.visible');
  });

  it('モバイルでゲートを配置できる', () => {
    // ツールパレットを開く
    cy.get('[data-testid="mobile-tool-button"]').click();
    
    // ANDゲートを選択
    cy.get('[data-testid="gate-card-AND"]').click();
    
    // キャンバスをタップしてゲートを配置
    cy.get('svg.canvas').click(187, 300);
    
    // ゲートが配置されたことを確認
    cy.get('[data-testid^="gate-"]').should('have.length', 1);
  });

  it('タッチジェスチャーでゲートを移動できる', () => {
    // ANDゲートを配置
    cy.get('[data-testid="mobile-tool-button"]').click();
    cy.get('[data-testid="gate-card-AND"]').click();
    cy.get('svg.canvas').click(187, 300);
    
    // ゲートの初期位置を取得
    let initialPosition;
    cy.get('[data-testid^="gate-"]').first()
      .should(($gate) => {
        const transform = $gate.attr('transform');
        initialPosition = transform;
      });
    
    // タッチドラッグでゲートを移動
    cy.get('[data-testid^="gate-"]').first()
      .trigger('touchstart', { targetTouches: [{ clientX: 187, clientY: 300 }] })
      .trigger('touchmove', { targetTouches: [{ clientX: 250, clientY: 350 }] })
      .trigger('touchend');
    
    // ゲートが移動したことを確認
    cy.get('[data-testid^="gate-"]').first()
      .should(($gate) => {
        const transform = $gate.attr('transform');
        expect(transform).to.not.equal(initialPosition);
      });
  });

  it('モバイルシミュレーションFABが動作する', () => {
    // シミュレーションFABが表示される
    cy.get('.mobile-simulation-fab').should('be.visible');
    
    // FABをクリックしてシミュレーション開始
    cy.get('.mobile-simulation-fab').click();
    
    // シミュレーションが開始されたことを確認（FABの色が変わる）
    cy.get('.mobile-simulation-fab').should('have.class', 'active');
  });

  it('横向きモードの警告が表示される', () => {
    // 横向きに変更
    cy.viewport(667, 375);
    
    // 横向き警告メッセージが表示される
    cy.contains('縦向きでの使用を推奨').should('be.visible');
  });
});

describe('レスポンシブ対応 - タブレット', () => {
  beforeEach(() => {
    // タブレットビューポートに設定
    cy.viewport(768, 1024); // iPad
    cy.visit('http://localhost:5173');
  });

  it('タブレットレイアウトが正しく表示される', () => {
    // タブレットレイアウトコンテナが表示される
    cy.get('.tablet-layout').should('be.visible');
    
    // サイドバーが表示される（タブレットは画面が広い）
    cy.get('.tablet-sidebar').should('be.visible');
  });

  it('タブレットでのタッチ操作が可能', () => {
    // ダブルタップでズーム
    cy.get('svg.canvas')
      .trigger('touchstart', { targetTouches: [{ clientX: 400, clientY: 500 }] })
      .trigger('touchend')
      .wait(100)
      .trigger('touchstart', { targetTouches: [{ clientX: 400, clientY: 500 }] })
      .trigger('touchend');
    
    // ズームされたことを確認（viewBox変更）
    cy.get('svg.canvas').should('have.attr', 'viewBox').and('not.equal', '0 0 1200 800');
  });
});

describe('レスポンシブ対応 - 画面サイズ変更', () => {
  it('画面サイズ変更時に適切なレイアウトに切り替わる', () => {
    // デスクトップサイズから開始
    cy.viewport(1920, 1080);
    cy.visit('http://localhost:5173');
    cy.get('.desktop-layout').should('be.visible');
    
    // タブレットサイズに変更
    cy.viewport(768, 1024);
    cy.get('.tablet-layout').should('be.visible');
    cy.get('.desktop-layout').should('not.exist');
    
    // モバイルサイズに変更
    cy.viewport(375, 667);
    cy.get('.mobile-layout').should('be.visible');
    cy.get('.tablet-layout').should('not.exist');
    
    // デスクトップサイズに戻す
    cy.viewport(1920, 1080);
    cy.get('.desktop-layout').should('be.visible');
    cy.get('.mobile-layout').should('not.exist');
  });
});