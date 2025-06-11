import { describe, it, expect } from 'vitest';
import {
  validateGateId,
  validateGateType,
  validateGatePosition,
  validateGateInputs,
  validateGate,
  validateWire,
  validateCustomGateDefinition,
  validateCircuit,
  validateCircuitLight,
} from '@domain/simulation/core';
import type { Gate, Wire } from '@/types/circuit';

describe('Pure API Validation', () => {
  describe('基本バリデーション', () => {
    describe('validateGateId', () => {
      it('should accept valid gate IDs', () => {
        const validIds = ['gate1', 'Gate_123', 'A-B-C', 'g'];
        
        validIds.forEach(id => {
          const result = validateGateId(id);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(id);
          }
        });
      });

      it('should reject non-string IDs', () => {
        const nonStringIds = [null, undefined, 123, {}, []];
        
        nonStringIds.forEach(id => {
          const result = validateGateId(id);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('ゲートの名前が正しくありません');
          }
        });
      });

      it('should reject empty or whitespace-only IDs', () => {
        const emptyIds = ['', '   ', '\t', '\n'];
        
        emptyIds.forEach(id => {
          const result = validateGateId(id);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('ゲートに名前を付けてください');
          }
        });
      });

      it('should reject IDs that are too long', () => {
        const longId = 'a'.repeat(101);
        const result = validateGateId(longId);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('ゲートの名前が長すぎます');
        }
      });

      it('should reject IDs with invalid characters', () => {
        const invalidIds = ['gate 1', 'gate@1', 'gate#1', 'gate.1', 'gate/1', 'gate\\1'];
        
        invalidIds.forEach(id => {
          const result = validateGateId(id);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('ゲートの名前に使用できない文字が含まれています');
          }
        });
      });
    });

    describe('validateGateType', () => {
      it('should accept valid gate types', () => {
        const validTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'CLOCK', 'D-FF', 'SR-LATCH', 'MUX', 'CUSTOM'];
        
        validTypes.forEach(type => {
          const result = validateGateType(type);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(type);
          }
        });
      });

      it('should reject invalid gate types', () => {
        const nonStringTypes = [null, undefined, 123];
        const invalidStringTypes = ['INVALID', 'and', 'INPUT_GATE'];
        
        // 非文字列型
        nonStringTypes.forEach(type => {
          const result = validateGateType(type);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('対応していないゲートの種類です');
          }
        });
        
        // 無効な文字列型
        invalidStringTypes.forEach(type => {
          const result = validateGateType(type);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('対応していないゲートの種類です');
          }
        });
      });
    });

    describe('validateGatePosition', () => {
      it('should accept valid positions', () => {
        const validPositions = [
          { x: 0, y: 0 },
          { x: 100, y: 200 },
          { x: -50, y: -100 },
          { x: 1.5, y: 2.7 },
        ];
        
        validPositions.forEach(pos => {
          const result = validateGatePosition(pos);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toEqual(pos);
          }
        });
      });

      it('should reject non-object positions', () => {
        const invalidPositions = [null, undefined, 'pos', 123, []];
        
        invalidPositions.forEach(pos => {
          const result = validateGatePosition(pos);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('位置情報が正しくありません');
          }
        });
      });

      it('should reject positions with non-numeric coordinates', () => {
        const invalidPositions = [
          { x: 'zero', y: 0 },
          { x: 0, y: null },
          { x: undefined, y: 100 },
          { x: {}, y: [] },
        ];
        
        invalidPositions.forEach(pos => {
          const result = validateGatePosition(pos);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('位置は数値で指定してください');
          }
        });
      });

      it('should reject positions with infinite coordinates', () => {
        const invalidPositions = [
          { x: Infinity, y: 0 },
          { x: 0, y: -Infinity },
          { x: NaN, y: 100 },
        ];
        
        invalidPositions.forEach(pos => {
          const result = validateGatePosition(pos);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain('無限大の値は使用できません');
          }
        });
      });
    });

    describe('validateGateInputs', () => {
      it('should validate correct input counts for different gate types', () => {
        const testCases = [
          { type: 'AND', inputs: [true, false], expected: true },
          { type: 'AND', inputs: [true], expected: false },
          { type: 'OR', inputs: [true, false], expected: true },
          { type: 'NOT', inputs: [true], expected: true },
          { type: 'NOT', inputs: [true, false], expected: false },
          { type: 'INPUT', inputs: [], expected: true },
          { type: 'OUTPUT', inputs: [true], expected: true },
          { type: 'MUX', inputs: [true, false, false], expected: true },
        ];
        
        testCases.forEach(({ type, inputs, expected }) => {
          const result = validateGateInputs(inputs, type);
          expect(result.success).toBe(expected);
        });
      });

      it('should reject incorrect input counts', () => {
        const testCases = [
          { type: 'AND', inputs: [], expectedMessage: '2個の入力が必要' },
          { type: 'OR', inputs: [true, false, true], expectedMessage: '2個の入力が必要' },
          { type: 'NOT', inputs: [], expectedMessage: '1個の入力が必要' },
        ];
        
        testCases.forEach(({ type, inputs, expectedMessage }) => {
          const result = validateGateInputs(inputs, type);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.message).toContain(expectedMessage);
          }
        });
      });

      it('should reject non-boolean inputs', () => {
        const result = validateGateInputs(['true', 1], 'AND');
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('入力値が正しくありません');
        }
      });

      it('should validate custom gate inputs', () => {
        const customDef = {
          id: 'custom1',
          name: 'MyGate',
          displayName: 'My Gate',
          inputs: [{ name: 'A', index: 0 }, { name: 'B', index: 1 }],
          outputs: [{ name: 'Y', index: 0 }],
          truthTable: { '00': '0', '01': '1', '10': '1', '11': '0' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const result1 = validateGateInputs([true, false], 'CUSTOM', customDef);
        expect(result1.success).toBe(true);
        
        const result2 = validateGateInputs([true], 'CUSTOM', customDef);
        expect(result2.success).toBe(false);
      });
    });
  });

  describe('構造バリデーション', () => {
    describe('validateGate', () => {
      it('should accept valid gates', () => {
        const validGates: Gate[] = [
          { id: 'g1', type: 'AND', position: { x: 0, y: 0 }, inputs: ['', ''], output: false },
          { id: 'g2', type: 'NOT', position: { x: 100, y: 0 }, inputs: [''], output: true },
          { id: 'g3', type: 'INPUT', position: { x: -50, y: 0 }, inputs: [], output: false },
        ];
        
        validGates.forEach(gate => {
          const result = validateGate(gate);
          expect(result.success).toBe(true);
        });
      });

      it('should reject gates with multiple validation errors', () => {
        const invalidGate = {
          id: '',
          type: 'INVALID',
          position: { x: 'not a number', y: null },
          inputs: 'not an array',
          output: 'not a boolean',
        };
        
        const result = validateGate(invalidGate as any);
        expect(result.success).toBe(false);
        if (!result.success && result.error.violations) {
          expect(result.error.violations.length).toBeGreaterThan(1);
        }
      });

      it('should validate custom gates with definitions', () => {
        const customDef = {
          id: 'custom1',
          name: 'MyGate',
          displayName: 'My Gate',
          inputs: [{ name: 'A', index: 0 }],
          outputs: [{ name: 'Y', index: 0 }],
          truthTable: { '0': '1', '1': '0' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const gate: Gate = {
          id: 'g1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition: customDef,
        };
        
        const result = validateGate(gate);
        expect(result.success).toBe(true);
      });

      it('should reject custom gates without definitions', () => {
        const gate: Gate = {
          id: 'g1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
        };
        
        const result = validateGate(gate);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('カスタムゲートの定義が見つかりません');
        }
      });
    });

    describe('validateWire', () => {
      it('should accept valid wires', () => {
        const validWires: Wire[] = [
          { id: 'w1', from: { gateId: 'g1', pinIndex: -1 }, to: { gateId: 'g2', pinIndex: 0 }, isActive: false },
          { id: 'w2', from: { gateId: 'g2', pinIndex: -1 }, to: { gateId: 'g3', pinIndex: 1 }, isActive: true },
        ];
        
        validWires.forEach(wire => {
          const result = validateWire(wire);
          expect(result.success).toBe(true);
        });
      });

      it('should reject wires with invalid connection points', () => {
        const invalidWire = {
          id: 'w1',
          from: { gateId: 123, pinIndex: 'zero' },
          to: { gateId: '', pinIndex: null },
          isActive: 'yes',
        };
        
        const result = validateWire(invalidWire as any);
        expect(result.success).toBe(false);
        if (!result.success && result.error.violations) {
          expect(result.error.violations.length).toBeGreaterThan(1);
        }
      });

      it('should reject wires with missing connection objects', () => {
        const invalidWires = [
          { id: 'w1', from: null, to: { gateId: 'g1', pinIndex: 0 }, isActive: false },
          { id: 'w2', from: { gateId: 'g1', pinIndex: 0 }, to: undefined, isActive: false },
        ];
        
        invalidWires.forEach(wire => {
          const result = validateWire(wire as any);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('validateCustomGateDefinition', () => {
      it('should accept valid custom gate definitions', () => {
        const validDef = {
          id: 'custom1',
          name: 'MyGate',
          displayName: 'My Custom Gate',
          inputs: [{ name: 'A', index: 0 }, { name: 'B', index: 1 }],
          outputs: [{ name: 'Y', index: 0 }],
          truthTable: { '00': '0', '01': '1', '10': '1', '11': '0' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const result = validateCustomGateDefinition(validDef);
        expect(result.success).toBe(true);
      });

      it('should reject definitions without inputs or outputs', () => {
        const invalidDefs = [
          {
            id: 'custom1',
            name: 'NoInputs',
            displayName: 'No Inputs',
            inputs: [],
            outputs: [{ name: 'Y', index: 0 }],
            truthTable: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'custom2',
            name: 'NoOutputs',
            displayName: 'No Outputs',
            inputs: [{ name: 'A', index: 0 }],
            outputs: [],
            truthTable: { '0': '0', '1': '1' },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
        
        invalidDefs.forEach(def => {
          const result = validateCustomGateDefinition(def);
          expect(result.success).toBe(false);
        });
      });

      it('should reject definitions without implementation', () => {
        const invalidDef = {
          id: 'custom1',
          name: 'NoImpl',
          displayName: 'No Implementation',
          inputs: [{ name: 'A', index: 0 }],
          outputs: [{ name: 'Y', index: 0 }],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const result = validateCustomGateDefinition(invalidDef as any);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('動作を定義してください');
        }
      });
    });
  });

  describe('回路全体のバリデーション', () => {
    describe('validateCircuit', () => {
      it('should accept valid circuits', () => {
        const circuit = {
          gates: [
            { id: 'input1', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], output: true },
            { id: 'and1', type: 'AND', position: { x: 100, y: 0 }, inputs: ['', ''], output: false },
            { id: 'output1', type: 'OUTPUT', position: { x: 200, y: 0 }, inputs: [''], output: false },
          ] as Gate[],
          wires: [
            { id: 'w1', from: { gateId: 'input1', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 0 }, isActive: true },
            { id: 'w2', from: { gateId: 'and1', pinIndex: -1 }, to: { gateId: 'output1', pinIndex: 0 }, isActive: false },
          ] as Wire[],
        };
        
        const result = validateCircuit(circuit);
        expect(result.success).toBe(true);
      });

      it('should detect duplicate gate IDs', () => {
        const circuit = {
          gates: [
            { id: 'g1', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], output: false },
            { id: 'g1', type: 'OUTPUT', position: { x: 100, y: 0 }, inputs: [''], output: false },
          ] as Gate[],
          wires: [] as Wire[],
        };
        
        const result = validateCircuit(circuit);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('同じ名前のゲートが既に存在します');
        }
      });

      it('should detect missing referenced gates', () => {
        const circuit = {
          gates: [
            { id: 'g1', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], output: false },
          ] as Gate[],
          wires: [
            { id: 'w1', from: { gateId: 'g1', pinIndex: -1 }, to: { gateId: 'missing', pinIndex: 0 }, isActive: false },
          ] as Wire[],
        };
        
        const result = validateCircuit(circuit);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('終了点となるゲートが見つかりません');
        }
      });

      it('should detect circular dependencies', () => {
        const circuit = {
          gates: [
            { id: 'g1', type: 'NOT', position: { x: 0, y: 0 }, inputs: [''], output: false },
            { id: 'g2', type: 'NOT', position: { x: 100, y: 0 }, inputs: [''], output: false },
          ] as Gate[],
          wires: [
            { id: 'w1', from: { gateId: 'g1', pinIndex: -1 }, to: { gateId: 'g2', pinIndex: 0 }, isActive: false },
            { id: 'w2', from: { gateId: 'g2', pinIndex: -1 }, to: { gateId: 'g1', pinIndex: 0 }, isActive: false },
          ] as Wire[],
        };
        
        const result = validateCircuit(circuit);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('無限ループが発生しています');
        }
      });

      it('should provide helpful suggestions', () => {
        const circuit = {
          gates: [
            { id: 'g1', type: 'AND', position: { x: 0, y: 0 }, inputs: ['', ''], output: false },
          ] as Gate[],
          wires: [] as Wire[],
        };
        
        const result = validateCircuit(circuit, { strictMode: false });
        expect(result.success).toBe(true);
        if (result.success && result.data.suggestions) {
          console.log('Actual suggestions:', result.data.suggestions);
          expect(result.data.suggestions).toContain('入力ゲート（INPUT）を追加して、外部からの信号を受け取れるようにしましょう。');
          expect(result.data.suggestions).toContain('出力ゲート（OUTPUT）を追加して、回路の結果を確認できるようにしましょう。');
        }
      });

      it('should validate circuit size limits', () => {
        const manyGates = Array.from({ length: 1001 }, (_, i) => ({
          id: `g${i}`,
          type: 'INPUT' as const,
          position: { x: i * 10, y: 0 },
          inputs: [],
          output: false,
        }));
        
        const circuit = {
          gates: manyGates,
          wires: [] as Wire[],
        };
        
        const result = validateCircuit(circuit, { maxGateCount: 1000 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain('回路が複雑すぎます');
        }
      });
    });

    describe('validateCircuitLight', () => {
      it('should perform basic validation quickly', () => {
        const circuit = {
          gates: [
            { id: 'g1', type: 'INPUT', position: { x: 0, y: 0 }, inputs: [], output: false },
            { id: 'g2', type: 'OUTPUT', position: { x: 100, y: 0 }, inputs: [''], output: false },
          ] as Gate[],
          wires: [] as Wire[],
        };
        
        const result = validateCircuitLight(circuit);
        expect(result.success).toBe(true);
      });

      it('should detect basic structural errors', () => {
        const circuit = {
          gates: null as any,
          wires: [] as Wire[],
        };
        
        const result = validateCircuitLight(circuit);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('should handle medium-sized circuits efficiently', () => {
      const gateCount = 100;
      const gates = Array.from({ length: gateCount }, (_, i) => ({
        id: `g${i}`,
        type: i % 2 === 0 ? 'AND' : 'OR' as const,
        position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        inputs: ['', ''],
        output: false,
      }));
      
      const wires = Array.from({ length: gateCount - 1 }, (_, i) => ({
        id: `w${i}`,
        from: { gateId: `g${i}`, pinIndex: -1 },
        to: { gateId: `g${i + 1}`, pinIndex: 0 },
        isActive: false,
      }));
      
      const circuit = { gates, wires };
      
      const start = performance.now();
      const result = validateCircuit(circuit, { strictValidation: true, enableDebug: false });
      const end = performance.now();
      
      expect(result.success).toBe(true);
      expect(end - start).toBeLessThan(100); // 100ms以内で完了すること
    });
  });
});