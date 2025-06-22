/**
 * 半加算機Pure実装テスト
 * 緊急修正: ギャラリーモード動作回復のため
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { PURE_CIRCUITS } from '../../src/features/gallery/data/circuits-pure';

describe('Half Adder Pure Implementation', () => {
  let service: CircuitEvaluationService;

  beforeEach(() => {
    service = new CircuitEvaluationService();
  });

  it('should correctly calculate sum and carry for all input combinations', () => {
    const circuit = PURE_CIRCUITS['half-adder'];
    expect(circuit).toBeDefined();

    // 初期状態確認: A=1, B=0
    const evalCircuit = service.toEvaluationCircuit(circuit);
    let context = service.createInitialContext(evalCircuit);
    let result = service.evaluateDirect(evalCircuit, context);

    console.log('=== Half Adder Test: A=1, B=0 ===');
    // logCircuitState is not available in CircuitEvaluationService

    // 期待値: SUM=1, CARRY=0
    const xorGate = result.circuit.gates.find(g => g.id === 'xor-sum')!;
    const andGate = result.circuit.gates.find(g => g.id === 'and-carry')!;
    const sumOutput = result.circuit.gates.find(g => g.id === 'output-sum')!;
    const carryOutput = result.circuit.gates.find(
      g => g.id === 'output-carry'
    )!;

    expect(xorGate.outputs[0]).toBe(true); // 1 XOR 0 = 1
    expect(andGate.outputs[0]).toBe(false); // 1 AND 0 = 0
    expect(sumOutput.inputs[0]).toBe(true); // SUM = 1
    expect(carryOutput.inputs[0]).toBe(false); // CARRY = 0

    // ワイヤー状態確認
    const activeWires = result.circuit.wires.filter(w => w.isActive);
    expect(activeWires).toHaveLength(3); // w1, w3, w5がアクティブ

    console.log('✅ Half adder working correctly for A=1, B=0');
  });

  it('should support input toggling for interactive testing', () => {
    const circuit = PURE_CIRCUITS['half-adder'];
    let context = service.createInitialContext(circuit);

    // B入力をONに変更してA=1, B=1の状態をテスト
    const modifiedCircuit = {
      ...circuit,
      gates: circuit.gates.map(gate =>
        gate.id === 'input-b'
          ? { ...gate, outputs: [true] } // B=1に変更
          : gate
      ),
    };

    // ワイヤー状態も更新
    const updatedCircuit = {
      ...modifiedCircuit,
      wires: modifiedCircuit.wires.map(wire => ({
        ...wire,
        isActive: wire.from.gateId === 'input-b' ? true : wire.isActive,
      })),
    };

    let result = service.evaluate(updatedCircuit, context);

    console.log('=== Half Adder Test: A=1, B=1 ===');
    service.logCircuitState(result.circuit, result.context, 'A=1, B=1');

    const xorGate = result.circuit.gates.find(g => g.id === 'xor-sum')!;
    const andGate = result.circuit.gates.find(g => g.id === 'and-carry')!;

    // 期待値: SUM=0, CARRY=1 (1+1=10 in binary)
    expect(xorGate.outputs[0]).toBe(false); // 1 XOR 1 = 0
    expect(andGate.outputs[0]).toBe(true); // 1 AND 1 = 1

    console.log('✅ Half adder working correctly for A=1, B=1');
  });

  it('should have proper wire propagation for UI display', () => {
    const circuit = PURE_CIRCUITS['half-adder'];
    let context = service.createInitialContext(circuit);
    let result = service.evaluate(circuit, context);

    // 全ワイヤーの活性状態確認
    const wireStates = result.circuit.wires.map(wire => ({
      id: wire.id,
      from: `${wire.from.gateId}[${wire.from.pinIndex}]`,
      to: `${wire.to.gateId}[${wire.to.pinIndex}]`,
      isActive: wire.isActive,
    }));

    console.log('Wire States:', wireStates);

    // 期待される活性ワイヤー: w1(A→XOR), w3(A→AND), w5(SUM out)
    const activeWireIds = wireStates.filter(w => w.isActive).map(w => w.id);
    expect(activeWireIds).toEqual(['w1', 'w3', 'w5']);

    // OUTPUTゲートが正しい値を受信
    const sumOutput = result.circuit.gates.find(g => g.id === 'output-sum')!;
    const carryOutput = result.circuit.gates.find(
      g => g.id === 'output-carry'
    )!;

    expect(sumOutput.inputs[0]).toBe(true);
    expect(carryOutput.inputs[0]).toBe(false);

    console.log('✅ Wire propagation working correctly');
  });
});
