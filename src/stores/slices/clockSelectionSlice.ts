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
  // CLOCK選択状態を設定
  setSelectedClockGate: (gateId: string | null) => {
    console.log(`[ClockSelection] Setting selected CLOCK: ${gateId}`);
    
    set(state => ({
      selectedClockGateId: gateId
    }));
    
    // 選択変更時にタイミングチャートを更新
    if (gateId) {
      const state = get();
      if (state.timingChartActions && state.timingChart.isVisible) {
        // 既存のトレースをクリア
        state.timingChartActions.clearAllTraces();
        
        // 選択されたCLOCKのトレースを作成
        const selectedGate = state.gates.find(gate => gate.id === gateId);
        if (selectedGate && selectedGate.type === 'CLOCK') {
          state.timingChartActions.addTraceFromGate(selectedGate, 'output', 0);
          console.log(`[ClockSelection] Created trace for selected CLOCK: ${gateId}`);
        }
      }
    }
  },

  // 最初のCLOCKゲートを自動選択
  autoSelectClockGate: () => {
    const state = get();
    const clockGates = state.gates.filter(gate => gate.type === 'CLOCK');
    
    if (clockGates.length > 0 && !state.selectedClockGateId) {
      const firstClock = clockGates[0];
      console.log(`[ClockSelection] Auto-selecting first CLOCK: ${firstClock.id}`);
      get().setSelectedClockGate(firstClock.id);
    }
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