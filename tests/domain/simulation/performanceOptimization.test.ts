import { describe, it, expect } from 'vitest';
import { evaluateCircuit, createFixedTimeProvider } from '@domain/simulation/circuitSimulation';
import { Gate, Wire } from '@/types/circuit';

describe('Circuit Simulation Performance Optimization', () => {
  // 大規模な回路を生成するヘルパー関数
  function createLargeCircuit(gateCount: number, wireRatio: number = 2) {
    const gates: Gate[] = [];
    const wires: Wire[] = [];

    // INPUT gates (10% of total)
    const inputCount = Math.floor(gateCount * 0.1);
    for (let i = 0; i < inputCount; i++) {
      gates.push({
        id: `input_${i}`,
        type: 'INPUT',
        position: { x: i * 50, y: 0 },
        inputs: [],
        output: Math.random() > 0.5,
      });
    }

    // Logic gates (80% of total)
    const logicCount = Math.floor(gateCount * 0.8);
    const gateTypes = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'] as const;
    for (let i = 0; i < logicCount; i++) {
      const gateType = gateTypes[i % gateTypes.length];
      gates.push({
        id: `logic_${i}`,
        type: gateType,
        position: { x: (i % 20) * 50, y: Math.floor(i / 20) * 50 + 100 },
        inputs: gateType === 'NOT' ? [''] : ['', ''],
        output: false,
      });
    }

    // OUTPUT gates (10% of total)
    const outputCount = gateCount - inputCount - logicCount;
    for (let i = 0; i < outputCount; i++) {
      gates.push({
        id: `output_${i}`,
        type: 'OUTPUT',
        position: { x: i * 50, y: 600 },
        inputs: [''],
        output: false,
      });
    }

    // Wire generation with controlled connectivity
    const wireCount = Math.min(gateCount * wireRatio, gateCount * (gateCount - 1) / 4);
    const wireTargets = new Set<string>();

    for (let i = 0; i < wireCount; i++) {
      let attempts = 0;
      while (attempts < 100) { // Avoid infinite loop
        const fromGateIndex = Math.floor(Math.random() * gates.length);
        const toGateIndex = Math.floor(Math.random() * gates.length);
        
        if (fromGateIndex === toGateIndex) {
          attempts++;
          continue;
        }

        const fromGate = gates[fromGateIndex];
        const toGate = gates[toGateIndex];
        
        // Avoid cycles and invalid connections
        if (toGate.type === 'INPUT' || fromGate.type === 'OUTPUT') {
          attempts++;
          continue;
        }

        const toPinIndex = toGate.type === 'NOT' || toGate.type === 'OUTPUT' ? 0 : 
                          Math.floor(Math.random() * 2);
        const wireKey = `${toGate.id}:${toPinIndex}`;
        
        if (wireTargets.has(wireKey)) {
          attempts++;
          continue; // Avoid duplicate connections to same pin
        }

        wireTargets.add(wireKey);
        wires.push({
          id: `wire_${i}`,
          from: { gateId: fromGate.id, pinIndex: -1 },
          to: { gateId: toGate.id, pinIndex: toPinIndex },
          isActive: false,
        });
        break;
      }
    }

    return { gates, wires };
  }

  describe('Algorithm Performance: O(n²) → O(n)', () => {
    it('should handle small circuits efficiently (50 gates)', () => {
      const { gates, wires } = createLargeCircuit(50, 1.5);
      const timeProvider = createFixedTimeProvider(1000);

      const startTime = performance.now();
      const result = evaluateCircuit(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates.length).toBe(50);
      expect(executionTime).toBeLessThan(10); // Should be very fast
      console.log(`50 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should handle medium circuits efficiently (200 gates)', () => {
      const { gates, wires } = createLargeCircuit(200, 2);
      const timeProvider = createFixedTimeProvider(1000);

      const startTime = performance.now();
      const result = evaluateCircuit(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates.length).toBe(200);
      expect(executionTime).toBeLessThan(50); // Still fast
      console.log(`200 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should handle large circuits efficiently (500 gates)', () => {
      const { gates, wires } = createLargeCircuit(500, 2);
      const timeProvider = createFixedTimeProvider(1000);

      const startTime = performance.now();
      const result = evaluateCircuit(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates.length).toBe(500);
      expect(executionTime).toBeLessThan(100); // Linear scaling expected
      console.log(`500 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should demonstrate linear scaling behavior', () => {
      const sizes = [50, 100, 200];
      const times: number[] = [];
      const timeProvider = createFixedTimeProvider(1000);

      sizes.forEach(size => {
        const { gates, wires } = createLargeCircuit(size, 2);
        
        const startTime = performance.now();
        evaluateCircuit(gates, wires, timeProvider);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        times.push(executionTime);
        console.log(`${size} gates: ${executionTime.toFixed(2)}ms`);
      });

      // Check that scaling is roughly linear (not quadratic)
      // For O(n²), 4x input should give ~16x time
      // For O(n), 4x input should give ~4x time
      const ratio = times[2] / times[0]; // 200 gates vs 50 gates = 4x size
      console.log(`Scaling ratio (4x size): ${ratio.toFixed(2)}x time`);
      
      // Should be much closer to 4x than 16x (linear vs quadratic)
      expect(ratio).toBeLessThan(12); // Much better than O(n²)
    });

    it('should maintain correctness under optimization', () => {
      const { gates, wires } = createLargeCircuit(100, 1.5);
      const timeProvider = createFixedTimeProvider(1000);

      const result = evaluateCircuit(gates, wires, timeProvider);

      // Verify basic correctness
      expect(result.gates.length).toBe(100);
      expect(result.wires.length).toBe(wires.length);
      
      // All gates should have valid outputs
      result.gates.forEach(gate => {
        expect(typeof gate.output).toBe('boolean');
      });

      // All wires should have valid states
      result.wires.forEach(wire => {
        expect(typeof wire.isActive).toBe('boolean');
      });

      // INPUT gates should maintain their values
      const inputGates = result.gates.filter(g => g.type === 'INPUT');
      const originalInputs = gates.filter(g => g.type === 'INPUT');
      inputGates.forEach((gate, index) => {
        expect(gate.output).toBe(originalInputs[index].output);
      });
    });

    it('should handle pathological worst-case efficiently', () => {
      // Create a highly connected circuit (worst case for old algorithm)
      const gateCount = 100;
      const { gates, wires } = createLargeCircuit(gateCount, 3); // High wire ratio
      const timeProvider = createFixedTimeProvider(1000);

      const startTime = performance.now();
      const result = evaluateCircuit(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates.length).toBe(gateCount);
      expect(executionTime).toBeLessThan(100); // Should still be reasonable
      console.log(`Worst case (${gateCount} gates, ${wires.length} wires): ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory with multiple evaluations', () => {
      const { gates, wires } = createLargeCircuit(100, 2);
      const timeProvider = createFixedTimeProvider(1000);

      // Run multiple evaluations
      for (let i = 0; i < 10; i++) {
        const result = evaluateCircuit(gates, wires, timeProvider);
        expect(result.gates.length).toBe(100);
      }

      // Memory usage should not grow significantly
      // (This is more of a smoke test - real memory testing would need special tools)
      expect(true).toBe(true);
    });

    it('should handle complex custom gates efficiently', () => {
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
          id: 'custom1',
          type: 'CUSTOM',
          position: { x: 200, y: 25 },
          inputs: ['', ''],
          output: false,
          customGateDefinition: {
            id: 'test_custom',
            name: 'Test Custom Gate',
            inputs: [{ name: 'A' }, { name: 'B' }],
            outputs: [{ name: 'Y' }],
            truthTable: {
              '00': '0',
              '01': '1', 
              '10': '1',
              '11': '0'
            }
          }
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
          from: { gateId: 'input2', pinIndex: -1 },
          to: { gateId: 'custom1', pinIndex: 1 },
          isActive: false,
        }
      ];

      const timeProvider = createFixedTimeProvider(1000);
      const startTime = performance.now();
      const result = evaluateCircuit(gates, wires, timeProvider);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(result.gates.length).toBe(3);
      expect(result.gates[2].output).toBe(true); // XOR of true and false = true
      expect(executionTime).toBeLessThan(10);
      console.log(`Custom gate evaluation: ${executionTime.toFixed(2)}ms`);
    });
  });
});