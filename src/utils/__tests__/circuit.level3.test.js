import { describe, it, expect } from 'vitest';
import { calculateCircuit, createGate } from '../circuit';

describe('レベル3ゲートのテスト', () => {
  describe('XORゲート', () => {
    it('XORゲートが正しく動作する', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: false },
        { id: 2, type: 'INPUT', value: false },
        { id: 3, type: 'XOR', value: null }
      ];
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 }
      ];
      
      // 0 XOR 0 = 0
      let result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(false);
      
      // 0 XOR 1 = 1
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(true);
      
      // 1 XOR 0 = 1
      gates[0].value = true;
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(true);
      
      // 1 XOR 1 = 0
      gates[0].value = true;
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(false);
    });
  });

  describe('Half Adder', () => {
    it('Half Adderが正しく動作する', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: false },
        { id: 2, type: 'INPUT', value: false },
        { id: 3, type: 'HALF_ADDER', value: null }
      ];
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 }
      ];
      
      // 0 + 0 = 0 (Sum = 0, Carry = 0)
      let result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(false); // Sum
      expect(result['3_out1']).toBe(false); // Carry
      
      // 0 + 1 = 1 (Sum = 1, Carry = 0)
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(true); // Sum
      expect(result['3_out1']).toBe(false); // Carry
      
      // 1 + 0 = 1 (Sum = 1, Carry = 0)
      gates[0].value = true;
      gates[1].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(true); // Sum
      expect(result['3_out1']).toBe(false); // Carry
      
      // 1 + 1 = 10 (Sum = 0, Carry = 1)
      gates[0].value = true;
      gates[1].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[3]).toBe(false); // Sum
      expect(result['3_out1']).toBe(true); // Carry
    });
  });

  describe('Full Adder', () => {
    it('Full Adderが正しく動作する', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: false }, // A
        { id: 2, type: 'INPUT', value: false }, // B
        { id: 3, type: 'INPUT', value: false }, // Cin
        { id: 4, type: 'FULL_ADDER', value: null }
      ];
      
      const connections = [
        { from: 1, to: 4, toInput: 0 },
        { from: 2, to: 4, toInput: 1 },
        { from: 3, to: 4, toInput: 2 }
      ];
      
      // 0 + 0 + 0 = 00 (Sum = 0, Cout = 0)
      let result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(false); // Sum
      expect(result['4_out1']).toBe(false); // Cout
      
      // 0 + 0 + 1 = 01 (Sum = 1, Cout = 0)
      gates[2].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(true); // Sum
      expect(result['4_out1']).toBe(false); // Cout
      
      // 0 + 1 + 0 = 01 (Sum = 1, Cout = 0)
      gates[1].value = true;
      gates[2].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(true); // Sum
      expect(result['4_out1']).toBe(false); // Cout
      
      // 0 + 1 + 1 = 10 (Sum = 0, Cout = 1)
      gates[1].value = true;
      gates[2].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(false); // Sum
      expect(result['4_out1']).toBe(true); // Cout
      
      // 1 + 0 + 0 = 01 (Sum = 1, Cout = 0)
      gates[0].value = true;
      gates[1].value = false;
      gates[2].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(true); // Sum
      expect(result['4_out1']).toBe(false); // Cout
      
      // 1 + 1 + 0 = 10 (Sum = 0, Cout = 1)
      gates[0].value = true;
      gates[1].value = true;
      gates[2].value = false;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(false); // Sum
      expect(result['4_out1']).toBe(true); // Cout
      
      // 1 + 0 + 1 = 10 (Sum = 0, Cout = 1)
      gates[0].value = true;
      gates[1].value = false;
      gates[2].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(false); // Sum
      expect(result['4_out1']).toBe(true); // Cout
      
      // 1 + 1 + 1 = 11 (Sum = 1, Cout = 1)
      gates[0].value = true;
      gates[1].value = true;
      gates[2].value = true;
      result = calculateCircuit(gates, connections);
      expect(result[4]).toBe(true); // Sum
      expect(result['4_out1']).toBe(true); // Cout
    });
  });

  describe('4ビット加算器の例', () => {
    it('複数のFull Adderを接続して4ビット加算ができる', () => {
      // 簡単な例: 3 + 5 = 8 (0011 + 0101 = 1000)
      const gates = [
        // A inputs (3 = 0011)
        { id: 'a0', type: 'INPUT', value: true },  // LSB
        { id: 'a1', type: 'INPUT', value: true },
        { id: 'a2', type: 'INPUT', value: false },
        { id: 'a3', type: 'INPUT', value: false }, // MSB
        
        // B inputs (5 = 0101)
        { id: 'b0', type: 'INPUT', value: true },  // LSB
        { id: 'b1', type: 'INPUT', value: false },
        { id: 'b2', type: 'INPUT', value: true },
        { id: 'b3', type: 'INPUT', value: false }, // MSB
        
        // Carry in
        { id: 'cin', type: 'INPUT', value: false },
        
        // Full Adders
        { id: 'fa0', type: 'FULL_ADDER', value: null },
        { id: 'fa1', type: 'FULL_ADDER', value: null },
        { id: 'fa2', type: 'FULL_ADDER', value: null },
        { id: 'fa3', type: 'FULL_ADDER', value: null }
      ];
      
      const connections = [
        // FA0
        { from: 'a0', to: 'fa0', toInput: 0 },
        { from: 'b0', to: 'fa0', toInput: 1 },
        { from: 'cin', to: 'fa0', toInput: 2 },
        
        // FA1
        { from: 'a1', to: 'fa1', toInput: 0 },
        { from: 'b1', to: 'fa1', toInput: 1 },
        { from: 'fa0_out1', to: 'fa1', toInput: 2 }, // carry from FA0
        
        // FA2
        { from: 'a2', to: 'fa2', toInput: 0 },
        { from: 'b2', to: 'fa2', toInput: 1 },
        { from: 'fa1_out1', to: 'fa2', toInput: 2 }, // carry from FA1
        
        // FA3
        { from: 'a3', to: 'fa3', toInput: 0 },
        { from: 'b3', to: 'fa3', toInput: 1 },
        { from: 'fa2_out1', to: 'fa3', toInput: 2 } // carry from FA2
      ];
      
      const result = calculateCircuit(gates, connections);
      
      // 結果は 8 = 1000
      expect(result['fa0']).toBe(false); // bit 0
      expect(result['fa1']).toBe(false); // bit 1
      expect(result['fa2']).toBe(false); // bit 2
      expect(result['fa3']).toBe(true);  // bit 3
      expect(result['fa3_out1']).toBe(false); // 最終キャリーなし
    });
  });
});