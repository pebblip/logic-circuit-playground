describe('Custom Gate Creation Dialog Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/');
    cy.wait(500);
  });

  it('should open custom gate creation dialog', () => {
    // 「作成」ボタンをクリック
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // ダイアログが表示されることを確認
    cy.get('.dialog-overlay').should('exist');
    cy.get('.dialog-content').should('exist');
    cy.contains('カスタムゲートの作成').should('exist');
    
    cy.screenshot('custom-gate-dialog-opened');
  });

  it('should fill out dialog form', () => {
    // ダイアログを開く
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // フォームに入力
    cy.get('input[placeholder="例: HalfAdder"]').type('TestGate');
    cy.get('input[placeholder="例: 半加算器"]').type('テストゲート');
    cy.get('textarea[placeholder="このゲートの機能を説明..."]').type('テスト用のカスタムゲートです');
    
    // アイコンを選択
    cy.contains('button', '⚙️').click();
    
    // カテゴリを選択
    cy.get('select').select('logic');
    
    cy.screenshot('custom-gate-dialog-filled');
  });

  it('should add and remove input pins', () => {
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // 初期状態：2つの入力ピン
    cy.contains('入力ピン (2)').should('exist');
    
    // 入力ピンを追加
    cy.contains('+ 追加').click();
    cy.contains('入力ピン (3)').should('exist');
    
    // 入力ピンを削除（2個目の×ボタンをクリック）
    cy.get('button').contains('×').eq(1).click();
    cy.contains('入力ピン (2)').should('exist');
    
    cy.screenshot('custom-gate-pins-modified');
  });

  it('should show live preview', () => {
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // プレビューセクションが存在することを確認
    cy.contains('プレビュー').should('exist');
    cy.get('svg').should('exist');
    
    // ゲート名を変更してプレビューが更新されることを確認
    cy.get('input[placeholder="例: 半加算器"]').clear().type('MyCustomGate');
    cy.contains('MyCustomGate').should('exist');
    
    cy.screenshot('custom-gate-preview');
  });

  it('should create custom gate successfully', () => {
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // フォームに入力
    cy.get('input[placeholder="例: HalfAdder"]').type('CreatedGate');
    cy.get('input[placeholder="例: 半加算器"]').type('作成ゲート');
    
    // 作成ボタンをクリック
    cy.contains('button', '作成').click();
    cy.wait(500);
    
    // ダイアログが閉じることを確認
    cy.get('.dialog-overlay').should('not.exist');
    
    // 新しいカスタムゲートがパレットに追加されることを確認
    cy.contains('.tool-label', '作成ゲート').should('exist');
    
    cy.screenshot('custom-gate-created');
  });

  it('should validate required fields', () => {
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // 空の状態で作成ボタンをクリック
    cy.contains('button', '作成').click();
    
    // 検証エラーが表示されることを確認（アラートまたはエラーメッセージ）
    cy.on('window:alert', (text) => {
      expect(text).to.contains('ゲート名と表示名を入力してください');
    });
    
    cy.screenshot('custom-gate-validation-error');
  });

  it('should close dialog on cancel', () => {
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // キャンセルボタンをクリック
    cy.contains('button', 'キャンセル').click();
    cy.wait(300);
    
    // ダイアログが閉じることを確認
    cy.get('.dialog-overlay').should('not.exist');
    
    cy.screenshot('custom-gate-dialog-cancelled');
  });
});