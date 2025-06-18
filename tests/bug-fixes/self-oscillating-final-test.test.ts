import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🌀 セルフオシレーティングメモリ最終版のテスト
 */
describe('🌀 セルフオシレーティングメモリ最終版 - 完璧な振動テスト', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'EVENT_DRIVEN_ONLY',
    enableDebugLogging: false,
  });

  it('✅ 基本動作：トリガーで振動開始', () => {
    console.log('\n=== ✅ 基本動作：トリガーで振動開始 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_FINAL.gates],
      wires: [...SELF_OSCILLATING_MEMORY_FINAL.wires],
    };
    
    // 初期状態
    console.log('\n📌 初期状態（Enable=ON, Trigger=OFF）:');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let nor1 = circuit.gates.find(g => g.id === 'nor1');
    let nor2 = circuit.gates.find(g => g.id === 'nor2');
    let xorOut = circuit.gates.find(g => g.id === 'out_xor');
    
    console.log(`  NOR1=${nor1?.output ? 1 : 0}, NOR2=${nor2?.output ? 1 : 0}`);
    console.log(`  XOR=${getGateInputValue(xorOut!, 0) ? '🟢' : '⚫'}`);
    
    // トリガーON
    console.log('\n🚀 トリガーON:');
    const trigger = circuit.gates.find(g => g.id === 'trigger');
    if (trigger) trigger.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    // トリガーOFF
    console.log('\n🚀 トリガーOFF:');
    const trigger2 = circuit.gates.find(g => g.id === 'trigger');
    if (trigger2) trigger2.output = false;
    
    // 振動パターン観察
    console.log('\n🔄 振動パターン（30サイクル）:');
    const patterns: string[] = [];
    let xorTransitions = 0;
    let lastXor = -1;
    
    for (let i = 0; i < 30; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      nor1 = circuit.gates.find(g => g.id === 'nor1');
      nor2 = circuit.gates.find(g => g.id === 'nor2');
      xorOut = circuit.gates.find(g => g.id === 'out_xor');
      
      const xorValue = getGateInputValue(xorOut!, 0) ? 1 : 0;
      const pattern = `NOR1:${nor1?.output ? 1 : 0} NOR2:${nor2?.output ? 1 : 0} XOR:${xorValue}`;
      patterns.push(pattern);
      
      if (lastXor !== -1 && xorValue !== lastXor) {
        xorTransitions++;
      }
      lastXor = xorValue;
      
      if (i < 10 || i >= 20) { // 最初と最後を表示
        console.log(`  ${String(i+1).padStart(2)}: ${pattern} ${xorValue ? '🟢' : '⚫'}`);
      } else if (i === 10) {
        console.log('  ...');
      }
    }
    
    // 振動分析
    console.log('\n📊 振動分析:');
    const uniquePatterns = new Set(patterns);
    console.log(`  ユニークパターン数: ${uniquePatterns.size}`);
    console.log(`  XOR遷移回数: ${xorTransitions}`);
    console.log(`  判定: ${xorTransitions >= 5 ? '✅ 真の振動！' : '❌ 振動不足'}`);
    
    expect(xorTransitions).toBeGreaterThanOrEqual(5);
  });

  it('🎯 詳細分析：非対称遅延による振動メカニズム', () => {
    console.log('\n=== 🎯 詳細分析：非対称遅延による振動メカニズム ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_FINAL.gates],
      wires: [...SELF_OSCILLATING_MEMORY_FINAL.wires],
    };
    
    // トリガーで開始
    const trigger = circuit.gates.find(g => g.id === 'trigger');
    if (trigger) trigger.output = true;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const trigger2 = circuit.gates.find(g => g.id === 'trigger');
    if (trigger2) trigger2.output = false;
    
    console.log('\n🔍 内部状態詳細（15サイクル）:');
    
    for (let i = 0; i < 15; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const nor1 = circuit.gates.find(g => g.id === 'nor1');
      const nor2 = circuit.gates.find(g => g.id === 'nor2');
      const d1_3 = circuit.gates.find(g => g.id === 'delay1_3');
      const d2_5 = circuit.gates.find(g => g.id === 'delay2_5');
      const fb1 = circuit.gates.find(g => g.id === 'fb_and1');
      const fb2 = circuit.gates.find(g => g.id === 'fb_and2');
      const mem1 = circuit.gates.find(g => g.id === 'memory1');
      const mem2 = circuit.gates.find(g => g.id === 'memory2');
      
      if (i % 3 === 0) { // 3サイクルごとに表示
        console.log(`\n  サイクル ${i+1}:`);
        console.log(`    NOR1=${nor1?.output ? 1 : 0}, Delay1=${d1_3?.output ? 1 : 0}, FB1=${fb1?.output ? 1 : 0}`);
        console.log(`    NOR2=${nor2?.output ? 1 : 0}, Delay2=${d2_5?.output ? 1 : 0}, FB2=${fb2?.output ? 1 : 0}`);
        console.log(`    Memory1=${mem1?.output ? 1 : 0}, Memory2=${mem2?.output ? 1 : 0}`);
        console.log(`    非対称: ${nor1?.output !== nor2?.output ? '✅' : '❌'}`);
      }
    }
    
    expect(result).toBeDefined();
  });

  it('⏹️ Enable制御で振動停止', () => {
    console.log('\n=== ⏹️ Enable制御で振動停止 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_FINAL.gates],
      wires: [...SELF_OSCILLATING_MEMORY_FINAL.wires],
    };
    
    // 振動開始
    const trigger = circuit.gates.find(g => g.id === 'trigger');
    if (trigger) trigger.output = true;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const trigger2 = circuit.gates.find(g => g.id === 'trigger');
    if (trigger2) trigger2.output = false;
    
    // 振動確認
    console.log('\n🔄 振動中（Enable=ON）:');
    let transitions = 0;
    let lastNor1 = -1;
    
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const nor1 = circuit.gates.find(g => g.id === 'nor1');
      const currentNor1 = nor1?.output ? 1 : 0;
      
      if (lastNor1 !== -1 && currentNor1 !== lastNor1) {
        transitions++;
      }
      lastNor1 = currentNor1;
    }
    
    console.log(`  NOR1遷移回数: ${transitions}`);
    
    // Enable OFF
    console.log('\n⏹️ Enable → OFF:');
    const enable = circuit.gates.find(g => g.id === 'enable');
    if (enable) enable.output = false;
    
    // 停止確認
    transitions = 0;
    lastNor1 = -1;
    
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const nor1 = circuit.gates.find(g => g.id === 'nor1');
      const currentNor1 = nor1?.output ? 1 : 0;
      
      if (lastNor1 !== -1 && currentNor1 !== lastNor1) {
        transitions++;
      }
      lastNor1 = currentNor1;
    }
    
    console.log(`  停止後の遷移: ${transitions}`);
    console.log(`  判定: ${transitions <= 2 ? '✅ 振動停止' : '❌ まだ振動中'}`);
    
    expect(transitions).toBeLessThanOrEqual(2);
  });

  it('🏆 最終確認：完璧なセルフオシレーティングメモリ', () => {
    console.log('\n=== 🏆 最終確認：完璧なセルフオシレーティングメモリ ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_FINAL.gates],
      wires: [...SELF_OSCILLATING_MEMORY_FINAL.wires],
    };
    
    console.log('\n👤 ユーザー操作シナリオ:');
    console.log('  1. 初期状態（Enable=ON, Trigger=OFF）');
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let xorOut = circuit.gates.find(g => g.id === 'out_xor');
    console.log(`     XOR: ${getGateInputValue(xorOut!, 0) ? '🟢' : '⚫'}`);
    
    console.log('\n  2. Triggerボタンを押す → 離す');
    const trigger = circuit.gates.find(g => g.id === 'trigger');
    if (trigger) trigger.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const trigger2 = circuit.gates.find(g => g.id === 'trigger');
    if (trigger2) trigger2.output = false;
    
    console.log('\n  3. 振動を観察（100サイクル）:');
    
    let xorHighCount = 0;
    let xorLowCount = 0;
    let xorTransitions = 0;
    let lastXor = -1;
    
    for (let i = 0; i < 100; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      xorOut = circuit.gates.find(g => g.id === 'out_xor');
      const xorValue = getGateInputValue(xorOut!, 0) ? 1 : 0;
      
      if (xorValue) {
        xorHighCount++;
      } else {
        xorLowCount++;
      }
      
      if (lastXor !== -1 && xorValue !== lastXor) {
        xorTransitions++;
      }
      lastXor = xorValue;
      
      if (i < 5 || (i >= 95 && i < 100)) {
        console.log(`     ${String(i+1).padStart(3)}: XOR=${xorValue} ${xorValue ? '🟢' : '⚫'}`);
      } else if (i === 5) {
        console.log('     ...');
      }
    }
    
    console.log('\n📊 最終結果:');
    console.log(`  XOR HIGH回数: ${xorHighCount}`);
    console.log(`  XOR LOW回数: ${xorLowCount}`);
    console.log(`  XOR遷移回数: ${xorTransitions}`);
    
    const dutyCycle = Math.round(xorHighCount / 100 * 100);
    console.log(`  デューティサイクル: ${dutyCycle}%`);
    
    const frequency = xorTransitions / 2; // 完全な周期数
    console.log(`  振動周波数: ${frequency} cycles/100steps`);
    
    const isOscillating = xorTransitions >= 10 && xorHighCount > 20 && xorLowCount > 20;
    console.log(`\n🏆 最終判定: ${isOscillating ? '✅ 完璧なセルフオシレーティングメモリ！' : '❌ 振動不足'}`);
    
    expect(xorTransitions).toBeGreaterThanOrEqual(10);
    expect(xorHighCount).toBeGreaterThan(20);
    expect(xorLowCount).toBeGreaterThan(20);
  });
});