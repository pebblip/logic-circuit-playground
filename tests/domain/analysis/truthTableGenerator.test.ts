// 真理値表生成の単体テスト
// 教育的価値の高い機能の確実な品質保証

import { describe, it, expect } from 'vitest';
import { 
  generateTruthTable, 
  exportTruthTableAsCSV, 
  calculateTruthTableStats,
  TruthTableResult 
} from '@domain/analysis/truthTableGenerator';
import { Gate, Wire } from '@/types/circuit';

describe('Truth Table Generation', () => {
  describe('Basic Logic Circuits', () => {
    it('should generate correct truth table for AND gate', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 100, y: 25 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 25 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire3',
          from: { gateId: 'and1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.inputCount).toBe(2);
      expect(result.outputCount).toBe(1);
      expect(result.table).toHaveLength(4);
      expect(result.recognizedPattern).toBe('AND');

      // Verify AND truth table: 0001
      expect(result.table[0].outputs).toBe('0'); // 00 -> 0
      expect(result.table[1].outputs).toBe('0'); // 01 -> 0
      expect(result.table[2].outputs).toBe('0'); // 10 -> 0
      expect(result.table[3].outputs).toBe('1'); // 11 -> 1
    });

    it('should generate correct truth table for OR gate', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false
        },
        {
          id: 'or1',
          type: 'OR',
          position: { x: 100, y: 25 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 25 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'or1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'or1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire3',
          from: { gateId: 'or1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.recognizedPattern).toBe('OR');
      
      // Verify OR truth table: 0111
      expect(result.table[0].outputs).toBe('0'); // 00 -> 0
      expect(result.table[1].outputs).toBe('1'); // 01 -> 1
      expect(result.table[2].outputs).toBe('1'); // 10 -> 1
      expect(result.table[3].outputs).toBe('1'); // 11 -> 1
    });

    it('should generate correct truth table for NOT gate', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 0 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'not1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.inputCount).toBe(1);
      expect(result.outputCount).toBe(1);
      expect(result.table).toHaveLength(2);
      expect(result.recognizedPattern).toBe('NOT');

      // Verify NOT truth table: 10
      expect(result.table[0].outputs).toBe('1'); // 0 -> 1
      expect(result.table[1].outputs).toBe('0'); // 1 -> 0
    });

    it('should generate correct truth table for XOR gate', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false
        },
        {
          id: 'xor1',
          type: 'XOR',
          position: { x: 100, y: 25 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 25 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'xor1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'xor1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire3',
          from: { gateId: 'xor1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.recognizedPattern).toBe('XOR');
      
      // Verify XOR truth table: 0110
      expect(result.table[0].outputs).toBe('0'); // 00 -> 0
      expect(result.table[1].outputs).toBe('1'); // 01 -> 1
      expect(result.table[2].outputs).toBe('1'); // 10 -> 1
      expect(result.table[3].outputs).toBe('0'); // 11 -> 0
    });
  });

  describe('Complex Circuits', () => {
    it('should handle multiple output circuit', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 100, y: 0 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'or1',
          type: 'OR',
          position: { x: 100, y: 50 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 0 },
          inputs: [''],
          output: false
        },
        {
          id: 'output2',
          type: 'OUTPUT',
          position: { x: 200, y: 50 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        // Input1 -> AND, OR
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'or1', pinIndex: 0 },
          isActive: false
        },
        // Input2 -> AND, OR
        {
          id: 'wire3',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire4',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'or1', pinIndex: 1 },
          isActive: false
        },
        // Gates -> Outputs
        {
          id: 'wire5',
          from: { gateId: 'and1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire6',
          from: { gateId: 'or1', pinIndex: -1 },
          to: { gateId: 'output2', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.inputCount).toBe(2);
      expect(result.outputCount).toBe(2);
      expect(result.table).toHaveLength(4);

      // First output is AND, second output is OR
      expect(result.table[0].outputs).toBe('00'); // 00 -> AND=0, OR=0
      expect(result.table[1].outputs).toBe('01'); // 01 -> AND=0, OR=1
      expect(result.table[2].outputs).toBe('01'); // 10 -> AND=0, OR=1
      expect(result.table[3].outputs).toBe('11'); // 11 -> AND=1, OR=1
    });
  });

  describe('CSV Export', () => {
    it('should export truth table as valid CSV', () => {
      const result: TruthTableResult = {
        table: [
          { inputs: '00', outputs: '0', inputValues: [false, false], outputValues: [false] },
          { inputs: '01', outputs: '1', inputValues: [false, true], outputValues: [true] },
          { inputs: '10', outputs: '1', inputValues: [true, false], outputValues: [true] },
          { inputs: '11', outputs: '1', inputValues: [true, true], outputValues: [true] }
        ],
        inputCount: 2,
        outputCount: 1,
        isSequential: false,
        recognizedPattern: 'OR'
      };

      const csv = exportTruthTableAsCSV(result, ['A', 'B'], ['Y']);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('A,B,Y'); // Header
      expect(lines[1]).toBe('0,0,0');
      expect(lines[2]).toBe('0,1,1');
      expect(lines[3]).toBe('1,0,1');
      expect(lines[4]).toBe('1,1,1');
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct statistics', () => {
      const result: TruthTableResult = {
        table: [
          { inputs: '00', outputs: '0', inputValues: [false, false], outputValues: [false] },
          { inputs: '01', outputs: '1', inputValues: [false, true], outputValues: [true] },
          { inputs: '10', outputs: '1', inputValues: [true, false], outputValues: [true] },
          { inputs: '11', outputs: '1', inputValues: [true, true], outputValues: [true] }
        ],
        inputCount: 2,
        outputCount: 1,
        isSequential: false
      };

      const stats = calculateTruthTableStats(result);

      expect(stats.totalCombinations).toBe(4);
      expect(stats.trueOutputRatio).toBe(0.75); // 3 true outputs out of 4
      expect(stats.complexity).toBe('Low'); // 4 rows = Low complexity
      expect(stats.isComplete).toBe(true);
    });

    it('should handle high complexity circuits', () => {
      const result: TruthTableResult = {
        table: new Array(16).fill(null).map((_, i) => ({
          inputs: i.toString(2).padStart(4, '0'),
          outputs: '0',
          inputValues: [false, false, false, false],
          outputValues: [false]
        })),
        inputCount: 4,
        outputCount: 1,
        isSequential: false
      };

      const stats = calculateTruthTableStats(result);

      expect(stats.complexity).toBe('High');
      expect(stats.totalCombinations).toBe(16);
    });
  });

  describe('Pattern Recognition', () => {
    it('should recognize NAND pattern', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: false
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false
        },
        {
          id: 'nand1',
          type: 'NAND',
          position: { x: 100, y: 25 },
          inputs: ['', ''],
          output: false
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 25 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'nand1', pinIndex: 0 },
          isActive: false
        },
        {
          id: 'wire2',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'nand1', pinIndex: 1 },
          isActive: false
        },
        {
          id: 'wire3',
          from: { gateId: 'nand1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false
        }
      ];

      const inputGates = gates.filter(g => g.type === 'INPUT');
      const outputGates = gates.filter(g => g.type === 'OUTPUT');

      const result = generateTruthTable(gates, wires, inputGates, outputGates);

      expect(result.recognizedPattern).toBe('NAND');
    });

    it('should not recognize unknown patterns', () => {
      const result: TruthTableResult = {
        table: [
          { inputs: '00', outputs: '1', inputValues: [false, false], outputValues: [true] },
          { inputs: '01', outputs: '0', inputValues: [false, true], outputValues: [false] },
          { inputs: '10', outputs: '1', inputValues: [true, false], outputValues: [true] },
          { inputs: '11', outputs: '0', inputValues: [true, true], outputValues: [false] }
        ],
        inputCount: 2,
        outputCount: 1,
        isSequential: false
      };

      expect(result.recognizedPattern).toBeUndefined();
    });
  });
});