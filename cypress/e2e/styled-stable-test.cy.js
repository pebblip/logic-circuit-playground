// StyledStableCircuitの全機能を検証するE2Eテスト
describe('StyledStableCircuit - 全機能テスト', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('1. ツールバーからの1クリック配置', () => {
    it('ツールバーボタンで即座にゲートを配置できる', () => {
      // ツールバーのINPUTボタンをクリック
      cy.get('button[title="入力 (I)"]').click();
      
      // ゲートが配置されたことを確認
      cy.get('.gate-rect').should('have.length', 1);
      cy.get('text').contains('IN').should('exist');
    });

    it('連続して異なるゲートを配置できる', () => {
      // 各種ゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.get('button[title="出力 (O)"]').click();
      cy.get('button[title="ANDゲート (A)"]').click();
      
      // 3つのゲートが配置されたことを確認
      cy.get('.gate-rect').should('have.length', 3);
    });
  });

  describe('2. 配置モードでの操作', () => {
    it('サイドバーでゲートタイプを選択してキャンバスクリックで配置', () => {
      // サイドバーのANDゲートを選択
      cy.contains('button', 'ANDゲート').click();
      
      // キャンバスをクリック
      cy.get('svg').click(400, 300);
      
      // ANDゲートが配置されたことを確認
      cy.get('text').contains('&').should('exist');
    });

    it('ゲートをドラッグして移動できる', () => {
      // ゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      
      // ドラッグ操作
      cy.get('.gate-rect').first()
        .trigger('mousedown', { button: 0 })
        .wait(100);
      
      cy.get('svg')
        .trigger('mousemove', { clientX: 500, clientY: 400 })
        .trigger('mouseup');
      
      // 位置が変更されたことを確認（グリッドスナップされるので20の倍数）
      cy.get('.gate-rect').first().then($gate => {
        const x = parseFloat($gate.attr('x'));
        expect(x % 20).to.equal(0);
      });
    });
  });

  describe('3. 接続モードでのワイヤー接続', () => {
    beforeEach(() => {
      // 2つのゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      cy.wait(100);
    });

    it('接続モードに切り替えてワイヤーを接続できる', () => {
      // 接続モードに切り替え
      cy.contains('button', '接続モード').click();
      
      // モードが切り替わったことを確認
      cy.contains('接続モード').should('have.css', 'background-color', 'rgb(59, 130, 246)');
      
      // 出力端子（紫色）を探してドラッグ開始
      cy.get('circle[fill="#8b5cf6"]').first()
        .trigger('mousedown', { button: 0 });
      
      // 入力端子（青色）へドラッグ
      cy.get('circle[fill="#3b82f6"]').last()
        .trigger('mouseup');
      
      // 接続線が作成されたことを確認
      cy.get('path[stroke="#d1d5db"], path[stroke="#3b82f6"]')
        .should('have.length.at.least', 1);
    });

    it('キーボードショートカットでモード切り替え', () => {
      // Cキーで接続モードに
      cy.get('body').type('c');
      cy.contains('接続モード').should('be.visible');
      
      // Pキーで配置モードに
      cy.get('body').type('p');
      cy.contains('配置モード - 入力').should('be.visible');
    });
  });

  describe('4. シミュレーション機能', () => {
    it('INPUT → OUTPUT の単純な回路', () => {
      // ゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続モードに切り替え
      cy.get('body').type('c');
      
      // 接続を作成
      cy.get('circle[fill="#8b5cf6"]').first()
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').last()
        .trigger('mouseup');
      
      // INPUTをクリックしてONにする
      cy.get('.gate-rect').first().click();
      
      // 両方のゲートが緑色（アクティブ）になることを確認
      cy.get('rect[fill="#22c55e"]').should('have.length', 2);
      
      // 接続線もアクティブ（青色）になることを確認
      cy.get('path[stroke="#3b82f6"]').should('exist');
    });

    it('NOTゲートで信号を反転', () => {
      // INPUT → NOT → OUTPUT の回路を作成
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="NOTゲート (N)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続モードに切り替え
      cy.get('body').type('c');
      
      // INPUT → NOT を接続
      cy.get('circle[fill="#8b5cf6"]').eq(0)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(1)
        .trigger('mouseup');
      
      // NOT → OUTPUT を接続
      cy.get('circle[fill="#8b5cf6"]').eq(1)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(2)
        .trigger('mouseup');
      
      // INPUTをONにする
      cy.get('.gate-rect').first().click();
      
      // INPUTは緑、OUTPUTはグレー（反転）であることを確認
      cy.get('.gate-rect').first().should('have.attr', 'fill', '#22c55e');
      cy.get('.gate-rect').last().should('have.attr', 'fill', '#9ca3af');
    });
  });

  describe('5. UI機能', () => {
    it('ヘルプパネルの表示', () => {
      // ヘルプボタンをクリック
      cy.contains('button', 'ヘルプ').click();
      
      // ヘルプパネルが表示される
      cy.contains('ショートカット').should('be.visible');
      cy.contains('操作方法').should('be.visible');
      
      // ?キーでもトグルできる
      cy.get('body').type('?');
      cy.contains('ショートカット').should('not.exist');
      
      cy.get('body').type('?');
      cy.contains('ショートカット').should('be.visible');
    });

    it('履歴機能（Undo/Redo）', () => {
      // 配置モードでゲートを配置
      cy.contains('button', 'ANDゲート').click();
      cy.get('svg').click(300, 300);
      
      // ゲートが配置されたことを確認
      cy.get('.gate-rect').should('have.length', 1);
      
      // Ctrl+Z で元に戻す
      cy.get('body').type('{ctrl}z');
      cy.get('.gate-rect').should('have.length', 0);
      
      // Ctrl+Y でやり直す
      cy.get('body').type('{ctrl}y');
      cy.get('.gate-rect').should('have.length', 1);
    });

    it('クリアボタンで全削除', () => {
      // 複数のゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.get('button[title="出力 (O)"]').click();
      cy.get('button[title="ANDゲート (A)"]').click();
      
      // 3つのゲートが存在
      cy.get('.gate-rect').should('have.length', 3);
      
      // クリアボタンをクリック
      cy.contains('button', 'クリア').click();
      
      // 全て削除される
      cy.get('.gate-rect').should('have.length', 0);
    });

    it('右クリックでゲート削除', () => {
      // ゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      
      // 右クリックで削除
      cy.get('.gate-rect').rightclick();
      
      // ゲートが削除される
      cy.get('.gate-rect').should('have.length', 0);
    });

    it('INPUTゲートの値切り替え', () => {
      // INPUTゲートを配置
      cy.get('button[title="入力 (I)"]').click();
      
      // 初期状態（グレー = OFF）
      cy.get('.gate-rect').should('have.attr', 'fill', '#9ca3af');
      
      // クリックして値を切り替え
      cy.get('.gate-rect').click();
      
      // 緑色（ON）に変わる
      cy.get('.gate-rect').should('have.attr', 'fill', '#22c55e');
      
      // もう一度クリックしてOFFに戻す
      cy.get('.gate-rect').click();
      cy.get('.gate-rect').should('have.attr', 'fill', '#9ca3af');
    });
  });

  describe('6. 複雑な回路の作成', () => {
    it('2入力ANDゲートの動作確認', () => {
      // 2つのINPUT、1つのAND、1つのOUTPUTを配置
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="入力 (I)"]').click();
      cy.wait(100);
      cy.get('button[title="ANDゲート (A)"]').click();
      cy.wait(100);
      cy.get('button[title="出力 (O)"]').click();
      
      // 接続モードに切り替え
      cy.get('body').type('c');
      
      // 最初のINPUT → ANDの上側入力
      cy.get('circle[fill="#8b5cf6"]').eq(0)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(2)
        .trigger('mouseup');
      
      // 2番目のINPUT → ANDの下側入力
      cy.get('circle[fill="#8b5cf6"]').eq(1)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(3)
        .trigger('mouseup');
      
      // AND → OUTPUT
      cy.get('circle[fill="#8b5cf6"]').eq(2)
        .trigger('mousedown', { button: 0 });
      cy.get('circle[fill="#3b82f6"]').eq(4)
        .trigger('mouseup');
      
      // 配置モードに戻す
      cy.get('body').type('p');
      
      // 両方のINPUTをONにする
      cy.get('.gate-rect').eq(0).click();
      cy.get('.gate-rect').eq(1).click();
      
      // OUTPUTがON（緑）になることを確認
      cy.get('.gate-rect').eq(3).should('have.attr', 'fill', '#22c55e');
      
      // 片方のINPUTをOFFにする
      cy.get('.gate-rect').eq(0).click();
      
      // OUTPUTがOFF（グレー）になることを確認
      cy.get('.gate-rect').eq(3).should('have.attr', 'fill', '#9ca3af');
    });
  });
});