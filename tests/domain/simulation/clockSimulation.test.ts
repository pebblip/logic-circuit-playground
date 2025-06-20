import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateGateUnified, evaluateCircuit, createDeterministicTimeProvider, createFixedTimeProvider, TimeProvider, isSuccess, defaultConfig } from '@domain/simulation/core';
import { Gate, Wire, GateType } from '@/types/circuit';

describe('CLOCK Gate Real-time Simulation - Essential Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test case 1: Basic CLOCK gate functionality
  describe('Basic CLOCK gate functionality', () => {
    it('should toggle output periodically when running', () => {
      // Set a fixed start time
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1, // 1Hz = 1000ms period
          startTime: startTime
        }
      };

      // At start time
      const result = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result) && result.data.primaryOutput).toBe(false);

      // After 1 complete period
      vi.setSystemTime(startTime + 1000);
      const result2 = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result2) && result2.data.primaryOutput).toBe(true);

      // After 2 complete periods
      vi.setSystemTime(startTime + 2000);
      const result3 = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result3) && result3.data.primaryOutput).toBe(false);

      // After 3 complete periods
      vi.setSystemTime(startTime + 3000);
      const result4 = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result4) && result4.data.primaryOutput).toBe(true);
    });

    it('should remain false when not running', () => {
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: false,
          frequency: 1
        }
      };

      const result = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result) && result.data.primaryOutput).toBe(false);
      
      vi.setSystemTime(startTime + 2000);
      const result2 = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result2) && result2.data.primaryOutput).toBe(false);
    });
  });

  // Test case 2: Multiple CLOCK gates
  describe('Multiple CLOCK gates', () => {
    it('should handle different frequencies independently', () => {
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const clockGates: Gate[] = [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 1, // 1Hz = 1000ms period
            startTime: startTime
          }
        },
        {
          id: 'clock2',
          type: 'CLOCK',
          position: { x: 200, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 2, // 2Hz = 500ms period
            startTime: startTime
          }
        }
      ];

      // At 500ms
      vi.setSystemTime(startTime + 500);
      const result1 = evaluateGateUnified(clockGates[0], [], defaultConfig);
      const result2 = evaluateGateUnified(clockGates[1], [], defaultConfig);
      expect(isSuccess(result1) && result1.data.primaryOutput).toBe(false); // 0.5 periods
      expect(isSuccess(result2) && result2.data.primaryOutput).toBe(true);  // 1.0 periods

      // At 1000ms
      vi.setSystemTime(startTime + 1000);
      const result3 = evaluateGateUnified(clockGates[0], [], defaultConfig);
      const result4 = evaluateGateUnified(clockGates[1], [], defaultConfig);
      expect(isSuccess(result3) && result3.data.primaryOutput).toBe(true);  // 1.0 periods
      expect(isSuccess(result4) && result4.data.primaryOutput).toBe(false); // 2.0 periods
    });
  });

  // Test case 3: Start/stop simulation control
  describe('Start/stop simulation control', () => {
    it('should start and stop based on metadata', () => {
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: false,
          frequency: 1,
          startTime: startTime
        }
      };

      // Initially stopped
      vi.setSystemTime(startTime + 1000);
      const result = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result) && result.data.primaryOutput).toBe(false);

      // Start the clock
      clockGate.metadata!.isRunning = true;
      clockGate.metadata!.startTime = startTime + 1000;
      
      // After starting, advance 1 period
      vi.setSystemTime(startTime + 2000);
      const result2 = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result2) && result2.data.primaryOutput).toBe(true);
    });
  });

  // Test case 4: Circuit evaluation with CLOCK
  describe('Circuit evaluation with CLOCK', () => {
    it('should propagate CLOCK signal through circuit', () => {
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const gates: Gate[] = [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 1,
            startTime: startTime
          }
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 200, y: 100 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'w1',
          from: { gateId: 'clock1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: false
        }
      ];

      // Initial evaluation
      const result1 = evaluateCircuit({ gates, wires }, defaultConfig);
      expect(isSuccess(result1)).toBe(true);
      if (isSuccess(result1)) {
        expect(result1.data.circuit.gates[0].output).toBe(false); // CLOCK
        expect(result1.data.circuit.gates[1].output).toBe(true);  // NOT of CLOCK
      }

      // After 1 period
      vi.setSystemTime(startTime + 1000);
      const result2 = evaluateCircuit({ gates, wires }, defaultConfig);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result2)) {
        expect(result2.data.circuit.gates[0].output).toBe(true);  // CLOCK toggled
        expect(result2.data.circuit.gates[1].output).toBe(false); // NOT of CLOCK
      }
    });
  });

  // Test case 5: Performance with multiple CLOCK gates
  describe('Performance', () => {
    it('should handle multiple CLOCK gates efficiently', () => {
      const startTime = 1000000;
      vi.setSystemTime(startTime);
      
      const gates: Gate[] = Array.from({ length: 10 }, (_, i) => ({
        id: `clock${i}`,
        type: 'CLOCK' as GateType,
        position: { x: 100 + i * 50, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1 + i * 0.5,
          startTime: startTime
        }
      }));

      const start = performance.now();
      const result = evaluateCircuit({ gates, wires: [] }, defaultConfig);
      const end = performance.now();

      expect(end - start).toBeLessThan(10);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates.length).toBe(10);
        result.data.circuit.gates.forEach(gate => {
          expect(typeof gate.output).toBe('boolean');
        });
      }
    });
  });

  // Test case 6: Memory cleanup
  describe('Memory cleanup', () => {
    it('should handle gate removal cleanly', () => {
      const gates: Gate[] = [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 1,
            startTime: 1000000
          }
        }
      ];

      const result1 = evaluateCircuit({ gates, wires: [] }, defaultConfig);
      expect(isSuccess(result1)).toBe(true);
      if (isSuccess(result1)) {
        expect(result1.data.circuit.gates.length).toBe(1);
      }

      // Remove CLOCK gate
      const result2 = evaluateCircuit({ gates: [], wires: [] }, defaultConfig);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result2)) {
        expect(result2.data.circuit.gates.length).toBe(0);
      }
    });
  });

  // Test case 7: Edge cases
  describe('Edge cases', () => {
    it('should handle missing metadata', () => {
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false
      };

      const result = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result) && result.data.primaryOutput).toBe(false);
    });

    it('should handle invalid frequency', () => {
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 0,
          startTime: 1000000
        }
      };

      const result = evaluateGateUnified(clockGate, [], defaultConfig);
      expect(isSuccess(result)).toBe(true);
    });

    it('should initialize startTime during circuit evaluation', () => {
      const gates: Gate[] = [{
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1
        }
      }];

      const result = evaluateCircuit({ gates, wires: [] }, defaultConfig);
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.circuit.gates[0].metadata?.startTime).toBeDefined();
      }
    });
  });
});

describe('CLOCK Gate Deterministic Simulation - New Time Provider Tests', () => {
  describe('Deterministic time provider functionality', () => {
    it('should provide deterministic time progression', () => {
      const timeProvider = createDeterministicTimeProvider(1000, 100);
      
      expect(timeProvider.getCurrentTime()).toBe(1000);
      expect(timeProvider.getCurrentTime()).toBe(1100);
      expect(timeProvider.getCurrentTime()).toBe(1200);
    });

    it('should work with CLOCK gate using deterministic time', () => {
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1, // 1Hz = 1000ms period
          startTime: 0
        }
      };

      // At startTime (0ms) - 0 periods
      const timeProvider0 = createFixedTimeProvider(0);
      const config0 = { ...defaultConfig, timeProvider: timeProvider0 };
      const result0 = evaluateGateUnified(clockGate, [], config0);
      expect(isSuccess(result0) && result0.data.primaryOutput).toBe(false);
      
      // At 500ms - 0.5 periods
      const timeProvider500 = createFixedTimeProvider(500);
      const config500 = { ...defaultConfig, timeProvider: timeProvider500 };
      const result500 = evaluateGateUnified(clockGate, [], config500);
      expect(isSuccess(result500) && result500.data.primaryOutput).toBe(false);
      
      // At 1000ms - 1.0 periods (first toggle)
      const timeProvider1000 = createFixedTimeProvider(1000);
      const config1000 = { ...defaultConfig, timeProvider: timeProvider1000 };
      const result1000 = evaluateGateUnified(clockGate, [], config1000);
      expect(isSuccess(result1000) && result1000.data.primaryOutput).toBe(true);
      
      // At 1500ms - 1.5 periods
      const timeProvider1500 = createFixedTimeProvider(1500);
      const config1500 = { ...defaultConfig, timeProvider: timeProvider1500 };
      const result1500 = evaluateGateUnified(clockGate, [], config1500);
      expect(isSuccess(result1500) && result1500.data.primaryOutput).toBe(true);
      
      // At 2000ms - 2.0 periods (second toggle)
      const timeProvider2000 = createFixedTimeProvider(2000);
      const config2000 = { ...defaultConfig, timeProvider: timeProvider2000 };
      const result2000 = evaluateGateUnified(clockGate, [], config2000);
      expect(isSuccess(result2000) && result2000.data.primaryOutput).toBe(false);
    });

    it('should work with circuit evaluation using deterministic time', () => {
      const timeProvider = createDeterministicTimeProvider(0, 1000);
      
      const gates: Gate[] = [
        {
          id: 'clock1',
          type: 'CLOCK',
          position: { x: 100, y: 100 },
          inputs: [],
          output: false,
          metadata: {
            isRunning: true,
            frequency: 1, // 1Hz
            startTime: 0
          }
        },
        {
          id: 'not1',
          type: 'NOT',
          position: { x: 200, y: 100 },
          inputs: [''],
          output: false
        }
      ];

      const wires: Wire[] = [
        {
          id: 'w1',
          from: { gateId: 'clock1', pinIndex: -1 },
          to: { gateId: 'not1', pinIndex: 0 },
          isActive: false
        }
      ];

      // Time 0: CLOCK=false, NOT=true
      const config = { ...defaultConfig, timeProvider };
      const result1 = evaluateCircuit({ gates, wires }, config);
      expect(isSuccess(result1)).toBe(true);
      if (isSuccess(result1)) {
        expect(result1.data.circuit.gates[0].output).toBe(false);
        expect(result1.data.circuit.gates[1].output).toBe(true);
      }

      // Time 1000: CLOCK=true, NOT=false
      const result2 = evaluateCircuit({ gates, wires }, config);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result2)) {
        expect(result2.data.circuit.gates[0].output).toBe(true);
        expect(result2.data.circuit.gates[1].output).toBe(false);
      }

      // Time 2000: CLOCK=false, NOT=true
      const result3 = evaluateCircuit({ gates, wires }, config);
      expect(isSuccess(result3)).toBe(true);
      if (isSuccess(result3)) {
        expect(result3.data.circuit.gates[0].output).toBe(false);
        expect(result3.data.circuit.gates[1].output).toBe(true);
      }
    });

    it('should be reproducible with same starting conditions', () => {
      const timeProvider1 = createDeterministicTimeProvider(1000, 500);
      const timeProvider2 = createDeterministicTimeProvider(1000, 500);
      
      const clockGate1: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 2, // 2Hz = 500ms period
          startTime: 1000
        }
      };
      
      const clockGate2: Gate = {
        id: 'clock2', 
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 2, // 2Hz = 500ms period  
          startTime: 1000
        }
      };

      // Both should produce identical sequences
      for (let i = 0; i < 5; i++) {
        const config1 = { ...defaultConfig, timeProvider: timeProvider1 };
        const config2 = { ...defaultConfig, timeProvider: timeProvider2 };
        const result1 = evaluateGateUnified(clockGate1, [], config1);
        const result2 = evaluateGateUnified(clockGate2, [], config2);
        expect(isSuccess(result1)).toBe(true);
        expect(isSuccess(result2)).toBe(true);
        if (isSuccess(result1) && isSuccess(result2)) {
          expect(result1.data.primaryOutput).toBe(result2.data.primaryOutput);
        }
      }
    });

    it('should handle different frequencies deterministically', () => {
      const clock1Hz: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1, // 1000ms period
          startTime: 0
        }
      };
      
      const clock4Hz: Gate = {
        id: 'clock2',
        type: 'CLOCK', 
        position: { x: 200, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 4, // 250ms period
          startTime: 0
        }
      };

      // Test at specific time points
      const testCases = [
        { time: 0, expected1Hz: false, expected4Hz: false },    // 0 periods for both
        { time: 250, expected1Hz: false, expected4Hz: true },   // 0.25p for 1Hz, 1.0p for 4Hz
        { time: 500, expected1Hz: false, expected4Hz: false },  // 0.5p for 1Hz, 2.0p for 4Hz
        { time: 750, expected1Hz: false, expected4Hz: true },   // 0.75p for 1Hz, 3.0p for 4Hz
        { time: 1000, expected1Hz: true, expected4Hz: false },  // 1.0p for 1Hz, 4.0p for 4Hz
      ];

      testCases.forEach(({ time, expected1Hz, expected4Hz }) => {
        const timeProvider = createFixedTimeProvider(time);
        const config = { ...defaultConfig, timeProvider };
        const result1Hz = evaluateGateUnified(clock1Hz, [], config);
        const result4Hz = evaluateGateUnified(clock4Hz, [], config);
        expect(isSuccess(result1Hz)).toBe(true);
        expect(isSuccess(result4Hz)).toBe(true);
        if (isSuccess(result1Hz) && isSuccess(result4Hz)) {
          expect([result1Hz.data.primaryOutput, result4Hz.data.primaryOutput]).toEqual([expected1Hz, expected4Hz]);
        }
      });
    });

    it('should maintain backward compatibility with default time provider', () => {
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          isRunning: true,
          frequency: 1000, // Very high frequency for quick test
        }
      };

      // Should work without time provider (uses real time)
      const result1 = evaluateGateUnified(clockGate, [], defaultConfig);
      const result2 = evaluateGateUnified(clockGate, [], defaultConfig);
      
      expect(isSuccess(result1)).toBe(true);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result1) && isSuccess(result2)) {
        expect(typeof result1.data.primaryOutput).toBe('boolean');
        expect(typeof result2.data.primaryOutput).toBe('boolean');
      }
    });
  });
});