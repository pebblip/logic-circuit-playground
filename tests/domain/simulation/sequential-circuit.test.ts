/**
 * 順序回路（フィードバックループを持つ回路）のテストケース
 * 
 * 調査対象：
 * 1. D-FFゲートの評価方法（metadata.stateの扱い）
 * 2. フィードバックループの循環参照処理方法  
 * 3. NORゲート間の相互接続処理方法
 * 4. 順序回路での安定状態の収束処理
 */

import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { defaultConfig } from '../../../src/domain/simulation/core/types';
import type { Gate, Wire, Circuit } from '../../../src/types/circuit';

describe('順序回路の評価テスト', () => {
  describe('D-フリップフロップ（D-FF）のテスト', () => {
    test('D-FFゲートの基本動作（立ち上がりエッジトリガー）', () => {
      // D-FFゲートの基本テスト
      const gates: Gate[] = [
        {
          id: 'input-d',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: true, // D入力 = 1
          inputs: []
        },
        {
          id: 'input-clk',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false, // CLK入力 = 0（初期状態）
          inputs: []
        },
        {
          id: 'dff-1',
          type: 'D-FF',
          position: { x: 120, y: 30 },
          size: { width: 80, height: 60 },
          output: false,
          inputs: ['', ''],
          metadata: {
            qOutput: false, // 初期状態
            qBarOutput: true,
            previousClockState: false
          }
        },
        {
          id: 'output-q',
          type: 'OUTPUT',
          position: { x: 240, y: 30 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-d-to-dff',
          from: { gateId: 'input-d', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 0 }, // D入力
          isActive: true
        },
        {
          id: 'wire-clk-to-dff',
          from: { gateId: 'input-clk', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 1 }, // CLK入力
          isActive: false
        },
        {
          id: 'wire-dff-to-output',
          from: { gateId: 'dff-1', pinIndex: 0 },
          to: { gateId: 'output-q', pinIndex: 0 }, // Q出力
          isActive: false
        }
      ];

      const circuit: Circuit = {
        gates,
        wires
      };

      // 1. 初期状態での評価（CLK=0のまま）
      const result1 = evaluateCircuit(circuit, defaultConfig);
      expect(result1.success).toBe(true);
      
      if (result1.success) {
        const dffGate = result1.data.circuit.gates.find(g => g.id === 'dff-1');
        expect(dffGate?.output).toBe(false); // 初期状態のまま
        expect(dffGate?.metadata?.qOutput).toBe(false);
      }

      // 2. CLKを1に変更（立ち上がりエッジ）
      const updatedGates = gates.map(g => 
        g.id === 'input-clk' ? { ...g, output: true } : g
      );
      const updatedCircuit: Circuit = {
        gates: updatedGates,
        wires
      };

      const result2 = evaluateCircuit(updatedCircuit, defaultConfig);
      expect(result2.success).toBe(true);
      
      if (result2.success) {
        const dffGate = result2.data.circuit.gates.find(g => g.id === 'dff-1');
        expect(dffGate?.output).toBe(true); // D入力(1)がクロックアップで取り込まれる
        expect(dffGate?.metadata?.qOutput).toBe(true);
        expect(dffGate?.metadata?.previousClockState).toBe(true);
      }
    });

    test('D-FFゲートの状態保持（CLK=1のまま）', () => {
      // D-FFが一度トリガーされた後、CLK=1のままでD入力が変わっても出力は変わらない
      const gates: Gate[] = [
        {
          id: 'input-d',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: false, // D入力 = 0に変更
          inputs: []
        },
        {
          id: 'input-clk',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: true, // CLK入力 = 1のまま
          inputs: []
        },
        {
          id: 'dff-1',
          type: 'D-FF',
          position: { x: 120, y: 30 },
          size: { width: 80, height: 60 },
          output: true,
          inputs: ['', ''],
          metadata: {
            qOutput: true, // 前回の状態を保持
            qBarOutput: false,
            previousClockState: true // 前回のクロック状態
          }
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-d-to-dff',
          from: { gateId: 'input-d', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire-clk-to-dff',
          from: { gateId: 'input-clk', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 1 },
          isActive: true
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const dffGate = result.data.circuit.gates.find(g => g.id === 'dff-1');
        expect(dffGate?.output).toBe(true); // 状態保持
        expect(dffGate?.metadata?.qOutput).toBe(true);
      }
    });
  });

  describe('フィードバックループの循環参照テスト', () => {
    test('NORゲート間の相互接続（RS-Latch）', () => {
      // SR-Latchの基本構成（NORゲート2つのクロスカップリング）
      const gates: Gate[] = [
        {
          id: 'input-s',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: false, // S入力 = 0
          inputs: []
        },
        {
          id: 'input-r',
          type: 'INPUT',
          position: { x: 0, y: 100 },
          size: { width: 60, height: 40 },
          output: false, // R入力 = 0
          inputs: []
        },
        {
          id: 'nor-1',
          type: 'NOR',
          position: { x: 120, y: 20 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        },
        {
          id: 'nor-2',
          type: 'NOR',
          position: { x: 120, y: 80 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        }
      ];

      const wires: Wire[] = [
        // S入力からNOR1へ
        {
          id: 'wire-s-to-nor1',
          from: { gateId: 'input-s', pinIndex: 0 },
          to: { gateId: 'nor-1', pinIndex: 0 },
          isActive: false
        },
        // R入力からNOR2へ
        {
          id: 'wire-r-to-nor2',
          from: { gateId: 'input-r', pinIndex: 0 },
          to: { gateId: 'nor-2', pinIndex: 0 },
          isActive: false
        },
        // フィードバック：NOR1の出力 → NOR2の入力
        {
          id: 'wire-nor1-to-nor2',
          from: { gateId: 'nor-1', pinIndex: 0 },
          to: { gateId: 'nor-2', pinIndex: 1 },
          isActive: false
        },
        // フィードバック：NOR2の出力 → NOR1の入力
        {
          id: 'wire-nor2-to-nor1',
          from: { gateId: 'nor-2', pinIndex: 0 },
          to: { gateId: 'nor-1', pinIndex: 1 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      
      // 循環依存を含む回路の評価
      const result = evaluateCircuit(circuit, defaultConfig);
      
      // 現在の実装では循環依存を検出してエラーを返すはず
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('無限ループ');
      }
    });

    test('循環依存の検出テスト', () => {
      // 単純な循環参照を作成
      const gates: Gate[] = [
        {
          id: 'gate-a',
          type: 'AND',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        },
        {
          id: 'gate-b',
          type: 'AND',
          position: { x: 100, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        }
      ];

      const wires: Wire[] = [
        // A → B
        {
          id: 'wire-a-to-b',
          from: { gateId: 'gate-a', pinIndex: 0 },
          to: { gateId: 'gate-b', pinIndex: 0 },
          isActive: false
        },
        // B → A（循環）
        {
          id: 'wire-b-to-a',
          from: { gateId: 'gate-b', pinIndex: 0 },
          to: { gateId: 'gate-a', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('無限ループ');
      }
    });
  });

  describe('SR-LATCHゲートの専用実装テスト', () => {
    test('SR-LATCH基本動作（Set動作）', () => {
      const gates: Gate[] = [
        {
          id: 'input-s',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: true, // S = 1
          inputs: []
        },
        {
          id: 'input-r',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false, // R = 0
          inputs: []
        },
        {
          id: 'sr-latch',
          type: 'SR-LATCH',
          position: { x: 120, y: 30 },
          size: { width: 80, height: 60 },
          output: false,
          inputs: ['', ''],
          metadata: {
            qOutput: false, // 初期状態
            qBarOutput: true
          }
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-s-to-latch',
          from: { gateId: 'input-s', pinIndex: 0 },
          to: { gateId: 'sr-latch', pinIndex: 0 },
          isActive: true
        },
        {
          id: 'wire-r-to-latch',
          from: { gateId: 'input-r', pinIndex: 0 },
          to: { gateId: 'sr-latch', pinIndex: 1 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const latchGate = result.data.circuit.gates.find(g => g.id === 'sr-latch');
        expect(latchGate?.output).toBe(true); // S=1, R=0 → Q=1
        expect(latchGate?.metadata?.qOutput).toBe(true);
        expect(latchGate?.metadata?.qBarOutput).toBe(false);
      }
    });

    test('SR-LATCH状態保持（S=0, R=0）', () => {
      const gates: Gate[] = [
        {
          id: 'input-s',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: false, // S = 0
          inputs: []
        },
        {
          id: 'input-r',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false, // R = 0
          inputs: []
        },
        {
          id: 'sr-latch',
          type: 'SR-LATCH',
          position: { x: 120, y: 30 },
          size: { width: 80, height: 60 },
          output: true,
          inputs: ['', ''],
          metadata: {
            qOutput: true, // 前回の状態を保持
            qBarOutput: false
          }
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-s-to-latch',
          from: { gateId: 'input-s', pinIndex: 0 },
          to: { gateId: 'sr-latch', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire-r-to-latch',
          from: { gateId: 'input-r', pinIndex: 0 },
          to: { gateId: 'sr-latch', pinIndex: 1 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const latchGate = result.data.circuit.gates.find(g => g.id === 'sr-latch');
        expect(latchGate?.output).toBe(true); // 状態保持
        expect(latchGate?.metadata?.qOutput).toBe(true);
      }
    });
  });

  describe('安定状態収束テスト', () => {
    test('多段階回路の安定状態', () => {
      // 複数のゲートを経由する回路での安定状態の確認
      const gates: Gate[] = [
        {
          id: 'input-1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: true,
          inputs: []
        },
        {
          id: 'not-1',
          type: 'NOT',
          position: { x: 100, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        },
        {
          id: 'not-2',
          type: 'NOT',
          position: { x: 200, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        },
        {
          id: 'not-3',
          type: 'NOT',
          position: { x: 300, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-1-to-not1',
          from: { gateId: 'input-1', pinIndex: 0 },
          to: { gateId: 'not-1', pinIndex: 0 },
          isActive: true
        },
        {
          id: 'wire-not1-to-not2',
          from: { gateId: 'not-1', pinIndex: 0 },
          to: { gateId: 'not-2', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire-not2-to-not3',
          from: { gateId: 'not-2', pinIndex: 0 },
          to: { gateId: 'not-3', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const not1 = result.data.circuit.gates.find(g => g.id === 'not-1');
        const not2 = result.data.circuit.gates.find(g => g.id === 'not-2');
        const not3 = result.data.circuit.gates.find(g => g.id === 'not-3');
        
        expect(not1?.output).toBe(false); // !true = false
        expect(not2?.output).toBe(true);  // !false = true
        expect(not3?.output).toBe(false); // !true = false
      }
    });
  });
});