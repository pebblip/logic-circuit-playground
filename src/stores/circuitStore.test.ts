// circuitStore.ts の包括的単体テスト
// アプリケーションの中核となる状態管理の完全品質保証

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCircuitStore } from './circuitStore';
import { GateType } from '../types/circuit';

// LocalStorageのモック
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage
});

describe('Circuit Store - Complete Test Suite', () => {
  let store: ReturnType<typeof useCircuitStore.getState>;

  beforeEach(() => {
    // ストアをリセット
    vi.clearAllMocks();
    mockLocalStorage.clear();
    
    // ストアを完全に初期状態にリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateId: null,
      selectedGateIds: [],
      isDrawingWire: false,
      wireStart: null,
      customGates: [],
      history: [{ gates: [], wires: [] }],
      historyIndex: 0,
      clipboard: null,
      appMode: '自由制作',
      allowedGates: null
    });
    
    // 新しいストアインスタンスを取得
    store = useCircuitStore.getState();
  });

  describe('Gate Management', () => {
    it('should add gates correctly', () => {
      const position = { x: 100, y: 100 };
      const gate = store.addGate('INPUT', position);

      expect(gate).toBeDefined();
      expect(gate.type).toBe('INPUT');
      expect(gate.position).toEqual(position);
      expect(gate.id).toMatch(/^gate-/);
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(1);
      expect(state.gates[0].id).toBe(gate.id);
    });

    it('should add multiple gates of different types', () => {
      const gates = [
        store.addGate('INPUT', { x: 0, y: 0 }),
        store.addGate('AND', { x: 100, y: 0 }),
        store.addGate('OUTPUT', { x: 200, y: 0 })
      ];

      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(3);
      expect(state.gates.map(g => g.type)).toEqual(['INPUT', 'AND', 'OUTPUT']);
    });

    it('should move gates correctly', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      const newPosition = { x: 200, y: 200 };
      
      store.moveGate(gate.id, newPosition);
      
      const state = useCircuitStore.getState();
      const movedGate = state.gates.find(g => g.id === gate.id);
      expect(movedGate?.position).toEqual(newPosition);
    });

    it('should delete gates correctly', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      
      expect(useCircuitStore.getState().gates).toHaveLength(2);
      
      store.deleteGate(gate1.id);
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(1);
      expect(state.gates[0].id).toBe(gate2.id);
    });

    it('should select gates correctly', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      
      store.selectGate(gate.id);
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateId).toBe(gate.id);
    });

    it('should clear gate selection', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      store.selectGate(gate.id);
      
      store.selectGate(null);
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateId).toBeNull();
    });

    it('should update gate output state', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      
      store.updateGateOutput(gate.id, true);
      
      const state = useCircuitStore.getState();
      const updatedGate = state.gates.find(g => g.id === gate.id);
      expect(updatedGate?.output).toBe(true);
    });
  });

  describe('Multiple Selection', () => {
    it('should handle multiple gate selection', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      const gate3 = store.addGate('OUTPUT', { x: 300, y: 100 });
      
      store.setSelectedGates([gate1.id, gate2.id]);
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateIds).toEqual([gate1.id, gate2.id]);
    });

    it('should add gates to selection', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      
      store.setSelectedGates([gate1.id]);
      store.addToSelection(gate2.id);
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateIds).toEqual([gate1.id, gate2.id]);
    });

    it('should remove gates from selection', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      
      store.setSelectedGates([gate1.id, gate2.id]);
      store.removeFromSelection(gate1.id);
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateIds).toEqual([gate2.id]);
    });

    it('should clear all selections', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      
      store.setSelectedGates([gate1.id, gate2.id]);
      store.clearSelection();
      
      const state = useCircuitStore.getState();
      expect(state.selectedGateIds).toEqual([]);
    });
  });

  describe('Wire Management', () => {
    it('should start wire drawing correctly', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      
      store.startWireDrawing(gate.id, -1);
      
      const state = useCircuitStore.getState();
      expect(state.isDrawingWire).toBe(true);
      expect(state.wireStart).toEqual({
        gateId: gate.id,
        pinIndex: -1,
        position: { x: 135, y: 100 } // Expected output pin position
      });
    });

    it('should cancel wire drawing', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      store.startWireDrawing(gate.id, -1);
      
      store.cancelWireDrawing();
      
      const state = useCircuitStore.getState();
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBeNull();
    });

    it('should complete wire connection between gates', () => {
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 300, y: 100 });
      
      // Start wire from input gate output
      store.startWireDrawing(inputGate.id, -1);
      // End wire at output gate input
      store.endWireDrawing(outputGate.id, 0);
      
      const state = useCircuitStore.getState();
      expect(state.wires).toHaveLength(1);
      expect(state.wires[0].from.gateId).toBe(inputGate.id);
      expect(state.wires[0].to.gateId).toBe(outputGate.id);
      expect(state.isDrawingWire).toBe(false);
    });

    it('should delete wires correctly', () => {
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 300, y: 100 });
      
      // Create wire
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      const wireId = useCircuitStore.getState().wires[0].id;
      store.deleteWire(wireId);
      
      const state = useCircuitStore.getState();
      expect(state.wires).toHaveLength(0);
    });

    it('should prevent invalid wire connections', () => {
      const inputGate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const inputGate2 = store.addGate('INPUT', { x: 300, y: 100 });
      
      // Try to connect output to output (should fail)
      store.startWireDrawing(inputGate1.id, -1);
      store.endWireDrawing(inputGate2.id, -1);
      
      const state = useCircuitStore.getState();
      expect(state.wires).toHaveLength(0); // No wire should be created
      expect(state.isDrawingWire).toBe(false); // Drawing should be cancelled
    });
  });

  describe('History Management', () => {
    it('should track history when adding gates', () => {
      // Clear all first to establish baseline
      store.clearAll();
      const baselineHistory = useCircuitStore.getState().history.length;
      
      store.addGate('INPUT', { x: 100, y: 100 });
      
      const state = useCircuitStore.getState();
      expect(state.history.length).toBeGreaterThan(baselineHistory);
      expect(store.canUndo()).toBe(true);
    });

    it('should undo gate addition', () => {
      store.addGate('INPUT', { x: 100, y: 100 });
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      
      store.undo();
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(0);
    });

    it('should redo gate addition', () => {
      store.addGate('INPUT', { x: 100, y: 100 });
      store.undo();
      expect(useCircuitStore.getState().gates).toHaveLength(0);
      
      store.redo();
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(1);
      expect(store.canRedo()).toBe(false);
    });

    it('should handle multiple undo/redo operations', () => {
      // Add multiple gates
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 200, y: 100 });
      store.addGate('OUTPUT', { x: 300, y: 100 });
      
      expect(useCircuitStore.getState().gates).toHaveLength(3);
      
      // Undo twice
      store.undo();
      store.undo();
      
      expect(useCircuitStore.getState().gates).toHaveLength(1);
      
      // Redo once
      store.redo();
      
      expect(useCircuitStore.getState().gates).toHaveLength(2);
    });

    it('should clear all gates and wires', () => {
      store.addGate('INPUT', { x: 100, y: 100 });
      store.addGate('AND', { x: 200, y: 100 });
      
      store.clearAll();
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(0);
      expect(state.wires).toHaveLength(0);
      expect(state.selectedGateId).toBeNull();
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBeNull();
      // clearAll adds to history, so we can undo to previous state
      expect(store.canUndo()).toBe(true);
    });
  });

  describe('Copy and Paste', () => {
    it('should copy selected gates', () => {
      const gate1 = store.addGate('INPUT', { x: 100, y: 100 });
      const gate2 = store.addGate('AND', { x: 200, y: 100 });
      
      store.setSelectedGates([gate1.id, gate2.id]);
      store.copySelection();
      
      expect(store.canPaste()).toBe(true);
      
      const state = useCircuitStore.getState();
      expect(state.clipboard).toBeDefined();
      expect(state.clipboard?.gates).toHaveLength(2);
    });

    it('should paste gates at new position', () => {
      const gate = store.addGate('INPUT', { x: 100, y: 100 });
      
      store.setSelectedGates([gate.id]);
      store.copySelection();
      
      const pastePosition = { x: 300, y: 300 };
      store.paste(pastePosition);
      
      const state = useCircuitStore.getState();
      expect(state.gates).toHaveLength(2); // Original + pasted
      
      // Check that pasted gate has different ID but same type
      const pastedGate = state.gates.find(g => g.id !== gate.id);
      expect(pastedGate?.type).toBe('INPUT');
      expect(pastedGate?.position.x).toBeGreaterThan(gate.position.x);
    });

    it('should handle empty selection copy', () => {
      // Ensure no previous clipboard data
      store.clearAll();
      const initialState = useCircuitStore.getState();
      expect(initialState.selectedGateIds).toHaveLength(0);
      
      store.copySelection();
      
      expect(store.canPaste()).toBe(false);
      
      const state = useCircuitStore.getState();
      expect(state.clipboard).toBeNull();
    });
  });

  describe('Application Mode Management', () => {
    it('should set application mode correctly', () => {
      store.setAppMode('学習モード');
      
      const state = useCircuitStore.getState();
      expect(state.appMode).toBe('学習モード');
    });

    it('should set allowed gates for learning mode', () => {
      const allowedGates: GateType[] = ['INPUT', 'OUTPUT', 'AND', 'OR'];
      store.setAllowedGates(allowedGates);
      
      const state = useCircuitStore.getState();
      expect(state.allowedGates).toEqual(allowedGates);
    });

    it('should allow all gates when set to null', () => {
      store.setAllowedGates(['INPUT', 'OUTPUT']);
      store.setAllowedGates(null);
      
      const state = useCircuitStore.getState();
      expect(state.allowedGates).toBeNull();
    });
  });

  describe('Gate Deletion with Wire Cleanup', () => {
    it('should delete single gate and all connected wires', () => {
      // Create circuit: INPUT → AND → OUTPUT
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const andGate = store.addGate('AND', { x: 200, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 300, y: 100 });
      
      // Connect INPUT to AND first input
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(andGate.id, 0);
      
      // Connect AND output to OUTPUT
      store.startWireDrawing(andGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      // Verify initial state
      const initialState = useCircuitStore.getState();
      expect(initialState.gates).toHaveLength(3);
      expect(initialState.wires).toHaveLength(2);
      
      // Delete the middle gate (AND)
      store.deleteGate(andGate.id);
      
      // Verify gate and wires are deleted
      const finalState = useCircuitStore.getState();
      expect(finalState.gates).toHaveLength(2);
      expect(finalState.wires).toHaveLength(0); // All wires connected to AND should be deleted
      
      // Verify remaining gates are INPUT and OUTPUT
      const remainingGateTypes = finalState.gates.map(g => g.type).sort();
      expect(remainingGateTypes).toEqual(['INPUT', 'OUTPUT']);
      
      // Verify no orphaned wires remain
      const gateIds = new Set(finalState.gates.map(g => g.id));
      const orphanedWires = finalState.wires.filter(wire => 
        !gateIds.has(wire.from.gateId) || !gateIds.has(wire.to.gateId)
      );
      expect(orphanedWires).toHaveLength(0);
    });

    it('should delete gate with multiple wire connections', () => {
      // Create complex circuit with a gate that has multiple connections
      const input1 = store.addGate('INPUT', { x: 50, y: 50 });
      const input2 = store.addGate('INPUT', { x: 50, y: 150 });
      const andGate = store.addGate('AND', { x: 200, y: 100 });
      const or1 = store.addGate('OR', { x: 350, y: 50 });
      const or2 = store.addGate('OR', { x: 350, y: 150 });
      const output = store.addGate('OUTPUT', { x: 500, y: 100 });
      
      // Connect inputs to AND gate
      store.startWireDrawing(input1.id, -1);
      store.endWireDrawing(andGate.id, 0);
      
      store.startWireDrawing(input2.id, -1);
      store.endWireDrawing(andGate.id, 1);
      
      // Connect AND output to multiple OR gates
      store.startWireDrawing(andGate.id, -1);
      store.endWireDrawing(or1.id, 0);
      
      store.startWireDrawing(andGate.id, -1);
      store.endWireDrawing(or2.id, 0);
      
      // Connect one OR to output
      store.startWireDrawing(or1.id, -1);
      store.endWireDrawing(output.id, 0);
      
      // Verify initial state
      const initialState = useCircuitStore.getState();
      expect(initialState.gates).toHaveLength(6);
      expect(initialState.wires).toHaveLength(5);
      
      // Delete the AND gate
      store.deleteGate(andGate.id);
      
      // Verify state after deletion
      const finalState = useCircuitStore.getState();
      expect(finalState.gates).toHaveLength(5);
      
      // Count remaining wires - should only be the OR1→OUTPUT connection
      expect(finalState.wires).toHaveLength(1);
      expect(finalState.wires[0].from.gateId).toBe(or1.id);
      expect(finalState.wires[0].to.gateId).toBe(output.id);
      
      // Verify no orphaned wires
      const gateIds = new Set(finalState.gates.map(g => g.id));
      const orphanedWires = finalState.wires.filter(wire => 
        !gateIds.has(wire.from.gateId) || !gateIds.has(wire.to.gateId)
      );
      expect(orphanedWires).toHaveLength(0);
    });

    it('should delete multiple selected gates and all their wires', () => {
      // Create chain: INPUT → AND → OR → OUTPUT
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const andGate = store.addGate('AND', { x: 200, y: 100 });
      const orGate = store.addGate('OR', { x: 300, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 400, y: 100 });
      
      // Create connections
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(andGate.id, 0);
      
      store.startWireDrawing(andGate.id, -1);
      store.endWireDrawing(orGate.id, 0);
      
      store.startWireDrawing(orGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      // Verify initial state
      const initialState = useCircuitStore.getState();
      expect(initialState.gates).toHaveLength(4);
      expect(initialState.wires).toHaveLength(3);
      
      // Select multiple gates (AND and OR)
      store.setSelectedGates([andGate.id, orGate.id]);
      
      // Delete one of the selected gates (should delete both due to selection)
      store.deleteGate(andGate.id);
      
      // Verify both selected gates and all their wires are deleted
      const finalState = useCircuitStore.getState();
      expect(finalState.gates).toHaveLength(2);
      expect(finalState.wires).toHaveLength(0); // All wires should be deleted
      
      // Verify remaining gates
      const remainingGateTypes = finalState.gates.map(g => g.type).sort();
      expect(remainingGateTypes).toEqual(['INPUT', 'OUTPUT']);
      
      // Verify selection is cleared
      expect(finalState.selectedGateIds).toHaveLength(0);
      expect(finalState.selectedGateId).toBeNull();
    });

    it('should maintain circuit integrity after gate deletion', () => {
      // Create circuit where some wires should remain
      const input1 = store.addGate('INPUT', { x: 50, y: 50 });
      const input2 = store.addGate('INPUT', { x: 50, y: 150 });
      const and1 = store.addGate('AND', { x: 200, y: 50 });
      const and2 = store.addGate('AND', { x: 200, y: 150 });
      const output1 = store.addGate('OUTPUT', { x: 350, y: 50 });
      const output2 = store.addGate('OUTPUT', { x: 350, y: 150 });
      
      // Create independent circuits
      // Circuit 1: INPUT1 → AND1 → OUTPUT1
      store.startWireDrawing(input1.id, -1);
      store.endWireDrawing(and1.id, 0);
      
      store.startWireDrawing(and1.id, -1);
      store.endWireDrawing(output1.id, 0);
      
      // Circuit 2: INPUT2 → AND2 → OUTPUT2
      store.startWireDrawing(input2.id, -1);
      store.endWireDrawing(and2.id, 0);
      
      store.startWireDrawing(and2.id, -1);
      store.endWireDrawing(output2.id, 0);
      
      // Verify initial state
      const initialState = useCircuitStore.getState();
      expect(initialState.gates).toHaveLength(6);
      expect(initialState.wires).toHaveLength(4);
      
      // Delete one circuit (AND1)
      store.deleteGate(and1.id);
      
      // Verify only the affected circuit's wires are deleted
      const finalState = useCircuitStore.getState();
      expect(finalState.gates).toHaveLength(5);
      expect(finalState.wires).toHaveLength(2); // Only circuit 2 wires remain
      
      // Verify remaining wires are from circuit 2
      const remainingWires = finalState.wires;
      const wireGateIds = remainingWires.flatMap(w => [w.from.gateId, w.to.gateId]);
      expect(wireGateIds).toContain(input2.id);
      expect(wireGateIds).toContain(and2.id);
      expect(wireGateIds).toContain(output2.id);
      expect(wireGateIds).not.toContain(and1.id);
    });

    it('should handle deletion of gates with custom gate connections', () => {
      // This test ensures custom gates are handled correctly
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const clockGate = store.addGate('CLOCK', { x: 200, y: 100 });
      const dffGate = store.addGate('D-FF', { x: 300, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 400, y: 100 });
      
      // Connect INPUT to D-FF D input
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(dffGate.id, 0);
      
      // Connect CLOCK to D-FF CLK input
      store.startWireDrawing(clockGate.id, -1);
      store.endWireDrawing(dffGate.id, 1);
      
      // Connect D-FF output to OUTPUT
      store.startWireDrawing(dffGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      // Verify initial state
      const initialState = useCircuitStore.getState();
      expect(initialState.gates).toHaveLength(4);
      expect(initialState.wires).toHaveLength(3);
      
      // Delete the D-FF gate
      store.deleteGate(dffGate.id);
      
      // Verify all connected wires are deleted
      const finalState = useCircuitStore.getState();
      expect(finalState.gates).toHaveLength(3);
      expect(finalState.wires).toHaveLength(0);
      
      // Verify no orphaned wires
      const gateIds = new Set(finalState.gates.map(g => g.id));
      const orphanedWires = finalState.wires.filter(wire => 
        !gateIds.has(wire.from.gateId) || !gateIds.has(wire.to.gateId)
      );
      expect(orphanedWires).toHaveLength(0);
    });

    it('should preserve wire activity state correctly after deletion', () => {
      // Create circuit and activate it
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const andGate = store.addGate('AND', { x: 200, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 300, y: 100 });
      const independentInput = store.addGate('INPUT', { x: 100, y: 200 });
      const independentOutput = store.addGate('OUTPUT', { x: 300, y: 200 });
      
      // Create connections
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(andGate.id, 0);
      
      store.startWireDrawing(andGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      // Independent circuit
      store.startWireDrawing(independentInput.id, -1);
      store.endWireDrawing(independentOutput.id, 0);
      
      // Activate the independent circuit
      store.updateGateOutput(independentInput.id, true);
      
      // Verify independent wire is active
      const stateBeforeDeletion = useCircuitStore.getState();
      const activeWire = stateBeforeDeletion.wires.find(w => 
        w.from.gateId === independentInput.id && w.to.gateId === independentOutput.id
      );
      expect(activeWire?.isActive).toBe(true);
      
      // Delete the AND gate and its connections
      store.deleteGate(andGate.id);
      
      // Verify independent circuit's wire activity is preserved
      const finalState = useCircuitStore.getState();
      expect(finalState.wires).toHaveLength(1);
      const remainingWire = finalState.wires[0];
      expect(remainingWire.from.gateId).toBe(independentInput.id);
      expect(remainingWire.to.gateId).toBe(independentOutput.id);
      expect(remainingWire.isActive).toBe(true);
    });
  });

  describe('Circuit Evaluation Integration', () => {
    it('should evaluate circuit when gates are added', () => {
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const notGate = store.addGate('NOT', { x: 200, y: 100 });
      
      // Input should start as false by default
      const state = useCircuitStore.getState();
      const updatedInputGate = state.gates.find(g => g.id === inputGate.id);
      expect(updatedInputGate?.output).toBe(false);
    });

    it('should update circuit when input state changes', () => {
      const inputGate = store.addGate('INPUT', { x: 100, y: 100 });
      const outputGate = store.addGate('OUTPUT', { x: 200, y: 100 });
      
      // Connect input to output
      store.startWireDrawing(inputGate.id, -1);
      store.endWireDrawing(outputGate.id, 0);
      
      // Change input to true
      store.updateGateOutput(inputGate.id, true);
      
      const state = useCircuitStore.getState();
      const updatedOutputGate = state.gates.find(g => g.id === outputGate.id);
      const wire = state.wires[0];
      
      expect(wire.isActive).toBe(true);
      expect(updatedOutputGate?.inputs[0]).toBe('1');
    });
  });

  describe('Error Handling', () => {
    it('should handle operations on non-existent gates gracefully', () => {
      expect(() => {
        store.moveGate('non-existent-id', { x: 0, y: 0 });
      }).not.toThrow();
      
      expect(() => {
        store.deleteGate('non-existent-id');
      }).not.toThrow();
      
      expect(() => {
        store.updateGateOutput('non-existent-id', true);
      }).not.toThrow();
    });

    it('should handle wire operations on non-existent wires gracefully', () => {
      expect(() => {
        store.deleteWire('non-existent-wire-id');
      }).not.toThrow();
    });

    it('should handle undo/redo at boundaries gracefully', () => {
      // Try undo when no history
      expect(() => {
        store.undo();
      }).not.toThrow();
      
      // Try redo when no future
      expect(() => {
        store.redo();
      }).not.toThrow();
    });
  });
});