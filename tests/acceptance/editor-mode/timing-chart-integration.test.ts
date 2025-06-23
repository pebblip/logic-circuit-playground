/**
 * タイミングチャート統合テスト
 * CLOCKゲートからタイミングチャート表示までの全体的な動作を検証
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import type { TimingEvent, TimingTrace } from '@/types/timing';
import type { Gate } from '@/types/circuit';
import { GateFactory } from '@/models/gates/GateFactory';
import {
  createTimingChartSlice,
  type TimingChartSlice,
} from '@/stores/slices/timingChartSlice';
import { CircuitTimingCapture } from '@/domain/timing/timingCapture';
import { CircuitEvaluator } from '@/domain/simulation/core/evaluator';
import type { EvaluationCircuit, EvaluationContext } from '@/domain/simulation/core/types';

// テスト用のstore作成
const createTestStore = () => {
  return create<TimingChartSlice>()((...a) => ({
    ...createTimingChartSlice(...a),
  }));
};

describe('タイミングチャート統合テスト', () => {
  // ENABLED: CLOCKゲートの基本動作は重要なため、新しいAPIで書き直し
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('CLOCKゲートの動作検証', () => {
    it('5Hz CLOCKゲートが正しい周期でtrue/falseを交互に出力する', async () => {
      // CLOCKゲートを作成
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });

      // 周波数を5Hz（200ms周期）に設定
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: 0,
      };
      
      // CLOCKゲートの初期outputsを設定
      clockGate.outputs = [true];

      // CLOCKゲートのみの最小回路を作成
      const circuit = {
        gates: [clockGate],
        wires: [],
      };

      const evaluationService = new (
        await import(
          '../../../src/domain/simulation/services/CircuitEvaluationService'
        )
      ).CircuitEvaluationService();

      // 時間経過をシミュレートして実際の出力をテスト
      const results: Array<{ time: number; output: boolean }> = [];
      
      // 回路とコンテキストを初期化
      const evalCircuit = evaluationService.toEvaluationCircuit(circuit);
      let context = evaluationService.createInitialContext(evalCircuit);
      
      for (let time = 0; time < 400; time += 50) {
        // 時間を更新して評価
        context.currentTime = time;
        const result = evaluationService.evaluateDirect(evalCircuit, context);
        
        // 次の評価のためにコンテキストを更新
        context = result.context;
        
        const evaluatedClock = result.circuit.gates.find(
          g => g.type === 'CLOCK'
        );

        if (evaluatedClock) {
          results.push({ time, output: evaluatedClock.outputs[0] });
        }
      }

      console.log('CLOCK Gate Test Results:', results);

      // 5Hz = 200ms周期, 100ms ON/OFF で期待される結果（実際の正しい動作）
      expect(results).toEqual([
        { time: 0, output: true }, // 0-100ms: HIGH
        { time: 50, output: true }, // 0-100ms: HIGH
        { time: 100, output: false }, // 100-200ms: LOW
        { time: 150, output: false }, // 100-200ms: LOW
        { time: 200, output: true }, // 200-300ms: HIGH
        { time: 250, output: true }, // 200-300ms: HIGH
        { time: 300, output: false }, // 300-400ms: LOW
        { time: 350, output: false }, // 300-400ms: LOW
      ]);
    });
  });

  describe('タイミングイベント処理の検証', () => {
    it('CLOCKの矩形波イベントがトレースに正しく反映される', () => {
      const { timingChartActions } = store.getState();

      // 一時停止を解除
      timingChartActions.resumeCapture();

      // トレースを追加
      const gateId = 'test-clock-gate-123';
      const traceId = timingChartActions.addTrace(gateId, 'output', 0);

      expect(traceId).toBeTruthy();

      // CLOCKの矩形波イベントを作成（false → true → false → true）
      const events: TimingEvent[] = [
        {
          id: 'event-1',
          time: 0,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'test-clock-evaluation',
        },
        {
          id: 'event-2',
          time: 100,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'test-clock-evaluation',
        },
        {
          id: 'event-3',
          time: 200,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'test-clock-evaluation',
        },
        {
          id: 'event-4',
          time: 300,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'test-clock-evaluation',
        },
      ];

      // イベントを処理
      timingChartActions.processTimingEvents(events);

      // トレースにイベントが追加されたことを確認
      const trace = timingChartActions.getTraceData(traceId!);
      expect(trace).toBeTruthy();
      expect(trace!.events).toHaveLength(4);

      // 値の変化を確認
      expect(trace!.events[0].value).toBe(false); // t=0: LOW
      expect(trace!.events[1].value).toBe(true); // t=100: HIGH
      expect(trace!.events[2].value).toBe(false); // t=200: LOW
      expect(trace!.events[3].value).toBe(true); // t=300: HIGH

      console.log(
        'Trace Events:',
        trace!.events.map(e => ({ time: e.time, value: e.value }))
      );
    });

    it('同じ値のイベントが連続しても正しく処理される', () => {
      const { timingChartActions } = store.getState();

      timingChartActions.resumeCapture();

      const gateId = 'test-clock-gate-456';
      const traceId = timingChartActions.addTrace(gateId, 'output', 0);

      // 問題のシナリオ：すべてtrueのイベント（これが実際に起きている問題）
      const problemEvents: TimingEvent[] = [
        {
          id: 'event-1',
          time: 0,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'problematic-event',
        },
        {
          id: 'event-2',
          time: 100,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'problematic-event',
        },
        {
          id: 'event-3',
          time: 200,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true, // すべてtrue
          source: 'problematic-event',
        },
      ];

      timingChartActions.processTimingEvents(problemEvents);

      const trace = timingChartActions.getTraceData(traceId!);
      expect(trace!.events).toHaveLength(3);

      // この場合、すべての値がtrueで水平線になる（問題の再現）
      expect(trace!.events.every(e => e.value === true)).toBe(true);

      console.log(
        'Problem Scenario - All True Events:',
        trace!.events.map(e => ({ time: e.time, value: e.value }))
      );
    });
  });

  describe('波形データ生成の検証', () => {
    it('CLOCKの矩形波が正しく生成される', () => {
      // テスト用のタイミングトレース（正常な矩形波）
      const trace: TimingTrace = {
        id: 'test-trace',
        gateId: 'test-clock',
        pinType: 'output',
        pinIndex: 0,
        name: 'CLOCK',
        color: '#00ff88',
        visible: true,
        events: [
          {
            id: 'e1',
            time: 0,
            gateId: 'test-clock',
            pinType: 'output',
            pinIndex: 0,
            value: false,
          },
          {
            id: 'e2',
            time: 100,
            gateId: 'test-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
          {
            id: 'e3',
            time: 200,
            gateId: 'test-clock',
            pinType: 'output',
            pinIndex: 0,
            value: false,
          },
          {
            id: 'e4',
            time: 300,
            gateId: 'test-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
        ],
      };

      const timeWindow = { start: 0, end: 400 };

      // 時間窓内のイベントを取得
      const visibleEvents = trace.events.filter(
        event => event.time >= timeWindow.start && event.time <= timeWindow.end
      );

      expect(visibleEvents).toHaveLength(4);

      // 各時点での値を計算（WaveformCanvasのロジック）
      const getValueAtTime = (time: number): boolean => {
        const relevantEvents = trace.events.filter(e => e.time <= time);
        if (relevantEvents.length === 0) return false;
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        return Boolean(lastEvent.value);
      };

      // 矩形波の確認
      expect(getValueAtTime(50)).toBe(false); // 0-100: LOW
      expect(getValueAtTime(150)).toBe(true); // 100-200: HIGH
      expect(getValueAtTime(250)).toBe(false); // 200-300: LOW
      expect(getValueAtTime(350)).toBe(true); // 300-400: HIGH
    });

    it('水平線問題：すべて同じ値の場合', () => {
      // 問題のあるトレース（すべてtrueで水平線）
      const problematicTrace: TimingTrace = {
        id: 'problematic-trace',
        gateId: 'problematic-clock',
        pinType: 'output',
        pinIndex: 0,
        name: 'PROBLEMATIC_CLOCK',
        color: '#ff0000',
        visible: true,
        events: [
          {
            id: 'p1',
            time: 0,
            gateId: 'problematic-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
          {
            id: 'p2',
            time: 100,
            gateId: 'problematic-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
          {
            id: 'p3',
            time: 200,
            gateId: 'problematic-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
          {
            id: 'p4',
            time: 300,
            gateId: 'problematic-clock',
            pinType: 'output',
            pinIndex: 0,
            value: true,
          },
        ],
      };

      const getValueAtTime = (time: number): boolean => {
        const relevantEvents = problematicTrace.events.filter(
          e => e.time <= time
        );
        if (relevantEvents.length === 0) return false;
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        return Boolean(lastEvent.value);
      };

      // すべての時点で同じ値（水平線）
      expect(getValueAtTime(50)).toBe(true);
      expect(getValueAtTime(150)).toBe(true);
      expect(getValueAtTime(250)).toBe(true);
      expect(getValueAtTime(350)).toBe(true);

      console.log(
        'Problematic Trace - All values same:',
        problematicTrace.events.map(e => ({ time: e.time, value: e.value }))
      );
    });
  });

  describe('実際の問題の診断', () => {
    it('globalTimingCaptureの初期状態パス問題を検証', () => {
      // 実際のglobalTimingCaptureをテスト
      const mockTimingCapture = new CircuitTimingCapture();

      // CLOCKゲートを作成
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.outputs = [true]; // 現在true状態
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: 0,
      };

      const currentCircuit = {
        gates: [clockGate],
        wires: [],
      };

      // シナリオ1: previousStateがundefined（初期状態パス）
      const mockResult = {
        success: true as const,
        data: { circuit: currentCircuit },
      };

      const eventsWithoutPrevious = mockTimingCapture.captureFromEvaluation(
        mockResult,
        undefined
      );

      // 初期状態パスではすべてのゲートに対してイベントが生成される
      expect(eventsWithoutPrevious).toHaveLength(1);
      expect(eventsWithoutPrevious[0].value).toBe(true); // 現在の値（true）がそのまま使われる
      expect(eventsWithoutPrevious[0].source).toBe('initial-state');

      console.log(
        'Initial State Events:',
        eventsWithoutPrevious.map(e => ({ value: e.value, source: e.source }))
      );

      // シナリオ2: previousStateが存在するが、同じ値（変化なし）
      const previousCircuit = {
        gates: [{ ...clockGate, outputs: [true] }], // 前回もtrue
        wires: [],
      };

      const eventsWithSameValue = mockTimingCapture.captureFromEvaluation(
        mockResult,
        previousCircuit
      );

      // 変化がないのでイベントは生成されない
      expect(eventsWithSameValue).toHaveLength(0);

      // シナリオ3: previousStateが存在し、値が変化している
      const previousCircuitChanged = {
        gates: [{ ...clockGate, outputs: [false] }], // 前回はfalse
        wires: [],
      };

      const eventsWithChange = mockTimingCapture.captureFromEvaluation(
        mockResult,
        previousCircuitChanged
      );

      // 変化があるのでイベントが生成される
      expect(eventsWithChange).toHaveLength(1);
      expect(eventsWithChange[0].value).toBe(true); // 現在の値
      expect(eventsWithChange[0].previousValue).toBe(false); // 前回の値
      expect(eventsWithChange[0].source).toBe('circuit-evaluation-delay:0ms');

      console.log(
        'Change Detection Events:',
        eventsWithChange.map(e => ({
          value: e.value,
          previousValue: e.previousValue,
          source: e.source,
        }))
      );
    });

    it('useCanvasSimulationのpreviousCircuit渡し方を検証', () => {
      // useCanvasSimulationで行われている処理をシミュレート

      // 1回目の実行（初期状態）
      const initialState = {
        gates: [],
        wires: [],
      };

      const clockGate1 = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate1.outputs = [false];

      const firstEvaluation = {
        gates: [clockGate1],
        wires: [],
      };

      // 初回：previousCircuitは空またはundefined相当
      const mockTimingCapture = new CircuitTimingCapture();
      const firstEvents = mockTimingCapture.captureFromEvaluation(
        { success: true, data: { circuit: firstEvaluation } },
        initialState
      );

      console.log(
        'First Run Events:',
        firstEvents.map(e => ({ value: e.value, source: e.source }))
      );

      // 2回目の実行（状態変化）
      const clockGate2 = { ...clockGate1, outputs: [true] }; // false → true
      const secondEvaluation = {
        gates: [clockGate2],
        wires: [],
      };

      // 2回目：previousCircuitは前回の結果
      const secondEvents = mockTimingCapture.captureFromEvaluation(
        { success: true, data: { circuit: secondEvaluation } },
        firstEvaluation // 前回の評価結果
      );

      console.log(
        'Second Run Events:',
        secondEvents.map(e => ({
          value: e.value,
          previousValue: e.previousValue,
          source: e.source,
        }))
      );

      // 2回目では変化検出されるはず
      expect(secondEvents).toHaveLength(1);
      expect(secondEvents[0].value).toBe(true);
      expect(secondEvents[0].previousValue).toBe(false);
    });

    it('CLOCKゲートのstartTime設定問題を検証', () => {
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });

      // startTimeが未設定の場合
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: undefined, // 未設定
      };

      // CircuitEvaluatorを使用して評価
      const evaluator = new CircuitEvaluator();
      const circuit: EvaluationCircuit = {
        gates: [{
          id: clockGate.id,
          type: clockGate.type,
          position: clockGate.position,
          inputs: clockGate.inputs,
          outputs: clockGate.outputs,
          metadata: clockGate.metadata,
        }],
        wires: [],
      };
      
      const context: EvaluationContext = {
        currentTime: 1000,
        memory: {},
      };
      
      const result = evaluator.evaluateImmediate(circuit, context);
      
      // startTimeが未設定の場合、現在時刻がstartTimeとして使われる
      // elapsed = 1000 - 1000 = 0, cyclePosition = 0, isHigh = true（CLOCKは0時点でtrueから開始）
      expect(result.circuit.gates[0].outputs[0]).toBe(true);
    });
  });
});
