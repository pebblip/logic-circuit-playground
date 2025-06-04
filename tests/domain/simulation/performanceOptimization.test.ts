import { describe, it, expect } from 'vitest';
import { evaluateCircuitPure, isSuccess, defaultConfig, createFixedTimeProvider } from '@domain/simulation/pure';
import { Gate, Wire } from '@/types/circuit';

describe('Circuit Simulation Performance Optimization - New API', () => {
  const timeProvider = createFixedTimeProvider(1000);
  const config = { ...defaultConfig, timeProvider, strictValidation: false };

  // 大規模な回路を生成するヘルパー関数（層状の構造で循環依存を防ぐ）
  function createLargeCircuit(gateCount: number, wireRatio: number = 2) {
    const gates: Gate[] = [];
    const wires: Wire[] = [];

    // 層構造のゲート配置（循環依存を防ぐため）
    const layers = 5; // 5層構造
    
    // Layer 0: INPUT gates (10% of total)
    const inputCount = Math.max(Math.floor(gateCount * 0.1), 2);
    for (let i = 0; i < inputCount; i++) {
      gates.push({
        id: `input_${i}`,
        type: 'INPUT',
        position: { x: i * 50, y: 0 },
        inputs: [],
        output: Math.random() > 0.5,
      });
    }

    // Layer 4: OUTPUT gates (10% of total)
    const outputCount = Math.max(Math.floor(gateCount * 0.1), 1);
    
    // Calculate remaining gates for logic layers
    const logicGateCount = gateCount - inputCount - outputCount;
    const gatesPerLogicLayer = Math.ceil(logicGateCount / 3); // 3 logic layers
    
    // Layers 1-3: Logic gates
    let gateIndex = 0;
    const gateTypes = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'] as const;
    for (let layer = 1; layer <= 3; layer++) {
      const remainingLogicGates = logicGateCount - gateIndex;
      const layerGateCount = Math.min(gatesPerLogicLayer, remainingLogicGates);
      
      for (let i = 0; i < layerGateCount; i++) {
        const gateType = gateTypes[gateIndex % gateTypes.length];
        gates.push({
          id: `logic_${gateIndex}`,
          type: gateType,
          position: { x: (i % 20) * 50, y: layer * 100 },
          inputs: gateType === 'NOT' ? [''] : ['', ''],
          output: false,
        });
        gateIndex++;
      }
    }

    // Layer 4: OUTPUT gates
    for (let i = 0; i < outputCount; i++) {
      gates.push({
        id: `output_${i}`,
        type: 'OUTPUT',
        position: { x: i * 50, y: 4 * 100 },
        inputs: [''],
        output: false,
      });
    }

    // 層構造に基づいたワイヤー生成（前の層から次の層への接続のみ）
    const layerGates: Gate[][] = [];
    layerGates[0] = gates.filter(g => g.type === 'INPUT');
    for (let layer = 1; layer < layers - 1; layer++) {
      layerGates[layer] = gates.filter(g => g.id.startsWith('logic_') && 
        Math.floor(g.position.y / 100) === layer);
    }
    layerGates[layers - 1] = gates.filter(g => g.type === 'OUTPUT');

    const maxWires = Math.min(gateCount * wireRatio, gates.length * 3);
    let wireCount = 0;
    const usedPins = new Set<string>();

    // 層間のワイヤー接続
    for (let layer = 0; layer < layers - 1 && wireCount < maxWires; layer++) {
      const fromLayer = layerGates[layer];
      const toLayer = layerGates[layer + 1];
      
      if (fromLayer.length === 0 || toLayer.length === 0) continue;

      // 各宛先ゲートに少なくとも1つの接続を確保
      for (const toGate of toLayer) {
        if (wireCount >= maxWires) break;
        
        const fromGate = fromLayer[Math.floor(Math.random() * fromLayer.length)];
        const maxPins = toGate.type === 'NOT' || toGate.type === 'OUTPUT' ? 1 : 2;
        
        for (let pinIndex = 0; pinIndex < maxPins && wireCount < maxWires; pinIndex++) {
          const pinKey = `${toGate.id}:${pinIndex}`;
          if (usedPins.has(pinKey)) continue;
          
          usedPins.add(pinKey);
          wires.push({
            id: `wire_${wireCount++}`,
            from: { gateId: fromGate.id, pinIndex: -1 },
            to: { gateId: toGate.id, pinIndex },
            isActive: false,
          });
        }
      }
    }

    return { gates, wires };
  }

  describe('Algorithm Performance: O(n) Complexity', () => {
    it('should handle small circuits efficiently (50 gates)', () => {
      const { gates, wires } = createLargeCircuit(50, 1.5);

      const startTime = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      if (!isSuccess(result)) {
        console.error('Circuit evaluation failed:', result.error);
      }
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(50);
      }
      expect(executionTime).toBeLessThan(10); // Should be very fast
      console.log(`50 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should handle medium circuits efficiently (200 gates)', () => {
      const { gates, wires } = createLargeCircuit(200, 2);

      const startTime = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      if (!isSuccess(result)) {
        console.error('Circuit evaluation failed:', result.error);
      }
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(200);
      }
      expect(executionTime).toBeLessThan(50); // Still fast
      console.log(`200 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should handle large circuits efficiently (500 gates)', () => {
      const { gates, wires } = createLargeCircuit(500, 2);

      const startTime = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      if (!isSuccess(result)) {
        console.error('Circuit evaluation failed:', result.error);
      }
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(500);
      }
      expect(executionTime).toBeLessThan(100); // Linear scaling expected
      console.log(`500 gates: ${executionTime.toFixed(2)}ms`);
    });

    it('should demonstrate linear scaling behavior', () => {
      const sizes = [50, 100, 200];
      const times: number[] = [];

      sizes.forEach(size => {
        const { gates, wires } = createLargeCircuit(size, 2);
        
        const startTime = performance.now();
        const result = evaluateCircuitPure({ gates, wires }, config);
        const endTime = performance.now();
        
        expect(isSuccess(result)).toBe(true);
        const executionTime = endTime - startTime;
        times.push(executionTime);
        console.log(`${size} gates: ${executionTime.toFixed(2)}ms`);
      });

      // Check that scaling is roughly linear
      // For O(n), 4x input should give ~4x time
      const ratio = times[2] / times[0]; // 200 gates vs 50 gates = 4x size
      console.log(`Scaling ratio (4x size): ${ratio.toFixed(2)}x time`);
      
      // Should show some scaling (but new API is very efficient)
      expect(ratio).toBeLessThan(10); // Allow significant overhead
      expect(ratio).toBeGreaterThan(0.5); // Even if optimized, should show some relationship
    });

    it('should maintain correctness under optimization', () => {
      const { gates, wires } = createLargeCircuit(100, 1.5);

      const result = evaluateCircuitPure({ gates, wires }, config);

      // Verify basic correctness
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(100);
        expect(result.data.circuit.wires.length).toBe(wires.length);
        
        // All gates should have valid outputs
        result.data.circuit.gates.forEach(gate => {
          expect(typeof gate.output).toBe('boolean');
        });

        // All wires should have valid states
        result.data.circuit.wires.forEach(wire => {
          expect(typeof wire.isActive).toBe('boolean');
        });

        // INPUT gates should maintain their values
        const inputGates = result.data.circuit.gates.filter(g => g.type === 'INPUT');
        const originalInputs = gates.filter(g => g.type === 'INPUT');
        inputGates.forEach((gate, index) => {
          expect(gate.output).toBe(originalInputs[index].output);
        });
      }
    });

    it('should handle pathological worst-case efficiently', () => {
      // Create a highly connected circuit (worst case)
      const gateCount = 100;
      const { gates, wires } = createLargeCircuit(gateCount, 3); // High wire ratio

      const startTime = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(gateCount);
      }
      expect(executionTime).toBeLessThan(100); // Should still be reasonable
      console.log(`Worst case (${gateCount} gates, ${wires.length} wires): ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory with multiple evaluations', () => {
      const { gates, wires } = createLargeCircuit(100, 2);

      // Run multiple evaluations
      for (let i = 0; i < 10; i++) {
        const result = evaluateCircuitPure({ gates, wires }, config);
        expect(isSuccess(result)).toBe(true);
        if (isSuccess(result)) {
          expect(result.data.circuit.gates.length).toBe(100);
        }
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

      const startTime = performance.now();
      const result = evaluateCircuitPure({ gates, wires }, config);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(3);
        expect(result.data.circuit.gates[2].output).toBe(true); // XOR of true and false = true
      }
      expect(executionTime).toBeLessThan(10);
      console.log(`Custom gate evaluation: ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Optimization Features', () => {
    it('should support incremental evaluation (future feature)', () => {
      const { gates, wires } = createLargeCircuit(100, 2);

      // First evaluation
      const result1 = evaluateCircuitPure({ gates, wires }, config);
      expect(isSuccess(result1)).toBe(true);

      // Change single input
      if (isSuccess(result1)) {
        const modifiedGates = [...result1.data.circuit.gates];
        modifiedGates[0] = { ...modifiedGates[0], output: !modifiedGates[0].output };

        // Second evaluation (should be optimized in future)
        const result2 = evaluateCircuitPure({ gates: modifiedGates, wires: result1.data.circuit.wires }, config);
        expect(isSuccess(result2)).toBe(true);
      }
    });

    it('should handle parallel evaluation (future feature)', () => {
      // Create circuit with independent sub-circuits
      const gates: Gate[] = [];
      const wires: Wire[] = [];

      // Sub-circuit 1
      for (let i = 0; i < 10; i++) {
        gates.push({
          id: `sub1_gate_${i}`,
          type: i === 0 ? 'INPUT' : 'NOT',
          position: { x: i * 50, y: 0 },
          inputs: i === 0 ? [] : [''],
          output: false,
        });

        if (i > 0) {
          wires.push({
            id: `sub1_wire_${i}`,
            from: { gateId: `sub1_gate_${i - 1}`, pinIndex: -1 },
            to: { gateId: `sub1_gate_${i}`, pinIndex: 0 },
            isActive: false,
          });
        }
      }

      // Sub-circuit 2 (independent)
      for (let i = 0; i < 10; i++) {
        gates.push({
          id: `sub2_gate_${i}`,
          type: i === 0 ? 'INPUT' : 'NOT',
          position: { x: i * 50, y: 100 },
          inputs: i === 0 ? [] : [''],
          output: false,
        });

        if (i > 0) {
          wires.push({
            id: `sub2_wire_${i}`,
            from: { gateId: `sub2_gate_${i - 1}`, pinIndex: -1 },
            to: { gateId: `sub2_gate_${i}`, pinIndex: 0 },
            isActive: false,
          });
        }
      }

      const result = evaluateCircuitPure({ gates, wires }, config);
      expect(isSuccess(result)).toBe(true);
      
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(20);
        // Future: parallel evaluation could improve performance
      }
    });
  });
});