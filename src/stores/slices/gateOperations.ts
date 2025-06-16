import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type {
  Gate,
  GateType,
  Position,
  CustomGateDefinition,
} from '@/types/circuit';
import { GateFactory } from '@/models/gates/GateFactory';
import {
  evaluateCircuit,
  defaultConfig,
  isSuccess,
} from '@domain/simulation/core';
import type { Circuit } from '@domain/simulation/core/types';
import { booleanToDisplayState } from '@domain/simulation';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@domain/analysis/pinPositionCalculator';

export interface GateOperationsSlice {
  addGate: (type: GateType, position: Position) => Gate;
  addCustomGateInstance: (
    definition: CustomGateDefinition,
    position: Position
  ) => Gate;
  moveGate: (
    gateId: string,
    position: Position,
    saveToHistory?: boolean
  ) => void;
  moveMultipleGates: (
    gateIds: string[],
    deltaX: number,
    deltaY: number,
    saveToHistory?: boolean
  ) => void;
  deleteGate: (gateId: string) => void;
  updateGateOutput: (gateId: string, output: boolean) => void;
  updateClockFrequency: (gateId: string, frequency: number) => void;
}

export const createGateOperationsSlice: StateCreator<
  CircuitStore,
  [],
  [],
  GateOperationsSlice
> = (set, get) => ({
  addGate: (type, position) => {
    const newGate = GateFactory.createGate(type, position);

    // ゲートの入力値を適切な形式で初期化
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input =>
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();

    // CLOCKゲートは配置されるが、自動選択は行わない

    return newGate;
  },

  addCustomGateInstance: (definition, position) => {
    const newGate = GateFactory.createCustomGate(definition, position);

    // カスタムゲートの入力値を適切な形式で初期化
    if (newGate.inputs && newGate.inputs.length > 0) {
      newGate.inputs = newGate.inputs.map(input =>
        typeof input === 'boolean' ? booleanToDisplayState(input) : input
      );
    }

    set(state => {
      const newGates = [...state.gates, newGate];

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();

    return newGate;
  },

  moveGate: (gateId, position, saveToHistory = false) => {
    set(state => {
      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (
        state.isDrawingWire &&
        state.wireStart &&
        state.wireStart.gateId === gateId
      ) {
        const gate = state.gates.find(g => g.id === gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          const isOutput = pinIndex < 0;

          const pinPosition = isOutput
            ? getOutputPinPosition(gate, pinIndex)
            : getInputPinPosition(gate, pinIndex);

          newWireStart = { ...state.wireStart, position: pinPosition };
        }
      }

      const newGates = state.gates.map(gate =>
        gate.id === gateId ? { ...gate, position } : gate
      );

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: state.wires,
          wireStart: newWireStart,
        };
      }
    });

    // saveToHistoryフラグが設定されている場合のみ履歴に追加
    if (saveToHistory) {
      get().saveToHistory();
    }
  },

  moveMultipleGates: (gateIds, deltaX, deltaY, saveToHistory = false) => {
    set(state => {
      // 移動対象のゲートを更新
      const newGates = state.gates.map(gate => {
        if (gateIds.includes(gate.id)) {
          return {
            ...gate,
            position: {
              x: gate.position.x + deltaX,
              y: gate.position.y + deltaY,
            },
          };
        }
        return gate;
      });

      // ワイヤー描画中で、移動するゲートから出ている場合は起点も更新
      let newWireStart = state.wireStart;
      if (
        state.isDrawingWire &&
        state.wireStart &&
        gateIds.includes(state.wireStart.gateId)
      ) {
        const gate = newGates.find(g => g.id === state.wireStart!.gateId);
        if (gate) {
          // ピンの位置を再計算
          const pinIndex = state.wireStart.pinIndex;
          const isOutput = pinIndex < 0;

          const pinPosition = isOutput
            ? getOutputPinPosition(gate, pinIndex)
            : getInputPinPosition(gate, pinIndex);

          newWireStart = { ...state.wireStart, position: pinPosition };
        }
      }

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          wireStart: newWireStart,
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: state.wires,
          wireStart: newWireStart,
        };
      }
    });

    // saveToHistoryフラグが設定されている場合のみ履歴に追加
    if (saveToHistory) {
      get().saveToHistory();
    }
  },

  deleteGate: (gateId: string) => {
    set(state => {
      // 削除対象のゲートIDリスト（単一の場合も配列にする）
      const gateIdsToDelete = state.selectedGateIds.includes(gateId)
        ? state.selectedGateIds
        : [gateId];

      const newGates = state.gates.filter(
        gate => !gateIdsToDelete.includes(gate.id)
      );
      const newWires = state.wires.filter(
        wire =>
          !gateIdsToDelete.includes(wire.from.gateId) &&
          !gateIdsToDelete.includes(wire.to.gateId)
      );

      // 🎯 削除されるゲートに選択されたCLOCKが含まれている場合、選択をクリア
      let newSelectedClockGateId = state.selectedClockGateId;
      if (
        state.selectedClockGateId &&
        gateIdsToDelete.includes(state.selectedClockGateId)
      ) {
        console.log(
          `🎯 Clearing selected CLOCK because it's being deleted: ${state.selectedClockGateId}`
        );
        newSelectedClockGateId = null;
      }

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: newWires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          selectedGateId: null,
          selectedGateIds: [],
          selectedClockGateId: newSelectedClockGateId,
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: newWires,
          selectedGateId: null,
          selectedGateIds: [],
          selectedClockGateId: newSelectedClockGateId,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },

  updateGateOutput: (gateId: string, output: boolean) => {
    set(state => {
      const newGates = state.gates.map(gate =>
        gate.id === gateId ? { ...gate, output } : gate
      );

      // 回路全体を評価
      const circuit: Circuit = { gates: newGates, wires: state.wires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: newGates,
          wires: state.wires,
        };
      }
    });
  },

  updateClockFrequency: (gateId: string, frequency: number) => {
    set(state => {
      const newGates = state.gates.map(gate => {
        if (gate.id === gateId && gate.type === 'CLOCK' && gate.metadata) {
          return {
            ...gate,
            metadata: {
              ...gate.metadata,
              frequency,
            },
          };
        }
        return gate;
      });

      return { gates: newGates };
    });
  },
});
