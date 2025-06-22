/**
 * 全ギャラリー回路の包括的動作検証テスト
 *
 * 目的: すべてのギャラリー回路が期待通りに動作することを保証
 * - 静的回路: 入力に対して正しい出力を生成
 * - 動的回路: 時間経過で期待される振動・変化パターン
 * - メモリ回路: 状態保持と変更
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FEATURED_CIRCUITS } from '../../../src/features/gallery/data/gallery';
import { CircuitEvaluationService } from '../../../src/domain/simulation/services/CircuitEvaluationService';
import type { Circuit } from '../../../src/types/circuit';

describe('All Gallery Circuits Comprehensive Test', () => {
  let evaluator: CircuitEvaluationService;

  beforeEach(() => {
    evaluator = new CircuitEvaluationService({
      enableDebugLogging: false,
      delayMode: true,
    });
  });

  describe('Circuit Availability', () => {
    it('should have all expected circuits', () => {
      expect(FEATURED_CIRCUITS).toHaveLength(15);

      const circuitIds = FEATURED_CIRCUITS.map(c => c.id);
      const expectedIds = [
        'half-adder',
        'sr-latch',
        'decoder',
        '4bit-comparator',
        'parity-checker',
        'majority-voter',
        'seven-segment',
        'sr-latch-basic',
        'simple-ring-oscillator',
        'simple-lfsr',
        'chaos-generator',
        'fibonacci-counter',
        'johnson-counter',
        'self-oscillating-memory-final',
        'mandala-circuit',
      ];

      expectedIds.forEach(id => {
        expect(circuitIds).toContain(id);
      });
    });
  });

  describe('Static Circuits (Combinational Logic)', () => {
    it('half-adder should compute sum and carry correctly', () => {
      const halfAdder = FEATURED_CIRCUITS.find(c => c.id === 'half-adder')!;
      let circuit: Circuit = {
        gates: structuredClone(halfAdder.gates),
        wires: structuredClone(halfAdder.wires),
      };

      // Test cases: (A, B) => (Sum, Carry)
      const testCases = [
        { a: false, b: false, sum: false, carry: false },
        { a: false, b: true, sum: true, carry: false },
        { a: true, b: false, sum: true, carry: false },
        { a: true, b: true, sum: false, carry: true },
      ];

      testCases.forEach(({ a, b, sum, carry }) => {
        // Set inputs
        const inputA = circuit.gates.find(g => g.id === 'input-a')!;
        const inputB = circuit.gates.find(g => g.id === 'input-b')!;
        inputA.output = a;
        inputB.output = b;

        // Evaluate
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;

        // Check outputs
        const outputSum = circuit.gates.find(g => g.id === 'output-sum')!;
        const outputCarry = circuit.gates.find(g => g.id === 'output-carry')!;

        expect(outputSum.inputs[0]).toBe(sum ? '1' : '');
        expect(outputCarry.inputs[0]).toBe(carry ? '1' : '');
      });
    });

    it('decoder should decode 2-bit input correctly', () => {
      const decoder = FEATURED_CIRCUITS.find(c => c.id === 'decoder')!;
      let circuit: Circuit = {
        gates: structuredClone(decoder.gates),
        wires: structuredClone(decoder.wires),
      };

      // Test all 2-bit combinations
      const testCases = [
        { a: false, b: false, outputs: [true, false, false, false] },
        { a: true, b: false, outputs: [false, true, false, false] },
        { a: false, b: true, outputs: [false, false, true, false] },
        { a: true, b: true, outputs: [false, false, false, true] },
      ];

      testCases.forEach(({ a, b, outputs }) => {
        // Set inputs
        const inputA = circuit.gates.find(g => g.id === 'input_a')!;
        const inputB = circuit.gates.find(g => g.id === 'input_b')!;
        inputA.output = a;
        inputB.output = b;

        // Evaluate multiple times to ensure propagation
        for (let i = 0; i < 5; i++) {
          const result = evaluator.evaluateCircuit(circuit).data;
          circuit = result.circuit;
        }

        // Check outputs by looking at the connected wire states
        outputs.forEach((expected, index) => {
          const outputGate = circuit.gates.find(
            g => g.id === `output_${index}`
          )!;
          // Find the wire connected to this output
          const wire = circuit.wires.find(
            w => w.to.gateId === outputGate.id && w.to.pinIndex === 0
          );
          if (wire) {
            expect(wire.isActive).toBe(expected);
          }
        });
      });
    });

    it('4bit-comparator should compare correctly', () => {
      const comparator = FEATURED_CIRCUITS.find(
        c => c.id === '4bit-comparator'
      );
      if (!comparator) {
        throw new Error('4bit-comparator circuit not found');
      }
      let circuit: Circuit = {
        gates: structuredClone(comparator.gates),
        wires: structuredClone(comparator.wires),
      };

      // Test A=5, B=3 => A>B
      const setInputs = (aValue: number, bValue: number) => {
        for (let i = 0; i < 4; i++) {
          const aGate = circuit.gates.find(g => g.id === `a${i}`)!;
          const bGate = circuit.gates.find(g => g.id === `b${i}`)!;
          aGate.output = Boolean((aValue >> i) & 1);
          bGate.output = Boolean((bValue >> i) & 1);
        }
      };

      // Test case: 5 > 3
      setInputs(5, 3);
      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      const gtWire = circuit.wires.find(
        w => w.to.gateId === 'out_gt' && w.to.pinIndex === 0
      )!;
      const eqWire = circuit.wires.find(
        w => w.to.gateId === 'out_eq' && w.to.pinIndex === 0
      )!;
      const ltWire = circuit.wires.find(
        w => w.to.gateId === 'out_lt' && w.to.pinIndex === 0
      )!;

      expect(gtWire.isActive).toBe(true);
      expect(eqWire.isActive).toBe(false);
      expect(ltWire.isActive).toBe(false);
    });

    it('parity-checker should detect odd parity', () => {
      const parity = FEATURED_CIRCUITS.find(c => c.id === 'parity-checker');
      if (!parity) {
        throw new Error('parity-checker circuit not found');
      }
      let circuit: Circuit = {
        gates: structuredClone(parity.gates),
        wires: structuredClone(parity.wires),
      };

      // Test with 3 bits set (odd parity)
      const inputs = ['input_d3', 'input_d2', 'input_d1', 'input_d0'];
      inputs.forEach((id, index) => {
        const gate = circuit.gates.find(g => g.id === id);
        if (gate) {
          gate.output = index < 3; // First 3 are true
        }
      });

      for (let i = 0; i < 5; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      const outputWire = circuit.wires.find(
        w => w.to.gateId === 'parity_out' && w.to.pinIndex === 0
      )!;
      expect(outputWire.isActive).toBe(true); // Odd parity
    });

    it('majority-voter should output majority decision', () => {
      const voter = FEATURED_CIRCUITS.find(c => c.id === 'majority-voter');
      if (!voter) {
        throw new Error('majority-voter circuit not found');
      }
      let circuit: Circuit = {
        gates: structuredClone(voter.gates),
        wires: structuredClone(voter.wires),
      };

      // Test with 2 out of 3 inputs true
      const inputA = circuit.gates.find(g => g.id === 'voter_a');
      const inputB = circuit.gates.find(g => g.id === 'voter_b');
      const inputC = circuit.gates.find(g => g.id === 'voter_c');

      if (inputA && inputB && inputC) {
        inputA.output = true;
        inputB.output = true;
        inputC.output = false;
      }

      for (let i = 0; i < 5; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      const outputWire = circuit.wires.find(
        w => w.to.gateId === 'result' && w.to.pinIndex === 0
      )!;
      expect(outputWire.isActive).toBe(true); // Majority is true
    });

    it('seven-segment should display digit correctly', () => {
      const sevenSeg = FEATURED_CIRCUITS.find(c => c.id === 'seven-segment');
      if (!sevenSeg) {
        throw new Error('seven-segment circuit not found');
      }
      let circuit: Circuit = {
        gates: structuredClone(sevenSeg.gates),
        wires: structuredClone(sevenSeg.wires),
      };

      // Test displaying "3" (11 in binary - only 2 bits)
      const setDigit = (digit: number) => {
        const inputB0 = circuit.gates.find(g => g.id === 'input_b0')!;
        const inputB1 = circuit.gates.find(g => g.id === 'input_b1')!;
        inputB0.output = Boolean(digit & 1);
        inputB1.output = Boolean((digit >> 1) & 1);
      };

      setDigit(3);
      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      // For digit 3, segments a,b,c,d,g should be on
      const expectedSegments = {
        out_a: true,
        out_b: true,
        out_c: true,
        out_d: true,
        out_e: false,
        out_f: false,
        out_g: true,
      };

      Object.entries(expectedSegments).forEach(([id, expected]) => {
        const wire = circuit.wires.find(
          w => w.to.gateId === id && w.to.pinIndex === 0
        )!;
        expect(wire.isActive).toBe(expected);
      });
    });
  });

  describe('Memory Circuits', () => {
    it('sr-latch (gate version) should hold state', () => {
      const srLatch = FEATURED_CIRCUITS.find(c => c.id === 'sr-latch')!;
      let circuit: Circuit = {
        gates: structuredClone(srLatch.gates),
        wires: structuredClone(srLatch.wires),
      };

      const inputS = circuit.gates.find(g => g.id === 'input_s')!;
      const inputR = circuit.gates.find(g => g.id === 'input_r')!;

      // Set the latch (S=1, R=0)
      inputS.output = true;
      inputR.output = false;

      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      const outputQ = circuit.gates.find(g => g.id === 'output_q')!;
      const outputQBar = circuit.gates.find(g => g.id === 'output_q_bar')!;

      expect(outputQ.inputs[0]).toBe('1');
      expect(outputQBar.inputs[0]).toBe('');

      // Hold state (S=0, R=0)
      inputS.output = false;
      inputR.output = false;

      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      // Should maintain state - check the SR-LATCH gate itself
      const srLatchGate = circuit.gates.find(g => g.type === 'SR-LATCH')!;
      expect(srLatchGate.output).toBe(true); // Q output
      expect(srLatchGate.metadata?.qBarOutput).toBe(false); // Q̄ output
    });

    it('sr-latch-basic should toggle states correctly', () => {
      const srLatchBasic = FEATURED_CIRCUITS.find(
        c => c.id === 'sr-latch-basic'
      )!;
      let circuit: Circuit = {
        gates: structuredClone(srLatchBasic.gates),
        wires: structuredClone(srLatchBasic.wires),
      };

      const inputS = circuit.gates.find(g => g.id === 'S')!;
      const inputR = circuit.gates.find(g => g.id === 'R')!;

      // Set state
      inputS.output = true;
      inputR.output = false;

      for (let i = 0; i < 10; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;
      }

      const outputWire = circuit.wires.find(
        w => w.to.gateId === 'Q' && w.to.pinIndex === 0
      )!;
      expect(outputWire.isActive).toBe(true);
    });
  });

  describe('Oscillating Circuits', () => {
    it('simple-ring-oscillator should oscillate', () => {
      const ring = FEATURED_CIRCUITS.find(
        c => c.id === 'simple-ring-oscillator'
      )!;
      let circuit: Circuit = {
        gates: structuredClone(ring.gates),
        wires: structuredClone(ring.wires),
      };

      const states: string[] = [];

      for (let i = 0; i < 30; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;

        const notGates = circuit.gates
          .filter(g => g.type === 'NOT')
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(g => (g.output ? '1' : '0'))
          .join('');

        states.push(notGates);
      }

      // Should have changing states
      const uniqueStates = new Set(states);
      expect(uniqueStates.size).toBeGreaterThan(1);
    });

    it('simple-lfsr should generate pseudo-random sequence', () => {
      const lfsr = FEATURED_CIRCUITS.find(c => c.id === 'simple-lfsr')!;
      let circuit: Circuit = {
        gates: structuredClone(lfsr.gates),
        wires: structuredClone(lfsr.wires),
      };

      // Find CLOCK and start it
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      if (clock) {
        clock.metadata = {
          ...clock.metadata,
          isRunning: true,
          startTime: Date.now(),
        };
      }

      const sequence: number[] = [];
      const originalDateNow = Date.now;
      const baseTime = originalDateNow();

      for (let cycle = 0; cycle < 10; cycle++) {
        // Mock time progression
        const mockTime = baseTime + cycle * 700;
        Date.now = () => mockTime;

        for (let i = 0; i < 10; i++) {
          const result = evaluator.evaluateCircuit(circuit).data;
          circuit = result.circuit;
        }

        // Read the state from OUTPUT gates
        const outputs = circuit.gates
          .filter(g => g.type === 'OUTPUT')
          .sort((a, b) => a.id.localeCompare(b.id));

        let value = 0;
        outputs.forEach((gate, index) => {
          if (gate.inputs[0] === '1' || gate.inputs[0] === true) {
            value |= 1 << index;
          }
        });

        sequence.push(value);

        // Restore Date.now
        Date.now = originalDateNow;
      }

      // LFSR should produce changing values
      const uniqueValues = new Set(sequence);
      expect(uniqueValues.size).toBeGreaterThan(3);
    });

    it('johnson-counter should cycle through states', () => {
      const johnson = FEATURED_CIRCUITS.find(c => c.id === 'johnson-counter')!;
      let circuit: Circuit = {
        gates: structuredClone(johnson.gates),
        wires: structuredClone(johnson.wires),
      };

      // Find CLOCK and start it
      const clock = circuit.gates.find(g => g.type === 'CLOCK');
      if (clock) {
        clock.metadata = {
          ...clock.metadata,
          isRunning: true,
          startTime: Date.now(),
        };
      }

      const states: string[] = [];
      const originalDateNow = Date.now;
      const baseTime = originalDateNow();

      for (let cycle = 0; cycle < 8; cycle++) {
        // Mock time progression
        const mockTime = baseTime + cycle * 700;
        Date.now = () => mockTime;

        for (let i = 0; i < 10; i++) {
          const result = evaluator.evaluateCircuit(circuit).data;
          circuit = result.circuit;
        }

        // Read D-FF states
        const dffs = circuit.gates
          .filter(g => g.type === 'D-FF')
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(g => (g.output ? '1' : '0'))
          .join('');

        states.push(dffs);

        // Restore Date.now
        Date.now = originalDateNow;
      }

      // Johnson counter should have distinct states
      const uniqueStates = new Set(states);
      expect(uniqueStates.size).toBeGreaterThan(2);
    });

    it('chaos-generator should produce chaotic behavior', () => {
      const chaos = FEATURED_CIRCUITS.find(c => c.id === 'chaos-generator')!;
      let circuit: Circuit = {
        gates: structuredClone(chaos.gates),
        wires: structuredClone(chaos.wires),
      };

      const outputs: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        const result = evaluator.evaluateCircuit(circuit).data;
        circuit = result.circuit;

        // Find any OUTPUT gate
        const outputGate = circuit.gates.find(g => g.type === 'OUTPUT');
        if (outputGate) {
          outputs.push(
            outputGate.inputs[0] === '1' || outputGate.inputs[0] === true
          );
        }
      }

      // Chaotic behavior should show transitions
      let transitions = 0;
      for (let i = 1; i < outputs.length; i++) {
        if (outputs[i] !== outputs[i - 1]) {
          transitions++;
        }
      }

      expect(transitions).toBeGreaterThan(10);
    });
  });

  describe('Visual Output Requirements', () => {
    it('all circuits should have OUTPUT gates connected', () => {
      FEATURED_CIRCUITS.forEach(circuit => {
        const outputGates = circuit.gates.filter(g => g.type === 'OUTPUT');

        if (outputGates.length > 0) {
          outputGates.forEach(outputGate => {
            const hasInput = circuit.wires.some(
              w => w.to.gateId === outputGate.id && w.to.pinIndex === 0
            );
            expect(hasInput).toBe(true);
          });
        }
      });
    });

    it('oscillating circuits should have animation config', () => {
      const oscillatingIds = [
        'simple-ring-oscillator',
        'simple-lfsr',
        'chaos-generator',
        'fibonacci-counter',
        'johnson-counter',
        'self-oscillating-memory-final',
        'mandala-circuit',
      ];

      oscillatingIds.forEach(id => {
        const circuit = FEATURED_CIRCUITS.find(c => c.id === id);
        expect(circuit?.simulationConfig?.needsAnimation).toBe(true);
      });
    });
  });
});
