/**
 * シミュレーション機能のE2Eテスト
 * 実装に依存しないテストケース
 */

describe('論理回路プレイグラウンド - シミュレーション', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('基本的なシミュレーション', () => {
    it('INPUTの値がOUTPUTに伝播する', () => {
      // INPUT -> OUTPUT の単純な回路
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      
      cy.switchMode('connect');
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 初期状態：両方とも非アクティブ
      cy.assertGateState('INPUT', 0, false);
      cy.assertGateState('OUTPUT', 0, false);
      
      // INPUTをアクティブに
      cy.toggleInput(0);
      
      // OUTPUTもアクティブになることを確認
      cy.assertGateState('INPUT', 0, true);
      cy.assertGateState('OUTPUT', 0, true);
    });

    it('接続線の状態が視覚的に表示される', () => {
      // 回路を構築
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('OUTPUT', 400, 200);
      
      cy.switchMode('connect');
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 非アクティブ時の線の色
      cy.get('svg').within(() => {
        cy.get('line').not('[stroke-dasharray]')
          .should('have.attr', 'stroke', '#000');
      });
      
      // INPUTをアクティブに
      cy.toggleInput(0);
      
      // アクティブ時の線の色（緑）
      cy.get('svg').within(() => {
        cy.get('line').not('[stroke-dasharray]')
          .should('have.attr', 'stroke', '#10b981');
      });
    });
  });

  describe('論理ゲートのシミュレーション', () => {
    it('ANDゲートが正しく動作する', () => {
      // 2入力ANDゲートの回路を構築
      cy.placeGate('INPUT', 200, 150);
      cy.placeGate('INPUT', 200, 250);
      cy.placeGate('AND', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      // 接続
      cy.switchMode('connect');
      
      // 最初のINPUTをANDの最初の入力に接続
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(0).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(0).trigger('mouseup', { button: 0 });
      });
      
      // 2番目のINPUTをANDの2番目の入力に接続
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(1).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(1).trigger('mouseup', { button: 0 });
      });
      
      // ANDをOUTPUTに接続
      cy.get('svg').within(() => {
        cy.get('text:contains("AND")').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OUTPUT")').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 初期状態：すべて0
      cy.assertGateState('OUTPUT', 0, false);
      
      // 片方の入力を1に
      cy.toggleInput(0);
      cy.assertGateState('OUTPUT', 0, false); // まだ0
      
      // 両方の入力を1に
      cy.toggleInput(1);
      cy.assertGateState('OUTPUT', 0, true); // 1になる
      
      // 片方を0に戻す
      cy.toggleInput(0);
      cy.assertGateState('OUTPUT', 0, false); // 0に戻る
    });

    it('ORゲートが正しく動作する', () => {
      // 2入力ORゲートの回路を構築
      cy.placeGate('INPUT', 200, 150);
      cy.placeGate('INPUT', 200, 250);
      cy.placeGate('OR', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      // 接続
      cy.switchMode('connect');
      
      // 最初のINPUTをORの最初の入力に接続
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(0).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OR")').parent()
          .find('circle').eq(0).trigger('mouseup', { button: 0 });
      });
      
      // 2番目のINPUTをORの2番目の入力に接続
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(1).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OR")').parent()
          .find('circle').eq(1).trigger('mouseup', { button: 0 });
      });
      
      // ORをOUTPUTに接続
      cy.get('svg').within(() => {
        cy.get('text:contains("OR")').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OUTPUT")').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 初期状態：すべて0
      cy.assertGateState('OUTPUT', 0, false);
      
      // 片方の入力を1に
      cy.toggleInput(0);
      cy.assertGateState('OUTPUT', 0, true); // 1になる
      
      // 両方の入力を1に
      cy.toggleInput(1);
      cy.assertGateState('OUTPUT', 0, true); // 1のまま
      
      // 両方を0に
      cy.toggleInput(0);
      cy.toggleInput(1);
      cy.assertGateState('OUTPUT', 0, false); // 0になる
    });

    it('NOTゲートが正しく動作する', () => {
      // NOTゲートの回路を構築
      cy.placeGate('INPUT', 200, 200);
      cy.placeGate('NOT', 400, 200);
      cy.placeGate('OUTPUT', 600, 200);
      
      // 接続
      cy.switchMode('connect');
      
      // INPUTをNOTに接続
      cy.get('svg').within(() => {
        cy.contains('text', 'INPUT').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'NOT').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // NOTをOUTPUTに接続
      cy.get('svg').within(() => {
        cy.contains('text', 'NOT').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.contains('text', 'OUTPUT').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // 初期状態：INPUT=0, OUTPUT=1（反転）
      cy.assertGateState('OUTPUT', 0, true);
      
      // INPUTを1に
      cy.toggleInput(0);
      cy.assertGateState('OUTPUT', 0, false); // 0になる（反転）
    });
  });

  describe('複雑な回路のシミュレーション', () => {
    it('多段接続の回路が正しく動作する', () => {
      // (A AND B) OR C の回路を構築
      cy.placeGate('INPUT', 100, 100); // A
      cy.placeGate('INPUT', 100, 200); // B
      cy.placeGate('INPUT', 100, 300); // C
      cy.placeGate('AND', 300, 150);
      cy.placeGate('OR', 500, 225);
      cy.placeGate('OUTPUT', 700, 225);
      
      // 接続
      cy.switchMode('connect');
      // A -> AND
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(0).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(0).trigger('mouseup', { button: 0 });
      });
      
      // B -> AND
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(1).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("AND")').parent()
          .find('circle').eq(1).trigger('mouseup', { button: 0 });
      });
      
      // AND -> OR
      cy.get('svg').within(() => {
        cy.get('text:contains("AND")').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OR")').parent()
          .find('circle').eq(0).trigger('mouseup', { button: 0 });
      });
      
      // C -> OR
      cy.get('svg').within(() => {
        cy.get('text:contains("INPUT")').eq(2).parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OR")').parent()
          .find('circle').eq(1).trigger('mouseup', { button: 0 });
      });
      
      // OR -> OUTPUT
      cy.get('svg').within(() => {
        cy.get('text:contains("OR")').parent()
          .find('circle').last().trigger('mousedown', { button: 0 });
        cy.get('text:contains("OUTPUT")').parent()
          .find('circle').first().trigger('mouseup', { button: 0 });
      });
      
      // テストケース1: A=1, B=1, C=0 => (1 AND 1) OR 0 = 1
      cy.toggleInput(0); // A=1
      cy.toggleInput(1); // B=1
      cy.assertGateState('OUTPUT', 0, true);
      
      // テストケース2: A=0, B=1, C=1 => (0 AND 1) OR 1 = 1
      cy.toggleInput(0); // A=0
      cy.toggleInput(2); // C=1
      cy.assertGateState('OUTPUT', 0, true);
      
      // テストケース3: A=0, B=0, C=0 => (0 AND 0) OR 0 = 0
      cy.toggleInput(1); // B=0
      cy.toggleInput(2); // C=0
      cy.assertGateState('OUTPUT', 0, false);
    });
  });
});