import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🎯 右端真ん中の出力ゲート (out_oscillation) 分析
 */
describe('🎯 out_oscillation 光らせる方法分析', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔍 out_oscillation の接続と条件を分析', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🎯 右端真ん中 out_oscillation 分析 ===');
    
    // Enable=true の状態で評価
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) {
      enableGate.output = true;
    }

    const result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    // 右端縦3つの出力ゲート（Y座標で判定）
    const rightOutputs = circuit.gates
      .filter(g => g.type === 'OUTPUT' && g.position.x >= 800)
      .sort((a, b) => a.position.y - b.position.y);
    
    console.log('\n📍 右端の出力ゲート (上から下)：');
    rightOutputs.forEach((gate, i) => {
      const inputValue = getGateInputValue(gate, 0);
      const marker = i === 1 ? '👉' : '  '; // 真ん中をマーク
      console.log(`${marker} ${gate.id} (y:${gate.position.y}): ${inputValue ? '💚 光る' : '⚫ 暗い'}`);
    });
    
    // out_oscillation の詳細分析
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    const oscillationXor = circuit.gates.find(g => g.id === 'oscillation_xor');
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log('\n🔬 out_oscillation 詳細分析：');
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る' : '⚫ 暗い'}`);
    console.log(`  ↑ oscillation_xor: output=${oscillationXor?.output}`);
    console.log(`    ↑ memory1_sr Q: ${memory1?.output}`);
    console.log(`    ↑ memory2_sr Q: ${memory2?.output}`);
    console.log(`    XOR結果: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);
    
    console.log('\n💡 out_oscillation を光らせる条件：');
    console.log('  memory1_sr のQ出力 ≠ memory2_sr のQ出力');
    console.log('  つまり、2つのメモリが異なる状態の時');
    
    expect(oscillationOutput).toBeDefined();
  });

  it('🧪 異なる状態を作って out_oscillation を光らせる実験', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🧪 out_oscillation を光らせる実験 ===');
    
    // Enable=true, Trigger=false で初期状態
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    console.log('\n📌 初期状態 (Enable=true, Trigger=false):');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  memory1_sr Q: ${memory1?.output}`);
    console.log(`  memory2_sr Q: ${memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る' : '⚫ 暗い'}`);
    
    // Triggerを一瞬trueにして、異なる状態を作る試み
    console.log('\n📌 Trigger=true にしてみる:');
    const triggerGate2 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate2) triggerGate2.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1_2 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2_2 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput2 = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  memory1_sr Q: ${memory1_2?.output}`);
    console.log(`  memory2_sr Q: ${memory2_2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput2!, 0) ? '💚 光る' : '⚫ 暗い'}`);
    
    // Triggerを戻す
    console.log('\n📌 Trigger=false に戻す:');
    const triggerGate3 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate3) triggerGate3.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1_3 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2_3 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput3 = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  memory1_sr Q: ${memory1_3?.output}`);
    console.log(`  memory2_sr Q: ${memory2_3?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput3!, 0) ? '💚 光る' : '⚫ 暗い'}`);
    
    console.log('\n💡 結論：');
    if (getGateInputValue(oscillationOutput3!, 0)) {
      console.log('✅ out_oscillation が光りました！');
    } else {
      console.log('❌ out_oscillation はまだ光りません。');
      console.log('🤔 この回路では2つのメモリが常に同期するため、');
      console.log('   振動検出（XOR）は基本的にfalseになります。');
      console.log('🎯 光らせるには、一方のメモリだけを手動で変更する必要があります。');
    }
    
    expect(result).toBeDefined();
  });

  it('🎯 手動でメモリ状態を変更して out_oscillation を光らせる', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🎯 手動メモリ変更で out_oscillation を光らせる ===');
    
    // 初期状態
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) enableGate.output = true;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('\n📌 初期状態:');
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    console.log(`  memory1_sr Q: ${memory1?.output}`);
    console.log(`  memory2_sr Q: ${memory2?.output}`);
    
    // 手動でmemory1のQ出力だけを反転
    console.log('\n🔧 memory1_sr のQ出力を手動で反転:');
    const memory1_manual = circuit.gates.find(g => g.id === 'memory1_sr');
    if (memory1_manual) {
      memory1_manual.output = !memory1_manual.output;
      // outputs配列も更新
      if (memory1_manual.outputs) {
        memory1_manual.outputs = [memory1_manual.output, !memory1_manual.output];
      }
    }
    
    // 再評価
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1_after = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2_after = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📌 手動変更後:');
    console.log(`  memory1_sr Q: ${memory1_after?.output}`);
    console.log(`  memory2_sr Q: ${memory2_after?.output}`);
    console.log(`  XOR結果: ${memory1_after?.output} ≠ ${memory2_after?.output} = ${memory1_after?.output !== memory2_after?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    expect(result).toBeDefined();
  });
});