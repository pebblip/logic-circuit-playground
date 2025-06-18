import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY_V2 } from '@/features/gallery/data/self-oscillating-memory-v2';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🌀 真のセルフオシレーティングメモリのテスト
 */
describe('🌀 セルフオシレーティングメモリ V2 完全テスト', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'EVENT_DRIVEN_ONLY', // 振動を確実に検出
    enableDebugLogging: false,
  });

  it('✅ 基本動作：振動の開始と継続', () => {
    console.log('\n=== ✅ 基本動作：振動の開始と継続 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V2.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V2.wires],
    };
    
    // 初期状態確認
    console.log('\n📌 初期状態:');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let m1 = circuit.gates.find(g => g.id === 'memory1');
    let m2 = circuit.gates.find(g => g.id === 'memory2');
    let osc = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Enable: ON, Start: OFF`);
    console.log(`  Memory1: ${m1?.output}, Memory2: ${m2?.output}`);
    console.log(`  振動検出: ${getGateInputValue(osc!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // スタートトリガー
    console.log('\n🚀 振動開始（Start → ON）:');
    const start = circuit.gates.find(g => g.id === 'start');
    if (start) start.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    // スタートを戻す
    const start2 = circuit.gates.find(g => g.id === 'start');
    if (start2) start2.output = false;
    
    // 振動パターンを観察
    console.log('\n🔄 振動パターン（20サイクル）:');
    const patterns: string[] = [];
    let xorChanges = 0;
    let lastXor = false;
    
    for (let i = 0; i < 20; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      m1 = circuit.gates.find(g => g.id === 'memory1');
      m2 = circuit.gates.find(g => g.id === 'memory2');
      osc = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const xorValue = getGateInputValue(osc!, 0);
      const pattern = `M1:${m1?.output ? 1 : 0} M2:${m2?.output ? 1 : 0} XOR:${xorValue ? 1 : 0}`;
      patterns.push(pattern);
      
      // XORの変化を数える
      if (i > 0 && xorValue !== lastXor) {
        xorChanges++;
      }
      lastXor = xorValue;
      
      console.log(`  ${String(i+1).padStart(2)}: ${pattern} ${xorValue ? '🟢' : '⚫'}`);
    }
    
    // 振動の分析
    console.log('\n📊 振動分析:');
    const uniquePatterns = new Set(patterns);
    console.log(`  ユニークパターン数: ${uniquePatterns.size}`);
    console.log(`  XOR状態変化回数: ${xorChanges}`);
    console.log(`  振動判定: ${xorChanges >= 2 ? '✅ 振動している！' : '❌ 振動していない'}`);
    
    expect(xorChanges).toBeGreaterThanOrEqual(2);
  });

  it('🎯 制御テスト：Enable OFF で振動停止', () => {
    console.log('\n=== 🎯 制御テスト：Enable OFF で振動停止 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V2.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V2.wires],
    };
    
    // 振動を開始
    const start = circuit.gates.find(g => g.id === 'start');
    if (start) start.output = true;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const start2 = circuit.gates.find(g => g.id === 'start');
    if (start2) start2.output = false;
    
    // 5サイクル振動させる
    console.log('\n🔄 振動中（Enable=ON）:');
    for (let i = 0; i < 5; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const m1 = circuit.gates.find(g => g.id === 'memory1');
      const m2 = circuit.gates.find(g => g.id === 'memory2');
      const osc = circuit.gates.find(g => g.id === 'out_oscillation');
      
      console.log(`  ${i+1}: M1:${m1?.output ? 1 : 0} M2:${m2?.output ? 1 : 0} XOR:${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    }
    
    // Enable OFF
    console.log('\n⏹️ 振動停止（Enable → OFF）:');
    const enable = circuit.gates.find(g => g.id === 'enable');
    if (enable) enable.output = false;
    
    // 停止後の状態
    const stopPatterns: string[] = [];
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const m1 = circuit.gates.find(g => g.id === 'memory1');
      const m2 = circuit.gates.find(g => g.id === 'memory2');
      const osc = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const pattern = `M1:${m1?.output ? 1 : 0} M2:${m2?.output ? 1 : 0}`;
      stopPatterns.push(pattern);
      
      console.log(`  ${i+1}: ${pattern} XOR:${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    }
    
    // 停止確認
    const uniqueStopPatterns = new Set(stopPatterns);
    console.log(`\n📊 停止確認: パターン数=${uniqueStopPatterns.size}`);
    console.log(`  判定: ${uniqueStopPatterns.size <= 2 ? '✅ 振動停止' : '❌ まだ振動中'}`);
    
    expect(uniqueStopPatterns.size).toBeLessThanOrEqual(2);
  });

  it('🔬 詳細分析：遅延差による非対称振動', () => {
    console.log('\n=== 🔬 詳細分析：遅延差による非対称振動 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V2.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V2.wires],
    };
    
    // 振動開始
    const start = circuit.gates.find(g => g.id === 'start');
    if (start) start.output = true;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const start2 = circuit.gates.find(g => g.id === 'start');
    if (start2) start2.output = false;
    
    // 遅延チェーンの状態も含めて観察
    console.log('\n🔍 内部状態詳細（10サイクル）:');
    
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const m1 = circuit.gates.find(g => g.id === 'memory1');
      const m2 = circuit.gates.find(g => g.id === 'memory2');
      const d1_2 = circuit.gates.find(g => g.id === 'delay1_not2');
      const d2_4 = circuit.gates.find(g => g.id === 'delay2_not4');
      const fb1 = circuit.gates.find(g => g.id === 'feedback_and1');
      const fb2 = circuit.gates.find(g => g.id === 'feedback_and2');
      
      console.log(`\n  サイクル ${i+1}:`);
      console.log(`    Memory1=${m1?.output ? 1 : 0}, Delay1=${d1_2?.output ? 1 : 0}, FB1=${fb1?.output ? 1 : 0}`);
      console.log(`    Memory2=${m2?.output ? 1 : 0}, Delay2=${d2_4?.output ? 1 : 0}, FB2=${fb2?.output ? 1 : 0}`);
      console.log(`    位相差: ${m1?.output !== m2?.output ? '✅ あり' : '❌ なし'}`);
    }
    
    expect(result).toBeDefined();
  });

  it('🎯 最終確認：実用的な振動回路として機能', () => {
    console.log('\n=== 🎯 最終確認：実用的な振動回路として機能 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY_V2.gates],
      wires: [...SELF_OSCILLATING_MEMORY_V2.wires],
    };
    
    // ユーザー操作をシミュレート
    console.log('\n👤 ユーザー操作シミュレーション:');
    console.log('  1. 初期状態（Enable=ON, Start=OFF）');
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let osc = circuit.gates.find(g => g.id === 'out_oscillation');
    console.log(`     振動検出: ${getGateInputValue(osc!, 0) ? '🟢' : '⚫'}`);
    
    console.log('\n  2. Startボタンをクリック');
    const start = circuit.gates.find(g => g.id === 'start');
    if (start) start.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('\n  3. Startボタンを離す');
    const start2 = circuit.gates.find(g => g.id === 'start');
    if (start2) start2.output = false;
    
    console.log('\n  4. 振動を観察（1秒相当 = 10サイクル）:');
    
    let oscillationCount = 0;
    let lastState = false;
    
    for (let i = 0; i < 10; i++) {
      result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      osc = circuit.gates.find(g => g.id === 'out_oscillation');
      const currentState = getGateInputValue(osc!, 0);
      
      if (currentState !== lastState) {
        oscillationCount++;
      }
      lastState = currentState;
      
      console.log(`     ${i+1}: 振動検出 ${currentState ? '🟢' : '⚫'}`);
    }
    
    console.log('\n📊 結果:');
    console.log(`  振動回数: ${oscillationCount}回`);
    console.log(`  判定: ${oscillationCount >= 2 ? '✅ セルフオシレーティング成功！' : '❌ 振動不足'}`);
    
    expect(oscillationCount).toBeGreaterThanOrEqual(2);
  });
});