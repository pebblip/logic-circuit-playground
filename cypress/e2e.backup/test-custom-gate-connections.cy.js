describe('Custom Gate Wire Connections Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176/');
    cy.wait(500);
  });

  it('should connect INPUT to custom gate input pins correctly', () => {
    // INPUTゲートを配置
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(300);
    
    // カスタムゲート（私のゲート）を配置
    cy.contains('.tool-card', 'MyGate').click();
    cy.wait(500);
    
    // 基本的な配置が完了したことを確認
    cy.get('.gate-container').should('have.length', 2);
    
    // INPUTゲートの出力ピンをクリック（ワイヤー描画開始）
    cy.get('.gate-container').first().find('circle').last().click();
    cy.wait(200);
    
    // カスタムゲートの入力ピンをクリック（ワイヤー接続）
    cy.get('.gate-container').last().find('circle').first().click();
    cy.wait(300);
    
    // ワイヤーが生成されることを確認
    cy.get('.wire').should('exist');
    
    cy.screenshot('custom-gate-input-connection');
  });

  it('should connect custom gate output to OUTPUT gate correctly', () => {
    // カスタムゲート（私のゲート）を配置
    cy.contains('.tool-card', 'MyGate').click();
    cy.wait(300);
    
    // OUTPUTゲートを配置
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(500);
    
    // 基本的な配置が完了したことを確認
    cy.get('.gate-container').should('have.length', 2);
    
    // カスタムゲートの出力ピンをクリック（ワイヤー描画開始）
    cy.get('.gate-container').first().find('circle').last().click();
    cy.wait(200);
    
    // OUTPUTゲートの入力ピンをクリック（ワイヤー接続）
    cy.get('.gate-container').last().find('circle').first().click();
    cy.wait(300);
    
    // ワイヤーが生成されることを確認
    cy.get('.wire').should('exist');
    
    cy.screenshot('custom-gate-output-connection');
  });

  it('should display custom gate with correct name and icon positioning', () => {
    // カスタムゲート（半加算器）を配置
    cy.contains('.tool-card', '半加算器').click();
    cy.wait(500);
    
    // カスタムゲートが配置されることを確認
    cy.get('.custom-gate').should('exist');
    
    // 表示名が外側上部に配置されることを確認
    cy.contains('半加算器').should('exist');
    
    // アイコンが表示されることを確認
    cy.contains('➕').should('exist');
    
    // ピンラベルが表示されることを確認
    cy.contains('A').should('exist');
    cy.contains('B').should('exist');
    cy.contains('S').should('exist');
    cy.contains('C').should('exist');
    
    cy.screenshot('custom-gate-appearance');
  });

  it('should handle multiple pin custom gate connections', () => {
    // 半加算器（2入力2出力）を配置
    cy.contains('.tool-card', '半加算器').click();
    cy.wait(300);
    
    // INPUTゲートを2つ配置
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(200);
    cy.contains('.tool-card', 'INPUT').click();
    cy.wait(200);
    
    // OUTPUTゲートを2つ配置
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(200);
    cy.contains('.tool-card', 'OUTPUT').click();
    cy.wait(500);
    
    // 5つのゲートが配置されることを確認
    cy.get('.gate-container').should('have.length', 5);
    
    cy.screenshot('multi-pin-custom-gate-setup');
  });

  it('should create custom gate with multiple output pins', () => {
    // 「作成」ボタンをクリック
    cy.contains('.tool-card', '作成').click();
    cy.wait(300);
    
    // フォームに入力
    cy.get('input[placeholder="例: HalfAdder"]').type('MultiOutput');
    cy.get('input[placeholder="例: 半加算器"]').type('複数出力');
    
    // 出力ピンを追加
    cy.contains('+ 追加').eq(1).click(); // 2番目の「+ 追加」ボタン（出力ピン用）
    cy.wait(200);
    
    // 出力ピンが2つになることを確認
    cy.contains('出力ピン (2)').should('exist');
    
    // さらに出力ピンを追加
    cy.contains('+ 追加').eq(1).click(); // 再度2番目の「+ 追加」ボタン
    cy.wait(200);
    
    // 出力ピンが3つになることを確認
    cy.contains('出力ピン (3)').should('exist');
    
    // プレビューで3つの出力ピンが表示されることを確認
    cy.get('svg circle').should('have.length.greaterThan', 4); // 入力2 + 出力3
    
    cy.screenshot('multi-output-custom-gate');
  });
});