import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🔍 2つのメモリが同期する原因を詳細分析
 */
describe('🔍 メモリ同期問題の根本原因分析', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔗 メモリの入力接続を詳細分析', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔗 メモリ入力接続の詳細分析 ===');
    
    // メモリ1の入力接続
    const memory1Wires = circuit.wires.filter(w => w.to.gateId === 'memory1_sr');
    console.log('\n📍 Memory1 (memory1_sr) の入力:');
    memory1Wires.forEach(wire => {
      const sourceGate = circuit.gates.find(g => g.id === wire.from.gateId);
      console.log(`  ${wire.to.pinIndex === 0 ? 'S' : 'R'}入力 ← ${wire.from.gateId} (${sourceGate?.type})`);
    });
    
    // メモリ2の入力接続
    const memory2Wires = circuit.wires.filter(w => w.to.gateId === 'memory2_sr');
    console.log('\n📍 Memory2 (memory2_sr) の入力:');
    memory2Wires.forEach(wire => {
      const sourceGate = circuit.gates.find(g => g.id === wire.from.gateId);
      console.log(`  ${wire.to.pinIndex === 0 ? 'S' : 'R'}入力 ← ${wire.from.gateId} (${sourceGate?.type})`);
    });

    // ANDゲートの入力を確認
    const andGates = ['and1', 'and2', 'and3', 'and4'];
    console.log('\n🔧 ANDゲートの入力接続:');
    andGates.forEach(andId => {
      const andWires = circuit.wires.filter(w => w.to.gateId === andId);
      console.log(`\n  ${andId}:`);
      andWires.forEach(wire => {
        const sourceGate = circuit.gates.find(g => g.id === wire.from.gateId);
        console.log(`    Pin${wire.to.pinIndex} ← ${wire.from.gateId} (${sourceGate?.type}) pinIndex:${wire.from.pinIndex}`);
      });
    });

    expect(true).toBe(true);
  });

  it('🧮 ANDゲートの計算過程を詳細確認', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🧮 ANDゲート計算過程の詳細確認 ===');
    
    // Enable=true, Trigger=false で評価
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    const result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log('\n📊 現在の状態:');
    console.log(`  Enable: ${enableGate?.output}`);
    console.log(`  Trigger: ${triggerGate?.output}`);
    console.log(`  Memory1 Q: ${memory1?.output}, Q̄: ${memory1?.outputs?.[1]}`);
    console.log(`  Memory2 Q: ${memory2?.output}, Q̄: ${memory2?.outputs?.[1]}`);
    
    // 各ANDゲートの計算を確認
    const andGates = ['and1', 'and2', 'and3', 'and4'];
    console.log('\n🔧 ANDゲートの計算:');
    
    andGates.forEach(andId => {
      const andGate = circuit.gates.find(g => g.id === andId);
      const inputWires = circuit.wires.filter(w => w.to.gateId === andId);
      
      console.log(`\n  ${andId}:`);
      console.log(`    inputs: [${andGate?.inputs}]`);
      console.log(`    output: ${andGate?.output}`);
      
      inputWires.forEach((wire, index) => {
        const sourceGate = circuit.gates.find(g => g.id === wire.from.gateId);
        let sourceValue;
        
        if (wire.from.pinIndex === -1) {
          sourceValue = sourceGate?.output;
        } else if (wire.from.pinIndex === -2) {
          sourceValue = sourceGate?.outputs?.[1];
        } else {
          sourceValue = sourceGate?.output;
        }
        
        console.log(`    Pin${wire.to.pinIndex}: ${sourceValue} ← ${wire.from.gateId} (pinIndex:${wire.from.pinIndex})`);
      });
    });

    expect(true).toBe(true);
  });

  it('💡 非同期化の可能性調査', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 💡 メモリを非同期化する方法調査 ===');
    
    // 初期状態: Enable=true, Trigger=false
    let enableGate = circuit.gates.find(g => g.id === 'enable');
    let triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    let result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('\n📌 Step 1: Enable=true, Trigger=false');
    let memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    console.log(`  Memory1: inputs=[${memory1?.inputs}], Q=${memory1?.output}, Q̄=${memory1?.outputs?.[1]}`);
    console.log(`  Memory2: inputs=[${memory2?.inputs}], Q=${memory2?.output}, Q̄=${memory2?.outputs?.[1]}`);
    
    // ANDゲートの出力を確認
    const and1 = circuit.gates.find(g => g.id === 'and1');
    const and2 = circuit.gates.find(g => g.id === 'and2');
    const and3 = circuit.gates.find(g => g.id === 'and3');
    const and4 = circuit.gates.find(g => g.id === 'and4');
    
    console.log(`  AND1→Memory1_S: ${and1?.output}`);
    console.log(`  AND2→Memory1_R: ${and2?.output}`);
    console.log(`  AND3→Memory2_S: ${and3?.output}`);
    console.log(`  AND4→Memory2_R: ${and4?.output}`);
    
    // Triggerをtrueにして変化を見る
    triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate) triggerGate.output = true;
    
    result = evaluator.evaluate(circuit);
    circuit = result.circuit;
    
    console.log('\n📌 Step 2: Enable=true, Trigger=true');
    memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    
    const and1_2 = circuit.gates.find(g => g.id === 'and1');
    const and2_2 = circuit.gates.find(g => g.id === 'and2');
    const and3_2 = circuit.gates.find(g => g.id === 'and3');
    const and4_2 = circuit.gates.find(g => g.id === 'and4');
    
    console.log(`  Memory1: inputs=[${memory1?.inputs}], Q=${memory1?.output}, Q̄=${memory1?.outputs?.[1]}`);
    console.log(`  Memory2: inputs=[${memory2?.inputs}], Q=${memory2?.output}, Q̄=${memory2?.outputs?.[1]}`);
    console.log(`  AND1→Memory1_S: ${and1_2?.output}`);
    console.log(`  AND2→Memory1_R: ${and2_2?.output}`);
    console.log(`  AND3→Memory2_S: ${and3_2?.output}`);
    console.log(`  AND4→Memory2_R: ${and4_2?.output}`);
    
    // 非対称な状態を作れるかチェック
    console.log('\n🔍 非対称状態の可能性:');
    const isAsymmetric = (and1_2?.output !== and3_2?.output) || (and2_2?.output !== and4_2?.output);
    console.log(`  AND1=${and1_2?.output} vs AND3=${and3_2?.output}: ${and1_2?.output !== and3_2?.output ? '異なる' : '同じ'}`);
    console.log(`  AND2=${and2_2?.output} vs AND4=${and4_2?.output}: ${and2_2?.output !== and4_2?.output ? '異なる' : '同じ'}`);
    console.log(`  非対称性: ${isAsymmetric ? 'あり' : 'なし'}`);

    expect(true).toBe(true);
  });

  it('🎯 強制的に非同期状態を作る実験', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🎯 強制非同期状態実験 ===');
    
    // 初期評価
    const result1 = evaluator.evaluate(circuit);
    circuit = result1.circuit;
    
    console.log('\n🔧 実験: AND1だけを強制的にtrueにする');
    
    // AND1を強制的にtrueに設定
    const and1 = circuit.gates.find(g => g.id === 'and1');
    if (and1) {
      and1.output = true;
      and1.inputs = ['true', 'true']; // 強制的に両入力をtrueに
    }
    
    // AND3は通常の評価のままにしておく
    
    // 再評価
    const result2 = evaluator.evaluate(circuit);
    circuit = result2.circuit;
    
    const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
    
    console.log('\n📊 強制変更後の状態:');
    console.log(`  Memory1 Q: ${memory1?.output}, inputs=[${memory1?.inputs}]`);
    console.log(`  Memory2 Q: ${memory2?.output}, inputs=[${memory2?.inputs}]`);
    console.log(`  XOR結果: ${memory1?.output} ≠ ${memory2?.output} = ${memory1?.output !== memory2?.output}`);
    console.log(`  out_oscillation: ${getGateInputValue(oscillationOutput!, 0) ? '💚 光る！' : '⚫ 暗い'}`);
    
    if (getGateInputValue(oscillationOutput!, 0)) {
      console.log('\n✅ 強制的な非同期状態で光らせることができました！');
      console.log('🔍 これは回路設計上、通常操作では非同期にならないことを示しています');
    }

    expect(true).toBe(true);
  });
});