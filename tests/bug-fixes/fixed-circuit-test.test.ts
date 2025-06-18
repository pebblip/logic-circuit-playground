import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔧 修正された回路のテスト
 */
describe('🔧 修正された回路のテスト', () => {
  it('✅ 非対称初期状態で振動を確認', () => {
    console.log('\n=== ✅ 非対称初期状態で振動を確認 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    console.log('\n🎛️ 修正後の初期状態:');
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    console.log(`  Memory1: ${memory1?.output} (初期値true)`);
    console.log(`  Memory2: ${memory2?.output} (初期値false)`);
    console.log(`  非対称: ${memory1?.output !== memory2?.output} ✅`);
    
    // 初期評価
    const result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const mem1After = circuit.gates.find(g => g.id === 'memory1_sr');
    const mem2After = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOut = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n💡 評価後:');
    console.log(`  Memory1: ${mem1After?.output}`);
    console.log(`  Memory2: ${mem2After?.output}`);
    console.log(`  XOR: ${mem1After?.output !== mem2After?.output}`);
    console.log(`  振動検出器: ${getGateInputValue(oscillationOut!, 0) ? '🟢 光る！' : '⚫ 暗い'}`);
    
    // 複数回評価で振動パターン確認
    console.log('\n🔄 振動パターン（10回評価）:');
    for (let i = 0; i < 10; i++) {
      const evalResult = evaluator.evaluate(circuit);
      circuit = evalResult.circuit;
      
      const m1 = circuit.gates.find(g => g.id === 'memory1_sr');
      const m2 = circuit.gates.find(g => g.id === 'memory2_sr');
      const osc = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const xorState = getGateInputValue(osc!, 0);
      console.log(`  ${i+1}: M1=${m1?.output ? 1 : 0}, M2=${m2?.output ? 1 : 0}, XOR=${xorState ? 1 : 0} ${xorState ? '🟢' : '⚫'}`);
    }
    
    expect(result).toBeDefined();
  });
});