import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/domain/simulation/core/types';

describe('Fibonacci Bit2 Debug Test', () => {
  it('bit2のD-FFが正しく動作するかテスト', () => {
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });

    // 簡単なbit2テスト回路
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
        {
          id: 'input_high',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          output: true, // 常にHIGH
          inputs: [],
        },
        {
          id: 'reg_a_2',
          type: 'D-FF',
          position: { x: 450, y: 150 },
          output: false,
          inputs: ['', ''],
          metadata: { qOutput: false, previousClockState: false },
        },
        {
          id: 'reg_b_2',
          type: 'D-FF',
          position: { x: 450, y: 300 },
          output: false,
          inputs: ['', ''],
          metadata: { qOutput: false, previousClockState: false },
        },
        {
          id: 'out_a_2',
          type: 'OUTPUT',
          position: { x: 450, y: 50 },
          output: false,
          inputs: [''],
        },
        {
          id: 'out_b_2',
          type: 'OUTPUT',
          position: { x: 450, y: 400 },
          output: false,
          inputs: [''],
        },
      ],
      wires: [
        // クロック接続
        {
          id: 'clk_a2',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'reg_a_2', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'clk_b2',
          from: { gateId: 'clock', pinIndex: -1 },
          to: { gateId: 'reg_b_2', pinIndex: 1 },
          isActive: false,
        },
        // D入力（常にHIGH）
        {
          id: 'input_to_a2',
          from: { gateId: 'input_high', pinIndex: -1 },
          to: { gateId: 'reg_a_2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'input_to_b2',
          from: { gateId: 'input_high', pinIndex: -1 },
          to: { gateId: 'reg_b_2', pinIndex: 0 },
          isActive: false,
        },
        // 出力接続
        {
          id: 'a2_to_out_a2',
          from: { gateId: 'reg_a_2', pinIndex: -1 },
          to: { gateId: 'out_a_2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'b2_to_out_b2',
          from: { gateId: 'reg_b_2', pinIndex: -1 },
          to: { gateId: 'out_b_2', pinIndex: 0 },
          isActive: false,
        },
      ],
    };

    console.log('=== Fibonacci Bit2 Debug Test ===');

    // 初期評価
    const result1 = evaluator.evaluate(circuit);
    let regA2 = result1.circuit.gates.find(g => g.id === 'reg_a_2')!;
    let regB2 = result1.circuit.gates.find(g => g.id === 'reg_b_2')!;
    let outA2 = result1.circuit.gates.find(g => g.id === 'out_a_2')!;
    let outB2 = result1.circuit.gates.find(g => g.id === 'out_b_2')!;
    
    console.log('初期状態:');
    console.log(`  reg_a_2: output=${regA2.output}, qOutput=${regA2.metadata?.qOutput}`);
    console.log(`  reg_b_2: output=${regB2.output}, qOutput=${regB2.metadata?.qOutput}`);
    console.log(`  out_a_2: ${outA2.output}, out_b_2: ${outB2.output}`);

    // クロックエッジ
    const clock = result1.circuit.gates.find(g => g.id === 'clock')!;
    clock.output = true;

    const result2 = evaluator.evaluate(result1.circuit);
    regA2 = result2.circuit.gates.find(g => g.id === 'reg_a_2')!;
    regB2 = result2.circuit.gates.find(g => g.id === 'reg_b_2')!;
    outA2 = result2.circuit.gates.find(g => g.id === 'out_a_2')!;
    outB2 = result2.circuit.gates.find(g => g.id === 'out_b_2')!;
    
    console.log('クロックエッジ後:');
    console.log(`  reg_a_2: output=${regA2.output}, qOutput=${regA2.metadata?.qOutput}`);
    console.log(`  reg_b_2: output=${regB2.output}, qOutput=${regB2.metadata?.qOutput}`);
    console.log(`  out_a_2: ${outA2.output}, out_b_2: ${outB2.output}`);
    
    // D入力がHIGHなので、クロックエッジ後はbit2も光るはず
    expect(regA2.output).toBe(true);
    expect(regB2.output).toBe(true);
    expect(outA2.output).toBe(true);
    expect(outB2.output).toBe(true);
  });
});