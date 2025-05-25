// 回路ユーティリティのユニットテスト

import { describe, it, expect } from 'vitest';
import {
  calculateCircuit,
  createGate,
  getConnectionPath,
  getGateOutputX,
  getGateOutputY,
  getGateInputX,
  getGateInputY,
  constrainGatePosition,
  getAvailableGateTypes
} from '../circuit';
import { GATE_TYPES, CANVAS } from '../../constants/circuit';

describe('circuit utilities', () => {
  describe('calculateCircuit', () => {
    it('should calculate simple AND gate circuit', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'INPUT', value: true },
        { id: 3, type: 'AND', value: null },
        { id: 4, type: 'OUTPUT', value: null }
      ];
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 },
        { from: 3, to: 4, toInput: 0 }
      ];
      
      const result = calculateCircuit(gates, connections);
      
      expect(result[1]).toBe(true);
      expect(result[2]).toBe(true);
      expect(result[3]).toBe(true); // AND(true, true) = true
    });

    it('should calculate OR gate circuit', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: false },
        { id: 2, type: 'INPUT', value: true },
        { id: 3, type: 'OR', value: null }
      ];
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 }
      ];
      
      const result = calculateCircuit(gates, connections);
      
      expect(result[3]).toBe(true); // OR(false, true) = true
    });

    it('should calculate NOT gate circuit', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'NOT', value: null }
      ];
      
      const connections = [
        { from: 1, to: 2, toInput: 0 }
      ];
      
      const result = calculateCircuit(gates, connections);
      
      expect(result[2]).toBe(false); // NOT(true) = false
    });

    it('should handle XOR gate', () => {
      const gates = [
        { id: 1, type: 'INPUT', value: true },
        { id: 2, type: 'INPUT', value: false },
        { id: 3, type: 'XOR', value: null }
      ];
      
      const connections = [
        { from: 1, to: 3, toInput: 0 },
        { from: 2, to: 3, toInput: 1 }
      ];
      
      const result = calculateCircuit(gates, connections);
      
      expect(result[3]).toBe(true); // XOR(true, false) = true
    });

    it('should handle complex circuit with multiple gates', () => {
      // (A AND B) OR (NOT C)
      const gates = [
        { id: 1, type: 'INPUT', value: true },  // A
        { id: 2, type: 'INPUT', value: false }, // B
        { id: 3, type: 'INPUT', value: true },  // C
        { id: 4, type: 'AND', value: null },
        { id: 5, type: 'NOT', value: null },
        { id: 6, type: 'OR', value: null }
      ];
      
      const connections = [
        { from: 1, to: 4, toInput: 0 }, // A -> AND
        { from: 2, to: 4, toInput: 1 }, // B -> AND
        { from: 3, to: 5, toInput: 0 }, // C -> NOT
        { from: 4, to: 6, toInput: 0 }, // AND -> OR
        { from: 5, to: 6, toInput: 1 }  // NOT -> OR
      ];
      
      const result = calculateCircuit(gates, connections);
      
      expect(result[4]).toBe(false); // AND(true, false) = false
      expect(result[5]).toBe(false); // NOT(true) = false
      expect(result[6]).toBe(false); // OR(false, false) = false
    });

    it('should respect maximum iterations to prevent infinite loops', () => {
      // Create a potential feedback loop
      const gates = [
        { id: 1, type: 'NOT', value: null }
      ];
      
      const connections = [
        { from: 1, to: 1, toInput: 0 } // Self-connection
      ];
      
      // Should not throw, should terminate after max iterations
      expect(() => calculateCircuit(gates, connections)).not.toThrow();
    });
  });

  describe('createGate', () => {
    it('should create an INPUT gate with default value true', () => {
      const gate = createGate('INPUT', 100, 200);
      
      expect(gate).toMatchObject({
        type: 'INPUT',
        x: 100,
        y: 200,
        value: true,
        inputs: [],
        outputs: [null],
        memory: null
      });
      expect(gate.id).toBeDefined();
    });

    it('should create an AND gate with correct properties', () => {
      const gate = createGate('AND', 150, 250);
      
      expect(gate).toMatchObject({
        type: 'AND',
        x: 150,
        y: 250,
        value: null,
        inputs: [null, null],
        outputs: [null],
        memory: null
      });
    });

    it('should create a CLOCK gate with provided signal', () => {
      const gate = createGate('CLOCK', 200, 300, true);
      
      expect(gate).toMatchObject({
        type: 'CLOCK',
        value: true
      });
    });

    it('should return null for invalid gate type', () => {
      const gate = createGate('INVALID_TYPE', 100, 100);
      expect(gate).toBeNull();
    });

    it('should create unique IDs for each gate', () => {
      const gate1 = createGate('INPUT', 100, 100);
      const gate2 = createGate('INPUT', 200, 200);
      
      expect(gate1.id).not.toBe(gate2.id);
    });
  });

  describe('connection path generation', () => {
    it('should generate correct SVG path', () => {
      const path = getConnectionPath(100, 100, 200, 200);
      expect(path).toBe('M 100 100 C 150 100, 150 200, 200 200');
    });
  });

  describe('gate position calculations', () => {
    const gate = { x: 100, y: 200, type: 'AND' };

    it('should calculate output X position', () => {
      expect(getGateOutputX(gate)).toBe(160); // 100 + 60
    });

    it('should calculate output Y position for single output', () => {
      expect(getGateOutputY(gate, 0)).toBe(200);
    });

    it('should calculate output Y position for multiple outputs', () => {
      const multiOutputGate = { ...gate, type: 'HALF_ADDER' };
      expect(getGateOutputY(multiOutputGate, 0)).toBe(190); // 200 - 10
      expect(getGateOutputY(multiOutputGate, 1)).toBe(210); // 200 - 10 + 20
    });

    it('should calculate input X position', () => {
      expect(getGateInputX(gate)).toBe(40); // 100 - 60
    });

    it('should calculate input Y position', () => {
      expect(getGateInputY(gate, 0)).toBe(180); // 200 - 20
      expect(getGateInputY(gate, 1)).toBe(205); // 200 - 20 + 25
    });
  });

  describe('constrainGatePosition', () => {
    it('should constrain position within canvas bounds', () => {
      const result = constrainGatePosition(30, 40, CANVAS);
      expect(result).toEqual({ x: CANVAS.MIN_X, y: CANVAS.MIN_Y });
    });

    it('should not change position if within bounds', () => {
      const result = constrainGatePosition(500, 300, CANVAS);
      expect(result).toEqual({ x: 500, y: 300 });
    });

    it('should constrain to maximum bounds', () => {
      const result = constrainGatePosition(1000, 700, CANVAS);
      expect(result).toEqual({ x: CANVAS.MAX_X, y: CANVAS.MAX_Y });
    });
  });

  describe('getAvailableGateTypes', () => {
    it('should return only level 1 gates when level 1 is unlocked', () => {
      const available = getAvailableGateTypes(1, { 1: true });
      
      expect(available.length).toBe(5);
      expect(available.every(([_, info]) => info.level === 1)).toBe(true);
    });

    it('should return level 1 and 2 gates when both are unlocked', () => {
      const available = getAvailableGateTypes(2, { 1: true, 2: true });
      
      const level1Gates = available.filter(([_, info]) => info.level === 1);
      const level2Gates = available.filter(([_, info]) => info.level === 2);
      
      expect(level1Gates.length).toBe(5);
      expect(level2Gates.length).toBe(5);
    });

    it('should not return gates from locked levels', () => {
      const available = getAvailableGateTypes(3, { 1: true, 2: false, 3: true });
      
      const level2Gates = available.filter(([_, info]) => info.level === 2);
      expect(level2Gates.length).toBe(0);
    });
  });
});