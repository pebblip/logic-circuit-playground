import { describe, it, expect } from 'vitest';
import { generateTruthTable, truthTableToCSV } from '../truthTable';

describe('真理値表生成', () => {
  describe('generateTruthTable', () => {
    it('入力がない場合、空の結果を返す', () => {
      const gates = [];
      const connections = [];
      
      const result = generateTruthTable(gates, connections);
      
      expect(result.inputs).toEqual([]);
      expect(result.outputs).toEqual([]);
      expect(result.rows).toEqual([]);
    });

    it('単純なNOT回路の真理値表を生成できる', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'not1', type: 'NOT', x: 200, y: 100, inputs: 1, outputs: 1 },
        { id: 'out1', type: 'OUTPUT', x: 300, y: 100 }
      ];
      const connections = [
        { from: 'in1', to: 'not1', toInput: 0 },
        { from: 'not1', to: 'out1', toInput: 0 }
      ];
      
      const result = generateTruthTable(gates, connections);
      
      expect(result.inputs).toHaveLength(1);
      expect(result.outputs).toHaveLength(1);
      expect(result.rows).toHaveLength(2);
      
      // 真理値表の検証
      expect(result.rows[0]).toEqual({
        inputs: [false],
        outputs: [true],
        intermediates: { not1: true }
      });
      expect(result.rows[1]).toEqual({
        inputs: [true],
        outputs: [false],
        intermediates: { not1: false }
      });
    });

    it('2入力AND回路の真理値表を生成できる', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'in2', type: 'INPUT', x: 100, y: 200, value: false },
        { id: 'and1', type: 'AND', x: 200, y: 150, inputs: 2, outputs: 1 },
        { id: 'out1', type: 'OUTPUT', x: 300, y: 150 }
      ];
      const connections = [
        { from: 'in1', to: 'and1', toInput: 0 },
        { from: 'in2', to: 'and1', toInput: 1 },
        { from: 'and1', to: 'out1', toInput: 0 }
      ];
      
      const result = generateTruthTable(gates, connections);
      
      expect(result.inputs).toHaveLength(2);
      expect(result.outputs).toHaveLength(1);
      expect(result.rows).toHaveLength(4);
      
      // 真理値表の検証（AND）
      expect(result.rows[0].inputs).toEqual([false, false]);
      expect(result.rows[0].outputs).toEqual([false]);
      
      expect(result.rows[1].inputs).toEqual([false, true]);
      expect(result.rows[1].outputs).toEqual([false]);
      
      expect(result.rows[2].inputs).toEqual([true, false]);
      expect(result.rows[2].outputs).toEqual([false]);
      
      expect(result.rows[3].inputs).toEqual([true, true]);
      expect(result.rows[3].outputs).toEqual([true]);
    });

    it('複数出力の真理値表を生成できる', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', x: 100, y: 100, value: false },
        { id: 'not1', type: 'NOT', x: 200, y: 100, inputs: 1, outputs: 1 },
        { id: 'out1', type: 'OUTPUT', x: 300, y: 100 },
        { id: 'out2', type: 'OUTPUT', x: 300, y: 200 }
      ];
      const connections = [
        { from: 'in1', to: 'not1', toInput: 0 },
        { from: 'in1', to: 'out1', toInput: 0 },
        { from: 'not1', to: 'out2', toInput: 0 }
      ];
      
      const result = generateTruthTable(gates, connections);
      
      expect(result.outputs).toHaveLength(2);
      
      // OUT1は入力の値、OUT2はNOTの出力
      expect(result.rows[0].outputs).toEqual([false, true]);
      expect(result.rows[1].outputs).toEqual([true, false]);
    });

    it('入力をY座標でソートする', () => {
      const gates = [
        { id: 'in1', type: 'INPUT', x: 100, y: 200, value: false }, // 下
        { id: 'in2', type: 'INPUT', x: 100, y: 100, value: false }, // 上
        { id: 'out1', type: 'OUTPUT', x: 300, y: 150 }
      ];
      const connections = [];
      
      const result = generateTruthTable(gates, connections);
      
      // Y座標の昇順でソートされる（上から下）
      expect(result.inputs[0].id).toBe('in2');
      expect(result.inputs[1].id).toBe('in1');
    });
  });

  describe('truthTableToCSV', () => {
    it('真理値表をCSV形式に変換できる', () => {
      const truthTable = {
        inputs: [
          { id: 'in1', name: 'IN1' },
          { id: 'in2', name: 'IN2' }
        ],
        outputs: [
          { id: 'out1', name: 'OUT1' }
        ],
        rows: [
          { inputs: [false, false], outputs: [false] },
          { inputs: [false, true], outputs: [false] },
          { inputs: [true, false], outputs: [false] },
          { inputs: [true, true], outputs: [true] }
        ]
      };
      
      const csv = truthTableToCSV(truthTable);
      
      const expectedCSV = 
        'IN1,IN2,OUT1\n' +
        '0,0,0\n' +
        '0,1,0\n' +
        '1,0,0\n' +
        '1,1,1';
      
      expect(csv).toBe(expectedCSV);
    });
  });
});