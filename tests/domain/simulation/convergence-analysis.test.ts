/**
 * 順序回路の収束性分析テスト
 * フィードバックループを含む回路が安定状態に収束するかテスト
 */

import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { defaultConfig } from '../../../src/domain/simulation/core/types';
import type { Gate, Wire, Circuit } from '../../../src/types/circuit';

describe('順序回路の収束性分析', () => {
  describe('理論的フィードバック回路のシミュレーション', () => {
    test('SR-LATCHを手動でNORゲートで構築（循環依存なしバージョン）', () => {
      // 実際のSR-LATCHを作成し、NORゲートの相互接続を回避するテスト
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
          position: { x: 0, y: 100 },
          size: { width: 60, height: 40 },
          output: false, // R = 0
          inputs: []
        },
        {
          id: 'sr-latch-builtin',
          type: 'SR-LATCH',
          position: { x: 120, y: 50 },
          size: { width: 80, height: 60 },
          output: false,
          inputs: ['', ''],
          metadata: {
            qOutput: false,
            qBarOutput: true
          }
        },
        {
          id: 'output-q',
          type: 'OUTPUT',
          position: { x: 240, y: 30 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        },
        {
          id: 'output-qbar',
          type: 'OUTPUT',
          position: { x: 240, y: 70 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-s-to-latch',
          from: { gateId: 'input-s', pinIndex: 0 },
          to: { gateId: 'sr-latch-builtin', pinIndex: 0 },
          isActive: true
        },
        {
          id: 'wire-r-to-latch',
          from: { gateId: 'input-r', pinIndex: 0 },
          to: { gateId: 'sr-latch-builtin', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire-latch-to-q',
          from: { gateId: 'sr-latch-builtin', pinIndex: 0 },
          to: { gateId: 'output-q', pinIndex: 0 },
          isActive: false
        },
        // SR-LATCHのQ-bar出力（実装上、負の出力ピンで表現されるかもしれない）
        {
          id: 'wire-latch-to-qbar',
          from: { gateId: 'sr-latch-builtin', pinIndex: -1 }, // Q-bar出力
          to: { gateId: 'output-qbar', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };

      console.log('\n=== 組み込みSR-LATCHテスト ===');
      const result = evaluateCircuit(circuit, { ...defaultConfig, enableDebug: true });
      
      console.log('評価結果:', result.success);
      
      if (result.success) {
        const latch = result.data.circuit.gates.find(g => g.id === 'sr-latch-builtin');
        const outputQ = result.data.circuit.gates.find(g => g.id === 'output-q');
        const outputQBar = result.data.circuit.gates.find(g => g.id === 'output-qbar');
        
        console.log('SR-LATCH状態:', {
          output: latch?.output,
          qOutput: latch?.metadata?.qOutput,
          qBarOutput: latch?.metadata?.qBarOutput
        });
        
        console.log('出力状態:', {
          Q: outputQ?.output,
          QBar: outputQBar?.output
        });

        // S=1, R=0の場合、Q=1, Q-bar=0になるはず
        expect(latch?.output).toBe(true);
        expect(latch?.metadata?.qOutput).toBe(true);
        expect(latch?.metadata?.qBarOutput).toBe(false);
      } else {
        console.log('エラー:', result.error);
      }
    });

    test('複数のD-FFを連鎖した回路', () => {
      // D-FFを複数個連鎖して、シフトレジスタのような動作をテスト
      const gates: Gate[] = [
        {
          id: 'input-d',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: true, // 初期データ
          inputs: []
        },
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 0, y: 80 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: [],
          metadata: {
            isRunning: true,
            frequency: 1, // 1Hz
            startTime: Date.now()
          }
        },
        {
          id: 'dff-1',
          type: 'D-FF',
          position: { x: 120, y: 40 },
          size: { width: 80, height: 60 },
          output: false,
          inputs: ['', ''],
          metadata: {
            qOutput: false,
            qBarOutput: true,
            previousClockState: false
          }
        },
        {
          id: 'dff-2',
          type: 'D-FF',
          position: { x: 240, y: 40 },
          size: { width: 80, height: 60 },
          output: false,
          inputs: ['', ''],
          metadata: {
            qOutput: false,
            qBarOutput: true,
            previousClockState: false
          }
        },
        {
          id: 'output-1',
          type: 'OUTPUT',
          position: { x: 360, y: 20 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        },
        {
          id: 'output-2',
          type: 'OUTPUT',
          position: { x: 360, y: 60 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        }
      ];

      const wires: Wire[] = [
        // 入力データからDFF-1へ
        {
          id: 'wire-d-to-dff1',
          from: { gateId: 'input-d', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 0 },
          isActive: true
        },
        // クロックをDFF-1へ
        {
          id: 'wire-clk-to-dff1',
          from: { gateId: 'clock', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 1 },
          isActive: false
        },
        // DFF-1の出力からDFF-2へ（シフト）
        {
          id: 'wire-dff1-to-dff2',
          from: { gateId: 'dff-1', pinIndex: 0 },
          to: { gateId: 'dff-2', pinIndex: 0 },
          isActive: false
        },
        // クロックをDFF-2へ
        {
          id: 'wire-clk-to-dff2',
          from: { gateId: 'clock', pinIndex: 0 },
          to: { gateId: 'dff-2', pinIndex: 1 },
          isActive: false
        },
        // 出力
        {
          id: 'wire-dff1-to-out1',
          from: { gateId: 'dff-1', pinIndex: 0 },
          to: { gateId: 'output-1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire-dff2-to-out2',
          from: { gateId: 'dff-2', pinIndex: 0 },
          to: { gateId: 'output-2', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };

      console.log('\n=== D-FFシフトレジスタテスト ===');
      
      // 固定時間でテスト（CLOCKの実際の動作をシミュレート）
      const fixedTimeConfig = {
        ...defaultConfig,
        timeProvider: {
          getCurrentTime: () => 0 // 時間0では出力はfalse
        },
        enableDebug: true
      };

      const result1 = evaluateCircuit(circuit, fixedTimeConfig);
      expect(result1.success).toBe(true);

      if (result1.success) {
        const clockGate = result1.data.circuit.gates.find(g => g.id === 'clock');
        const dff1 = result1.data.circuit.gates.find(g => g.id === 'dff-1');
        const dff2 = result1.data.circuit.gates.find(g => g.id === 'dff-2');
        
        console.log('時間0での状態:');
        console.log('  CLOCK出力:', clockGate?.output);
        console.log('  DFF-1出力:', dff1?.output, 'meta:', dff1?.metadata?.qOutput);
        console.log('  DFF-2出力:', dff2?.output, 'meta:', dff2?.metadata?.qOutput);
      }

      // 時間を進めてクロックエッジを発生させる
      const timeAdvancedConfig = {
        ...defaultConfig,
        timeProvider: {
          getCurrentTime: () => 1500 // 1.5秒後（1Hz周期の1.5倍）
        },
        enableDebug: true
      };

      const result2 = evaluateCircuit(circuit, timeAdvancedConfig);
      expect(result2.success).toBe(true);

      if (result2.success) {
        const clockGate = result2.data.circuit.gates.find(g => g.id === 'clock');
        const dff1 = result2.data.circuit.gates.find(g => g.id === 'dff-1');
        const dff2 = result2.data.circuit.gates.find(g => g.id === 'dff-2');
        
        console.log('時間1500での状態:');
        console.log('  CLOCK出力:', clockGate?.output);
        console.log('  DFF-1出力:', dff1?.output, 'meta:', dff1?.metadata?.qOutput);
        console.log('  DFF-2出力:', dff2?.output, 'meta:', dff2?.metadata?.qOutput);
      }
    });

    test('現在の実装の限界確認 - NORゲートでの真のSR-Latch構築', () => {
      // 現在の実装では循環依存として検出されることを確認
      console.log('\n=== 真のフィードバックループ（NORゲート）テスト ===');
      console.log('これは現在の実装では循環依存として正しく検出されるはず');

      const gates: Gate[] = [
        {
          id: 'input-s',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: []
        },
        {
          id: 'input-r',
          type: 'INPUT',
          position: { x: 0, y: 100 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: []
        },
        {
          id: 'nor-q',
          type: 'NOR',
          position: { x: 120, y: 20 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        },
        {
          id: 'nor-qbar',
          type: 'NOR',
          position: { x: 120, y: 80 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        }
      ];

      const wires: Wire[] = [
        // S入力 → NOR-Q
        {
          id: 'wire-s-to-norq',
          from: { gateId: 'input-s', pinIndex: 0 },
          to: { gateId: 'nor-q', pinIndex: 0 },
          isActive: false
        },
        // R入力 → NOR-Qbar
        {
          id: 'wire-r-to-norqbar',
          from: { gateId: 'input-r', pinIndex: 0 },
          to: { gateId: 'nor-qbar', pinIndex: 0 },
          isActive: false
        },
        // クロスカップリング（フィードバック）
        {
          id: 'wire-norq-to-norqbar',
          from: { gateId: 'nor-q', pinIndex: 0 },
          to: { gateId: 'nor-qbar', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire-norqbar-to-norq',
          from: { gateId: 'nor-qbar', pinIndex: 0 },
          to: { gateId: 'nor-q', pinIndex: 1 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      console.log('評価結果:', result.success ? 'SUCCESS' : 'FAILURE');
      
      if (!result.success) {
        console.log('期待通りの循環依存エラー:', result.error.message);
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('無限ループ');
      } else {
        console.log('予期しない成功 - 循環依存が検出されていない');
        fail('循環依存が検出されるべき');
      }
    });
  });

  describe('現在の実装での収束性能', () => {
    test('1回の評価での安定性確認', () => {
      // 単純な組み合わせ回路で、1回の評価で安定状態に収束することを確認
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
          id: 'input-2',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: []
        },
        {
          id: 'and-gate',
          type: 'AND',
          position: { x: 120, y: 30 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['', '']
        },
        {
          id: 'not-gate',
          type: 'NOT',
          position: { x: 240, y: 30 },
          size: { width: 60, height: 40 },
          output: false,
          inputs: ['']
        }
      ];

      const wires: Wire[] = [
        {
          id: 'w1',
          from: { gateId: 'input-1', pinIndex: 0 },
          to: { gateId: 'and-gate', pinIndex: 0 },
          isActive: true
        },
        {
          id: 'w2',
          from: { gateId: 'input-2', pinIndex: 0 },
          to: { gateId: 'and-gate', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'w3',
          from: { gateId: 'and-gate', pinIndex: 0 },
          to: { gateId: 'not-gate', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };

      console.log('\n=== 組み合わせ回路の安定性テスト ===');
      const result = evaluateCircuit(circuit, { ...defaultConfig, enableDebug: true });
      
      expect(result.success).toBe(true);

      if (result.success) {
        const andGate = result.data.circuit.gates.find(g => g.id === 'and-gate');
        const notGate = result.data.circuit.gates.find(g => g.id === 'not-gate');
        
        console.log('最終状態:');
        console.log('  AND出力:', andGate?.output); // true AND false = false
        console.log('  NOT出力:', notGate?.output); // NOT false = true
        
        expect(andGate?.output).toBe(false);
        expect(notGate?.output).toBe(true);

        console.log('評価統計:');
        console.log('  評価時間:', result.data.evaluationStats.evaluationTimeMs, 'ms');
        console.log('  評価順序:', result.data.dependencyGraph.evaluationOrder);
      }
    });
  });
});