/**
 * ワイヤー接続機能のE2Eテスト
 * 実装に依存しないテストケース
 */

describe('論理回路プレイグラウンド - ワイヤー接続', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('基本的な接続', () => {
    it('接続モードで出力から入力へワイヤーを接続できる', () => {
      // ゲートを配置
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      
      // 接続モードに切り替えて接続
      cy.switchMode('connect');
      
      // INPUTの出力端子からOUTPUTの入力端子へドラッグ
      cy.get('svg').within(() => {
        // INPUTゲートの出力端子（右側）を探す
        cy.contains('text', 'INPUT').parent().within(() => {
          cy.get('circle').last()
            .trigger('mousedown', { button: 0 });
        });
        
        // OUTPUTゲートの入力端子（左側）へ
        cy.contains('text', 'OUTPUT').parent().within(() => {
          cy.get('circle').first()
            .trigger('mouseup', { button: 0 });
        });
      });
      
      // 接続線が作成されたことを確認
      cy.assertConnectionExists(1);
    });

    it('配置モードでは接続できない', () => {
      // ゲートを配置
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      
      // 配置モードのまま接続を試みる
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('circle').last()
          .trigger('mousedown', { button: 0 });
        
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first()
          .trigger('mouseup', { button: 0 });
      });
      
      // 接続線が作成されていないことを確認
      cy.get('svg').within(() => {
        cy.get('line').should('not.exist');
      });
    });
  });

  describe('複数入力ゲートの接続', () => {
    it('ANDゲートに複数の入力を接続できる', () => {
      // 2つのINPUTと1つのANDゲートを配置
      cy.placeGate('INPUT', 200, 150);
      cy.placeGate('INPUT', 200, 250);
      cy.placeGate('AND', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      // 接続モードに切り替え
      cy.switchMode('connect');
      
      // 最初のINPUTをANDの最初の入力に接続
      cy.get('svg').within(() => {
        // INPUT1の出力端子から
        cy.get('text:contains("INPUT")').eq(0).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        // ANDの最初の入力端子へ
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(0).trigger('mouseup', { button: 0 });
      });
      
      // 2番目のINPUTをANDの2番目の入力端子に接続
      cy.get('svg').within(() => {
        // INPUT2の出力端子から
        cy.get('text:contains("INPUT")').eq(1).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        // ANDの2番目の入力端子へ
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(1).trigger('mouseup', { button: 0 });
      });
      
      // ANDをOUTPUTに接続
      cy.get('svg').within(() => {
        // ANDの出力端子から
        cy.get('text:contains("AND")').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        // OUTPUTの入力端子へ
        cy.get('text:contains("OUTPUT")').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 3本の接続線が存在することを確認
      cy.assertConnectionExists(3);
    });
  });

  describe('接続の制約', () => {
    it('同じゲートの出力から入力への接続はできない', () => {
      cy.placeGate('AND', 300, 200);
      cy.switchMode('connect');
      
      // ANDの出力から同じANDの入力へ接続を試みる
      cy.get('svg').within(() => {
        cy.contains('text', 'AND').parent().within(() => {
          cy.get('circle').last().trigger('mousedown', { button: 0 });
          cy.get('circle').first().trigger('mouseup', { button: 0 });
        });
      });
      
      // 接続線が作成されていないことを確認
      cy.assertConnectionExists(0);
    });

    it('入力端子から出力端子への逆接続はできない', () => {
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      cy.switchMode('connect');
      
      // OUTPUTの入力からINPUTの出力へ（逆方向）
      cy.get('svg').within(() => {
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first().trigger('mousedown', { button: 0 });
        cy.contains('text', 'INPUT').parent()
          .find('circle').last().trigger('mouseup', { button: 0 });
      });
      
      // 接続線が作成されていないことを確認
      cy.assertConnectionExists(0);
    });
  });

  describe('接続線の削除', () => {
    it('ゲートを削除すると関連する接続も削除される', () => {
      // ゲートを配置して接続
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      cy.switchMode('connect');
      
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      cy.assertConnectionExists(1);
      
      // INPUTゲートを削除
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect').rightclick();
      });
      
      // 接続線も削除されていることを確認
      cy.assertConnectionExists(0);
    });
  });
});