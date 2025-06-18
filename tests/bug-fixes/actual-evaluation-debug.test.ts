import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 実際の評価結果詳細デバッグ
 */
describe('🔍 実際の評価結果詳細デバッグ', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('📊 実データの初期評価', () => {
    console.log('\n=== 📊 実データの初期評価 ===');
    
    // 実際のギャラリーデータを使用
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    console.log('\n🎛️ 初期入力状態:');
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    console.log(`  Enable: ${enableGate?.output}`);
    console.log(`  Trigger: ${triggerGate?.output}`);
    
    // 初期評価実行
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    console.log('\n⚙️ 評価結果:');
    console.log(`  成功: ${result.evaluationInfo.strategyUsed}`);
    console.log(`  実行時間: ${result.evaluationInfo.executionTimeMs.toFixed(2)}ms`);
    console.log(`  循環依存: ${result.evaluationInfo.hasCircularDependency}`);
    console.log(`  警告: ${result.warnings}`);
    
    // メモリ状態確認
    const memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log('\n🧠 メモリ状態:');
    console.log(`  Memory1: output=${memory1?.output}, outputs=[${memory1?.outputs}]`);
    console.log(`  Memory2: output=${memory2?.output}, outputs=[${memory2?.outputs}]`);
    
    // 右端の3つの出力ゲート詳細
    const rightOutputs = [
      { id: 'out_activity', name: '上（活動）', gate: updatedCircuit.gates.find(g => g.id === 'out_activity') },
      { id: 'out_oscillation', name: '真ん中（振動）', gate: updatedCircuit.gates.find(g => g.id === 'out_oscillation') },
      { id: 'out_sync', name: '下（同期）', gate: updatedCircuit.gates.find(g => g.id === 'out_sync') }
    ];
    
    console.log('\n💡 右端出力詳細:');
    rightOutputs.forEach(({ id, name, gate }) => {
      const inputValue = getGateInputValue(gate!, 0);
      const target = id === 'out_oscillation' ? ' ← 🎯目標' : '';
      console.log(`  ${name}: input="${gate?.inputs[0]}", value=${inputValue}${target}`);
    });
    
    // 振動パターン分析器の詳細
    const oscillationXor = updatedCircuit.gates.find(g => g.id === 'oscillation_xor');
    const oscillationAnd = updatedCircuit.gates.find(g => g.id === 'oscillation_and');
    const patternOr = updatedCircuit.gates.find(g => g.id === 'pattern_or');
    
    console.log('\n🔍 振動分析器詳細:');
    console.log(`  XOR: inputs=[${oscillationXor?.inputs}], output=${oscillationXor?.output}`);
    console.log(`  AND: inputs=[${oscillationAnd?.inputs}], output=${oscillationAnd?.output}`);
    console.log(`  OR:  inputs=[${patternOr?.inputs}], output=${patternOr?.output}`);
    
    expect(result).toBeDefined();
  });

  it('🔧 Trigger操作の実際の効果', () => {
    console.log('\n=== 🔧 Trigger操作の実際の効果 ===');
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // 初期状態評価
    console.log('\n📌 初期状態:');
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    let memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    let oscillationOut = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1: ${memory1?.output}, Memory2: ${memory2?.output}`);
    console.log(`  振動検出: ${getGateInputValue(oscillationOut!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // Trigger ON
    console.log('\n📌 Trigger → ON:');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate) triggerGate.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    oscillationOut = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1: ${memory1?.output}, Memory2: ${memory2?.output}`);
    console.log(`  振動検出: ${getGateInputValue(oscillationOut!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // Trigger OFF
    console.log('\n📌 Trigger → OFF:');
    const triggerGate2 = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate2) triggerGate2.output = false;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    oscillationOut = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log(`  Memory1: ${memory1?.output}, Memory2: ${memory2?.output}`);
    console.log(`  振動検出: ${getGateInputValue(oscillationOut!, 0) ? '🟢 光る！' : '⚫ 暗い'}`);
    
    // 最終状態の詳細分析
    const finalXor = circuit.gates.find(g => g.id === 'oscillation_xor');
    console.log('\n🔍 最終XOR分析:');
    console.log(`  XOR入力: [${finalXor?.inputs}]`);
    console.log(`  XOR出力: ${finalXor?.output}`);
    console.log(`  計算: ${memory1?.output} XOR ${memory2?.output} = ${memory1?.output !== memory2?.output}`);
    
    expect(result).toBeDefined();
  });
});