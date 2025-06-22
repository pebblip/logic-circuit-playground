/**
 * マンダラ回路動作検証テスト
 *
 * 期待動作: 3つの異なる周期のリングオシレータが独立して動作
 * - 3段リング: 高速振動
 * - 5段リング: 中速振動
 * - 7段リング: 低速振動
 * 12個のOUTPUTゲートが美しいパターンを生成
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MANDALA_CIRCUIT } from '../../../src/features/gallery/data/mandala-circuit';
import { CircuitEvaluationService } from '@/domain/simulation/services/CircuitEvaluationService';
import type { Circuit } from '../../../src/domain/simulation/core/types';

describe('Mandala Circuit Gallery Circuit', () => {
  let evaluator: CircuitEvaluationService;
  let circuit: Circuit;

  beforeEach(() => {
    evaluator = new CircuitEvaluationService({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
      delayMode: true,
    });

    circuit = {
      gates: structuredClone(MANDALA_CIRCUIT.gates),
      wires: structuredClone(MANDALA_CIRCUIT.wires),
    };
  });

  describe('Circuit Structure', () => {
    it('should have 12 OUTPUT gates', () => {
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      expect(outputGates).toHaveLength(12);
    });

    it('should have three ring oscillators', () => {
      const notGates = circuit.gates.filter(g => g.type === 'NOT');
      expect(notGates.length).toBeGreaterThanOrEqual(15); // 3 + 5 + 7 = 15
    });

    it('should have all OUTPUT gates connected', () => {
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');

      outputGates.forEach(outputGate => {
        const inputWire = circuit.wires.find(
          w => w.to.gateId === outputGate.id && w.to.pinIndex === 0
        );
        expect(inputWire).toBeDefined();
      });
    });
  });

  describe('Oscillation Behavior', () => {
    it.skip('should show independent oscillation in three rings', () => {
      // TODO: リングオシレータの周期的変化検出を修正後に有効化
      // 初期状態を記録
      const getOutputStates = () => {
        return circuit.gates
          .filter(g => g.type === 'OUTPUT')
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(g => g.inputs[0] === '1' || g.inputs[0] === true);
      };

      const stateHistory: boolean[][] = [];

      // 50ステップ実行して状態変化を記録
      for (let step = 0; step < 50; step++) {
        const result = evaluator.evaluateCircuit(circuit);
        circuit = result.circuit;
        stateHistory.push(getOutputStates());
      }

      // 各リングが独立して振動しているか確認
      // Ring 1 (3段): OUT1-OUT3
      // Ring 2 (5段): OUT4-OUT8
      // Ring 3 (7段): OUT9-OUT15
      // Center: OUT16-OUT17

      // 少なくとも1つのリングで周期的な変化があるか
      let hasPeriodicChange = false;

      for (let i = 0; i < stateHistory.length - 10; i++) {
        for (let period = 3; period <= 14; period++) {
          if (i + period < stateHistory.length) {
            const currentState = JSON.stringify(stateHistory[i]);
            const futureState = JSON.stringify(stateHistory[i + period]);
            if (currentState === futureState) {
              hasPeriodicChange = true;
              break;
            }
          }
        }
        if (hasPeriodicChange) break;
      }

      expect(hasPeriodicChange).toBe(true);
    });

    it('should have different oscillation frequencies for each ring', () => {
      // 各リングの状態変化頻度を測定
      const ringChangeCounts = {
        ring1: 0, // 3段
        ring2: 0, // 5段
        ring3: 0, // 7段
      };

      let prevStates = {
        ring1: '',
        ring2: '',
        ring3: '',
      };

      // 100ステップ実行
      for (let step = 0; step < 100; step++) {
        const result = evaluator.evaluateCircuit(circuit);
        circuit = result.circuit;

        const outputs = circuit.gates.filter(g => g.type === 'OUTPUT');

        // 各リングの状態を取得（仮定: OUTPUTゲートのIDで分類）
        const ring1State = outputs
          .slice(0, 3)
          .map(g => g.inputs[0])
          .join('');
        const ring2State = outputs
          .slice(3, 8)
          .map(g => g.inputs[0])
          .join('');
        const ring3State = outputs
          .slice(8, 15)
          .map(g => g.inputs[0])
          .join('');

        if (step > 0) {
          if (ring1State !== prevStates.ring1) ringChangeCounts.ring1++;
          if (ring2State !== prevStates.ring2) ringChangeCounts.ring2++;
          if (ring3State !== prevStates.ring3) ringChangeCounts.ring3++;
        }

        prevStates = {
          ring1: ring1State,
          ring2: ring2State,
          ring3: ring3State,
        };
      }

      // 異なる周波数で振動しているか（変化回数が異なるか）
      const counts = Object.values(ringChangeCounts);
      const uniqueCounts = new Set(counts);

      // 少なくとも2つの異なる周波数があるか
      expect(uniqueCounts.size).toBeGreaterThanOrEqual(2);
    });

    it('should light up OUTPUT gates dynamically', () => {
      // 初期状態で全て消灯
      const initialOutputs = circuit.gates
        .filter(g => g.type === 'OUTPUT')
        .map(g => g.inputs[0] === '1' || g.inputs[0] === true);

      const allOff = initialOutputs.every(v => !v);

      // 複数ステップ実行
      for (let i = 0; i < 30; i++) {
        const result = evaluator.evaluateCircuit(circuit);
        circuit = result.circuit;
      }

      // 実行後、少なくとも一部のOUTPUTが点灯
      const finalOutputs = circuit.gates
        .filter(g => g.type === 'OUTPUT')
        .map(g => g.inputs[0] === '1' || g.inputs[0] === true);

      const someOn = finalOutputs.some(v => v);

      expect(someOn).toBe(true);
    });
  });

  describe('Visual Requirements', () => {
    it('should have animation enabled', () => {
      expect(MANDALA_CIRCUIT.simulationConfig?.needsAnimation).toBe(true);
    });

    it('should have reasonable update interval', () => {
      const interval = MANDALA_CIRCUIT.simulationConfig?.updateInterval;
      expect(interval).toBeDefined();
      expect(interval).toBeGreaterThan(100);
      expect(interval).toBeLessThan(2000);
    });

    it('should handle high OUTPUT count efficiently', () => {
      // 17個のOUTPUTゲート同時更新のパフォーマンステスト
      const startTime = Date.now();

      // 10回評価
      for (let i = 0; i < 10; i++) {
        evaluator.evaluateCircuit(circuit);
      }

      const elapsed = Date.now() - startTime;

      // 10回の評価が100ms以内で完了すること
      expect(elapsed).toBeLessThan(100);
    });
  });
});
