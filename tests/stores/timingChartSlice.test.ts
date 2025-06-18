/**
 * タイミングチャートZustand storeのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createTimingChartSlice, type TimingChartSlice } from '@/stores/slices/timingChartSlice';
import type { TimingEvent, TimingTrace } from '@/types/timing';
import type { Gate } from '@/types/circuit';

// テスト用のstore作成
const createTestStore = () => {
  return create<TimingChartSlice>()((...a) => ({
    ...createTimingChartSlice(...a)
  }));
};

// テスト用のモックデータ
const mockGate: Gate = {
  id: 'gate_1',
  type: 'AND',
  position: { x: 100, y: 100 },
  inputs: [false, false],
  output: false
};

const mockTimingEvent: TimingEvent = {
  id: 'event_1',
  time: 100,
  gateId: 'gate_1',
  pinType: 'output',
  pinIndex: 0,
  value: true,
  previousValue: false,
  source: 'test'
};

describe('TimingChartSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const state = store.getState();
      
      expect(state.timingChart.isVisible).toBe(false);
      expect(state.timingChart.panelHeight).toBe(250);
      expect(state.timingChart.traces).toEqual([]);
      expect(state.timingChart.timeWindow).toEqual({ start: 0, end: 3000 });
      expect(state.timingChart.timeScale).toBe('ms');
      expect(state.timingChart.maxTraces).toBe(10);
      expect(state.timingChart.isPaused).toBe(false);
    });

    it('設定のデフォルト値が正しい', () => {
      const { settings } = store.getState().timingChart;
      
      expect(settings.theme).toBe('dark');
      expect(settings.gridVisible).toBe(true);
      expect(settings.clockHighlightEnabled).toBe(true);
      expect(settings.autoCapture).toBe(true);
      expect(settings.captureDepth).toBe(10000);
      expect(settings.updateInterval).toBe(16);
    });
  });

  describe('パネル制御', () => {
    it('togglePanel: パネルの表示/非表示を切り替える', () => {
      const { timingChartActions } = store.getState();
      
      // 初期状態は非表示
      expect(store.getState().timingChart.isVisible).toBe(false);
      
      // 表示に切り替え
      timingChartActions.togglePanel();
      expect(store.getState().timingChart.isVisible).toBe(true);
      
      // 非表示に切り替え
      timingChartActions.togglePanel();
      expect(store.getState().timingChart.isVisible).toBe(false);
    });

    it('showPanel: パネルを表示する', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.showPanel();
      expect(store.getState().timingChart.isVisible).toBe(true);
    });

    it('hidePanel: パネルを非表示にする', () => {
      const { timingChartActions } = store.getState();
      
      // まず表示状態にする
      timingChartActions.showPanel();
      expect(store.getState().timingChart.isVisible).toBe(true);
      
      // 非表示にする
      timingChartActions.hidePanel();
      expect(store.getState().timingChart.isVisible).toBe(false);
    });

    it('setPanelHeight: パネル高さを設定する（200-600pxの範囲）', () => {
      const { timingChartActions } = store.getState();
      
      // 正常な値
      timingChartActions.setPanelHeight(400);
      expect(store.getState().timingChart.panelHeight).toBe(400);
      
      // 最小値未満は200にクランプ
      timingChartActions.setPanelHeight(100);
      expect(store.getState().timingChart.panelHeight).toBe(200);
      
      // 最大値超過は600にクランプ
      timingChartActions.setPanelHeight(800);
      expect(store.getState().timingChart.panelHeight).toBe(600);
    });
  });

  describe('トレース管理', () => {
    it('addTrace: 新しいトレースを追加する', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      
      expect(traceId).toBeTruthy();
      const traces = store.getState().timingChart.traces;
      expect(traces).toHaveLength(1);
      expect(traces[0].gateId).toBe('gate_1');
      expect(traces[0].pinType).toBe('output');
      expect(traces[0].pinIndex).toBe(0);
      expect(traces[0].visible).toBe(true);
      expect(traces[0].events).toEqual([]);
    });

    it('addTrace: 重複するトレースは追加されない', () => {
      const { timingChartActions } = store.getState();
      
      // 最初の追加
      const traceId1 = timingChartActions.addTrace('gate_1', 'output', 0);
      expect(traceId1).toBeTruthy();
      expect(store.getState().timingChart.traces).toHaveLength(1);
      
      // 同じトレースの追加（拒否される）
      const traceId2 = timingChartActions.addTrace('gate_1', 'output', 0);
      expect(traceId2).toBeNull();
      expect(store.getState().timingChart.traces).toHaveLength(1);
    });

    it('addTrace: 最大トレース数を超過しない', () => {
      const { timingChartActions } = store.getState();
      
      // maxTraces数まで追加
      for (let i = 0; i < 10; i++) {
        const traceId = timingChartActions.addTrace(`gate_${i}`, 'output', 0);
        expect(traceId).toBeTruthy();
      }
      
      expect(store.getState().timingChart.traces).toHaveLength(10);
      
      // 11個目は拒否される
      const traceId = timingChartActions.addTrace('gate_11', 'output', 0);
      expect(traceId).toBeNull();
      expect(store.getState().timingChart.traces).toHaveLength(10);
    });

    it('addTraceFromGate: ゲートオブジェクトからトレースを追加', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTraceFromGate(mockGate, 'output', 0);
      
      expect(traceId).toBeTruthy();
      const traces = store.getState().timingChart.traces;
      expect(traces).toHaveLength(1);
      expect(traces[0].gateId).toBe('gate_1');
      expect(traces[0].metadata?.gateType).toBe('AND');
    });

    it('removeTrace: トレースを削除する', () => {
      const { timingChartActions } = store.getState();
      
      // トレースを追加
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      expect(store.getState().timingChart.traces).toHaveLength(1);
      
      // トレースを削除
      timingChartActions.removeTrace(traceId!);
      expect(store.getState().timingChart.traces).toHaveLength(0);
    });

    it('updateTraceColor: トレースの色を変更する', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      const initialColor = store.getState().timingChart.traces[0].color;
      
      // 色を変更
      timingChartActions.updateTraceColor(traceId!, '#ff0000');
      
      const trace = store.getState().timingChart.traces[0];
      expect(trace.color).toBe('#ff0000');
      expect(trace.color).not.toBe(initialColor);
    });

    it('toggleTraceVisibility: トレースの表示/非表示を切り替える', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      
      // 初期状態は表示
      expect(store.getState().timingChart.traces[0].visible).toBe(true);
      
      // 非表示に切り替え
      timingChartActions.toggleTraceVisibility(traceId!);
      expect(store.getState().timingChart.traces[0].visible).toBe(false);
      
      // 表示に切り替え
      timingChartActions.toggleTraceVisibility(traceId!);
      expect(store.getState().timingChart.traces[0].visible).toBe(true);
    });

    it('clearAllTraces: 全トレースを削除する', () => {
      const { timingChartActions } = store.getState();
      
      // 複数のトレースを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.addTrace('gate_2', 'output', 0);
      expect(store.getState().timingChart.traces).toHaveLength(2);
      
      // 全削除
      timingChartActions.clearAllTraces();
      expect(store.getState().timingChart.traces).toHaveLength(0);
    });
  });

  describe('時間軸制御', () => {
    it('setTimeWindow: 有効な時間窓を設定する', () => {
      const { timingChartActions } = store.getState();
      
      const newWindow = { start: 100, end: 500 };
      timingChartActions.setTimeWindow(newWindow);
      
      expect(store.getState().timingChart.timeWindow).toEqual(newWindow);
    });

    it('setTimeWindow: 無効な時間窓は設定されない', () => {
      const { timingChartActions } = store.getState();
      const initialWindow = store.getState().timingChart.timeWindow;
      
      // 終了時刻が開始時刻より前
      timingChartActions.setTimeWindow({ start: 500, end: 100 });
      expect(store.getState().timingChart.timeWindow).toEqual(initialWindow);
      
      // 負の開始時刻
      timingChartActions.setTimeWindow({ start: -100, end: 500 });
      expect(store.getState().timingChart.timeWindow).toEqual(initialWindow);
    });

    it('setTimeScale: 時間スケールを変更する', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.setTimeScale('us');
      expect(store.getState().timingChart.timeScale).toBe('us');
      
      timingChartActions.setTimeScale('s');
      expect(store.getState().timingChart.timeScale).toBe('s');
    });

    it('zoomIn: 時間窓を縮小する', () => {
      const { timingChartActions } = store.getState();
      
      // 初期状態: start=0, end=1000, width=1000
      const initialWindow = store.getState().timingChart.timeWindow;
      const initialWidth = initialWindow.end - initialWindow.start;
      
      timingChartActions.zoomIn();
      
      const newWindow = store.getState().timingChart.timeWindow;
      const newWidth = newWindow.end - newWindow.start;
      
      // ズームイン後は幅が小さくなる（70%）
      expect(newWidth).toBeLessThan(initialWidth);
      expect(newWidth).toBeCloseTo(initialWidth * 0.7, 1);
    });

    it('zoomOut: 時間窓を拡大する', () => {
      const { timingChartActions } = store.getState();
      
      const initialWindow = store.getState().timingChart.timeWindow;
      const initialWidth = initialWindow.end - initialWindow.start;
      
      timingChartActions.zoomOut();
      
      const newWindow = store.getState().timingChart.timeWindow;
      const newWidth = newWindow.end - newWindow.start;
      
      // ズームアウト後は幅が大きくなる（150%）
      expect(newWidth).toBeGreaterThan(initialWidth);
      expect(newWidth).toBeCloseTo(initialWidth * 1.5, 1);
    });

    it('panTo: 指定時刻を中心に移動する', () => {
      const { timingChartActions } = store.getState();
      
      const centerTime = 1500; // 初期ウィンドウ幅（3000）で中央に配置可能な値
      timingChartActions.panTo(centerTime);
      
      const window = store.getState().timingChart.timeWindow;
      const actualCenter = (window.start + window.end) / 2;
      
      expect(actualCenter).toBeCloseTo(centerTime, 1);
    });

    it('resetView: 初期状態にリセットする', () => {
      const { timingChartActions } = store.getState();
      
      // 設定を変更
      timingChartActions.setTimeWindow({ start: 100, end: 500 });
      timingChartActions.setTimeScale('us');
      
      // リセット
      timingChartActions.resetView();
      
      const state = store.getState().timingChart;
      expect(state.timeWindow).toEqual({ start: 0, end: 3000 });
      expect(state.timeScale).toBe('ms');
    });
  });

  describe('イベント処理', () => {
    it('processTimingEvents: 該当するトレースにイベントを追加する', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除
      timingChartActions.resumeCapture();
      
      // デバウンス処理をリセット
      (window as any).__lastTimingEventProcess = 0;
      
      // トレースを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      
      // イベントを処理
      const events = [mockTimingEvent];
      timingChartActions.processTimingEvents(events);
      
      const trace = store.getState().timingChart.traces[0];
      expect(trace.events).toHaveLength(1);
      expect(trace.events[0]).toEqual(mockTimingEvent);
    });

    it('processTimingEvents: 該当しないイベントは無視される', () => {
      const { timingChartActions } = store.getState();
      
      // 異なるゲートのトレースを追加
      timingChartActions.addTrace('gate_2', 'output', 0);
      
      // gate_1のイベントを処理
      const events = [mockTimingEvent];
      timingChartActions.processTimingEvents(events);
      
      const trace = store.getState().timingChart.traces[0];
      expect(trace.events).toHaveLength(0);
    });

    it('processTimingEvents: 容量制限が適用される', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除して確実にイベントが処理されるようにする
      timingChartActions.resumeCapture();
      
      // デバウンス処理をリセット
      (window as any).__lastTimingEventProcess = 0;
      
      // 容量制限を小さく設定
      timingChartActions.updateSettings({ captureDepth: 3 });
      
      // トレースを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      
      // 容量を超えるイベントを追加
      const events = [
        { ...mockTimingEvent, id: 'event_1', time: 100 },
        { ...mockTimingEvent, id: 'event_2', time: 200 },
        { ...mockTimingEvent, id: 'event_3', time: 300 },
        { ...mockTimingEvent, id: 'event_4', time: 400 },
        { ...mockTimingEvent, id: 'event_5', time: 500 },
      ];
      
      timingChartActions.processTimingEvents(events);
      
      const trace = store.getState().timingChart.traces[0];
      expect(trace.events).toHaveLength(3);
      // 最新の3つのイベントが保持される
      expect(trace.events[0].id).toBe('event_3');
      expect(trace.events[1].id).toBe('event_4');
      expect(trace.events[2].id).toBe('event_5');
    });

    it('addEventToTrace: 特定のトレースにイベントを追加する', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      
      timingChartActions.addEventToTrace(traceId!, mockTimingEvent);
      
      const trace = store.getState().timingChart.traces[0];
      expect(trace.events).toHaveLength(1);
      expect(trace.events[0]).toEqual(mockTimingEvent);
    });

    it('clearTraceEvents: トレースのイベントをクリアする', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.addEventToTrace(traceId!, mockTimingEvent);
      
      expect(store.getState().timingChart.traces[0].events).toHaveLength(1);
      
      timingChartActions.clearTraceEvents(traceId!);
      
      expect(store.getState().timingChart.traces[0].events).toHaveLength(0);
    });
  });

  describe('カーソル制御', () => {
    it('setCursor: カーソルを設定する', () => {
      const { timingChartActions } = store.getState();
      
      // トレースとイベントを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.processTimingEvents([mockTimingEvent]);
      
      // カーソルを設定
      timingChartActions.setCursor(150);
      
      const cursor = store.getState().timingChart.cursor;
      expect(cursor).toBeDefined();
      expect(cursor!.time).toBe(150);
      expect(cursor!.visible).toBe(true);
      expect(cursor!.signalValues).toBeDefined();
    });

    it('moveCursor: カーソルを移動する', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.setCursor(100);
      timingChartActions.moveCursor(50);
      
      const cursor = store.getState().timingChart.cursor;
      expect(cursor!.time).toBe(150);
    });

    it('hideCursor: カーソルを非表示にする', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.setCursor(100);
      expect(store.getState().timingChart.cursor).toBeDefined();
      
      timingChartActions.hideCursor();
      expect(store.getState().timingChart.cursor).toBeUndefined();
    });
  });

  describe('設定管理', () => {
    it('updateSettings: 設定を部分更新する', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.updateSettings({
        theme: 'light',
        gridVisible: false,
        updateInterval: 33
      });
      
      const settings = store.getState().timingChart.settings;
      expect(settings.theme).toBe('light');
      expect(settings.gridVisible).toBe(false);
      expect(settings.updateInterval).toBe(33);
      // 他の設定は変更されない
      expect(settings.clockHighlightEnabled).toBe(true);
    });

    it('resetSettings: 設定をデフォルトに戻す', () => {
      const { timingChartActions } = store.getState();
      
      // 設定を変更
      timingChartActions.updateSettings({ theme: 'light', gridVisible: false });
      
      // リセット
      timingChartActions.resetSettings();
      
      const settings = store.getState().timingChart.settings;
      expect(settings.theme).toBe('dark');
      expect(settings.gridVisible).toBe(true);
    });
  });

  describe('データ管理', () => {
    it('exportData: JSON形式でデータをエクスポートする', () => {
      const { timingChartActions } = store.getState();
      
      // テストデータを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.processTimingEvents([mockTimingEvent]);
      
      const jsonData = timingChartActions.exportData('json');
      const parsed = JSON.parse(jsonData);
      
      expect(parsed.traces).toHaveLength(1);
      expect(parsed.timeWindow).toBeDefined();
      expect(parsed.settings).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('exportData: CSV形式でデータをエクスポートする', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除
      timingChartActions.resumeCapture();
      
      // デバウンス処理をリセット
      (window as any).__lastTimingEventProcess = 0;
      
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.processTimingEvents([mockTimingEvent]);
      
      const csvData = timingChartActions.exportData('csv');
      const lines = csvData.split('\n');
      
      // ヘッダー行
      expect(lines[0]).toContain('Time(ms)');
      // 実際のトレース名（'1'）が含まれることを確認
      expect(lines[0]).toContain('1');
      
      // データ行
      expect(lines.length).toBeGreaterThan(1);
    });

    it('getTraceData: 特定のトレースを取得する', () => {
      const { timingChartActions } = store.getState();
      
      const traceId = timingChartActions.addTrace('gate_1', 'output', 0);
      
      const trace = timingChartActions.getTraceData(traceId!);
      expect(trace).toBeDefined();
      expect(trace!.gateId).toBe('gate_1');
      
      // 存在しないトレース
      const nonExistent = timingChartActions.getTraceData('invalid_id');
      expect(nonExistent).toBeNull();
    });

    it('getVisibleTraces: 表示中のトレースのみを取得する', () => {
      const { timingChartActions } = store.getState();
      
      const traceId1 = timingChartActions.addTrace('gate_1', 'output', 0);
      const traceId2 = timingChartActions.addTrace('gate_2', 'output', 0);
      
      // 1つを非表示にする
      timingChartActions.toggleTraceVisibility(traceId2!);
      
      const visibleTraces = timingChartActions.getVisibleTraces();
      expect(visibleTraces).toHaveLength(1);
      expect(visibleTraces[0].gateId).toBe('gate_1');
    });
  });

  describe('ユーティリティ', () => {
    it('updateStats: 統計情報を更新する', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除
      timingChartActions.resumeCapture();
      
      // デバウンス処理をリセット
      (window as any).__lastTimingEventProcess = 0;
      
      // データを追加
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.processTimingEvents([mockTimingEvent]);
      
      timingChartActions.updateStats();
      
      const stats = store.getState().timingChart.stats;
      expect(stats).toBeDefined();
      expect(stats!.totalEvents).toBe(1);
      expect(stats!.memoryUsage).toBeGreaterThan(0);
      expect(stats!.lastUpdate).toBeGreaterThan(0);
    });

    it('cleanup: 古いイベントをクリーンアップする', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除
      timingChartActions.resumeCapture();
      
      // デバウンス処理をリセット
      (window as any).__lastTimingEventProcess = 0;
      
      // 古いイベントを追加（現在時刻より1分以上前）
      const oldEvent = {
        ...mockTimingEvent,
        time: performance.now() - 70000 // 70秒前
      };
      
      timingChartActions.addTrace('gate_1', 'output', 0);
      timingChartActions.processTimingEvents([oldEvent]);
      
      expect(store.getState().timingChart.traces[0].events).toHaveLength(1);
      
      timingChartActions.cleanup();
      
      // 古いイベントは削除される
      expect(store.getState().timingChart.traces[0].events).toHaveLength(0);
    });
  });
});