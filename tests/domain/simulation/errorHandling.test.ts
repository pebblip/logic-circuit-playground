import { describe, it, expect } from 'vitest';
import { evaluateCircuitSafe, evaluateCircuit, createFixedTimeProvider } from '@domain/simulation/circuitSimulation';
import { Gate, Wire } from '@/types/circuit';

describe('Circuit Simulation Error Handling', () => {
  const timeProvider = createFixedTimeProvider(1000);

  describe('Input Validation', () => {
    it('should detect invalid gate IDs', () => {
      const gates: Gate[] = [
        {
          id: '', // Invalid empty ID
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, [], timeProvider);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_GATE');
      expect(result.errors[0].message).toContain('invalid ID');
    });

    it('should detect missing gate types', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: undefined as any, // Invalid type
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, [], timeProvider);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_GATE');
      expect(result.errors[0].message).toContain('no type specified');
    });

    it('should detect invalid wire connections', () => {
      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: '', pinIndex: -1 }, // Invalid empty gate ID
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe([], wires, timeProvider);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_WIRE');
      expect(result.errors[0].message).toContain('invalid connection points');
    });

    it('should detect invalid wire IDs', () => {
      const wires: Wire[] = [
        {
          id: null as any, // Invalid null ID
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe([], wires, timeProvider);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('INVALID_WIRE');
      expect(result.errors[0].message).toContain('invalid ID');
    });
  });

  describe('Duplicate ID Detection', () => {
    it('should warn about duplicate gate IDs', () => {
      const gates: Gate[] = [
        {
          id: 'duplicate',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'duplicate', // Duplicate ID
          type: 'OR',
          position: { x: 50, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, [], timeProvider);
      
      expect(result.warnings).toContain('Duplicate gate ID detected: duplicate');
    });

    it('should warn about duplicate wire IDs', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true,
        },
        {
          id: 'gate2',
          type: 'OUTPUT',
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'duplicate',
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'duplicate', // Duplicate ID
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.warnings).toContain('Duplicate wire ID detected: duplicate');
    });
  });

  describe('Missing Dependency Detection', () => {
    it('should detect missing source gates', () => {
      const gates: Gate[] = [
        {
          id: 'gate2',
          type: 'OUTPUT',
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'missing_gate', pinIndex: -1 }, // Non-existent gate
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.errors.filter(e => e.type === 'MISSING_DEPENDENCY')).toHaveLength(1);
      const missingError = result.errors.find(e => e.type === 'MISSING_DEPENDENCY');
      expect(missingError?.message).toContain('non-existent source gate: missing_gate');
      
      // Also expect an evaluation error when trying to evaluate the missing gate
      expect(result.errors.some(e => e.type === 'EVALUATION_ERROR')).toBe(true);
    });

    it('should detect missing target gates', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'missing_gate', pinIndex: 0 }, // Non-existent gate
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('MISSING_DEPENDENCY');
      expect(result.errors[0].message).toContain('non-existent target gate: missing_gate');
    });
  });

  describe('Circular Dependency Detection', () => {
    it('should detect simple circular dependencies', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'gate2',
          type: 'AND',
          position: { x: 100, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'gate2', pinIndex: -1 },
          to: { gateId: 'gate1', pinIndex: 0 }, // Creates circular dependency
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.errors.some(e => e.type === 'CIRCULAR_DEPENDENCY')).toBe(true);
      const circularError = result.errors.find(e => e.type === 'CIRCULAR_DEPENDENCY');
      expect(circularError?.message).toContain('Circular dependency detected');
      expect(circularError?.details?.stack).toContain('gate1');
      expect(circularError?.details?.stack).toContain('gate2');
    });

    it('should detect complex circular dependencies', () => {
      const gates: Gate[] = [
        {
          id: 'gate1',
          type: 'AND',
          position: { x: 0, y: 0 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'gate2',
          type: 'AND',
          position: { x: 100, y: 0 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'gate3',
          type: 'AND',
          position: { x: 200, y: 0 },
          inputs: ['', ''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'gate1', pinIndex: -1 },
          to: { gateId: 'gate2', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'gate2', pinIndex: -1 },
          to: { gateId: 'gate3', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire3',
          from: { gateId: 'gate3', pinIndex: -1 },
          to: { gateId: 'gate1', pinIndex: 1 }, // Creates 3-gate cycle
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.errors.some(e => e.type === 'CIRCULAR_DEPENDENCY')).toBe(true);
    });
  });

  describe('Gate Evaluation Error Handling', () => {
    it('should handle malformed custom gates gracefully', () => {
      const gates: Gate[] = [
        {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 0, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition: null as any, // Malformed custom gate
        }
      ];

      const result = evaluateCircuitSafe(gates, [], timeProvider);
      
      // Should not crash, should provide fallback behavior
      expect(result.gates).toHaveLength(1);
      expect(result.gates[0].output).toBe(false); // Safe fallback
    });

    it('should warn about invalid output pin indices', () => {
      // Create a custom gate that will have outputs after evaluation
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true,
        },
        {
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false,
          customGateDefinition: {
            id: 'test',
            name: 'Test Buffer',
            inputs: [{ name: 'A' }],
            outputs: [{ name: 'Y' }], // Single output
            truthTable: { '0': '0', '1': '1' }
          }
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 0 },
          inputs: [''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'custom1', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'custom1', pinIndex: -3 }, // Invalid! Only has output -1 (index 0)
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      // The invalid pin index should be detected during wire state update
      expect(result.warnings.some(w => w.includes('Invalid output pin index'))).toBe(true);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with evaluateCircuit', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true,
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: false,
        }
      ];

      const safeResult = evaluateCircuitSafe(gates, wires, timeProvider);
      const legacyResult = evaluateCircuit(gates, wires, timeProvider);

      // Results should be identical (excluding error/warning info)
      expect(safeResult.gates).toEqual(legacyResult.gates);
      expect(safeResult.wires).toEqual(legacyResult.wires);
      
      // Verify logic correctness: NOT true = false
      expect(safeResult.gates[1].output).toBe(false);
      expect(legacyResult.gates[1].output).toBe(false);
    });

    it('should handle valid circuits without errors or warnings', () => {
      const gates: Gate[] = [
        {
          id: 'input1',
          type: 'INPUT',
          position: { x: 0, y: 0 },
          inputs: [],
          output: true,
        },
        {
          id: 'input2',
          type: 'INPUT',
          position: { x: 0, y: 50 },
          inputs: [],
          output: false,
        },
        {
          id: 'and1',
          type: 'AND',
          position: { x: 100, y: 25 },
          inputs: ['', ''],
          output: false,
        },
        {
          id: 'output1',
          type: 'OUTPUT',
          position: { x: 200, y: 25 },
          inputs: [''],
          output: false,
        }
      ];

      const wires: Wire[] = [
        {
          id: 'wire1',
          from: { gateId: 'input1', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 0 },
          isActive: false,
        },
        {
          id: 'wire2',
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'and1', pinIndex: 1 },
          isActive: false,
        },
        {
          id: 'wire3',
          from: { gateId: 'and1', pinIndex: -1 },
          to: { gateId: 'output1', pinIndex: 0 },
          isActive: false,
        }
      ];

      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.gates).toHaveLength(4);
      expect(result.wires).toHaveLength(3);
      
      // Verify logic: true AND false = false
      expect(result.gates[2].output).toBe(false); // AND gate
      expect(result.gates[3].output).toBe(false); // OUTPUT gate
    });
  });

  describe('Performance with Error Handling', () => {
    it('should maintain performance even with error detection', () => {
      // Create a larger circuit to test performance impact
      const gates: Gate[] = [];
      const wires: Wire[] = [];

      // Create 100 gates
      for (let i = 0; i < 100; i++) {
        gates.push({
          id: `gate_${i}`,
          type: i < 10 ? 'INPUT' : i >= 90 ? 'OUTPUT' : 'AND',
          position: { x: (i % 10) * 50, y: Math.floor(i / 10) * 50 },
          inputs: i < 10 ? [] : i >= 90 ? [''] : ['', ''],
          output: i < 10 ? Math.random() > 0.5 : false,
        });
      }

      // Create some valid wires
      for (let i = 0; i < 50; i++) {
        const fromIndex = Math.floor(Math.random() * 80); // Avoid OUTPUT gates
        const toIndex = 10 + Math.floor(Math.random() * 80); // Avoid INPUT gates
        
        wires.push({
          id: `wire_${i}`,
          from: { gateId: `gate_${fromIndex}`, pinIndex: -1 },
          to: { gateId: `gate_${toIndex}`, pinIndex: Math.floor(Math.random() * 2) },
          isActive: false,
        });
      }

      const startTime = performance.now();
      const result = evaluateCircuitSafe(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates).toHaveLength(100);
      expect(executionTime).toBeLessThan(100); // Should still be fast
      console.log(`Error-safe evaluation (100 gates): ${executionTime.toFixed(2)}ms`);
    });
  });
});