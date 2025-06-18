import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';

describe('D-FF Clock Edge Test', () => {
  it('D-FFがクロックエッジで正しく状態更新する', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });

    // 簡単なD-FFテスト回路
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          output: false, // 初期状態LOW
          inputs: [],
          metadata: { frequency: 1, isRunning: true, startTime: Date.now() },
        },
        {
          id: 'input',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: true, // D入力=HIGH
          inputs: [],
        },
        {
          id: 'dff',
          type: 'D-FF',
          position: { x: 200, y: 150 },
          output: false, // 初期状態Q=LOW
          inputs: ['', ''],
          metadata: { qOutput: false, previousClockState: false },
        },
        {
          id: 'output_q',
          type: 'OUTPUT',
          position: { x: 300, y: 150 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        {
          id: 'input_to_d',
          from: { gateId: 'input', pinIndex: -1 },
          to: { gateId: 'dff', pinIndex: 0 }, // D入力
          isActive: false,
        },
        {
          id: 'clock_to_clk',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'dff', pinIndex: 1 }, // CLK入力
          isActive: false,
        },
        {
          id: 'q_to_output',
          from: { gateId: 'dff', pinIndex: -1 },
          to: { gateId: 'output_q', pinIndex: 0 },
          isActive: false,
        },
      ],
    };

    console.log('=== D-FF Clock Edge Test ===');

    // 初期評価（CLOCK=LOW, D=HIGH）
    const result1 = evaluator.evaluate(circuit);
    const dff1 = result1.circuit.gates.find(g => g.id === 'dff')!;
    const output1 = result1.circuit.gates.find(g => g.id === 'output_q')!;
    
    console.log('初期状態 (CLK=LOW):');
    console.log(`  D-FF: output=${dff1.output}, qOutput=${dff1.metadata?.qOutput}, prevClk=${dff1.metadata?.previousClockState}`);
    console.log(`  OUTPUT: ${output1.output}`);
    
    expect(dff1.output).toBe(false); // Q=LOW（まだエッジが来ていない）
    expect(output1.output).toBe(false);

    // クロックをHIGHに（立ち上がりエッジ）
    const clockGate = result1.circuit.gates.find(g => g.id === 'clock')!;
    clockGate.output = true;

    const result2 = evaluator.evaluate(result1.circuit);
    const dff2 = result2.circuit.gates.find(g => g.id === 'dff')!;
    const output2 = result2.circuit.gates.find(g => g.id === 'output_q')!;
    
    console.log('立ち上がりエッジ後 (CLK=HIGH):');
    console.log(`  D-FF: output=${dff2.output}, qOutput=${dff2.metadata?.qOutput}, prevClk=${dff2.metadata?.previousClockState}`);
    console.log(`  OUTPUT: ${output2.output}`);
    
    expect(dff2.output).toBe(true); // Q=HIGH（D入力がラッチされた）
    expect(output2.output).toBe(true);
    expect(dff2.metadata?.qOutput).toBe(true);
    expect(dff2.metadata?.previousClockState).toBe(true); // エッジ検出後にpreviousClockStateが更新される

    // クロックをLOWに（立ち下がりエッジ）
    const clockGate2 = result2.circuit.gates.find(g => g.id === 'clock')!;
    clockGate2.output = false;

    const result3 = evaluator.evaluate(result2.circuit);
    const dff3 = result3.circuit.gates.find(g => g.id === 'dff')!;
    const output3 = result3.circuit.gates.find(g => g.id === 'output_q')!;
    
    console.log('立ち下がりエッジ後 (CLK=LOW):');
    console.log(`  D-FF: output=${dff3.output}, qOutput=${dff3.metadata?.qOutput}, prevClk=${dff3.metadata?.previousClockState}`);
    console.log(`  OUTPUT: ${output3.output}`);
    
    expect(dff3.output).toBe(true); // Q=HIGH（状態保持）
    expect(output3.output).toBe(true);
    expect(dff3.metadata?.previousClockState).toBe(false); // previousClockStateが更新される
  });

  it('フィボナッチカウンター簡略版テスト', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });

    // 簡略版フィボナッチ（A=1, B=1 -> A=1, B=2）
    const circuit: Circuit = {
      gates: [
        {
          id: 'clock',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          output: false,
          inputs: [],
          metadata: { frequency: 1, isRunning: true, startTime: Date.now() },
        },
        // レジスタA (reg_a_0)
        {
          id: 'reg_a_0',
          type: 'D-FF',
          position: { x: 200, y: 100 },
          output: true, // 初期値 A=1
          inputs: ['', ''],
          metadata: { qOutput: true, previousClockState: false },
        },
        // レジスタB (reg_b_0)
        {
          id: 'reg_b_0',
          type: 'D-FF',
          position: { x: 200, y: 200 },
          output: true, // 初期値 B=1
          inputs: ['', ''],
          metadata: { qOutput: true, previousClockState: false },
        },
        // A+Bの加算器（XOR for simple addition）
        {
          id: 'add_ab',
          type: 'XOR',
          position: { x: 300, y: 150 },
          output: false,
          inputs: ['', ''],
        },
        // 出力
        {
          id: 'out_a',
          type: 'OUTPUT',
          position: { x: 400, y: 100 },
          output: false,
          inputs: [''],
        },
        {
          id: 'out_b',
          type: 'OUTPUT',
          position: { x: 400, y: 200 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        // クロック分配
        {
          id: 'clk_a',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'reg_a_0', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'clk_b',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'reg_b_0', pinIndex: 1 },
          isActive: false,
        },
        // フィボナッチロジック: A = B
        {
          id: 'b_to_a',
          from: { gateId: 'reg_b_0', pinIndex: -1 },
          to: { gateId: 'reg_a_0', pinIndex: 0 },
          isActive: false,
        },
        // 加算器入力
        {
          id: 'a_to_add',
          from: { gateId: 'reg_a_0', pinIndex: -1 },
          to: { gateId: 'add_ab', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'b_to_add',
          from: { gateId: 'reg_b_0', pinIndex: -1 },
          to: { gateId: 'add_ab', pinIndex: 1 },
          isActive: false,
        },
        // B = A + B
        {
          id: 'add_to_b',
          from: { gateId: 'add_ab', pinIndex: -1 },
          to: { gateId: 'reg_b_0', pinIndex: 0 },
          isActive: false,
        },
        // 出力
        {
          id: 'a_to_out',
          from: { gateId: 'reg_a_0', pinIndex: -1 },
          to: { gateId: 'out_a', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'b_to_out',
          from: { gateId: 'reg_b_0', pinIndex: -1 },
          to: { gateId: 'out_b', pinIndex: 0 },
          isActive: false,
        },
      ],
    };

    console.log('\n=== フィボナッチ簡略版テスト ===');

    // 初期評価
    const result1 = evaluator.evaluate(circuit);
    let regA = result1.circuit.gates.find(g => g.id === 'reg_a_0')!;
    let regB = result1.circuit.gates.find(g => g.id === 'reg_b_0')!;
    let outA = result1.circuit.gates.find(g => g.id === 'out_a')!;
    let outB = result1.circuit.gates.find(g => g.id === 'out_b')!;
    
    console.log('初期状態:');
    console.log(`  A: ${regA.output} (${regA.metadata?.qOutput}), B: ${regB.output} (${regB.metadata?.qOutput})`);
    console.log(`  OUT: A=${outA.output}, B=${outB.output}`);

    // クロックエッジ1
    const clock1 = result1.circuit.gates.find(g => g.id === 'clock')!;
    clock1.output = true;

    const result2 = evaluator.evaluate(result1.circuit);
    regA = result2.circuit.gates.find(g => g.id === 'reg_a_0')!;
    regB = result2.circuit.gates.find(g => g.id === 'reg_b_0')!;
    outA = result2.circuit.gates.find(g => g.id === 'out_a')!;
    outB = result2.circuit.gates.find(g => g.id === 'out_b')!;
    
    console.log('クロックエッジ1後:');
    console.log(`  A: ${regA.output} (${regA.metadata?.qOutput}), B: ${regB.output} (${regB.metadata?.qOutput})`);
    console.log(`  OUT: A=${outA.output}, B=${outB.output}`);
    
    // 期待値: A=1 (Bから), B=0 (A XOR B = 1 XOR 1 = 0)
    // しかし、これは1ビットのみなので実際のフィボナッチとは異なる
  });
});