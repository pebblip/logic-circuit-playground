// 回路リデューサーのユニットテスト

import { describe, it, expect } from 'vitest';
import { circuitReducer, initialState, ACTIONS } from '../circuitReducer';

describe('circuitReducer', () => {
  describe('ADD_GATE', () => {
    it('should add a new gate', () => {
      const action = {
        type: ACTIONS.ADD_GATE,
        payload: { type: 'AND', x: 100, y: 200, clockSignal: false }
      };
      
      const newState = circuitReducer(initialState, action);
      
      expect(newState.gates).toHaveLength(1);
      expect(newState.gates[0]).toMatchObject({
        type: 'AND',
        x: 100,
        y: 200
      });
    });

    it('should not add invalid gate type', () => {
      const action = {
        type: ACTIONS.ADD_GATE,
        payload: { type: 'INVALID', x: 100, y: 200 }
      };
      
      const newState = circuitReducer(initialState, action);
      expect(newState.gates).toHaveLength(0);
    });
  });

  describe('REMOVE_GATE', () => {
    it('should remove gate and its connections', () => {
      const state = {
        ...initialState,
        gates: [
          { id: 1, type: 'INPUT' },
          { id: 2, type: 'AND' },
          { id: 3, type: 'OUTPUT' }
        ],
        connections: [
          { from: 1, to: 2, toInput: 0 },
          { from: 2, to: 3, toInput: 0 }
        ],
        selectedGate: { id: 2, type: 'AND' }
      };
      
      const action = {
        type: ACTIONS.REMOVE_GATE,
        payload: { gateId: 2 }
      };
      
      const newState = circuitReducer(state, action);
      
      expect(newState.gates).toHaveLength(2);
      expect(newState.gates.find(g => g.id === 2)).toBeUndefined();
      expect(newState.connections).toHaveLength(0);
      expect(newState.selectedGate).toBeNull();
    });
  });

  describe('MOVE_GATE', () => {
    it('should update gate position', () => {
      const state = {
        ...initialState,
        gates: [{ id: 1, type: 'INPUT', x: 100, y: 100 }]
      };
      
      const action = {
        type: ACTIONS.MOVE_GATE,
        payload: { gateId: 1, x: 200, y: 300 }
      };
      
      const newState = circuitReducer(state, action);
      
      expect(newState.gates[0]).toMatchObject({
        x: 200,
        y: 300
      });
    });
  });

  describe('ADD_CONNECTION', () => {
    it('should add new connection', () => {
      const action = {
        type: ACTIONS.ADD_CONNECTION,
        payload: { from: 1, fromOutput: 0, to: 2, toInput: 0 }
      };
      
      const newState = circuitReducer(initialState, action);
      
      expect(newState.connections).toHaveLength(1);
      expect(newState.connections[0]).toEqual({
        from: 1,
        fromOutput: 0,
        to: 2,
        toInput: 0
      });
    });

    it('should not add duplicate connection to same input', () => {
      const state = {
        ...initialState,
        connections: [{ from: 1, fromOutput: 0, to: 2, toInput: 0 }]
      };
      
      const action = {
        type: ACTIONS.ADD_CONNECTION,
        payload: { from: 3, fromOutput: 0, to: 2, toInput: 0 }
      };
      
      const newState = circuitReducer(state, action);
      expect(newState.connections).toHaveLength(1);
      expect(newState.connections[0].from).toBe(1); // Original connection
    });
  });

  describe('SAVE_CIRCUIT', () => {
    it('should save current circuit configuration', () => {
      const state = {
        ...initialState,
        gates: [{ id: 1, type: 'INPUT' }],
        connections: [{ from: 1, to: 2 }],
        currentLevel: 2
      };
      
      const action = {
        type: ACTIONS.SAVE_CIRCUIT,
        payload: { name: 'My Circuit' }
      };
      
      const newState = circuitReducer(state, action);
      
      expect(newState.savedCircuits).toHaveLength(1);
      expect(newState.savedCircuits[0]).toMatchObject({
        name: 'My Circuit',
        level: 2,
        gates: [{ id: 1, type: 'INPUT' }],
        connections: [{ from: 1, to: 2 }]
      });
    });
  });

  describe('LOAD_CIRCUIT', () => {
    it('should load saved circuit', () => {
      const circuit = {
        gates: [{ id: 1, type: 'AND' }],
        connections: [{ from: 1, to: 2 }]
      };
      
      const action = {
        type: ACTIONS.LOAD_CIRCUIT,
        payload: { circuit }
      };
      
      const newState = circuitReducer(initialState, action);
      
      expect(newState.gates).toEqual(circuit.gates);
      expect(newState.connections).toEqual(circuit.connections);
      expect(newState.selectedGate).toBeNull();
    });
  });

  describe('RESET', () => {
    it('should reset while preserving levels and saved circuits', () => {
      const state = {
        ...initialState,
        gates: [{ id: 1 }],
        connections: [{ from: 1, to: 2 }],
        currentLevel: 3,
        unlockedLevels: { 1: true, 2: true, 3: true },
        savedCircuits: [{ id: 1, name: 'Saved' }]
      };
      
      const action = { type: ACTIONS.RESET };
      const newState = circuitReducer(state, action);
      
      expect(newState.gates).toEqual([]);
      expect(newState.connections).toEqual([]);
      expect(newState.currentLevel).toBe(3);
      expect(newState.unlockedLevels).toEqual({ 1: true, 2: true, 3: true });
      expect(newState.savedCircuits).toHaveLength(1);
    });
  });

  describe('UPDATE_GATES_BATCH', () => {
    it('should update multiple gates at once', () => {
      const state = {
        ...initialState,
        gates: [
          { id: 1, type: 'INPUT', value: true },
          { id: 2, type: 'AND', value: false },
          { id: 3, type: 'OUTPUT', value: false }
        ]
      };
      
      const action = {
        type: ACTIONS.UPDATE_GATES_BATCH,
        payload: {
          updates: [
            { id: 2, value: true },
            { id: 3, value: true }
          ]
        }
      };
      
      const newState = circuitReducer(state, action);
      
      expect(newState.gates[0].value).toBe(true); // Unchanged
      expect(newState.gates[1].value).toBe(true); // Updated
      expect(newState.gates[2].value).toBe(true); // Updated
    });
  });
});