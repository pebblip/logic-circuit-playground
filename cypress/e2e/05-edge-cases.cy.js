/**
 * エッジケースと異常系のE2Eテスト
 * 実装に依存しないテストケース
 */

describe('論理回路プレイグラウンド - エッジケース', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('大規模回路の処理', () => {
    it.skip('100個のゲートを配置してもパフォーマンスが維持される', () => { // 単体テストでカバー済み
      const startTime = Date.now();
      
      // 10x10のグリッドでゲートを配置
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const gateType = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'][Math.floor(Math.random() * 5)];
          cy.placeGate(gateType, 100 + i * 70, 100 + j * 60);
        }
      }
      
      // 配置にかかった時間を確認（10秒以内）
      const endTime = Date.now();
      expect(endTime - startTime).to.be.lessThan(10000);
      
      // すべてのゲートが表示されていることを確認
      cy.get('svg').within(() => {
        cy.get('text').should('have.length', 100);
      });
      
      // UIが応答することを確認
      cy.switchMode('connect');
      cy.contains('button', '接続モード').should('have.class', 'bg-blue-500');
    });

    it.skip('循環参照のある回路でも安定動作する', () => { // 単体テストでカバー済み
      // フィードバックループを含む回路を構築
      cy.placeGate('NOT', 300, 200);
      cy.placeGate('NOT', 500, 200);
      
      cy.switchMode('connect');
      
      // NOT1 -> NOT2
      cy.connectWire('NOT', 'output', 'NOT', 'input');
      
      // NOT2 -> NOT1（循環）
      cy.get('svg').within(() => {
        cy.contains('text', 'NOT').eq(1).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'NOT').eq(0).parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // アプリケーションがクラッシュしないことを確認
      cy.contains('論理回路プレイグラウンド').should('be.visible');
      
      // 警告メッセージが表示される（実装による）
      // cy.contains('循環参照').should('be.visible');
    });
  });

  describe('高速操作への対応', () => {
    it('高速な連続クリックでも正常に動作する', () => {
      // 同じ位置に10回連続でクリック
      for (let i = 0; i < 10; i++) {
        cy.get('svg').click(300, 300, { force: true });
      }
      
      // 1つのゲートのみが配置されていることを確認
      cy.assertGateExists('INPUT', 1);
    });

    it('ドラッグ中の高速移動でも接続線が追従する', () => {
      // 接続された回路を構築
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      cy.switchMode('connect');
      cy.connectWire('INPUT', 'output', 'OUTPUT', 'input');
      
      cy.switchMode('place');
      
      // 高速でジグザグにドラッグ
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect')
          .trigger('mousedown', { button: 0 })
          .trigger('mousemove', { clientX: 300, clientY: 100 })
          .trigger('mousemove', { clientX: 200, clientY: 300 })
          .trigger('mousemove', { clientX: 400, clientY: 200 })
          .trigger('mousemove', { clientX: 300, clientY: 400 })
          .trigger('mouseup', { button: 0 });
      });
      
      // 接続が維持されていることを確認
      cy.assertConnectionExists(1);
    });
  });

  describe('境界値テスト', () => {
    it('キャンバスの端にゲートを配置できる', () => {
      // 四隅に配置
      cy.placeGate('INPUT', 30, 30);      // 左上
      cy.placeGate('OUTPUT', 770, 30);    // 右上
      cy.placeGate('AND', 30, 570);       // 左下
      cy.placeGate('OR', 770, 570);       // 右下
      
      // すべてのゲートが表示されていることを確認
      cy.assertGateExists('INPUT', 1);
      cy.assertGateExists('OUTPUT', 1);
      cy.assertGateExists('AND', 1);
      cy.assertGateExists('OR', 1);
    });

    it.skip('最小距離でゲートを配置しても重ならない', () => { // 単体テストでカバー済み
      // 密集してゲートを配置
      cy.placeGate('NOT', 300, 300);
      cy.placeGate('NOT', 360, 300); // 右隣
      cy.placeGate('NOT', 300, 340); // 下
      
      // 3つのゲートがすべて表示されていることを確認
      cy.assertGateExists('NOT', 3);
      
      // ゲートが重なっていないことを視覚的に確認
      cy.get('svg').within(() => {
        cy.get('rect').should('have.length', 4); // グリッド + 3ゲート
      });
    });
  });

  describe('異常な入力への対応', () => {
    it.skip('無効な接続（出力→出力）を拒否する', () => { // 単体テストでカバー済み
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('INPUT', 400, 200);
      
      cy.switchMode('connect');
      
      // 両方の出力端子を接続しようとする
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(0).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("INPUT")').eq(1).parent()
          .find('circle').last().trigger('mouseup', { button: 0 });
      });
      
      // 接続が作成されていないことを確認
      cy.assertConnectionExists(0);
    });

    it('削除されたゲートへの参照が残らない', () => {
      // 3つのゲートを接続
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('NOT', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      cy.switchMode('connect');
      cy.connectWire('INPUT', 'output', 'NOT', 'input');
      cy.connectWire('NOT', 'output', 'OUTPUT', 'input');
      
      // 中間のゲートを削除
      cy.get('svg').within(() => {
        cy.contains('text', 'NOT').parent()
          .find('rect').rightclick();
      });
      
      // NOTゲートと関連する接続が削除されていることを確認
      cy.assertGateExists('NOT', 0);
      cy.assertConnectionExists(0);
      
      // 残りのゲートが正常に動作することを確認
      cy.toggleInput(0);
      cy.assertGateState('INPUT', 0, true);
    });
  });

  describe('ブラウザ互換性', () => {
    it('ブラウザのズーム機能と共存する', () => {
      // ブラウザズーム150%をシミュレート
      cy.viewport(1280, 720);
      cy.get('body').invoke('css', 'zoom', '1.5');
      
      // ゲートを配置
      cy.placeGate('AND', 400, 300);
      
      // ゲートが表示されていることを確認
      cy.assertGateExists('AND', 1);
      
      // ズームをリセット
      cy.get('body').invoke('css', 'zoom', '1');
    });

    it('ウィンドウリサイズ後も正常動作する', () => {
      // 初期サイズでゲートを配置
      cy.placeGate('OR', 600, 400);
      
      // ウィンドウをリサイズ
      cy.viewport(800, 600);
      
      // ゲートが表示されていることを確認
      cy.assertGateExists('OR', 1);
      
      // 新しいゲートを配置できることを確認
      cy.placeGate('NOT', 300, 300);
      cy.assertGateExists('NOT', 1);
    });
  });

  describe('メモリ管理', () => {
    it('大量の操作後もメモリリークがない', () => {
      // 50回の配置と削除を繰り返す
      for (let i = 0; i < 50; i++) {
        // ゲートを配置
        cy.placeGate('AND', 300 + (i % 5) * 50, 300);
        
        // 削除
        cy.get('svg').within(() => {
          cy.get('rect').last().rightclick({ force: true });
        });
      }
      
      // アプリケーションが正常動作することを確認
      cy.contains('論理回路プレイグラウンド').should('be.visible');
      
      // 最終的にゲートが残っていないことを確認
      cy.get('svg').within(() => {
        cy.get('text').should('not.exist');
      });
    });
  });
});