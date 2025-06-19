/**
 * タイミングチャート波形問題の単体テスト診断
 * 問題：波形が直線のまま（イベント数は増加するが値が変化しない）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createTimingChartSlice, type TimingChartSlice } from '@/stores/slices/timingChartSlice';
import { CircuitTimingCapture } from '@/domain/timing/timingCapture';
import { GateFactory } from '@/models/gates/GateFactory';
import { evaluateGateUnified } from '@/domain/simulation/core/gateEvaluation';
import type { TimingEvent } from '@/types/timing';
import type { Gate } from '@/types/circuit';

// テスト用のstore作成
const createTestStore = () => {
  return create<TimingChartSlice>()((...a) => ({
    ...createTimingChartSlice(...a)
  }));
};

describe('タイミングチャート波形問題診断', () => {
  let store: ReturnType<typeof createTestStore>;
  let timingCapture: CircuitTimingCapture;

  beforeEach(() => {
    store = createTestStore();
    timingCapture = new CircuitTimingCapture();
    vi.clearAllMocks();
  });

  describe('問題1: CLOCKゲートのタイミングイベント生成', () => {
    it('CLOCKゲートが実際にfalse/true交互イベントを生成するか', () => {
      // 1. CLOCKゲートを作成（5Hz、200ms周期）
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: 0,
      };

      const config = {
        timeProvider: { getCurrentTime: () => 0 },
        enableDebug: false,
        strictValidation: false,
        delayMode: false,
      };

      // 2. 時系列で評価して出力変化を記録
      const evaluations: Array<{ time: number; output: boolean; gate: Gate }> = [];
      
      for (let time = 0; time < 500; time += 50) {
        config.timeProvider.getCurrentTime = () => time;
        
        const result = evaluateGateUnified(clockGate, [], config);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const newGate = { ...clockGate, output: result.data.primaryOutput };
          evaluations.push({ 
            time, 
            output: result.data.primaryOutput,
            gate: newGate
          });
        }
      }

      // 3. CLOCKの出力変化パターンを検証
      console.log('CLOCK evaluations:', evaluations.map(e => ({ time: e.time, output: e.output })));
      
      // 5Hz = 200ms周期、100ms ON/OFF
      expect(evaluations[0].output).toBe(false); // t=0: false
      expect(evaluations[2].output).toBe(true);  // t=100: true  
      expect(evaluations[4].output).toBe(false); // t=200: false
      expect(evaluations[6].output).toBe(true);  // t=300: true

      // 4. 実際にTimingCaptureでイベント生成をテスト
      const events: TimingEvent[] = [];
      
      for (let i = 1; i < evaluations.length; i++) {
        const currentCircuit = { gates: [evaluations[i].gate], wires: [] };
        const previousCircuit = { gates: [evaluations[i-1].gate], wires: [] };
        
        const capturedEvents = timingCapture.captureFromEvaluation(
          { success: true, data: { circuit: currentCircuit } },
          previousCircuit
        );
        
        events.push(...capturedEvents);
      }

      console.log('Captured timing events:', events.map(e => ({ time: e.time, value: e.value, previousValue: e.previousValue })));

      // 5. タイミングイベントの値変化を検証
      const changeEvents = events.filter(e => e.value !== e.previousValue);
      expect(changeEvents.length).toBeGreaterThan(0); // 変化イベントが存在する
      
      // 実際の値変化パターンを検証
      expect(changeEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: true, previousValue: false }),
          expect.objectContaining({ value: false, previousValue: true }),
        ])
      );
    });
  });

  describe('問題2: TimingChartSliceのイベント処理', () => {
    it('false/true交互イベントが正しくトレースに追加されるか', () => {
      const { timingChartActions } = store.getState();
      
      // 一時停止を解除
      timingChartActions.resumeCapture();
      
      // トレースを追加
      const gateId = 'test-clock-123';
      const traceId = timingChartActions.addTrace(gateId, 'output', 0);
      expect(traceId).toBeTruthy();

      // false/true交互のイベントを作成
      const alternatingEvents: TimingEvent[] = [
        {
          id: 'event-1',
          time: 0,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'test-alternating',
        },
        {
          id: 'event-2', 
          time: 100,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'test-alternating',
        },
        {
          id: 'event-3',
          time: 200,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'test-alternating',
        },
        {
          id: 'event-4',
          time: 300,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'test-alternating',
        },
      ];

      // イベントを処理
      timingChartActions.processTimingEvents(alternatingEvents);

      // トレースの最終状態を検証
      const trace = timingChartActions.getTraceData(traceId!);
      expect(trace).toBeTruthy();
      expect(trace!.events).toHaveLength(4);

      // 実際の値のパターンを検証
      const values = trace!.events.map(e => e.value);
      expect(values).toEqual([false, true, false, true]);
      
      console.log('Trace final values:', values);
      console.log('Expected alternating pattern achieved:', values.toString() === [false, true, false, true].toString());
    });

    it('同じ値が連続する場合の処理（問題の再現）', () => {
      const { timingChartActions } = store.getState();
      
      timingChartActions.resumeCapture();
      
      const gateId = 'test-clock-problem';
      const traceId = timingChartActions.addTrace(gateId, 'output', 0);

      // すべて同じ値のイベント（実際の問題）
      const sameValueEvents: TimingEvent[] = [
        {
          id: 'problem-1',
          time: 0,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'test-problem',
        },
        {
          id: 'problem-2',
          time: 100,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'test-problem',
        },
        {
          id: 'problem-3',
          time: 200,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'test-problem',
        },
      ];

      timingChartActions.processTimingEvents(sameValueEvents);

      const trace = timingChartActions.getTraceData(traceId!);
      const values = trace!.events.map(e => e.value);
      
      console.log('Problem scenario values:', values);
      console.log('All values are same (problem reproduced):', values.every(v => v === true));
      
      // 問題の再現確認
      expect(values.every(v => v === true)).toBe(true);
      expect(new Set(values).size).toBe(1); // すべて同じ値
    });
  });

  describe('問題3: 波形描画データの検証', () => {
    it('交互値イベントから正しい波形データが生成されるか', () => {
      // 波形描画で使用されるgetValueAtTime関数のテスト
      const mockTrace = {
        id: 'test-trace',
        gateId: 'test-clock',
        pinType: 'output' as const,
        pinIndex: 0,
        name: 'TEST_CLOCK',
        color: '#00ff88',
        visible: true,
        events: [
          { id: 'e1', time: 0, gateId: 'test-clock', pinType: 'output' as const, pinIndex: 0, value: false },
          { id: 'e2', time: 100, gateId: 'test-clock', pinType: 'output' as const, pinIndex: 0, value: true },
          { id: 'e3', time: 200, gateId: 'test-clock', pinType: 'output' as const, pinIndex: 0, value: false },
          { id: 'e4', time: 300, gateId: 'test-clock', pinType: 'output' as const, pinIndex: 0, value: true },
        ],
      };

      // WaveformCanvasで使用される値取得ロジック
      const getValueAtTime = (time: number): boolean => {
        const relevantEvents = mockTrace.events.filter(e => e.time <= time);
        if (relevantEvents.length === 0) return false;
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        return Boolean(lastEvent.value);
      };

      // 各時点での期待値を検証
      const timePoints = [50, 150, 250, 350];
      const expectedValues = [false, true, false, true];
      const actualValues = timePoints.map(getValueAtTime);

      console.log('Time points:', timePoints);
      console.log('Expected values:', expectedValues);
      console.log('Actual values:', actualValues);
      console.log('Waveform pattern correct:', JSON.stringify(actualValues) === JSON.stringify(expectedValues));

      expect(actualValues).toEqual(expectedValues);
      
      // 波形の変化点を検証
      const hasTransitions = actualValues.some((val, i) => i > 0 && val !== actualValues[i-1]);
      expect(hasTransitions).toBe(true); // 波形に遷移がある
    });

    it('同じ値の場合の波形データ（問題の再現）', () => {
      const problemTrace = {
        id: 'problem-trace',
        events: [
          { id: 'p1', time: 0, value: true },
          { id: 'p2', time: 100, value: true },
          { id: 'p3', time: 200, value: true },
          { id: 'p4', time: 300, value: true },
        ],
      };

      const getValueAtTime = (time: number): boolean => {
        const relevantEvents = problemTrace.events.filter(e => e.time <= time);
        if (relevantEvents.length === 0) return false;
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        return Boolean(lastEvent.value);
      };

      const timePoints = [50, 150, 250, 350];
      const actualValues = timePoints.map(getValueAtTime);

      console.log('Problem trace values:', actualValues);
      console.log('All same value (flat line):', actualValues.every(v => v === true));

      // 問題の再現：すべて同じ値で平坦な波形
      expect(actualValues.every(v => v === true)).toBe(true);
      expect(new Set(actualValues).size).toBe(1);
    });
  });

  describe('統合診断: 実際の問題箇所特定', () => {
    it('CLOCKゲート → TimingCapture → TimingSlice → 波形描画 の全工程', () => {
      // ===== 段階1: CLOCKゲート評価 =====
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: 0,
      };

      let currentTime = 0;
      const config = {
        timeProvider: { getCurrentTime: () => currentTime },
        enableDebug: false,
        strictValidation: false,
        delayMode: false,
      };

      // TimingCaptureに同じ時間プロバイダーを設定
      timingCapture.setTimeProvider(() => currentTime);

      // 時系列評価
      const evaluationResults: Array<{ time: number; gate: Gate }> = [];
      for (let time = 0; time < 400; time += 100) {
        currentTime = time; // TimingCaptureの時間プロバイダー用
        config.timeProvider.getCurrentTime = () => time;
        const result = evaluateGateUnified(clockGate, [], config);
        expect(result.success).toBe(true);
        
        if (result.success) {
          evaluationResults.push({
            time,
            gate: { ...clockGate, output: result.data.primaryOutput }
          });
        }
      }

      console.log('=== 段階1: CLOCK評価結果 ===');
      console.log(evaluationResults.map(r => ({ time: r.time, output: r.gate.output })));

      // ===== 段階2: TimingCapture ===== 
      const allEvents: TimingEvent[] = [];
      for (let i = 1; i < evaluationResults.length; i++) {
        // TimingCaptureの時間を評価時点に設定
        currentTime = evaluationResults[i].time;
        
        const current = { gates: [evaluationResults[i].gate], wires: [] };
        const previous = { gates: [evaluationResults[i-1].gate], wires: [] };
        
        const events = timingCapture.captureFromEvaluation(
          { success: true, data: { circuit: current } },
          previous
        );
        allEvents.push(...events);
      }

      console.log('=== 段階2: TimingCapture結果 ===');
      console.log(allEvents.map(e => ({ time: e.time, value: e.value, previousValue: e.previousValue })));

      // ===== 段階3: TimingChartSlice =====
      const { timingChartActions } = store.getState();
      timingChartActions.resumeCapture();
      
      const traceId = timingChartActions.addTrace(clockGate.id, 'output', 0);
      timingChartActions.processTimingEvents(allEvents);
      
      const finalTrace = timingChartActions.getTraceData(traceId!);

      console.log('=== 段階3: TimingChartSlice結果 ===');
      console.log(finalTrace?.events.map(e => ({ time: e.time, value: e.value })));

      // ===== 段階4: 波形データ生成 =====
      const getValueAtTime = (time: number) => {
        const relevantEvents = finalTrace?.events.filter(e => e.time <= time) || [];
        if (relevantEvents.length === 0) return false;
        return Boolean(relevantEvents[relevantEvents.length - 1].value);
      };

      const waveformPoints = [50, 150, 250, 350].map(getValueAtTime);

      console.log('=== 段階4: 最終波形データ ===');
      console.log(waveformPoints);

      // ===== 問題診断 =====
      const hasClockOutputChanges = evaluationResults.some((r, i) => 
        i > 0 && r.gate.output !== evaluationResults[i-1].gate.output
      );
      
      const hasTimingEventChanges = allEvents.length > 0 && 
        allEvents.some(e => e.value !== e.previousValue);
        
      const hasWaveformChanges = new Set(waveformPoints).size > 1;

      console.log('=== 診断結果 ===');
      console.log('CLOCK出力変化あり:', hasClockOutputChanges);
      console.log('タイミングイベント変化あり:', hasTimingEventChanges);
      console.log('波形変化あり:', hasWaveformChanges);

      // どの段階で問題が起きているかを特定
      if (!hasClockOutputChanges) {
        throw new Error('❌ 問題: CLOCKゲート評価で出力変化なし');
      } else if (!hasTimingEventChanges) {
        throw new Error('❌ 問題: TimingCaptureでイベント変化検出なし');  
      } else if (!hasWaveformChanges) {
        throw new Error('❌ 問題: 波形データに変化なし');
      } else {
        console.log('✅ 全段階で正常動作');
      }
    });
  });
});