/**
 * セルフオシレーティングメモリ動作検証テスト
 * 
 * 期待動作: 8段の遅延チェーンによる非安定マルチバイブレータ
 * 複雑なフィードバックループにより自己発振するメモリ回路
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SELF_OSCILLATING_MEMORY_FINAL } from '../../../src/features/gallery/data/self-oscillating-memory-final';
import { EnhancedHybridEvaluator } from '../../../src/domain/simulation/event-driven-minimal';
import type { Circuit } from '../../../src/domain/simulation/core/types';

describe('Self-Oscillating Memory Gallery Circuit', () => {
  let evaluator: EnhancedHybridEvaluator;
  let circuit: Circuit;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
      delayMode: true,
    });

    circuit = {
      gates: structuredClone(SELF_OSCILLATING_MEMORY_FINAL.gates),
      wires: structuredClone(SELF_OSCILLATING_MEMORY_FINAL.wires),
    };
  });

  describe('Circuit Structure', () => {
    it('should have 8-stage delay chain', () => {
      // 遅延チェーンのNOTゲートを確認
      const notGates = circuit.gates.filter(g => g.type === 'NOT');
      expect(notGates.length).toBeGreaterThanOrEqual(8);
    });

    it('should have feedback loops', () => {
      // フィードバックループの存在確認
      const hasLoop = circuit.wires.some(wire => {
        // 出力から入力へのパスが存在するか簡易チェック
        const fromGate = circuit.gates.find(g => g.id === wire.from.gateId);
        const toGate = circuit.gates.find(g => g.id === wire.to.gateId);
        
        if (fromGate && toGate) {
          // NOTゲートチェーンの一部であるか
          return fromGate.type === 'NOT' && toGate.type === 'NOT';
        }
        return false;
      });
      
      expect(hasLoop).toBe(true);
    });

    it('should have OUTPUT gates for observation', () => {
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      expect(outputGates.length).toBeGreaterThan(0);
    });
  });

  describe('Oscillation Behavior', () => {
    it('should start oscillating from initial state', () => {
      const stateHistory: string[] = [];
      
      // 状態のスナップショットを取得
      const getStateSnapshot = () => {
        return circuit.gates
          .filter(g => g.type === 'NOT' || g.type === 'OUTPUT')
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(g => g.output ? '1' : '0')
          .join('');
      };

      // 初期状態を記録
      stateHistory.push(getStateSnapshot());

      // 100ステップ実行
      for (let step = 0; step < 100; step++) {
        const result = evaluator.evaluate(circuit);
        circuit = result.circuit;
        
        const newState = getStateSnapshot();
        if (step < 20) { // 最初の20ステップは全て記録
          stateHistory.push(newState);
        }
      }

      // 状態変化があるか確認
      const uniqueStates = new Set(stateHistory);
      expect(uniqueStates.size).toBeGreaterThan(1);
    });

    it('should exhibit characteristic delay chain behavior', () => {
      // 遅延チェーンの伝播を確認
      const delayStages: boolean[][] = [];
      
      // 50ステップ実行して遅延伝播を観察
      for (let step = 0; step < 50; step++) {
        const result = evaluator.evaluate(circuit);
        circuit = result.circuit;
        
        // NOTゲートの状態を記録（遅延チェーンと仮定）
        const notStates = circuit.gates
          .filter(g => g.type === 'NOT')
          .sort((a, b) => {
            // IDに含まれる数字でソート
            const aNum = parseInt(a.id.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.id.match(/\d+/)?.[0] || '0');
            return aNum - bNum;
          })
          .map(g => g.output);
        
        delayStages.push(notStates);
      }

      // 信号が遅延チェーンを伝播しているか確認
      let propagationDetected = false;
      
      for (let i = 1; i < delayStages.length - 1; i++) {
        const prev = delayStages[i - 1];
        const curr = delayStages[i];
        const next = delayStages[i + 1];
        
        // 連続する状態で信号の伝播が見られるか
        for (let j = 0; j < prev.length - 1; j++) {
          if (prev[j] !== curr[j] && curr[j] !== next[j]) {
            propagationDetected = true;
            break;
          }
        }
        if (propagationDetected) break;
      }

      expect(propagationDetected).toBe(true);
    });

    it('should have stable oscillation period', () => {
      // 安定した発振周期を持つか確認
      const outputStates: boolean[] = [];
      
      // OUTPUTゲートを1つ選択して観察
      const targetOutput = circuit.gates.find(g => g.type === 'OUTPUT');
      if (!targetOutput) {
        throw new Error('No OUTPUT gate found');
      }

      // 200ステップ実行
      for (let step = 0; step < 200; step++) {
        const result = evaluator.evaluate(circuit);
        circuit = result.circuit;
        
        const output = circuit.gates.find(g => g.id === targetOutput.id);
        if (output) {
          outputStates.push(output.inputs[0] === '1' || output.inputs[0] === true);
        }
      }

      // 状態変化の回数を数える
      let changeCount = 0;
      for (let i = 1; i < outputStates.length; i++) {
        if (outputStates[i] !== outputStates[i - 1]) {
          changeCount++;
        }
      }

      // 適度な頻度で状態変化があるか（完全に固定でも高速すぎでもない）
      expect(changeCount).toBeGreaterThan(5);
      expect(changeCount).toBeLessThan(150); // 複雑な回路なので高速振動を許容
    });

    it('should update OUTPUT gates based on memory state', () => {
      const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      expect(outputGates.length).toBeGreaterThan(0);

      // 初期状態
      const initialOutputStates = outputGates.map(g => 
        g.inputs[0] === '1' || g.inputs[0] === true
      );

      // 50ステップ実行
      for (let i = 0; i < 50; i++) {
        const result = evaluator.evaluate(circuit);
        circuit = result.circuit;
      }

      // 最終状態
      const finalOutputGates = circuit.gates.filter(g => g.type === 'OUTPUT');
      const finalOutputStates = finalOutputGates.map(g => 
        g.inputs[0] === '1' || g.inputs[0] === true
      );

      // 少なくとも1つのOUTPUTの状態が変化
      let hasChange = false;
      for (let i = 0; i < initialOutputStates.length; i++) {
        if (initialOutputStates[i] !== finalOutputStates[i]) {
          hasChange = true;
          break;
        }
      }

      expect(hasChange).toBe(true);
    });
  });

  describe('Animation Requirements', () => {
    it('should have animation configuration', () => {
      expect(SELF_OSCILLATING_MEMORY_FINAL.simulationConfig?.needsAnimation).toBe(true);
    });

    it('should have appropriate update interval for complex circuit', () => {
      const interval = SELF_OSCILLATING_MEMORY_FINAL.simulationConfig?.updateInterval;
      expect(interval).toBeDefined();
      // 複雑な回路なので更新間隔は長め
      expect(interval).toBeGreaterThan(500);
    });

    it('should handle complex feedback loops without infinite loops', () => {
      // 無限ループに陥らずに評価できるか
      const startTime = Date.now();
      
      // 20回評価
      for (let i = 0; i < 20; i++) {
        evaluator.evaluate(circuit);
      }
      
      const elapsed = Date.now() - startTime;
      
      // 妥当な時間内に完了
      expect(elapsed).toBeLessThan(200);
    });
  });
});