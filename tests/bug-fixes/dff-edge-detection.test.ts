import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateCircuit } from '../../src/domain/simulation/core/circuitEvaluation';
import type { Gate, Circuit } from '../../src/types/circuit';
import type { EvaluationConfig } from '../../src/domain/simulation/core/types';

describe('D-FF Edge Detection Issue', () => {
  let mockTimeProvider: EvaluationConfig['timeProvider'];
  let currentTime: number;
  
  beforeEach(() => {
    currentTime = 0;
    mockTimeProvider = {
      getCurrentTime: () => currentTime,
      getElapsedTime: () => currentTime
    };
  });

  it('should demonstrate D-FF edge detection issue', () => {
    // トグル入力を持つD-FF回路
    const circuit: Circuit = {
      gates: [
        {
          id: 'toggle_input',
          type: 'INPUT',
          position: { x: 50, y: 100 },
          output: false, // 初期値false、後でtrueに変更
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
          from: { gateId: 'toggle_input', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'w_clk',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 },
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
      enableDebug: false,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== D-FF Edge Detection Test ===');
    
    let currentCircuit = circuit;
    const states: Array<{ 
      time: number, 
      toggleInput: boolean,
      clock: boolean, 
      dff: boolean, 
      dffMetadata: any 
    }> = [];
    
    // テストシナリオ
    const scenario = [
      { time: 0, toggleInput: false },    // 初期状態
      { time: 100, toggleInput: false },  // CLOCKはHIGH
      { time: 250, toggleInput: true },   // CLOCKがLOWになる時にD入力を変更
      { time: 400, toggleInput: true },   // CLOCKはLOW
      { time: 500, toggleInput: true },   // CLOCKがHIGHになる（立ち上がり）
      { time: 600, toggleInput: false },  // CLOCKはHIGH、D入力を変更
      { time: 750, toggleInput: false },  // CLOCKがLOWになる
      { time: 900, toggleInput: false },  // CLOCKはLOW
      { time: 1000, toggleInput: false }, // CLOCKがHIGHになる（立ち上がり）
    ];
    
    for (const step of scenario) {
      currentTime = step.time;
      
      // D入力を更新
      const toggleGate = currentCircuit.gates.find(g => g.id === 'toggle_input');
      if (toggleGate) {
        toggleGate.output = step.toggleInput;
      }
      
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const clockGate = currentCircuit.gates.find(g => g.id === 'clock');
        const dffGate = currentCircuit.gates.find(g => g.id === 'dff1');
        const outputGate = currentCircuit.gates.find(g => g.id === 'output_q');
        
        const state = {
          time: step.time,
          toggleInput: step.toggleInput,
          clock: clockGate?.output || false,
          dff: dffGate?.output || false,
          dffMetadata: { ...dffGate?.metadata }
        };
        states.push(state);
        
        // 立ち上がりエッジを検出
        const prevState = states[states.length - 2];
        const isRisingEdge = prevState && !prevState.clock && state.clock;
        
        console.log(
          `t=${step.time}ms: D=${state.toggleInput}, CLK=${state.clock}, ` +
          `Q=${state.dff}, prevClk=${state.dffMetadata.previousClockState}` +
          `${isRisingEdge ? ' ⬆️ EDGE' : ''}`
        );
      }
    }
    
    // 検証
    // t=0: 初期立ち上がりでD=falseをキャプチャ → Q=false
    expect(states[0].dff).toBe(false);
    
    // t=500: 立ち上がりエッジでD=trueをキャプチャ → Q=true
    const state500 = states.find(s => s.time === 500);
    expect(state500?.dff).toBe(true);
    
    // t=1000: 立ち上がりエッジでD=falseをキャプチャ → Q=false
    const state1000 = states.find(s => s.time === 1000);
    expect(state1000?.dff).toBe(false);
  });

  it('should test LFSR initial state issue', () => {
    // LFSRの初期値問題を調査
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 100, y: 150 },
          output: false, // 初期値false
          metadata: { frequency: 2, isRunning: true }
        },
        {
          id: 'dff1',
          type: 'D-FF',
          position: { x: 200, y: 200 },
          output: true, // 初期値true
          inputs: ['', ''],
          metadata: { qOutput: true, previousClockState: false }
        },
        {
          id: 'not_gate',
          type: 'NOT',
          position: { x: 300, y: 100 },
          output: false,
          inputs: ['']
        },
        {
          id: 'out_bit',
          type: 'OUTPUT',
          position: { x: 200, y: 300 },
          output: false,
          inputs: ['']
        }
      ],
      wires: [
        // CLOCK -> D-FF CLK
        {
          id: 'clk_dff1',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 1 },
          isActive: false
        },
        // D-FF Q -> NOT
        {
          id: 'dff_to_not',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'not_gate', pinIndex: 0 },
          isActive: false
        },
        // NOT -> D-FF D (フィードバック)
        {
          id: 'feedback',
          from: { gateId: 'not_gate', pinIndex: -1 },
          to: { gateId: 'dff1', pinIndex: 0 },
          isActive: false
        },
        // D-FF Q -> OUTPUT
        {
          id: 'observe',
          from: { gateId: 'dff1', pinIndex: -1 },
          to: { gateId: 'out_bit', pinIndex: 0 },
          isActive: false
        }
      ]
    };

    const config: EvaluationConfig = {
      enableDebug: false,
      timeProvider: mockTimeProvider
    };

    console.log('\n=== LFSR Initial State Test ===');
    
    let currentCircuit = circuit;
    const outputs: boolean[] = [];
    
    // 2秒間シミュレーション
    for (let t = 0; t <= 2000; t += 250) {
      currentTime = t;
      const result = evaluateCircuit(currentCircuit, config);
      
      if (result.success) {
        currentCircuit = result.data.circuit;
        const clockGate = currentCircuit.gates.find(g => g.id === 'clock');
        const dffGate = currentCircuit.gates.find(g => g.id === 'dff1');
        const notGate = currentCircuit.gates.find(g => g.id === 'not_gate');
        const outputGate = currentCircuit.gates.find(g => g.id === 'out_bit');
        
        outputs.push(outputGate?.output || false);
        
        console.log(
          `t=${t}ms: CLK=${clockGate?.output}, DFF=${dffGate?.output}, ` +
          `NOT=${notGate?.output}, OUT=${outputGate?.output}, ` +
          `prevClk=${dffGate?.metadata?.previousClockState}`
        );
      }
    }
    
    // トグル回路なので、出力は交互に変化するはず
    const uniqueOutputs = new Set(outputs);
    expect(uniqueOutputs.size).toBe(2); // trueとfalseの両方
  });
});