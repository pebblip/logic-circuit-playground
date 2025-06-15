/**
 * タイミングチャートユーティリティ関数のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  timingChartUtils,
  timeScaleToNumber,
  isValidTimeWindow,
  getGateType,
  isClockGate,
  generateTraceNameFromGate,
  getClockTraceColor,
  sortEventsByTime,
  deduplicateEvents,
  filterEventsInTimeWindow,
  calculateEventStats,
  estimateMemoryUsage,
  debugTrace
} from '@/utils/timingChart';
import type { TimingTrace, TimingEvent, TimeScale } from '@/types/timing';
import type { Gate, ClockGate } from '@/types/circuit';

// console.log のモック
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleGroup = vi.spyOn(console, 'group').mockImplementation(() => {});
const mockConsoleGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

// テスト用のモックデータ
const createMockGate = (id: string, type: string = 'AND'): Gate => ({
  id,
  type: type as any,
  position: { x: 100, y: 100 },
  inputs: [false, false],
  output: false
});

const createMockClockGate = (id: string): ClockGate => ({
  id,
  type: 'CLOCK',
  position: { x: 100, y: 100 },
  inputs: [],
  output: false,
  metadata: { isRunning: true, period: 50 }
});

const createMockTimingEvent = (
  id: string, 
  time: number, 
  gateId: string, 
  value: boolean
): TimingEvent => ({
  id,
  time,
  gateId,
  pinType: 'output',
  pinIndex: 0,
  value,
  source: 'test'
});

const createMockTrace = (id: string, gateId: string, events: TimingEvent[] = []): TimingTrace => ({
  id,
  gateId,
  pinType: 'output',
  pinIndex: 0,
  name: `${gateId}_OUT`,
  color: '#00ff88',
  visible: true,
  events
});

describe('timingChartUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ID生成', () => {
    it('generateEventId: ユニークなイベントIDを生成', () => {
      const id1 = timingChartUtils.generateEventId();
      const id2 = timingChartUtils.generateEventId();
      
      expect(id1).toMatch(/^event_\d+_\d+$/);
      expect(id2).toMatch(/^event_\d+_\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('generateTraceId: ユニークなトレースIDを生成', () => {
      const id1 = timingChartUtils.generateTraceId();
      const id2 = timingChartUtils.generateTraceId();
      
      expect(id1).toMatch(/^trace_\d+_\d+$/);
      expect(id2).toMatch(/^trace_\d+_\d+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('トレース名生成', () => {
    it('generateTraceName: 出力ピンの名前を生成', () => {
      const name = timingChartUtils.generateTraceName('gate_123', 'output', 0);
      expect(name).toBe('123'); // 出力ピンはサフィックスなし
    });

    it('generateTraceName: 入力ピンの名前を生成（インデックス0）', () => {
      const name = timingChartUtils.generateTraceName('gate_456', 'input', 0);
      expect(name).toBe('456_IN');
    });

    it('generateTraceName: 入力ピンの名前を生成（インデックス1以上）', () => {
      const name = timingChartUtils.generateTraceName('gate_789', 'input', 2);
      expect(name).toBe('789_IN2');
    });

    it('generateTraceName: gate_プレフィックスを除去', () => {
      const name1 = timingChartUtils.generateTraceName('gate_test', 'output', 0);
      const name2 = timingChartUtils.generateTraceName('test', 'output', 0);
      
      expect(name1).toBe('test'); // 出力ピンはサフィックスなし
      expect(name2).toBe('test'); // 出力ピンはサフィックスなし
    });
  });

  describe('色割り当て', () => {
    it('assignTraceColor: トレース数に基づいて色を循環割り当て', () => {
      const color0 = timingChartUtils.assignTraceColor(0);
      const color1 = timingChartUtils.assignTraceColor(1);
      const color8 = timingChartUtils.assignTraceColor(8); // 循環
      
      expect(color0).toBe('#00ff88'); // 最初の色
      expect(color1).toBe('#88ddff'); // 2番目の色
      expect(color8).toBe(color0);    // 8色で循環
    });

    it('assignTraceColor: 大きな数値でも正常に動作', () => {
      const color = timingChartUtils.assignTraceColor(100);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('時間フォーマット', () => {
    it('formatTime: μs単位でフォーマット', () => {
      const formatted = timingChartUtils.formatTime(1.5, 'us');
      expect(formatted).toBe('1500.0μs');
    });

    it('formatTime: ms単位でフォーマット', () => {
      const formatted = timingChartUtils.formatTime(123.456, 'ms');
      expect(formatted).toBe('123.5ms');
    });

    it('formatTime: s単位でフォーマット', () => {
      const formatted = timingChartUtils.formatTime(2500, 's');
      expect(formatted).toBe('2.500s');
    });

    it('formatTime: 未知のスケールはmsとして扱う', () => {
      const formatted = timingChartUtils.formatTime(100, 'unknown' as TimeScale);
      expect(formatted).toBe('100.0ms');
    });
  });

  describe('信号値計算', () => {
    it('calculateSignalValuesAtTime: 指定時刻での信号値を計算', () => {
      const events = [
        createMockTimingEvent('e1', 100, 'gate_1', false),
        createMockTimingEvent('e2', 200, 'gate_1', true),
        createMockTimingEvent('e3', 300, 'gate_1', false)
      ];
      
      const trace = createMockTrace('trace_1', 'gate_1', events);
      const values = timingChartUtils.calculateSignalValuesAtTime([trace], 250);
      
      expect(values['trace_1']).toBe(true); // 時刻250では200のイベント（true）が最新
    });

    it('calculateSignalValuesAtTime: イベントがない場合はデフォルト値', () => {
      const trace = createMockTrace('trace_1', 'gate_1', []);
      const values = timingChartUtils.calculateSignalValuesAtTime([trace], 100);
      
      expect(values['trace_1']).toBe(false); // デフォルト値
    });

    it('calculateSignalValuesAtTime: 指定時刻より前のイベントがない場合', () => {
      const events = [createMockTimingEvent('e1', 200, 'gate_1', true)];
      const trace = createMockTrace('trace_1', 'gate_1', events);
      const values = timingChartUtils.calculateSignalValuesAtTime([trace], 100);
      
      expect(values['trace_1']).toBe(false); // デフォルト値
    });

    it('calculateSignalValuesAtTime: 複数のトレースを同時に計算', () => {
      const trace1 = createMockTrace('trace_1', 'gate_1', [
        createMockTimingEvent('e1', 100, 'gate_1', true)
      ]);
      
      const trace2 = createMockTrace('trace_2', 'gate_2', [
        createMockTimingEvent('e2', 150, 'gate_2', false)
      ]);
      
      const values = timingChartUtils.calculateSignalValuesAtTime([trace1, trace2], 200);
      
      expect(values['trace_1']).toBe(true);
      expect(values['trace_2']).toBe(false);
    });
  });
});

describe('ユーティリティ関数', () => {
  describe('timeScaleToNumber', () => {
    it('時間スケールを数値に変換', () => {
      expect(timeScaleToNumber('us')).toBe(0.001);
      expect(timeScaleToNumber('ms')).toBe(1);
      expect(timeScaleToNumber('s')).toBe(1000);
    });

    it('未知のスケールはmsとして扱う', () => {
      expect(timeScaleToNumber('unknown' as TimeScale)).toBe(1);
    });
  });

  describe('isValidTimeWindow', () => {
    it('有効な時間窓を判定', () => {
      expect(isValidTimeWindow(0, 100)).toBe(true);
      expect(isValidTimeWindow(50, 150)).toBe(true);
    });

    it('無効な時間窓を判定', () => {
      expect(isValidTimeWindow(100, 50)).toBe(false);  // 終了 < 開始
      expect(isValidTimeWindow(-10, 50)).toBe(false);  // 負の開始時刻
      expect(isValidTimeWindow(100, 100)).toBe(false); // 同じ値
      expect(isValidTimeWindow(0, 0.05)).toBe(false);  // 幅が小さすぎる
    });
  });

  describe('getGateType', () => {
    it('ゲートのタイプを取得', () => {
      const gate = createMockGate('gate_1', 'OR');
      expect(getGateType(gate)).toBe('OR');
    });

    it('type プロパティがない場合はUNKNOWN', () => {
      const invalidGate = { id: 'gate_1' } as Gate;
      expect(getGateType(invalidGate)).toBe('UNKNOWN');
    });
  });

  describe('isClockGate', () => {
    it('CLOCKゲートを判定', () => {
      const clockGate = createMockClockGate('clock_1');
      expect(isClockGate(clockGate)).toBe(true);
    });

    it('通常のゲートは false', () => {
      const normalGate = createMockGate('gate_1', 'AND');
      expect(isClockGate(normalGate)).toBe(false);
    });
  });

  describe('generateTraceNameFromGate', () => {
    it('通常ゲートの出力名を生成', () => {
      const gate = createMockGate('gate_123', 'AND');
      const name = generateTraceNameFromGate(gate, 'output', 0);
      expect(name).toBe('AND_123');
    });

    it('通常ゲートの入力名を生成', () => {
      const gate = createMockGate('gate_456', 'OR');
      const name1 = generateTraceNameFromGate(gate, 'input', 0);
      const name2 = generateTraceNameFromGate(gate, 'input', 1);
      
      expect(name1).toBe('OR_456_IN');
      expect(name2).toBe('OR_456_IN_1');
    });

    it('CLOCKゲートは特別な名前', () => {
      const clockGate = createMockClockGate('clock_1');
      const name = generateTraceNameFromGate(clockGate, 'output', 0);
      expect(name).toBe('CLK');
    });
  });

  describe('getClockTraceColor', () => {
    it('CLOCK専用色を返す', () => {
      const color = getClockTraceColor();
      expect(color).toBe('#00ff88'); // プライマリグリーン
    });
  });

  describe('sortEventsByTime', () => {
    it('イベントを時刻順にソート', () => {
      const events = [
        createMockTimingEvent('e1', 300, 'gate_1', true),
        createMockTimingEvent('e2', 100, 'gate_1', false),
        createMockTimingEvent('e3', 200, 'gate_1', true)
      ];
      
      const sorted = sortEventsByTime(events);
      
      expect(sorted.map(e => e.time)).toEqual([100, 200, 300]);
      expect(sorted.map(e => e.id)).toEqual(['e2', 'e3', 'e1']);
    });

    it('元の配列を変更しない', () => {
      const original = [
        createMockTimingEvent('e1', 300, 'gate_1', true),
        createMockTimingEvent('e2', 100, 'gate_1', false)
      ];
      
      const sorted = sortEventsByTime(original);
      
      expect(original[0].time).toBe(300); // 元の配列は変更されない
      expect(sorted[0].time).toBe(100);   // ソート済み配列
    });
  });

  describe('deduplicateEvents', () => {
    it('重複するイベントを除去', () => {
      const events = [
        createMockTimingEvent('e1', 100, 'gate_1', true),
        createMockTimingEvent('e2', 100, 'gate_1', true), // 重複
        createMockTimingEvent('e3', 200, 'gate_1', false)
      ];
      
      const deduplicated = deduplicateEvents(events);
      
      expect(deduplicated).toHaveLength(2);
      expect(deduplicated.map(e => e.id)).toEqual(['e1', 'e3']);
    });

    it('完全に同じ条件のイベントのみ重複とみなす', () => {
      const events = [
        createMockTimingEvent('e1', 100, 'gate_1', true),
        createMockTimingEvent('e2', 100, 'gate_2', true), // 異なるゲート
        createMockTimingEvent('e3', 200, 'gate_1', true), // 異なる時刻
        createMockTimingEvent('e4', 100, 'gate_1', false) // 異なる値
      ];
      
      const deduplicated = deduplicateEvents(events);
      
      expect(deduplicated).toHaveLength(4); // 全て異なる
    });
  });

  describe('filterEventsInTimeWindow', () => {
    it('時間窓内のイベントのみを抽出', () => {
      const events = [
        createMockTimingEvent('e1', 50, 'gate_1', true),   // 範囲外（前）
        createMockTimingEvent('e2', 100, 'gate_1', false), // 範囲内
        createMockTimingEvent('e3', 200, 'gate_1', true),  // 範囲内
        createMockTimingEvent('e4', 300, 'gate_1', false)  // 範囲外（後）
      ];
      
      const filtered = filterEventsInTimeWindow(events, { start: 100, end: 250 });
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.id)).toEqual(['e2', 'e3']);
    });

    it('境界値を含む', () => {
      const events = [
        createMockTimingEvent('e1', 100, 'gate_1', true),  // 開始時刻
        createMockTimingEvent('e2', 150, 'gate_1', false),
        createMockTimingEvent('e3', 200, 'gate_1', true)   // 終了時刻
      ];
      
      const filtered = filterEventsInTimeWindow(events, { start: 100, end: 200 });
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('calculateEventStats', () => {
    it('イベント統計を計算', () => {
      const events = [
        createMockTimingEvent('e1', 50, 'gate_1', true),   // 窓外
        createMockTimingEvent('e2', 100, 'gate_1', false), // 窓内
        createMockTimingEvent('e3', 150, 'gate_1', true),  // 窓内
        createMockTimingEvent('e4', 250, 'gate_1', false)  // 窓外
      ];
      
      const timeWindow = { start: 100, end: 200 };
      const stats = calculateEventStats(events, timeWindow);
      
      expect(stats.totalEvents).toBe(4);
      expect(stats.eventsInWindow).toBe(2);
      expect(stats.timeSpan).toBe(100);
      expect(stats.eventsPerSecond).toBe(20); // 2イベント / 0.1秒 = 20
    });
  });

  describe('estimateMemoryUsage', () => {
    it('メモリ使用量を推定', () => {
      const traces = [
        createMockTrace('trace_1', 'gate_1', [
          createMockTimingEvent('e1', 100, 'gate_1', true),
          createMockTimingEvent('e2', 200, 'gate_1', false)
        ]),
        createMockTrace('trace_2', 'gate_2', [
          createMockTimingEvent('e3', 150, 'gate_2', true)
        ])
      ];
      
      const usage = estimateMemoryUsage(traces);
      
      // 2つのトレース（各500バイト） + 3つのイベント（各200バイト） = 1600バイト = 約1.6KB
      expect(usage).toBe(2); // KB単位で四捨五入
    });

    it('空のトレースリストは0KB', () => {
      const usage = estimateMemoryUsage([]);
      expect(usage).toBe(0);
    });
  });

  describe('debugTrace', () => {
    it('トレース情報をコンソールに出力', () => {
      const trace = createMockTrace('trace_1', 'gate_1', [
        createMockTimingEvent('e1', 100, 'gate_1', true),
        createMockTimingEvent('e2', 200, 'gate_1', false)
      ]);
      
      debugTrace(trace);
      
      expect(mockConsoleGroup).toHaveBeenCalledWith('🔍 Timing Trace Debug: gate_1_OUT');
      expect(mockConsoleLog).toHaveBeenCalledWith('Trace ID:', 'trace_1');
      expect(mockConsoleLog).toHaveBeenCalledWith('Gate ID:', 'gate_1');
      expect(mockConsoleLog).toHaveBeenCalledWith('Events:', 2);
      expect(mockConsoleGroupEnd).toHaveBeenCalled();
    });

    it('イベントがない場合も正常に動作', () => {
      const trace = createMockTrace('trace_1', 'gate_1', []);
      
      expect(() => debugTrace(trace)).not.toThrow();
      expect(mockConsoleLog).toHaveBeenCalledWith('Events:', 0);
    });
  });
});