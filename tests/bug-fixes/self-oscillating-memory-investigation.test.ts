import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit, Gate } from '@/domain/simulation/core/types';

/**
 * 🔍 セルフオシレーティングメモリの動作調査
 * 
 * 【問題】入力ピンを変更しても出力が変わらない
 * 【疑い】この複雑な循環回路が期待通りに動作していない可能性
 */
describe('🔍 セルフオシレーティングメモリ動作調査', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔬 初期状態での回路分析', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\\n=== 🔬 セルフオシレーティングメモリ初期分析 ===');
    
    // 入力ゲートの状態確認
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    
    console.log(`Enable入力: ${enableGate?.output} (想定: true)`);
    console.log(`Trigger入力: ${triggerGate?.output} (想定: false)`);
    
    // 初期評価
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 主要出力の確認
    const outputs = updatedCircuit.gates.filter(g => g.type === 'OUTPUT');
    console.log('\\n📊 出力状態:');
    outputs.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output} (inputs: ${JSON.stringify(gate.inputs)})`);
    });
    
    // SR-LATCHの状態確認
    const memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    console.log('\\n🧠 メモリ状態:');
    console.log(`  Memory1 SR-LATCH: output=${memory1?.output}, inputs=${JSON.stringify(memory1?.inputs)}`);
    console.log(`  Memory2 SR-LATCH: output=${memory2?.output}, inputs=${JSON.stringify(memory2?.inputs)}`);
    
    expect(result).toBeDefined();
  });

  it('🧪 Enable入力変更テスト', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\\n=== 🧪 Enable入力変更テスト ===');
    
    // Enable を false に変更
    const enableGate = circuit.gates.find(g => g.id === 'enable');
    if (enableGate) {
      enableGate.output = false;
    }
    
    console.log('Enable を false に変更');
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 出力の変化を確認
    const outputs = updatedCircuit.gates.filter(g => g.type === 'OUTPUT');
    console.log('\\n📊 Enable=false 時の出力:');
    outputs.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });
    
    // Enable を true に戻す
    const enableGate2 = updatedCircuit.gates.find(g => g.id === 'enable');
    if (enableGate2) {
      enableGate2.output = true;
    }
    
    const result2 = evaluator.evaluate(updatedCircuit);
    const updatedCircuit2 = result2.circuit;
    
    console.log('\\nEnable を true に戻す');
    const outputs2 = updatedCircuit2.gates.filter(g => g.type === 'OUTPUT');
    console.log('\\n📊 Enable=true 時の出力:');
    outputs2.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });
    
    expect(result2).toBeDefined();
  });

  it('🧪 Trigger入力変更テスト', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\\n=== 🧪 Trigger入力変更テスト ===');
    
    // Trigger を true に変更
    const triggerGate = circuit.gates.find(g => g.id === 'trigger');
    if (triggerGate) {
      triggerGate.output = true;
    }
    
    console.log('Trigger を true に変更');
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 出力の変化を確認
    const outputs = updatedCircuit.gates.filter(g => g.type === 'OUTPUT');
    console.log('\\n📊 Trigger=true 時の出力:');
    outputs.forEach(gate => {
      console.log(`  ${gate.id}: ${gate.output}`);
    });
    
    expect(result).toBeDefined();
  });

  it('🔄 複数回評価での振動確認', () => {
    let circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\\n=== 🔄 複数回評価での振動テスト ===');
    
    const states: string[] = [];
    
    // 10回連続評価
    for (let i = 0; i < 10; i++) {
      const result = evaluator.evaluate(circuit);
      circuit = result.circuit;
      
      // 主要出力の状態を記録
      const mem1 = circuit.gates.find(g => g.id === 'out_mem1_q');
      const mem2 = circuit.gates.find(g => g.id === 'out_mem2_q');
      const oscillation = circuit.gates.find(g => g.id === 'out_oscillation');
      
      const state = `${mem1?.output}${mem2?.output}${oscillation?.output}`;
      states.push(state);
      
      console.log(`評価${i+1}: mem1_q=${mem1?.output}, mem2_q=${mem2?.output}, oscillation=${oscillation?.output}`);
    }
    
    console.log('\\n📈 状態遷移パターン:', states);
    
    // 振動パターンの検出
    const uniqueStates = new Set(states);
    console.log(`\\n🔍 ユニークな状態数: ${uniqueStates.size} (振動している場合は2以上)`);
    
    if (uniqueStates.size === 1) {
      console.log('⚠️  状態が変化していません - 振動していない可能性');
    } else {
      console.log('✅ 状態が変化しています - 振動の可能性あり');
    }
    
    expect(states).toBeDefined();
  });

  it('📋 回路設計の問題分析', () => {
    console.log('\\n=== 📋 セルフオシレーティングメモリ設計分析 ===');
    console.log('');
    console.log('🔍 **理論的な問題の可能性**:');
    console.log('1. **初期条件**: SR-LATCHの初期状態が安定点にある');
    console.log('2. **遅延不足**: NOTチェーンの遅延が振動に不十分');
    console.log('3. **競合条件**: 複雑なクロス結合が期待通りに動作しない');
    console.log('4. **イベント駆動限界**: この回路がイベント駆動で正しく評価できない');
    console.log('');
    console.log('🎯 **ユーザーの症状**: 入力変更→出力無変化');
    console.log('これは循環回路で一般的な問題です。');
    console.log('');
    console.log('💡 **推奨解決策**:');
    console.log('1. より単純な振動回路（リングオシレータ等）を使用');
    console.log('2. CLOCKゲートベースの同期回路に変更');
    console.log('3. 現在の回路は教育用デモとして「理論的な例」と位置づけ');
    
    expect(true).toBe(true);
  });
});