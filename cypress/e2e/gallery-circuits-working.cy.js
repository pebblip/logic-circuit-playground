describe('ギャラリー動作確認済み回路テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
  });

  describe('基本回路テスト', () => {
    it('半加算器が正しく動作する', () => {
      cy.contains('半加算器').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態: 0 + 0 = 0 (carry: 0)
      cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'false');
      
      // 1 + 0 = 1 (carry: 0)
      cy.get('[data-testid="gate-input-a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'false');
      
      // 1 + 1 = 0 (carry: 1)
      cy.get('[data-testid="gate-input-b"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output-sum"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output-carry"]').should('have.attr', 'data-active', 'true');
    });

    it('デコーダー回路が正しく動作する', () => {
      cy.contains('デコーダー回路').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500);
      
      // 00 -> output_0のみアクティブ
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'false');
      
      // 01 -> output_1のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'false');
      
      // 10 -> output_2のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.get('[data-testid="gate-input_b"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'false');
      
      // 11 -> output_3のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'false');
    });
  });

  describe('高度な回路テスト', () => {
    it('4ビット比較器が動作する', () => {
      cy.contains('4ビット比較器').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500);
      
      // A=0000, B=0000 -> 等しい
      cy.get('[data-testid="output-out_equal"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_greater"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_less"]').should('have.attr', 'data-active', 'false');
      
      // A=0001, B=0000 -> A > B
      cy.get('[data-testid="gate-a0"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_equal"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_greater"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_less"]').should('have.attr', 'data-active', 'false');
    });

    it('パリティチェッカーが動作する', () => {
      cy.contains('パリティチェッカー').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500);
      
      // 初期状態（偶数パリティ: 0ビット）
      cy.get('[data-testid="output-parity_out"]').should('have.attr', 'data-active', 'false');
      
      // 1ビット設定（奇数パリティ）
      cy.get('[data-testid="gate-input_d0"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-parity_out"]').should('have.attr', 'data-active', 'true');
      
      // 2ビット設定（偶数パリティ）
      cy.get('[data-testid="gate-input_d1"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-parity_out"]').should('have.attr', 'data-active', 'false');
    });

    it('多数決投票回路が動作する', () => {
      cy.contains('多数決回路').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500);
      
      // 初期状態（0/3）
      cy.get('[data-testid="output-result"]').should('have.attr', 'data-active', 'false');
      
      // 1/3投票
      cy.get('[data-testid="gate-voter_a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-result"]').should('have.attr', 'data-active', 'false');
      
      // 2/3投票（過半数）
      cy.get('[data-testid="gate-voter_b"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-result"]').should('have.attr', 'data-active', 'true');
    });

    it('7セグメントデコーダーが動作する', () => {
      cy.contains('7セグメントデコーダー').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(1500);
      
      // 数字0の表示パターン（00）
      cy.get('[data-testid="output-out_a"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_b"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_c"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_d"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_e"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_f"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_g"]').should('have.attr', 'data-active', 'false');
      
      // 数字1の表示パターン（01）
      cy.get('[data-testid="gate-input_b0"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_a"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_b"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_c"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_d"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_e"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_f"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_g"]').should('have.attr', 'data-active', 'false');
    });
  });
});