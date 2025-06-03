describe('Custom Gate Multiple Outputs Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.wait(1000);
  });

  it('should properly evaluate and display multiple outputs on custom gates', () => {
    // まず簡単な回路を作成（半加算器：2入力、2出力）
    // INPUTゲート A を追加
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('.canvas').click(200, 200);
    
    // INPUTゲート B を追加
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('.canvas').click(200, 300);
    
    // XORゲートを追加（Sum出力用）
    cy.get('[data-testid="gate-XOR"]').click();
    cy.get('.canvas').click(400, 200);
    
    // ANDゲートを追加（Carry出力用）
    cy.get('[data-testid="gate-AND"]').click();
    cy.get('.canvas').click(400, 300);
    
    // OUTPUTゲート Sum を追加
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('.canvas').click(600, 200);
    
    // OUTPUTゲート Carry を追加
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('.canvas').click(600, 300);
    
    cy.wait(500);
    
    // ワイヤー接続
    // A -> XOR
    cy.get('.gate-container').eq(0).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(2).find('circle[r="15"]').first().click();
    
    // B -> XOR
    cy.get('.gate-container').eq(1).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(2).find('circle[r="15"]').eq(1).click();
    
    // A -> AND
    cy.get('.gate-container').eq(0).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(3).find('circle[r="15"]').first().click();
    
    // B -> AND
    cy.get('.gate-container').eq(1).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(3).find('circle[r="15"]').eq(1).click();
    
    // XOR -> Sum OUTPUT
    cy.get('.gate-container').eq(2).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(4).find('circle[r="15"]').first().click();
    
    // AND -> Carry OUTPUT
    cy.get('.gate-container').eq(3).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(5).find('circle[r="15"]').first().click();
    
    cy.wait(500);
    
    // カスタムゲート作成（半加算器）
    cy.get('[data-testid="create-custom-gate"]').click();
    cy.wait(500);
    
    // カスタムゲート情報を入力
    cy.get('input[placeholder="ゲート名"]').type('HalfAdder');
    cy.get('input[placeholder="表示名"]').type('半加算器');
    cy.get('textarea[placeholder="説明"]').type('2ビットの半加算器（Sum, Carry出力）');
    
    // ピン名を設定
    cy.get('.input-pins input').eq(0).clear().type('A');
    cy.get('.input-pins input').eq(1).clear().type('B');
    cy.get('.output-pins input').eq(0).clear().type('Sum');
    cy.get('.output-pins input').eq(1).clear().type('Carry');
    
    // カスタムゲートを作成
    cy.get('button').contains('作成').click();
    cy.wait(1000);
    
    // 画面をクリア
    cy.get('[data-testid="clear-all"]').click();
    cy.wait(500);
    
    // 作成したカスタムゲートを配置
    cy.get('[data-testid="gate-HalfAdder"]').click();
    cy.get('.canvas').click(400, 250);
    
    // 入力ゲートを追加
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('.canvas').click(200, 200);
    
    cy.get('[data-testid="gate-INPUT"]').click();
    cy.get('.canvas').click(200, 300);
    
    // 出力ゲートを追加
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('.canvas').click(600, 200);
    
    cy.get('[data-testid="gate-OUTPUT"]').click();
    cy.get('.canvas').click(600, 300);
    
    // ワイヤー接続
    // INPUT A -> HalfAdder A
    cy.get('.gate-container').eq(1).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(0).find('circle[r="15"]').first().click();
    
    // INPUT B -> HalfAdder B
    cy.get('.gate-container').eq(2).find('circle[r="15"]').last().click();
    cy.get('.gate-container').eq(0).find('circle[r="15"]').eq(1).click();
    
    // HalfAdder Sum -> OUTPUT Sum
    cy.get('.gate-container').eq(0).find('circle[r="15"]').eq(2).click();
    cy.get('.gate-container').eq(3).find('circle[r="15"]').first().click();
    
    // HalfAdder Carry -> OUTPUT Carry
    cy.get('.gate-container').eq(0).find('circle[r="15"]').eq(3).click();
    cy.get('.gate-container').eq(4).find('circle[r="15"]').first().click();
    
    cy.wait(500);
    
    // テストケース1: A=0, B=0 => Sum=0, Carry=0
    // 両方のINPUTはデフォルトでOFFなので、出力を確認
    cy.get('.gate-container').eq(3).find('.pin.active').should('not.exist'); // Sum OFF
    cy.get('.gate-container').eq(4).find('.pin.active').should('not.exist'); // Carry OFF
    
    // テストケース2: A=1, B=0 => Sum=1, Carry=0
    cy.get('.gate-container').eq(1).find('.switch-track').dblclick();
    cy.wait(300);
    cy.get('.gate-container').eq(3).find('.pin.active').should('exist'); // Sum ON
    cy.get('.gate-container').eq(4).find('.pin.active').should('not.exist'); // Carry OFF
    
    // テストケース3: A=0, B=1 => Sum=1, Carry=0
    cy.get('.gate-container').eq(1).find('.switch-track').dblclick();
    cy.wait(300);
    cy.get('.gate-container').eq(2).find('.switch-track').dblclick();
    cy.wait(300);
    cy.get('.gate-container').eq(3).find('.pin.active').should('exist'); // Sum ON
    cy.get('.gate-container').eq(4).find('.pin.active').should('not.exist'); // Carry OFF
    
    // テストケース4: A=1, B=1 => Sum=0, Carry=1
    cy.get('.gate-container').eq(1).find('.switch-track').dblclick();
    cy.wait(300);
    cy.get('.gate-container').eq(3).find('.pin.active').should('not.exist'); // Sum OFF
    cy.get('.gate-container').eq(4).find('.pin.active').should('exist'); // Carry ON
    
    // カスタムゲート自体の出力ピンの状態も確認
    cy.get('.gate-container').eq(0).find('.pin').eq(2).should('not.have.class', 'active'); // Sum pin OFF
    cy.get('.gate-container').eq(0).find('.pin').eq(3).should('have.class', 'active'); // Carry pin ON
  });
});