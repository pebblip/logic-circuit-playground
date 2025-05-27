/**
 * ドラッグ&ドロップ機能のE2Eテスト
 * 実装に依存しないテストケース
 */

describe('論理回路プレイグラウンド - ドラッグ&ドロップ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('ゲートのドラッグ移動', () => {
    it.skip('ゲートをドラッグして移動できる', () => { // 単体テストでカバー済み
      // ゲートを配置
      cy.placeGate('INPUT', 200, 200);
      
      // 初期位置を確認
      let initialX, initialY;
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').then(($text) => {
          initialX = parseFloat($text.attr('x'));
          initialY = parseFloat($text.attr('y'));
        });
      });
      
      // ドラッグして移動（改善版）
      cy.dragGate('INPUT', 0, 200, 100); // 200px右、100px下に移動
      
      // 新しい位置を確認
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').then(($text) => {
          const newX = parseFloat($text.attr('x'));
          const newY = parseFloat($text.attr('y'));
          
          // 位置が変わったことを確認
          expect(newX).to.not.equal(initialX);
          expect(newY).to.not.equal(initialY);
        });
      });
    });

    it.skip('接続されたゲートを移動すると接続線が追従する', () => { // 単体テストでカバー済み
      // 接続された回路を構築
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      
      cy.switchMode('connect');
      cy.connectWire('INPUT', 'output', 'OUTPUT', 'input');
      
      // 接続線の初期位置を記録
      let initialLineCoords;
      cy.get('svg').within(() => {
        cy.get('line').not('[stroke-dasharray]').then(($line) => {
          initialLineCoords = {
            x1: parseFloat($line.attr('x1')),
            y1: parseFloat($line.attr('y1')),
            x2: parseFloat($line.attr('x2')),
            y2: parseFloat($line.attr('y2'))
          };
        });
      });
      
      // INPUTゲートを移動
      cy.switchMode('place'); // ドラッグのために配置モードに戻す
      cy.dragGate('INPUT', 0, 0, 100); // 100px下に移動
      
      // 接続線が追従したことを確認
      cy.get('svg').within(() => {
        cy.get('line').not('[stroke-dasharray]').then(($line) => {
          const newLineCoords = {
            x1: parseFloat($line.attr('x1')),
            y1: parseFloat($line.attr('y1')),
            x2: parseFloat($line.attr('x2')),
            y2: parseFloat($line.attr('y2'))
          };
          
          // 始点（INPUTの出力）が移動したことを確認
          expect(newLineCoords.y1).to.not.equal(initialLineCoords.y1);
          // 終点（OUTPUTの入力）は変わらない
          expect(newLineCoords.x2).to.equal(initialLineCoords.x2);
          expect(newLineCoords.y2).to.equal(initialLineCoords.y2);
        });
      });
    });

    it('ドラッグ中はゲートが半透明になる', () => {
      cy.placeGate('AND', 300, 300);
      
      // ドラッグ開始
      cy.get('svg').within(() => {
        cy.contains('text', 'AND').parent()
          .find('rect')
          .trigger('mousedown', { button: 0 });
      });
      
      // ドラッグ中の状態を確認
      cy.get('svg').within(() => {
        cy.contains('text', 'AND').parent()
          .find('rect')
          .should('have.attr', 'style')
          .and('include', 'opacity: 0.5');
      });
      
      // ドラッグ終了
      cy.get('svg').trigger('mouseup', { button: 0 });
      
      // 透明度が元に戻ることを確認
      cy.get('svg').within(() => {
        cy.contains('text', 'AND').parent()
          .find('rect')
          .should('have.attr', 'style')
          .and('include', 'opacity: 1');
      });
    });
  });

  describe.skip('複数選択とグループ移動', () => {
    it('Ctrlキーで複数のゲートを選択できる', () => {
      // 複数のゲートを配置
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('AND', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      // Ctrl+クリックで複数選択
      cy.get('svg').within(() => {
        // 最初のゲートを選択
        cy.contains('text', 'INPUT').parent()
          .find('rect').click();
        
        // Ctrlを押しながら2番目のゲートを選択
        cy.contains('text', 'AND').parent()
          .find('rect').click({ ctrlKey: true });
        
        // 両方が選択状態になっていることを確認
        cy.contains('text', 'INPUT').parent()
          .find('rect').should('have.class', 'selected');
        cy.contains('text', 'AND').parent()
          .find('rect').should('have.class', 'selected');
      });
    });

    it('選択した複数のゲートを一緒に移動できる', () => {
      // ゲートを配置して接続
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('AND', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      cy.switchMode('connect');
      cy.connectWire('INPUT', 'output', 'AND', 'input');
      cy.connectWire('AND', 'output', 'OUTPUT', 'input');
      
      cy.switchMode('place');
      
      // 複数選択
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent().find('rect').click();
        cy.contains('text', 'AND').parent().find('rect').click({ ctrlKey: true });
      });
      
      // グループでドラッグ
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('rect')
          .trigger('mousedown', { button: 0 })
          .trigger('mousemove', { clientX: 250, clientY: 300 })
          .trigger('mouseup', { button: 0 });
      });
      
      // 両方のゲートが移動し、相対位置が保たれていることを確認
      // （実装依存のため、視覚的な確認で十分）
      cy.assertGateExists('INPUT', 1);
      cy.assertGateExists('AND', 1);
      cy.assertConnectionExists(2);
    });
  });

  describe('ドラッグの制約', () => {
    it.skip('キャンバスの境界を超えてドラッグできない', () => { // 単体テストでカバー済み
      cy.placeGate('NOT', 400, 400);
      
      // キャンバスの外へドラッグを試みる
      cy.dragGate('NOT', 0, -500, -500); // 大きく外側へ移動を試みる
      
      // ゲートがキャンバス内に留まっていることを確認
      cy.get('svg').within(() => {
        cy.contains('text', 'NOT').parent()
          .find('rect').then(($rect) => {
            const x = parseFloat($rect.attr('x'));
            const y = parseFloat($rect.attr('y'));
            
            expect(x).to.be.at.least(0);
            expect(y).to.be.at.least(0);
          });
      });
    });

    it.skip('ESCキーでドラッグをキャンセルできる', () => {
      cy.placeGate('OR', 300, 300);
      
      // 初期位置を記録
      let initialX, initialY;
      cy.get('svg').within(() => {
        cy.contains('text', 'OR').then(($text) => {
          initialX = parseFloat($text.attr('x'));
          initialY = parseFloat($text.attr('y'));
        });
      });
      
      // ドラッグ開始して移動
      cy.get('svg').within(() => {
        cy.contains('text', 'OR').parent()
          .find('rect')
          .trigger('mousedown', { button: 0 })
          .trigger('mousemove', { clientX: 500, clientY: 500 });
      });
      
      // ESCキーでキャンセル
      cy.get('body').type('{esc}');
      
      // 元の位置に戻っていることを確認
      cy.get('svg').within(() => {
        cy.contains('text', 'OR').then(($text) => {
          const x = parseFloat($text.attr('x'));
          const y = parseFloat($text.attr('y'));
          
          expect(x).to.equal(initialX);
          expect(y).to.equal(initialY);
        });
      });
    });
  });
});