/**
 * 遅延チェーンの同期評価問題の検証
 */

import { describe, it, expect } from 'vitest';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';

describe('遅延チェーンの同期評価問題', () => {
  it('NOTゲートチェーンが1サイクルで全て伝播する', () => {
    const evaluator = new CircuitEvaluator();
    
    // 5段のNOTゲートチェーン
    const circuit: EvaluationCircuit = {
      gates: [
        { id: 'input', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], outputs: [false] },
        { id: 'not1', type: 'NOT', position: { x: 100, y: 0 }, inputs: [false], outputs: [true] },
        { id: 'not2', type: 'NOT', position: { x: 200, y: 0 }, inputs: [true], outputs: [false] },
        { id: 'not3', type: 'NOT', position: { x: 300, y: 0 }, inputs: [false], outputs: [true] },
        { id: 'not4', type: 'NOT', position: { x: 400, y: 0 }, inputs: [true], outputs: [false] },
        { id: 'not5', type: 'NOT', position: { x: 500, y: 0 }, inputs: [false], outputs: [true] },
        { id: 'output', type: 'OUTPUT', position: { x: 600, y: 0 }, inputs: [true], outputs: [true] },
      ],
      wires: [
        { id: 'w1', from: { gateId: 'input', pinIndex: -1 }, to: { gateId: 'not1', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'not1', pinIndex: -1 }, to: { gateId: 'not2', pinIndex: 0 }, isActive: true },
        { id: 'w3', from: { gateId: 'not2', pinIndex: -1 }, to: { gateId: 'not3', pinIndex: 0 }, isActive: false },
        { id: 'w4', from: { gateId: 'not3', pinIndex: -1 }, to: { gateId: 'not4', pinIndex: 0 }, isActive: true },
        { id: 'w5', from: { gateId: 'not4', pinIndex: -1 }, to: { gateId: 'not5', pinIndex: 0 }, isActive: false },
        { id: 'w6', from: { gateId: 'not5', pinIndex: -1 }, to: { gateId: 'output', pinIndex: 0 }, isActive: true },
      ]
    };
    
    const context: EvaluationContext = {
      currentTime: 0,
      memory: {
        input: { state: false }
      }
    };
    
    // 入力を変更
    context.memory.input = { state: true };
    
    // 1回の評価
    const result = evaluator.evaluateDelayed(circuit, context);
    
    console.log('🔍 遅延チェーン評価結果:');
    result.circuit.gates.forEach(gate => {
      if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
        console.log(`  ${gate.id}: inputs=${gate.inputs}, outputs=${gate.outputs}`);
      }
    });
    
    // 問題：1回の評価で全てのNOTゲートが更新される
    // 実際の回路では、各ゲートの遅延により段階的に伝播するはず
    expect(result.circuit.gates[1].outputs[0]).toBe(false); // not1: !true = false
    expect(result.circuit.gates[2].outputs[0]).toBe(true);  // not2: !false = true
    expect(result.circuit.gates[3].outputs[0]).toBe(false); // not3: !true = false
    expect(result.circuit.gates[4].outputs[0]).toBe(true);  // not4: !false = true
    expect(result.circuit.gates[5].outputs[0]).toBe(false); // not5: !true = false
  });
  
  it('self-oscillatingのNORゲート同期問題', () => {
    const evaluator = new CircuitEvaluator();
    
    // 簡略化したself-oscillating回路（遅延チェーン付き）
    const circuit: EvaluationCircuit = {
      gates: [
        { id: 'trigger_or', type: 'OR', position: { x: 0, y: 0 }, inputs: [false, false], outputs: [false] },
        { id: 'nor1', type: 'NOR', position: { x: 100, y: 0 }, inputs: [false, false], outputs: [true] },
        { id: 'nor2', type: 'NOR', position: { x: 100, y: 100 }, inputs: [false, false], outputs: [false] },
        // 遅延チェーン（nor2の出力をnor1に戻す）
        { id: 'delay1', type: 'NOT', position: { x: 200, y: 100 }, inputs: [false], outputs: [true] },
        { id: 'delay2', type: 'NOT', position: { x: 300, y: 100 }, inputs: [true], outputs: [false] },
        { id: 'fb_and', type: 'AND', position: { x: 400, y: 100 }, inputs: [false, true], outputs: [false] }, // enable=true
      ],
      wires: [
        // trigger_or → nor1
        { id: 'w1', from: { gateId: 'trigger_or', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 0 }, isActive: false },
        // クロスカップリング
        { id: 'w2', from: { gateId: 'nor1', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 1 }, isActive: true },
        { id: 'w3', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 1 }, isActive: false },
        // nor2 → 遅延チェーン
        { id: 'w4', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'delay1', pinIndex: 0 }, isActive: false },
        { id: 'w5', from: { gateId: 'delay1', pinIndex: -1 }, to: { gateId: 'delay2', pinIndex: 0 }, isActive: true },
        { id: 'w6', from: { gateId: 'delay2', pinIndex: -1 }, to: { gateId: 'fb_and', pinIndex: 0 }, isActive: false },
        // フィードバック
        { id: 'w7', from: { gateId: 'fb_and', pinIndex: -1 }, to: { gateId: 'trigger_or', pinIndex: 1 }, isActive: false },
      ]
    };
    
    const context: EvaluationContext = { currentTime: 0, memory: {} };
    
    // trigger_orを一時的にONにする
    circuit.gates[0].inputs = [true, false]; // trigger ON
    const afterTriggerOn = evaluator.evaluateDelayed(circuit, context);
    
    console.log('\n🔍 Trigger ON後:');
    console.log('  trigger_or:', afterTriggerOn.circuit.gates[0].outputs);
    console.log('  nor1:', afterTriggerOn.circuit.gates[1].outputs);
    console.log('  nor2:', afterTriggerOn.circuit.gates[2].outputs);
    
    // triggerをOFFに戻す
    afterTriggerOn.circuit.gates[0].inputs = [false, afterTriggerOn.circuit.gates[5].outputs[0]];
    const afterTriggerOff = evaluator.evaluateDelayed(afterTriggerOn.circuit, afterTriggerOn.context);
    
    console.log('\n🔍 Trigger OFF後:');
    console.log('  trigger_or:', afterTriggerOff.circuit.gates[0].outputs);
    console.log('  nor1:', afterTriggerOff.circuit.gates[1].outputs);
    console.log('  nor2:', afterTriggerOff.circuit.gates[2].outputs);
    console.log('  fb_and:', afterTriggerOff.circuit.gates[5].outputs);
    
    // 問題：両方のNORゲートが同時に0になる
    const bothZero = 
      afterTriggerOff.circuit.gates[1].outputs[0] === false &&
      afterTriggerOff.circuit.gates[2].outputs[0] === false;
    
    console.log('\n⚠️  デッドロック状態:', bothZero);
    expect(bothZero).toBe(true); // 残念ながらこれが現実
  });
});