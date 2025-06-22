import { describe, it, expect, beforeEach } from 'vitest';
import type {
  EvaluationGate,
  EvaluationCircuit,
  EvaluationContext,
  EvaluatorResult,
} from '../../../src/domain/simulation/core/types';
import type { Wire } from '../../../src/types/circuit';
import { CircuitEvaluator } from '../../../src/domain/simulation/core/evaluator';

// テストヘルパー
function createPureGate(
  id: string,
  type: string,
  inputs: boolean[] = [],
  outputs: boolean[] = []
): EvaluationGate {
  return {
    id,
    type: type as any,
    position: { x: 0, y: 0 },
    inputs,
    outputs,
  };
}

function createWire(from: string, to: string, pinIndex = 0): Wire {
  return {
    id: `${from}->${to}`,
    from: { gateId: from, pinIndex: -1 },
    to: { gateId: to, pinIndex },
    isActive: false,
  };
}

describe('Circuit Evaluator', () => {
  let evaluator: CircuitEvaluator;
  let context: EvaluationContext;

  beforeEach(() => {
    evaluator = new CircuitEvaluator();

    context = {
      memory: {},
    };
  });

  describe('Basic Evaluation', () => {
    it('should evaluate simple AND gate circuit', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('in1', 'INPUT', [], [true]),
          createPureGate('in2', 'INPUT', [], [false]),
          createPureGate('and1', 'AND', [false, false], [false]),
          createPureGate('out1', 'OUTPUT', [false], []),
        ],
        wires: [
          createWire('in1', 'and1', 0),
          createWire('in2', 'and1', 1),
          createWire('and1', 'out1', 0),
        ],
      };

      // INPUTゲートの状態をメモリに設定
      context.memory = {
        in1: { state: true },
        in2: { state: false },
      };

      const result = evaluator.evaluateImmediate(circuit, context);

      // ANDゲートの入力が更新される
      const andGate = result.circuit.gates.find(g => g.id === 'and1')!;
      expect(andGate.inputs).toEqual([true, false]);
      expect(andGate.outputs).toEqual([false]);

      // OUTPUTゲートの入力が更新される
      const outGate = result.circuit.gates.find(g => g.id === 'out1')!;
      expect(outGate.inputs).toEqual([false]);

      // ワイヤーの状態が更新される
      const wire1 = result.circuit.wires.find(w => w.from.gateId === 'in1')!;
      expect(wire1.isActive).toBe(true);

      const wire2 = result.circuit.wires.find(w => w.from.gateId === 'in2')!;
      expect(wire2.isActive).toBe(false);
    });

    it('should evaluate multi-level circuit', () => {
      // A OR B -> AND with C
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('A', 'INPUT', [], [true]),
          createPureGate('B', 'INPUT', [], [false]),
          createPureGate('C', 'INPUT', [], [true]),
          createPureGate('or1', 'OR', [false, false], [false]),
          createPureGate('and1', 'AND', [false, false], [false]),
          createPureGate('out', 'OUTPUT', [false], []),
        ],
        wires: [
          createWire('A', 'or1', 0),
          createWire('B', 'or1', 1),
          createWire('or1', 'and1', 0),
          createWire('C', 'and1', 1),
          createWire('and1', 'out', 0),
        ],
      };

      // INPUTゲートの状態をメモリに設定
      context.memory = {
        A: { state: true },
        B: { state: false },
        C: { state: true },
      };

      // 収束するまで評価を繰り返す
      let result = evaluator.evaluateImmediate(circuit, context);
      let iterations = 0;
      const maxIterations = 10; // 無限ループを防ぐ

      while (result.hasChanges && iterations < maxIterations) {
        result = evaluator.evaluateImmediate(result.circuit, result.context);
        iterations++;
      }

      console.log(`Circuit converged after ${iterations + 1} iterations`);

      // OR gate: true OR false = true
      const orGate = result.circuit.gates.find(g => g.id === 'or1')!;
      expect(orGate.outputs).toEqual([true]);

      // AND gate: true AND true = true
      const andGate = result.circuit.gates.find(g => g.id === 'and1')!;
      expect(andGate.inputs).toEqual([true, true]);
      expect(andGate.outputs).toEqual([true]);

      // Output should receive true
      const outGate = result.circuit.gates.find(g => g.id === 'out')!;
      expect(outGate.inputs).toEqual([true]);
    });
  });

  describe('Sequential Logic', () => {
    it('should maintain SR-LATCH state', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('S', 'INPUT', [], [true]),
          createPureGate('R', 'INPUT', [], [false]),
          createPureGate('latch', 'SR-LATCH', [false, false], [false, true]),
          createPureGate('Q', 'OUTPUT', [false], []),
          createPureGate('QBAR', 'OUTPUT', [false], []),
        ],
        wires: [
          createWire('S', 'latch', 0),
          createWire('R', 'latch', 1),
          {
            id: 'latch->Q',
            from: { gateId: 'latch', pinIndex: 0 },
            to: { gateId: 'Q', pinIndex: 0 },
            isActive: false,
          },
          {
            id: 'latch->QBAR',
            from: { gateId: 'latch', pinIndex: 1 },
            to: { gateId: 'QBAR', pinIndex: 0 },
            isActive: false,
          },
        ],
      };

      // INPUTゲートの状態をメモリに設定
      context.memory = {
        S: { state: true },
        R: { state: false },
      };

      // First evaluation: Set the latch
      const result1 = evaluator.evaluateImmediate(circuit, context);
      const latch1 = result1.circuit.gates.find(g => g.id === 'latch')!;
      expect(latch1.outputs).toEqual([true, false]); // Q=1, Q̄=0

      // Change inputs to hold state
      const circuit2 = {
        ...result1.circuit,
        gates: result1.circuit.gates.map(g =>
          g.id === 'S'
            ? { ...g, outputs: [false] }
            : g.id === 'R'
              ? { ...g, outputs: [false] }
              : g
        ),
      };

      // S=0, R=0に更新
      const context2 = {
        ...result1.context,
        memory: {
          ...result1.context.memory,
          S: { state: false },
          R: { state: false },
        },
      };

      // Second evaluation: Should hold state
      const result2 = evaluator.evaluateImmediate(circuit2, context2);
      const latch2 = result2.circuit.gates.find(g => g.id === 'latch')!;
      expect(latch2.outputs).toEqual([true, false]); // State maintained
    });

    it('should handle D-FF on clock edge', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('D', 'INPUT', [], [true]),
          createPureGate('CLK', 'INPUT', [], [false]),
          createPureGate('dff', 'D-FF', [false, false], [false, true]),
          createPureGate('Q', 'OUTPUT', [false], []),
        ],
        wires: [
          createWire('D', 'dff', 0),
          createWire('CLK', 'dff', 1),
          createWire('dff', 'Q', 0),
        ],
      };

      // INPUTゲートの状態をメモリに設定
      context.memory = {
        D: { state: true },
        CLK: { state: false },
      };

      // Clock low
      const result1 = evaluator.evaluateImmediate(circuit, context);
      const dff1 = result1.circuit.gates.find(g => g.id === 'dff')!;
      expect(dff1.outputs).toEqual([false, true]); // No change

      // Clock high (rising edge)
      const circuit2 = {
        ...result1.circuit,
        gates: result1.circuit.gates.map(g =>
          g.id === 'CLK' ? { ...g, outputs: [true] } : g
        ),
      };

      // CLKをハイに更新
      const context2 = {
        ...result1.context,
        memory: {
          ...result1.context.memory,
          CLK: { state: true },
        },
      };

      const result2 = evaluator.evaluateImmediate(circuit2, context2);
      const dff2 = result2.circuit.gates.find(g => g.id === 'dff')!;
      expect(dff2.outputs).toEqual([true, false]); // D captured
    });
  });

  describe('Delay Mode', () => {
    it('should throw error for circular dependency without delay mode', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('not1', 'NOT', [false], [true]),
          createPureGate('not2', 'NOT', [false], [true]),
          createPureGate('not3', 'NOT', [false], [true]),
        ],
        wires: [
          createWire('not1', 'not2', 0),
          createWire('not2', 'not3', 0),
          createWire('not3', 'not1', 0), // Loop!
        ],
      };

      const result = evaluator.evaluateImmediate(circuit, context);
      expect(result.warnings).toContain(
        '循環回路が検出されました。遅延モードを有効にしてください。'
      );
    });

    it('should handle circular dependency with delay mode', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('not1', 'NOT', [true], [false]),
          createPureGate('not2', 'NOT', [false], [true]),
          createPureGate('not3', 'NOT', [true], [false]),
        ],
        wires: [
          createWire('not1', 'not2', 0),
          createWire('not2', 'not3', 0),
          createWire('not3', 'not1', 0),
        ],
      };

      const result = evaluator.evaluateDelayed(circuit, context);

      // Should not throw and circuit should be evaluated
      expect(result.circuit).toBeDefined();
      expect(result.hasChanges).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty circuit', () => {
      const circuit: EvaluationCircuit = {
        gates: [],
        wires: [],
      };

      const result = evaluator.evaluateImmediate(circuit, context);
      expect(result.circuit.gates).toEqual([]);
      expect(result.circuit.wires).toEqual([]);
      expect(result.hasChanges).toBe(false);
    });

    it('should handle disconnected gates', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('lonely1', 'AND', [false, false], [false]),
          createPureGate('lonely2', 'OR', [false, false], [false]),
        ],
        wires: [],
      };

      const result = evaluator.evaluateImmediate(circuit, context);

      // Gates should still be evaluated
      const and = result.circuit.gates.find(g => g.id === 'lonely1')!;
      expect(and.outputs).toEqual([false]);

      const or = result.circuit.gates.find(g => g.id === 'lonely2')!;
      expect(or.outputs).toEqual([false]);
    });
  });

  describe('Performance', () => {
    it('should detect no changes in stable circuit', () => {
      const circuit: EvaluationCircuit = {
        gates: [
          createPureGate('in1', 'INPUT', [], [false]),
          createPureGate('in2', 'INPUT', [], [false]),
          createPureGate('and1', 'AND', [false, false], [false]),
        ],
        wires: [createWire('in1', 'and1', 0), createWire('in2', 'and1', 1)],
      };

      // First evaluation
      const result1 = evaluator.evaluateImmediate(circuit, context);

      // Second evaluation with no input changes
      const result2 = evaluator.evaluateImmediate(
        result1.circuit,
        result1.context
      );

      expect(result2.hasChanges).toBe(false);
    });
  });
});
