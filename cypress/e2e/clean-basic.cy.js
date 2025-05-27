// CleanLogicCircuitの基本機能テスト（シンプル版）
describe('CleanLogicCircuit - 基本機能', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('各種ゲートを配置できる', () => {
    // ツールバーボタンの存在確認
    cy.contains('button', 'INPUT').should('exist');
    cy.contains('button', 'OUTPUT').should('exist');
    cy.contains('button', 'AND').should('exist');
    cy.contains('button', 'OR').should('exist');
    cy.contains('button', 'NOT').should('exist');
    
    // INPUTを配置
    cy.contains('button', 'INPUT').click();
    
    // SVG内にゲートが追加されたことを確認
    cy.get('svg > g').should('have.length.at.least', 1);
    
    // さらにANDを配置
    cy.contains('button', 'AND').click();
    cy.get('svg > g').should('have.length.at.least', 2);
  });

  it('ゲートを右クリックで削除できる', () => {
    // ゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.get('svg > g').should('have.length.at.least', 1);
    
    // 右クリックで削除
    cy.get('svg g').first().rightclick();
    
    // ゲートが削除される
    cy.wait(500); // アニメーション待機
    cy.get('svg > g').should('have.length', 0);
  });

  it('INPUTゲートの値を切り替えられる', () => {
    // INPUTを配置
    cy.contains('button', 'INPUT').click();
    
    // クリックして値を切り替え
    cy.get('svg g').first().click();
    
    // 色が変わったことを確認（シミュレーション結果が反映される）
    cy.get('svg circle[fill="#3182CE"]').should('exist');
  });

  it('ワイヤー接続ができる', () => {
    // INPUT と OUTPUT を配置
    cy.contains('button', 'INPUT').click();
    cy.wait(100);
    cy.contains('button', 'OUTPUT').click();
    
    // 接続端子が存在することを確認
    cy.get('circle[r="4"]').should('have.length.at.least', 2);
    
    // 出力端子から入力端子へドラッグ
    cy.get('circle[r="4"]').first()
      .trigger('mousedown', { button: 0 });
    
    cy.get('circle[r="4"]').last()
      .trigger('mouseup');
    
    // ワイヤーが作成されたことを確認
    cy.get('svg path').should('have.length.at.least', 1);
  });

  it('Clearボタンで全削除', () => {
    // 複数のゲートを配置
    cy.contains('button', 'INPUT').click();
    cy.contains('button', 'AND').click();
    cy.contains('button', 'OUTPUT').click();
    
    cy.get('svg > g').should('have.length.at.least', 3);
    
    // Clear
    cy.contains('button', 'Clear').click();
    
    // 全て削除される
    cy.get('svg > g').should('have.length', 0);
  });

  it('ヘルプが表示される', () => {
    // ヘルプボタンをクリック
    cy.contains('button', 'Help').click();
    
    // ヘルプ内容が表示される
    cy.contains('Keyboard Shortcuts').should('be.visible');
    cy.contains('Add Input').should('be.visible');
  });

  it('キーボードショートカットが動作する', () => {
    // 'i'でINPUT追加
    cy.get('body').type('i');
    cy.get('svg > g').should('have.length', 1);
    
    // 'a'でAND追加
    cy.get('body').type('a');
    cy.get('svg > g').should('have.length', 2);
  });
});