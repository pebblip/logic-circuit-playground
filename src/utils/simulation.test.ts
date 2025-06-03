// 論理回路シミュレーションの単体テスト
// 最重要機能の確実な品質保証

import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateGate, evaluateCircuit } from './simulation';
import { Gate, Wire, GateType } from '../types/circuit';

describe('Logic Gate Evaluation', () => {
  describe('Basic Logic Gates', () => {
    it('AND gate should work correctly', () => {
      const gate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      expect(evaluateGate(gate, [false, false])).toBe(false);
      expect(evaluateGate(gate, [false, true])).toBe(false);
      expect(evaluateGate(gate, [true, false])).toBe(false);
      expect(evaluateGate(gate, [true, true])).toBe(true);
    });

    it('OR gate should work correctly', () => {
      const gate: Gate = {
        id: 'or1',
        type: 'OR',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      expect(evaluateGate(gate, [false, false])).toBe(false);
      expect(evaluateGate(gate, [false, true])).toBe(true);
      expect(evaluateGate(gate, [true, false])).toBe(true);
      expect(evaluateGate(gate, [true, true])).toBe(true);
    });

    it('NOT gate should work correctly', () => {
      const gate: Gate = {
        id: 'not1',
        type: 'NOT',
        position: { x: 0, y: 0 },
        inputs: [''],
        output: false
      };

      expect(evaluateGate(gate, [false])).toBe(true);
      expect(evaluateGate(gate, [true])).toBe(false);
    });

    it('XOR gate should work correctly', () => {
      const gate: Gate = {
        id: 'xor1',
        type: 'XOR',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      expect(evaluateGate(gate, [false, false])).toBe(false);
      expect(evaluateGate(gate, [false, true])).toBe(true);
      expect(evaluateGate(gate, [true, false])).toBe(true);
      expect(evaluateGate(gate, [true, true])).toBe(false);
    });

    it('NAND gate should work correctly', () => {
      const gate: Gate = {
        id: 'nand1',
        type: 'NAND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      expect(evaluateGate(gate, [false, false])).toBe(true);
      expect(evaluateGate(gate, [false, true])).toBe(true);
      expect(evaluateGate(gate, [true, false])).toBe(true);
      expect(evaluateGate(gate, [true, true])).toBe(false);
    });

    it('NOR gate should work correctly', () => {
      const gate: Gate = {
        id: 'nor1',
        type: 'NOR',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      expect(evaluateGate(gate, [false, false])).toBe(true);
      expect(evaluateGate(gate, [false, true])).toBe(false);
      expect(evaluateGate(gate, [true, false])).toBe(false);
      expect(evaluateGate(gate, [true, true])).toBe(false);
    });
  });

  describe('Special Gates', () => {
    it('INPUT gate should return its output value', () => {
      const gate: Gate = {
        id: 'input1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        output: true
      };

      expect(evaluateGate(gate, [])).toBe(true);

      gate.output = false;
      expect(evaluateGate(gate, [])).toBe(false);
    });

    it('OUTPUT gate should return first input', () => {
      const gate: Gate = {
        id: 'output1',
        type: 'OUTPUT',
        position: { x: 0, y: 0 },
        inputs: [''],
        output: false
      };

      expect(evaluateGate(gate, [true])).toBe(true);
      expect(evaluateGate(gate, [false])).toBe(false);
      expect(evaluateGate(gate, [])).toBe(false); // No input defaults to false
    });

    it('MUX gate should select correct input', () => {
      const gate: Gate = {
        id: 'mux1',
        type: 'MUX',
        position: { x: 0, y: 0 },
        inputs: ['', '', ''],
        output: false
      };

      // Select = false => output I0
      expect(evaluateGate(gate, [true, false, false])).toBe(true);
      expect(evaluateGate(gate, [false, true, false])).toBe(false);
      
      // Select = true => output I1
      expect(evaluateGate(gate, [true, false, true])).toBe(false);
      expect(evaluateGate(gate, [false, true, true])).toBe(true);
    });

    it('D-FF should capture D on clock edge', () => {
      const gate: Gate = {
        id: 'dff1',
        type: 'D-FF',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false,
        metadata: { qOutput: false, qBarOutput: true, previousClockState: false }
      };

      // No clock edge - should maintain state
      expect(evaluateGate(gate, [true, false])).toBe(false);
      
      // Rising edge with D=true
      expect(evaluateGate(gate, [true, true])).toBe(true);
      expect(gate.metadata?.qOutput).toBe(true);
      
      // Maintain high clock - D changes shouldn't affect output
      expect(evaluateGate(gate, [false, true])).toBe(true);
      
      // Falling edge - should maintain state
      gate.metadata!.previousClockState = true;
      expect(evaluateGate(gate, [false, false])).toBe(true);
    });

    it('SR-LATCH should set and reset correctly', () => {
      const gate: Gate = {
        id: 'sr1',
        type: 'SR-LATCH',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false,
        metadata: { qOutput: false, qBarOutput: true }
      };

      // Set (S=1, R=0)
      expect(evaluateGate(gate, [true, false])).toBe(true);
      expect(gate.metadata?.qOutput).toBe(true);
      
      // Hold (S=0, R=0)
      expect(evaluateGate(gate, [false, false])).toBe(true);
      
      // Reset (S=0, R=1)
      expect(evaluateGate(gate, [false, true])).toBe(false);
      expect(gate.metadata?.qOutput).toBe(false);
    });

    it('SR-LATCH should handle forbidden state (S=1, R=1) consistently', () => {
      const gate: Gate = {
        id: 'sr1',
        type: 'SR-LATCH',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false,
        metadata: { qOutput: false, qBarOutput: true }
      };

      // テストケース1: 初期状態（Q=0）から禁止状態に入る
      expect(gate.metadata?.qOutput).toBe(false);
      
      // 禁止状態 (S=1, R=1) - 現在の実装では前の状態を維持
      const result1 = evaluateGate(gate, [true, true]);
      expect(result1).toBe(false); // 前の状態（Q=0）を維持
      expect(gate.metadata?.qOutput).toBe(false);
      
      // テストケース2: Set状態（Q=1）から禁止状態に入る
      // まずSetにする
      evaluateGate(gate, [true, false]);
      expect(gate.metadata?.qOutput).toBe(true);
      
      // 禁止状態 (S=1, R=1) - 現在の実装では前の状態を維持
      const result2 = evaluateGate(gate, [true, true]);
      expect(result2).toBe(true); // 前の状態（Q=1）を維持
      expect(gate.metadata?.qOutput).toBe(true);
      
      // テストケース3: 禁止状態から脱出後の動作確認
      // 禁止状態から Hold状態 (S=0, R=0) に移行
      const result3 = evaluateGate(gate, [false, false]);
      expect(result3).toBe(true); // 状態維持
      expect(gate.metadata?.qOutput).toBe(true);
      
      // その後のReset動作が正常に機能することを確認
      const result4 = evaluateGate(gate, [false, true]);
      expect(result4).toBe(false);
      expect(gate.metadata?.qOutput).toBe(false);

      // テストケース4: 連続した禁止状態の一貫性
      // Reset状態にしてから連続で禁止状態を適用
      evaluateGate(gate, [false, true]); // Reset
      expect(gate.metadata?.qOutput).toBe(false);
      
      // 複数回禁止状態を適用しても一貫して前の状態を維持
      for (let i = 0; i < 3; i++) {
        const result = evaluateGate(gate, [true, true]);
        expect(result).toBe(false);
        expect(gate.metadata?.qOutput).toBe(false);
      }
    });

    it('SR-LATCH forbidden state should preserve qBarOutput complement relationship', () => {
      const gate: Gate = {
        id: 'sr1',
        type: 'SR-LATCH',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false,
        metadata: { qOutput: false, qBarOutput: true }
      };

      // 初期状態確認: Q=false, Qbar=true
      expect(gate.metadata?.qOutput).toBe(false);
      expect(gate.metadata?.qBarOutput).toBe(true);

      // 禁止状態に入る
      evaluateGate(gate, [true, true]);
      
      // 禁止状態でも Q と Qbar の相補関係は維持されるべき（現在の実装確認）
      expect(gate.metadata?.qOutput).toBe(false);
      expect(gate.metadata?.qBarOutput).toBe(true);
      expect(gate.metadata?.qOutput).not.toBe(gate.metadata?.qBarOutput);

      // Set状態にしてから禁止状態を試す
      evaluateGate(gate, [true, false]); // Set
      expect(gate.metadata?.qOutput).toBe(true);
      expect(gate.metadata?.qBarOutput).toBe(false);

      // 再び禁止状態
      evaluateGate(gate, [true, true]);
      
      // この場合も相補関係が維持されることを確認
      expect(gate.metadata?.qOutput).toBe(true);
      expect(gate.metadata?.qBarOutput).toBe(false);
      expect(gate.metadata?.qOutput).not.toBe(gate.metadata?.qBarOutput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown gate types', () => {
      const gate: Gate = {
        id: 'unknown1',
        type: 'UNKNOWN' as GateType,
        position: { x: 0, y: 0 },
        inputs: [],
        output: false
      };

      expect(evaluateGate(gate, [])).toBe(false);
    });

    it('should handle missing inputs gracefully', () => {
      const andGate: Gate = {
        id: 'and1',
        type: 'AND',
        position: { x: 0, y: 0 },
        inputs: ['', ''],
        output: false
      };

      // Missing second input should be treated as false
      expect(evaluateGate(andGate, [true])).toBe(false);
    });
  });
});

describe('Circuit Evaluation', () => {
  it('should evaluate simple two-gate circuit', () => {
    const gates: Gate[] = [
      {
        id: 'input1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        output: true
      },
      {
        id: 'not1',
        type: 'NOT',
        position: { x: 100, y: 0 },
        inputs: [''],
        output: false
      }
    ];

    const wires: Wire[] = [
      {
        id: 'wire1',
        from: { gateId: 'input1', pinIndex: -1 },
        to: { gateId: 'not1', pinIndex: 0 },
        isActive: false
      }
    ];

    const result = evaluateCircuit(gates, wires);
    
    // NOT gate should output false (input was true)
    const notGate = result.gates.find(g => g.id === 'not1');
    expect(notGate?.output).toBe(false);
    expect(notGate?.inputs).toEqual(['1']);
    
    // Wire should be active (input was true)
    const wire = result.wires.find(w => w.id === 'wire1');
    expect(wire?.isActive).toBe(true);
  });

  it('should evaluate complex three-gate circuit (AND-OR)', () => {
    const gates: Gate[] = [
      {
        id: 'input1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        output: true
      },
      {
        id: 'input2',
        type: 'INPUT',
        position: { x: 0, y: 50 },
        inputs: [],
        output: false
      },
      {
        id: 'input3',
        type: 'INPUT',
        position: { x: 0, y: 100 },
        inputs: [],
        output: true
      },
      {
        id: 'and1',
        type: 'AND',
        position: { x: 100, y: 25 },
        inputs: ['', ''],
        output: false
      },
      {
        id: 'or1',
        type: 'OR',
        position: { x: 200, y: 50 },
        inputs: ['', ''],
        output: false
      }
    ];

    const wires: Wire[] = [
      {
        id: 'wire1',
        from: { gateId: 'input1', pinIndex: -1 },
        to: { gateId: 'and1', pinIndex: 0 },
        isActive: false
      },
      {
        id: 'wire2',
        from: { gateId: 'input2', pinIndex: -1 },
        to: { gateId: 'and1', pinIndex: 1 },
        isActive: false
      },
      {
        id: 'wire3',
        from: { gateId: 'and1', pinIndex: -1 },
        to: { gateId: 'or1', pinIndex: 0 },
        isActive: false
      },
      {
        id: 'wire4',
        from: { gateId: 'input3', pinIndex: -1 },
        to: { gateId: 'or1', pinIndex: 1 },
        isActive: false
      }
    ];

    const result = evaluateCircuit(gates, wires);
    
    // AND gate: true AND false = false
    const andGate = result.gates.find(g => g.id === 'and1');
    expect(andGate?.output).toBe(false);
    expect(andGate?.inputs).toEqual(['1', '']);
    
    // OR gate: false OR true = true
    const orGate = result.gates.find(g => g.id === 'or1');
    expect(orGate?.output).toBe(true);
    expect(orGate?.inputs).toEqual(['', '1']);
  });
});