import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type { Wire } from '@/types/circuit';
import { IdGenerator } from '@shared/id';
import { evaluateCircuit } from '@domain/simulation';
import {
  getInputPinPosition,
  getOutputPinPosition,
} from '@domain/analysis/pinPositionCalculator';

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
    const position = isOutput
      ? getOutputPinPosition(gate, pinIndex)
      : getInputPinPosition(gate, pinIndex);

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

      const startPinIndex = state.wireStart.pinIndex;
      const isStartOutput = startPinIndex < 0;
      const isEndOutput = pinIndex < 0;

      // 出力から出力、入力から入力への接続は禁止
      if (isStartOutput === isEndOutput) {
        return { isDrawingWire: false, wireStart: null };
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
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(
        state.gates,
        updatedWires
      );

      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
        isDrawingWire: false,
        wireStart: null,
      };
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
      const { gates: evaluatedGates, wires: evaluatedWires } = evaluateCircuit(
        state.gates,
        newWires
      );

      return {
        gates: evaluatedGates,
        wires: evaluatedWires,
      };
    });

    // 履歴に追加
    get().saveToHistory();
  },
});
