import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateCircuit } from '../../src/domain/simulation/core/circuitEvaluation';
import { CHAOS_GENERATOR } from '../../src/features/gallery/data/chaos-generator';
import type { Circuit, EvaluationConfig } from '../../src/types';

describe('アプリとテストの動作差異調査', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('テスト環境の設定でカオス発生器を評価', () => {
    const circuit: Circuit = {
      gates: CHAOS_GENERATOR.gates,
      wires: CHAOS_GENERATOR.wires
    };

    // テスト環境と同じ設定
    const testConfig: EvaluationConfig = {
      enableDebug: true,
      timeProvider: {
        getCurrentTime: () => 0,
        getElapsedTime: () => 0
      }
    };

    console.log('\n=== テスト環境設定での評価 ===');
    const result1 = evaluateCircuit(circuit, testConfig);
    
    if (result1.success) {
      const dffStates = result1.data.circuit.gates
        .filter(g => g.type === 'D-FF')
        .map(g => ({ id: g.id, output: g.output }));
      console.log('D-FF状態:', dffStates);
    }
  });

  it('アプリ環境の設定でカオス発生器を評価', () => {
    const circuit: Circuit = {
      gates: CHAOS_GENERATOR.gates,
      wires: CHAOS_GENERATOR.wires
    };

    // EnhancedHybridEvaluatorと同じ前処理
    const currentTime = Date.now();
    const preprocessedCircuit: Circuit = {
      gates: circuit.gates.map(gate => {
        if (gate.type === 'CLOCK' && gate.metadata && gate.metadata.startTime === undefined) {
          console.log(`🔧 CLOCKゲート ${gate.id}: startTimeを${currentTime}に初期化`);
          return {
            ...gate,
            metadata: {
              ...gate.metadata,
              startTime: currentTime,
            }
          };
        }
        return gate;
      }),
      wires: circuit.wires
    };

    // アプリ環境と同じ設定
    const appConfig: EvaluationConfig = {
      enableDebug: true,
      allowCircularDependencies: true,
      strictValidation: false,
      timeProvider: {
        getCurrentTime: () => currentTime,
        getElapsedTime: () => 0
      }
    };

    console.log('\n=== アプリ環境設定での評価 ===');
    const result2 = evaluateCircuit(preprocessedCircuit, appConfig);
    
    if (result2.success) {
      const dffStates = result2.data.circuit.gates
        .filter(g => g.type === 'D-FF')
        .map(g => ({ id: g.id, output: g.output }));
      console.log('D-FF状態:', dffStates);
    }
  });

  it('時間差による動作確認', async () => {
    const circuit: Circuit = {
      gates: CHAOS_GENERATOR.gates,
      wires: CHAOS_GENERATOR.wires
    };

    console.log('\n=== 時間経過による動作確認 ===');

    // 初期評価（t=0）
    let currentTime = 0;
    let currentCircuit = {
      ...circuit,
      gates: circuit.gates.map(gate => {
        if (gate.type === 'CLOCK') {
          return {
            ...gate,
            metadata: { ...gate.metadata, startTime: 0 }
          };
        }
        return gate;
      })
    };

    const config: EvaluationConfig = {
      enableDebug: true,
      allowCircularDependencies: true,
      strictValidation: false,
      timeProvider: {
        getCurrentTime: () => currentTime,
        getElapsedTime: () => currentTime
      }
    };

    // 1秒間シミュレーション（250ms刻み）
    for (let t = 0; t <= 1000; t += 250) {
      currentTime = t;
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const clockOutput = currentCircuit.gates.find(g => g.id === 'clock')?.output;
        const dffOutputs = currentCircuit.gates
          .filter(g => g.type === 'D-FF')
          .map(g => g.output);
        
        console.log(`t=${t}ms: CLOCK=${clockOutput}, D-FFs=[${dffOutputs.join(',')}]`);
      }
    }
  });
});