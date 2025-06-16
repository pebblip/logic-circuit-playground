import { describe, it, expect } from 'vitest';
import { COMPARATOR_4BIT } from '../../../src/features/gallery/data/comparator-circuit';
import { PARITY_CHECKER } from '../../../src/features/gallery/data/parity-checker';
import { MAJORITY_VOTER } from '../../../src/features/gallery/data/majority-voter';
import { SEVEN_SEGMENT_DECODER } from '../../../src/features/gallery/data/seven-segment';

describe('Gallery New Circuits', () => {
  describe('4-bit Comparator', () => {
    it('should have correct structure', () => {
      expect(COMPARATOR_4BIT.id).toBe('4bit-comparator');
      expect(COMPARATOR_4BIT.gates.length).toBeGreaterThan(10);
      expect(COMPARATOR_4BIT.wires.length).toBeGreaterThan(10);
      
      // 8 inputs (A3-A0, B3-B0)
      const inputs = COMPARATOR_4BIT.gates.filter(g => g.type === 'INPUT');
      expect(inputs.length).toBe(8);
      
      // 3 outputs (GT, EQ, LT)
      const outputs = COMPARATOR_4BIT.gates.filter(g => g.type === 'OUTPUT');
      expect(outputs.length).toBe(3);
    });
  });

  describe('Parity Checker', () => {
    it('should have correct structure', () => {
      expect(PARITY_CHECKER.id).toBe('parity-checker');
      
      // 4 inputs
      const inputs = PARITY_CHECKER.gates.filter(g => g.type === 'INPUT');
      expect(inputs.length).toBe(4);
      
      // 3 XOR gates for cascading
      const xors = PARITY_CHECKER.gates.filter(g => g.type === 'XOR');
      expect(xors.length).toBe(3);
      
      // At least 1 main output
      const outputs = PARITY_CHECKER.gates.filter(g => g.type === 'OUTPUT');
      expect(outputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Majority Voter', () => {
    it('should have correct structure', () => {
      expect(MAJORITY_VOTER.id).toBe('majority-voter');
      
      // 3 inputs (voters)
      const inputs = MAJORITY_VOTER.gates.filter(g => g.type === 'INPUT');
      expect(inputs.length).toBe(3);
      
      // 3 AND gates for pairs
      const ands = MAJORITY_VOTER.gates.filter(g => g.type === 'AND');
      expect(ands.length).toBe(3);
      
      // OR gates to combine results
      const ors = MAJORITY_VOTER.gates.filter(g => g.type === 'OR');
      expect(ors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('7-Segment Decoder', () => {
    it('should have correct structure', () => {
      expect(SEVEN_SEGMENT_DECODER.id).toBe('seven-segment');
      
      // 2 inputs (B1, B0)
      const inputs = SEVEN_SEGMENT_DECODER.gates.filter(g => g.type === 'INPUT');
      expect(inputs.length).toBe(2);
      
      // 7 outputs (segments a-g)
      const outputs = SEVEN_SEGMENT_DECODER.gates.filter(g => g.type === 'OUTPUT');
      expect(outputs.length).toBe(7);
      
      // Should have NOT gates
      const nots = SEVEN_SEGMENT_DECODER.gates.filter(g => g.type === 'NOT');
      expect(nots.length).toBe(2);
    });
  });

  describe('Circuit Validity', () => {
    const circuits = [
      COMPARATOR_4BIT,
      PARITY_CHECKER,
      MAJORITY_VOTER,
      SEVEN_SEGMENT_DECODER
    ];

    circuits.forEach(circuit => {
      it(`${circuit.title} should have valid wire connections`, () => {
        const gateIds = new Set(circuit.gates.map(g => g.id));
        
        // All wire connections should reference existing gates
        circuit.wires.forEach(wire => {
          expect(gateIds.has(wire.from.gateId)).toBe(true);
          expect(gateIds.has(wire.to.gateId)).toBe(true);
        });
      });

      it(`${circuit.title} should have unique gate IDs`, () => {
        const gateIds = circuit.gates.map(g => g.id);
        const uniqueIds = new Set(gateIds);
        expect(uniqueIds.size).toBe(gateIds.length);
      });

      it(`${circuit.title} should have unique wire IDs`, () => {
        const wireIds = circuit.wires.map(w => w.id);
        const uniqueIds = new Set(wireIds);
        expect(uniqueIds.size).toBe(wireIds.length);
      });
    });
  });
});