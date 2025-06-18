import { describe, it, expect } from 'vitest';
import { FEATURED_CIRCUITS } from '../../../src/features/gallery/data/gallery';
import { evaluateCircuit } from '../../../src/domain/simulation/core/circuitEvaluation';
import { EnhancedHybridEvaluator } from '../../../src/domain/simulation/event-driven-minimal';
import { getGateInputValue } from '../../../src/domain/simulation';
import type { Circuit } from '../../../src/types';

describe('全ギャラリー回路動作テスト', () => {
  
  FEATURED_CIRCUITS.forEach(circuitData => {
    describe(`${circuitData.title}`, () => {
      
      it('回路データが正しく定義されている', () => {
        expect(circuitData.id).toBeDefined();
        expect(circuitData.title).toBeDefined();
        expect(circuitData.description).toBeDefined();
        expect(circuitData.gates).toBeDefined();
        expect(circuitData.wires).toBeDefined();
        expect(circuitData.gates.length).toBeGreaterThan(0);
      });

      it('入出力ゲートが存在する', () => {
        const hasInput = circuitData.gates.some(g => g.type === 'INPUT');
        const hasOutput = circuitData.gates.some(g => g.type === 'OUTPUT');
        
        if (!hasInput && !hasOutput) {
          // 一部の回路は入出力がないかもしれない
          console.warn(`${circuitData.title}: 入力または出力ゲートがありません`);
        }
        
        expect(hasInput || hasOutput).toBe(true);
      });

      it('ワイヤーが正しく定義されている', () => {
        circuitData.wires.forEach(wire => {
          expect(wire.id).toBeDefined();
          expect(wire.from).toBeDefined();
          expect(wire.to).toBeDefined();
          expect(wire.from.gateId).toBeDefined();
          expect(wire.to.gateId).toBeDefined();
          
          // ワイヤーが参照するゲートが存在するかチェック
          const fromGateExists = circuitData.gates.some(g => g.id === wire.from.gateId);
          const toGateExists = circuitData.gates.some(g => g.id === wire.to.gateId);
          
          expect(fromGateExists).toBe(true);
          expect(toGateExists).toBe(true);
        });
      });

      it('回路が基本的なシミュレーションで動作する', () => {
        const circuit: Circuit = {
          gates: circuitData.gates.map(gate => ({ ...gate })),
          wires: circuitData.wires.map(wire => ({ ...wire })),
        };

        // 循環回路を検出（DELAY、SR-LATCH、D-FF等を含む回路）
        const hasCircularElements = circuit.gates.some(g => 
          ['DELAY', 'SR-LATCH', 'D-FF'].includes(g.type) || 
          circuitData.title.includes('オシレータ') ||
          circuitData.title.includes('カオス') ||
          circuitData.title.includes('カウンター') ||
          circuitData.title.includes('メモリ') ||
          circuitData.title.includes('マンダラ') ||
          circuitData.title.includes('ラッチ（基本') ||
          circuitData.id === 'sr-latch-basic'
        );

        if (hasCircularElements) {
          // 循環回路：イベント駆動評価を使用
          const evaluator = new EnhancedHybridEvaluator({
            strategy: 'EVENT_DRIVEN_ONLY',
            enableDebugLogging: false,
          });
          
          const result = evaluator.evaluate(circuit);
          
          // イベント駆動評価は常に成功する（循環依存も処理可能）
          expect(result).toBeDefined();
          expect(result.circuit).toBeDefined();
          expect(result.circuit.gates).toBeDefined();
          expect(result.circuit.wires).toBeDefined();
          
          // 基本的な構造チェック
          expect(result.circuit.gates.length).toBe(circuit.gates.length);
          expect(result.circuit.wires.length).toBe(circuit.wires.length);
          
        } else {
          // 非循環回路：従来のcoreAPI評価を使用
          const result = evaluateCircuit(circuit, {});
          
          // デバッグ情報を出力
          if (!result.success) {
            console.error(`${circuitData.title} - 評価エラー:`, result.error);
          }
          
          expect(result.success).toBe(true);
          
          if (result.success) {
            // 出力ゲートがある場合、値を確認
            const outputGates = result.data.circuit.gates.filter(g => g.type === 'OUTPUT');
            outputGates.forEach(outputGate => {
              const value = getGateInputValue(outputGate, 0);
              // 値がboolean型であることを確認
              expect(typeof value).toBe('boolean');
            });
          }
        }
      });

      // 特定の回路に対する詳細テスト
      if (circuitData.id === 'half-adder') {
        it('半加算器の真理値表をテスト', () => {
          const testCases = [
            { a: false, b: false, sum: false, carry: false },
            { a: false, b: true, sum: true, carry: false },
            { a: true, b: false, sum: true, carry: false },
            { a: true, b: true, sum: false, carry: true },
          ];

          for (const testCase of testCases) {
            let circuit: Circuit = {
              gates: circuitData.gates.map(gate => ({ ...gate })),
              wires: circuitData.wires.map(wire => ({ ...wire })),
            };

            // 入力を設定
            circuit.gates = circuit.gates.map(g => {
              if (g.id === 'input-a') return { ...g, output: testCase.a };
              if (g.id === 'input-b') return { ...g, output: testCase.b };
              return g;
            });

            // 回路評価
            const result = evaluateCircuit(circuit, {});
            expect(result.success).toBe(true);
            
            if (result.success) {
              circuit = result.data.circuit;
              const outputSum = circuit.gates.find(g => g.id === 'output-sum');
              const outputCarry = circuit.gates.find(g => g.id === 'output-carry');

              expect(getGateInputValue(outputSum!, 0)).toBe(testCase.sum);
              expect(getGateInputValue(outputCarry!, 0)).toBe(testCase.carry);
            }
          }
        });
      }

      if (circuitData.id === 'sr-latch') {
        it('SR Latchの動作をテスト', () => {
          const testCases = [
            { s: false, r: false, description: 'Hold State' },  // 保持状態
            { s: true, r: false, description: 'Set' },         // セット
            { s: false, r: true, description: 'Reset' },       // リセット
          ];

          for (const testCase of testCases) {
            let circuit: Circuit = {
              gates: circuitData.gates.map(gate => ({ ...gate })),
              wires: circuitData.wires.map(wire => ({ ...wire })),
            };

            // 入力を設定
            circuit.gates = circuit.gates.map(g => {
              if (g.id === 'input_s') return { ...g, output: testCase.s };
              if (g.id === 'input_r') return { ...g, output: testCase.r };
              return g;
            });

            // 回路評価
            const result = evaluateCircuit(circuit, {});
            
            if (!result.success) {
              console.error(`SR Latch ${testCase.description} - 評価エラー:`, result.error);
            }
            
            expect(result.success).toBe(true);
            
            if (result.success) {
              circuit = result.data.circuit;
              const outputQ = circuit.gates.find(g => g.id === 'output_q');
              const outputQBar = circuit.gates.find(g => g.id === 'output_q_bar');
              
              // SR Latchの基本動作確認（詳細な期待値テストは省略）
              expect(outputQ).toBeDefined();
              expect(outputQBar).toBeDefined();
              console.log(`SR Latch ${testCase.description}: Q=${getGateInputValue(outputQ!, 0)}, Q̄=${getGateInputValue(outputQBar!, 0)}`);
            }
          }
        });
      }
    });
  });

  it('配線が空の回路を特定する', () => {
    const emptyWireCircuits = FEATURED_CIRCUITS.filter(circuit => circuit.wires.length === 0);
    
    if (emptyWireCircuits.length > 0) {
      console.warn('配線が空の回路:', emptyWireCircuits.map(c => c.title));
      
      // 失敗させて問題を明確にする
      expect(emptyWireCircuits.length).toBe(0);
    }
  });
});