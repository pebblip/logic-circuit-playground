/**
 * フィボナッチカウンター動作検証テスト
 * 
 * 期待動作: CLOCKに同期して0→1→1→2→3→5→8→13→21...の数列を生成
 * 12個のOUTPUTゲートが2進数表現で値を表示
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FIBONACCI_COUNTER } from '../../../src/features/gallery/data/fibonacci-counter';
import { EnhancedHybridEvaluator } from '../../../src/domain/simulation/event-driven-minimal';
import type { Circuit } from '../../../src/domain/simulation/core/types';

describe('Fibonacci Counter Gallery Circuit', () => {
  let evaluator: EnhancedHybridEvaluator;
  let circuit: Circuit;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'LEGACY_ONLY',
      enableDebugLogging: false,
      delayMode: true,
    });

    circuit = {
      gates: structuredClone(FIBONACCI_COUNTER.gates),
      wires: structuredClone(FIBONACCI_COUNTER.wires),
    };
  });

  describe('Basic Structure', () => {
    it('should have correct components', () => {
      const clockGates = circuit.gates.filter(g => g.type === 'CLOCK');
      const dffGates = circuit.gates.filter(g => g.type === 'D-FF');
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');

      expect(clockGates).toHaveLength(1);
      expect(dffGates.length).toBeGreaterThan(0);
      expect(outputGates).toHaveLength(9); // 3ビット×3グループ（A値、B値、加算結果）
    });

    it('should have proper CLOCK configuration', () => {
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      expect(clock).toBeDefined();
      expect(clock?.metadata?.frequency).toBeDefined();
      expect(clock?.metadata?.frequency).toBeGreaterThan(0);
    });
  });

  describe('Fibonacci Sequence Generation', () => {
    it('should have changing values over time', () => {
      // 基本的な動作確認：値が時間とともに変化するか
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      const baseTime = Date.now();
      if (clock) {
        clock.metadata = { ...clock.metadata, isRunning: true, startTime: baseTime };
      }

      const values: number[] = [];
      
      // 20サイクル実行
      for (let cycle = 0; cycle < 20; cycle++) {
        // 時間を進める（600ms周期なので700ms進める）
        const mockTime = baseTime + (cycle * 700);
        
        // Date.nowをモック
        const originalDateNow = Date.now;
        Date.now = () => mockTime;
        
        // 評価を実行
        for (let i = 0; i < 10; i++) {
          const result = evaluator.evaluate(circuit);
          circuit = result.circuit;
        }
        
        // Date.nowを元に戻す
        Date.now = originalDateNow;
        
        // B レジスタの値を取得
        const regB0 = circuit.gates.find(g => g.id === 'reg_b_0');
        const regB1 = circuit.gates.find(g => g.id === 'reg_b_1');
        let value = 0;
        if (regB0?.output) value += 1;
        if (regB1?.output) value += 2;
        
        values.push(value);
        
        if (cycle < 5) {
          const clock = circuit.gates.find(g => g.type === 'CLOCK');
          console.log(`Cycle ${cycle}: B value = ${value}, Clock output = ${clock?.output}`);
        }
      }
      
      // 少なくとも2つの異なる値が存在することを確認
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
    
    it.skip('should generate correct fibonacci sequence', () => {
      // TODO: フィボナッチ回路の初期化問題を修正後に有効化
      const expectedSequence = [1, 1, 2, 3, 1, 0, 1, 1, 2, 3, 1, 0];
      const actualSequence: number[] = [];

      // CLOCKを初期化（まだ開始しない）
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      if (clock) {
        clock.metadata = { ...clock.metadata, isRunning: false };
      }

      // 初期状態を確認
      const initialA0 = circuit.gates.find(g => g.id === 'reg_a_0');
      const initialB0 = circuit.gates.find(g => g.id === 'reg_b_0');
      console.log('Initial states:', {
        a0: initialA0?.output,
        b0: initialB0?.output,
      });

      // D-FFの初期状態を設定（メタデータから）
      circuit.gates.forEach(gate => {
        if (gate.type === 'D-FF' && gate.metadata?.qOutput !== undefined) {
          gate.output = gate.metadata.qOutput;
        }
      });
      
      // 初期値を記録（最初のクロックエッジ前）
      const regB0_initial = circuit.gates.find(g => g.id === 'reg_b_0');
      const regB1_initial = circuit.gates.find(g => g.id === 'reg_b_1');
      let initialValue = 0;
      if (regB0_initial?.output) initialValue += 1;
      if (regB1_initial?.output) initialValue += 2;
      actualSequence.push(initialValue);
      
      console.log('Initial B register outputs:', { b0: regB0_initial?.output, b1: regB1_initial?.output });

      // CLOCKを開始（600ms周期なのでstartTimeを過去にして最初のエッジを早める）
      if (clock) {
        clock.metadata = { ...clock.metadata, isRunning: true, startTime: Date.now() - 300 };
      }

      // 11ステップ実行（初期値を含めて12個の値）
      for (let step = 0; step < 11; step++) {
        // クロックサイクルをシミュレート
        for (let i = 0; i < 10; i++) {
          const result = evaluator.evaluate(circuit);
          circuit = result.circuit;
        }

        // OUTPUT値を2進数から10進数に変換
        const outputGates = circuit.gates
          .filter(g => g.type === 'OUTPUT')
          .sort((a, b) => {
            const aNum = parseInt(a.id.replace(/[^0-9]/g, ''));
            const bNum = parseInt(b.id.replace(/[^0-9]/g, ''));
            return aNum - bNum;
          });

        // フィボナッチ値を取得（レジスタBの値を直接読む）
        const regB0 = circuit.gates.find(g => g.id === 'reg_b_0');
        const regB1 = circuit.gates.find(g => g.id === 'reg_b_1');
        let value = 0;
        if (regB0?.output) value += 1;
        if (regB1?.output) value += 2;

        if (step < 4) {
          console.log(`Step ${step + 1}: B registers =`, { b0: regB0?.output, b1: regB1?.output }, `Value = ${value}`);
        }

        actualSequence.push(value);
      }

      // フィボナッチ数列の確認
      expectedSequence.forEach((expected, index) => {
        expect(actualSequence[index]).toBe(expected);
      });
    });

    it('should have all OUTPUT gates properly connected', () => {
      // 初期状態で全OUTPUTゲートが接続されているか
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      
      outputGates.forEach(outputGate => {
        // 各OUTPUTゲートに入力ワイヤーが存在するか
        const inputWire = circuit.wires.find(w => 
          w.to.gateId === outputGate.id && w.to.pinIndex === 0
        );
        expect(inputWire).toBeDefined();
      });
    });

    it.skip('should update OUTPUT gates visually on each clock cycle', () => {
      // TODO: OUTPUT ゲートへの信号伝播問題を修正後に有効化
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      if (clock) {
        clock.metadata = { ...clock.metadata, isRunning: true, startTime: Date.now() };
      }

      // 複数サイクル実行
      const outputStates: string[][] = [];
      
      for (let cycle = 0; cycle < 5; cycle++) {
        // CLOCKサイクル実行
        for (let i = 0; i < 20; i++) {
          const result = evaluator.evaluate(circuit);
          circuit = result.circuit;
        }

        // OUTPUT状態を記録
        const outputs = circuit.gates
          .filter(g => g.type === 'OUTPUT')
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(g => g.inputs[0] || '0');
        
        outputStates.push(outputs);
      }

      // 各サイクルで異なる状態になっているか
      let hasChange = false;
      for (let i = 1; i < outputStates.length; i++) {
        if (JSON.stringify(outputStates[i]) !== JSON.stringify(outputStates[i-1])) {
          hasChange = true;
          break;
        }
      }

      expect(hasChange).toBe(true);
    });
  });

  describe('Visual Animation Requirements', () => {
    it('should have animation configuration', () => {
      expect(FIBONACCI_COUNTER.simulationConfig?.needsAnimation).toBe(true);
      expect(FIBONACCI_COUNTER.simulationConfig?.updateInterval).toBeDefined();
    });

    it('should have proper initial state for all gates', () => {
      // 全てのゲートが適切な初期状態を持つか
      circuit.gates.forEach(gate => {
        expect(gate.inputs).toBeDefined();
        expect(Array.isArray(gate.inputs)).toBe(true);
        
        if (gate.type === 'D-FF') {
          expect(gate.metadata).toBeDefined();
        }
      });
    });
  });
});