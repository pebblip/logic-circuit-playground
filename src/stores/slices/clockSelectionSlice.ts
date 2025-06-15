/**
 * CLOCK選択機能のSlice（タイミングチャート用）
 */

import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';

export interface ClockSelectionSlice {
  // 🎯 CLOCK選択操作
  setSelectedClockGate: (gateId: string | null) => void;
  autoSelectClockGate: () => void;
  clearClockSelection: () => void;
}

export const createClockSelectionSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ClockSelectionSlice
> = (set, get) => ({
  // CLOCK選択状態を設定（自動トレース作成は削除）
  setSelectedClockGate: (gateId: string | null) => {
    console.log(`[ClockSelection] Setting selected CLOCK: ${gateId}`);
    
    set(state => ({
      selectedClockGateId: gateId
    }));
    
    // 自動トレース作成は削除 - ユーザーが明示的に追加する必要がある
  },

  // 自動選択は廃止
  autoSelectClockGate: () => {
    // 自動選択機能は削除済み
  },

  // CLOCK選択をクリア
  clearClockSelection: () => {
    console.log(`[ClockSelection] Clearing CLOCK selection`);
    set(state => ({
      selectedClockGateId: null
    }));
    
    // タイミングチャートもクリア
    const state = get();
    if (state.timingChartActions) {
      state.timingChartActions.clearAllTraces();
    }
  }
});