import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';

export interface SelectionSlice {
  selectedGateId: string | null;
  selectedGateIds: string[];
  selectGate: (gateId: string | null) => void;
  setSelectedGates: (gateIds: string[]) => void;
  addToSelection: (gateId: string) => void;
  removeFromSelection: (gateId: string) => void;
  clearSelection: () => void;
}

export const createSelectionSlice: StateCreator<
  CircuitStore,
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  selectedGateId: null,
  selectedGateIds: [],

  selectGate: (gateId: string | null) => {
    set({
      selectedGateId: gateId,
      selectedGateIds: gateId ? [gateId] : [],
      // 配置済みゲートを選択した場合、ツールパレットの選択をクリア
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
    });
  },

  setSelectedGates: (gateIds: string[]) => {
    set({
      selectedGateIds: gateIds,
      selectedGateId: gateIds.length === 1 ? gateIds[0] : null,
    });
  },

  addToSelection: (gateId: string) => {
    const state = get();
    if (!state.selectedGateIds.includes(gateId)) {
      const newSelection = [...state.selectedGateIds, gateId];
      set({
        selectedGateIds: newSelection,
        selectedGateId: newSelection.length === 1 ? newSelection[0] : null,
      });
    }
  },

  removeFromSelection: (gateId: string) => {
    const state = get();
    const newSelection = state.selectedGateIds.filter(id => id !== gateId);
    set({
      selectedGateIds: newSelection,
      selectedGateId: newSelection.length === 1 ? newSelection[0] : null,
    });
  },

  clearSelection: () => {
    set({
      selectedGateId: null,
      selectedGateIds: [],
    });
  },
});
