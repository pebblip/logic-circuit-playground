/**
 * タイミングチャート機能のZustand Store Slice
 * 完全再設計版：オシロスコープライクな連続スクロール実装
 */

import type { StateCreator } from 'zustand';
import type {
  TimingChartState,
  TimingTrace,
  TimingEvent,
  TimeWindow,
  TimeScale,
  TimingChartSettings,
  TimeMs,
} from '@/types/timing';
import type { Gate } from '@/types/circuit';
import {
  timingChartUtils,
  sortEventsByTime,
  deduplicateEvents,
  isValidTimeWindow,
  getGateType,
  isClockGate,
  generateTraceNameFromGate,
  getClockTraceColor,
  estimateMemoryUsage,
} from '@/utils/timingChart';

// デフォルト設定
const DEFAULT_SETTINGS: TimingChartSettings = {
  theme: 'dark',
  gridVisible: true,
  clockHighlightEnabled: true,
  edgeMarkersEnabled: true,
  signalLabelsVisible: true,
  autoCapture: true,
  captureDepth: 10000,
  updateInterval: 16, // 60fps
};

// 初期状態
const INITIAL_STATE: TimingChartState = {
  isVisible: false,
  panelHeight: 250, // 500 → 250に縮小（1クロックしか表示しないため）
  timeWindow: { start: 0, end: 3000 }, // 3秒窓でCLOCK周期(1000ms)×3サイクル表示
  timeScale: 'ms',
  autoScale: true,
  autoScroll: true, // オシロスコープモード有効
  isPaused: false,
  traces: [],
  maxTraces: 10,
  settings: DEFAULT_SETTINGS,
};

// 🎯 新設計：連続スクロール管理
interface ContinuousScrollState {
  currentSimulationTime: TimeMs;
  scrollSpeed: number; // ms per second
  lastUpdateTime: number;
  isScrolling: boolean;
}

export interface TimingChartSlice {
  // 状態
  timingChart: TimingChartState & {
    scrollState: ContinuousScrollState;
  };

  // アクション
  timingChartActions: {
    // パネル制御
    togglePanel: () => void;
    showPanel: () => void;
    hidePanel: () => void;
    setPanelHeight: (height: number) => void;

    // 🌟 新設計：時間軸制御（オシロスコープライク）
    updateCurrentTime: (simulationTime: TimeMs) => void;
    startContinuousScroll: () => void;
    stopContinuousScroll: () => void;
    setScrollSpeed: (speed: number) => void;

    // トレース管理
    addTrace: (
      gateId: string,
      pinType: 'input' | 'output',
      pinIndex?: number
    ) => string | null;
    addTraceFromGate: (
      gate: Gate,
      pinType: 'input' | 'output',
      pinIndex?: number
    ) => string | null;
    removeTrace: (traceId: string) => void;
    updateTraceColor: (traceId: string, color: string) => void;
    toggleTraceVisibility: (traceId: string) => void;
    clearAllTraces: () => void;
    renameTrace: (traceId: string, name: string) => void;

    // 従来の時間軸制御（手動操作用）
    setTimeWindow: (window: TimeWindow) => void;
    setTimeScale: (scale: TimeScale) => void;
    zoomIn: (centerTime?: TimeMs) => void;
    zoomOut: (centerTime?: TimeMs) => void;
    panTo: (centerTime: TimeMs) => void;
    resetView: () => void;
    fitToData: () => void;

    // 自動スクロール（新実装）
    enableAutoScroll: () => void;
    disableAutoScroll: () => void;

    // 一時停止制御
    pauseCapture: () => void;
    resumeCapture: () => void;
    togglePause: () => void;

    // カーソル制御
    setCursor: (time: TimeMs) => void;
    moveCursor: (deltaTime: TimeMs) => void;
    hideCursor: () => void;

    // イベント処理（新実装）
    processTimingEvents: (events: TimingEvent[]) => void;
    addEventToTrace: (traceId: string, event: TimingEvent) => void;
    clearTraceEvents: (traceId: string) => void;

    // 設定
    updateSettings: (settings: Partial<TimingChartSettings>) => void;
    resetSettings: () => void;

    // データ管理
    exportData: (format: 'csv' | 'json') => string;
    getTraceData: (traceId: string) => TimingTrace | null;
    getVisibleTraces: () => TimingTrace[];

    // ユーティリティ
    updateStats: () => void;
    cleanup: () => void;
  };
}

export const createTimingChartSlice: StateCreator<
  TimingChartSlice,
  [],
  [],
  TimingChartSlice
> = (set, get) => ({
  timingChart: {
    ...INITIAL_STATE,
    scrollState: {
      currentSimulationTime: 0,
      scrollSpeed: 500, // 500ms/sec = 時間窓幅/秒
      lastUpdateTime: performance.now(),
      isScrolling: false,
    },
  },

  timingChartActions: {
    // === パネル制御 ===
    togglePanel: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isVisible: !state.timingChart.isVisible,
        },
      })),

    showPanel: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isVisible: true,
        },
      })),

    hidePanel: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isVisible: false,
        },
      })),

    setPanelHeight: (height: number) =>
      set(state => {
        const clampedHeight = Math.max(200, Math.min(600, height));
        return {
          timingChart: {
            ...state.timingChart,
            panelHeight: clampedHeight,
          },
        };
      }),

    // === 🌟 新設計：連続スクロール時間軸制御 ===
    updateCurrentTime: (simulationTime: TimeMs) =>
      set(state => {
        const { scrollState, timeWindow, autoScroll } = state.timingChart;
        const windowWidth = timeWindow.end - timeWindow.start;

        let newTimeWindow = timeWindow;

        // オシロスコープモード：現在時刻追従
        if (autoScroll && scrollState.isScrolling) {
          // 現在時刻が時間窓の右端80%を超えたら自動スクロール
          const scrollThreshold = timeWindow.start + windowWidth * 0.8;

          if (simulationTime > scrollThreshold) {
            // 現在時刻を窓の右端20%の位置に保つ
            const newEnd = simulationTime + windowWidth * 0.2;
            const newStart = newEnd - windowWidth;

            newTimeWindow = {
              start: Math.max(0, newStart),
              end: newEnd,
            };
          }
        }

        return {
          timingChart: {
            ...state.timingChart,
            timeWindow: newTimeWindow,
            scrollState: {
              ...scrollState,
              currentSimulationTime: simulationTime,
              lastUpdateTime: performance.now(),
            },
          },
        };
      }),

    startContinuousScroll: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          autoScroll: true,
          scrollState: {
            ...state.timingChart.scrollState,
            isScrolling: true,
          },
        },
      })),

    stopContinuousScroll: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          autoScroll: false,
          scrollState: {
            ...state.timingChart.scrollState,
            isScrolling: false,
          },
        },
      })),

    setScrollSpeed: (speed: number) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          scrollState: {
            ...state.timingChart.scrollState,
            scrollSpeed: Math.max(100, Math.min(2000, speed)), // 100-2000ms/sec
          },
        },
      })),

    // === トレース管理 ===
    addTrace: (gateId: string, pinType: 'input' | 'output', pinIndex = 0) => {
      const state = get().timingChart;

      // 既に存在するかチェック
      const existingTrace = state.traces.find(
        t =>
          t.gateId === gateId &&
          t.pinType === pinType &&
          t.pinIndex === pinIndex
      );

      if (existingTrace) {
        console.warn(
          `Trace already exists for gate ${gateId} ${pinType}[${pinIndex}]`
        );
        return null;
      }

      // 最大トレース数チェック
      if (state.traces.length >= state.maxTraces) {
        console.warn(`Maximum trace limit (${state.maxTraces}) reached`);
        return null;
      }

      const traceId = timingChartUtils.generateTraceId();

      // 🌟 ゲート情報を使って適切な名前を生成するため、ゲートを取得
      const currentState = get();
      const gates = (currentState as any).gates || [];
      const gate = gates.find((g: any) => g.id === gateId);

      const traceName = gate
        ? generateTraceNameFromGate(gate, pinType, pinIndex)
        : timingChartUtils.generateTraceName(gateId, pinType, pinIndex);

      const traceColor =
        gate && isClockGate(gate)
          ? getClockTraceColor(gate.id)
          : timingChartUtils.assignTraceColor(state.traces.length);

      const newTrace: TimingTrace = {
        id: traceId,
        gateId,
        pinType,
        pinIndex,
        name: traceName,
        color: traceColor,
        visible: true,
        events: [],
        metadata: {
          gateType: 'UNKNOWN',
        },
      };

      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: [...state.timingChart.traces, newTrace],
        },
      }));

      return traceId;
    },

    addTraceFromGate: (
      gate: Gate,
      pinType: 'input' | 'output',
      pinIndex = 0
    ) => {
      const state = get().timingChart;

      // 既に存在するかチェック
      const existingTrace = state.traces.find(
        t =>
          t.gateId === gate.id &&
          t.pinType === pinType &&
          t.pinIndex === pinIndex
      );

      if (existingTrace) {
        console.warn(
          `Trace already exists for gate ${gate.id} ${pinType}[${pinIndex}]`
        );
        return null;
      }

      // 最大トレース数チェック
      if (state.traces.length >= state.maxTraces) {
        console.warn(`Maximum trace limit (${state.maxTraces}) reached`);
        return null;
      }

      const traceId = timingChartUtils.generateTraceId();
      const traceName = generateTraceNameFromGate(gate, pinType, pinIndex);
      const traceColor = isClockGate(gate)
        ? getClockTraceColor(gate.id)
        : timingChartUtils.assignTraceColor(state.traces.length);

      const newTrace: TimingTrace = {
        id: traceId,
        gateId: gate.id,
        pinType,
        pinIndex,
        name: traceName,
        color: traceColor,
        visible: true,
        events: [],
        metadata: {
          gateType: getGateType(gate),
          description: isClockGate(gate)
            ? 'System Clock'
            : `${getGateType(gate)} Gate`,
        },
      };

      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: [...state.timingChart.traces, newTrace],
        },
      }));

      return traceId;
    },

    removeTrace: (traceId: string) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.filter(
            trace => trace.id !== traceId
          ),
        },
      })),

    updateTraceColor: (traceId: string, color: string) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.map(trace =>
            trace.id === traceId ? { ...trace, color } : trace
          ),
        },
      })),

    toggleTraceVisibility: (traceId: string) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.map(trace =>
            trace.id === traceId ? { ...trace, visible: !trace.visible } : trace
          ),
        },
      })),

    clearAllTraces: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: [],
        },
      })),

    renameTrace: (traceId: string, name: string) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.map(trace =>
            trace.id === traceId ? { ...trace, name } : trace
          ),
        },
      })),

    // === 従来の時間軸制御（手動操作用） ===
    setTimeWindow: (window: TimeWindow) => {
      if (!isValidTimeWindow(window.start, window.end)) {
        console.warn('Invalid time window:', window);
        return;
      }

      set(state => ({
        timingChart: {
          ...state.timingChart,
          timeWindow: window,
          autoScroll: false, // 手動設定時は自動スクロール無効
        },
      }));
    },

    setTimeScale: (scale: TimeScale) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          timeScale: scale,
        },
      })),

    zoomIn: (centerTime?: TimeMs) =>
      set(state => {
        const { timeWindow } = state.timingChart;
        const center = centerTime ?? (timeWindow.start + timeWindow.end) / 2;
        const currentWidth = timeWindow.end - timeWindow.start;
        const newWidth = currentWidth * 0.7; // 30%縮小

        const newStart = Math.max(0, center - newWidth / 2);
        const newEnd = newStart + newWidth;

        return {
          timingChart: {
            ...state.timingChart,
            timeWindow: { start: newStart, end: newEnd },
            autoScroll: false, // 手動操作時は自動スクロール無効
          },
        };
      }),

    zoomOut: (centerTime?: TimeMs) =>
      set(state => {
        const { timeWindow } = state.timingChart;
        const center = centerTime ?? (timeWindow.start + timeWindow.end) / 2;
        const currentWidth = timeWindow.end - timeWindow.start;
        const newWidth = currentWidth * 1.5; // 50%拡大

        const newStart = Math.max(0, center - newWidth / 2);
        const newEnd = newStart + newWidth;

        return {
          timingChart: {
            ...state.timingChart,
            timeWindow: { start: newStart, end: newEnd },
            autoScroll: false, // 手動操作時は自動スクロール無効
          },
        };
      }),

    panTo: (centerTime: TimeMs) =>
      set(state => {
        const { timeWindow } = state.timingChart;
        const width = timeWindow.end - timeWindow.start;
        const newStart = Math.max(0, centerTime - width / 2);
        const newEnd = newStart + width;

        return {
          timingChart: {
            ...state.timingChart,
            timeWindow: { start: newStart, end: newEnd },
            autoScroll: false, // 手動操作時は自動スクロール無効
          },
        };
      }),

    resetView: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          timeWindow: INITIAL_STATE.timeWindow,
          timeScale: INITIAL_STATE.timeScale,
          autoScroll: true, // リセット時は自動スクロール有効
          scrollState: {
            ...state.timingChart.scrollState,
            currentSimulationTime: 0,
          },
        },
      })),

    fitToData: () =>
      set(state => {
        const { traces } = state.timingChart;

        if (traces.length === 0) {
          return state;
        }

        // 全てのイベントから時間範囲を計算
        let minTime = Infinity;
        let maxTime = -Infinity;

        traces.forEach(trace => {
          trace.events.forEach(event => {
            minTime = Math.min(minTime, event.time);
            maxTime = Math.max(maxTime, event.time);
          });
        });

        if (minTime === Infinity || maxTime === -Infinity) {
          return state;
        }

        // 少し余裕を持たせる
        const padding = (maxTime - minTime) * 0.1;
        const newStart = Math.max(0, minTime - padding);
        const newEnd = maxTime + padding;

        return {
          timingChart: {
            ...state.timingChart,
            timeWindow: { start: newStart, end: newEnd },
            autoScroll: false, // 手動操作時は自動スクロール無効
          },
        };
      }),

    // === 自動スクロール（新実装） ===
    enableAutoScroll: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          autoScroll: true,
          scrollState: {
            ...state.timingChart.scrollState,
            isScrolling: true,
          },
        },
      })),

    disableAutoScroll: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          autoScroll: false,
          scrollState: {
            ...state.timingChart.scrollState,
            isScrolling: false,
          },
        },
      })),

    // === 一時停止制御 ===
    pauseCapture: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isPaused: true,
        },
      })),

    resumeCapture: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isPaused: false,
        },
      })),

    togglePause: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          isPaused: !state.timingChart.isPaused,
        },
      })),

    // === カーソル制御 ===
    setCursor: (time: TimeMs) =>
      set(state => {
        const signalValues = timingChartUtils.calculateSignalValuesAtTime(
          state.timingChart.traces,
          time
        );

        return {
          timingChart: {
            ...state.timingChart,
            cursor: {
              time,
              visible: true,
              signalValues,
            },
          },
        };
      }),

    moveCursor: (deltaTime: TimeMs) =>
      set(state => {
        if (!state.timingChart.cursor) return state;

        const newTime = Math.max(0, state.timingChart.cursor.time + deltaTime);
        const signalValues = timingChartUtils.calculateSignalValuesAtTime(
          state.timingChart.traces,
          newTime
        );

        return {
          timingChart: {
            ...state.timingChart,
            cursor: {
              time: newTime,
              visible: true,
              signalValues,
            },
          },
        };
      }),

    hideCursor: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          cursor: undefined,
        },
      })),

    // === 🌟 新実装：イベント処理 ===
    processTimingEvents: (events: TimingEvent[]) => {
      if (events.length === 0) return;

      const state = get().timingChart;

      if (state.isPaused) {
        console.log(`[TimingChart] Skipping ${events.length} events due to pause state`);
        return;
      }

      console.log(`[TimingChart] Processing ${events.length} events:`, events);
      console.log(`[TimingChart] Current traces:`, state.traces.map(t => ({
        id: t.id,
        gateId: t.gateId,
        pinType: t.pinType,
        pinIndex: t.pinIndex,
        eventsCount: t.events.length
      })));

      // イベントを処理
      set(currentState => {
        let hasChanges = false;
        const updatedTraces = currentState.timingChart.traces.map(trace => {
          const relevantEvents = events.filter(
            e => {
              const gateMatch = e.gateId === trace.gateId;
              const pinTypeMatch = e.pinType === trace.pinType;
              const pinIndexMatch = e.pinIndex === trace.pinIndex;
              console.log(`[TimingChart] Event ${e.id}: gateId=${e.gateId} (${gateMatch}), pinType=${e.pinType} (${pinTypeMatch}), pinIndex=${e.pinIndex} (${pinIndexMatch})`);
              return gateMatch && pinTypeMatch && pinIndexMatch;
            }
          );

          console.log(`[TimingChart] Trace ${trace.id} (${trace.gateId}:${trace.pinType}[${trace.pinIndex}]) found ${relevantEvents.length} relevant events out of ${events.length} total`);

          if (relevantEvents.length === 0) return trace;

          hasChanges = true;
          console.log(`[TimingChart] Adding ${relevantEvents.length} events to trace ${trace.id}:`, relevantEvents.map(e => ({ id: e.id, time: e.time, value: e.value, gateId: e.gateId, source: e.source })));
          // 最初の2つのイベントの詳細ログ
          if (relevantEvents.length > 0) {
            console.log(`[TimingChart] Event details:`, relevantEvents.slice(0, 2));
          }

          // イベントを統合してソート
          const allEvents = [...trace.events, ...relevantEvents];
          const deduplicated = deduplicateEvents(allEvents);
          const sorted = sortEventsByTime(deduplicated);

          // 容量制限を適用
          const limited = sorted.slice(
            -currentState.timingChart.settings.captureDepth
          );

          console.log(`[TimingChart] Trace ${trace.id} now has ${limited.length} events (was ${trace.events.length})`);

          return {
            ...trace,
            events: limited,
          };
        });

        if (!hasChanges) {
          console.log(`[TimingChart] No relevant events found for any traces`);
          return currentState;
        }

        console.log(`[TimingChart] Updated traces with new events`);
        return {
          timingChart: {
            ...currentState.timingChart,
            traces: updatedTraces,
          },
        };
      });

      // 🌟 現在時刻を更新（最新イベント時刻ベース）
      if (events.length > 0) {
        const latestEventTime = Math.max(...events.map(e => e.time));
        get().timingChartActions.updateCurrentTime(latestEventTime);
        console.log(`[TimingChart] Processed ${events.length} events, latest time: ${latestEventTime}`);
      }
    },

    addEventToTrace: (traceId: string, event: TimingEvent) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.map(trace => {
            if (trace.id !== traceId) return trace;

            const newEvents = sortEventsByTime([...trace.events, event]);
            const limited = newEvents.slice(
              -state.timingChart.settings.captureDepth
            );

            return {
              ...trace,
              events: limited,
            };
          }),
        },
      })),

    clearTraceEvents: (traceId: string) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: state.timingChart.traces.map(trace =>
            trace.id === traceId ? { ...trace, events: [] } : trace
          ),
        },
      })),

    // === 設定 ===
    updateSettings: (settings: Partial<TimingChartSettings>) =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          settings: {
            ...state.timingChart.settings,
            ...settings,
          },
        },
      })),

    resetSettings: () =>
      set(state => ({
        timingChart: {
          ...state.timingChart,
          settings: DEFAULT_SETTINGS,
        },
      })),

    // === データ管理 ===
    exportData: (format: 'csv' | 'json') => {
      const state = get().timingChart;

      if (format === 'json') {
        return JSON.stringify(
          {
            traces: state.traces,
            timeWindow: state.timeWindow,
            settings: state.settings,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      }

      // CSV形式
      const headers = ['Time(ms)', ...state.traces.map(t => t.name)];
      const rows = [headers.join(',')];

      // 全イベントから時間点を収集
      const timePoints = new Set<number>();
      state.traces.forEach(trace => {
        trace.events.forEach(event => timePoints.add(event.time));
      });

      const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);

      sortedTimes.forEach(time => {
        const row = [time.toString()];
        state.traces.forEach(trace => {
          const signalValue = timingChartUtils.calculateSignalValuesAtTime(
            [trace],
            time
          )[trace.id];
          row.push(signalValue === true ? '1' : '0');
        });
        rows.push(row.join(','));
      });

      return rows.join('\n');
    },

    getTraceData: (traceId: string) => {
      const state = get().timingChart;
      return state.traces.find(trace => trace.id === traceId) || null;
    },

    getVisibleTraces: () => {
      const state = get().timingChart;
      return state.traces.filter(trace => trace.visible);
    },

    // === ユーティリティ ===
    updateStats: () =>
      set(state => {
        const { traces, timeWindow } = state.timingChart;
        const now = performance.now();

        const totalEvents = traces.reduce(
          (sum, trace) => sum + trace.events.length,
          0
        );
        const memoryUsage = estimateMemoryUsage(traces) / 1024; // MB

        return {
          timingChart: {
            ...state.timingChart,
            stats: {
              totalEvents,
              eventsPerSecond: 0, // 別途計算が必要
              memoryUsage,
              renderTime: 0, // レンダリング時に更新
              lastUpdate: now,
            },
          },
        };
      }),

    cleanup: () =>
      set(state => {
        const { traces, timeWindow, settings } = state.timingChart;

        // 古いイベントを削除
        const cutoffTime = performance.now() - 60000; // 60秒前
        const cleanedTraces = traces.map(trace => ({
          ...trace,
          events: trace.events.filter(event => event.time > cutoffTime),
        }));

        return {
          timingChart: {
            ...state.timingChart,
            traces: cleanedTraces,
          },
        };
      }),
  },
});
