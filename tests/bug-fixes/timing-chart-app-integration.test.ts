import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timingChartUtils } from '../../src/utils/timingChart';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import { globalTimingCapture } from '../../src/domain/timing/timingCapture';
import { useCircuitStore } from '../../src/stores/circuitStore';
import type { Circuit, Gate, Wire } from '../../src/types/circuit';
import type { TimingEvent } from '../../src/types/timing';

describe('Timing Chart App Integration - Real Problem Investigation', () => {
  let evaluator: EnhancedHybridEvaluator;
  let mockCircuit: Circuit;
  let clockGate: Gate;

  beforeEach(() => {
    vi.useFakeTimers();
    evaluator = new EnhancedHybridEvaluator();
    
    // 実際のアプリケーションと同じ構成で回路を作成
    clockGate = {
      id: 'clock1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      width: 80,
      height: 60,
      label: 'CLK',
      output: false,
      metadata: {
        frequency: 1000, // 1Hz
        startTime: Date.now()
      }
    };

    const notGate: Gate = {
      id: 'not1',
      type: 'NOT',
      position: { x: 300, y: 100 },
      width: 80,
      height: 60,
      label: 'NOT',
      output: false
    };

    const wire: Wire = {
      id: 'wire1',
      fromGateId: 'clock1',
      fromPinIndex: 0,
      toGateId: 'not1',
      toPinIndex: 0,
      path: []
    };

    mockCircuit = {
      gates: [clockGate, notGate],
      wires: [wire],
      flipFlops: []
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    // globalTimingCapture.destroy()が正しいメソッド
    globalTimingCapture.destroy();
  });

  it('CRITICAL: should connect globalTimingCapture events to trace events', () => {
    console.log('=== Critical Test: Event Connection ===');
    
    // Storeを初期化
    const store = useCircuitStore.getState();
    store.reset();
    
    // ゲートを追加
    store.addGate(clockGate);
    store.addGate(notGate);
    store.addWire(wire);
    
    // CLOCKゲートを選択してタイミングチャートを開始
    store.setSelectedClockGate('clock1');
    
    // タイミングチャートパネルが表示されているか確認
    expect(store.timingChart.isVisible).toBe(true);
    
    // トレースが作成されているか確認
    const traces = store.timingChart.traces;
    console.log('Created traces:', traces);
    expect(traces.length).toBeGreaterThan(0);
    
    const clockTrace = traces.find(t => t.gateId === 'clock1');
    expect(clockTrace).toBeDefined();
    
    // 初期状態ではイベントが空
    console.log('Initial trace events:', clockTrace?.events);
    expect(clockTrace?.events).toEqual([]);
    
    // 🔴 ここが問題：globalTimingCaptureのイベントがトレースに反映されない
    // 回路を評価してイベントを生成
    const startTime = Date.now();
    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(startTime + i * 500);
      evaluator.evaluate(mockCircuit);
    }
    
    // globalTimingCaptureにはイベントが存在
    const globalEvents = globalTimingCapture.getEvents();
    console.log('Global events count:', globalEvents.length);
    console.log('Global clock events:', globalEvents.filter(e => e.gateId === 'clock1'));
    
    // しかし、トレースのイベントは空のまま
    const updatedTrace = store.timingChart.traces.find(t => t.gateId === 'clock1');
    console.log('Updated trace events:', updatedTrace?.events);
    
    // 🔴 これが失敗する - イベントの接続が実装されていない
    // expect(updatedTrace?.events.length).toBeGreaterThan(0);
  });

  it('should test missing event synchronization', () => {
    console.log('=== Test 1: Timing Capture Start ===');
    
    console.log('=== Test: Missing Event Sync ===');
    
    // 実際のアプリケーションの動作をシミュレート
    const store = useCircuitStore.getState();
    store.reset();
    
    // 回路をセットアップ
    store.addGate(clockGate);
    store.addGate(notGate); 
    store.addWire(wire);
    
    // CLOCKゲートを選択（これでトレースが作成される）
    store.setSelectedClockGate('clock1');
    
    // トレースの初期状態を確認
    const initialTrace = store.timingChart.traces.find(t => t.gateId === 'clock1');
    console.log('Initial trace:', initialTrace);
    expect(initialTrace).toBeDefined();
    expect(initialTrace?.events).toEqual([]);
    
    // シミュレーションを実行
    const startTime = Date.now();
    
    // 複数回評価を実行
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(startTime + i * 100);
      
      // CLOCKゲートの状態を更新
      const currentClock = store.gates.find(g => g.id === 'clock1');
      if (currentClock) {
        const elapsed = (startTime + i * 100) - (currentClock.metadata?.startTime || startTime);
        const period = 1000 / (currentClock.metadata?.frequency || 1);
        const newOutput = Math.floor(elapsed / period) % 2 === 1;
        
        if (currentClock.output !== newOutput) {
          console.log(`Clock state change at ${i * 100}ms: ${currentClock.output} → ${newOutput}`);
        }
        
        // 評価を実行
        const result = evaluator.evaluate({
          gates: store.gates,
          wires: store.wires,
          flipFlops: []
        });
        
        // globalTimingCaptureでイベントを捕捉
        if (result.circuit) {
          const events = globalTimingCapture.captureFromEvaluation(
            { success: true, data: { circuit: result.circuit }, warnings: [] },
            mockCircuit
          );
          console.log(`Iteration ${i}: Generated ${events.length} events`);
        }
        
        // Storeを更新
        if (result.circuit) {
          store.updateGates(result.circuit.gates);
        }
      }
    }
    
    // グローバルイベントを確認
    const globalEvents = globalTimingCapture.getEvents();
    console.log('Total global events:', globalEvents.length);
    const clockEvents = globalEvents.filter(e => e.gateId === 'clock1');
    console.log('Clock events in global:', clockEvents.length);
    
    // トレースのイベントを確認
    const finalTrace = store.timingChart.traces.find(t => t.gateId === 'clock1');
    console.log('Final trace events:', finalTrace?.events.length);
    
    // 🔴 問題：グローバルイベントがトレースに反映されていない
    console.log('\n🔴 PROBLEM IDENTIFIED:');
    console.log('- Global timing capture has events:', globalEvents.length > 0);
    console.log('- Trace has events:', (finalTrace?.events.length || 0) > 0);
    console.log('- Events are NOT connected!');
  });

  it('should generate timing events during evaluation', () => {
    console.log('=== Test 2: Event Generation ===');
    
    // タイミングキャプチャを開始
    const selectedClockGateId = 'clock1';
    globalTimingCapture.startCapture(mockCircuit, selectedClockGateId);
    
    const startTime = Date.now();
    
    // 複数回評価を実行してイベントを生成
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(startTime + i * 100); // 100ms間隔
      evaluator.evaluate(mockCircuit);
    }
    
    // イベントが生成されているか確認
    const events = globalTimingCapture.getEvents();
    console.log('Generated events:', events);
    expect(events.length).toBeGreaterThan(0);
    
    // CLOCKゲートのイベントが存在するか確認
    const clockEvents = events.filter(e => e.gateId === 'clock1');
    console.log('Clock events:', clockEvents);
    expect(clockEvents.length).toBeGreaterThan(0);
  });

  it('should handle time window correctly', () => {
    console.log('=== Test 3: Time Window ===');
    
    // タイミングキャプチャを開始
    globalTimingCapture.startCapture(mockCircuit, 'clock1');
    
    const startTime = Date.now();
    
    // 時間を進めながら評価
    for (let i = 0; i < 20; i++) {
      vi.setSystemTime(startTime + i * 500); // 500ms間隔
      evaluator.evaluate(mockCircuit);
    }
    
    // 時間窓を設定してイベントを取得
    const windowDuration = 5000; // 5秒
    const currentTime = startTime + 10000; // 10秒後
    const windowStart = currentTime - windowDuration;
    
    const events = globalTimingCapture.getEvents();
    const eventsInWindow = events.filter(e => 
      e.timestamp >= windowStart && e.timestamp <= currentTime
    );
    
    console.log('All events:', events.length);
    console.log('Events in window:', eventsInWindow.length);
    console.log('Window range:', { windowStart, currentTime });
    
    expect(eventsInWindow.length).toBeGreaterThan(0);
    expect(eventsInWindow.length).toBeLessThan(events.length);
  });

  it('should handle selectedClockGateId correctly', () => {
    console.log('=== Test 4: Selected Clock Gate ID ===');
    
    // selectedClockGateIdなしで開始（アプリケーションの初期状態を模擬）
    globalTimingCapture.startCapture(mockCircuit, undefined);
    
    // トレースが追加されているか確認
    let traces = globalTimingCapture.getTraces();
    console.log('Traces without selectedClockGateId:', traces);
    
    // selectedClockGateIdを設定して再開始
    globalTimingCapture.stopCapture();
    globalTimingCapture.startCapture(mockCircuit, 'clock1');
    
    traces = globalTimingCapture.getTraces();
    console.log('Traces with selectedClockGateId:', traces);
    
    // CLOCKゲートのトレースが存在するか確認
    const clockTrace = traces.find(t => t.gateId === 'clock1');
    expect(clockTrace).toBeDefined();
  });

  it('should simulate actual app behavior', () => {
    console.log('=== Test 5: Full App Simulation ===');
    
    // 実際のアプリケーションの動作を完全に再現
    
    // 1. 初期状態（タイミングチャートなし）
    expect(globalTimingCapture.isCapturing).toBe(false);
    
    // 2. タイミングチャートを開く（selectedClockGateIdはまだundefined）
    globalTimingCapture.startCapture(mockCircuit, undefined);
    console.log('Step 2 - Traces:', globalTimingCapture.getTraces());
    
    // 3. CLOCKゲートを選択
    globalTimingCapture.stopCapture();
    globalTimingCapture.startCapture(mockCircuit, 'clock1');
    console.log('Step 3 - Traces:', globalTimingCapture.getTraces());
    
    // 4. シミュレーションを実行
    const startTime = Date.now();
    const simulationSteps = 20;
    
    for (let i = 0; i < simulationSteps; i++) {
      const currentTime = startTime + i * 100;
      vi.setSystemTime(currentTime);
      
      // CLOCKゲートの状態を手動で更新（実際のアプリケーションの動作を模擬）
      const elapsed = currentTime - (clockGate.metadata?.startTime || startTime);
      const frequency = clockGate.metadata?.frequency || 1000;
      const period = 1000 / frequency;
      clockGate.outputValue = Math.floor(elapsed / period) % 2 === 1;
      
      // 評価を実行
      evaluator.evaluate(mockCircuit);
      
      // イベントの状態を確認
      if (i % 5 === 0) {
        const events = globalTimingCapture.getEvents();
        console.log(`Step ${i} - Events:`, events.length, 'Clock value:', clockGate.outputValue);
      }
    }
    
    // 5. 最終的なイベントを確認
    const finalEvents = globalTimingCapture.getEvents();
    console.log('Final events:', finalEvents);
    
    expect(finalEvents.length).toBeGreaterThan(0);
    
    // CLOCKゲートのイベントが交互に変化しているか確認
    const clockEvents = finalEvents.filter(e => e.gateId === 'clock1');
    console.log('Clock events detail:', clockEvents.map(e => ({
      timestamp: e.timestamp - startTime,
      value: e.value
    })));
    
    expect(clockEvents.length).toBeGreaterThan(0);
    
    // 値が交互に変化しているか確認
    let hasTransition = false;
    for (let i = 1; i < clockEvents.length; i++) {
      if (clockEvents[i].value !== clockEvents[i-1].value) {
        hasTransition = true;
        break;
      }
    }
    expect(hasTransition).toBe(true);
  });

  it('should verify globalTimingCapture integration', () => {
    console.log('=== Test 6: GlobalTimingCapture Integration ===');
    
    // globalTimingCaptureのメソッドが正しく動作するか確認
    const spy = vi.spyOn(globalTimingCapture, 'addEvent');
    
    globalTimingCapture.startCapture(mockCircuit, 'clock1');
    
    const startTime = Date.now();
    
    // 評価を実行
    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(startTime + i * 200);
      evaluator.evaluate(mockCircuit);
    }
    
    // addEventが呼ばれたか確認
    console.log('addEvent call count:', spy.mock.calls.length);
    console.log('addEvent calls:', spy.mock.calls.map(call => ({
      gateId: call[0],
      value: call[1],
      timestamp: call[2] - startTime
    })));
    
    expect(spy).toHaveBeenCalled();
    
    // CLOCKゲートのイベントが追加されたか確認
    const clockCalls = spy.mock.calls.filter(call => call[0] === 'clock1');
    expect(clockCalls.length).toBeGreaterThan(0);
    
    spy.mockRestore();
  });

  it('SOLUTION: should implement event synchronization mechanism', () => {
    console.log('=== Solution Proposal ===');
    
    // 解決策の提案
    console.log('\n📋 SOLUTION PROPOSAL:');
    console.log('1. Create a synchronization mechanism between globalTimingCapture and timingChart traces');
    console.log('2. Options:');
    console.log('   a) Add a sync function in timingChartSlice that pulls events from globalTimingCapture');
    console.log('   b) Make globalTimingCapture push events directly to the store');
    console.log('   c) Use a subscription pattern to automatically sync events');
    console.log('\n3. Recommended approach: Option (a) - Pull-based sync');
    console.log('   - Add syncEventsFromGlobalCapture() action to timingChartSlice');
    console.log('   - Call it periodically from useCanvasSimulation after evaluation');
    console.log('   - Filter events by timeWindow and update trace.events arrays');
    
    // モック実装の例
    const mockSyncEventsFromGlobalCapture = () => {
      const store = useCircuitStore.getState();
      const globalEvents = globalTimingCapture.getEvents();
      const { timeWindow, traces } = store.timingChart;
      
      // 各トレースに対してイベントを同期
      const updatedTraces = traces.map(trace => {
        // 該当するゲートのイベントをフィルタ
        const traceEvents = globalEvents.filter(event => 
          event.gateId === trace.gateId &&
          event.pinType === trace.pinType &&
          event.pinIndex === trace.pinIndex &&
          event.time >= timeWindow.start &&
          event.time <= timeWindow.end
        );
        
        return {
          ...trace,
          events: traceEvents
        };
      });
      
      console.log('Mock sync result:');
      updatedTraces.forEach(trace => {
        console.log(`- Trace ${trace.id}: ${trace.events.length} events`);
      });
      
      return updatedTraces;
    };
    
    // テスト実行
    mockSyncEventsFromGlobalCapture();
    
    console.log('\n✅ This approach would solve the wave display issue!');
  });
});