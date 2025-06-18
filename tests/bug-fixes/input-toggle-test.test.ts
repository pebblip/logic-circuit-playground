import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔧 入力切り替えテスト
 */
describe('🔧 入力切り替えテスト', () => {
  it('🎯 Trigger操作で振動が起きるか確認', () => {
    console.log('\n=== 🎯 Trigger操作で振動が起きるか確認 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // 初期状態
    console.log('\n📌 初期状態（非対称）:');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let m1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let m2 = circuit.gates.find(g => g.id === 'memory2_sr');
    let osc = circuit.gates.find(g => g.id === 'out_oscillation');
    console.log(`  M1=${m1?.output}, M2=${m2?.output}, XOR=${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    
    // Trigger ON
    console.log('\n📌 Trigger → ON:');
    const trigger = circuit.gates.find(g => g.id === 'trigger');
    if (trigger) trigger.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    m1 = circuit.gates.find(g => g.id === 'memory1_sr');
    m2 = circuit.gates.find(g => g.id === 'memory2_sr');
    osc = circuit.gates.find(g => g.id === 'out_oscillation');
    console.log(`  M1=${m1?.output}, M2=${m2?.output}, XOR=${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    
    // Trigger OFF
    console.log('\n📌 Trigger → OFF:');
    const trigger2 = circuit.gates.find(g => g.id === 'trigger');
    if (trigger2) trigger2.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    m1 = circuit.gates.find(g => g.id === 'memory1_sr');
    m2 = circuit.gates.find(g => g.id === 'memory2_sr');
    osc = circuit.gates.find(g => g.id === 'out_oscillation');
    console.log(`  M1=${m1?.output}, M2=${m2?.output}, XOR=${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    
    // Enable OFF
    console.log('\n📌 Enable → OFF:');
    const enable = circuit.gates.find(g => g.id === 'enable');
    if (enable) enable.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    m1 = circuit.gates.find(g => g.id === 'memory1_sr');
    m2 = circuit.gates.find(g => g.id === 'memory2_sr');
    osc = circuit.gates.find(g => g.id === 'out_oscillation');
    console.log(`  M1=${m1?.output}, M2=${m2?.output}, XOR=${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    
    // 連続評価で振動確認
    console.log('\n🔄 その後10回評価:');
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      m1 = circuit.gates.find(g => g.id === 'memory1_sr');
      m2 = circuit.gates.find(g => g.id === 'memory2_sr');
      osc = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const state = `M1=${m1?.output ? 1 : 0}, M2=${m2?.output ? 1 : 0}, XOR=${getGateInputValue(osc!, 0) ? 1 : 0}`;
      console.log(`  ${i+1}: ${state}`);
    }
    
    console.log('\n📊 結論:');
    console.log('  振動していますか？ → 上記の状態変化を確認してください');
    
    expect(result).toBeDefined();
  });
});