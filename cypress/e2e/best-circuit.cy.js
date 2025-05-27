// BestLogicCircuitの全機能テスト
describe('BestLogicCircuit - モードレス操作', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('基本操作（モードレス）', () => {
    it('1クリックでゲートを配置', () => {
      // ツールバーのボタンをクリックするだけで配置
      cy.get('button[title="入力 (I)"]').click();
      cy.get('.gate-rect').should('have.length', 1);
      
      // 続けて別のゲートも配置
      cy.get('button[title="出力 (O)"]').click();
      cy.get('.gate-rect').should('have.length', 2);
    });

    it('同時にドラッグでゲートを移動できる', () => {
      // ゲートを配置
      cy.get('button[title="AND (A)"]').click();
      
      // すぐにドラッグで移動（モード切り替え不要）
      cy.get('.gate-rect')
        .trigger('mousedown', { button: 0 })
        .wait(100);
      
      cy.get('svg')
        .trigger('mousemove', { clientX: 500, clientY: 400 })
        .trigger('mouseup');
      
      // 移動したことを確認
      cy.get('.gate-rect').then($gate => {
        const x = parseFloat($gate.attr('x'));
        expect(x).to.be.greaterThan(400); // 中央より右に移動
      });
    });

    it('端子をドラッグしてワイヤー接続（モード切り替え不要）', () => {
      // 2つのゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 出力端子（紫）から入力端子（青）へドラッグ
      cy.get('circle[fill="#8b5cf6"]').first()
        .trigger('mousedown', { button: 0 });
      
      cy.get('circle[fill="#3b82f6"]').first()
        .trigger('mouseup');
      
      // ワイヤーが接続されたことを確認
      cy.get('path[stroke="#9ca3af"], path[stroke="#3b82f6"]')
        .should('have.length.at.least', 1);
    });
  });

  describe('シミュレーション動作', () => {
    it('接続した回路が正しく動作する', () => {
      // INPUT → OUTPUT を作成
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続
      cy.get('circle[fill="#8b5cf6"]').first()
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').first()
        .trigger('mouseup');
      
      // INPUTをクリックしてONに
      cy.get('.gate-rect').first().click();
      
      // 両方緑色（アクティブ）になる
      cy.get('.gate-rect').then($gates => {
        const activeGates = Array.from($gates).filter(g => 
          g.getAttribute('fill') === '#22c55e'
        );
        expect(activeGates).to.have.length(2);
      });
    });

    it('NOTゲートが正しく反転する', () => {
      // INPUT → NOT → OUTPUT
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="NOT (N)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続
      cy.get('circle[fill="#8b5cf6"]').eq(0)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(0)
        .trigger('mouseup');
      
      cy.get('circle[fill="#8b5cf6"]').eq(1)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(1)
        .trigger('mouseup');
      
      // INPUTをONに
      cy.get('.gate-rect').first().click();
      
      // INPUTは緑、OUTPUTはグレー（反転）
      cy.get('.gate-rect').first().should('have.attr', 'fill', '#22c55e');
      cy.get('.gate-rect').last().should('have.attr', 'fill', '#9ca3af');
    });
  });

  describe('UX機能', () => {
    it('右クリックで削除', () => {
      cy.get('button[title="AND (A)"]').click();
      cy.get('.gate-rect').should('have.length', 1);
      
      cy.get('.gate-rect').rightclick();
      cy.get('.gate-rect').should('have.length', 0);
    });

    it('キーボードショートカットが動作', () => {
      // Iキーで入力ゲート
      cy.get('body').type('i');
      cy.get('text').contains('IN').should('exist');
      
      // Aキーでアンドゲート
      cy.get('body').type('a');
      cy.get('text').contains('&').should('exist');
    });

    it('ヘルプ表示', () => {
      cy.contains('button', 'ヘルプ').click();
      cy.contains('使い方').should('be.visible');
      
      // ?キーでトグル
      cy.get('body').type('?');
      cy.contains('使い方').should('not.exist');
    });

    it('初回ヒントが表示される', () => {
      cy.contains('クリックでゲートを追加').should('be.visible');
      
      // ゲートを追加するとヒントが消える
      cy.get('button[title="入力 (I)"]').click();
      cy.contains('クリックでゲートを追加').should('not.exist');
    });

    it('クリアボタンで全削除', () => {
      // 複数のゲートと接続を作成
      cy.get('button[title="入力 (I)"]').click();
      cy.get('button[title="AND (A)"]').click();
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続
      cy.get('circle[fill="#8b5cf6"]').first()
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').first()
        .trigger('mouseup');
      
      // クリア
      cy.contains('button', 'クリア').click();
      
      // 全て削除される
      cy.get('.gate-rect').should('have.length', 0);
      cy.get('path[stroke="#9ca3af"]').should('have.length', 0);
    });
  });

  describe('複雑な回路', () => {
    it('ANDゲートの真理値表を確認', () => {
      // 2入力AND回路を構築
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="AND (A)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続（上のINPUT → ANDの上側入力）
      cy.get('circle[fill="#8b5cf6"]').eq(0)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(0)
        .trigger('mouseup');
      
      // 接続（下のINPUT → ANDの下側入力）
      cy.get('circle[fill="#8b5cf6"]').eq(1)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(1)
        .trigger('mouseup');
      
      // 接続（AND → OUTPUT）
      cy.get('circle[fill="#8b5cf6"]').eq(2)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(2)
        .trigger('mouseup');
      
      // 0 & 0 = 0
      cy.get('.gate-rect').eq(3).should('have.attr', 'fill', '#9ca3af');
      
      // 1 & 0 = 0
      cy.get('.gate-rect').eq(0).click();
      cy.get('.gate-rect').eq(3).should('have.attr', 'fill', '#9ca3af');
      
      // 1 & 1 = 1
      cy.get('.gate-rect').eq(1).click();
      cy.get('.gate-rect').eq(3).should('have.attr', 'fill', '#22c55e');
    });
  });
});