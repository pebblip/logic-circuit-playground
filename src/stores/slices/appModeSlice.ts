import type { StateCreator } from 'zustand';
import type { CircuitStore, AppMode } from '../types';
import type { GateType } from '@/types/circuit';
import type { ViewMode } from '@/types/appMode';

export interface AppModeSlice {
  appMode: AppMode;
  allowedGates: GateType[] | null;
  isLearningMode: boolean;
  // ビューモード（カスタムゲートプレビュー用）
  viewMode: ViewMode;
  previewingCustomGateId: string | null;
  
  setAppMode: (mode: AppMode) => void;
  setAllowedGates: (gates: GateType[] | null) => void;
  setIsLearningMode: (isLearning: boolean) => void;
  clearAll: () => void;
  
  // カスタムゲートプレビュー用アクション
  enterCustomGatePreview: (customGateId: string) => void;
  exitCustomGatePreview: () => void;
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
  viewMode: 'normal',
  previewingCustomGateId: null,

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

  enterCustomGatePreview: (customGateId: string) => {
    console.log('[AppModeSlice] Entering custom gate preview:', customGateId);
    set({
      viewMode: 'custom-gate-preview',
      previewingCustomGateId: customGateId,
    });
  },

  exitCustomGatePreview: () => {
    console.log('[AppModeSlice] Exiting custom gate preview');
    set({
      viewMode: 'normal',
      previewingCustomGateId: null,
    });
  },
});
