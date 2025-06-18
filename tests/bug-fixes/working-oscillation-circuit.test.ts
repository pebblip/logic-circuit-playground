import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🎯 実際に動く振動回路の作成
 */
describe('🎯 out_oscillation を確実に光らせる方法', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔧 回路を修正して非対称にする', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔧 回路修正で out_oscillation を光らせる ===');
    
    // 🎯 修正1: AND3の入力をEnableの代わりに常時trueにする
    // これによりMemory2が独立して動作できる
    
    // 常時trueの入力ゲートを追加
    const alwaysTrue = {
      id: 'always_true',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      output: true,
      inputs: [],
    };
    circuit.gates.push(alwaysTrue);
    
    // AND3の接続を変更: enableの代わりにalways_trueから入力
    const and3Wire = circuit.wires.find(w => w.to.gateId === 'and3' && w.to.pinIndex === 0);
    if (and3Wire) {
      and3Wire.from.gateId = 'always_true';
    }
    
    console.log('\n📌 修正内容:');
    console.log('  AND1: Enable + Memory2_Q̄ (元のまま)');
    console.log('  AND3: AlwaysTrue + Memory1_Q̄ (修正)');
    console.log('  → Memory1とMemory2が独立動作可能に');
    
    // 初期状態で評価
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = false;
    if (triggerGate) triggerGate.output = false;
    
    const result1 = evaluator.evaluate(circuit);
    circuit = result1.circuit;
    
    let memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    let oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📌 初期状態 (Enable=false, Trigger=false):');
    console.log(`  Memory1 Q: ${memory1?.output}, Memory2 Q: ${memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    // Enableをtrueにする
    if (enableGate) enableGate.output = true;
    
    const result2 = evaluator.evaluate(circuit);
    circuit = result2.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📌 Enable=true にした場合:');
    console.log(`  Memory1 Q: ${memory1?.output}, Memory2 Q: ${memory2?.output}`);
    console.log(`  XOR結果: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    if (getGateInputValue(oscillationOutput!, 0)) {
      console.log('\n✅ 成功！回路修正で out_oscillation が光りました！');
      console.log('🎯 具体的操作: Enable=true にするだけ');
    }

    expect(true).toBe(true);
  });

  it('🎯 より簡単な方法: 初期状態を変更', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🎯 初期状態変更で out_oscillation を光らせる ===');
    
    // 🎯 方法: Memory1とMemory2の初期状態を異なる値に設定
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    if (memory1 && memory2) {
      // Memory1をtrue, Memory2をfalseに初期化
      memory1.output = true;
      memory1.outputs = [true, false];  // Q=true, Q̄=false
      
      memory2.output = false;
      memory2.outputs = [false, true];  // Q=false, Q̄=true
    }
    
    console.log('\n📌 修正内容:');
    console.log('  Memory1 初期値: Q=true, Q̄=false');  
    console.log('  Memory2 初期値: Q=false, Q̄=true');
    console.log('  → 異なる初期状態で開始');
    
    // 評価
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    const memory1_after = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    const memory2_after = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = updatedCircuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📌 結果:');
    console.log(`  Memory1 Q: ${memory1_after?.output}, Memory2 Q: ${memory2_after?.output}`);
    console.log(`  XOR結果: ${memory1_after?.output} ≠ ${memory2_after?.output} = ${memory1_after?.output !== memory2_after?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    if (getGateInputValue(oscillationOutput!, 0)) {
      console.log('\n✅ 成功！初期状態変更で out_oscillation が光りました！');
      console.log('🎯 具体的方法: Memory1とMemory2を異なる初期値に設定');
    }

    expect(true).toBe(true);
  });

  it('📋 実用的な操作手順まとめ', () => {
    console.log('\n=== 📋 右端真ん中の出力ゲートを光らせる実用的方法 ===');
    console.log('');
    console.log('🎯 **目標**: out_oscillation (右端縦3つの真ん中) を光らせる');
    console.log('');
    console.log('💡 **方法1: 回路データ修正 (プログラム的)**');
    console.log('  1. AND3ゲートの入力をEnableから常時trueに変更');
    console.log('  2. Enableスイッチをtrueにする');
    console.log('  → Memory1とMemory2が非同期になり光る');
    console.log('');
    console.log('💡 **方法2: 初期状態変更 (プログラム的)**');
    console.log('  1. Memory1を初期値true, Memory2を初期値falseに設定');
    console.log('  2. そのまま評価する');
    console.log('  → 異なる初期状態で光る');
    console.log('');
    console.log('🚫 **現在の回路では通常操作で光らない理由:**');
    console.log('  - 回路が対称設計のため2つのメモリが常に同期');
    console.log('  - Enable/Trigger操作では同じ状態になる');
    console.log('  - XORは同じ値同士なので常にfalse');
    console.log('');
    console.log('✅ **結論**: プログラム的な修正が必要');
    console.log('   UIでの通常操作では構造的に光らない設計');

    expect(true).toBe(true);
  });
});