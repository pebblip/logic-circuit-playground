import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY_V3 } from '@/features/gallery/data/self-oscillating-memory-v3';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🌀 セルフオシレーティングメモリ V3（リングオシレーター版）のテスト
 */
describe('🌀 セルフオシレーティングメモリ V3 完全テスト', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'EVENT_DRIVEN_ONLY',
    enableDebugLogging: false,
  });

  it('✅ リングオシレーターの基本動作確認', () => {
    console.log('\n=== ✅ リングオシレーターの基本動作確認 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V3.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V3.wires],
    };
    
    console.log('\n🔄 リングオシレーター動作（20サイクル）:');
    const oscStates: number[] = [];
    
    for (let i = 0; i < 20; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const ring2 = circuit.gates.find(g => g.id === 'ring_not2');
      const oscOut = circuit.gates.find(g => g.id === 'out_osc');
      
      const oscValue = getGateInputValue(oscOut!, 0) ? 1 : 0;
      oscStates.push(oscValue);
      
      console.log(`  ${String(i+1).padStart(2)}: Ring=${ring2?.output ? 1 : 0} → OSC=${oscValue} ${oscValue ? '🟢' : '⚫'}`);
    }
    
    // 振動確認
    let transitions = 0;
    for (let i = 1; i < oscStates.length; i++) {
      if (oscStates[i] !== oscStates[i-1]) {
        transitions++;
      }
    }
    
    console.log('\n📊 リングオシレーター分析:');
    console.log(`  状態遷移回数: ${transitions}`);
    console.log(`  判定: ${transitions >= 10 ? '✅ 高速振動中！' : '❌ 振動不足'}`);
    
    expect(transitions).toBeGreaterThanOrEqual(10);
  });

  it('🎯 メモリ振動とXOR検出', () => {
    console.log('\n=== 🎯 メモリ振動とXOR検出 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V3.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V3.wires],
    };
    
    console.log('\n🔄 メモリとXOR状態（30サイクル）:');
    const xorStates: number[] = [];
    let xorTransitions = 0;
    let lastXor = -1;
    
    for (let i = 0; i < 30; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const mem1 = circuit.gates.find(g => g.id === 'memory1');
      const mem2 = circuit.gates.find(g => g.id === 'memory2');
      const xorOut = circuit.gates.find(g => g.id === 'out_xor');
      
      const xorValue = getGateInputValue(xorOut!, 0) ? 1 : 0;
      xorStates.push(xorValue);
      
      if (lastXor !== -1 && xorValue !== lastXor) {
        xorTransitions++;
      }
      lastXor = xorValue;
      
      if (i % 5 === 0) { // 5サイクルごとに表示
        console.log(`  ${String(i+1).padStart(2)}: M1=${mem1?.output ? 1 : 0} M2=${mem2?.output ? 1 : 0} XOR=${xorValue} ${xorValue ? '🟢' : '⚫'}`);
      }
    }
    
    console.log('\n📊 メモリ振動分析:');
    console.log(`  XOR状態遷移回数: ${xorTransitions}`);
    console.log(`  判定: ${xorTransitions >= 2 ? '✅ メモリ振動検出！' : '❌ 振動不足'}`);
    
    expect(xorTransitions).toBeGreaterThanOrEqual(2);
  });

  it('⏹️ Enable制御テスト', () => {
    console.log('\n=== ⏹️ Enable制御テスト ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V3.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V3.wires],
    };
    
    // 10サイクル振動させる
    console.log('\n🔄 振動中（Enable=ON）:');
    let oscCount = 0;
    let lastOsc = -1;
    
    for (let i = 0; i < 10; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const oscOut = circuit.gates.find(g => g.id === 'out_osc');
      const oscValue = getGateInputValue(oscOut!, 0) ? 1 : 0;
      
      if (lastOsc !== -1 && oscValue !== lastOsc) {
        oscCount++;
      }
      lastOsc = oscValue;
    }
    
    console.log(`  振動回数: ${oscCount}`);
    
    // Enable OFF
    console.log('\n⏹️ 振動停止（Enable → OFF）:');
    const enable = circuit.gates.find(g => g.id === 'enable');
    if (enable) enable.output = false;
    
    // 停止確認
    let stopCount = 0;
    lastOsc = -1;
    
    for (let i = 0; i < 10; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const oscOut = circuit.gates.find(g => g.id === 'out_osc');
      const oscValue = getGateInputValue(oscOut!, 0) ? 1 : 0;
      
      if (lastOsc !== -1 && oscValue !== lastOsc) {
        stopCount++;
      }
      lastOsc = oscValue;
    }
    
    console.log(`  停止後の振動: ${stopCount}`);
    console.log(`  判定: ${stopCount <= 1 ? '✅ 振動停止成功' : '❌ まだ振動中'}`);
    
    expect(stopCount).toBeLessThanOrEqual(1);
  });

  it('🎯 最終確認：真のセルフオシレーティングメモリ', () => {
    console.log('\n=== 🎯 最終確認：真のセルフオシレーティングメモリ ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V3.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V3.wires],
    };
    
    console.log('\n📌 初期状態（Enable=ON）:');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('\n🌀 50サイクル実行して振動パターン確認:');
    
    let xorHighCount = 0;
    let xorLowCount = 0;
    let xorTransitions = 0;
    let lastXor = -1;
    
    for (let i = 0; i < 50; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const xorOut = circuit.gates.find(g => g.id === 'out_xor');
      const xorValue = getGateInputValue(xorOut!, 0);
      
      if (xorValue) {
        xorHighCount++;
      } else {
        xorLowCount++;
      }
      
      if (lastXor !== -1 && xorValue !== lastXor) {
        xorTransitions++;
      }
      lastXor = xorValue ? 1 : 0;
      
      if (i % 10 === 0 || i === 49) {
        const mem1 = circuit.gates.find(g => g.id === 'memory1');
        const mem2 = circuit.gates.find(g => g.id === 'memory2');
        console.log(`  サイクル${String(i+1).padStart(2)}: M1=${mem1?.output ? 1 : 0} M2=${mem2?.output ? 1 : 0} XOR=${xorValue ? '🟢' : '⚫'}`);
      }
    }
    
    console.log('\n📊 最終結果:');
    console.log(`  XOR HIGH回数: ${xorHighCount}`);
    console.log(`  XOR LOW回数: ${xorLowCount}`);
    console.log(`  XOR遷移回数: ${xorTransitions}`);
    console.log(`  振動周期: 約${xorTransitions > 0 ? Math.round(50 / xorTransitions * 2) : '?'}サイクル`);
    
    const isOscillating = xorTransitions >= 5 && xorHighCount > 0 && xorLowCount > 0;
    console.log(`\n🎯 判定: ${isOscillating ? '✅ 真のセルフオシレーティングメモリ完成！' : '❌ 振動不足'}`);
    
    expect(xorTransitions).toBeGreaterThanOrEqual(5);
    expect(xorHighCount).toBeGreaterThan(0);
    expect(xorLowCount).toBeGreaterThan(0);
  });
});