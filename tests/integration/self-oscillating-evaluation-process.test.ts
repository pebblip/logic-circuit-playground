/**
 * self-oscillating-memory-finalの評価プロセスの詳細追跡
 */

import { describe, it } from 'vitest';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';
import { SELF_OSCILLATING_MEMORY_FINAL } from '@/features/gallery/data/self-oscillating-memory-final';

describe('self-oscillating評価プロセス追跡', () => {
  it('初期評価で何が起きているか', () => {
    const evaluator = new CircuitEvaluator();
    
    // 回路定義をそのまま使用
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
    
    console.log('🔍 評価前の状態:');
    console.log('nor1:', circuit.gates.find(g => g.id === 'nor1')?.outputs);
    console.log('nor2:', circuit.gates.find(g => g.id === 'nor2')?.outputs);
    console.log('fb_and2:', circuit.gates.find(g => g.id === 'fb_and2')?.outputs);
    console.log('trigger_or:', circuit.gates.find(g => g.id === 'trigger_or')?.outputs);
    
    // 1回だけ評価
    const result1 = evaluator.evaluateDelayed(circuit, context);
    
    console.log('\n🔍 1回目の評価後:');
    console.log('nor1:', result1.circuit.gates.find(g => g.id === 'nor1')?.outputs);
    console.log('nor2:', result1.circuit.gates.find(g => g.id === 'nor2')?.outputs);
    console.log('fb_and2:', result1.circuit.gates.find(g => g.id === 'fb_and2')?.outputs);
    console.log('trigger_or:', result1.circuit.gates.find(g => g.id === 'trigger_or')?.outputs);
    
    // 2回目の評価
    const result2 = evaluator.evaluateDelayed(result1.circuit, result1.context);
    
    console.log('\n🔍 2回目の評価後:');
    console.log('nor1:', result2.circuit.gates.find(g => g.id === 'nor1')?.outputs);
    console.log('nor2:', result2.circuit.gates.find(g => g.id === 'nor2')?.outputs);
    console.log('fb_and2:', result2.circuit.gates.find(g => g.id === 'fb_and2')?.outputs);
    console.log('trigger_or:', result2.circuit.gates.find(g => g.id === 'trigger_or')?.outputs);
    
    // 実際のフックと同じような評価を試す
    console.log('\n🔍 useCanvas風の評価:');
    
    // 初期状態から開始
    const canvasCircuit = { ...circuit };
    const canvasContext = { ...context };
    
    // アニメーション開始を模擬（数サイクル評価）
    let current = { circuit: canvasCircuit, context: canvasContext };
    for (let i = 0; i < 3; i++) {
      current = evaluator.evaluateDelayed(current.circuit, current.context);
      console.log(`\nサイクル${i+1}:`);
      console.log('  nor1:', current.circuit.gates.find(g => g.id === 'nor1')?.outputs);
      console.log('  nor2:', current.circuit.gates.find(g => g.id === 'nor2')?.outputs);
      
      // 発振しているか確認
      const nor1Out = current.circuit.gates.find(g => g.id === 'nor1')?.outputs?.[0];
      const nor2Out = current.circuit.gates.find(g => g.id === 'nor2')?.outputs?.[0];
      console.log(`  発振状態: nor1=${nor1Out}, nor2=${nor2Out}`);
    }
    
    // この時点でtriggerをONにする
    console.log('\n🔥 Trigger ON:');
    current.context.memory.trigger = { state: true };
    const afterTriggerOn = evaluator.evaluateDelayed(current.circuit, current.context);
    
    console.log('nor1:', afterTriggerOn.circuit.gates.find(g => g.id === 'nor1')?.outputs);
    console.log('nor2:', afterTriggerOn.circuit.gates.find(g => g.id === 'nor2')?.outputs);
    console.log('trigger_or:', afterTriggerOn.circuit.gates.find(g => g.id === 'trigger_or')?.outputs);
    
    // triggerをOFFに戻す
    console.log('\n🔥 Trigger OFF:');
    afterTriggerOn.context.memory.trigger = { state: false };
    const afterTriggerOff = evaluator.evaluateDelayed(afterTriggerOn.circuit, afterTriggerOn.context);
    
    console.log('nor1:', afterTriggerOff.circuit.gates.find(g => g.id === 'nor1')?.outputs);
    console.log('nor2:', afterTriggerOff.circuit.gates.find(g => g.id === 'nor2')?.outputs);
    console.log('trigger_or:', afterTriggerOff.circuit.gates.find(g => g.id === 'trigger_or')?.outputs);
    console.log('fb_and2:', afterTriggerOff.circuit.gates.find(g => g.id === 'fb_and2')?.outputs);
  });
});