import { create } from 'zustand';
import { Gate, Wire, CircuitState, GateType, Position } from '../types/circuit';
import { evaluateCircuit } from '../utils/simulation';
import { GateFactory } from '../models/gates/GateFactory';

interface CircuitStore extends CircuitState {
  // ゲート操作
  addGate: (type: GateType, position: Position) => Gate;
  moveGate: (gateId: string, position: Position) => void;
  selectGate: (gateId: string | null) => void;
  deleteGate: (gateId: string) => void;
  
  // ワイヤー操作
  startWireDrawing: (gateId: string, pinIndex: number) => void;
  endWireDrawing: (gateId: string, pinIndex: number) => void;
  cancelWireDrawing: () => void;
  deleteWire: (wireId: string) => void;
  
  // ゲートの状態更新
  updateGateOutput: (gateId: string, output: boolean) => void;
}

export const useCircuitStore = create<CircuitStore>((set) => ({
  gates: [],
  wires: [],
  selectedGateId: null,
  isDrawingWire: false,
  wireStart: null,

  addGate: (type, position) => {
    // GateFactoryを使用してゲートを作成（特殊ゲートにも対応）
    const newGate = GateFactory.createGate(type, position);
    
    set((state) => {
      const newGates = [...state.gates, newGate];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
    
    return newGate;
  },

  moveGate: (gateId, position) => {
    set((state) => {
      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (state.isDrawingWire && state.wireStart && state.wireStart.gateId === gateId) {
        const gate = state.gates.find(g => g.id === gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          let x = position.x;
          let y = position.y;
          
          if (gate.type === 'INPUT') {
            x += 35;
          } else if (gate.type === 'OUTPUT') {
            x -= 30;
          } else if (gate.type === 'CLOCK') {
            x += 55;
          } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 60;
              y -= 20; // Q output
            } else {
              x -= 60;
              y += pinIndex === 0 ? -20 : 20;
            }
          } else if (gate.type === 'MUX') {
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 60;
            } else {
              x -= 60;
              if (pinIndex === 0) y -= 25;
              else if (pinIndex === 1) y += 0;
              else if (pinIndex === 2) y += 25;
            }
          } else {
            // 通常のゲート
            const isOutput = pinIndex === -1;
            if (isOutput) {
              x += 45;
            } else {
              x -= 45;
              const inputCount = gate.type === 'NOT' ? 1 : 2;
              if (inputCount === 2) {
                y += pinIndex === 0 ? -10 : 10;
              }
            }
          }
          
          newWireStart = { ...state.wireStart, position: { x, y } };
        }
      }
      
      return {
        gates: state.gates.map((gate) =>
          gate.id === gateId ? { ...gate, position } : gate
        ),
        wireStart: newWireStart,
      };
    });
  },

  selectGate: (gateId) => {
    set({ selectedGateId: gateId });
  },

  deleteGate: (gateId) => {
    set((state) => {
      const newGates = state.gates.filter((gate) => gate.id !== gateId);
      const newWires = state.wires.filter(
        (wire) => wire.from.gateId !== gateId && wire.to.gateId !== gateId
      );
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(newGates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        selectedGateId: state.selectedGateId === gateId ? null : state.selectedGateId,
      };
    });
  },

  startWireDrawing: (gateId, pinIndex) => {
    const gate = useCircuitStore.getState().gates.find(g => g.id === gateId);
    if (!gate) return;
    
    // ピンの位置を計算
    let x = gate.position.x;
    let y = gate.position.y;
    
    if (gate.type === 'INPUT') {
      x += 35;
    } else if (gate.type === 'OUTPUT') {
      x -= 30;
    } else if (gate.type === 'CLOCK') {
      x += 55;
    } else if (gate.type === 'D-FF' || gate.type === 'SR-LATCH') {
      const isOutput = pinIndex === -1;
      if (isOutput) {
        x += 60;
        y -= 20; // Q output
      } else {
        x -= 60;
        y += pinIndex === 0 ? -20 : 20;
      }
    } else if (gate.type === 'MUX') {
      const isOutput = pinIndex === -1;
      if (isOutput) {
        x += 60;
      } else {
        x -= 60;
        if (pinIndex === 0) y -= 25;
        else if (pinIndex === 1) y += 0;
        else if (pinIndex === 2) y += 25;
      }
    } else {
      // 通常のゲート
      const isOutput = pinIndex === -1; // -1は出力ピン
      if (isOutput) {
        x += 45;
      } else {
        x -= 45;
        const inputCount = gate.type === 'NOT' ? 1 : 2;
        if (inputCount === 2) {
          y += pinIndex === 0 ? -10 : 10;
        }
      }
    }
    
    set({
      isDrawingWire: true,
      wireStart: { gateId, pinIndex, position: { x, y } },
    });
  },

  endWireDrawing: (gateId, pinIndex) => {
    set((state) => {
      if (!state.wireStart || state.wireStart.gateId === gateId) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 接続の方向を正規化（常に出力→入力になるようにする）
      let from = state.wireStart;
      let to = { gateId, pinIndex };
      
      // fromが入力ピン（pinIndex >= 0）で、toが出力ピン（pinIndex === -1）の場合、入れ替える
      if (from.pinIndex >= 0 && to.pinIndex === -1) {
        [from, to] = [to, from];
      }
      // 両方が入力ピンまたは両方が出力ピンの場合は接続しない
      else if ((from.pinIndex >= 0 && to.pinIndex >= 0) || (from.pinIndex === -1 && to.pinIndex === -1)) {
        return { isDrawingWire: false, wireStart: null };
      }

      const newWire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: { gateId: from.gateId, pinIndex: from.pinIndex },
        to: { gateId: to.gateId, pinIndex: to.pinIndex },
        isActive: false,
      };

      // 新しいワイヤーを追加
      const newWires = [...state.wires, newWire];
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(state.gates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        isDrawingWire: false,
        wireStart: null,
      };
    });
  },

  cancelWireDrawing: () => {
    set({ isDrawingWire: false, wireStart: null });
  },

  deleteWire: (wireId) => {
    set((state) => {
      const newWires = state.wires.filter((wire) => wire.id !== wireId);
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(state.gates, newWires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
  },

  updateGateOutput: (gateId, output) => {
    set((state) => {
      // まずINPUTゲートの状態を更新
      const updatedGates = state.gates.map((gate) =>
        gate.id === gateId ? { ...gate, output } : gate
      );
      
      // 回路全体を評価
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(updatedGates, state.wires);
      
      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });
  },
}));