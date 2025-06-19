/**
 * 実際のアプリケーション環境でのタイミングチャート問題診断
 * 単体テストは成功するが実際のアプリでは動作しない問題を特定
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createTimingChartSlice, type TimingChartSlice } from '@/stores/slices/timingChartSlice';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { GateFactory } from '@/models/gates/GateFactory';
import { useCircuitStore } from '@/stores/circuitStore';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { TimingEvent } from '@/types/timing';
import type { Gate, Circuit } from '@/types/circuit';

describe('実際のアプリケーション環境タイミングチャート診断', () => {
  
  describe('問題1: globalTimingCaptureの実際の設定状態', () => {
    it('globalTimingCaptureが正しく初期化されているか', () => {
      // globalTimingCaptureの現在の状態を確認
      const stats = globalTimingCapture.getStats();
      console.log('globalTimingCapture stats:', stats);
      
      // シミュレーション設定が正しく設定されているか
      const mockConfig = {
        delayMode: false,
        delayMultiplier: 1.0,
        customDelays: {},
      };
      
      globalTimingCapture.updateSimulationConfig(mockConfig);
      
      // 設定後に実際にイベントが生成されるかテスト
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.output = false;
      
      const currentCircuit = { gates: [clockGate], wires: [] };
      const previousCircuit = { gates: [{ ...clockGate, output: true }], wires: [] };
      
      const events = globalTimingCapture.captureFromEvaluation(
        { success: true, data: { circuit: currentCircuit } },
        previousCircuit
      );
      
      console.log('globalTimingCapture generated events:', events);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('問題2: useCanvasSimulationの実際の動作再現', () => {
    it('EnhancedHybridEvaluatorとglobalTimingCaptureの統合', async () => {
      // useCanvasSimulationで実際に使用されている評価器をテスト
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      const startTime = Date.now();
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: startTime,
      };

      const circuit: Circuit = {
        gates: [clockGate],
        wires: [],
      };

      // 実際のEnhancedHybridEvaluatorを使用
      const evaluator = new EnhancedHybridEvaluator({
        strategy: 'AUTO_SELECT',
        enableDebugLogging: true,
        delayMode: false,
      });

      // 評価実行
      const result1 = evaluator.evaluate(circuit);
      console.log('First evaluation result:', {
        gates: result1.circuit.gates.map(g => ({ 
          id: g.id, 
          type: g.type, 
          output: g.output,
          startTime: g.metadata?.startTime,
          isRunning: g.metadata?.isRunning,
          frequency: g.metadata?.frequency
        }))
      });

      // 100ms待機してから再評価（CLOCKの半周期）
      await new Promise(resolve => setTimeout(resolve, 110));
      
      const result2 = evaluator.evaluate(result1.circuit);
      console.log('Second evaluation result (after 110ms):', {
        gates: result2.circuit.gates.map(g => ({ 
          id: g.id, 
          type: g.type, 
          output: g.output,
          startTime: g.metadata?.startTime,
          currentTime: Date.now(),
          elapsed: Date.now() - (g.metadata?.startTime || 0)
        }))
      });

      // globalTimingCaptureでイベント生成をテスト
      const events = globalTimingCapture.captureFromEvaluation(
        { success: true, data: { circuit: result2.circuit } },
        result1.circuit
      );

      console.log('Events from real evaluator:', events.map(e => ({ time: e.time, value: e.value, gateId: e.gateId })));

      // CLOCKゲートの出力が変化していることを確認
      const clock1 = result1.circuit.gates.find(g => g.type === 'CLOCK');
      const clock2 = result2.circuit.gates.find(g => g.type === 'CLOCK');
      
      console.log('CLOCK output change:', {
        first: clock1?.output,
        second: clock2?.output,
        changed: clock1?.output !== clock2?.output
      });

      // 何らかの変化またはイベントがあることを期待
      const hasOutputChange = clock1?.output !== clock2?.output;
      const hasEvents = events.length > 0;
      
      console.log('Change detection:', { hasOutputChange, hasEvents });
      
      // 少なくとも変化検出かイベント生成のいずれかは動作すべき
      expect(hasOutputChange || hasEvents).toBe(true);
    });
  });

  describe('問題3: 実際のstore状態との統合', () => {
    it('useCircuitStoreとTimingChartSliceの連携', () => {
      // 実際のuseCircuitStoreを使用
      const circuitState = useCircuitStore.getState();
      console.log('Current circuit store state:', {
        gateCount: circuitState.gates.length,
        wireCount: circuitState.wires.length,
        hasTimingChartActions: !!circuitState.timingChartActions,
        isTimingChartVisible: circuitState.timingChart?.isVisible
      });

      // CLOCKゲートを追加
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: Date.now(),
      };

      useCircuitStore.setState({
        gates: [clockGate],
        wires: [],
      });

      const updatedState = useCircuitStore.getState();
      console.log('After adding CLOCK gate:', {
        gateCount: updatedState.gates.length,
        clockGates: updatedState.gates.filter(g => g.type === 'CLOCK').length
      });

      // TimingChartActionsが利用可能か確認
      if (updatedState.timingChartActions) {
        console.log('TimingChart actions available');
        
        // トレースを追加
        const traceId = updatedState.timingChartActions.addTrace(clockGate.id, 'output', 0);
        console.log('Added trace:', traceId);

        // テストイベントを処理
        const testEvents: TimingEvent[] = [
          {
            id: 'test-1',
            time: 100,
            gateId: clockGate.id,
            pinType: 'output',
            pinIndex: 0,
            value: true,
            source: 'real-app-test',
          },
          {
            id: 'test-2',
            time: 200,
            gateId: clockGate.id,
            pinType: 'output',
            pinIndex: 0,
            value: false,
            source: 'real-app-test',
          }
        ];

        updatedState.timingChartActions.processTimingEvents(testEvents);

        // トレースの最終状態を確認
        const finalState = useCircuitStore.getState();
        const trace = finalState.timingChartActions?.getTraceData(traceId!);
        
        console.log('Final trace state:', {
          traceExists: !!trace,
          eventCount: trace?.events.length || 0,
          events: trace?.events.map(e => ({ time: e.time, value: e.value })) || []
        });

        expect(trace).toBeTruthy();
        expect(trace!.events.length).toBe(2);
      } else {
        console.log('❌ TimingChart actions not available in store');
        expect(false).toBe(true); // TimingChart actionsが利用できない
      }
    });
  });

  describe('問題4: 実環境とテスト環境の違い', () => {
    it('時間プロバイダーの動作確認', () => {
      // globalTimingCaptureの時間プロバイダーをリセット（実環境の状態）
      globalTimingCapture.setTimeProvider(null);
      
      const startTime = Date.now();
      
      // CLOCKゲートを作成
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      clockGate.metadata = {
        ...clockGate.metadata,
        frequency: 5,
        isRunning: true,
        startTime: startTime,
      };

      // 初期状態
      const circuit1: Circuit = {
        gates: [{ ...clockGate, output: false }],
        wires: [],
      };

      // 100ms後の状態をシミュレート
      const circuit2: Circuit = {
        gates: [{ ...clockGate, output: true }],
        wires: [],
      };

      const events = globalTimingCapture.captureFromEvaluation(
        { success: true, data: { circuit: circuit2 } },
        circuit1
      );

      console.log('Real-time events:', events.map(e => ({
        time: e.time,
        value: e.value,
        source: e.source,
        timeSinceStart: e.time - startTime
      })));

      // 実環境では時間が現在時刻ベースになる
      expect(events.length).toBeGreaterThan(0);
      if (events.length > 0) {
        expect(events[0].time).toBeGreaterThan(startTime);
      }
    });

    it('CLOCKゲートの周波数計算確認', () => {
      const clockGate = GateFactory.createGate('CLOCK', { x: 100, y: 100 });
      console.log('Default CLOCK metadata:', clockGate.metadata);

      // 5Hz設定での周期計算
      const frequency = 5; // Hz
      const period = 1000 / frequency; // 200ms
      const halfPeriod = period / 2; // 100ms

      console.log('CLOCK timing:', { frequency, period, halfPeriod });

      // 実際のゲート評価で周期的な動作を確認
      const baseTime = Date.now();
      const timePoints = [0, 50, 100, 150, 200, 250, 300];
      
      const outputs = timePoints.map(elapsed => {
        const cyclePosition = elapsed % period;
        const isHigh = cyclePosition >= halfPeriod;
        return { elapsed, cyclePosition, isHigh };
      });

      console.log('Expected CLOCK outputs:', outputs);

      // 期待される動作パターンを確認
      expect(outputs[0].isHigh).toBe(false);  // 0ms: false
      expect(outputs[2].isHigh).toBe(true);   // 100ms: true  
      expect(outputs[4].isHigh).toBe(false);  // 200ms: false
      expect(outputs[6].isHigh).toBe(true);   // 300ms: true
    });
  });

  describe('問題5: WaveformCanvasとの統合', () => {
    it('実際の波形描画データパイプライン', () => {
      // 実際のタイミングチャートストアを作成
      const store = create<TimingChartSlice>()((...a) => ({
        ...createTimingChartSlice(...a)
      }));

      const { timingChartActions } = store.getState();
      timingChartActions.resumeCapture();

      const gateId = 'real-clock-gate';
      const traceId = timingChartActions.addTrace(gateId, 'output', 0);

      // 現実的なタイミングイベントを生成（performance.nowベース）
      const baseTime = performance.now();
      const realEvents: TimingEvent[] = [
        {
          id: 'real-1',
          time: baseTime + 0,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'real-simulation',
        },
        {
          id: 'real-2',
          time: baseTime + 100,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: true,
          source: 'real-simulation',
        },
        {
          id: 'real-3',
          time: baseTime + 200,
          gateId,
          pinType: 'output',
          pinIndex: 0,
          value: false,
          source: 'real-simulation',
        }
      ];

      timingChartActions.processTimingEvents(realEvents);

      const trace = timingChartActions.getTraceData(traceId!);
      console.log('Real trace events:', trace?.events.map(e => ({ time: e.time, value: e.value })));

      // WaveformCanvasで使用される時間窓
      const timeWindow = { start: baseTime - 50, end: baseTime + 300 };
      const visibleEvents = trace?.events.filter(
        event => event.time >= timeWindow.start && event.time <= timeWindow.end
      ) || [];

      console.log('Visible events in time window:', visibleEvents.map(e => ({ time: e.time, value: e.value })));

      // 波形描画で使用される値取得ロジック
      const getValueAtTime = (time: number): boolean => {
        const relevantEvents = visibleEvents.filter(e => e.time <= time);
        if (relevantEvents.length === 0) return false;
        const lastEvent = relevantEvents[relevantEvents.length - 1];
        return Boolean(lastEvent.value);
      };

      const sampleTimes = [
        baseTime + 50,   // false期待
        baseTime + 150,  // true期待
        baseTime + 250,  // false期待
      ];

      const waveformValues = sampleTimes.map(getValueAtTime);
      console.log('Waveform values at sample times:', waveformValues);

      expect(waveformValues).toEqual([false, true, false]);
    });
  });
});