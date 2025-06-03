/**
 * データ永続性のE2Eテスト
 * 保存・読込機能の基本動作のみをテスト
 */

describe('データ永続性', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
    cy.visit('/');
    cy.wait(1000);
  });

  it('回路を保存して読み込める', () => {
    // 1. 回路を作成
    cy.get('[data-testid="gate-button-INPUT"]').click();
    cy.get('svg').click(200, 200);
    
    cy.get('[data-testid="gate-button-AND"]').click();
    cy.get('svg').click(400, 200);
    
    // ゲートが配置されたことを確認
    cy.get('[data-testid^="gate-"]').should('have.length', 2);
    
    // 2. 保存ボタンをクリック
    cy.get('button').contains('保存').click({ force: true });
    
    // 3. ローカルストレージに保存されたことを確認
    cy.window().then((win) => {
      const savedCircuits = win.localStorage.getItem('logic-circuit-saves');
      expect(savedCircuits).to.not.be.null;
    });
    
    // 4. ページをリロード
    cy.reload();
    cy.wait(1000);
    
    // 5. 読込ボタンをクリック
    cy.get('button').contains('読込').click({ force: true });
    
    // 6. 保存したスロットを選択（最初のスロット）
    cy.get('button').contains('スロット').first().click({ force: true });
    
    // 7. 回路が復元されたことを確認
    cy.get('[data-testid^="gate-"]').should('have.length', 2);
  });

  it('URLで回路を共有できる', () => {
    // 1. 簡単な回路を作成
    cy.get('[data-testid="gate-button-NOT"]').click();
    cy.get('svg').click(300, 300);
    
    // 2. 共有ボタンをクリック（実装されている場合）
    cy.get('button').contains('共有').click({ force: true });
    
    // 3. URLが更新されたことを確認
    cy.url().should('include', '?circuit=');
    
    // 4. URLをコピーして新しいタブで開く（シミュレート）
    cy.url().then((url) => {
      // 新しいウィンドウでURLを開く代わりに、現在のページで再読み込み
      cy.visit(url);
      cy.wait(1000);
      
      // 5. 回路が復元されたことを確認
      cy.get('[data-testid^="gate-"]').should('have.length.at.least', 1);
    });
  });
});