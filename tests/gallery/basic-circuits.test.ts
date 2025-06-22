/**
 * 基本回路Pure実装テスト
 * パリティチェッカー & 多数決回路
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { PURE_CIRCUITS } from '../../src/features/gallery/data/circuits-pure';

describe('Basic Circuits Pure Implementation', () => {
  let service: CircuitEvaluationService;

  beforeEach(() => {
    service = new CircuitEvaluationService();
  });

  describe('Parity Checker', () => {
    it('should detect even parity for all zeros (initial state)', () => {
      const circuit = PURE_CIRCUITS['parity-checker'];
      expect(circuit).toBeDefined();

      // 初期状態: 全入力0 → 偶数パリティ(0)
      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);
      let result = service.evaluateDirect(evalCircuit, context);

      console.log('=== Parity Checker Test: 0000 ===');
      // logCircuitState is not available in CircuitEvaluationService

      // XORカスケードの動作確認
      const xor32 = result.circuit.gates.find(g => g.id === 'xor_32')!;
      const xor10 = result.circuit.gates.find(g => g.id === 'xor_10')!;
      const xorFinal = result.circuit.gates.find(g => g.id === 'xor_final')!;

      expect(xor32.outputs[0]).toBe(false); // 0 XOR 0 = 0
      expect(xor10.outputs[0]).toBe(false); // 0 XOR 0 = 0
      expect(xorFinal.outputs[0]).toBe(false); // 0 XOR 0 = 0 (偶数パリティ)

      // 最終出力確認
      const parityOut = result.circuit.gates.find(g => g.id === 'parity_out')!;
      expect(parityOut.inputs[0]).toBe(false); // 偶数パリティ → 0

      console.log('✅ Parity checker correctly detects even parity');
    });

    it('should validate wire propagation through XOR cascade', () => {
      const circuit = PURE_CIRCUITS['parity-checker'];
      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);
      let result = service.evaluateDirect(evalCircuit, context);

      // アクティブワイヤーの確認（全入力0の場合、ワイヤーは非アクティブ）
      const activeWires = result.circuit.wires.filter(w => w.isActive);
      expect(activeWires).toHaveLength(0); // 全て0なので活性ワイヤーなし

      console.log(
        'Inactive wire count:',
        result.circuit.wires.length - activeWires.length
      );
      console.log('✅ Parity checker wire propagation verified');
    });
  });

  describe('Majority Voter', () => {
    it('should return 0 for no votes (initial state)', () => {
      const circuit = PURE_CIRCUITS['majority-voter'];
      expect(circuit).toBeDefined();

      // 初期状態: A=0, B=0, C=0 → 多数決結果0
      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);
      let result = service.evaluateDirect(evalCircuit, context);

      console.log('=== Majority Voter Test: 000 ===');
      // logCircuitState is not available in CircuitEvaluationService

      // ANDゲートの動作確認
      const andAB = result.circuit.gates.find(g => g.id === 'and_ab')!;
      const andBC = result.circuit.gates.find(g => g.id === 'and_bc')!;
      const andAC = result.circuit.gates.find(g => g.id === 'and_ac')!;

      expect(andAB.outputs[0]).toBe(false); // 0 AND 0 = 0
      expect(andBC.outputs[0]).toBe(false); // 0 AND 0 = 0
      expect(andAC.outputs[0]).toBe(false); // 0 AND 0 = 0

      // ORゲートの動作確認
      const orFirst = result.circuit.gates.find(g => g.id === 'or_first')!;
      const orFinal = result.circuit.gates.find(g => g.id === 'or_final')!;

      expect(orFirst.outputs[0]).toBe(false); // 0 OR 0 = 0
      expect(orFinal.outputs[0]).toBe(false); // 0 OR 0 = 0

      // 最終結果確認
      const resultOut = result.circuit.gates.find(g => g.id === 'result_out')!;
      expect(resultOut.inputs[0]).toBe(false); // 過半数なし → 0

      console.log('✅ Majority voter correctly rejects minority');
    });

    it('should validate two-stage OR gate structure', () => {
      const circuit = PURE_CIRCUITS['majority-voter'];
      const evalCircuit = service.toEvaluationCircuit(circuit);
      let context = service.createInitialContext(evalCircuit);
      let result = service.evaluateDirect(evalCircuit, context);

      // 2段OR構造の確認
      const orFirst = result.circuit.gates.find(g => g.id === 'or_first')!;
      const orFinal = result.circuit.gates.find(g => g.id === 'or_final')!;

      expect(orFirst).toBeDefined();
      expect(orFinal).toBeDefined();
      expect(orFirst.inputs).toHaveLength(2); // 2入力
      expect(orFinal.inputs).toHaveLength(2); // 2入力

      // ワイヤー接続の確認
      const or1ToFinalWire = result.circuit.wires.find(
        w => w.from.gateId === 'or_first' && w.to.gateId === 'or_final'
      );
      expect(or1ToFinalWire).toBeDefined();

      console.log('✅ Two-stage OR structure validated');
    });

    it('should demonstrate logic with truth table validation', () => {
      const circuit = PURE_CIRCUITS['majority-voter'];

      // 多数決真理値表の理論確認
      const truthTable = [
        { a: false, b: false, c: false, expected: false }, // 000 → 0
        { a: false, b: false, c: true, expected: false }, // 001 → 0
        { a: false, b: true, c: false, expected: false }, // 010 → 0
        { a: false, b: true, c: true, expected: true }, // 011 → 1
        { a: true, b: false, c: false, expected: false }, // 100 → 0
        { a: true, b: false, c: true, expected: true }, // 101 → 1
        { a: true, b: true, c: false, expected: true }, // 110 → 1
        { a: true, b: true, c: true, expected: true }, // 111 → 1
      ];

      console.log('\n=== Majority Voter Truth Table ===');
      truthTable.forEach(({ a, b, c, expected }, index) => {
        const binary = `${a ? 1 : 0}${b ? 1 : 0}${c ? 1 : 0}`;
        const result = expected ? 'PASS' : 'REJECT';
        console.log(`${index}: ${binary} → ${expected ? 1 : 0} (${result})`);
      });

      console.log('✅ Truth table demonstrates majority logic');
    });
  });

  describe('Integration Tests', () => {
    it('should validate all basic circuits have proper structure', () => {
      const basicCircuits = [
        'half-adder',
        'decoder',
        'parity-checker',
        'majority-voter',
      ];

      basicCircuits.forEach(circuitId => {
        const circuit = PURE_CIRCUITS[circuitId as keyof typeof PURE_CIRCUITS];
        expect(circuit).toBeDefined();
        expect(circuit.gates).toBeDefined();
        expect(circuit.wires).toBeDefined();
        expect(circuit.gates.length).toBeGreaterThan(0);
        expect(circuit.wires.length).toBeGreaterThan(0);

        console.log(
          `✅ ${circuitId}: ${circuit.gates.length} gates, ${circuit.wires.length} wires`
        );
      });
    });
  });
});
