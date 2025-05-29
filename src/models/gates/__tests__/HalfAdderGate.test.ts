import { describe, it, expect, beforeEach } from 'vitest';
import { HalfAdderGate } from '../HalfAdderGate';

describe('HalfAdderGate', () => {
  let halfAdder: HalfAdderGate;

  beforeEach(() => {
    halfAdder = new HalfAdderGate('test-half-adder', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(halfAdder.id).toBe('test-half-adder');
      expect(halfAdder.type).toBe('HALF_ADDER');
      expect(halfAdder.position).toEqual({ x: 100, y: 100 });
    });

    it('2つの入力ピンを持つ', () => {
      const inputs = halfAdder.getInputs();
      expect(inputs).toHaveLength(2);
      expect(inputs[0].name).toBe('A');
      expect(inputs[1].name).toBe('B');
    });

    it('2つの出力ピンを持つ', () => {
      const outputs = halfAdder.getOutputs();
      expect(outputs).toHaveLength(2);
      expect(outputs[0].name).toBe('S');
      expect(outputs[1].name).toBe('C');
    });
  });

  describe('半加算器の動作', () => {
    it('A=0, B=0 → S=0, C=0', () => {
      halfAdder.setInputValue(0, false);
      halfAdder.setInputValue(1, false);
      halfAdder.compute();
      
      expect(halfAdder.getOutputValue(0)).toBe(false); // S
      expect(halfAdder.getOutputValue(1)).toBe(false); // C
    });

    it('A=0, B=1 → S=1, C=0', () => {
      halfAdder.setInputValue(0, false);
      halfAdder.setInputValue(1, true);
      halfAdder.compute();
      
      expect(halfAdder.getOutputValue(0)).toBe(true);  // S
      expect(halfAdder.getOutputValue(1)).toBe(false); // C
    });

    it('A=1, B=0 → S=1, C=0', () => {
      halfAdder.setInputValue(0, true);
      halfAdder.setInputValue(1, false);
      halfAdder.compute();
      
      expect(halfAdder.getOutputValue(0)).toBe(true);  // S
      expect(halfAdder.getOutputValue(1)).toBe(false); // C
    });

    it('A=1, B=1 → S=0, C=1', () => {
      halfAdder.setInputValue(0, true);
      halfAdder.setInputValue(1, true);
      halfAdder.compute();
      
      expect(halfAdder.getOutputValue(0)).toBe(false); // S
      expect(halfAdder.getOutputValue(1)).toBe(true);  // C
    });
  });

  describe('クローン機能', () => {
    it('正しくクローンできる', () => {
      const cloned = halfAdder.clone('cloned-half-adder');
      
      expect(cloned.id).toBe('cloned-half-adder');
      expect(cloned.type).toBe('HALF_ADDER');
      expect(cloned.position).toEqual({ x: 100, y: 100 });
    });
  });
});