import type { StateCreator } from 'zustand';
import type { CircuitStore, AppMode } from '../types';
import type { GateType } from '@/types/circuit';

export interface AppModeSlice {
  appMode: AppMode;
  allowedGates: GateType[] | null;
  setAppMode: (mode: AppMode) => void;
  setAllowedGates: (gates: GateType[] | null) => void;
  clearAll: () => void;
}

export const createAppModeSlice: StateCreator<
  CircuitStore,
  [],
  [],
  AppModeSlice
> = (set, get) => ({
  appMode: '自由制作',
  allowedGates: null,

  setAppMode: (mode: AppMode) => {
    set({ appMode: mode });
  },

  setAllowedGates: (gates: GateType[] | null) => {
    set({ allowedGates: gates });
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
