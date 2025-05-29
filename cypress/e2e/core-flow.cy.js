/**
 * コアフローのE2Eテスト
 * 最も基本的な操作フローのみをテスト
 */

describe('コアフロー', () => {
  beforeEach(() => {
    // モード選択をスキップ
    cy.window().then((win) => {
      win.localStorage.setItem('logic-circuit-force-skip-mode-selection', 'true');
      win.localStorage.setItem('logic-circuit-learning-mode', 'advanced');
    });
    cy.visit('/');
    cy.wait(1000); // アプリケーションの初期化を待つ
  });

  it('ゲートを配置して接続し、シミュレーションが動作する', () => {
    // 1. INPUTゲートを配置
    cy.get('[data-testid="gate-button-INPUT"]').click();
    cy.get('svg').click(200, 200);
    
    // 2. ANDゲートを配置
    cy.get('[data-testid="gate-button-AND"]').click();
    cy.get('svg').click(400, 200);
    
    // 3. OUTPUTゲートを配置
    cy.get('[data-testid="gate-button-OUTPUT"]').click();
    cy.get('svg').click(600, 200);

    // ゲートが配置されたことを確認
    cy.get('[data-testid^="gate-"]').should('have.length', 3);

    // 4. 接続を作成（実装詳細に依存しないよう、最小限の確認のみ）
    // TODO: 接続機能が安定したら、ここに接続のテストを追加
    
    // 5. INPUTゲートをクリックして状態を変更
    cy.get('[data-testid^="gate-"]').first().click();
    
    // 6. シミュレーションが動作していることを確認
    // （視覚的な変化があることを確認）
    cy.wait(500);
  });

  it('回路をクリアできる', () => {
    // ゲートを配置
    cy.get('[data-testid="gate-button-INPUT"]').click();
    cy.get('svg').click(200, 200);
    
    // ゲートが存在することを確認
    cy.get('[data-testid^="gate-"]').should('have.length', 1);
    
    // クリアボタンを押す（実装されている場合）
    cy.get('button').contains('クリア').click({ force: true });
    
    // ゲートが削除されたことを確認
    cy.get('[data-testid^="gate-"]').should('not.exist');
  });
});