/**
 * Circuitクラスのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Circuit } from '../Circuit';
import { GateFactory } from '../gates/GateFactory';
import { GateType } from '@/types/gate';
import { InputGate } from '../gates/InputGate';

describe('Circuit', () => {
  let circuit: Circuit;

  beforeEach(() => {
    circuit = new Circuit();
    GateFactory.resetIdCounter();
  });

  describe('ゲート管理', () => {
    it('ゲートを追加できる', () => {
      const gate = GateFactory.create(GateType.AND, { x: 100, y: 100 });
      circuit.addGate(gate);
      
      expect(circuit.getGates()).toHaveLength(1);
      expect(circuit.getGate(gate.id)).toBe(gate);
    });

    it('ゲートを削除できる', () => {
      const gate = GateFactory.create(GateType.AND, { x: 100, y: 100 });
      circuit.addGate(gate);
      circuit.removeGate(gate.id);
      
      expect(circuit.getGates()).toHaveLength(0);
      expect(circuit.getGate(gate.id)).toBeUndefined();
    });

    it('ゲート削除時に関連する接続も削除される', () => {
      const input = GateFactory.create(GateType.INPUT, { x: 0, y: 0 });
      const and = GateFactory.create(GateType.AND, { x: 100, y: 0 });
      const output = GateFactory.create(GateType.OUTPUT, { x: 200, y: 0 });
      
      circuit.addGate(input);
      circuit.addGate(and);
      circuit.addGate(output);
      
      circuit.addConnection(input.id, 0, and.id, 0);
      circuit.addConnection(and.id, 0, output.id, 0);
      
      expect(circuit.getConnections()).toHaveLength(2);
      
      circuit.removeGate(and.id);
      
      expect(circuit.getConnections()).toHaveLength(0);
    });
  });

  describe('接続管理', () => {
    it('接続を追加できる', () => {
      const gate1 = GateFactory.create(GateType.INPUT, { x: 0, y: 0 });
      const gate2 = GateFactory.create(GateType.NOT, { x: 100, y: 0 });
      
      circuit.addGate(gate1);
      circuit.addGate(gate2);
      
      const connection = circuit.addConnection(gate1.id, 0, gate2.id, 0);
      
      expect(connection).toBeTruthy();
      expect(circuit.getConnections()).toHaveLength(1);
    });

    it('同じ接続を重複して追加できない', () => {
      const gate1 = GateFactory.create(GateType.INPUT, { x: 0, y: 0 });
      const gate2 = GateFactory.create(GateType.NOT, { x: 100, y: 0 });
      
      circuit.addGate(gate1);
      circuit.addGate(gate2);
      
      circuit.addConnection(gate1.id, 0, gate2.id, 0);
      circuit.addConnection(gate1.id, 0, gate2.id, 0);
      
      expect(circuit.getConnections()).toHaveLength(1);
    });
  });

  describe('シミュレーション', () => {
    it('NOTゲートが正しく動作する', () => {
      const input = GateFactory.create(GateType.INPUT, { x: 0, y: 0 }) as InputGate;
      const not = GateFactory.create(GateType.NOT, { x: 100, y: 0 });
      const output = GateFactory.create(GateType.OUTPUT, { x: 200, y: 0 });
      
      circuit.addGate(input);
      circuit.addGate(not);
      circuit.addGate(output);
      
      circuit.addConnection(input.id, 0, not.id, 0);
      circuit.addConnection(not.id, 0, output.id, 0);
      
      // Input = false
      input.setState(false);
      let result = circuit.simulate();
      expect(not.getOutputValue(0)).toBe(true);
      
      // Input = true
      input.setState(true);
      result = circuit.simulate();
      expect(not.getOutputValue(0)).toBe(false);
    });

    it('ANDゲートが正しく動作する', () => {
      const input1 = GateFactory.create(GateType.INPUT, { x: 0, y: 0 }) as InputGate;
      const input2 = GateFactory.create(GateType.INPUT, { x: 0, y: 50 }) as InputGate;
      const and = GateFactory.create(GateType.AND, { x: 100, y: 25 });
      const output = GateFactory.create(GateType.OUTPUT, { x: 200, y: 25 });
      
      circuit.addGate(input1);
      circuit.addGate(input2);
      circuit.addGate(and);
      circuit.addGate(output);
      
      circuit.addConnection(input1.id, 0, and.id, 0);
      circuit.addConnection(input2.id, 0, and.id, 1);
      circuit.addConnection(and.id, 0, output.id, 0);
      
      // Test all combinations
      const testCases = [
        { a: false, b: false, expected: false },
        { a: false, b: true, expected: false },
        { a: true, b: false, expected: false },
        { a: true, b: true, expected: true }
      ];
      
      testCases.forEach(({ a, b, expected }) => {
        input1.setState(a);
        input2.setState(b);
        const result = circuit.simulate();
        expect(and.getOutputValue(0)).toBe(expected);
      });
    });
  });

  describe('シリアライズ', () => {
    it('JSONに変換できる', () => {
      const input = GateFactory.create(GateType.INPUT, { x: 0, y: 0 });
      const output = GateFactory.create(GateType.OUTPUT, { x: 100, y: 0 });
      
      circuit.addGate(input);
      circuit.addGate(output);
      circuit.addConnection(input.id, 0, output.id, 0);
      
      const json = circuit.toJSON();
      
      expect(json.gates).toHaveLength(2);
      expect(json.connections).toHaveLength(1);
    });
  });
});