import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type { Wire } from '@/types/circuit';
import { IdGenerator } from '@shared/id';
import {
  evaluateCircuit,
  defaultConfig,
  isSuccess,
} from '@domain/simulation/core';
import type { Circuit } from '@domain/simulation/core/types';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@domain/analysis/pinPositionCalculator';
import { WireConnectionService } from '@/services/WireConnectionService';

export interface WireOperationsSlice {
  startWireDrawing: (gateId: string, pinIndex: number) => void;
  endWireDrawing: (gateId: string, pinIndex: number) => void;
  cancelWireDrawing: () => void;
  deleteWire: (wireId: string) => void;
}

export const createWireOperationsSlice: StateCreator<
  CircuitStore,
  [],
  [],
  WireOperationsSlice
> = (set, get) => ({
  startWireDrawing: (gateId, pinIndex) => {
    const gate = get().gates.find(g => g.id === gateId);
    if (!gate) return;

    // ピンの位置を計算
    const isOutput = pinIndex < 0;
    const actualPinIndex = isOutput ? Math.abs(pinIndex) - 1 : pinIndex;
    const position = isOutput
      ? getOutputPinPosition(gate, actualPinIndex)
      : getInputPinPosition(gate, actualPinIndex);

    set({
      isDrawingWire: true,
      wireStart: { gateId, pinIndex, position },
    });
  },

  endWireDrawing: (gateId, pinIndex) => {
    set(state => {
      if (!state.wireStart || state.wireStart.gateId === gateId) {
        return { isDrawingWire: false, wireStart: null };
      }

      const startGate = state.gates.find(g => g.id === state.wireStart!.gateId);
      const endGate = state.gates.find(g => g.id === gateId);
      
      if (!startGate || !endGate) {
        return { isDrawingWire: false, wireStart: null };
      }

      const startPinIndex = state.wireStart.pinIndex;
      const isStartOutput = startPinIndex < 0;
      const isEndOutput = pinIndex < 0;

      // 接続可能性をチェック
      const connectionCheck = WireConnectionService.canConnect(
        startGate,
        startPinIndex,
        endGate,
        pinIndex,
        state.wires
      );

      // 接続不可の場合は終了
      if (!connectionCheck.valid) {
        return { 
          isDrawingWire: false, 
          wireStart: null
        };
      }

      // 接続の方向を決定（必ず出力→入力）
      let from, to;
      if (isStartOutput) {
        from = {
          gateId: state.wireStart.gateId,
          pinIndex: startPinIndex,
        };
        to = {
          gateId,
          pinIndex,
        };
      } else {
        from = {
          gateId,
          pinIndex,
        };
        to = {
          gateId: state.wireStart.gateId,
          pinIndex: startPinIndex,
        };
      }

      // 既存の同じ接続をチェック
      const existingWire = state.wires.find(
        wire =>
          wire.from.gateId === from.gateId &&
          wire.from.pinIndex === from.pinIndex &&
          wire.to.gateId === to.gateId &&
          wire.to.pinIndex === to.pinIndex
      );

      if (existingWire) {
        return { isDrawingWire: false, wireStart: null };
      }

      // 入力ピンへの既存接続を削除
      const newWires = state.wires.filter(
        wire =>
          !(wire.to.gateId === to.gateId && wire.to.pinIndex === to.pinIndex)
      );

      // 新しいワイヤーを作成
      const newWire: Wire = {
        id: IdGenerator.generateWireId(),
        from,
        to,
        isActive: false,
      };

      // ワイヤーを追加
      const updatedWires = [...newWires, newWire];

      // 回路全体を評価
      const circuit: Circuit = { gates: state.gates, wires: updatedWires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
          isDrawingWire: false,
          wireStart: null
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: state.gates,
          wires: updatedWires,
          isDrawingWire: false,
          wireStart: null
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },

  cancelWireDrawing: () => {
    set({
      isDrawingWire: false,
      wireStart: null,
    });
  },

  deleteWire: (wireId: string) => {
    set(state => {
      const newWires = state.wires.filter(wire => wire.id !== wireId);

      // 回路全体を評価
      const circuit: Circuit = { gates: state.gates, wires: newWires };
      const result = evaluateCircuit(circuit, defaultConfig);

      if (isSuccess(result)) {
        return {
          gates: [...result.data.circuit.gates],
          wires: [...result.data.circuit.wires],
        };
      } else {
        console.warn('Circuit evaluation failed:', result.error.message);
        return {
          gates: state.gates,
          wires: newWires,
        };
      }
    });

    // 履歴に追加
    get().saveToHistory();
  },

});
