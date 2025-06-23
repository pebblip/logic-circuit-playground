import { describe, test, expect, beforeEach } from 'vitest';
import { CircuitEvaluationService } from '@/domain/simulation/services/CircuitEvaluationService';
import { GateFactory } from '@/models/gates/GateFactory';
import type { Gate, Wire, Circuit } from '@/types/circuit';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';

/**
 * 論理回路の正確性テスト
 *
 * このテストは教育ツールとしての最重要機能を保護します。
 * 間違った論理を教えることは絶対に許されません。
 */
describe('論理回路の正確性 (新アーキテクチャ)', () => {
  let evaluationService: CircuitEvaluationService;

  beforeEach(() => {
    evaluationService = new CircuitEvaluationService({
      enableDebugLogging: false,
    });
  });

  describe('基本ゲートの真理値表', () => {
    test('ANDゲート: 両方が1の時のみ1を出力', () => {
      const testCases = [
        { inputs: [false, false], expected: false },
        { inputs: [false, true], expected: false },
        { inputs: [true, false], expected: false },
        { inputs: [true, true], expected: true },
      ];

      testCases.forEach(({ inputs, expected }) => {
        const gate = GateFactory.createGate('AND', { x: 100, y: 100 });
        gate.inputs = inputs;

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'AND');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });

    test('ORゲート: どちらかが1なら1を出力', () => {
      const testCases = [
        { inputs: [false, false], expected: false },
        { inputs: [false, true], expected: true },
        { inputs: [true, false], expected: true },
        { inputs: [true, true], expected: true },
      ];

      testCases.forEach(({ inputs, expected }) => {
        const gate = GateFactory.createGate('OR', { x: 100, y: 100 });
        gate.inputs = inputs;

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'OR');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });

    test('NOTゲート: 入力を反転', () => {
      const testCases = [
        { input: false, expected: true },
        { input: true, expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const gate = GateFactory.createGate('NOT', { x: 100, y: 100 });
        gate.inputs = [input];

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'NOT');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });

    test('XORゲート: 入力が異なる時のみ1を出力', () => {
      const testCases = [
        { inputs: [false, false], expected: false },
        { inputs: [false, true], expected: true },
        { inputs: [true, false], expected: true },
        { inputs: [true, true], expected: false },
      ];

      testCases.forEach(({ inputs, expected }) => {
        const gate = GateFactory.createGate('XOR', { x: 100, y: 100 });
        gate.inputs = inputs;

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'XOR');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });

    test('NANDゲート: ANDの否定', () => {
      const testCases = [
        { inputs: [false, false], expected: true },
        { inputs: [false, true], expected: true },
        { inputs: [true, false], expected: true },
        { inputs: [true, true], expected: false },
      ];

      testCases.forEach(({ inputs, expected }) => {
        const gate = GateFactory.createGate('NAND', { x: 100, y: 100 });
        gate.inputs = inputs;

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'NAND');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });

    test('NORゲート: ORの否定', () => {
      const testCases = [
        { inputs: [false, false], expected: true },
        { inputs: [false, true], expected: false },
        { inputs: [true, false], expected: false },
        { inputs: [true, true], expected: false },
      ];

      testCases.forEach(({ inputs, expected }) => {
        const gate = GateFactory.createGate('NOR', { x: 100, y: 100 });
        gate.inputs = inputs;

        const circuit: Circuit = {
          gates: [gate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedGate = result.circuit.gates.find(g => g.type === 'NOR');
        expect(evaluatedGate?.outputs[0]).toBe(expected);
      });
    });
  });

  describe('組み合わせ回路の正確性', () => {
    test('半加算器: 1ビットの加算が正しく計算される', () => {
      const testCases = [
        { a: false, b: false, sum: false, carry: false },
        { a: false, b: true, sum: true, carry: false },
        { a: true, b: false, sum: true, carry: false },
        { a: true, b: true, sum: false, carry: true },
      ];

      testCases.forEach(({ a, b, sum, carry }) => {
        // 半加算器の構築
        const inputA = GateFactory.createGate('INPUT', { x: 100, y: 100 });
        inputA.id = 'input_a';
        inputA.outputs = [a];

        const inputB = GateFactory.createGate('INPUT', { x: 100, y: 200 });
        inputB.id = 'input_b';
        inputB.outputs = [b];

        const xorGate = GateFactory.createGate('XOR', { x: 300, y: 100 });
        xorGate.id = 'xor_sum';
        xorGate.inputs = [false, false]; // ワイヤーで接続される

        const andGate = GateFactory.createGate('AND', { x: 300, y: 200 });
        andGate.id = 'and_carry';
        andGate.inputs = [false, false]; // ワイヤーで接続される

        const outputSum = GateFactory.createGate('OUTPUT', { x: 500, y: 100 });
        outputSum.id = 'output_sum';
        outputSum.inputs = [false];

        const outputCarry = GateFactory.createGate('OUTPUT', { x: 500, y: 200 });
        outputCarry.id = 'output_carry';
        outputCarry.inputs = [false];

        const gates: Gate[] = [inputA, inputB, xorGate, andGate, outputSum, outputCarry];

        const wires: Wire[] = [
          {
            id: 'w1',
            from: { gateId: 'input_a', pinIndex: 0 },
            to: { gateId: 'xor_sum', pinIndex: 0 },
            isActive: a,
          },
          {
            id: 'w2',
            from: { gateId: 'input_b', pinIndex: 0 },
            to: { gateId: 'xor_sum', pinIndex: 1 },
            isActive: b,
          },
          {
            id: 'w3',
            from: { gateId: 'input_a', pinIndex: 0 },
            to: { gateId: 'and_carry', pinIndex: 0 },
            isActive: a,
          },
          {
            id: 'w4',
            from: { gateId: 'input_b', pinIndex: 0 },
            to: { gateId: 'and_carry', pinIndex: 1 },
            isActive: b,
          },
          {
            id: 'w5',
            from: { gateId: 'xor_sum', pinIndex: 0 },
            to: { gateId: 'output_sum', pinIndex: 0 },
            isActive: false,
          },
          {
            id: 'w6',
            from: { gateId: 'and_carry', pinIndex: 0 },
            to: { gateId: 'output_carry', pinIndex: 0 },
            isActive: false,
          },
        ];

        const circuit: Circuit = { gates, wires };
        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const sumGate = result.circuit.gates.find(g => g.id === 'xor_sum');
        const carryGate = result.circuit.gates.find(g => g.id === 'and_carry');

        expect(sumGate?.outputs[0]).toBe(sum);
        expect(carryGate?.outputs[0]).toBe(carry);
      });
    });

    test('多数決器: 3入力の多数決が正しく動作する', () => {
      const testCases = [
        { inputs: [false, false, false], expected: false },
        { inputs: [false, false, true], expected: false },
        { inputs: [false, true, false], expected: false },
        { inputs: [false, true, true], expected: true },
        { inputs: [true, false, false], expected: false },
        { inputs: [true, false, true], expected: true },
        { inputs: [true, true, false], expected: true },
        { inputs: [true, true, true], expected: true },
      ];

      testCases.forEach(({ inputs, expected }) => {
        // 多数決器 = (A AND B) OR (B AND C) OR (A AND C)
        const [a, b, c] = inputs;

        const inputA = GateFactory.createGate('INPUT', { x: 100, y: 100 });
        inputA.id = 'input_a';
        inputA.outputs = [a];

        const inputB = GateFactory.createGate('INPUT', { x: 100, y: 200 });
        inputB.id = 'input_b';
        inputB.outputs = [b];

        const inputC = GateFactory.createGate('INPUT', { x: 100, y: 300 });
        inputC.id = 'input_c';
        inputC.outputs = [c];

        const and1 = GateFactory.createGate('AND', { x: 300, y: 100 });
        and1.id = 'and_ab';
        and1.inputs = [false, false];

        const and2 = GateFactory.createGate('AND', { x: 300, y: 200 });
        and2.id = 'and_bc';
        and2.inputs = [false, false];

        const and3 = GateFactory.createGate('AND', { x: 300, y: 300 });
        and3.id = 'and_ac';
        and3.inputs = [false, false];

        const or1 = GateFactory.createGate('OR', { x: 500, y: 150 });
        or1.id = 'or_temp';
        or1.inputs = [false, false];

        const or2 = GateFactory.createGate('OR', { x: 700, y: 200 });
        or2.id = 'or_final';
        or2.inputs = [false, false];

        const gates: Gate[] = [inputA, inputB, inputC, and1, and2, and3, or1, or2];

        const wires: Wire[] = [
          // A to AND gates
          { id: 'w1', from: { gateId: 'input_a', pinIndex: 0 }, to: { gateId: 'and_ab', pinIndex: 0 }, isActive: a },
          { id: 'w2', from: { gateId: 'input_a', pinIndex: 0 }, to: { gateId: 'and_ac', pinIndex: 0 }, isActive: a },
          // B to AND gates
          { id: 'w3', from: { gateId: 'input_b', pinIndex: 0 }, to: { gateId: 'and_ab', pinIndex: 1 }, isActive: b },
          { id: 'w4', from: { gateId: 'input_b', pinIndex: 0 }, to: { gateId: 'and_bc', pinIndex: 0 }, isActive: b },
          // C to AND gates
          { id: 'w5', from: { gateId: 'input_c', pinIndex: 0 }, to: { gateId: 'and_bc', pinIndex: 1 }, isActive: c },
          { id: 'w6', from: { gateId: 'input_c', pinIndex: 0 }, to: { gateId: 'and_ac', pinIndex: 1 }, isActive: c },
          // AND to OR
          { id: 'w7', from: { gateId: 'and_ab', pinIndex: 0 }, to: { gateId: 'or_temp', pinIndex: 0 }, isActive: false },
          { id: 'w8', from: { gateId: 'and_bc', pinIndex: 0 }, to: { gateId: 'or_temp', pinIndex: 1 }, isActive: false },
          { id: 'w9', from: { gateId: 'or_temp', pinIndex: 0 }, to: { gateId: 'or_final', pinIndex: 0 }, isActive: false },
          { id: 'w10', from: { gateId: 'and_ac', pinIndex: 0 }, to: { gateId: 'or_final', pinIndex: 1 }, isActive: false },
        ];

        const circuit: Circuit = { gates, wires };
        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const finalGate = result.circuit.gates.find(g => g.id === 'or_final');
        expect(finalGate?.outputs[0]).toBe(expected);
      });
    });
  });

  describe('順序回路の正確性', () => {
    test('SR-Latch: セット・リセットの基本動作', () => {
      const testCases = [
        { s: false, r: false, expectedQ: false, expectedQBar: true, description: '保持状態' },
        { s: true, r: false, expectedQ: true, expectedQBar: false, description: 'セット' },
        { s: false, r: true, expectedQ: false, expectedQBar: true, description: 'リセット' },
      ];

      testCases.forEach(({ s, r, expectedQ, expectedQBar, description }) => {
        const srLatch = GateFactory.createGate('SR-LATCH', { x: 300, y: 200 });
        srLatch.inputs = [s, r]; // S, R
        srLatch.outputs = [false, true]; // 初期状態: Q=0, Q̄=1

        const circuit: Circuit = {
          gates: [srLatch],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        let context = evaluationService.createInitialContext(evalCircuit);

        // 複数回評価して安定化
        for (let i = 0; i < 3; i++) {
          const result = evaluationService.evaluateDirect(evalCircuit, context);
          context = result.context;
        }

        const result = evaluationService.evaluateDirect(evalCircuit, context);
        const evaluatedLatch = result.circuit.gates.find(g => g.type === 'SR-LATCH');

        expect(evaluatedLatch?.outputs[0]).toBe(expectedQ);
        expect(evaluatedLatch?.outputs[1]).toBe(expectedQBar);
      });
    });

    test('D-FF: クロックの立ち上がりエッジでデータをラッチ', () => {
      const dff = GateFactory.createGate('D-FF', { x: 300, y: 200 });
      dff.inputs = [true, false]; // D=1, CLK=0
      dff.outputs = [false, true]; // 初期状態: Q=0, Q̄=1

      const circuit: Circuit = {
        gates: [dff],
        wires: [],
      };

      const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
      let context = evaluationService.createInitialContext(evalCircuit);

      // CLK=0の時は変化なし
      let result = evaluationService.evaluateDirect(evalCircuit, context);
      context = result.context;
      let evaluatedDFF = result.circuit.gates.find(g => g.type === 'D-FF');
      expect(evaluatedDFF?.outputs[0]).toBe(false); // Q
      expect(evaluatedDFF?.outputs[1]).toBe(true);  // Q̄

      // CLK=0→1の立ち上がりエッジでD=1をラッチ
      // 新しい回路を作成してCLK=1に設定
      const dffRising = GateFactory.createGate('D-FF', { x: 300, y: 200 });
      dffRising.inputs = [true, true]; // D=1, CLK=1
      dffRising.outputs = [false, true];

      const circuitRising: Circuit = {
        gates: [dffRising],
        wires: [],
      };

      const evalCircuitRising = evaluationService.toEvaluationCircuit(circuitRising);
      context = evaluationService.createInitialContext(evalCircuitRising);

      result = evaluationService.evaluateDirect(evalCircuitRising, context);
      evaluatedDFF = result.circuit.gates.find(g => g.type === 'D-FF');
      
      // D-FFは立ち上がりエッジでラッチするので、D=1がQ出力に反映される
      expect(evaluatedDFF?.outputs[0]).toBe(true);  // Q
      expect(evaluatedDFF?.outputs[1]).toBe(false); // Q̄
    });
  });

  describe('特殊ゲートの動作', () => {
    test('INPUTゲート: 設定された値を出力', () => {
      const testValues = [true, false];

      testValues.forEach(value => {
        const inputGate = GateFactory.createGate('INPUT', { x: 100, y: 100 });
        inputGate.outputs = [value];

        const circuit: Circuit = {
          gates: [inputGate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedInput = result.circuit.gates.find(g => g.type === 'INPUT');
        expect(evaluatedInput?.outputs[0]).toBe(value);
      });
    });

    test('OUTPUTゲート: 入力値を表示', () => {
      const testValues = [true, false];

      testValues.forEach(value => {
        const outputGate = GateFactory.createGate('OUTPUT', { x: 100, y: 100 });
        outputGate.inputs = [value];

        const circuit: Circuit = {
          gates: [outputGate],
          wires: [],
        };

        const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
        const context = evaluationService.createInitialContext(evalCircuit);
        const result = evaluationService.evaluateDirect(evalCircuit, context);

        const evaluatedOutput = result.circuit.gates.find(g => g.type === 'OUTPUT');
        expect(evaluatedOutput?.inputs[0]).toBe(value);
      });
    });

    test('CLOCKゲート: メタデータに基づいた動作', () => {
      // 停止中のCLOCKは常にfalseを出力
      const stoppedClock = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      stoppedClock.metadata = {
        ...stoppedClock.metadata,
        frequency: 1,
        isRunning: false,
        startTime: 0,
      };

      const circuit: Circuit = {
        gates: [stoppedClock],
        wires: [],
      };

      const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
      let context = evaluationService.createInitialContext(evalCircuit);
      context.currentTime = 1000; // 1秒後

      const result = evaluationService.evaluateDirect(evalCircuit, context);
      const evaluatedClock = result.circuit.gates.find(g => g.type === 'CLOCK');
      expect(evaluatedClock?.outputs[0]).toBe(false);
    });
  });
});