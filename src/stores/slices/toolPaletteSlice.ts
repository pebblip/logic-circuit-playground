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
> = _set => ({
  selectedToolGateType: null,
  selectedToolCustomGateId: null,

  selectToolGate: (type, customGateId) => {
    _set({
      selectedToolGateType: type,
      selectedToolCustomGateId: customGateId || null,
    });
  },

  clearToolSelection: () => {
    _set({
      selectedToolGateType: null,
      selectedToolCustomGateId: null,
    });
  },
});
