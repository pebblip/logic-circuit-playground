import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateGateUnified } from '../../src/domain/simulation/core/gateEvaluation';
import { evaluateCircuit } from '../../src/domain/simulation/core/circuitEvaluation';
import type { Gate, Circuit } from '../../src/types/circuit';
import type { EvaluationConfig } from '../../src/domain/simulation/core/types';

describe('CLOCK startTime Issue Investigation', () => {
  let mockTimeProvider: EvaluationConfig['timeProvider'];
  let currentTime: number;
  
  beforeEach(() => {
    currentTime = 0;
    mockTimeProvider = {
      getCurrentTime: () => currentTime,
      getElapsedTime: () => currentTime
    };
  });

  it('should demonstrate CLOCK startTime issue with direct gate evaluation', () => {
    // CLOCKゲートを作成
    const clockGate: Gate = {
      id: 'clock1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      width: 80,
      height: 60,
      label: 'CLK',
      output: false,
      metadata: {
        frequency: 2, // 2Hz = 500ms period
        isRunning: true,
        // startTimeは設定しない（undefinedのまま）
      }
    };

    const config: EvaluationConfig = {
      enableDebug: true,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== Direct Gate Evaluation Test ===');
    
    // 初回評価
    currentTime = 0;
    const result1 = evaluateGateUnified(clockGate, [], config);
    console.log('1st evaluation (t=0):', {
      success: result1.success,
      output: result1.success ? result1.data.primaryOutput : null,
      metadata: result1.success ? result1.data.metadata : null
    });
    
    // 2回目の評価（250ms後）
    currentTime = 250;
    const result2 = evaluateGateUnified(clockGate, [], config);
    console.log('2nd evaluation (t=250):', {
      success: result2.success,
      output: result2.success ? result2.data.primaryOutput : null,
      metadata: result2.success ? result2.data.metadata : null
    });
    
    // 3回目の評価（500ms後）
    currentTime = 500;
    const result3 = evaluateGateUnified(clockGate, [], config);
    console.log('3rd evaluation (t=500):', {
      success: result3.success,
      output: result3.success ? result3.data.primaryOutput : null,
      metadata: result3.success ? result3.data.metadata : null
    });

    // 問題: startTimeが評価結果のmetadataに含まれていても、ゲート自体には反映されない
    expect(clockGate.metadata?.startTime).toBeUndefined();
  });

  it('should investigate circuit evaluation with CLOCK gate', async () => {
    // 簡単な回路を作成: CLOCK -> OUTPUT
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          width: 80,
          height: 60,
          label: 'CLK',
          output: false,
          metadata: {
            frequency: 2, // 2Hz = 500ms period
            isRunning: true,
            // startTimeは設定しない
          }
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 300, y: 100 },
          width: 80,
          height: 60,
          label: 'OUT',
          output: false
        }
      ],
      wires: [
        {
          id: 'w1',
          from: { gateId: 'clock1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ]
    };

    const config: EvaluationConfig = {
      enableDebug: true,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== Circuit Evaluation Test ===');
    
    // 初回評価
    currentTime = 0;
    const result1 = evaluateCircuit(circuit, config);
    if (result1.success) {
      const clockGate = result1.data.circuit.gates.find(g => g.id === 'clock1');
      console.log('After 1st evaluation (t=0):', {
        output: clockGate?.output,
        startTime: clockGate?.metadata?.startTime,
        metadata: clockGate?.metadata
      });
      
      // 2回目の評価（250ms後）
      currentTime = 250;
      const result2 = evaluateCircuit(result1.data.circuit, config);
      if (result2.success) {
        const clockGate2 = result2.data.circuit.gates.find(g => g.id === 'clock1');
        console.log('After 2nd evaluation (t=250):', {
          output: clockGate2?.output,
          startTime: clockGate2?.metadata?.startTime,
          metadata: clockGate2?.metadata
        });
        
        // 3回目の評価（500ms後）
        currentTime = 500;
        const result3 = evaluateCircuit(result2.data.circuit, config);
        if (result3.success) {
          const clockGate3 = result3.data.circuit.gates.find(g => g.id === 'clock1');
          console.log('After 3rd evaluation (t=500):', {
            output: clockGate3?.output,
            startTime: clockGate3?.metadata?.startTime,
            metadata: clockGate3?.metadata
          });
          
          // startTimeが保持されているか確認
          expect(clockGate3?.metadata?.startTime).toBeDefined();
          expect(clockGate3?.metadata?.startTime).toBe(0);
        }
      }
    }
  });

  it('should test LFSR behavior with proper CLOCK', async () => {
    // LFSRの簡略版を作成
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 100, y: 150 },
          output: false,
          metadata: { frequency: 2, isRunning: true }
        },
        {
          id: 'dff1',
          type: 'D-FF',
          position: { x: 200, y: 200 },
          output: true,
          inputs: ['', ''],
          metadata: { qOutput: true, previousClockState: false }
        },
        {
          id: 'out_bit3',
          type: 'OUTPUT',
          position: { x: 200, y: 300 },
          output: false,
          inputs: ['']
        }
      ],
      wires: [
        {
          id: 'clk_dff1',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'observe_bit3',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'out_bit3', pinIndex: 0 },
          isActive: false
        },
        // フィードバックループ（簡略化のため自己ループ）
        {
          id: 'feedback',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 0 },
          isActive: false
        }
      ]
    };

    const config: EvaluationConfig = {
      enableDebug: true,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== LFSR Test ===');
    
    let currentCircuit = circuit;
    const outputs: boolean[] = [];
    
    // 1秒間（1000ms）シミュレーション
    for (let t = 0; t <= 1000; t += 100) {
      currentTime = t;
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const outputGate = currentCircuit.gates.find(g => g.id === 'out_bit3');
        outputs.push(outputGate?.output || false);
        
        console.log(`t=${t}ms: CLOCK=${currentCircuit.gates[0].output}, DFF1=${currentCircuit.gates[1].output}, OUT=${outputGate?.output}`);
      }
    }
    
    // CLOCKが正しく動作していれば、出力は変化するはず
    const uniqueOutputs = new Set(outputs);
    console.log('Unique outputs:', Array.from(uniqueOutputs));
    expect(uniqueOutputs.size).toBeGreaterThan(1); // 少なくとも2つの異なる値
  });
});