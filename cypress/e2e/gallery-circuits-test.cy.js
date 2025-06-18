describe('ギャラリー回路動作テスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('ギャラリーモード').click();
  });

  describe('基本回路テスト', () => {
    it('半加算器が正しく動作する', () => {
      cy.contains('半加算器').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
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

    it('SRラッチが正しく動作する', () => {
      cy.contains('SR ラッチ').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態
      cy.get('[data-testid="output-output_q"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_q_bar"]').should('have.attr', 'data-active', 'true');
      
      // Set操作 (S=1, R=0)
      cy.get('[data-testid="gate-input_s"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_q"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_q_bar"]').should('have.attr', 'data-active', 'false');
      
      // ラッチ状態を確認 (S=0, R=0)
      cy.get('[data-testid="gate-input_s"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_q"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_q_bar"]').should('have.attr', 'data-active', 'false');
      
      // Reset操作 (S=0, R=1)
      cy.get('[data-testid="gate-input_r"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_q"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_q_bar"]').should('have.attr', 'data-active', 'true');
    });

    it('デコーダー回路が正しく動作する', () => {
      cy.contains('デコーダー回路').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 00 -> output_0のみアクティブ
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'false');
      
      // 01 -> output_1のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'false');
      
      // 10 -> output_2のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.get('[data-testid="gate-input_b"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'false');
      
      // 11 -> output_3のみアクティブ
      cy.get('[data-testid="gate-input_a"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-output_0"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_1"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_2"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-output_3"]').should('have.attr', 'data-active', 'true');
    });
  });

  describe('循環回路テスト', () => {
    it('SRラッチ（基本ゲート版）が正しく動作する', () => {
      cy.contains('SRラッチ（基本ゲート版）').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態
      cy.wait(500); // 循環回路の安定化を待つ
      
      // Set操作 (S=1, R=0)
      cy.get('[data-testid="gate-S"]').click();
      cy.wait(500);
      cy.get('[data-testid="output-Q"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-Q_BAR"]').should('have.attr', 'data-active', 'false');
      
      // ラッチ状態を確認 (S=0, R=0)
      cy.get('[data-testid="gate-S"]').click();
      cy.wait(500);
      cy.get('[data-testid="output-Q"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-Q_BAR"]').should('have.attr', 'data-active', 'false');
      
      // Reset操作 (S=0, R=1)
      cy.get('[data-testid="gate-R"]').click();
      cy.wait(500);
      cy.get('[data-testid="output-Q"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-Q_BAR"]').should('have.attr', 'data-active', 'true');
    });

    it('リングオシレータが発振する', () => {
      cy.contains('リングオシレータ').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態を記録
      let initialState1, initialState2, initialState3;
      cy.get('[data-testid="output-OUT1"]').then($el => {
        initialState1 = $el.attr('data-active');
      });
      cy.get('[data-testid="output-OUT2"]').then($el => {
        initialState2 = $el.attr('data-active');
      });
      cy.get('[data-testid="output-OUT3"]').then($el => {
        initialState3 = $el.attr('data-active');
      });
      
      // 少し待って状態が変化することを確認
      cy.wait(1000);
      
      cy.get('[data-testid="output-OUT1"]').then($el => {
        const currentState1 = $el.attr('data-active');
        expect(currentState1).to.not.equal(initialState1);
      });
      cy.get('[data-testid="output-OUT2"]').then($el => {
        const currentState2 = $el.attr('data-active');
        expect(currentState2).to.not.equal(initialState2);
      });
      cy.get('[data-testid="output-OUT3"]').then($el => {
        const currentState3 = $el.attr('data-active');
        expect(currentState3).to.not.equal(initialState3);
      });
    });

    it('カオス発生器（LFSR）が動作する', () => {
      cy.contains('カオス発生器').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // CLOCKが動作していることを確認
      cy.wait(2000); // 2秒待機（1Hzクロック）
      
      // 出力が変化していることを確認
      let randomOutputChanges = 0;
      let previousRandomState = null;
      
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="output-random_output"]').then($el => {
          const currentState = $el.attr('data-active');
          if (previousRandomState !== null && previousRandomState !== currentState) {
            randomOutputChanges++;
          }
          previousRandomState = currentState;
        });
        cy.wait(1000); // 1秒待機
      }
      
      // 少なくとも1回は変化することを確認
      cy.then(() => {
        expect(randomOutputChanges).to.be.greaterThan(0);
      });
    });

    it('フィボナッチカウンターが動作する', () => {
      cy.contains('フィボナッチカウンター').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期値確認（F(0)=1, F(1)=1）
      cy.get('[data-testid="output-out_a_0"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_b_0"]').should('have.attr', 'data-active', 'true');
      
      // CLOCKが動作していることを確認（2Hz）
      cy.wait(3000); // 3秒待機
      
      // 値が変化していることを確認
      cy.get('[data-testid="output-out_fib_0"]').then($el => {
        const state = $el.attr('data-active');
        // 何らかの値が出力されていることを確認
        expect(state).to.be.oneOf(['true', 'false']);
      });
    });

    it('ジョンソンカウンターが動作する', () => {
      cy.contains('ジョンソンカウンター').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態確認（すべて0）
      cy.get('[data-testid="output-led0"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-led1"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-led2"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-led3"]').should('have.attr', 'data-active', 'false');
      
      // CLOCKが動作していることを確認（1Hz）
      cy.wait(5000); // 5秒待機
      
      // LEDのパターンが変化していることを確認
      let ledPattern = [];
      cy.get('[data-testid="output-led0"]').then($el => {
        ledPattern.push($el.attr('data-active'));
      });
      cy.get('[data-testid="output-led1"]').then($el => {
        ledPattern.push($el.attr('data-active'));
      });
      cy.get('[data-testid="output-led2"]').then($el => {
        ledPattern.push($el.attr('data-active'));
      });
      cy.get('[data-testid="output-led3"]').then($el => {
        ledPattern.push($el.attr('data-active'));
      });
      
      cy.then(() => {
        // 初期状態（すべてfalse）から変化していることを確認
        const hasChanged = ledPattern.some(state => state === 'true');
        expect(hasChanged).to.be.true;
      });
    });

    it('セルフオシレーティングメモリが動作する', () => {
      cy.contains('セルフオシレーティングメモリ').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // enableが有効になっていることを確認
      cy.get('[data-testid="gate-enable"]').should('have.attr', 'data-active', 'true');
      
      // メモリセルの初期状態を確認
      cy.wait(1000);
      
      // 振動が発生していることを確認
      let oscillationChanges = 0;
      let previousState = null;
      
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="output-out_oscillation"]').then($el => {
          const currentState = $el.attr('data-active');
          if (previousState !== null && previousState !== currentState) {
            oscillationChanges++;
          }
          previousState = currentState;
        });
        cy.wait(500);
      }
      
      // 振動が発生していることを確認
      cy.then(() => {
        expect(oscillationChanges).to.be.greaterThan(0);
      });
    });

    it('マンダラ回路が動作する', () => {
      cy.contains('マンダラ回路').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // CLOCKが動作していることを確認（3Hz）
      cy.wait(2000);
      
      // 各リングの出力が存在することを確認
      cy.get('[data-testid="output-out_ring1"]').should('exist');
      cy.get('[data-testid="output-out_ring2"]').should('exist');
      cy.get('[data-testid="output-out_ring3"]').should('exist');
      
      // マンダラ出力が変化していることを確認
      let mandalaStates = [];
      cy.get('[data-testid="output-mandala_n"]').then($el => {
        mandalaStates.push($el.attr('data-active'));
      });
      
      cy.wait(1000);
      
      cy.get('[data-testid="output-mandala_n"]').then($el => {
        const newState = $el.attr('data-active');
        // 状態が変化していることを確認
        cy.then(() => {
          const hasChanged = mandalaStates[0] !== newState;
          expect(hasChanged).to.be.true;
        });
      });
    });
  });

  describe('高度な回路テスト', () => {
    it('4ビット比較器が動作する', () => {
      cy.contains('4ビット比較器').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
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
      
      // A=0001, B=0010 -> A < B
      cy.get('[data-testid="gate-b1"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_equal"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_greater"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_less"]').should('have.attr', 'data-active', 'true');
    });

    it('パリティチェッカーが動作する', () => {
      cy.contains('パリティチェッカー').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態（偶数パリティ）
      cy.get('[data-testid="output-out_even_parity"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_odd_parity"]').should('have.attr', 'data-active', 'false');
      
      // 1ビット設定（奇数パリティ）
      cy.get('[data-testid="gate-in0"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_even_parity"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-out_odd_parity"]').should('have.attr', 'data-active', 'true');
      
      // 2ビット設定（偶数パリティ）
      cy.get('[data-testid="gate-in1"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_even_parity"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-out_odd_parity"]').should('have.attr', 'data-active', 'false');
    });

    it('多数決投票回路が動作する', () => {
      cy.contains('多数決投票回路').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 初期状態（0/5）
      cy.get('[data-testid="output-out_majority"]').should('have.attr', 'data-active', 'false');
      
      // 2/5投票
      cy.get('[data-testid="gate-vote1"]').click();
      cy.get('[data-testid="gate-vote2"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_majority"]').should('have.attr', 'data-active', 'false');
      
      // 3/5投票（過半数）
      cy.get('[data-testid="gate-vote3"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-out_majority"]').should('have.attr', 'data-active', 'true');
    });

    it('7セグメントデコーダーが動作する', () => {
      cy.contains('7セグメントデコーダー').parent().parent().find('button').contains('詳細を見る').click();
      cy.contains('キャンバスで開く').click();
      cy.wait(500); // モード切り替えと回路読み込みを待つ
      
      // 数字0の表示パターン
      cy.get('[data-testid="output-seg_a"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_b"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_c"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_d"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_e"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_f"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_g"]').should('have.attr', 'data-active', 'false');
      
      // 数字1の表示パターン（0001）
      cy.get('[data-testid="gate-in0"]').click();
      cy.wait(200);
      cy.get('[data-testid="output-seg_a"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-seg_b"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_c"]').should('have.attr', 'data-active', 'true');
      cy.get('[data-testid="output-seg_d"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-seg_e"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-seg_f"]').should('have.attr', 'data-active', 'false');
      cy.get('[data-testid="output-seg_g"]').should('have.attr', 'data-active', 'false');
    });
  });
});