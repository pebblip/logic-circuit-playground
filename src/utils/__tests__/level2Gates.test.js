import { describe, it, expect } from 'vitest';
import { calculateCircuit, createGate } from '../circuit';
import { GATE_TYPES } from '../../constants/circuit';

describe('Level 2 Gates', () => {
  describe('NAND Gate', () => {
    it('NANDゲートが正しく動作する', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', value: true },
        { id: 'in2', type: 'INPUT', value: true },
        { id: 'nand1', type: 'NAND' }
      ];
      
      const connections = [
        { from: 'in1', to: 'nand1', toInput: 0 },
        { from: 'in2', to: 'nand1', toInput: 1 }
      ];
      
      // 真理値表のテスト
      const testCases = [
        { in1: false, in2: false, expected: true },
        { in1: false, in2: true, expected: true },
        { in1: true, in2: false, expected: true },
        { in1: true, in2: true, expected: false }
      ];
      
      testCases.forEach(({ in1, in2, expected }) => {
        gates[0].value = in1;
        gates[1].value = in2;
        const result = calculateCircuit(gates, connections);
        expect(result.nand1).toBe(expected);
      });
    });
  });

  describe('NOR Gate', () => {
    it('NORゲートが正しく動作する', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', value: true },
        { id: 'in2', type: 'INPUT', value: true },
        { id: 'nor1', type: 'NOR' }
      ];
      
      const connections = [
        { from: 'in1', to: 'nor1', toInput: 0 },
        { from: 'in2', to: 'nor1', toInput: 1 }
      ];
      
      // 真理値表のテスト
      const testCases = [
        { in1: false, in2: false, expected: true },
        { in1: false, in2: true, expected: false },
        { in1: true, in2: false, expected: false },
        { in1: true, in2: true, expected: false }
      ];
      
      testCases.forEach(({ in1, in2, expected }) => {
        gates[0].value = in1;
        gates[1].value = in2;
        const result = calculateCircuit(gates, connections);
        expect(result.nor1).toBe(expected);
      });
    });
  });

  describe('SR Latch', () => {
    it('SR Latchの基本動作をテスト', () => {
      const srLatch = createGate('SR_LATCH', 100, 100);
      const gates = [
        { id: 'S', type: 'INPUT', value: false },
        { id: 'R', type: 'INPUT', value: false },
        srLatch
      ];
      
      const connections = [
        { from: 'S', to: srLatch.id, toInput: 0 },
        { from: 'R', to: srLatch.id, toInput: 1 }
      ];
      
      // 初期状態（S=0, R=0）- 前の状態を保持
      let result = calculateCircuit(gates, connections);
      expect(result[srLatch.id]).toBe(false); // Q
      expect(result[`${srLatch.id}_out1`]).toBe(true); // Q'
      
      // Set状態（S=1, R=0）
      gates[0].value = true;
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[srLatch.id]).toBe(true); // Q
      expect(result[`${srLatch.id}_out1`]).toBe(false); // Q'
      
      // 保持状態（S=0, R=0）
      gates[0].value = false;
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[srLatch.id]).toBe(true); // Q - 前の状態を保持
      expect(result[`${srLatch.id}_out1`]).toBe(false); // Q'
      
      // Reset状態（S=0, R=1）
      gates[0].value = false;
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[srLatch.id]).toBe(false); // Q
      expect(result[`${srLatch.id}_out1`]).toBe(true); // Q'
      
      // 禁止状態（S=1, R=1）
      gates[0].value = true;
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[srLatch.id]).toBe(true); // Q
      expect(result[`${srLatch.id}_out1`]).toBe(true); // Q' - 両方true
    });
  });

  describe('D Flip-Flop', () => {
    it('D Flip-Flopの基本動作をテスト', () => {
      const dff = createGate('D_FF', 100, 100);
      const gates = [
        { id: 'D', type: 'INPUT', value: false },
        { id: 'CLK', type: 'CLOCK', value: false },
        dff
      ];
      
      const connections = [
        { from: 'D', to: dff.id, toInput: 0 },
        { from: 'CLK', to: dff.id, toInput: 1 }
      ];
      
      // 初期状態
      let result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(false); // Q
      expect(result[`${dff.id}_out1`]).toBe(true); // Q'
      
      // D=1, CLK=0（変化なし）
      gates[0].value = true;
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(false); // Q - 変化なし
      expect(result[`${dff.id}_out1`]).toBe(true); // Q'
      
      // D=1, CLK=1（立ち上がりエッジ）
      gates[1].value = true;
      // メモリの更新のためにシミュレーションを再実行
      gates.forEach(gate => {
        if (gate.memory && gate.id === dff.id) {
          gate.memory.prevCLK = false; // 前回のクロック状態
        }
      });
      result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(true); // Q - Dの値をラッチ
      expect(result[`${dff.id}_out1`]).toBe(false); // Q'
      
      // D=0, CLK=1（Highのまま、変化なし）
      gates[0].value = false;
      gates.forEach(gate => {
        if (gate.memory && gate.id === dff.id) {
          gate.memory.prevCLK = true; // 前回のクロック状態
        }
      });
      result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(true); // Q - 変化なし
      expect(result[`${dff.id}_out1`]).toBe(false); // Q'
      
      // D=0, CLK=0（立ち下がりエッジ、変化なし）
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(true); // Q - 変化なし
      expect(result[`${dff.id}_out1`]).toBe(false); // Q'
      
      // D=0, CLK=1（再度立ち上がりエッジ）
      gates[1].value = true;
      gates.forEach(gate => {
        if (gate.memory && gate.id === dff.id) {
          gate.memory.prevCLK = false; // 前回のクロック状態
        }
      });
      result = calculateCircuit(gates, connections);
      expect(result[dff.id]).toBe(false); // Q - Dの値をラッチ
      expect(result[`${dff.id}_out1`]).toBe(true); // Q'
    });
  });

  describe('CLOCK Gate', () => {
    it('CLOCKゲートが正しく動作する', () => {
      const gates = [
        { id: 'clk1', type: 'CLOCK', value: true }
      ];
      
      const connections = [];
      
      // クロック信号のテスト
      let result = calculateCircuit(gates, connections);
      expect(result.clk1).toBe(true);
      
      gates[0].value = false;
      result = calculateCircuit(gates, connections);
      expect(result.clk1).toBe(false);
    });
  });
});