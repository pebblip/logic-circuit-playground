import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';
import type { GateType } from '@/types/circuit';

export interface ToolPaletteSlice {
  selectedToolGateType: GateType | 'CUSTOM' | null;
  selectedToolCustomGateId: string | null;
  selectToolGate: (type: GateType | 'CUSTOM', customGateId?: string) => void;
  clearToolSelection: () => void;
}

export const createToolPaletteSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ToolPaletteSlice
> = set => ({
  selectedToolGateType: null,
  selectedToolCustomGateId: null,

  selectToolGate: (type, customGateId) => {
    set({
      selectedToolGateType: type,
      selectedToolCustomGateId: customGateId || null,
      // ツールパレットでゲートを選択した場合、配置済みゲートの選択をクリア
      selectedGateId: null,
      selectedGateIds: [],
    });
  },

  clearToolSelection: () => {
    set({
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
    });
  },
});
