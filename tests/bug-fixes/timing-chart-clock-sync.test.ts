/**
 * タイミングチャートとCLOCKゲートの同期テスト
 * 修正後の動作を確認
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCircuitStore } from '@/stores/circuitStore';
import { GateFactory } from '@/models/gates/GateFactory';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Circuit } from '@/types/circuit';

describe('タイミングチャートCLOCK同期テスト', () => {
  beforeEach(() => {
    // ストアをリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
    });
    
    // globalTimingCaptureをリセット
    globalTimingCapture.clearEvents();
    globalTimingCapture.resetSimulationTime();
    globalTimingCapture.setSimulationStartTime();
  });

  it('CLOCKゲートのイベントがトレースに正しく同期される', async () => {
    // CLOCKゲートを作成
    const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
    
    // ストアに追加
    useCircuitStore.setState({
      gates: [clockGate],
      wires: [],
    });

    // タイミングチャートアクションを取得
    const { timingChartActions } = useCircuitStore.getState();
    expect(timingChartActions).toBeTruthy();

    // CLOCKゲートのトレースを追加
    const traceId = timingChartActions!.addTrace(clockGate.id, 'output', 0);
    console.log('Added trace:', traceId);

    // EnhancedHybridEvaluatorで評価
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
      delayMode: false,
    });

    let previousCircuit: Circuit | null = null;
    const eventCounts: number[] = [];
    const globalEventCounts: number[] = [];

    // 5回評価を実行（500msシミュレート）
    for (let i = 0; i < 5; i++) {
      const circuit: Circuit = {
        gates: useCircuitStore.getState().gates,
        wires: useCircuitStore.getState().wires,
      };

      const result = evaluator.evaluate(circuit);
      
      // タイミングイベントをキャプチャ
      const timingEvents = globalTimingCapture.captureFromEvaluation(
        {
          success: true,
          data: { circuit: result.circuit },
          warnings: [],
        },
        previousCircuit || undefined
      );

      console.log(`Evaluation ${i + 1}: ${timingEvents.length} new events`);

      // イベントを処理
      if (timingEvents.length > 0) {
        timingChartActions!.processTimingEvents(timingEvents);
      }
      
      // 新しい同期メカニズムを呼び出し
      timingChartActions!.syncEventsFromGlobalCapture();

      // トレースとglobalTimingCaptureのイベント数を記録
      const trace = timingChartActions!.getTraceData(traceId!);
      eventCounts.push(trace?.events.length || 0);
      globalEventCounts.push(globalTimingCapture.getEvents().length);

      console.log(`After sync - Trace events: ${trace?.events.length || 0}, Global events: ${globalTimingCapture.getEvents().length}`);

      // ストアを更新
      useCircuitStore.setState({
        gates: result.circuit.gates,
        wires: result.circuit.wires,
      });

      previousCircuit = result.circuit;
      
      // 100ms待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Event counts progression:', eventCounts);
    console.log('Global event counts:', globalEventCounts);

    // 最終的なトレースの状態を確認
    const finalTrace = timingChartActions!.getTraceData(traceId!);
    const finalGlobalEvents = globalTimingCapture.getEvents();
    
    console.log('\n=== Final State ===');
    console.log('Trace events:', finalTrace?.events.length || 0);
    console.log('Global events:', finalGlobalEvents.length);
    
    if (finalTrace && finalTrace.events.length > 0) {
      console.log('First 5 trace events:', finalTrace.events.slice(0, 5).map(e => ({
        time: e.time,
        value: e.value
      })));
    }

    // 検証：イベントが増加していること
    expect(eventCounts[eventCounts.length - 1]).toBeGreaterThan(0);
    expect(finalTrace).toBeTruthy();
    expect(finalTrace!.events.length).toBeGreaterThan(0);
    
    // globalTimingCaptureとトレースのイベント数が一致することを確認
    const clockEvents = finalGlobalEvents.filter(e => e.gateId === clockGate.id);
    expect(finalTrace!.events.length).toBe(clockEvents.length);
    
    // CLOCKゲートのfalse/true交互パターンを確認
    if (finalTrace!.events.length > 1) {
      const values = finalTrace!.events.map(e => e.value);
      const uniqueValues = [...new Set(values)];
      console.log('Unique values in trace:', uniqueValues);
      
      // false/trueの両方が含まれることを確認
      expect(uniqueValues.length).toBe(2);
      expect(uniqueValues).toContain(false);
      expect(uniqueValues).toContain(true);
      
      // 値が交互に変化することを確認（少なくとも1回は変化）
      const hasTransitions = values.some((v, i) => i > 0 && v !== values[i - 1]);
      expect(hasTransitions).toBe(true);
    }
  });

  it('複数のCLOCKゲートのイベントが正しく分離される', async () => {
    // 2つのCLOCKゲートを作成（異なる周波数）
    const clock1 = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
    clock1.metadata = { ...clock1.metadata, frequency: 5 }; // 5Hz
    
    const clock2 = GateFactory.createGate('CLOCK', { x: 200, y: 100 });
    clock2.metadata = { ...clock2.metadata, frequency: 10 }; // 10Hz
    
    // ストアに追加
    useCircuitStore.setState({
      gates: [clock1, clock2],
      wires: [],
    });

    // タイミングチャートアクションを取得
    const { timingChartActions } = useCircuitStore.getState();
    
    // 両方のCLOCKゲートのトレースを追加
    const trace1Id = timingChartActions!.addTrace(clock1.id, 'output', 0);
    const trace2Id = timingChartActions!.addTrace(clock2.id, 'output', 0);

    // EnhancedHybridEvaluatorで評価
    const evaluator = new EnhancedHybridEvaluator({
      strategy: 'AUTO_SELECT',
      enableDebugLogging: false,
      delayMode: false,
    });

    let previousCircuit: Circuit | null = null;

    // 300ms分評価を実行
    for (let i = 0; i < 3; i++) {
      const circuit: Circuit = {
        gates: useCircuitStore.getState().gates,
        wires: useCircuitStore.getState().wires,
      };

      const result = evaluator.evaluate(circuit);
      
      // タイミングイベントをキャプチャ
      const timingEvents = globalTimingCapture.captureFromEvaluation(
        {
          success: true,
          data: { circuit: result.circuit },
          warnings: [],
        },
        previousCircuit || undefined
      );

      // イベントを処理と同期
      if (timingEvents.length > 0) {
        timingChartActions!.processTimingEvents(timingEvents);
      }
      timingChartActions!.syncEventsFromGlobalCapture();

      // ストアを更新
      useCircuitStore.setState({
        gates: result.circuit.gates,
        wires: result.circuit.wires,
      });

      previousCircuit = result.circuit;
      
      // 100ms待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 各トレースの状態を確認
    const trace1 = timingChartActions!.getTraceData(trace1Id!);
    const trace2 = timingChartActions!.getTraceData(trace2Id!);
    
    console.log('Clock1 (5Hz) events:', trace1?.events.length || 0);
    console.log('Clock2 (10Hz) events:', trace2?.events.length || 0);

    // 検証：両方のトレースにイベントがある
    expect(trace1?.events.length).toBeGreaterThan(0);
    expect(trace2?.events.length).toBeGreaterThan(0);
    
    // 10HzのCLOCKの方がイベント数が多いはず（理論的には2倍）
    // ただし、タイミングによって完全に2倍にはならない可能性があるので、1.5倍以上で検証
    expect(trace2!.events.length).toBeGreaterThan(trace1!.events.length * 1.5);
  });
});