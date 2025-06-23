/**
 * 非対称性テスト - シミュレータの完全同期問題の検証
 */

import { describe, it, expect } from 'vitest';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';

describe('Asymmetry and Race Condition Test', () => {
  it('NORゲートの完全対称デッドロック - 遅延チェーンがあっても発生', () => {
    const evaluator = new CircuitEvaluator();
    
    // 単純なNORクロスカップリング回路
    const circuit: EvaluationCircuit = {
      gates: [
        { id: 'input', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], outputs: [false] },
        { id: 'nor1', type: 'NOR', position: { x: 100, y: 0 }, inputs: [false, false], outputs: [true] },
        { id: 'nor2', type: 'NOR', position: { x: 100, y: 100 }, inputs: [false, false], outputs: [true] },
      ],
      wires: [
        { id: 'w1', from: { gateId: 'input', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 0 }, isActive: false },
        { id: 'w2', from: { gateId: 'input', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 0 }, isActive: false },
        { id: 'w3', from: { gateId: 'nor1', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 1 }, isActive: true },
        { id: 'w4', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 1 }, isActive: true },
      ]
    };
    
    const context: EvaluationContext = {
      currentTime: 0,
      memory: {
        input: { state: false }
      }
    };
    
    // 初期状態：nor1=true, nor2=false（非対称）
    console.log('Initial state:', {
      nor1: circuit.gates[1].outputs,
      nor2: circuit.gates[2].outputs
    });
    
    // inputをtrueに変更
    context.memory.input = { state: true };
    const afterInputOn = evaluator.evaluateDelayed(circuit, context);
    
    console.log('After input ON:', {
      nor1: afterInputOn.circuit.gates[1].outputs,
      nor2: afterInputOn.circuit.gates[2].outputs
    });
    
    // inputをfalseに戻す
    context.memory.input = { state: false };
    const afterInputOff = evaluator.evaluateDelayed(afterInputOn.circuit, {
      ...afterInputOn.context,
      memory: { ...afterInputOn.context.memory, input: { state: false } }
    });
    
    console.log('After input OFF:', {
      nor1: afterInputOff.circuit.gates[1].outputs,
      nor2: afterInputOff.circuit.gates[2].outputs
    });
    
    // シミュレータの問題：
    // 1. 全ゲートが同時に評価される（同期的）
    // 2. 遅延チェーン（NOTゲート）があっても、1評価サイクル内で全て更新
    // 3. 両NORゲートが完全に同じタイミングで0→0になり、デッドロック
    // 
    // 実際の回路では：
    // - 各ゲートの物理的遅延（ナノ秒オーダー）にばらつきがある
    // - このばらつきが非対称性を生み、片方が先に変化する
    const bothZero = 
      afterInputOff.circuit.gates[1].outputs[0] === false &&
      afterInputOff.circuit.gates[2].outputs[0] === false;
      
    console.log('両方のNORゲートが0でデッドロック:', bothZero);
    
    // シミュレータでは完全同期のためデッドロックする
    expect(bothZero).toBe(true);
  });
  
  it('評価順序による影響', () => {
    const evaluator = new CircuitEvaluator();
    
    // ゲートの配列順序を変えた同じ回路
    const circuit1: EvaluationCircuit = {
      gates: [
        { id: 'nor1', type: 'NOR', position: { x: 0, y: 0 }, inputs: [true, false], outputs: [false] },
        { id: 'nor2', type: 'NOR', position: { x: 0, y: 100 }, inputs: [true, false], outputs: [false] },
      ],
      wires: [
        { id: 'w1', from: { gateId: 'nor1', pinIndex: -1 }, to: { gateId: 'nor2', pinIndex: 1 }, isActive: false },
        { id: 'w2', from: { gateId: 'nor2', pinIndex: -1 }, to: { gateId: 'nor1', pinIndex: 1 }, isActive: false },
      ]
    };
    
    const circuit2: EvaluationCircuit = {
      gates: [
        { id: 'nor2', type: 'NOR', position: { x: 0, y: 100 }, inputs: [true, false], outputs: [false] },
        { id: 'nor1', type: 'NOR', position: { x: 0, y: 0 }, inputs: [true, false], outputs: [false] },
      ],
      wires: circuit1.wires
    };
    
    const context: EvaluationContext = { currentTime: 0, memory: {} };
    
    // 両方の入力を0に変更して評価
    circuit1.gates[0].inputs = [false, false];
    circuit1.gates[1].inputs = [false, false];
    circuit2.gates[0].inputs = [false, false];
    circuit2.gates[1].inputs = [false, false];
    
    const result1 = evaluator.evaluateDelayed(circuit1, context);
    const result2 = evaluator.evaluateDelayed(circuit2, context);
    
    console.log('Circuit1 (nor1 first):', {
      nor1: result1.circuit.gates[0].outputs,
      nor2: result1.circuit.gates[1].outputs
    });
    
    console.log('Circuit2 (nor2 first):', {
      nor1: result2.circuit.gates[1].outputs,
      nor2: result2.circuit.gates[0].outputs
    });
    
    // 理想的には同じ結果になるべきだが、
    // 評価順序が影響する可能性がある
  });
});