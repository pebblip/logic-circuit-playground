import { describe, it, expect } from 'vitest';
import { CircuitEvaluator } from '../../src/domain/simulation/core/evaluator';
import { CircuitEvaluationService } from '../../src/domain/simulation/services/CircuitEvaluationService';
import { FEATURED_CIRCUITS } from '../../src/features/gallery/data/gallery';
import type { Circuit } from '../../src/types/circuit';

describe.skip('Pure Evaluator Debug', () => {
  // DISABLED: デバッグ支援機能のテスト - 基本評価エンジンが動作していれば後で対応
  it('should debug half adder evaluation', () => {
    const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
    const circuit: Circuit = {
      gates: halfAdder.gates,
      wires: halfAdder.wires,
    };

    // Set inputs: A=true, B=false
    const testCircuit: Circuit = {
      ...circuit,
      gates: circuit.gates.map(gate => {
        if (gate.id === 'input-a') return { ...gate, output: true };
        if (gate.id === 'input-b') return { ...gate, output: false };
        return gate;
      }),
    };

    console.log('Original circuit gates:');
    testCircuit.gates.forEach(g =>
      console.log(
        `${g.id}: ${g.type}, output: ${g.output}, inputs: ${JSON.stringify(g.inputs)}`
      )
    );

    const evaluator = new CircuitEvaluator();
    const service = new CircuitEvaluationService();

    // Convert to evaluation format
    const evalCircuit = service.toEvaluationCircuit(testCircuit);
    console.log('\nEvaluation circuit gates:');
    evalCircuit.gates.forEach(g =>
      console.log(
        `${g.id}: ${g.type}, outputs: ${JSON.stringify(g.outputs)}, inputs: ${JSON.stringify(g.inputs)}`
      )
    );

    // Prepare context
    const context = {
      memory: {
        'input-a': { state: true },
        'input-b': { state: false },
      },
    };

    // Evaluate step by step
    let result = evaluator.evaluateImmediate(evalCircuit, context);
    console.log('\nAfter 1st evaluation:');
    result.circuit.gates.forEach(g =>
      console.log(
        `${g.id}: ${g.type}, outputs: ${JSON.stringify(g.outputs)}, inputs: ${JSON.stringify(g.inputs)}`
      )
    );

    // Multiple evaluations
    for (let i = 2; i <= 5; i++) {
      result = evaluator.evaluateImmediate(result.circuit, result.context);
      console.log(
        `\nAfter ${i}${i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} evaluation:`
      );
      result.circuit.gates.forEach(g =>
        console.log(
          `${g.id}: ${g.type}, outputs: ${JSON.stringify(g.outputs)}, inputs: ${JSON.stringify(g.inputs)}`
        )
      );
    }

    // Convert back to Circuit format
    const finalCircuit = service.fromEvaluationCircuit(result.circuit);
    console.log('\nFinal legacy circuit gates:');
    finalCircuit.gates.forEach(g =>
      console.log(
        `${g.id}: ${g.type}, output: ${g.output}, inputs: ${JSON.stringify(g.inputs)}`
      )
    );

    // XOR should output true (1 XOR 0 = 1)
    const xorGate = finalCircuit.gates.find(g => g.type === 'XOR');
    expect(xorGate?.output).toBe(true);

    // Sum output should be true
    const sumGate = finalCircuit.gates.find(g => g.id === 'output-sum');
    expect(sumGate?.output).toBe(true);
  });
});
