import { describe, it, expect, beforeEach } from 'vitest';
import type { EvaluationContext } from '../../../src/domain/simulation/core/types';
import { gateEvaluators } from '../../../src/domain/simulation/core/evaluators';

// テスト用のコンテキスト
const createTestContext = (
  overrides?: Partial<EvaluationContext>
): EvaluationContext => ({
  memory: {},
  ...overrides,
});

describe('Pure Gate Evaluators', () => {
  const evaluators = gateEvaluators;

  describe('Basic Logic Gates', () => {
    describe('AND Gate', () => {
      it('should return true only when both inputs are true', () => {
        const and = evaluators.AND;

        expect(and([true, true], 'and1', createTestContext()).outputs).toEqual([
          true,
        ]);
        expect(and([true, false], 'and1', createTestContext()).outputs).toEqual(
          [false]
        );
        expect(and([false, true], 'and1', createTestContext()).outputs).toEqual(
          [false]
        );
        expect(
          and([false, false], 'and1', createTestContext()).outputs
        ).toEqual([false]);
      });
    });

    describe('OR Gate', () => {
      it('should return true when at least one input is true', () => {
        const or = evaluators.OR;

        expect(or([true, true], 'or1', createTestContext()).outputs).toEqual([
          true,
        ]);
        expect(or([true, false], 'or1', createTestContext()).outputs).toEqual([
          true,
        ]);
        expect(or([false, true], 'or1', createTestContext()).outputs).toEqual([
          true,
        ]);
        expect(or([false, false], 'or1', createTestContext()).outputs).toEqual([
          false,
        ]);
      });
    });

    describe('NOT Gate', () => {
      it('should invert the input', () => {
        const not = evaluators.NOT;

        expect(not([true], 'not1', createTestContext()).outputs).toEqual([
          false,
        ]);
        expect(not([false], 'not1', createTestContext()).outputs).toEqual([
          true,
        ]);
      });
    });

    describe('XOR Gate', () => {
      it('should return true when inputs are different', () => {
        const xor = evaluators.XOR;

        expect(xor([true, true], 'xor1', createTestContext()).outputs).toEqual([
          false,
        ]);
        expect(xor([true, false], 'xor1', createTestContext()).outputs).toEqual(
          [true]
        );
        expect(xor([false, true], 'xor1', createTestContext()).outputs).toEqual(
          [true]
        );
        expect(
          xor([false, false], 'xor1', createTestContext()).outputs
        ).toEqual([false]);
      });
    });

    describe('NAND Gate', () => {
      it('should return inverted AND result', () => {
        const nand = evaluators.NAND;

        expect(
          nand([true, true], 'nand1', createTestContext()).outputs
        ).toEqual([false]);
        expect(
          nand([true, false], 'nand1', createTestContext()).outputs
        ).toEqual([true]);
        expect(
          nand([false, true], 'nand1', createTestContext()).outputs
        ).toEqual([true]);
        expect(
          nand([false, false], 'nand1', createTestContext()).outputs
        ).toEqual([true]);
      });
    });

    describe('NOR Gate', () => {
      it('should return inverted OR result', () => {
        const nor = evaluators.NOR;

        expect(nor([true, true], 'nor1', createTestContext()).outputs).toEqual([
          false,
        ]);
        expect(nor([true, false], 'nor1', createTestContext()).outputs).toEqual(
          [false]
        );
        expect(nor([false, true], 'nor1', createTestContext()).outputs).toEqual(
          [false]
        );
        expect(
          nor([false, false], 'nor1', createTestContext()).outputs
        ).toEqual([true]);
      });
    });
  });

  describe('Sequential Logic Gates', () => {
    describe('SR-LATCH', () => {
      it('should set Q=1 when S=1, R=0', () => {
        const srLatch = evaluators['SR-LATCH'];

        const result = srLatch([true, false], 'sr1', createTestContext());
        expect(result.outputs).toEqual([true, false]); // Q=1, Q̄=0
      });

      it('should reset Q=0 when S=0, R=1', () => {
        const srLatch = evaluators['SR-LATCH'];

        const result = srLatch([false, true], 'sr1', createTestContext());
        expect(result.outputs).toEqual([false, true]); // Q=0, Q̄=1
      });

      it('should hold state when S=0, R=0', () => {
        const srLatch = evaluators['SR-LATCH'];

        const context = createTestContext({
          memory: { sr1: { q: true } },
        });

        const result = srLatch([false, false], 'sr1', context);
        expect(result.outputs).toEqual([true, false]); // State held
      });

      it('should handle forbidden state S=1, R=1', () => {
        const srLatch = evaluators['SR-LATCH'];

        const result = srLatch([true, true], 'sr1', createTestContext());
        expect(result.outputs).toEqual([true, true]); // Both outputs high (forbidden)
      });
    });

    describe('D-FF', () => {
      it('should capture D on rising clock edge', () => {
        const dff = evaluators['D-FF'];

        // Previous clock was low
        const context = createTestContext({
          memory: { dff1: { prevClk: false } },
        });

        // Rising edge with D=1
        const result = dff([true, true], 'dff1', context);
        expect(result.outputs).toEqual([true, false]); // Q=1, Q̄=0
        expect(result.memoryUpdate).toEqual({ prevClk: true, q: true });
      });

      it('should hold state when clock is stable', () => {
        const dff = evaluators['D-FF'];

        // Clock stays high
        const context = createTestContext({
          memory: { dff1: { prevClk: true, q: true } },
        });

        const result = dff([false, true], 'dff1', context);
        expect(result.outputs).toEqual([true, false]); // State held
        expect(result.memoryUpdate).toEqual({ prevClk: true, q: true });
      });
    });
  });

  describe('Special Gates', () => {
    describe('CLOCK', () => {
      it('should toggle based on time', () => {
        const clock = evaluators.CLOCK;

        // Initial state
        const context1 = createTestContext({ currentTime: 0 });
        const result1 = clock([], 'clk1', context1);
        expect(result1.outputs).toEqual([false]);

        // After evaluation with existing output state (current implementation toggles)
        const context2 = createTestContext({
          currentTime: 500,
          memory: {
            clk1: { output: false, frequency: 1, manualToggle: undefined },
          },
        });
        const result2 = clock([], 'clk1', context2);
        expect(result2.outputs).toEqual([true]);
        expect(result2.memoryUpdate).toEqual({
          output: true,
          frequency: 1,
          manualToggle: undefined,
        });
      });
    });

    describe('INPUT', () => {
      it('should output its stored state', () => {
        const input = evaluators.INPUT;

        const context = createTestContext({
          memory: { input1: { state: true } },
        });

        const result = input([], 'input1', context);
        expect(result.outputs).toEqual([true]);
      });
    });

    describe('OUTPUT', () => {
      it('should have no outputs', () => {
        const output = evaluators.OUTPUT;

        const result = output([true], 'output1', createTestContext());
        expect(result.outputs).toEqual([]);
      });
    });
  });

  describe('MUX (Multiplexer)', () => {
    it('should select correct input based on selector', () => {
      const mux = evaluators.MUX;

      // 2-to-1 MUX: [D0, D1, S]
      // S=0 selects D0, S=1 selects D1
      expect(
        mux([true, false, false], 'mux1', createTestContext()).outputs
      ).toEqual([true]); // Select D0
      expect(
        mux([true, false, true], 'mux1', createTestContext()).outputs
      ).toEqual([false]); // Select D1
    });
  });
});
