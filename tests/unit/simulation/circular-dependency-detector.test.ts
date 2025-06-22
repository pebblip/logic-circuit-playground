import { describe, it, expect, beforeEach } from 'vitest';
import type { Circuit, Wire, Gate } from '../../../src/types/circuit';
import { CircularDependencyDetector } from '../../../src/domain/analysis/circular-dependency-detector';

// テスト用のヘルパー関数
function createGate(id: string, type: string = 'AND'): Gate {
  return {
    id,
    type: type as any,
    position: { x: 0, y: 0 },
    inputs: [],
    output: false,
  };
}

function createWire(from: string, to: string): Wire {
  return {
    id: `${from}->${to}`,
    from: { gateId: from, pinIndex: -1 },
    to: { gateId: to, pinIndex: 0 },
    isActive: false,
  };
}

describe('Circular Dependency Detector', () => {
  let detector: CircularDependencyDetector;

  beforeEach(() => {
    detector = new CircularDependencyDetector();
  });

  describe('Simple Cases', () => {
    it('should detect no cycles in linear circuit', () => {
      const circuit: Circuit = {
        gates: [createGate('A'), createGate('B'), createGate('C')],
        wires: [createWire('A', 'B'), createWire('B', 'C')],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(false);
      expect(detector.detectCycles(circuit)).toEqual([]);
    });

    it('should detect simple self-loop', () => {
      const circuit: Circuit = {
        gates: [createGate('A')],
        wires: [createWire('A', 'A')],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(true);
      expect(detector.detectCycles(circuit)).toEqual([['A']]);
    });

    it('should detect 2-gate loop', () => {
      const circuit: Circuit = {
        gates: [createGate('A'), createGate('B')],
        wires: [createWire('A', 'B'), createWire('B', 'A')],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(true);
      const cycles = detector.detectCycles(circuit);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].sort()).toEqual(['A', 'B']);
    });
  });

  describe('Complex Cases', () => {
    it('should detect 3-gate ring oscillator', () => {
      const circuit: Circuit = {
        gates: [
          createGate('NOT1', 'NOT'),
          createGate('NOT2', 'NOT'),
          createGate('NOT3', 'NOT'),
        ],
        wires: [
          createWire('NOT1', 'NOT2'),
          createWire('NOT2', 'NOT3'),
          createWire('NOT3', 'NOT1'),
        ],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(true);
      const cycles = detector.detectCycles(circuit);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].sort()).toEqual(['NOT1', 'NOT2', 'NOT3']);
    });

    it('should detect multiple independent cycles', () => {
      const circuit: Circuit = {
        gates: [
          // First cycle
          createGate('A1'),
          createGate('A2'),
          // Second cycle
          createGate('B1'),
          createGate('B2'),
          // Non-cyclic
          createGate('C'),
        ],
        wires: [
          // First cycle
          createWire('A1', 'A2'),
          createWire('A2', 'A1'),
          // Second cycle
          createWire('B1', 'B2'),
          createWire('B2', 'B1'),
          // Connection to non-cyclic
          createWire('A1', 'C'),
        ],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(true);
      const cycles = detector.detectCycles(circuit);
      expect(cycles).toHaveLength(2);

      // Sort cycles for consistent testing
      const sortedCycles = cycles.map(cycle => cycle.sort()).sort();
      expect(sortedCycles).toEqual([
        ['A1', 'A2'],
        ['B1', 'B2'],
      ]);
    });

    it('should detect SR-LATCH cross-coupling', () => {
      const circuit: Circuit = {
        gates: [
          createGate('S', 'INPUT'),
          createGate('R', 'INPUT'),
          createGate('NOR1', 'NOR'),
          createGate('NOR2', 'NOR'),
          createGate('Q', 'OUTPUT'),
          createGate('QBAR', 'OUTPUT'),
        ],
        wires: [
          createWire('S', 'NOR1'),
          createWire('R', 'NOR2'),
          createWire('NOR1', 'NOR2'), // Cross-coupling
          createWire('NOR2', 'NOR1'), // Cross-coupling
          createWire('NOR1', 'Q'),
          createWire('NOR2', 'QBAR'),
        ],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(true);
      const cycles = detector.detectCycles(circuit);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].sort()).toEqual(['NOR1', 'NOR2']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty circuit', () => {
      const circuit: Circuit = {
        gates: [],
        wires: [],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(false);
      expect(detector.detectCycles(circuit)).toEqual([]);
    });

    it('should handle circuit with no wires', () => {
      const circuit: Circuit = {
        gates: [createGate('A'), createGate('B')],
        wires: [],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(false);
      expect(detector.detectCycles(circuit)).toEqual([]);
    });

    it('should ignore wires to non-existent gates', () => {
      const circuit: Circuit = {
        gates: [createGate('A'), createGate('B')],
        wires: [
          createWire('A', 'B'),
          createWire('B', 'NonExistent'), // Should be ignored
          createWire('NonExistent', 'A'), // Should be ignored
        ],
      };

      expect(detector.hasCircularDependency(circuit)).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle large linear circuit efficiently', () => {
      // Create a long chain: A -> B -> C -> ... -> Z
      const gates: Gate[] = [];
      const wires: Wire[] = [];

      for (let i = 0; i < 26; i++) {
        const id = String.fromCharCode(65 + i); // A, B, C, ...
        gates.push(createGate(id));

        if (i > 0) {
          const prevId = String.fromCharCode(64 + i);
          wires.push(createWire(prevId, id));
        }
      }

      const circuit: Circuit = { gates, wires };

      const startTime = performance.now();
      const result = detector.hasCircularDependency(circuit);
      const endTime = performance.now();

      expect(result).toBe(false);
      expect(endTime - startTime).toBeLessThan(10); // Should be fast
    });
  });
});
