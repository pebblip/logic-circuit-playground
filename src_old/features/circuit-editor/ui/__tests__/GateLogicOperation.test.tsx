import { describe, it, expect } from 'vitest';
import { UltraModernCircuitViewModel } from '../../model/UltraModernCircuitViewModel';

describe('ゲートの論理演算テスト', () => {
  describe('基本論理ゲート', () => {
    it('ANDゲート: 両方の入力が真のときのみ真を出力', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const andGate = viewModel.addGate('AND', 300, 150);
      const output = viewModel.addGate('OUTPUT', 500, 150);
      
      viewModel.addConnection(input1.id, 0, andGate.id, 0);
      viewModel.addConnection(input2.id, 0, andGate.id, 1);
      viewModel.addConnection(andGate.id, 0, output.id, 0);
      
      // テストケース: false, false -> false
      const results1 = viewModel.getSimulationResults();
      expect(results1[andGate.id]).toBe(false);
      
      // テストケース: true, false -> false
      viewModel.toggleInput(input1.id);
      const results2 = viewModel.getSimulationResults();
      expect(results2[andGate.id]).toBe(false);
      
      // テストケース: true, true -> true
      viewModel.toggleInput(input2.id);
      const results3 = viewModel.getSimulationResults();
      expect(results3[andGate.id]).toBe(true);
      
      // テストケース: false, true -> false
      viewModel.toggleInput(input1.id);
      const results4 = viewModel.getSimulationResults();
      expect(results4[andGate.id]).toBe(false);
    });

    it('ORゲート: いずれかの入力が真のとき真を出力', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const orGate = viewModel.addGate('OR', 300, 150);
      
      viewModel.addConnection(input1.id, 0, orGate.id, 0);
      viewModel.addConnection(input2.id, 0, orGate.id, 1);
      
      // false, false -> false
      expect(viewModel.getSimulationResults()[orGate.id]).toBe(false);
      
      // true, false -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[orGate.id]).toBe(true);
      
      // true, true -> true
      viewModel.toggleInput(input2.id);
      expect(viewModel.getSimulationResults()[orGate.id]).toBe(true);
      
      // false, true -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[orGate.id]).toBe(true);
    });

    it('NOTゲート: 入力を反転', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input = viewModel.addGate('INPUT', 100, 100);
      const notGate = viewModel.addGate('NOT', 300, 100);
      
      viewModel.addConnection(input.id, 0, notGate.id, 0);
      
      // false -> true
      expect(viewModel.getSimulationResults()[notGate.id]).toBe(true);
      
      // true -> false
      viewModel.toggleInput(input.id);
      expect(viewModel.getSimulationResults()[notGate.id]).toBe(false);
    });

    it('NANDゲート: ANDの否定', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const nandGate = viewModel.addGate('NAND', 300, 150);
      
      viewModel.addConnection(input1.id, 0, nandGate.id, 0);
      viewModel.addConnection(input2.id, 0, nandGate.id, 1);
      
      // false, false -> true
      expect(viewModel.getSimulationResults()[nandGate.id]).toBe(true);
      
      // true, false -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[nandGate.id]).toBe(true);
      
      // true, true -> false
      viewModel.toggleInput(input2.id);
      expect(viewModel.getSimulationResults()[nandGate.id]).toBe(false);
      
      // false, true -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[nandGate.id]).toBe(true);
    });

    it('NORゲート: ORの否定', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const norGate = viewModel.addGate('NOR', 300, 150);
      
      viewModel.addConnection(input1.id, 0, norGate.id, 0);
      viewModel.addConnection(input2.id, 0, norGate.id, 1);
      
      // false, false -> true
      expect(viewModel.getSimulationResults()[norGate.id]).toBe(true);
      
      // true, false -> false
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[norGate.id]).toBe(false);
      
      // true, true -> false
      viewModel.toggleInput(input2.id);
      expect(viewModel.getSimulationResults()[norGate.id]).toBe(false);
      
      // false, true -> false
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[norGate.id]).toBe(false);
    });

    it('XORゲート: 排他的論理和', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const xorGate = viewModel.addGate('XOR', 300, 150);
      
      viewModel.addConnection(input1.id, 0, xorGate.id, 0);
      viewModel.addConnection(input2.id, 0, xorGate.id, 1);
      
      // false, false -> false
      expect(viewModel.getSimulationResults()[xorGate.id]).toBe(false);
      
      // true, false -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[xorGate.id]).toBe(true);
      
      // true, true -> false
      viewModel.toggleInput(input2.id);
      expect(viewModel.getSimulationResults()[xorGate.id]).toBe(false);
      
      // false, true -> true
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[xorGate.id]).toBe(true);
    });

    it('XNORゲート: XORの否定（2入力の場合）', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const input1 = viewModel.addGate('INPUT', 100, 100);
      const input2 = viewModel.addGate('INPUT', 100, 200);
      const xnorGate = viewModel.addGate('XNOR', 300, 150);
      
      viewModel.addConnection(input1.id, 0, xnorGate.id, 0);
      viewModel.addConnection(input2.id, 0, xnorGate.id, 1);
      
      // false, false -> true
      expect(viewModel.getSimulationResults()[xnorGate.id]).toBe(true);
      
      // true, false -> false
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[xnorGate.id]).toBe(false);
      
      // true, true -> true
      viewModel.toggleInput(input2.id);
      expect(viewModel.getSimulationResults()[xnorGate.id]).toBe(true);
      
      // false, true -> false
      viewModel.toggleInput(input1.id);
      expect(viewModel.getSimulationResults()[xnorGate.id]).toBe(false);
    });
  });

  describe('複合回路', () => {
    it('半加算器（Half Adder）: XORとANDで構成', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      const a = viewModel.addGate('INPUT', 100, 100);
      const b = viewModel.addGate('INPUT', 100, 200);
      const xorGate = viewModel.addGate('XOR', 300, 100);
      const andGate = viewModel.addGate('AND', 300, 200);
      const sum = viewModel.addGate('OUTPUT', 500, 100);
      const carry = viewModel.addGate('OUTPUT', 500, 200);
      
      // XOR接続（Sum出力）
      viewModel.addConnection(a.id, 0, xorGate.id, 0);
      viewModel.addConnection(b.id, 0, xorGate.id, 1);
      viewModel.addConnection(xorGate.id, 0, sum.id, 0);
      
      // AND接続（Carry出力）
      viewModel.addConnection(a.id, 0, andGate.id, 0);
      viewModel.addConnection(b.id, 0, andGate.id, 1);
      viewModel.addConnection(andGate.id, 0, carry.id, 0);
      
      const results = viewModel.getSimulationResults();
      
      // 0 + 0 = 0, carry = 0
      // OUTPUTゲートは値を持たないので、XORとANDの出力を確認
      expect(results[xorGate.id]).toBe(false);
      expect(results[andGate.id]).toBe(false);
      
      // 1 + 0 = 1, carry = 0
      viewModel.toggleInput(a.id);
      const results2 = viewModel.getSimulationResults();
      expect(results2[xorGate.id]).toBe(true);
      expect(results2[andGate.id]).toBe(false);
      
      // 1 + 1 = 0, carry = 1
      viewModel.toggleInput(b.id);
      const results3 = viewModel.getSimulationResults();
      expect(results3[xorGate.id]).toBe(false);
      expect(results3[andGate.id]).toBe(true);
    });

    it('デ・モルガンの法則: NOT(A AND B) = (NOT A) OR (NOT B)', () => {
      const viewModel = new UltraModernCircuitViewModel();
      
      // 左辺: NOT(A AND B)
      const a1 = viewModel.addGate('INPUT', 50, 100);
      const b1 = viewModel.addGate('INPUT', 50, 200);
      const and1 = viewModel.addGate('AND', 150, 150);
      const not1 = viewModel.addGate('NOT', 250, 150);
      
      viewModel.addConnection(a1.id, 0, and1.id, 0);
      viewModel.addConnection(b1.id, 0, and1.id, 1);
      viewModel.addConnection(and1.id, 0, not1.id, 0);
      
      // 右辺: (NOT A) OR (NOT B)
      const a2 = viewModel.addGate('INPUT', 50, 300);
      const b2 = viewModel.addGate('INPUT', 50, 400);
      const not2 = viewModel.addGate('NOT', 150, 300);
      const not3 = viewModel.addGate('NOT', 150, 400);
      const or1 = viewModel.addGate('OR', 250, 350);
      
      viewModel.addConnection(a2.id, 0, not2.id, 0);
      viewModel.addConnection(b2.id, 0, not3.id, 0);
      viewModel.addConnection(not2.id, 0, or1.id, 0);
      viewModel.addConnection(not3.id, 0, or1.id, 1);
      
      // すべての入力の組み合わせで等価性を確認
      const testCases = [
        [false, false],
        [true, false],
        [false, true],
        [true, true]
      ];
      
      testCases.forEach(([aVal, bVal]) => {
        // 入力を設定
        if (aVal) viewModel.toggleInput(a1.id);
        if (bVal) viewModel.toggleInput(b1.id);
        if (aVal) viewModel.toggleInput(a2.id);
        if (bVal) viewModel.toggleInput(b2.id);
        
        const results = viewModel.getSimulationResults();
        
        // 左辺と右辺が等しいことを確認
        expect(results[not1.id]).toBe(results[or1.id]);
        
        // 元に戻す
        if (aVal) viewModel.toggleInput(a1.id);
        if (bVal) viewModel.toggleInput(b1.id);
        if (aVal) viewModel.toggleInput(a2.id);
        if (bVal) viewModel.toggleInput(b2.id);
      });
    });
  });
});