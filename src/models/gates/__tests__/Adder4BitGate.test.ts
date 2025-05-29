import { describe, it, expect, beforeEach } from 'vitest';
import { Adder4BitGate } from '../Adder4BitGate';

describe('Adder4BitGate', () => {
  let adder: Adder4BitGate;

  beforeEach(() => {
    adder = new Adder4BitGate('test-4bit-adder', 100, 100);
  });

  describe('初期化', () => {
    it('正しい初期状態で作成される', () => {
      expect(adder.id).toBe('test-4bit-adder');
      expect(adder.type).toBe('ADDER_4BIT');
      expect(adder.position).toEqual({ x: 100, y: 100 });
    });

    it('9つの入力ピンを持つ', () => {
      const inputs = adder.getInputs();
      expect(inputs).toHaveLength(9);
      expect(inputs[0].name).toBe('A0');
      expect(inputs[3].name).toBe('A3');
      expect(inputs[4].name).toBe('B0');
      expect(inputs[7].name).toBe('B3');
      expect(inputs[8].name).toBe('Cin');
    });

    it('5つの出力ピンを持つ', () => {
      const outputs = adder.getOutputs();
      expect(outputs).toHaveLength(5);
      expect(outputs[0].name).toBe('S0');
      expect(outputs[3].name).toBe('S3');
      expect(outputs[4].name).toBe('Cout');
    });
  });

  describe('4ビット加算の動作', () => {
    // ヘルパー関数：10進数を4ビットで設定
    const setInputA = (value: number) => {
      for (let i = 0; i < 4; i++) {
        adder.setInputValue(i, (value & (1 << i)) !== 0);
      }
    };

    const setInputB = (value: number) => {
      for (let i = 0; i < 4; i++) {
        adder.setInputValue(i + 4, (value & (1 << i)) !== 0);
      }
    };

    const getOutput = (): number => {
      let result = 0;
      for (let i = 0; i < 4; i++) {
        if (adder.getOutputValue(i)) {
          result |= (1 << i);
        }
      }
      return result;
    };

    it('0 + 0 = 0', () => {
      setInputA(0);
      setInputB(0);
      adder.setInputValue(8, false); // Cin = 0
      adder.compute();
      
      expect(getOutput()).toBe(0);
      expect(adder.getOutputValue(4)).toBe(false); // Cout
    });

    it('3 + 5 = 8', () => {
      setInputA(3);  // 0011
      setInputB(5);  // 0101
      adder.setInputValue(8, false);
      adder.compute();
      
      expect(getOutput()).toBe(8); // 1000
      expect(adder.getOutputValue(4)).toBe(false); // No carry
    });

    it('7 + 9 = 16 (オーバーフロー)', () => {
      setInputA(7);  // 0111
      setInputB(9);  // 1001
      adder.setInputValue(8, false);
      adder.compute();
      
      expect(getOutput()).toBe(0); // 0000 (下位4ビット)
      expect(adder.getOutputValue(4)).toBe(true); // Carry out
    });

    it('15 + 15 + 1 = 31 (Cin使用)', () => {
      setInputA(15); // 1111
      setInputB(15); // 1111
      adder.setInputValue(8, true); // Cin = 1
      adder.compute();
      
      expect(getOutput()).toBe(15); // 1111 (下位4ビット)
      expect(adder.getOutputValue(4)).toBe(true); // Carry out
    });

    it('連続加算テスト', () => {
      const testCases = [
        { a: 1, b: 1, cin: false, sum: 2, cout: false },
        { a: 5, b: 3, cin: false, sum: 8, cout: false },
        { a: 8, b: 8, cin: false, sum: 0, cout: true },
        { a: 15, b: 1, cin: false, sum: 0, cout: true },
        { a: 6, b: 7, cin: true, sum: 14, cout: false },
      ];

      testCases.forEach(({ a, b, cin, sum, cout }) => {
        setInputA(a);
        setInputB(b);
        adder.setInputValue(8, cin);
        adder.compute();
        
        expect(getOutput()).toBe(sum);
        expect(adder.getOutputValue(4)).toBe(cout);
      });
    });
  });

  describe('デバッグ用メソッド', () => {
    it('入力値を10進数として取得できる', () => {
      // A = 5 (0101)
      adder.setInputValue(0, true);  // A0 = 1
      adder.setInputValue(1, false); // A1 = 0
      adder.setInputValue(2, true);  // A2 = 1
      adder.setInputValue(3, false); // A3 = 0
      
      expect(adder.getInputAAsDecimal()).toBe(5);
      
      // B = 10 (1010)
      adder.setInputValue(4, false); // B0 = 0
      adder.setInputValue(5, true);  // B1 = 1
      adder.setInputValue(6, false); // B2 = 0
      adder.setInputValue(7, true);  // B3 = 1
      
      expect(adder.getInputBAsDecimal()).toBe(10);
    });
  });
});