import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 UI実際の動作シミュレーション
 */
describe('🔍 UI実際の動作シミュレーション', () => {
  it('🎯 スクリーンショットと同じ状態を再現', () => {
    console.log('\n=== 🎯 スクリーンショット状態の再現 ===');
    
    // GalleryCanvas.tsxと同じ初期化を再現
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });
    
    // 深いコピー作成（GalleryCanvas.tsx line 71-72と同様）
    const gates = SELF_OSCILLATING_MEMORY.gates.map(g => ({ ...g }));
    const wires = SELF_OSCILLATING_MEMORY.wires.map(w => ({ ...w }));
    
    console.log('🎛️ 初期入力確認:');
    const enableGate = gates.find(g => g.id === 'enable');
    const triggerGate = gates.find(g => g.id === 'trigger');
    console.log(`  Enable: ${enableGate?.output}`);
    console.log(`  Trigger: ${triggerGate?.output}`);
    
    // 初期状態で回路を評価（GalleryCanvas.tsx line 75-77と同様）
    const circuitData: Circuit = { gates, wires };
    const evaluationResult = evaluator.evaluate(circuitData);
    const updatedCircuit = evaluationResult.circuit;
    
    console.log('\n⚙️ 評価詳細:');
    console.log(`  戦略: ${evaluationResult.evaluationInfo.strategyUsed}`);
    console.log(`  時間: ${evaluationResult.evaluationInfo.executionTimeMs.toFixed(2)}ms`);
    console.log(`  循環: ${evaluationResult.evaluationInfo.hasCircularDependency}`);
    console.log(`  警告: ${evaluationResult.warnings}`);
    
    // Memory状態詳細
    const memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log('\n🧠 メモリ詳細状態:');
    console.log(`  Memory1: output=${memory1?.output}, metadata=${JSON.stringify(memory1?.metadata)}`);
    console.log(`  Memory2: output=${memory2?.output}, metadata=${JSON.stringify(memory2?.metadata)}`);
    
    // 分析ゲートの状態
    const oscillationXor = updatedCircuit.gates.find(g => g.id === 'oscillation_xor');
    const oscillationAnd = updatedCircuit.gates.find(g => g.id === 'oscillation_and');
    const patternOr = updatedCircuit.gates.find(g => g.id === 'pattern_or');
    
    console.log('\n🔍 分析ゲート状態:');
    console.log(`  XOR: inputs=[${oscillationXor?.inputs}] → output=${oscillationXor?.output}`);
    console.log(`  AND: inputs=[${oscillationAnd?.inputs}] → output=${oscillationAnd?.output}`);
    console.log(`  OR:  inputs=[${patternOr?.inputs}] → output=${patternOr?.output}`);
    
    // 右端出力の確認
    const outActivity = updatedCircuit.gates.find(g => g.id === 'out_activity');
    const outOscillation = updatedCircuit.gates.find(g => g.id === 'out_oscillation');
    const outSync = updatedCircuit.gates.find(g => g.id === 'out_sync');
    
    console.log('\n💡 右端出力実際の値:');
    console.log(`  上（活動）: input="${outActivity?.inputs[0]}" → ${getGateInputValue(outActivity!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    console.log(`  真ん中（振動）: input="${outOscillation?.inputs[0]}" → ${getGateInputValue(outOscillation!, 0) ? '🟢 光る' : '⚫ 暗い'} ← 🎯目標`);
    console.log(`  下（同期）: input="${outSync?.inputs[0]}" → ${getGateInputValue(outSync!, 0) ? '🟢 光る' : '⚫ 暗い'}`);
    
    // スクリーンショットとの比較
    console.log('\n📊 スクリーンショット比較:');
    const actualOrState = getGateInputValue(outActivity!, 0);
    const actualXorState = getGateInputValue(outOscillation!, 0);  
    const actualAndState = getGateInputValue(outSync!, 0);
    
    console.log(`  期待（スクリーンショット）: OR=🟢, XOR=⚫, AND=🟢`);
    console.log(`  実際（テスト）: OR=${actualOrState ? '🟢' : '⚫'}, XOR=${actualXorState ? '🟢' : '⚫'}, AND=${actualAndState ? '🟢' : '⚫'}`);
    
    const matches = (actualOrState === true) && (actualXorState === false) && (actualAndState === true);
    console.log(`  一致: ${matches ? '✅ 一致' : '❌ 不一致'}`);
    
    expect(evaluationResult).toBeDefined();
  });

  it('🔄 複数回評価による発振パターン確認', () => {
    console.log('\n=== 🔄 複数回評価による発振パターン確認 ===');
    
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
    });
    
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    console.log('\n🔄 連続評価（10回）:');
    const states: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
      const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
      const outOscillation = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const state = `M1:${memory1?.output ? 1 : 0},M2:${memory2?.output ? 1 : 0},XOR:${getGateInputValue(outOscillation!, 0) ? 1 : 0}`;
      states.push(state);
      
      console.log(`  ${i+1}: ${state}`);
    }
    
    const uniqueStates = new Set(states);
    console.log(`\n📈 発振分析:`);
    console.log(`  ユニーク状態: ${uniqueStates.size}`);
    console.log(`  状態リスト: ${Array.from(uniqueStates).join(', ')}`);
    
    // XORが1になる状態があるかチェック
    const hasOscillation = states.some(state => state.includes('XOR:1'));
    console.log(`  振動検出: ${hasOscillation ? '✅ XOR=1の状態あり' : '❌ XOR=0のまま'}`);
    
    expect(states.length).toBe(10);
  });
});