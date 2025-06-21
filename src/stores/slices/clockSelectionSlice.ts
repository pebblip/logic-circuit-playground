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
    set(() => ({
      selectedClockGateId: gateId,
    }));

    // CLOCKが選択されたら自動的にトレースを作成
    if (gateId) {
      const state = get();
      const clockGate = state.gates.find(
        g => g.id === gateId && g.type === 'CLOCK'
      );

      if (clockGate && state.timingChartActions) {
        // 既存のトレースをクリア（一時的に削除してテスト）
        // state.timingChartActions.clearAllTraces();

        // CLOCKゲートのトレースを追加
        state.timingChartActions.addTrace(gateId, 'output', 0);

        // タイミングチャートパネルを自動表示（一時的に無効化）
        // ユーザーが明示的にタイミングチャートボタンを押したときのみ表示するように変更
        // if (!state.timingChart.isVisible) {
        //   state.timingChartActions.showPanel();
        // }
      }
    }
  },

  // 自動選択は廃止
  autoSelectClockGate: () => {
    // 自動選択機能は削除済み
  },

  // CLOCK選択をクリア
  clearClockSelection: () => {
    set(() => ({
      selectedClockGateId: null,
    }));

    // タイミングチャートもクリア
    const state = get();
    if (state.timingChartActions) {
      state.timingChartActions.clearAllTraces();
    }
  },
});
