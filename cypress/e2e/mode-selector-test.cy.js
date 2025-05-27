describe('モード選択と保存機能のテスト', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173');
  });

  it('初回起動時にモード選択画面が表示される', () => {
    cy.contains('論理回路プレイグラウンド').should('be.visible');
    cy.contains('あなたに合ったモードを選んでください').should('be.visible');
    
    // 3つのモードが表示される
    cy.contains('🎓 学習モード').should('be.visible');
    cy.contains('🎨 自由制作モード').should('be.visible');
    cy.contains('🔧 上級者モード').should('be.visible');
  });

  it('学習モードを選択するとチュートリアルが開始される', () => {
    // 学習モードを選択
    cy.contains('🎓 学習モード').parent().parent().click();
    
    // チュートリアルが表示される
    cy.contains('ようこそ！', { timeout: 1000 }).should('be.visible');
    cy.contains('論理回路プレイグラウンドへようこそ').should('be.visible');
  });

  it('自由制作モードを選択するとチュートリアルなしで開始される', () => {
    // 自由制作モードを選択
    cy.contains('🎨 自由制作モード').parent().parent().click();
    
    // チュートリアルが表示されない
    cy.contains('ようこそ！').should('not.exist');
    
    // ツールバーが表示される
    cy.get('[data-tutorial-target="toolbar"]').should('be.visible');
    
    // 基本ゲートのみ表示（複合ゲートは表示されない）
    cy.contains('button', '入力').should('be.visible');
    cy.contains('button', 'AND').should('be.visible');
    cy.contains('button', 'NAND').should('not.exist');
  });

  it('上級者モードでは全ゲートが使用可能', () => {
    // 上級者モードを選択
    cy.contains('🔧 上級者モード').parent().parent().click();
    
    // 全ゲートが表示される
    cy.contains('button', '入力').should('be.visible');
    cy.contains('button', 'AND').should('be.visible');
    cy.contains('button', 'NAND').should('be.visible');
    cy.contains('button', 'NOR').should('be.visible');
    cy.contains('button', 'XNOR').should('be.visible');
  });

  it('保存/読み込み機能が動作する', () => {
    // 自由制作モードで開始
    cy.contains('🎨 自由制作モード').parent().parent().click();
    
    // ゲートを配置
    cy.contains('button', '入力').click();
    cy.contains('button', '出力').click();
    
    // 保存パネルを開く
    cy.contains('button', '保存/読込').click();
    cy.contains('回路の管理').should('be.visible');
    
    // 回路を保存
    cy.get('input[placeholder="回路名を入力..."]').type('テスト回路');
    cy.contains('button', '保存').click();
    cy.contains('"テスト回路" を保存しました').should('be.visible');
    
    // 保存された回路が表示される
    cy.contains('テスト回路').should('be.visible');
    cy.contains('ゲート: 2').should('be.visible');
  });

  it('リロード後もモード設定が保持される', () => {
    // 自由制作モードを選択
    cy.contains('🎨 自由制作モード').parent().parent().click();
    
    // リロード
    cy.reload();
    
    // モード選択画面が表示されない
    cy.contains('あなたに合ったモードを選んでください').should('not.exist');
    
    // 直接アプリが表示される
    cy.get('[data-tutorial-target="toolbar"]').should('be.visible');
  });

  it('共有URLで回路を読み込める', () => {
    // テスト用の回路データ（1つのINPUTゲート）
    const testCircuit = {
      g: [{ id: 'gate_1', type: 'INPUT', x: 200, y: 200, value: false }],
      c: []
    };
    
    const encoded = btoa(encodeURIComponent(JSON.stringify(testCircuit)));
    
    // 共有URLでアクセス
    cy.visit(`http://localhost:5173?circuit=${encoded}`);
    
    // モード選択
    cy.contains('🎨 自由制作モード').parent().parent().click();
    
    // ゲートが読み込まれている
    cy.get('g[data-gate-type="INPUT"]').should('exist');
  });
});