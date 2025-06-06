import { describe, it, expect } from 'vitest';
import { evaluateCircuit, evaluateGateUnified, isFailure, isSuccess, defaultConfig, createFixedTimeProvider } from '@domain/simulation/core';
import { Gate, Wire } from '@/types/circuit';

describe('Circuit Simulation Error Handling - New API', () => {
  const timeProvider = createFixedTimeProvider(1000);
  const config = { ...defaultConfig, timeProvider, strictValidation: true };

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

      const result = evaluateCircuit({ gates, wires: [] }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations).toBeDefined();
        expect(result.error.violations?.some(v => v.message.includes('cannot be empty'))).toBe(true);
      }
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

      const result = evaluateCircuit({ gates, wires: [] }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message.includes('must be string'))).toBe(true);
      }
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

      const result = evaluateCircuit({ gates: [], wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message && (
          v.message.includes('Wire from.gateId must be a non-empty string') ||
          v.message.includes('non-existent source gate')
        ))).toBe(true);
      }
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

      const result = evaluateCircuit({ gates: [], wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message.includes('Wire ID must be a non-empty string'))).toBe(true);
      }
    });
  });

  describe('Duplicate ID Detection', () => {
    it('should detect duplicate gate IDs', () => {
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

      const result = evaluateCircuit({ gates, wires: [] }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message.includes('Duplicate gate ID'))).toBe(true);
      }
    });

    it('should detect duplicate wire IDs', () => {
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message.includes('Duplicate wire ID'))).toBe(true);
      }
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('missing_gate');
      }
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('missing_gate');
      }
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations).toBeDefined();
        expect(result.error.violations?.some(v => v.code === 'CIRCULAR_DEPENDENCY')).toBe(true);
      }
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations).toBeDefined();
        expect(result.error.violations?.some(v => v.code === 'CIRCULAR_DEPENDENCY')).toBe(true);
      }
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

      const result = evaluateCircuit({ gates, wires: [] }, config);
      
      // The new API should handle this as a validation error
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
      }
    });

    it('should detect invalid output pin indices', () => {
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      // The new API should validate wire connections properly
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.violations?.some(v => v.message.includes('Invalid pin index'))).toBe(true);
      }
    });
  });

  describe('Valid Circuit Evaluation', () => {
    it('should handle valid circuits without errors', () => {
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates).toHaveLength(2);
        expect(result.data.circuit.wires).toHaveLength(1);
        
        // Verify logic correctness: NOT true = false
        expect(result.data.circuit.gates[1].output).toBe(false);
      }
    });

    it('should evaluate complex valid circuits correctly', () => {
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

      const result = evaluateCircuit({ gates, wires }, config);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates).toHaveLength(4);
        expect(result.data.circuit.wires).toHaveLength(3);
        
        // Verify logic: true AND false = false
        expect(result.data.circuit.gates[2].output).toBe(false); // AND gate
        expect(result.data.circuit.gates[3].output).toBe(false); // OUTPUT gate
      }
    });
  });

  describe('Performance with Error Handling', () => {
    it('should maintain performance even with validation', () => {
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

      // Create some valid wires (avoiding circular dependencies)
      for (let i = 0; i < 50; i++) {
        const fromIndex = Math.floor(Math.random() * 50); // Lower half
        const toIndex = 50 + Math.floor(Math.random() * 50); // Upper half
        
        wires.push({
          id: `wire_${i}`,
          from: { gateId: `gate_${fromIndex}`, pinIndex: -1 },
          to: { gateId: `gate_${toIndex}`, pinIndex: Math.floor(Math.random() * 2) },
          isActive: false,
        });
      }

      const startTime = performance.now();
      const result = evaluateCircuit({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates).toHaveLength(100);
        expect(executionTime).toBeLessThan(100); // Should still be fast
        console.log(`New API evaluation (100 gates): ${executionTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Debug Information', () => {
    it('should provide debug information when enabled', () => {
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

      const debugConfig = { ...config, enableDebug: true };
      const result = evaluateCircuit({ gates, wires }, debugConfig);
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.debugTrace).toBeDefined();
        expect(result.data.evaluationStats).toBeDefined();
        expect(result.data.evaluationStats.evaluatedGates).toBe(2);
      }
    });
  });
});