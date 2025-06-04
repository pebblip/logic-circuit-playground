import type { StateCreator } from 'zustand';
import type { CircuitStore, HistoryState } from '../types';

export interface HistorySlice {
  history: HistoryState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
}

export const createHistorySlice: StateCreator<
  CircuitStore,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  history: [],
  historyIndex: -1,

  saveToHistory: () => {
    const state = get();
    const newHistoryState: HistoryState = {
      gates: state.gates,
      wires: state.wires,
    };

    // 現在の履歴位置より先の履歴を削除
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newHistoryState);

    // 履歴の最大数を制限（メモリ節約）
    const maxHistorySize = 50;
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        gates: previousState.gates,
        wires: previousState.wires,
        historyIndex: state.historyIndex - 1,
        selectedGateId: null,
        selectedGateIds: [],
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        gates: nextState.gates,
        wires: nextState.wires,
        historyIndex: state.historyIndex + 1,
        selectedGateId: null,
        selectedGateIds: [],
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
});
