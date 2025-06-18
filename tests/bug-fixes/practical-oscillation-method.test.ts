import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';
import { getGateInputValue } from '@/domain/simulation';

/**
 * 🎯 右端真ん中のout_oscillationを実際に光らせる具体的方法の調査
 */
describe('🎯 out_oscillation 実用的光らせ方法', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔍 Enable/Triggerの全パターンでの動作確認', () => {
    console.log('\n=== 🎯 Enable/Trigger全パターン検証 ===');
    
    const patterns = [
      { enable: false, trigger: false, name: 'E=0,T=0' },
      { enable: false, trigger: true,  name: 'E=0,T=1' },
      { enable: true,  trigger: false, name: 'E=1,T=0' },
      { enable: true,  trigger: true,  name: 'E=1,T=1' },
    ];
    
    patterns.forEach(pattern => {
      const circuit: Circuit = {
        gates: [...SELF_OSCILLATING_MEMORY.gates],
        wires: [...SELF_OSCILLATING_MEMORY.wires],
      };
      
      // 設定
      const enableGate = circuit.gates.find(g => g.id === 'enable');
      const triggerGate = circuit.gates.find(g => g.id === 'trigger');
      if (enableGate) enableGate.output = pattern.enable;
      if (triggerGate) triggerGate.output = pattern.trigger;
      
      const result = evaluator.evaluate(circuit);
      const updatedCircuit = result.circuit;
      
      const memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
      const memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
      const oscillationOutput = updatedCircuit.gates.find(g => g.id === 'out_oscillation');
      const oscillationXor = updatedCircuit.gates.find(g => g.id === 'oscillation_xor');
      
      const isLit = getGateInputValue(oscillationOutput!, 0);
      
      console.log(`\n📌 ${pattern.name}:`);
      console.log(`  Memory1 Q: ${memory1?.output}, Memory2 Q: ${memory2?.output}`);
      console.log(`  XOR input: [${memory1?.output}, ${memory2?.output}] → ${oscillationXor?.output}`);
      console.log(`  out_oscillation: ${isLit ? '💚 光る' : '⚫ 暗い'}`);
      
      if (isLit) {
        console.log(`  ✅ パターン${pattern.name}で光ります！`);
      }
    });
    
    expect(true).toBe(true);
  });

  it('🔄 Enable/Triggerシーケンス操作での光らせ方', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== 🔄 シーケンス操作で光らせる方法 ===');
    
    const sequences = [
      // シーケンス1: Enable操作
      [
        { enable: false, trigger: false, step: '1. 初期状態' },
        { enable: true,  trigger: false, step: '2. Enable ON' },
        { enable: false, trigger: false, step: '3. Enable OFF' },
        { enable: true,  trigger: false, step: '4. Enable ON again' },
      ],
      // シーケンス2: Trigger操作
      [
        { enable: true,  trigger: false, step: '1. Enable ON' },
        { enable: true,  trigger: true,  step: '2. Trigger ON' },
        { enable: true,  trigger: false, step: '3. Trigger OFF' },
        { enable: false, trigger: false, step: '4. 両方OFF' },
      ],
      // シーケンス3: 交互操作
      [
        { enable: false, trigger: false, step: '1. 両方OFF' },
        { enable: true,  trigger: false, step: '2. Enable ON のみ' },
        { enable: false, trigger: true,  step: '3. Trigger ON のみ' },
        { enable: true,  trigger: true,  step: '4. 両方ON' },
      ],
    ];
    
    sequences.forEach((sequence, seqIndex) => {
      console.log(`\n🔄 シーケンス ${seqIndex + 1}:`);
      
      // 新しい回路で開始
      circuit = {
        gates: [...SELF_OSCILLATING_MEMORY.gates],
        wires: [...SELF_OSCILLATING_MEMORY.wires],
      };
      
      sequence.forEach(step => {
        const enableGate = circuit.gates.find(g => g.id === 'enable');
        const triggerGate = circuit.gates.find(g => g.id === 'trigger');
        if (enableGate) enableGate.output = step.enable;
        if (triggerGate) triggerGate.output = step.trigger;
        
        const result = evaluator.evaluate(circuit);
        circuit = result.circuit;
        
        const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
        const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
        const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
        
        const isLit = getGateInputValue(oscillationOutput!, 0);
        
        console.log(`  ${step.step}: M1=${memory1?.output}, M2=${memory2?.output} → ${isLit ? '💚 光る！' : '⚫ 暗い'}`);
        
        if (isLit) {
          console.log(`  ✅ このステップで光りました！`);
          console.log(`     操作: Enable=${step.enable}, Trigger=${step.trigger}`);
        }
      });
    });
    
    expect(true).toBe(true);
  });

  it('⚡ 高速連続操作での振動誘発', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\n=== ⚡ 高速連続操作での振動誘発 ===');
    
    // 高速でEnable/Triggerを切り替えて振動状態を作る
    const rapidOperations = [
      { enable: true,  trigger: false },
      { enable: true,  trigger: true  },
      { enable: false, trigger: true  },
      { enable: false, trigger: false },
      { enable: true,  trigger: false },
      { enable: true,  trigger: true  },
      { enable: false, trigger: false },
      { enable: true,  trigger: true  },
      { enable: false, trigger: true  },
      { enable: true,  trigger: false },
    ];
    
    console.log('\n🔄 高速連続操作実行:');
    
    rapidOperations.forEach((op, i) => {
      const enableGate = circuit.gates.find(g => g.id === 'enable');
      const triggerGate = circuit.gates.find(g => g.id === 'trigger');
      if (enableGate) enableGate.output = op.enable;
      if (triggerGate) triggerGate.output = op.trigger;
      
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      const memory1 = circuit.gates.find(g => g.id === 'memory1_sr');
      const memory2 = circuit.gates.find(g => g.id === 'memory2_sr');
      const oscillationOutput = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const isLit = getGateInputValue(oscillationOutput!, 0);
      
      console.log(`  Step ${i+1}: E=${op.enable ? 1 : 0}, T=${op.trigger ? 1 : 0} → M1=${memory1?.output ? 1 : 0}, M2=${memory2?.output ? 1 : 0} → ${isLit ? '💚' : '⚫'}`);
      
      if (isLit) {
        console.log(`  🎯 Step ${i+1} で out_oscillation が光りました！`);
        console.log(`     具体的操作: Enable=${op.enable}, Trigger=${op.trigger}`);
        return; // 光ったら終了
      }
    });
    
    expect(true).toBe(true);
  });

  it('🎯 最終確認: 確実に光らせる方法', () => {
    console.log('\n=== 🎯 確実に out_oscillation を光らせる方法 ===');
    
    // 方法1: メモリ状態を直接制御
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };
    
    // 初期評価
    const result1 = evaluator.evaluate(circuit);
    let updatedCircuit = result1.circuit;
    
    // 片方のメモリだけ強制的にONにする具体的操作を探す
    console.log('\n🔧 メモリ1をON、メモリ2をOFFにする操作:');
    
    // Enable=true, Trigger=falseからスタート
    let enableGate = updatedCircuit.gates.find(g => g.id === 'enable');
    let triggerGate = updatedCircuit.gates.find(g => g.id === 'trigger');
    if (enableGate) enableGate.output = true;
    if (triggerGate) triggerGate.output = false;
    
    const result2 = evaluator.evaluate(updatedCircuit);
    updatedCircuit = result2.circuit;
    
    let memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    let memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log(`  初期: M1=${memory1?.output}, M2=${memory2?.output}`);
    
    // Triggerを一時的にONにしてメモリ2をリセット
    triggerGate = updatedCircuit.gates.find(g => g.id === 'trigger');
    if (triggerGate) triggerGate.output = true;
    
    const result3 = evaluator.evaluate(updatedCircuit);
    updatedCircuit = result3.circuit;
    
    memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    
    console.log(`  Trigger=true: M1=${memory1?.output}, M2=${memory2?.output}`);
    
    // Enableを一時的にOFFにしてメモリ1だけを別の状態にする
    enableGate = updatedCircuit.gates.find(g => g.id === 'enable');
    if (enableGate) enableGate.output = false;
    
    const result4 = evaluator.evaluate(updatedCircuit);
    updatedCircuit = result4.circuit;
    
    memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    const oscillationOutput = updatedCircuit.gates.find(g => g.id === 'out_oscillation');
    
    const isLit = getGateInputValue(oscillationOutput!, 0);
    
    console.log(`  Enable=false: M1=${memory1?.output}, M2=${memory2?.output}`);
    console.log(`  out_oscillation: ${isLit ? '💚 光る！' : '⚫ 暗い'}`);
    
    if (isLit) {
      console.log('\n✅ 成功！具体的手順:');
      console.log('  1. Enable=true, Trigger=false');
      console.log('  2. Trigger=true にする');
      console.log('  3. Enable=false にする');
      console.log('  → out_oscillation が光る');
    } else {
      console.log('\n❌ この操作では光りませんでした');
    }
    
    expect(true).toBe(true);
  });
});