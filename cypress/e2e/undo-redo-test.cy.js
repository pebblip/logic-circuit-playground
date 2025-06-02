describe('Undo/Redo機能テスト', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('ゲートの追加と削除をUndo/Redoできる', () => {
    // 初期状態：Undoボタンは無効
    cy.get('button[title="元に戻す"]').should('be.disabled');
    cy.get('button[title="やり直し"]').should('be.disabled');
    
    // 1. ANDゲートを追加
    cy.get('[data-gate-type="AND"]').click();
    cy.get('svg.canvas').click(300, 200);
    cy.wait(500);
    
    // Undoボタンが有効になることを確認
    cy.get('button[title="元に戻す"]').should('not.be.disabled');
    cy.get('button[title="やり直し"]').should('be.disabled');
    
    // ANDゲートが存在することを確認
    cy.get('[data-gate-id]').should('have.length', 1);
    
    // 2. ORゲートを追加
    cy.get('[data-gate-type="OR"]').click();
    cy.get('svg.canvas').click(500, 200);
    cy.wait(500);
    
    // 2つのゲートが存在することを確認
    cy.get('[data-gate-id]').should('have.length', 2);
    
    // 3. Undoを実行（ORゲートの追加を取り消す）
    cy.get('button[title="元に戻す"]').click();
    cy.wait(500);
    
    // 1つのゲートのみ存在することを確認
    cy.get('[data-gate-id]').should('have.length', 1);
    
    // Redoボタンが有効になることを確認
    cy.get('button[title="やり直し"]').should('not.be.disabled');
    
    // 4. Redoを実行（ORゲートの追加をやり直す）
    cy.get('button[title="やり直し"]').click();
    cy.wait(500);
    
    // 再び2つのゲートが存在することを確認
    cy.get('[data-gate-id]').should('have.length', 2);
    
    // 5. 2回Undoを実行（すべてのゲートを削除）
    cy.get('button[title="元に戻す"]').click();
    cy.wait(500);
    cy.get('button[title="元に戻す"]').click();
    cy.wait(500);
    
    // ゲートが存在しないことを確認
    cy.get('[data-gate-id]').should('have.length', 0);
    
    // Undoボタンが無効になることを確認
    cy.get('button[title="元に戻す"]').should('be.disabled');
  });

  it('キーボードショートカットでUndo/Redoできる', () => {
    // 1. ゲートを追加
    cy.get('[data-gate-type="NOT"]').click();
    cy.get('svg.canvas').click(400, 300);
    cy.wait(500);
    
    cy.get('[data-gate-id]').should('have.length', 1);
    
    // 2. Cmd/Ctrl+Z でUndo
    cy.get('body').type('{cmd}z');
    cy.wait(500);
    
    cy.get('[data-gate-id]').should('have.length', 0);
    
    // 3. Cmd/Ctrl+Shift+Z でRedo
    cy.get('body').type('{cmd}{shift}z');
    cy.wait(500);
    
    cy.get('[data-gate-id]').should('have.length', 1);
  });

  it('Clear Allの後もUndo可能', () => {
    // 1. 複数のゲートを追加
    cy.get('[data-gate-type="INPUT"]').click();
    cy.get('svg.canvas').click(200, 200);
    
    cy.get('[data-gate-type="OUTPUT"]').click();
    cy.get('svg.canvas').click(600, 200);
    
    cy.wait(500);
    cy.get('[data-gate-id]').should('have.length', 2);
    
    // 2. Clear Allを実行
    cy.get('button[title="すべてクリア"]').click();
    cy.on('window:confirm', () => true);
    cy.wait(500);
    
    // すべてのゲートが削除されたことを確認
    cy.get('[data-gate-id]').should('have.length', 0);
    
    // 3. Undoでクリア前の状態に戻る
    cy.get('button[title="元に戻す"]').should('not.be.disabled');
    cy.get('button[title="元に戻す"]').click();
    cy.wait(500);
    
    // ゲートが復元されたことを確認
    cy.get('[data-gate-id]').should('have.length', 2);
  });

  it('履歴の最大サイズ（50件）を超えても正常に動作する', () => {
    // 50件以上の操作を実行
    for (let i = 0; i < 55; i++) {
      cy.get('[data-gate-type="AND"]').click();
      cy.get('svg.canvas').click(100 + (i % 10) * 80, 100 + Math.floor(i / 10) * 80);
      cy.wait(50);
    }
    
    // 55個のゲートが存在することを確認
    cy.get('[data-gate-id]').should('have.length', 55);
    
    // 40回Undoを実行（履歴は50件なので、最初の5件は失われている）
    for (let i = 0; i < 40; i++) {
      cy.get('button[title="元に戻す"]').click();
      cy.wait(50);
    }
    
    // 15個のゲートが残っていることを確認（55 - 40 = 15）
    cy.get('[data-gate-id]').should('have.length', 15);
    
    // さらに10回Undoを実行
    for (let i = 0; i < 10; i++) {
      cy.get('button[title="元に戻す"]').click();
      cy.wait(50);
    }
    
    // 5個のゲートが残っていることを確認（最初の5件は履歴にない）
    cy.get('[data-gate-id]').should('have.length', 5);
    
    // これ以上Undoできないことを確認
    cy.get('button[title="元に戻す"]').should('be.disabled');
  });
});