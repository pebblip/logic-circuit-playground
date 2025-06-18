/**
 * 🚨 カオス発生器の動的問題調査
 * 
 * ユーザー報告：
 * - 最初は全出力が連続的に点滅
 * - 一定時間後に出力が全く光らない
 * 
 * 調査内容：
 * - 複数評価サイクルでの状態変化追跡
 * - CLOCK駆動による状態遷移確認
 * - 発振回路の持続性確認
 */

import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { getGateInputValue } from '../../src/domain/simulation/signalConversion';

describe('カオス発生器動的問題調査', () => {
  let evaluator: EnhancedHybridEvaluator;

  beforeEach(() => {
    evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      autoSelectionThresholds: {
        maxGatesForLegacy: 10,
        minGatesForEventDriven: 20,
      },
      enablePerformanceTracking: true,
      enableDebugLogging: false,
      delayMode: false,
    });
  });

  test('カオス発生器の複数サイクル動作確認', () => {
    console.log('🌀 カオス発生器の複数サイクル動作確認');
    
    const chaosGenerator = FEATURED_CIRCUITS.find(circuit => circuit.id === 'chaos-generator');
    expect(chaosGenerator).toBeTruthy();
    
    if (!chaosGenerator) return;
    
    const { gates, wires } = chaosGenerator;
    let currentCircuit = { gates, wires };
    
    console.log(`初期状態: ゲート数=${gates.length}, ワイヤー数=${wires.length}`);
    
    // CLOCKゲートの確認
    const clockGates = gates.filter(g => g.type === 'CLOCK');
    console.log(`CLOCKゲート数: ${clockGates.length}`);
    clockGates.forEach(clock => {
      console.log(`  ${clock.id}: output=${clock.output}, metadata=${JSON.stringify(clock.metadata)}`);
    });
    
    // 複数サイクルの評価
    const cycles = 10;
    const results = [];
    
    for (let cycle = 0; cycle < cycles; cycle++) {
      console.log(`\n--- サイクル ${cycle + 1} ---`);
      
      const result = evaluator.evaluate(currentCircuit);
      
      if (result && result.circuit) {
        const updatedGates = result.circuit.gates;
        const outputGates = updatedGates.filter(g => g.type === 'OUTPUT');
        
        let litOutputCount = 0;
        const outputStates: string[] = [];
        
        outputGates.forEach(gate => {
          const inputValue = getGateInputValue(gate, 0);
          if (inputValue) litOutputCount++;
          outputStates.push(`${gate.id}=${inputValue ? '1' : '0'}`);
        });
        
        console.log(`💡 光る出力: ${litOutputCount}/${outputGates.length}`);
        console.log(`出力状態: [${outputStates.join(', ')}]`);
        
        results.push({
          cycle: cycle + 1,
          litOutputCount,
          outputStates: outputStates.join(','),
          evaluationSuccess: true
        });
        
        // 次のサイクルのために状態を更新
        currentCircuit = result.circuit;
        
        // CLOCKゲートの状態確認
        const clockGatesAfter = updatedGates.filter(g => g.type === 'CLOCK');
        clockGatesAfter.forEach(clock => {
          console.log(`  CLOCK ${clock.id}: output=${clock.output}`);
        });
        
      } else {
        console.error(`❌ サイクル ${cycle + 1} で評価失敗`);
        results.push({
          cycle: cycle + 1,
          litOutputCount: 0,
          outputStates: 'ERROR',
          evaluationSuccess: false
        });
      }
    }
    
    // 結果の分析
    console.log('\n📊 複数サイクル結果分析:');
    console.log('サイクル | 光る出力数 | 出力状態 | 評価成功');
    console.log('---------|------------|----------|----------');
    results.forEach(result => {
      console.log(`${result.cycle.toString().padStart(8)} | ${result.litOutputCount.toString().padStart(10)} | ${result.outputStates.padStart(8)} | ${result.evaluationSuccess ? '✅' : '❌'}`);
    });
    
    // 問題の検出
    const initialLitCount = results[0]?.litOutputCount || 0;
    const finalLitCount = results[results.length - 1]?.litOutputCount || 0;
    
    console.log(`\n🔍 問題検出:`);
    console.log(`初期光る出力数: ${initialLitCount}`);
    console.log(`最終光る出力数: ${finalLitCount}`);
    
    if (initialLitCount > 0 && finalLitCount === 0) {
      console.log('🚨 問題確認: 初期は光るが最終的に全て消灯');
    } else if (initialLitCount === 0 && finalLitCount === 0) {
      console.log('⚠️ 初期から光らない状態');
    } else {
      console.log('✅ 出力は持続している');
    }
    
    // 少なくとも最初のサイクルで何らかの出力があることを期待
    expect(results[0].evaluationSuccess).toBe(true);
  });

  test('LFSR内部状態の詳細追跡', () => {
    console.log('\n🔬 LFSR内部状態の詳細追跡');
    
    const chaosGenerator = FEATURED_CIRCUITS.find(circuit => circuit.id === 'chaos-generator');
    if (!chaosGenerator) throw new Error('Chaos generator not found');
    
    const { gates, wires } = chaosGenerator;
    let currentCircuit = { gates, wires };
    
    // D-FFゲートの初期状態確認
    const dffGates = gates.filter(g => g.type === 'D-FF');
    console.log(`D-FFゲート数: ${dffGates.length}`);
    dffGates.forEach(dff => {
      console.log(`  ${dff.id}: output=${dff.output}, metadata=${JSON.stringify(dff.metadata)}`);
    });
    
    // XORゲートの確認（フィードバック用）
    const xorGates = gates.filter(g => g.type === 'XOR');
    console.log(`XORゲート数: ${xorGates.length}`);
    
    // 5サイクルの詳細追跡
    for (let cycle = 0; cycle < 5; cycle++) {
      console.log(`\n=== サイクル ${cycle + 1} 詳細 ===`);
      
      const result = evaluator.evaluate(currentCircuit);
      
      if (result && result.circuit) {
        const updatedGates = result.circuit.gates;
        
        // D-FFの状態確認
        console.log('D-FF状態:');
        const dffGatesAfter = updatedGates.filter(g => g.type === 'D-FF');
        dffGatesAfter.forEach(dff => {
          console.log(`  ${dff.id}: output=${dff.output}, inputs=${JSON.stringify(dff.inputs)}`);
        });
        
        // XORの状態確認
        console.log('XOR状態:');
        const xorGatesAfter = updatedGates.filter(g => g.type === 'XOR');
        xorGatesAfter.forEach(xor => {
          console.log(`  ${xor.id}: output=${xor.output}, inputs=${JSON.stringify(xor.inputs)}`);
        });
        
        // OUTPUTの状態確認
        console.log('OUTPUT状態:');
        const outputGates = updatedGates.filter(g => g.type === 'OUTPUT');
        outputGates.forEach(gate => {
          const inputValue = getGateInputValue(gate, 0);
          console.log(`  ${gate.id}: input=${inputValue}, shouldLight=${inputValue ? 'YES' : 'NO'}`);
        });
        
        currentCircuit = result.circuit;
      } else {
        console.error(`❌ サイクル ${cycle + 1} で評価失敗`);
        break;
      }
    }
  });

  test('手動LFSR動作シミュレーション', () => {
    console.log('\n🧮 手動LFSR動作シミュレーション');
    
    // 4ビットLFSR (1 + x + x^4) の手動計算
    // 初期状態: 1111 (全て1)
    let state = [true, true, true, true]; // [b3, b2, b1, b0]
    
    console.log('手動4ビットLFSRシミュレーション:');
    console.log('初期状態: [' + state.map(b => b ? '1' : '0').join(', ') + ']');
    
    for (let step = 0; step < 10; step++) {
      // フィードバック: b3 XOR b0
      const feedback = state[3] !== state[0]; // XOR
      
      // シフト
      const newState = [feedback, state[0], state[1], state[2]];
      
      console.log(`ステップ ${step + 1}: [${state.map(b => b ? '1' : '0').join(', ')}] → [${newState.map(b => b ? '1' : '0').join(', ')}] (feedback=${feedback ? '1' : '0'})`);
      
      state = newState;
      
      // 全て0になったら問題
      if (state.every(b => !b)) {
        console.log('🚨 全て0になりました - LFSRが停止状態');
        break;
      }
    }
    
    console.log('\n期待される動作: 15ステップ後に初期状態に戻る（周期性）');
    console.log('実際の動作: 上記のシーケンスを確認');
  });
});