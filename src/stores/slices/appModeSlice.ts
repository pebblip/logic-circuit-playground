import type { StateCreator } from 'zustand';
import type { CircuitStore, AppMode } from '../types';
import type { GateType } from '@/types/circuit';

export interface AppModeSlice {
  appMode: AppMode;
  allowedGates: GateType[] | null;
  isLearningMode: boolean;
  setAppMode: (mode: AppMode) => void;
  setAllowedGates: (gates: GateType[] | null) => void;
  setIsLearningMode: (isLearning: boolean) => void;
  clearAll: () => void;
}

export const createAppModeSlice: StateCreator<
  CircuitStore,
  [],
  [],
  AppModeSlice
> = (set, get) => ({
  appMode: 'フリーモード',
  allowedGates: null,
  isLearningMode: false,

  setAppMode: (mode: AppMode) => {
    set({
      appMode: mode,
      isLearningMode: mode === '学習モード',
    });
  },

  setAllowedGates: (gates: GateType[] | null) => {
    set({ allowedGates: gates });
  },

  setIsLearningMode: (isLearning: boolean) => {
    set({ isLearningMode: isLearning });
  },

  clearAll: () => {
    set({
      gates: [],
      wires: [],
      selectedGateId: null,
      selectedGateIds: [],
      isDrawingWire: false,
      wireStart: null,
    });

    // 履歴に追加
    get().saveToHistory();
  },
});
