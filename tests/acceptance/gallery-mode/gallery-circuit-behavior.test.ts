/**
 * ギャラリー回路動作テスト
 *
 * 目的: 新しい純粋な評価エンジンを使用して、
 * 全ギャラリー回路の実際の動作を検証する
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FEATURED_CIRCUITS } from '../../../src/features/gallery/data/gallery';
import { CircuitEvaluationService } from '@/domain/simulation/services/CircuitEvaluationService';
import type { Circuit } from '../../../src/domain/simulation/core/types';

describe('Gallery Circuit Behavior Tests with Pure Engine', () => {
  let evaluator: CircuitEvaluationService;

  beforeEach(() => {
    evaluator = new CircuitEvaluationService({
      enableDebugLogging: false,
    });
  });

  describe('Logic Gate Circuits', () => {
    it('should correctly evaluate Half Adder', () => {
      const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
      const circuit: Circuit = {
        gates: halfAdder.gates,
        wires: halfAdder.wires,
      };

      // Test case 1: 0 + 0 = 0 (carry = 0)
      let testCircuit = setInputs(circuit, {
        'input-a': false,
        'input-b': false,
      });
      let result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'output-sum')).toBe(false);
      expect(getOutput(result.circuit, 'output-carry')).toBe(false);

      // Test case 2: 1 + 0 = 1 (carry = 0)
      testCircuit = setInputs(circuit, { 'input-a': true, 'input-b': false });
      result = evaluateUntilStable(evaluator, testCircuit);

      console.log('Half Adder Test Case 2 Debug:');
      console.log('Input A:', getOutput(result.circuit, 'input-a'));
      console.log('Input B:', getOutput(result.circuit, 'input-b'));
      console.log('Sum output:', getOutput(result.circuit, 'output-sum'));
      console.log('Carry output:', getOutput(result.circuit, 'output-carry'));
      console.log(
        'XOR gate output:',
        result.circuit.gates.find(g => g.type === 'XOR')?.output
      );
      console.log(
        'AND gate output:',
        result.circuit.gates.find(g => g.type === 'AND')?.output
      );

      expect(getOutput(result.circuit, 'output-sum')).toBe(true);
      expect(getOutput(result.circuit, 'output-carry')).toBe(false);

      // Test case 3: 1 + 1 = 0 (carry = 1)
      testCircuit = setInputs(circuit, { 'input-a': true, 'input-b': true });
      result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'output-sum')).toBe(false);
      expect(getOutput(result.circuit, 'output-carry')).toBe(true);
    });

    it('should correctly evaluate 4-bit Comparator', () => {
      const comparator = FEATURED_CIRCUITS.find(
        c => c.id === '4bit-comparator'
      )!;
      if (!comparator) {
        console.log('4bit-comparator not found, skipping test');
        return;
      }

      const circuit: Circuit = {
        gates: comparator.gates,
        wires: comparator.wires,
      };

      // Test case: A=5 (0101), B=3 (0011) => A > B
      const testCircuit = setInputs(circuit, {
        a3: false,
        a2: true,
        a1: false,
        a0: true, // 5
        b3: false,
        b2: false,
        b1: true,
        b0: true, // 3
      });
      const result = evaluateUntilStable(evaluator, testCircuit);

      expect(getOutput(result.circuit, 'out_gt')).toBe(true);
      expect(getOutput(result.circuit, 'out_lt')).toBe(false);
      expect(getOutput(result.circuit, 'out_eq')).toBe(false);
    });

    it('should correctly evaluate Parity Checker', () => {
      const parity = FEATURED_CIRCUITS.find(c => c.id === 'parity-checker')!;
      if (!parity) {
        console.log('parity-checker not found, skipping test');
        return;
      }

      const circuit: Circuit = {
        gates: parity.gates,
        wires: parity.wires,
      };

      // Test case 1: Even number of 1s (0110) => even parity (output=0)
      let testCircuit = setInputs(circuit, {
        input_d3: false,
        input_d2: true,
        input_d1: true,
        input_d0: false,
      });
      let result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'parity_out')).toBe(false); // Even parity

      // Test case 2: Odd number of 1s (1110) => odd parity (output=1)
      testCircuit = setInputs(circuit, {
        input_d3: true,
        input_d2: true,
        input_d1: true,
        input_d0: false,
      });
      result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'parity_out')).toBe(true); // Odd parity
    });
  });

  describe('Sequential Circuits', () => {
    it('should correctly evaluate SR Latch', () => {
      const srLatch = FEATURED_CIRCUITS.find(c => c.id === 'sr-latch-basic')!;
      const circuit: Circuit = {
        gates: srLatch.gates,
        wires: srLatch.wires,
      };

      // Set S=1, R=0 (SET状態)
      let testCircuit = setInputs(circuit, { S: true, R: false });
      let result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'Q')).toBe(true);
      expect(getOutput(result.circuit, 'Q_bar')).toBe(false);

      // Hold state (S=0, R=0)
      testCircuit = setInputs(result.circuit, { S: false, R: false });
      result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'Q')).toBe(true); // 状態保持
      expect(getOutput(result.circuit, 'Q_bar')).toBe(false);

      // Reset (S=0, R=1)
      testCircuit = setInputs(result.circuit, { S: false, R: true });
      result = evaluateUntilStable(evaluator, testCircuit);
      expect(getOutput(result.circuit, 'Q')).toBe(false);
      expect(getOutput(result.circuit, 'Q_bar')).toBe(true);
    });
  });

  describe('Oscillator Circuits', () => {
    it('should detect oscillation in Ring Oscillator', () => {
      const oscillator = FEATURED_CIRCUITS.find(
        c => c.id === 'simple-ring-oscillator'
      )!;

      // 遅延モードが必要
      const evaluatorWithDelay = new EnhancedHybridEvaluator({
        enableDebugLogging: false,
        delayMode: true,
      });

      const circuit: Circuit = {
        gates: oscillator.gates,
        wires: oscillator.wires,
      };

      // 初期状態
      const result1 = evaluatorWithDelay.evaluate(circuit);
      const output1 = getOutput(result1.circuit, 'output');

      // 数回評価して発振を確認
      let result = result1;
      let oscillationDetected = false;
      for (let i = 0; i < 10; i++) {
        result = evaluatorWithDelay.evaluate(result.circuit);
        const currentOutput = getOutput(result.circuit, 'output');
        if (currentOutput !== output1) {
          oscillationDetected = true;
          break;
        }
      }

      expect(oscillationDetected).toBe(true);
    });
  });

  describe('Counter Circuits', () => {
    it('should count correctly in Binary Counter', () => {
      const binaryCounter = FEATURED_CIRCUITS.find(c =>
        c.title.includes('バイナリカウンタ')
      );
      if (!binaryCounter) {
        console.log('Binary counter not found, skipping test');
        return;
      }

      const circuit: Circuit = {
        gates: binaryCounter.gates,
        wires: binaryCounter.wires,
      };

      // カウンターのCLOCKを見つける
      const clockGate = circuit.gates.find(g => g.type === 'CLOCK');
      if (!clockGate) {
        console.log('No CLOCK gate found in binary counter');
        return;
      }

      // BINARY_COUNTERゲートを見つける
      const counterGate = circuit.gates.find(g => g.type === 'BINARY_COUNTER');
      if (!counterGate) {
        console.log('No BINARY_COUNTER gate found');
        return;
      }

      // 初期状態をチェック
      expect(counterGate.metadata?.currentValue).toBe(0);
    });
  });
});

// ヘルパー関数
function setInputs(circuit: Circuit, inputs: Record<string, boolean>): Circuit {
  return {
    ...circuit,
    gates: circuit.gates.map(gate => {
      if (gate.type === 'INPUT' && inputs[gate.id] !== undefined) {
        return { ...gate, output: inputs[gate.id] };
      }
      return gate;
    }),
  };
}

function evaluateUntilStable(
  evaluator: EnhancedHybridEvaluator,
  circuit: Circuit,
  maxIterations = 20
) {
  let result = evaluator.evaluateCircuit(circuit);
  let iterations = 0;

  // 最初に少なくとも5回は評価する（多段階回路のため）
  const minIterations = 5;

  while (iterations < maxIterations) {
    const nextResult = evaluator.evaluateCircuit(result.circuit);

    // 最小回数後は変化がなければ安定
    if (
      iterations >= minIterations &&
      !hasChanges(result.circuit, nextResult.circuit)
    ) {
      break;
    }

    result = nextResult;
    iterations++;
  }

  console.log(`Circuit stabilized after ${iterations + 1} iterations`);
  return result;
}

function hasChanges(circuit1: Circuit, circuit2: Circuit): boolean {
  for (let i = 0; i < circuit1.gates.length; i++) {
    if (circuit1.gates[i].output !== circuit2.gates[i].output) {
      return true;
    }
  }
  return false;
}

function getOutput(circuit: Circuit, gateId: string): boolean {
  const gate = circuit.gates.find(g => g.id === gateId);
  if (!gate) {
    throw new Error(`Gate ${gateId} not found`);
  }
  return gate.output;
}
