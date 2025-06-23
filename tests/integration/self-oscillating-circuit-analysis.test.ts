/**
 * self-oscillating-memory-finalの回路解析
 */

import { describe, it } from 'vitest';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';

describe('self-oscillating回路の詳細解析', () => {
  it('フィードバックループの問題を特定', () => {
    const evaluator = new CircuitEvaluator();
    
    const circuit: EvaluationCircuit = {
      gates: SELF_OSCILLATING_MEMORY_FINAL.gates.map(gate => ({
        id: gate.id,
        type: gate.type as any,
        position: gate.position,
        inputs: gate.inputs || [],
        outputs: gate.outputs || [],
      })),
      wires: SELF_OSCILLATING_MEMORY_FINAL.wires,
    };
    
    const context: EvaluationContext = {
      currentTime: 0,
      memory: {
        enable: { state: true },
        trigger: { state: false }
      }
    };
    
    // 詳細な状態遷移を追跡
    console.log('🔍 初期から10サイクルの詳細:');
    
    let current = { circuit, context };
    for (let i = 0; i < 10; i++) {
      const nor1 = current.circuit.gates.find(g => g.id === 'nor1');
      const nor2 = current.circuit.gates.find(g => g.id === 'nor2');
      const trigger_or = current.circuit.gates.find(g => g.id === 'trigger_or');
      const fb_and1 = current.circuit.gates.find(g => g.id === 'fb_and1');
      const fb_and2 = current.circuit.gates.find(g => g.id === 'fb_and2');
      
      console.log(`\nサイクル${i}:`);
      console.log(`  nor1: in=[${nor1?.inputs}] → out=[${nor1?.outputs}]`);
      console.log(`  nor2: in=[${nor2?.inputs}] → out=[${nor2?.outputs}]`);
      console.log(`  trigger_or: in=[${trigger_or?.inputs}] → out=[${trigger_or?.outputs}]`);
      console.log(`  fb_and1: out=[${fb_and1?.outputs}]`);
      console.log(`  fb_and2: out=[${fb_and2?.outputs}]`);
      
      // 問題の診断
      if (nor1?.outputs?.[0] === false && nor2?.outputs?.[0] === false) {
        console.log('  ⚠️ 両NORゲートが0 - デッドロック危険状態');
      }
      
      if (trigger_or?.outputs?.[0] === true) {
        console.log('  🔥 trigger_orがHIGH - nor1が常に0になる');
      }
      
      current = evaluator.evaluateDelayed(current.circuit, current.context);
    }
    
    console.log('\n\n🔍 問題の分析:');
    console.log('1. 発振パターンが不規則（両NORが0になる状態が頻発）');
    console.log('2. fb_and2 → trigger_or → nor1のフィードバックが強すぎる');
    console.log('3. trigger操作時にこのループが固定化される');
    
    console.log('\n🔧 解決策の提案:');
    console.log('- フィードバックループに追加の制御ロジックが必要');
    console.log('- 例：trigger_orの後にリセット機構を追加');
    console.log('- または、フィードバックの強度を調整（追加のゲートで条件付け）');
  });
});