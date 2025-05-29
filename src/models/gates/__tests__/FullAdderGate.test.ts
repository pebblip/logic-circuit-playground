import { describe, it, expect, beforeEach } from 'vitest';
import { FullAdderGate } from '../FullAdderGate';

describe('FullAdderGate', () => {
  let fullAdder: FullAdderGate;

  beforeEach(() => {
    fullAdder = new FullAdderGate('test-full-adder', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(fullAdder.id).toBe('test-full-adder');
      expect(fullAdder.type).toBe('FULL_ADDER');
      expect(fullAdder.position).toEqual({ x: 100, y: 100 });
    });

    it('3つの入力ピンを持つ', () => {
      const inputs = fullAdder.getInputs();
      expect(inputs).toHaveLength(3);
      expect(inputs[0].name).toBe('A');
      expect(inputs[1].name).toBe('B');
      expect(inputs[2].name).toBe('Cin');
    });

    it('2つの出力ピンを持つ', () => {
      const outputs = fullAdder.getOutputs();
      expect(outputs).toHaveLength(2);
      expect(outputs[0].name).toBe('S');
      expect(outputs[1].name).toBe('Cout');
    });
  });

  describe('全加算器の動作 - 完全な真理値表', () => {
    const testCases = [
      // A, B, Cin, S, Cout
      [false, false, false, false, false],  // 0+0+0 = 0
      [false, false, true,  true,  false],  // 0+0+1 = 1
      [false, true,  false, true,  false],  // 0+1+0 = 1
      [false, true,  true,  false, true],   // 0+1+1 = 2 (10 in binary)
      [true,  false, false, true,  false],  // 1+0+0 = 1
      [true,  false, true,  false, true],   // 1+0+1 = 2 (10 in binary)
      [true,  true,  false, false, true],   // 1+1+0 = 2 (10 in binary)
      [true,  true,  true,  true,  true],   // 1+1+1 = 3 (11 in binary)
    ];

    testCases.forEach(([a, b, cin, expectedS, expectedCout], index) => {
      it(`ケース${index + 1}: A=${a}, B=${b}, Cin=${cin} → S=${expectedS}, Cout=${expectedCout}`, () => {
        fullAdder.setInputValue(0, a);
        fullAdder.setInputValue(1, b);
        fullAdder.setInputValue(2, cin);
        fullAdder.compute();
        
        expect(fullAdder.getOutputValue(0)).toBe(expectedS);
        expect(fullAdder.getOutputValue(1)).toBe(expectedCout);
      });
    });
  });

  describe('クローン機能', () => {
    it('正しくクローンできる', () => {
      const cloned = fullAdder.clone('cloned-full-adder');
      
      expect(cloned.id).toBe('cloned-full-adder');
      expect(cloned.type).toBe('FULL_ADDER');
      expect(cloned.position).toEqual({ x: 100, y: 100 });
    });
  });
});