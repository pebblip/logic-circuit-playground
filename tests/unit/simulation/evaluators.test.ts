import { describe, it, expect } from 'vitest';
import { gateEvaluators } from '@/domain/simulation/core/evaluators';
import type { EvaluationContext, EvaluationGate } from '@/domain/simulation/core/types';

describe('Gate Evaluators', () => {
  describe('OUTPUT gate', () => {
    it('should pass through input value to output', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      // Test with true input
      const resultTrue = gateEvaluators.OUTPUT([true], 'output1', context);
      expect(resultTrue.outputs).toEqual([true]);

      // Test with false input
      const resultFalse = gateEvaluators.OUTPUT([false], 'output1', context);
      expect(resultFalse.outputs).toEqual([false]);

      // Test with undefined input (should default to false)
      const resultUndefined = gateEvaluators.OUTPUT([undefined as any], 'output1', context);
      expect(resultUndefined.outputs).toEqual([false]);
    });

    it('should have exactly one output', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      const result = gateEvaluators.OUTPUT([true], 'output1', context);
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toBe(true);
    });

    it('should not have empty outputs array', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      const result = gateEvaluators.OUTPUT([false], 'output1', context);
      expect(result.outputs).not.toHaveLength(0);
      expect(result.outputs).toHaveLength(1);
    });
  });

  describe('NOT gate', () => {
    it('should invert input', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.NOT([true], 'not1', context).outputs).toEqual([false]);
      expect(gateEvaluators.NOT([false], 'not1', context).outputs).toEqual([true]);
    });
  });

  describe('AND gate', () => {
    it('should perform AND operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.AND([false, false], 'and1', context).outputs).toEqual([false]);
      expect(gateEvaluators.AND([false, true], 'and1', context).outputs).toEqual([false]);
      expect(gateEvaluators.AND([true, false], 'and1', context).outputs).toEqual([false]);
      expect(gateEvaluators.AND([true, true], 'and1', context).outputs).toEqual([true]);
    });
  });

  describe('OR gate', () => {
    it('should perform OR operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.OR([false, false], 'or1', context).outputs).toEqual([false]);
      expect(gateEvaluators.OR([false, true], 'or1', context).outputs).toEqual([true]);
      expect(gateEvaluators.OR([true, false], 'or1', context).outputs).toEqual([true]);
      expect(gateEvaluators.OR([true, true], 'or1', context).outputs).toEqual([true]);
    });
  });

  describe('XOR gate', () => {
    it('should perform XOR operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.XOR([false, false], 'xor1', context).outputs).toEqual([false]);
      expect(gateEvaluators.XOR([false, true], 'xor1', context).outputs).toEqual([true]);
      expect(gateEvaluators.XOR([true, false], 'xor1', context).outputs).toEqual([true]);
      expect(gateEvaluators.XOR([true, true], 'xor1', context).outputs).toEqual([false]);
    });
  });

  describe('XNOR gate', () => {
    it('should perform XNOR operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.XNOR([false, false], 'xnor1', context).outputs).toEqual([true]);
      expect(gateEvaluators.XNOR([false, true], 'xnor1', context).outputs).toEqual([false]);
      expect(gateEvaluators.XNOR([true, false], 'xnor1', context).outputs).toEqual([false]);
      expect(gateEvaluators.XNOR([true, true], 'xnor1', context).outputs).toEqual([true]);
    });
  });

  describe('NAND gate', () => {
    it('should perform NAND operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.NAND([false, false], 'nand1', context).outputs).toEqual([true]);
      expect(gateEvaluators.NAND([false, true], 'nand1', context).outputs).toEqual([true]);
      expect(gateEvaluators.NAND([true, false], 'nand1', context).outputs).toEqual([true]);
      expect(gateEvaluators.NAND([true, true], 'nand1', context).outputs).toEqual([false]);
    });
  });

  describe('NOR gate', () => {
    it('should perform NOR operation', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };

      expect(gateEvaluators.NOR([false, false], 'nor1', context).outputs).toEqual([true]);
      expect(gateEvaluators.NOR([false, true], 'nor1', context).outputs).toEqual([false]);
      expect(gateEvaluators.NOR([true, false], 'nor1', context).outputs).toEqual([false]);
      expect(gateEvaluators.NOR([true, true], 'nor1', context).outputs).toEqual([false]);
    });
  });

  describe('INPUT gate', () => {
    it('should output state from memory or initial value', () => {
      const context: EvaluationContext = {
        currentTime: Date.now(),
        memory: {
          input1: { state: true },
        },
      };

      const gate: EvaluationGate = {
        id: 'input1',
        type: 'INPUT',
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [false], // initial value
      };

      // Should use memory state
      const result = gateEvaluators.INPUT([], 'input1', context, gate);
      expect(result.outputs).toEqual([true]);

      // Without memory, should use initial value
      const emptyContext: EvaluationContext = {
        currentTime: Date.now(),
        memory: {},
      };
      const resultNoMemory = gateEvaluators.INPUT([], 'input1', emptyContext, gate);
      expect(resultNoMemory.outputs).toEqual([false]);
    });
  });
});