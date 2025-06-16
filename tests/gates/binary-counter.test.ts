import { GateFactory } from '../../src/models/gates/GateFactory';
import { evaluateGateUnified } from '../../src/domain/simulation/core/gateEvaluation';
import { defaultConfig } from '../../src/domain/simulation/core/types';

describe('BINARY_COUNTER Gate', () => {
  it('should create a BINARY_COUNTER gate with default 2-bit configuration', () => {
    const gate = GateFactory.createGate('BINARY_COUNTER', { x: 100, y: 100 });
    
    expect(gate.type).toBe('BINARY_COUNTER');
    expect(gate.inputs).toEqual(['']); // 1 CLK input
    expect(gate.outputs).toEqual([false, false]); // 2-bit output
    expect(gate.metadata).toEqual({
      bitCount: 2,
      currentValue: 0,
      previousClockState: false,
    });
  });

  it('should count up on clock rising edge', () => {
    const gate = GateFactory.createGate('BINARY_COUNTER', { x: 100, y: 100 });
    
    // Initial state: counter = 0
    let result = evaluateGateUnified(gate, [false], defaultConfig);
    if (!result.success) {
      console.error('Evaluation failed:', result.error);
    }
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([false, false]); // 0b00
    }

    // Rising edge: counter should increment
    gate.metadata!.previousClockState = false;
    result = evaluateGateUnified(gate, [true], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([true, false]); // 0b01
      // Simulate metadata update that would happen in circuit evaluation
      gate.metadata!.currentValue = 1;
      gate.metadata!.previousClockState = true;
    }

    // High clock: no change
    result = evaluateGateUnified(gate, [true], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([true, false]); // Still 0b01
    }

    // Falling edge: no change
    gate.metadata!.previousClockState = true;
    result = evaluateGateUnified(gate, [false], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([true, false]); // Still 0b01
      gate.metadata!.previousClockState = false;
    }

    // Another rising edge: counter increments to 2
    result = evaluateGateUnified(gate, [true], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([false, true]); // 0b10
      gate.metadata!.currentValue = 2;
      gate.metadata!.previousClockState = true;
    }
  });

  it('should wrap around at maximum count', () => {
    const gate = GateFactory.createGate('BINARY_COUNTER', { x: 100, y: 100 });
    
    // Set counter to 3 (max for 2-bit)
    gate.metadata!.currentValue = 3;
    gate.metadata!.previousClockState = false;
    
    // Rising edge: should wrap to 0
    const result = evaluateGateUnified(gate, [true], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([false, false]); // 0b00
    }
  });

  it('should handle different bit counts', () => {
    const gate = GateFactory.createGate('BINARY_COUNTER', { x: 100, y: 100 });
    
    // Test with 4-bit counter
    gate.metadata!.bitCount = 4;
    gate.metadata!.currentValue = 10; // 0b1010
    gate.outputs = [false, false, false, false]; // Initialize 4-bit output
    
    const result = evaluateGateUnified(gate, [false], defaultConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputs).toEqual([false, true, false, true]); // 0b1010
      expect(result.data.outputs.length).toBe(4);
    }
  });
});