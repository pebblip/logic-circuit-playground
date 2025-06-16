/**
 * 順序回路の詳細デバッグテスト
 * 評価プロセスの内部動作を詳しく調査
 */

import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { defaultConfig } from '../../../src/domain/simulation/core/types';
import type { Gate, Wire, Circuit } from '../../../src/types/circuit';

describe('順序回路の詳細デバッグテスト', () => {
  describe('D-FFゲートの内部状態変化', () => {
    test('D-FFゲートのメタデータ変化を追跡', () => {
      const gates: Gate[] = [
        {
          id: 'input-d',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          size: { width: 60, height: 40 },
          output: true,
          inputs: []
        },
        {
          id: 'input-clk',
          type: 'INPUT',
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false, // 初期状態：CLK = 0
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
            qOutput: false,
            qBarOutput: true,
            previousClockState: false
          }
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-d-to-dff',
          from: { gateId: 'input-d', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 0 },
          isActive: true
        },
        {
          id: 'wire-clk-to-dff',
          from: { gateId: 'input-clk', pinIndex: 0 },
          to: { gateId: 'dff-1', pinIndex: 1 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };

      // デバッグ有効で評価
      const debugConfig = {
        ...defaultConfig,
        enableDebug: true
      };

      console.log('=== 初期状態の評価 ===');
      const result1 = evaluateCircuit(circuit, debugConfig);
      expect(result1.success).toBe(true);

      if (result1.success) {
        const dffGate = result1.data.circuit.gates.find(g => g.id === 'dff-1');
        console.log('D-FF初期状態:', {
          output: dffGate?.output,
          metadata: dffGate?.metadata
        });

        expect(dffGate?.output).toBe(false);
        expect(dffGate?.metadata?.qOutput).toBe(false);
        expect(dffGate?.metadata?.previousClockState).toBe(false);

        // デバッグトレースの確認
        if (result1.data.debugTrace) {
          console.log('デバッグトレース:');
          result1.data.debugTrace.forEach(entry => {
            if (entry.gateId === 'dff-1') {
              console.log(`  ${entry.action}:`, entry.data);
            }
          });
        }
      }

      // CLKを立ち上げる
      console.log('\n=== クロック立ち上がりエッジ ===');
      const updatedGates = gates.map(g => 
        g.id === 'input-clk' ? { ...g, output: true } : g
      );
      const updatedCircuit: Circuit = {
        gates: updatedGates,
        wires
      };

      const result2 = evaluateCircuit(updatedCircuit, debugConfig);
      expect(result2.success).toBe(true);

      if (result2.success) {
        const dffGate = result2.data.circuit.gates.find(g => g.id === 'dff-1');
        console.log('D-FF立ち上がりエッジ後:', {
          output: dffGate?.output,
          metadata: dffGate?.metadata
        });

        expect(dffGate?.output).toBe(true); // D入力がラッチされる
        expect(dffGate?.metadata?.qOutput).toBe(true);
        expect(dffGate?.metadata?.previousClockState).toBe(true);

        // 評価統計の確認
        console.log('評価統計:', {
          totalGates: result2.data.evaluationStats.totalGates,
          evaluatedGates: result2.data.evaluationStats.evaluatedGates,
          evaluationTimeMs: result2.data.evaluationStats.evaluationTimeMs
        });
      }
    });
  });

  describe('循環依存の検出メカニズム', () => {
    test('依存関係グラフの構築と循環検出', () => {
      // 意図的に循環参照を作成
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
        },
        {
          id: 'input-1',
          type: 'INPUT',
          position: { x: -100, y: 0 },
          size: { width: 60, height: 40 },
          output: true,
          inputs: []
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire-input-to-a',
          from: { gateId: 'input-1', pinIndex: 0 },
          to: { gateId: 'gate-a', pinIndex: 1 },
          isActive: true
        },
        {
          id: 'wire-a-to-b',
          from: { gateId: 'gate-a', pinIndex: 0 },
          to: { gateId: 'gate-b', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire-b-to-a', // 循環参照
          from: { gateId: 'gate-b', pinIndex: 0 },
          to: { gateId: 'gate-a', pinIndex: 0 },
          isActive: false
        }
      ];

      const circuit: Circuit = { gates, wires };

      console.log('\n=== 循環依存のある回路の評価 ===');
      const result = evaluateCircuit(circuit, { ...defaultConfig, enableDebug: true });
      
      console.log('評価結果:', result.success ? 'SUCCESS' : 'FAILURE');
      
      if (!result.success) {
        console.log('エラー詳細:', {
          type: result.error.type,
          message: result.error.message,
          context: result.error.context
        });

        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('無限ループ');
      }
    });
  });

  describe('SR-LATCHゲートの状態管理', () => {
    test('SR-LATCHの状態変化と保持', () => {
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
          position: { x: 0, y: 60 },
          size: { width: 60, height: 40 },
          output: false,
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
            qOutput: false,
            qBarOutput: true
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

      console.log('\n=== SR-LATCH状態変化テスト ===');

      // 1. 初期状態 (S=0, R=0)
      console.log('1. 初期状態 (S=0, R=0)');
      const result1 = evaluateCircuit(circuit, { ...defaultConfig, enableDebug: true });
      expect(result1.success).toBe(true);

      if (result1.success) {
        const latchGate = result1.data.circuit.gates.find(g => g.id === 'sr-latch');
        console.log('  状態:', {
          output: latchGate?.output,
          qOutput: latchGate?.metadata?.qOutput,
          qBarOutput: latchGate?.metadata?.qBarOutput
        });
      }

      // 2. Set状態 (S=1, R=0)
      console.log('2. Set状態 (S=1, R=0)');
      const setGates = gates.map(g => 
        g.id === 'input-s' ? { ...g, output: true } : g
      );
      const setCircuit: Circuit = { gates: setGates, wires };
      
      const result2 = evaluateCircuit(setCircuit, { ...defaultConfig, enableDebug: true });
      expect(result2.success).toBe(true);

      if (result2.success) {
        const latchGate = result2.data.circuit.gates.find(g => g.id === 'sr-latch');
        console.log('  状態:', {
          output: latchGate?.output,
          qOutput: latchGate?.metadata?.qOutput,
          qBarOutput: latchGate?.metadata?.qBarOutput
        });
        expect(latchGate?.output).toBe(true);
        expect(latchGate?.metadata?.qOutput).toBe(true);
      }

      // 3. 状態保持 (S=0, R=0) - 前回の状態を引き継ぐ
      console.log('3. 状態保持 (S=0, R=0) - 前回の状態を引き継ぐ');
      const holdGates = gates.map(g => ({ ...g })); // すべて0
      holdGates.find(g => g.id === 'sr-latch')!.metadata = {
        qOutput: true, // 前回の状態
        qBarOutput: false
      };
      const holdCircuit: Circuit = { gates: holdGates, wires };
      
      const result3 = evaluateCircuit(holdCircuit, { ...defaultConfig, enableDebug: true });
      expect(result3.success).toBe(true);

      if (result3.success) {
        const latchGate = result3.data.circuit.gates.find(g => g.id === 'sr-latch');
        console.log('  状態:', {
          output: latchGate?.output,
          qOutput: latchGate?.metadata?.qOutput,
          qBarOutput: latchGate?.metadata?.qBarOutput
        });
        expect(latchGate?.output).toBe(true); // 状態保持
      }
    });
  });

  describe('評価順序とパフォーマンス', () => {
    test('複雑な回路の評価順序', () => {
      // 多段階の組み合わせ回路
      const gates: Gate[] = [
        { id: 'input-1', type: 'INPUT', position: { x: 0, y: 0 }, size: { width: 60, height: 40 }, output: true, inputs: [] },
        { id: 'input-2', type: 'INPUT', position: { x: 0, y: 60 }, size: { width: 60, height: 40 }, output: false, inputs: [] },
        { id: 'and-1', type: 'AND', position: { x: 100, y: 30 }, size: { width: 60, height: 40 }, output: false, inputs: ['', ''] },
        { id: 'not-1', type: 'NOT', position: { x: 200, y: 30 }, size: { width: 60, height: 40 }, output: false, inputs: [''] },
        { id: 'or-1', type: 'OR', position: { x: 300, y: 30 }, size: { width: 60, height: 40 }, output: false, inputs: ['', ''] },
        { id: 'output-1', type: 'OUTPUT', position: { x: 400, y: 30 }, size: { width: 60, height: 40 }, output: false, inputs: [''] }
      ];

      const wires: Wire[] = [
        { id: 'w1', from: { gateId: 'input-1', pinIndex: 0 }, to: { gateId: 'and-1', pinIndex: 0 }, isActive: true },
        { id: 'w2', from: { gateId: 'input-2', pinIndex: 0 }, to: { gateId: 'and-1', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'and-1', pinIndex: 0 }, to: { gateId: 'not-1', pinIndex: 0 }, isActive: false },
        { id: 'w4', from: { gateId: 'not-1', pinIndex: 0 }, to: { gateId: 'or-1', pinIndex: 0 }, isActive: false },
        { id: 'w5', from: { gateId: 'input-1', pinIndex: 0 }, to: { gateId: 'or-1', pinIndex: 1 }, isActive: true },
        { id: 'w6', from: { gateId: 'or-1', pinIndex: 0 }, to: { gateId: 'output-1', pinIndex: 0 }, isActive: false }
      ];

      const circuit: Circuit = { gates, wires };

      console.log('\n=== 複雑な回路の評価順序 ===');
      const result = evaluateCircuit(circuit, { ...defaultConfig, enableDebug: true });
      
      expect(result.success).toBe(true);

      if (result.success) {
        console.log('依存関係グラフ:');
        console.log('  評価順序:', result.data.dependencyGraph.evaluationOrder);
        console.log('  ノード数:', result.data.dependencyGraph.nodes.size);
        console.log('  エッジ数:', result.data.dependencyGraph.edges.length);
        console.log('  循環検出:', result.data.dependencyGraph.hasCycles);

        console.log('評価統計:');
        console.log('  総ゲート数:', result.data.evaluationStats.totalGates);
        console.log('  評価時間:', result.data.evaluationStats.evaluationTimeMs, 'ms');
        console.log('  依存関係解決時間:', result.data.evaluationStats.dependencyResolutionTimeMs, 'ms');

        // 最終的な出力結果
        const outputGate = result.data.circuit.gates.find(g => g.id === 'output-1');
        console.log('最終出力:', outputGate?.output);
        
        // 論理的に正しい結果を検証: (input-1 AND input-2) を NOT した結果 OR input-1
        // input-1=true, input-2=false なので
        // (true AND false) = false
        // NOT false = true
        // true OR true = true
        expect(outputGate?.output).toBe(true);
      }
    });
  });
});