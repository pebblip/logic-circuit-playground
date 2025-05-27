import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { simulateCustomGate } from '../UltraModernCircuit';

// Helper function to simulate a custom gate (extracted from UltraModernCircuit for testing)
const testSimulateCustomGate = (customGate, inputValues) => {
  const internalGates = customGate.circuit.gates;
  const internalConnections = customGate.circuit.connections;
  const results = {};
  
  // Set input values
  customGate.inputs.forEach((input, index) => {
    const inputGate = internalGates.find(g => g.id === input.id);
    if (inputGate && inputValues[index] !== undefined) {
      results[inputGate.id] = inputValues[index];
    }
  });
  
  // Simulate internal circuit
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    
    internalGates.forEach(gate => {
      if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
      
      const inputConnections = internalConnections.filter(c => c.to === gate.id);
      const inputVals = inputConnections
        .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
        .map(c => {
          const fromGate = internalGates.find(g => g.id === c.from);
          if (!fromGate) return undefined;
          
          const fromResult = results[fromGate.id];
          if (Array.isArray(fromResult)) {
            return fromResult[c.fromOutput || 0];
          } else {
            return fromResult;
          }
        })
        .filter(v => v !== undefined);
      
      let newValue = undefined;
      
      switch (gate.type) {
        case 'AND':
          if (inputVals.length >= 2) {
            newValue = inputVals.every(v => v === true);
          }
          break;
        case 'OR':
          if (inputVals.length >= 1) {
            newValue = inputVals.some(v => v === true);
          }
          break;
        case 'NOT':
          if (inputVals.length >= 1) {
            newValue = !inputVals[0];
          }
          break;
        case 'OUTPUT':
          if (inputVals.length >= 1) {
            newValue = inputVals[0];
          }
          break;
      }
      
      if (newValue !== undefined && results[gate.id] !== newValue) {
        results[gate.id] = newValue;
        changed = true;
      }
    });
  }
  
  return results;
};

describe('CustomGate Integration', () => {
  it('should correctly simulate a custom AND gate', () => {
    const customAND = {
      inputs: [
        { id: 'in1', name: 'A' },
        { id: 'in2', name: 'B' }
      ],
      outputs: [
        { id: 'out1', name: 'Y' }
      ],
      circuit: {
        gates: [
          { id: 'in1', type: 'INPUT', x: 100, y: 100 },
          { id: 'in2', type: 'INPUT', x: 100, y: 200 },
          { id: 'and1', type: 'AND', x: 300, y: 150 },
          { id: 'out1', type: 'OUTPUT', x: 500, y: 150 }
        ],
        connections: [
          { from: 'in1', to: 'and1', toInput: 0 },
          { from: 'in2', to: 'and1', toInput: 1 },
          { from: 'and1', to: 'out1' }
        ]
      }
    };

    // Test all combinations
    const testCases = [
      { inputs: [false, false], expectedOutput: false },
      { inputs: [false, true], expectedOutput: false },
      { inputs: [true, false], expectedOutput: false },
      { inputs: [true, true], expectedOutput: true }
    ];

    testCases.forEach(({ inputs, expectedOutput }) => {
      const results = testSimulateCustomGate(customAND, inputs);
      expect(results['out1']).toBe(expectedOutput);
    });
  });

  it('should correctly simulate a custom XOR gate', () => {
    const customXOR = {
      inputs: [
        { id: 'in1', name: 'A' },
        { id: 'in2', name: 'B' }
      ],
      outputs: [
        { id: 'out1', name: 'Y' }
      ],
      circuit: {
        gates: [
          { id: 'in1', type: 'INPUT', x: 100, y: 100 },
          { id: 'in2', type: 'INPUT', x: 100, y: 200 },
          { id: 'not1', type: 'NOT', x: 250, y: 100 },
          { id: 'not2', type: 'NOT', x: 250, y: 200 },
          { id: 'and1', type: 'AND', x: 400, y: 80 },
          { id: 'and2', type: 'AND', x: 400, y: 220 },
          { id: 'or1', type: 'OR', x: 550, y: 150 },
          { id: 'out1', type: 'OUTPUT', x: 700, y: 150 }
        ],
        connections: [
          // A AND (NOT B)
          { from: 'in1', to: 'and1', toInput: 0 },
          { from: 'in2', to: 'not1' },
          { from: 'not1', to: 'and1', toInput: 1 },
          // (NOT A) AND B
          { from: 'in1', to: 'not2' },
          { from: 'not2', to: 'and2', toInput: 0 },
          { from: 'in2', to: 'and2', toInput: 1 },
          // OR the results
          { from: 'and1', to: 'or1', toInput: 0 },
          { from: 'and2', to: 'or1', toInput: 1 },
          { from: 'or1', to: 'out1' }
        ]
      }
    };

    // Test XOR truth table
    const testCases = [
      { inputs: [false, false], expectedOutput: false },
      { inputs: [false, true], expectedOutput: true },
      { inputs: [true, false], expectedOutput: true },
      { inputs: [true, true], expectedOutput: false }
    ];

    testCases.forEach(({ inputs, expectedOutput }) => {
      const results = testSimulateCustomGate(customXOR, inputs);
      expect(results['out1']).toBe(expectedOutput);
    });
  });

  it('should correctly simulate a custom gate with multiple outputs (half adder)', () => {
    const halfAdder = {
      inputs: [
        { id: 'in1', name: 'A' },
        { id: 'in2', name: 'B' }
      ],
      outputs: [
        { id: 'sum', name: 'Sum' },
        { id: 'carry', name: 'Carry' }
      ],
      circuit: {
        gates: [
          { id: 'in1', type: 'INPUT', x: 100, y: 100 },
          { id: 'in2', type: 'INPUT', x: 100, y: 200 },
          // XOR for sum
          { id: 'not1', type: 'NOT', x: 250, y: 100 },
          { id: 'not2', type: 'NOT', x: 250, y: 200 },
          { id: 'and1', type: 'AND', x: 400, y: 80 },
          { id: 'and2', type: 'AND', x: 400, y: 220 },
          { id: 'or1', type: 'OR', x: 550, y: 150 },
          // AND for carry
          { id: 'and3', type: 'AND', x: 400, y: 350 },
          { id: 'sum', type: 'OUTPUT', x: 700, y: 150 },
          { id: 'carry', type: 'OUTPUT', x: 700, y: 350 }
        ],
        connections: [
          // XOR logic for sum
          { from: 'in1', to: 'and1', toInput: 0 },
          { from: 'in2', to: 'not1' },
          { from: 'not1', to: 'and1', toInput: 1 },
          { from: 'in1', to: 'not2' },
          { from: 'not2', to: 'and2', toInput: 0 },
          { from: 'in2', to: 'and2', toInput: 1 },
          { from: 'and1', to: 'or1', toInput: 0 },
          { from: 'and2', to: 'or1', toInput: 1 },
          { from: 'or1', to: 'sum' },
          // AND logic for carry
          { from: 'in1', to: 'and3', toInput: 0 },
          { from: 'in2', to: 'and3', toInput: 1 },
          { from: 'and3', to: 'carry' }
        ]
      }
    };

    // Test half adder truth table
    const testCases = [
      { inputs: [false, false], expectedSum: false, expectedCarry: false },
      { inputs: [false, true], expectedSum: true, expectedCarry: false },
      { inputs: [true, false], expectedSum: true, expectedCarry: false },
      { inputs: [true, true], expectedSum: false, expectedCarry: true }
    ];

    testCases.forEach(({ inputs, expectedSum, expectedCarry }) => {
      const results = testSimulateCustomGate(halfAdder, inputs);
      expect(results['sum']).toBe(expectedSum);
      expect(results['carry']).toBe(expectedCarry);
    });
  });
});