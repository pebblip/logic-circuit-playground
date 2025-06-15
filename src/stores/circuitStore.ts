import { create } from 'zustand';
import type { CircuitStore } from './types';
import { createHistorySlice } from './slices/historySlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createGateOperationsSlice } from './slices/gateOperations';
import { createWireOperationsSlice } from './slices/wireOperations';
import { createClipboardSlice } from './slices/clipboardSlice';
import { createCustomGateSlice } from './slices/customGateSlice';
import { createAppModeSlice } from './slices/appModeSlice';
import { createToolPaletteSlice } from './slices/toolPaletteSlice';
import { createShareSlice } from './slices/shareSlice';
import { createErrorSlice } from './slices/errorSlice';
import { createTimingChartSlice } from './slices/timingChartSlice';
import { createClockSelectionSlice } from './slices/clockSelectionSlice';

export const useCircuitStore = create<CircuitStore>()((...a) => ({
  // 基本的な状態
  gates: [],
  wires: [],
  isDrawingWire: false,
  wireStart: null,

  // 🎯 CLOCK選択状態
  selectedClockGateId: null,

  // エラーメッセージ
  errorMessage: null,
  errorType: null,

  // 各スライスをマージ
  ...createHistorySlice(...a),
  ...createSelectionSlice(...a),
  ...createGateOperationsSlice(...a),
  ...createWireOperationsSlice(...a),
  ...createClipboardSlice(...a),
  ...createCustomGateSlice(...a),
  ...createAppModeSlice(...a),
  ...createToolPaletteSlice(...a),
  ...createShareSlice(...a),
  ...createErrorSlice(...a),
  ...createTimingChartSlice(...a),
  ...createClockSelectionSlice(...a),
}));
