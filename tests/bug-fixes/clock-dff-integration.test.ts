import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateCircuit } from '../../src/domain/simulation/core/circuitEvaluation';
import type { Gate, Circuit } from '../../src/types/circuit';
import type { EvaluationConfig } from '../../src/domain/simulation/core/types';

describe('CLOCK and D-FF Integration Test', () => {
  let mockTimeProvider: EvaluationConfig['timeProvider'];
  let currentTime: number;
  
  beforeEach(() => {
    currentTime = 0;
    mockTimeProvider = {
      getCurrentTime: () => currentTime,
      getElapsedTime: () => currentTime
    };
  });

  it('should test simple CLOCK -> D-FF circuit', () => {
    // シンプルな回路: CLOCK -> D-FF (D入力は固定でtrue)
    const circuit: Circuit = {
      gates: [
        {
          id: 'input_d',
          type: 'INPUT',
          position: { x: 50, y: 100 },
          output: true, // D入力は常にtrue
        },
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 50, y: 200 },
          output: false,
          metadata: { frequency: 2, isRunning: true } // 2Hz = 500ms period
        },
        {
          id: 'dff1',
          type: 'D-FF',
          position: { x: 200, y: 150 },
          output: false,
          inputs: ['', ''],
          metadata: { qOutput: false, previousClockState: false }
        },
        {
          id: 'output_q',
          type: 'OUTPUT',
          position: { x: 350, y: 150 },
          output: false
        }
      ],
      wires: [
        {
          id: 'w_d',
          from: { gateId: 'input_d', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 0 }, // D入力
          isActive: false
        },
        {
          id: 'w_clk',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 }, // CLK入力
          isActive: false
        },
        {
          id: 'w_q',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'output_q', pinIndex: 0 },
          isActive: false
        }
      ]
    };

    const config: EvaluationConfig = {
      enableDebug: true,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== Simple CLOCK -> D-FF Test ===');
    
    let currentCircuit = circuit;
    const states: Array<{ time: number, clock: boolean, dff: boolean, output: boolean }> = [];
    
    // 2秒間（2000ms）シミュレーション、100ms間隔
    for (let t = 0; t <= 2000; t += 100) {
      currentTime = t;
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const clockGate = currentCircuit.gates.find(g => g.id === 'clock');
        const dffGate = currentCircuit.gates.find(g => g.id === 'dff1');
        const outputGate = currentCircuit.gates.find(g => g.id === 'output_q');
        
        const state = {
          time: t,
          clock: clockGate?.output || false,
          dff: dffGate?.output || false,
          output: outputGate?.output || false
        };
        states.push(state);
        
        // CLOCKの立ち上がりエッジを検出
        const prevState = states[states.length - 2];
        const isRisingEdge = prevState && !prevState.clock && state.clock;
        
        console.log(`t=${t}ms: CLOCK=${state.clock}, DFF=${state.dff}, OUTPUT=${state.output}${isRisingEdge ? ' ⬆️ RISING EDGE' : ''}`);
      }
    }
    
    // 検証
    // 1. CLOCKが正しく動作している（変化している）
    const clockStates = states.map(s => s.clock);
    const uniqueClockStates = new Set(clockStates);
    expect(uniqueClockStates.size).toBe(2); // trueとfalseの両方
    
    // 2. D-FFが立ち上がりエッジで変化している
    const dffStates = states.map(s => s.dff);
    const uniqueDffStates = new Set(dffStates);
    expect(uniqueDffStates.size).toBe(2); // D入力がtrueなので、最終的にtrueになるはず
    
    // 3. 最終的にD-FFの出力はtrueになるはず（D入力がtrueなので）
    const finalState = states[states.length - 1];
    expect(finalState.dff).toBe(true);
    expect(finalState.output).toBe(true);
  });

  it('should test LFSR circuit from gallery', () => {
    // ギャラリーのLFSR回路を簡略化したもの
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 100, y: 150 },
          output: true,
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
          id: 'dff2',
          type: 'D-FF',
          position: { x: 300, y: 200 },
          output: true,
          inputs: ['', ''],
          metadata: { qOutput: true, previousClockState: false }
        },
        {
          id: 'xor_feedback',
          type: 'XOR',
          position: { x: 350, y: 100 },
          output: false,
          inputs: ['', '']
        },
        {
          id: 'out_bit3',
          type: 'OUTPUT',
          position: { x: 200, y: 300 },
          output: false,
          inputs: ['']
        },
        {
          id: 'out_bit2',
          type: 'OUTPUT',
          position: { x: 300, y: 300 },
          output: false,
          inputs: ['']
        }
      ],
      wires: [
        // クロック分配
        {
          id: 'clk_dff1',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 },
          isActive: true
        },
        {
          id: 'clk_dff2',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff2', pinIndex: 1 },
          isActive: true
        },
        // シフトレジスタ接続
        {
          id: 'shift_1_2',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'dff2', pinIndex: 0 },
          isActive: false
        },
        // XORフィードバック
        {
          id: 'feedback_tap1',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'xor_feedback', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'feedback_tap2',
          from: { gateId: 'dff2', pinIndex: -1 },
          to: { gateId: 'xor_feedback', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'feedback_loop',
          from: { gateId: 'xor_feedback', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 0 },
          isActive: false
        },
        // 出力観測
        {
          id: 'observe_bit3',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'out_bit3', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'observe_bit2',
          from: { gateId: 'dff2', pinIndex: -1 },
          to: { gateId: 'out_bit2', pinIndex: 0 },
          isActive: false
        }
      ]
    };

    const config: EvaluationConfig = {
      enableDebug: false, // デバッグ出力を減らす
      timeProvider: mockTimeProvider
    };

    console.log('\n=== LFSR Circuit Test ===');
    
    let currentCircuit = circuit;
    const states: Array<{ time: number, clock: boolean, dff1: boolean, dff2: boolean, xor: boolean }> = [];
    
    // 2秒間シミュレーション
    for (let t = 0; t <= 2000; t += 100) {
      currentTime = t;
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const clockGate = currentCircuit.gates.find(g => g.id === 'clock');
        const dff1Gate = currentCircuit.gates.find(g => g.id === 'dff1');
        const dff2Gate = currentCircuit.gates.find(g => g.id === 'dff2');
        const xorGate = currentCircuit.gates.find(g => g.id === 'xor_feedback');
        
        const state = {
          time: t,
          clock: clockGate?.output || false,
          dff1: dff1Gate?.output || false,
          dff2: dff2Gate?.output || false,
          xor: xorGate?.output || false
        };
        states.push(state);
        
        // 立ち上がりエッジでの状態を表示
        const prevState = states[states.length - 2];
        if (prevState && !prevState.clock && state.clock) {
          console.log(`t=${t}ms ⬆️: DFF1=${state.dff1}, DFF2=${state.dff2}, XOR=${state.xor}`);
        }
      }
    }
    
    // LFSRのパターンを確認
    const patterns = states.map(s => `${s.dff1 ? '1' : '0'}${s.dff2 ? '1' : '0'}`);
    const uniquePatterns = new Set(patterns);
    console.log('Unique patterns:', Array.from(uniquePatterns));
    
    // LFSRは状態が変化するはず
    expect(uniquePatterns.size).toBeGreaterThan(1);
  });
});