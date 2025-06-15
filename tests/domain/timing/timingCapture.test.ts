/**
 * タイミングイベント捕捉システムのテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CircuitTimingCapture, ClockTimingCapture } from '@/domain/timing/timingCapture';
import type { TimingEvent, TimeMs } from '@/types/timing';
import type { Gate, Circuit, ClockGate } from '@/types/circuit';
import type { EvaluationResult } from '@/domain/simulation/core/types';

// Performance.now のモック
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
});

// テスト用のモックデータ
const createMockGate = (id: string, output: boolean = false): Gate => ({
  id,
  type: 'AND',
  position: { x: 100, y: 100 },
  inputs: [false, false],
  output
});

const createMockClockGate = (id: string, output: boolean = false): ClockGate => ({
  id,
  type: 'CLOCK',
  position: { x: 100, y: 100 },
  inputs: [],
  output,
  metadata: { isRunning: true, period: 50 }
});

const createMockCircuit = (gates: Gate[]): Circuit => ({
  gates,
  wires: []
});

const createMockEvaluationResult = (circuit: Circuit): EvaluationResult => ({
  success: true,
  data: {
    circuit,
    evaluationStats: {
      gatesEvaluated: circuit.gates.length,
      wiresEvaluated: 0,
      evaluationTime: 1.5,
      cyclesDetected: 0
    }
  }
});

describe('CircuitTimingCapture', () => {
  let capture: CircuitTimingCapture;
  let onEventBatchSpy: ReturnType<typeof vi.fn>;
  let currentTime: number;

  beforeEach(() => {
    currentTime = 1000;
    mockPerformanceNow.mockReturnValue(currentTime);
    onEventBatchSpy = vi.fn();
    capture = new CircuitTimingCapture(onEventBatchSpy);
  });

  afterEach(() => {
    capture.destroy();
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期化時は有効状態', () => {
      const stats = capture.getStats();
      expect(stats.totalEvents).toBe(0);
      expect(stats.memoryUsage).toBe(0);
    });

    it('初期化時は監視ゲートなし', () => {
      const events = capture.getEvents();
      expect(events).toEqual([]);
    });
  });

  describe('ゲート監視', () => {
    it('watchGate: ゲートの監視を開始する', () => {
      capture.watchGate('gate_1', 'output', 0);
      
      // 監視状態を確認（内部的な状態なので直接確認は困難）
      // 代わりに、watchGateが呼ばれても例外が発生しないことを確認
      expect(() => {
        capture.watchGate('gate_1', 'input', 0);
        capture.watchGate('gate_2', 'output', 1);
      }).not.toThrow();
    });

    it('unwatchGate: ゲートの監視を停止する', () => {
      capture.watchGate('gate_1', 'output', 0);
      capture.watchGate('gate_1', 'input', 0);
      
      // 監視を停止
      capture.unwatchGate('gate_1');
      
      // 例外が発生しないことを確認
      expect(() => {
        capture.unwatchGate('gate_1');
      }).not.toThrow();
    });
  });

  describe('回路評価からのイベント捕捉', () => {
    it('captureFromEvaluation: 初回評価時は全ゲートの初期状態を記録', () => {
      const gate1 = createMockGate('gate_1', true);
      const gate2 = createMockGate('gate_2', false);
      const circuit = createMockCircuit([gate1, gate2]);
      const result = createMockEvaluationResult(circuit);

      const events = capture.captureFromEvaluation(result);

      expect(events).toHaveLength(2);
      
      expect(events[0]).toMatchObject({
        gateId: 'gate_1',
        pinType: 'output',
        pinIndex: 0,
        value: true,
        source: 'initial-state',
        time: currentTime
      });

      expect(events[1]).toMatchObject({
        gateId: 'gate_2',
        pinType: 'output',
        pinIndex: 0,
        value: false,
        source: 'initial-state',
        time: currentTime
      });
    });

    it('captureFromEvaluation: 出力変化を検出してイベントを生成', () => {
      const previousGate = createMockGate('gate_1', false);
      const currentGate = createMockGate('gate_1', true);
      
      const previousCircuit = createMockCircuit([previousGate]);
      const currentCircuit = createMockCircuit([currentGate]);
      const result = createMockEvaluationResult(currentCircuit);

      const events = capture.captureFromEvaluation(result, previousCircuit);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        gateId: 'gate_1',
        pinType: 'output',
        pinIndex: 0,
        value: true,
        previousValue: false,
        source: 'circuit-evaluation',
        time: currentTime
      });
    });

    it('captureFromEvaluation: 変化がない場合はイベントを生成しない', () => {
      const gate = createMockGate('gate_1', true);
      
      const previousCircuit = createMockCircuit([gate]);
      const currentCircuit = createMockCircuit([{ ...gate }]);
      const result = createMockEvaluationResult(currentCircuit);

      const events = capture.captureFromEvaluation(result, previousCircuit);

      expect(events).toHaveLength(0);
    });

    it('captureFromEvaluation: 失敗した評価結果は無視する', () => {
      const circuit = createMockCircuit([createMockGate('gate_1')]);
      const failedResult: EvaluationResult = {
        success: false,
        error: {
          type: 'EVALUATION_ERROR',
          message: 'Test error',
          code: 'TEST_ERROR'
        }
      };

      const events = capture.captureFromEvaluation(failedResult);

      expect(events).toHaveLength(0);
    });

    it('captureFromEvaluation: イベントバッファに送信される', () => {
      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);

      // バッファのフラッシュを待つ（非同期処理）
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(onEventBatchSpy).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                gateId: 'gate_1',
                value: true
              })
            ])
          );
          resolve();
        }, 20); // flushInterval(16ms)より少し長く待つ
      });
    });
  });

  describe('CLOCKゲートのイベント捕捉', () => {
    it('captureClockEvents: CLOCK状態の変化を記録', () => {
      const clockGate = createMockClockGate('clock_1', true);
      
      // 最初の監視設定
      capture.watchGate('clock_1', 'output', 0);
      
      // 最初の呼び出しで初期状態を設定（lastValueがundefinedなので変化として検出される）
      const events = capture.captureClockEvents([clockGate]);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        gateId: 'clock_1',
        pinType: 'output',
        pinIndex: 0,
        value: true,
        source: 'clock-tick',
        time: currentTime
      });
    });

    it('captureClockEvents: 変化がない場合はイベントを生成しない', () => {
      const clockGate = createMockClockGate('clock_1', true);
      
      capture.watchGate('clock_1', 'output', 0);
      
      // 最初の呼び出し
      capture.captureClockEvents([clockGate]);
      
      // 同じ状態での2回目の呼び出し
      const events = capture.captureClockEvents([clockGate]);

      expect(events).toHaveLength(0);
    });

    it('captureClockEvents: 無効状態では動作しない', () => {
      capture.setEnabled(false);
      const clockGate = createMockClockGate('clock_1', true);
      
      const events = capture.captureClockEvents([clockGate]);

      expect(events).toHaveLength(0);
    });
  });

  describe('イベント履歴管理', () => {
    it('getEvents: 全イベントを取得', async () => {
      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);

      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));

      const events = capture.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].gateId).toBe('gate_1');
    });

    it('getEvents: 時間範囲でフィルタリング', async () => {
      // 個別の時刻でイベントを生成（previousStateなしなので初期状態として記録される）
      mockPerformanceNow.mockReturnValueOnce(100);
      const gate1 = createMockGate('gate_1', true);
      const circuit1 = createMockCircuit([gate1]);
      const result1 = createMockEvaluationResult(circuit1);
      capture.captureFromEvaluation(result1);

      mockPerformanceNow.mockReturnValueOnce(200);
      const gate2 = createMockGate('gate_2', true);
      const circuit2 = createMockCircuit([gate2]); // gate2のみ
      const result2 = createMockEvaluationResult(circuit2);
      capture.captureFromEvaluation(result2);

      mockPerformanceNow.mockReturnValueOnce(300);
      const gate3 = createMockGate('gate_3', true);
      const circuit3 = createMockCircuit([gate3]); // gate3のみ
      const result3 = createMockEvaluationResult(circuit3);
      capture.captureFromEvaluation(result3);

      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));

      // 150-250の範囲でフィルタ
      const filteredEvents = capture.getEvents(150, 250);
      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0].time).toBe(200);
      expect(filteredEvents[0].gateId).toBe('gate_2');
    });

    it('clearEvents: 全イベントをクリア', async () => {
      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);
      
      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(capture.getEvents()).toHaveLength(1);

      capture.clearEvents();
      expect(capture.getEvents()).toHaveLength(0);
    });

    it('clearEvents: 指定時刻より前のイベントをクリア', async () => {
      // 時刻100でイベント生成
      mockPerformanceNow.mockReturnValueOnce(100);
      const gate1 = createMockGate('gate_1', true);
      const circuit1 = createMockCircuit([gate1]);
      const result1 = createMockEvaluationResult(circuit1);
      capture.captureFromEvaluation(result1);

      // 時刻200でイベント生成（個別の回路で）
      mockPerformanceNow.mockReturnValueOnce(200);
      const gate2 = createMockGate('gate_2', true);
      const circuit2 = createMockCircuit([gate2]); // gate2のみ
      const result2 = createMockEvaluationResult(circuit2);
      capture.captureFromEvaluation(result2);

      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));

      // 時刻150より前をクリア
      capture.clearEvents(150);
      
      const remainingEvents = capture.getEvents();
      expect(remainingEvents).toHaveLength(1);
      expect(remainingEvents[0].time).toBe(200);
      expect(remainingEvents[0].gateId).toBe('gate_2');
    });
  });

  describe('統計情報', () => {
    it('getStats: イベント統計を取得', async () => {
      // 複数のイベントを生成してメモリ使用量を計測可能にする
      const gate1 = createMockGate('gate_1', true);
      const gate2 = createMockGate('gate_2', true);
      const gate3 = createMockGate('gate_3', true);
      const gate4 = createMockGate('gate_4', true);
      const gate5 = createMockGate('gate_5', true);
      const gate6 = createMockGate('gate_6', true);
      
      const circuit = createMockCircuit([gate1, gate2, gate3, gate4, gate5, gate6]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);

      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));

      const stats = capture.getStats();
      expect(stats.totalEvents).toBe(6);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.eventsPerSecond).toBeGreaterThanOrEqual(0);
    });

    it('getStats: 直近1秒のイベント数を計算', async () => {
      const gate = createMockGate('gate_1');
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      // 現在時刻から500ms前のイベント
      mockPerformanceNow.mockReturnValue(currentTime - 500);
      capture.captureFromEvaluation(result);

      // 現在時刻から2秒前のイベント（範囲外）
      mockPerformanceNow.mockReturnValue(currentTime - 2000);
      capture.captureFromEvaluation(result);

      // バッファのフラッシュを待つ
      await new Promise(resolve => setTimeout(resolve, 20));

      // 現在時刻
      mockPerformanceNow.mockReturnValue(currentTime);

      const stats = capture.getStats();
      expect(stats.eventsPerSecond).toBe(1); // 直近1秒以内は1つのみ
    });
  });

  describe('有効/無効制御', () => {
    it('setEnabled: 無効化すると新しいイベントを捕捉しない', () => {
      capture.setEnabled(false);

      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      const events = capture.captureFromEvaluation(result);
      expect(events).toHaveLength(0);
    });

    it('setEnabled: 無効化時にバッファをフラッシュ', () => {
      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);
      capture.setEnabled(false);

      // フラッシュによりコールバックが即座に呼ばれる
      expect(onEventBatchSpy).toHaveBeenCalled();
    });
  });

  describe('リソース管理', () => {
    it('destroy: リソースを適切にクリーンアップ', () => {
      const gate = createMockGate('gate_1', true);
      const circuit = createMockCircuit([gate]);
      const result = createMockEvaluationResult(circuit);

      capture.captureFromEvaluation(result);
      capture.watchGate('gate_1', 'output', 0);

      expect(() => capture.destroy()).not.toThrow();

      // destroy後は空の結果を返す
      expect(capture.getEvents()).toHaveLength(0);
      expect(capture.getStats().totalEvents).toBe(0);
    });
  });
});

describe('ClockTimingCapture', () => {
  let clockCapture: ClockTimingCapture;

  beforeEach(() => {
    clockCapture = new ClockTimingCapture();
  });

  describe('CLOCK周期検出', () => {
    it('detectClockPeriod: 立ち上がりエッジから周期を計算', () => {
      const clockEvents: TimingEvent[] = [
        {
          id: 'e1',
          time: 100,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true, // 立ち上がり
          source: 'clock-tick'
        },
        {
          id: 'e2',
          time: 150,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true, // 立ち上がり
          source: 'clock-tick'
        },
        {
          id: 'e3',
          time: 200,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true, // 立ち上がり
          source: 'clock-tick'
        }
      ];

      const period = clockCapture.detectClockPeriod(clockEvents);
      expect(period).toBe(50); // (150-100 + 200-150) / 2 = 50
    });

    it('detectClockPeriod: 立ち上がりエッジが不足の場合はデフォルト値', () => {
      const clockEvents: TimingEvent[] = [
        {
          id: 'e1',
          time: 100,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'clock-tick'
        }
      ];

      const period = clockCapture.detectClockPeriod(clockEvents);
      expect(period).toBe(50); // デフォルト値
    });

    it('detectClockPeriod: CLOCKイベントがない場合はデフォルト値', () => {
      const nonClockEvents: TimingEvent[] = [
        {
          id: 'e1',
          time: 100,
          gateId: 'gate1',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'circuit-evaluation'
        }
      ];

      const period = clockCapture.detectClockPeriod(nonClockEvents);
      expect(period).toBe(50); // デフォルト値
    });
  });

  describe('同期マーカー生成', () => {
    it('generateSyncMarkers: 指定された時間窓内に同期マーカーを生成', () => {
      const clockEvents: TimingEvent[] = [
        {
          id: 'e1',
          time: 0,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'clock-tick'
        },
        {
          id: 'e2',
          time: 100,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'clock-tick'
        }
      ];

      const timeWindow = { start: 0, end: 300 };
      const markers = clockCapture.generateSyncMarkers(clockEvents, timeWindow);

      expect(markers.length).toBeGreaterThan(0);
      
      // 各マーカーが時間窓内にある
      markers.forEach(marker => {
        expect(marker.time).toBeGreaterThanOrEqual(timeWindow.start);
        expect(marker.time).toBeLessThanOrEqual(timeWindow.end);
        expect(marker.source).toBe('sync-marker');
        expect(marker.gateId).toBe('sync_marker');
      });
    });

    it('generateSyncMarkers: 周期に基づいて等間隔でマーカーを配置', () => {
      const clockEvents: TimingEvent[] = [
        {
          id: 'e1',
          time: 0,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'clock-tick'
        },
        {
          id: 'e2',
          time: 50,
          gateId: 'clock',
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'clock-tick'
        }
      ];

      const timeWindow = { start: 0, end: 150 };
      const markers = clockCapture.generateSyncMarkers(clockEvents, timeWindow);

      // 50ms間隔で配置される
      const expectedTimes = [0, 50, 100, 150];
      expect(markers.map(m => m.time)).toEqual(expectedTimes);
    });
  });
});