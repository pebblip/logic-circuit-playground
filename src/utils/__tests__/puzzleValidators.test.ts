import { describe, it, expect } from 'vitest';
import { validatePuzzle, validateXORChallenge, validateHalfAdder } from '../puzzleValidators';

describe('puzzleValidators', () => {
  describe('validateXORChallenge', () => {
    it('正しいXOR回路を認識する', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 },
        { id: 'and1', type: 'AND', x: 200, y: 120 },
        { id: 'and2', type: 'AND', x: 200, y: 180 },
        { id: 'not1', type: 'NOT', x: 150, y: 120 },
        { id: 'not2', type: 'NOT', x: 150, y: 180 },
        { id: 'or1', type: 'OR', x: 300, y: 150 },
        { id: 'output1', type: 'OUTPUT', x: 400, y: 150 }
      ];

      // XOR = A * !B + !A * B の実装
      const connections = [
        { id: 'c1', from: 'input1', fromOutput: 0, to: 'not2', toInput: 0 },  // input1 -> not2
        { id: 'c2', from: 'input2', fromOutput: 0, to: 'not1', toInput: 0 },  // input2 -> not1  
        { id: 'c3', from: 'input1', fromOutput: 0, to: 'and1', toInput: 0 },  // input1 -> and1
        { id: 'c4', from: 'not1', fromOutput: 0, to: 'and1', toInput: 1 },   // not1 -> and1
        { id: 'c5', from: 'not2', fromOutput: 0, to: 'and2', toInput: 0 },   // not2 -> and2
        { id: 'c6', from: 'input2', fromOutput: 0, to: 'and2', toInput: 1 }, // input2 -> and2
        { id: 'c7', from: 'and1', fromOutput: 0, to: 'or1', toInput: 0 },    // and1 -> or1
        { id: 'c8', from: 'and2', fromOutput: 0, to: 'or1', toInput: 1 },    // and2 -> or1
        { id: 'c9', from: 'or1', fromOutput: 0, to: 'output1', toInput: 0 }  // or1 -> output1
      ];

      const result = validateXORChallenge(gates, connections);
      expect(result).toBe(true);
    });

    it('入力ゲートが不足している場合はfalseを返す', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'output1', type: 'OUTPUT', x: 400, y: 150 }
      ];
      const connections: any[] = [];

      const result = validateXORChallenge(gates, connections);
      expect(result).toBe(false);
    });

    it('出力ゲートが不足している場合はfalseを返す', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 }
      ];
      const connections: any[] = [];

      const result = validateXORChallenge(gates, connections);
      expect(result).toBe(false);
    });

    it('禁止されたゲートタイプがある場合はfalseを返す', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 },
        { id: 'xor1', type: 'XOR', x: 200, y: 150 }, // XORゲート使用は禁止
        { id: 'output1', type: 'OUTPUT', x: 400, y: 150 }
      ];
      const connections: any[] = [];

      const result = validateXORChallenge(gates, connections);
      expect(result).toBe(false);
    });
  });

  describe('validateHalfAdder', () => {
    it('正しい半加算器回路を認識する', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 },
        { id: 'xor1', type: 'XOR', x: 200, y: 120 },
        { id: 'and1', type: 'AND', x: 200, y: 180 },
        { id: 'sum', type: 'OUTPUT', x: 300, y: 120 },
        { id: 'carry', type: 'OUTPUT', x: 300, y: 180 }
      ];

      const connections = [
        { id: 'c1', from: 'input1', fromOutput: 0, to: 'xor1', toInput: 0 },
        { id: 'c2', from: 'input2', fromOutput: 0, to: 'xor1', toInput: 1 },
        { id: 'c3', from: 'input1', fromOutput: 0, to: 'and1', toInput: 0 },
        { id: 'c4', from: 'input2', fromOutput: 0, to: 'and1', toInput: 1 },
        { id: 'c5', from: 'xor1', fromOutput: 0, to: 'sum', toInput: 0 },
        { id: 'c6', from: 'and1', fromOutput: 0, to: 'carry', toInput: 0 }
      ];

      const result = validateHalfAdder(gates, connections);
      expect(result).toBe(true);
    });

    it('入力ゲートが2つでない場合はfalseを返す', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'output1', type: 'OUTPUT', x: 300, y: 120 },
        { id: 'output2', type: 'OUTPUT', x: 300, y: 180 }
      ];
      const connections: any[] = [];

      const result = validateHalfAdder(gates, connections);
      expect(result).toBe(false);
    });

    it('出力ゲートが2つでない場合はfalseを返す', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 },
        { id: 'output1', type: 'OUTPUT', x: 300, y: 120 }
      ];
      const connections: any[] = [];

      const result = validateHalfAdder(gates, connections);
      expect(result).toBe(false);
    });
  });

  describe('validatePuzzle', () => {
    it('存在しないパズルIDに対してfalseを返す', () => {
      const result = validatePuzzle('non-existent', [], []);
      expect(result).toBe(false);
    });

    it('XORチャレンジのパズルIDで正しく動作する', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 }
      ];
      const connections: any[] = [];

      const result = validatePuzzle('xor-challenge', gates, connections);
      expect(result).toBe(false); // 不完全な回路なのでfalse
    });

    it('半加算器のパズルIDで正しく動作する', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 }
      ];
      const connections: any[] = [];

      const result = validatePuzzle('half-adder', gates, connections);
      expect(result).toBe(false); // 不完全な回路なのでfalse
    });
  });

  describe('シミュレーション動作確認', () => {
    it('簡単なAND回路をシミュレートできる', () => {
      const gates = [
        { id: 'input1', type: 'INPUT', x: 100, y: 100 },
        { id: 'input2', type: 'INPUT', x: 100, y: 200 },
        { id: 'and1', type: 'AND', x: 200, y: 150 },
        { id: 'output1', type: 'OUTPUT', x: 300, y: 150 }
      ];

      const connections = [
        { id: 'c1', from: 'input1', fromOutput: 0, to: 'and1', toInput: 0 },
        { id: 'c2', from: 'input2', fromOutput: 0, to: 'and1', toInput: 1 },
        { id: 'c3', from: 'and1', fromOutput: 0, to: 'output1', toInput: 0 }
      ];

      // この回路はXORではないので、XORチャレンジでは失敗する
      const result = validateXORChallenge(gates, connections);
      expect(result).toBe(false);
    });
  });
});