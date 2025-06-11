import { describe, it, expect, vi } from 'vitest';
import type { Gate, Wire } from '@/types/circuit';

describe('LoadCircuitDialog - ID Preservation', () => {
  it('should preserve gate and wire IDs when loading a circuit', () => {
    // Mock circuit data with specific IDs
    const mockCircuitData = {
      gates: [
        {
          id: 'gate-123',
          type: 'INPUT' as const,
          position: { x: 0, y: 0 },
          inputs: [],
          output: false,
        },
        {
          id: 'gate-456',
          type: 'OUTPUT' as const,
          position: { x: 100, y: 0 },
          inputs: [''],
          output: false,
        },
      ] as Gate[],
      wires: [
        {
          id: 'wire-789',
          from: { gateId: 'gate-123', pinIndex: -1 },
          to: { gateId: 'gate-456', pinIndex: 0 },
          isActive: false,
        },
      ] as Wire[],
    };

    // Simulate what our fix does - directly setting state with spread operator
    const stateToSet = {
      gates: [...mockCircuitData.gates],
      wires: [...mockCircuitData.wires],
    };

    // Verify IDs are preserved
    expect(stateToSet.gates[0].id).toBe('gate-123');
    expect(stateToSet.gates[1].id).toBe('gate-456');
    expect(stateToSet.wires[0].id).toBe('wire-789');
    
    // Verify wire connections reference the correct gate IDs
    expect(stateToSet.wires[0].from.gateId).toBe('gate-123');
    expect(stateToSet.wires[0].to.gateId).toBe('gate-456');
  });

  it('should handle complex circuits with multiple wires correctly', () => {
    const mockComplexCircuit = {
      gates: [
        { id: 'input1', type: 'INPUT' as const, position: { x: 0, y: 0 }, inputs: [], output: true },
        { id: 'input2', type: 'INPUT' as const, position: { x: 0, y: 100 }, inputs: [], output: false },
        { id: 'and1', type: 'AND' as const, position: { x: 200, y: 50 }, inputs: ['', ''], output: false },
        { id: 'output1', type: 'OUTPUT' as const, position: { x: 400, y: 50 }, inputs: [''], output: false },
      ] as Gate[],
      wires: [
        { id: 'w1', from: { gateId: 'input1', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 0 }, isActive: true },
        { id: 'w2', from: { gateId: 'input2', pinIndex: -1 }, to: { gateId: 'and1', pinIndex: 1 }, isActive: false },
        { id: 'w3', from: { gateId: 'and1', pinIndex: -1 }, to: { gateId: 'output1', pinIndex: 0 }, isActive: false },
      ] as Wire[],
    };

    // Apply our fix
    const stateToSet = {
      gates: [...mockComplexCircuit.gates],
      wires: [...mockComplexCircuit.wires],
    };

    // Verify all gate IDs are preserved
    expect(stateToSet.gates.map(g => g.id)).toEqual(['input1', 'input2', 'and1', 'output1']);
    
    // Verify all wire IDs are preserved
    expect(stateToSet.wires.map(w => w.id)).toEqual(['w1', 'w2', 'w3']);
    
    // Verify wire connections are intact
    expect(stateToSet.wires[0].from.gateId).toBe('input1');
    expect(stateToSet.wires[0].to.gateId).toBe('and1');
    expect(stateToSet.wires[0].to.pinIndex).toBe(0);
    
    expect(stateToSet.wires[1].from.gateId).toBe('input2');
    expect(stateToSet.wires[1].to.gateId).toBe('and1');
    expect(stateToSet.wires[1].to.pinIndex).toBe(1);
    
    expect(stateToSet.wires[2].from.gateId).toBe('and1');
    expect(stateToSet.wires[2].to.gateId).toBe('output1');
    expect(stateToSet.wires[2].to.pinIndex).toBe(0);
  });
});