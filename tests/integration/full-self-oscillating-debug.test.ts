/**
 * self-oscillating-memory-finalの完全なデバッグ
 */

import { describe, it } from 'vitest';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';

describe('self-oscillating完全デバッグ', () => {
  it('trigger操作時の詳細な状態遷移', () => {
    const evaluator = new CircuitEvaluator();
    
    // 実際の回路を使用
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
    
    // 重要なゲートの状態を追跡
    const trackState = (label: string, circuit: EvaluationCircuit) => {
      const gates = ['trigger', 'enable', 'trigger_or', 'nor1', 'nor2', 'fb_and1', 'fb_and2'];
      console.log(`\n🔍 ${label}:`);
      gates.forEach(id => {
        const gate = circuit.gates.find(g => g.id === id);
        if (gate) {
          console.log(`  ${id}: inputs=${JSON.stringify(gate.inputs)}, outputs=${JSON.stringify(gate.outputs)}`);
        }
      });
    };
    
    // 初期状態
    const initial = evaluator.evaluateDelayed(circuit, context);
    trackState('初期状態', initial.circuit);
    
    // 数サイクル実行して安定状態を確認
    let stable = initial;
    for (let i = 0; i < 5; i++) {
      stable = evaluator.evaluateDelayed(stable.circuit, stable.context);
    }
    trackState('安定状態（5サイクル後）', stable.circuit);
    
    // trigger ON
    stable.context.memory.trigger = { state: true };
    const afterTriggerOn = evaluator.evaluateDelayed(stable.circuit, stable.context);
    trackState('Trigger ON直後', afterTriggerOn.circuit);
    
    // trigger OFF
    afterTriggerOn.context.memory.trigger = { state: false };
    const afterTriggerOff = evaluator.evaluateDelayed(afterTriggerOn.circuit, afterTriggerOn.context);
    trackState('Trigger OFF直後', afterTriggerOff.circuit);
    
    // さらに数サイクル実行
    let final = afterTriggerOff;
    for (let i = 0; i < 5; i++) {
      final = evaluator.evaluateDelayed(final.circuit, final.context);
      trackState(`Trigger OFF後 ${i+1}サイクル目`, final.circuit);
    }
  });
});