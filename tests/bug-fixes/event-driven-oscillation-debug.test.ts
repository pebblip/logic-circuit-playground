import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 イベント駆動での発振機能デバッグ
 */
describe('🔍 イベント駆動発振機能デバッグ', () => {
  it('⚡ イベント駆動エンジンの発振設定確認', () => {
    console.log('\n=== ⚡ イベント駆動エンジンの発振設定確認 ===');
    
    // 発振継続を有効にした評価器
    const evaluatorWithOscillation = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY', // 強制的にイベント駆動
      enableDebugLogging: true,
    });
    
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // Enable=true で発振を誘発
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) enableGate.output = true;
    
    console.log('\n🔄 イベント駆動評価実行（発振継続有効）:');
    
    const result = evaluatorWithOscillation.evaluate(circuit);
    
    console.log(`  成功: ${result.evaluationInfo.strategyUsed}`);
    console.log(`  実行時間: ${result.evaluationInfo.executionTimeMs.toFixed(2)}ms`);
    console.log(`  循環依存: ${result.evaluationInfo.hasCircularDependency}`);
    console.log(`  ゲート数: ${result.evaluationInfo.gateCount}`);
    console.log(`  推奨: ${result.evaluationInfo.recommendation}`);
    console.log(`  警告: ${result.warnings}`);
    
    const memory1 = result.circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = result.circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = result.circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📊 発振結果:');
    console.log(`  Memory1 Q: ${memory1?.output}`);
    console.log(`  Memory2 Q: ${memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    expect(result).toBeDefined();
  });

  it('🎯 発振を開始させる初期条件の作成', () => {
    console.log('\n=== 🎯 発振開始条件の調査 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    console.log('\n🔧 実験1: 微小な非対称性を導入');
    
    // Memory1を僅かに異なる初期状態にする
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    if (memory1 && memory2) {
      // 初期状態を僅かに変える
      memory1.output = true;
      memory1.outputs = [true, false];
      memory1.metadata = { ...memory1.metadata, qOutput: true };
      
      memory2.output = false; 
      memory2.outputs = [false, true];
      memory2.metadata = { ...memory2.metadata, qOutput: false };
      
      console.log('  Memory1 初期化: Q=true');
      console.log('  Memory2 初期化: Q=false');
    }
    
    // Enable=true で評価
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) enableGate.output = true;
    
    const result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1_after = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2_after = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📊 非対称初期化後の結果:');
    console.log(`  Memory1 Q: ${memory1_after?.output}`);
    console.log(`  Memory2 Q: ${memory2_after?.output}`);
    console.log(`  XOR結果: ${memory1_after?.output !== memory2_after?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    expect(result).toBeDefined();
  });

  it('🔄 連続評価での発振確認', () => {
    console.log('\n=== 🔄 連続評価での発振パターン確認 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // 非対称初期化
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    if (memory1 && memory2) {
      memory1.output = true;
      memory1.outputs = [true, false];
      memory2.output = false;
      memory2.outputs = [false, true];
    }
    
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) enableGate.output = true;
    
    console.log('\n🔄 10回連続評価で発振パターン確認:');
    
    const oscillationStates: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const mem1 = circuit.gates.find(g => g.id === 'memory1_sr');
      const mem2 = circuit.gates.find(g => g.id === 'memory2_sr');
      const oscOut = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const state = `M1:${mem1?.output ? 1 : 0},M2:${mem2?.output ? 1 : 0},OSC:${getGateInputValue(oscOut!, 0) ? 1 : 0}`;
      oscillationStates.push(state);
      
      console.log(`  評価${i+1}: ${state}`);
    }
    
    // 発振パターンの検出
    const uniqueStates = new Set(oscillationStates);
    console.log(`\n📈 発振解析:`);
    console.log(`  ユニーク状態数: ${uniqueStates.size}`);
    console.log(`  状態リスト: ${Array.from(uniqueStates).join(', ')}`);
    
    if (uniqueStates.size > 1) {
      console.log('✅ 発振が検出されました！');
      
      // out_oscillationが光っているかチェック
      const hasOscillationOutput = oscillationStates.some(state => state.includes('OSC:1'));
      if (hasOscillationOutput) {
        console.log('🎯 out_oscillation が光る状態を確認！');
      }
    } else {
      console.log('❌ 発振が検出されませんでした');
    }
    
    expect(oscillationStates.length).toBe(10);
  });

  it('💡 実用的な発振開始手順', () => {
    console.log('\n=== 💡 実用的な発振開始手順 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'EVENT_DRIVEN_ONLY',
      enableDebugLogging: false,
    });
    
    console.log('\n🎯 手順1: リセット状態を作る');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // 全てをfalseでスタート
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = false;
    if (triggerGate) triggerGate.output = false;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('  初期リセット完了');
    
    console.log('\n🎯 手順2: 一方のメモリだけを起動');
    
    // Enableだけをtrueにしてメモリ1を起動
    const enableGate2 = circuit.gates.find(g => g.id === 'enable');
    if (enableGate2) enableGate2.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log(`  Enable=true: Memory1=${memory1?.output}, Memory2=${memory2?.output}`);
    
    console.log('\n🎯 手順3: Triggerで非対称状態を作る');
    
    // Triggerを短時間onにしてメモリ2だけリセット
    const triggerGate2 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate2) triggerGate2.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log(`  Trigger=true: Memory1=${memory1?.output}, Memory2=${memory2?.output}`);
    
    // Triggerを戻す
    const triggerGate3 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate3) triggerGate3.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n🎯 手順4: 発振確認');
    console.log(`  最終: Memory1=${memory1?.output}, Memory2=${memory2?.output}`);
    console.log(`  XOR: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    if (getGateInputValue(oscillationOutput!, 0)) {
      console.log('\n✅ 成功！実用的手順で発振を開始できました！');
      console.log('🎯 ユーザー操作手順:');
      console.log('  1. 初期状態（両方false）');
      console.log('  2. Enable = true');
      console.log('  3. Trigger = true');
      console.log('  4. Trigger = false');
      console.log('  → out_oscillation が光る');
    }
    
    expect(result).toBeDefined();
  });
});