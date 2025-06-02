describe('学習モードテスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('学習モードタブをクリックするとパネルが開く', () => {
    // ヘッダーのモードタブを探す
    cy.get('.mode-tabs').should('exist');
    
    // 最初は自由制作モードがアクティブ
    cy.get('.mode-tab.active').should('contain', '自由制作');
    
    // 最初はパネルが表示されていない
    cy.get('.learning-panel').should('not.exist');
    
    // 学習モードタブをクリック
    cy.get('.mode-tab').contains('学習モード').click();
    
    // 学習モードがアクティブになる
    cy.get('.mode-tab.active').should('contain', '学習モード');
    
    // パネルが表示される
    cy.get('.learning-panel').should('be.visible');
    
    // レッスンカテゴリーが表示される
    cy.get('.lesson-category').should('have.length', 2);
    
    // 基本ゲートカテゴリーが表示される
    cy.contains('基本ゲート').should('be.visible');
    
    // NOTゲートレッスンが表示される
    cy.contains('はじめてのNOTゲート').should('be.visible');
    
    // スクリーンショットを撮る
    cy.screenshot('learning-panel-open');
  });

  it('レッスンを選択して開始できる', () => {
    // 学習モードを開く
    cy.get('.mode-tab').contains('学習モード').click();
    
    // NOTゲートレッスンをクリック
    cy.contains('はじめてのNOTゲート').click();
    
    // レッスンが開始される
    cy.contains('ようこそ！').should('be.visible');
    
    // 進捗が表示される
    cy.contains('1 / 10').should('be.visible');
    
    cy.screenshot('lesson-started');
  });

  it('閉じるボタンでパネルを閉じることができる', () => {
    // 学習モードを開く
    cy.get('.mode-tab').contains('学習モード').click();
    
    // パネルが表示される
    cy.get('.learning-panel').should('be.visible');
    
    // 閉じるボタンをクリック
    cy.get('.close-button').click();
    
    // パネルが非表示になる
    cy.get('.learning-panel').should('not.exist');
    
    // 自由制作モードに戻る
    cy.get('.mode-tab.active').should('contain', '自由制作');
  });
});