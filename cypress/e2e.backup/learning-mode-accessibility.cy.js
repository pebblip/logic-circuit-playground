/**
 * 学習モードのテスト（アクセシビリティクエリ優先版）
 */

describe('学習モード機能（アクセシビリティ版）', () => {
  beforeEach(() => {
    // アプリケーションをセットアップ（学習モード）
    cy.setupApp({ mode: 'learning', skipWelcome: true });
  });

  it('モード切り替えがアクセシビリティクエリで動作する', () => {
    // アクセシビリティ属性を使ってモードを切り替え
    cy.getByAriaLabel('自由モードに切り替え').click();
    cy.assertCurrentMode('free');
    
    cy.getByAriaLabel('パズルモードに切り替え').click();
    cy.assertCurrentMode('puzzle');
    
    cy.getByAriaLabel('学習モードに切り替え').click();
    cy.assertCurrentMode('learning');
  });

  it('アクティブなモードボタンが正しく識別される', () => {
    // aria-pressed属性でアクティブ状態を確認
    cy.get('[aria-label="学習モードに切り替え"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[aria-label="自由モードに切り替え"]').should('have.attr', 'aria-pressed', 'false');
    cy.get('[aria-label="パズルモードに切り替え"]').should('have.attr', 'aria-pressed', 'false');
  });

  it('学習モードのサイドパネルが表示される', () => {
    // サイドパネルの存在確認
    cy.assertSidePanelVisible(true);
    
    // 自由モードに切り替えてサイドパネルが消えることを確認
    cy.switchMode('free');
    cy.assertSidePanelVisible(false);
  });

  it('roleベースのクエリでボタンを取得できる', () => {
    // roleとnameの組み合わせ（Cypressのカスタムヘルパー使用）
    cy.getByRole('button', { name: '学習モード' }).should('exist');
    cy.getByRole('button', { name: '自由モード' }).should('exist');
    cy.getByRole('button', { name: 'パズルモード' }).should('exist');
  });

  it('初回起動モーダルのスキップボタンもアクセシビリティクエリで取得可能', () => {
    // LocalStorageをクリアして初回起動状態にする
    cy.clearLocalStorage();
    cy.visit('/');
    
    // スキップボタンをroleで取得（フォールバック例）
    cy.get('button').contains('スキップ').click();
    
    // モード選択画面が表示される
    cy.getByAriaLabel('学習モードに切り替え').should('be.visible');
  });

  it('スクリーンショット撮影', () => {
    // 各モードの画面をキャプチャ
    cy.takeScreenshot('learning-mode-accessibility');
    
    cy.switchMode('free');
    cy.takeScreenshot('free-mode-accessibility');
    
    cy.switchMode('puzzle');
    cy.takeScreenshot('puzzle-mode-accessibility');
  });
});