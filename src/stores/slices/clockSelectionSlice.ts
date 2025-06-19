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
  // CLOCK選択状態を設定（自動トレース作成を復活）
  setSelectedClockGate: (gateId: string | null) => {
    // console.log(`[ClockSelection] Setting selected CLOCK: ${gateId}`);

    set(state => ({
      selectedClockGateId: gateId,
    }));

    // CLOCKが選択されたら自動的にトレースを作成
    if (gateId) {
      const state = get();
      const clockGate = state.gates.find(g => g.id === gateId && g.type === 'CLOCK');
      
      if (clockGate && state.timingChartActions) {
        // 既存のトレースをクリア（一時的に削除してテスト）
        // state.timingChartActions.clearAllTraces();
        
        // CLOCKゲートのトレースを追加
        const traceId = state.timingChartActions.addTrace(gateId, 'output', 0);
        console.log(`[ClockSelection] Added trace ${traceId} for CLOCK ${gateId}`);
        
        // タイミングチャートパネルを表示
        if (!state.timingChart.isVisible) {
          state.timingChartActions.showPanel();
          console.log(`[ClockSelection] Timing chart panel shown`);
        }
        
        // デバッグ: 現在のトレース状態を確認（非同期で）
        setTimeout(() => {
          const updatedState = get();
          console.log(`[ClockSelection] Current traces after update:`, updatedState.timingChart.traces);
        }, 0);
      }
    }
  },

  // 自動選択は廃止
  autoSelectClockGate: () => {
    // 自動選択機能は削除済み
  },

  // CLOCK選択をクリア
  clearClockSelection: () => {
    console.log(`[ClockSelection] Clearing CLOCK selection`);
    set(state => ({
      selectedClockGateId: null,
    }));

    // タイミングチャートもクリア
    const state = get();
    if (state.timingChartActions) {
      state.timingChartActions.clearAllTraces();
    }
  },
});
