import { describe, it, expect } from 'vitest';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import { SELF_OSCILLATING_MEMORY } from '@/features/gallery/data/self-oscillating-memory';
import type { Circuit } from '@/domain/simulation/core/types';

/**
 * 🔧 セルフオシレーティングメモリの詳細デバッグ
 */
describe('🔧 セルフオシレーティングメモリ詳細デバッグ', () => {
  const evaluator = new EnhancedHybridEvaluator({
    strategy: 'AUTO_SELECT',
    enableDebugLogging: false,
  });

  it('🔍 ANDゲートの詳細状態確認', () => {
    const circuit: Circuit = {
      gates: [...SELF_OSCILLATING_MEMORY.gates],
      wires: [...SELF_OSCILLATING_MEMORY.wires],
    };

    console.log('\\n=== 🔍 ANDゲート詳細状態確認 ===');
    
    const result = evaluator.evaluate(circuit);
    const updatedCircuit = result.circuit;
    
    // 入力ゲートの状態
    const enable = updatedCircuit.gates.find(g => g.id === 'enable');
    const trigger = updatedCircuit.gates.find(g => g.id === 'trigger');
    console.log(`\\n📥 入力: enable=${enable?.output}, trigger=${trigger?.output}`);
    
    // SR-LATCHの状態詳細
    const memory1 = updatedCircuit.gates.find(g => g.id === 'memory1_sr');
    const memory2 = updatedCircuit.gates.find(g => g.id === 'memory2_sr');
    console.log(`\\n🧠 Memory1 SR-LATCH: output=${memory1?.output}, inputs=[${memory1?.inputs}]`);
    console.log(`   🤔 問題: Q̄出力はどこ？Q̄=${memory1?.outputs?.[1] || 'undefined'}`);
    console.log(`🧠 Memory2 SR-LATCH: output=${memory2?.output}, inputs=[${memory2?.inputs}]`);
    console.log(`   🤔 問題: Q̄出力はどこ？Q̄=${memory2?.outputs?.[1] || 'undefined'}`);
    
    // ANDゲートの状態詳細
    const and1 = updatedCircuit.gates.find(g => g.id === 'and1');
    const and2 = updatedCircuit.gates.find(g => g.id === 'and2');
    const and3 = updatedCircuit.gates.find(g => g.id === 'and3');
    const and4 = updatedCircuit.gates.find(g => g.id === 'and4');
    
    console.log(`\\n🔧 ANDゲート状態:`);
    console.log(`  and1: inputs=[${and1?.inputs}], output=${and1?.output}`);
    console.log(`    期待: [enable=${enable?.output}, memory2_qbar=?]`);
    console.log(`  and2: inputs=[${and2?.inputs}], output=${and2?.output}`);
    console.log(`    期待: [trigger=${trigger?.output}, memory2_q=${memory2?.output}]`);
    console.log(`  and3: inputs=[${and3?.inputs}], output=${and3?.output}`);
    console.log(`    期待: [enable=${enable?.output}, memory1_qbar=?]`);
    console.log(`  and4: inputs=[${and4?.inputs}], output=${and4?.output}`);
    console.log(`    期待: [trigger=${trigger?.output}, memory1_q=${memory1?.output}]`);
    
    expect(result).toBeDefined();
  });

  it('🔧 SR-LATCHの複数出力確認', () => {
    console.log('\\n=== 🔧 SR-LATCHの複数出力問題 ===');
    console.log('');
    console.log('🎯 **問題の核心を発見**:');
    console.log('SR-LATCHはQ̄出力を持つはずだが、現在の実装で');
    console.log('Q̄出力が正しくアクセスできていない可能性');
    console.log('');
    console.log('📋 **ワイヤー接続の確認**:');
    console.log('- pinIndex: -1 → Q出力');
    console.log('- pinIndex: -2 → Q̄出力');
    console.log('');
    console.log('🔍 **仮説**: SR-LATCHのQ̄出力が常にfalseになっている');
    console.log('これによりクロス結合のANDゲートが動作しない');
    
    expect(true).toBe(true);
  });

  it('🛠️ SR-LATCH実装確認', () => {
    // 単純なSR-LATCHテスト
    const circuit: Circuit = {
      gates: [
        {
          id: 'sr_test',
          type: 'SR-LATCH',
          position: { x: 300, y: 150 },
          output: false,
          inputs: ['1', ''], // S=1, R=0でセット
          metadata: { state: false },
        },
      ],
      wires: [],
    };

    console.log('\\n=== 🛠️ SR-LATCH実装確認 ===');
    
    const result = evaluator.evaluate(circuit);
    const srLatch = result.circuit.gates[0];
    
    console.log(`SR-LATCH with S=1, R=0:`);
    console.log(`  output (Q): ${srLatch.output}`);
    console.log(`  outputs array: ${JSON.stringify(srLatch.outputs)}`);
    console.log(`  metadata: ${JSON.stringify(srLatch.metadata)}`);
    
    if (!srLatch.outputs || srLatch.outputs.length < 2) {
      console.log('\\n🚨 **問題発見**: SR-LATCHのQ̄出力が実装されていない！');
      console.log('これがセルフオシレーティングメモリが動作しない根本原因');
    }
    
    expect(result).toBeDefined();
  });
});