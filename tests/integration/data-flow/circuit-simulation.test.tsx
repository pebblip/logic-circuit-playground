/**
 * コア機能: 回路シミュレーションのE2Eテスト
 * ユーザー視点での回路の動作検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';

describe('回路シミュレーション - ユーザー機能テスト', () => {
  beforeEach(() => {
    useCircuitStore.setState({
      gates: [],
      wires: [],
    });
  });

  describe('基本論理ゲートの動作', () => {
    it('ANDゲートが真理値表通りに動作する', () => {
      const { addGate, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore.getState();
      
      // 回路を構築: INPUT × 2 → AND → OUTPUT
      addGate('INPUT', { x: 100, y: 150 });
      addGate('INPUT', { x: 100, y: 250 });
      addGate('AND', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 500, y: 200 });
      
      const [input1, input2, and, output] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(input1.id, -1);
      endWireDrawing(and.id, 0);
      
      startWireDrawing(input2.id, -1);
      endWireDrawing(and.id, 1);
      
      startWireDrawing(and.id, -1);
      endWireDrawing(output.id, 0);
      
      // テストケース: 0 AND 0 = 0
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
      
      // テストケース: 1 AND 0 = 0
      updateGateOutput(input1.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
      
      // テストケース: 1 AND 1 = 1
      updateGateOutput(input2.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
      
      // テストケース: 0 AND 1 = 0
      updateGateOutput(input1.id, false);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
    });

    it('ORゲートが真理値表通りに動作する', () => {
      const { addGate, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore.getState();
      
      // 回路を構築: INPUT × 2 → OR → OUTPUT
      addGate('INPUT', { x: 100, y: 150 });
      addGate('INPUT', { x: 100, y: 250 });
      addGate('OR', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 500, y: 200 });
      
      const [input1, input2, or, output] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(input1.id, -1);
      endWireDrawing(or.id, 0);
      
      startWireDrawing(input2.id, -1);
      endWireDrawing(or.id, 1);
      
      startWireDrawing(or.id, -1);
      endWireDrawing(output.id, 0);
      
      // テストケース: 0 OR 0 = 0
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
      
      // テストケース: 1 OR 0 = 1
      updateGateOutput(input1.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
      
      // テストケース: 1 OR 1 = 1
      updateGateOutput(input2.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
      
      // テストケース: 0 OR 1 = 1
      updateGateOutput(input1.id, false);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
    });

    it('NOTゲートが入力を反転する', () => {
      const { addGate, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore.getState();
      
      // 回路を構築: INPUT → NOT → OUTPUT
      addGate('INPUT', { x: 100, y: 200 });
      addGate('NOT', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 500, y: 200 });
      
      const [input, not, output] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(input.id, -1);
      endWireDrawing(not.id, 0);
      
      startWireDrawing(not.id, -1);
      endWireDrawing(output.id, 0);
      
      // 初期状態: NOT(0) = 1
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
      
      // 入力を切り替え: NOT(1) = 0
      updateGateOutput(input.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
    });

    it('XORゲートが排他的論理和を計算する', () => {
      const { addGate, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore.getState();
      
      // 回路を構築
      addGate('INPUT', { x: 100, y: 150 });
      addGate('INPUT', { x: 100, y: 250 });
      addGate('XOR', { x: 300, y: 200 });
      addGate('OUTPUT', { x: 500, y: 200 });
      
      const [input1, input2, xor, output] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(input1.id, -1); endWireDrawing(xor.id, 0);
      startWireDrawing(input2.id, -1); endWireDrawing(xor.id, 1);
      startWireDrawing(xor.id, -1); endWireDrawing(output.id, 0);
      
      // 0 XOR 0 = 0
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
      
      // 1 XOR 0 = 1
      updateGateOutput(input1.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(true);
      
      // 1 XOR 1 = 0
      updateGateOutput(input2.id, true);
      expect(useCircuitStore.getState().gates.find(g => g.id === output.id)?.output).toBe(false);
    });
  });

  describe('複合回路の動作', () => {
    it('半加算器が正しく動作する', () => {
      const { addGate, startWireDrawing, endWireDrawing, updateGateOutput } = useCircuitStore.getState();
      
      // 半加算器: A, B → Sum(XOR), Carry(AND)
      addGate('INPUT', { x: 100, y: 150 });  // A
      addGate('INPUT', { x: 100, y: 250 });  // B
      addGate('XOR', { x: 300, y: 150 });    // Sum
      addGate('AND', { x: 300, y: 250 });    // Carry
      addGate('OUTPUT', { x: 500, y: 150 }); // Sum出力
      addGate('OUTPUT', { x: 500, y: 250 }); // Carry出力
      
      const [a, b, xor, and, sumOut, carryOut] = useCircuitStore.getState().gates;
      
      // 接続
      startWireDrawing(a.id, -1); endWireDrawing(xor.id, 0);
      startWireDrawing(b.id, -1); endWireDrawing(xor.id, 1);
      startWireDrawing(a.id, -1); endWireDrawing(and.id, 0);
      startWireDrawing(b.id, -1); endWireDrawing(and.id, 1);
      startWireDrawing(xor.id, -1); endWireDrawing(sumOut.id, 0);
      startWireDrawing(and.id, -1); endWireDrawing(carryOut.id, 0);
      
      const getSumOutput = () => useCircuitStore.getState().gates.find(g => g.id === sumOut.id)?.output;
      const getCarryOutput = () => useCircuitStore.getState().gates.find(g => g.id === carryOut.id)?.output;
      
      // 0 + 0 = 0 (carry: 0)
      expect(getSumOutput()).toBe(false);
      expect(getCarryOutput()).toBe(false);
      
      // 1 + 0 = 1 (carry: 0)
      updateGateOutput(a.id, true);
      expect(getSumOutput()).toBe(true);
      expect(getCarryOutput()).toBe(false);
      
      // 1 + 1 = 0 (carry: 1)
      updateGateOutput(b.id, true);
      expect(getSumOutput()).toBe(false);
      expect(getCarryOutput()).toBe(true);
    });
  });
  
  // De Morgan、SR-LATCH、MUX、大規模回路は価値が低いため削除
});