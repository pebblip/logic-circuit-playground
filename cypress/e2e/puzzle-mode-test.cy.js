describe('Puzzle Mode Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5181');
    cy.wait(1000);
  });

  it('should access puzzle mode and show puzzle list', () => {
    // パズル・チャレンジモードをクリック
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // パズル一覧が表示されることを確認
    cy.contains('🧩 パズル・チャレンジ').should('be.visible');
    cy.contains('制約条件の中で目標回路を作成してください').should('be.visible');
    
    // 難易度セクションが表示されることを確認
    cy.contains('🟢 初級').should('be.visible');
    cy.contains('🟡 中級').should('be.visible');
    
    // パズルカードが表示されることを確認
    cy.contains('NOTの世界').should('be.visible');
    cy.contains('ANDの条件').should('be.visible');
  });

  it('should select a puzzle and show constraints', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // 「NOTの世界」パズルを選択
    cy.contains('NOTの世界').click();
    cy.wait(500);
    
    // パズル詳細が表示されることを確認
    cy.contains('NOTの世界').should('be.visible');
    cy.contains('Aの反対の値を出力してください').should('be.visible');
    
    // 制約条件が表示されることを確認
    cy.contains('📋 制約条件').should('be.visible');
    cy.contains('最大ゲート数: 2個').should('be.visible');
    cy.contains('使用可能ゲート: INPUT, OUTPUT, NOT').should('be.visible');
    
    // テストケースが表示されることを確認
    cy.contains('🧪 テストケース').should('be.visible');
    cy.contains('入力: 0').should('be.visible');
    cy.contains('期待: 1').should('be.visible');
  });

  it('should solve simple NOT puzzle', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // 「NOTの世界」パズルを選択
    cy.contains('NOTの世界').click();
    cy.wait(500);
    
    // INPUTゲートを配置
    cy.get('[data-gate-type="INPUT"]').should('be.visible').click();
    cy.wait(500);
    
    // NOTゲートを配置
    cy.get('[data-gate-type="NOT"]').should('be.visible').click();
    cy.wait(500);
    
    // OUTPUTゲートを配置
    cy.get('[data-gate-type="OUTPUT"]').should('be.visible').click();
    cy.wait(500);
    
    // 制約チェック - 使用不可ゲートが表示されないことを確認
    cy.get('[data-gate-type="AND"]').should('not.exist');
    cy.get('[data-gate-type="OR"]').should('not.exist');
    
    // 簡単な回路の動作確認
    cy.get('[data-gate-id]').should('have.length', 3);
  });

  it('should show hints when requested', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // パズルを選択
    cy.contains('NOTの世界').click();
    cy.wait(500);
    
    // ヒントボタンをクリック
    cy.contains('💡 ヒント 表示').click();
    cy.wait(200);
    
    // ヒントが表示されることを確認
    cy.contains('NOTゲートは入力を反転させます').should('be.visible');
    cy.contains('INPUT → NOT → OUTPUT の順で接続').should('be.visible');
    
    // ヒントを非表示にできることを確認
    cy.contains('💡 ヒント 非表示').click();
    cy.wait(200);
    cy.contains('NOTゲートは入力を反転させます').should('not.be.visible');
  });

  it('should show learning objectives', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // パズルを選択
    cy.contains('ANDの条件').click();
    cy.wait(500);
    
    // 学習目標が表示されることを確認
    cy.contains('🎯 学習目標').should('be.visible');
    cy.contains('ANDゲートの理解').should('be.visible');
    cy.contains('論理積の概念').should('be.visible');
  });

  it('should navigate back to puzzle list', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // パズルを選択
    cy.contains('NOTの世界').click();
    cy.wait(500);
    
    // 戻るボタンをクリック
    cy.contains('← 戻る').click();
    cy.wait(500);
    
    // パズル一覧に戻ることを確認
    cy.contains('🧩 パズル・チャレンジ').should('be.visible');
    cy.contains('🟢 初級').should('be.visible');
  });

  it('should respect gate constraints', () => {
    // パズル・チャレンジモードに移動
    cy.contains('パズル・チャレンジ').click();
    cy.wait(500);
    
    // 「NOTの世界」パズルを選択（INPUT, OUTPUT, NOTのみ許可）
    cy.contains('NOTの世界').click();
    cy.wait(500);
    
    // 許可されていないゲートが表示されないことを確認
    cy.get('[data-gate-type="AND"]').should('not.exist');
    cy.get('[data-gate-type="OR"]').should('not.exist');
    cy.get('[data-gate-type="XOR"]').should('not.exist');
    cy.get('[data-gate-type="NAND"]').should('not.exist');
    
    // 許可されたゲートは表示されることを確認
    cy.get('[data-gate-type="INPUT"]').should('be.visible');
    cy.get('[data-gate-type="OUTPUT"]').should('be.visible');
    cy.get('[data-gate-type="NOT"]').should('be.visible');
  });
});