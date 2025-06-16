describe('ピン状態表示バグの調査', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(500);
  });

  it('NANDゲートの入力ピン状態が正しく更新される', () => {
    // 2つのINPUTゲートを配置
    cy.get('[data-testid="INPUT-button"]').click();
    cy.get('svg.canvas').click(100, 100);
    cy.wait(100);
    
    cy.get('[data-testid="INPUT-button"]').click();
    cy.get('svg.canvas').click(100, 200);
    cy.wait(100);

    // NANDゲートを配置
    cy.get('[data-testid="NAND-button"]').click();
    cy.get('svg.canvas').click(300, 150);
    cy.wait(100);

    // 配置されたゲートを取得
    cy.get('g[data-gate-type="INPUT"]').then($inputs => {
      const input1 = $inputs.eq(0);
      const input2 = $inputs.eq(1);
      
      // NANDゲートを取得
      cy.get('g[data-gate-type="NAND"]').then($nand => {
        const nand = $nand.eq(0);
        
        // 最初のINPUTゲートからNANDゲートの上の入力へ接続
        cy.wrap(input1).find('.pin.output-pin').click();
        cy.wrap(nand).find('.pin.input-pin').first().click();
        cy.wait(100);

        // 2番目のINPUTゲートからNANDゲートの下の入力へ接続
        cy.wrap(input2).find('.pin.output-pin').click();
        cy.wrap(nand).find('.pin.input-pin').last().click();
        cy.wait(100);

        // 両方のINPUTをONにする
        cy.wrap(input1).find('circle').first().dblclick();
        cy.wait(100);
        cy.wrap(input2).find('circle').first().dblclick();
        cy.wait(100);

        // NANDゲートの入力ピンが両方アクティブ（緑色）であることを確認
        cy.wrap(nand).find('.pin.input-pin.active').should('have.length', 2);
        
        // NANDゲートの出力がOFF（両入力ONなのでNAND出力はfalse）であることを確認
        cy.wrap(nand).find('.pin.output-pin').should('not.have.class', 'active');

        // 上のINPUTをOFFにする
        cy.wrap(input1).find('circle').first().dblclick();
        cy.wait(100);

        // 上の入力ピンが非アクティブ（グレー）になることを確認（バグの修正確認）
        cy.wrap(nand).find('.pin.input-pin').first().should('not.have.class', 'active');
        cy.wrap(nand).find('.pin.input-pin').last().should('have.class', 'active');
        
        // NANDゲートの出力がON（片方の入力がOFFなのでNAND出力はtrue）であることを確認
        cy.wrap(nand).find('.pin.output-pin').should('have.class', 'active');

        // 下のINPUTもOFFにする
        cy.wrap(input2).find('circle').first().dblclick();
        cy.wait(100);

        // 両方の入力ピンが非アクティブになることを確認
        cy.wrap(nand).find('.pin.input-pin.active').should('have.length', 0);
        
        // NANDゲートの出力がON（両入力OFFなのでNAND出力はtrue）であることを確認
        cy.wrap(nand).find('.pin.output-pin').should('have.class', 'active');
      });
    });
  });

  it('ANDゲートとの比較テスト', () => {
    // INPUTゲートを配置
    cy.get('[data-testid="INPUT-button"]').click();
    cy.get('svg.canvas').click(100, 100);
    cy.wait(100);
    
    cy.get('[data-testid="INPUT-button"]').click();
    cy.get('svg.canvas').click(100, 200);
    cy.wait(100);

    // ANDゲートを配置
    cy.get('[data-testid="AND-button"]').click();
    cy.get('svg.canvas').click(300, 100);
    cy.wait(100);

    // NANDゲートを配置
    cy.get('[data-testid="NAND-button"]').click();
    cy.get('svg.canvas').click(300, 250);
    cy.wait(100);

    // 配置されたゲートを取得
    cy.get('g[data-gate-type="INPUT"]').then($inputs => {
      const input1 = $inputs.eq(0);
      const input2 = $inputs.eq(1);
      
      cy.get('g[data-gate-type="AND"]').then($and => {
        const andGate = $and.eq(0);
        
        cy.get('g[data-gate-type="NAND"]').then($nand => {
          const nandGate = $nand.eq(0);
          
          // 両方のゲートに接続
          // ANDゲートへの接続
          cy.wrap(input1).find('.pin.output-pin').click();
          cy.wrap(andGate).find('.pin.input-pin').first().click();
          cy.wait(100);
          
          cy.wrap(input2).find('.pin.output-pin').click();
          cy.wrap(andGate).find('.pin.input-pin').last().click();
          cy.wait(100);

          // NANDゲートへの接続
          cy.wrap(input1).find('.pin.output-pin').click();
          cy.wrap(nandGate).find('.pin.input-pin').first().click();
          cy.wait(100);
          
          cy.wrap(input2).find('.pin.output-pin').click();
          cy.wrap(nandGate).find('.pin.input-pin').last().click();
          cy.wait(100);

          // 両方のINPUTをONにする
          cy.wrap(input1).find('circle').first().dblclick();
          cy.wait(100);
          cy.wrap(input2).find('circle').first().dblclick();
          cy.wait(100);

          // 両方のゲートの入力ピンがアクティブであることを確認
          cy.wrap(andGate).find('.pin.input-pin.active').should('have.length', 2);
          cy.wrap(nandGate).find('.pin.input-pin.active').should('have.length', 2);

          // 上のINPUTをOFFにする
          cy.wrap(input1).find('circle').first().dblclick();
          cy.wait(100);

          // 両方のゲートで上の入力ピンが非アクティブになることを確認
          cy.wrap(andGate).find('.pin.input-pin').first().should('not.have.class', 'active');
          cy.wrap(nandGate).find('.pin.input-pin').first().should('not.have.class', 'active');
        });
      });
    });
  });
});