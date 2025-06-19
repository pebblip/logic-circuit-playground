import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalTimingCapture } from '../../src/domain/timing/timingCapture';
import { useCircuitStore } from '../../src/stores/circuitStore';
import { EnhancedHybridEvaluator } from '../../src/domain/simulation/event-driven-minimal/EnhancedHybridEvaluator';
import type { Circuit, Gate, Wire } from '../../src/types/circuit';

describe('Timing Chart Solution Verification', () => {
  let evaluator: EnhancedHybridEvaluator;
  let mockCircuit: Circuit;
  let clockGate: Gate;

  beforeEach(() => {
    vi.useFakeTimers();
    evaluator = new EnhancedHybridEvaluator();
    
    // CLOCKゲートを含む回路を作成
    clockGate = {
      id: 'clock1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      width: 80,
      height: 60,
      label: 'CLK',
      output: false,
      metadata: {
        frequency: 10, // 10Hz = 100ms周期
        isRunning: true,
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

    // Storeをリセット
    const store = useCircuitStore.getState();
    if (store.clearCircuit) {
      store.clearCircuit();
    }
    globalTimingCapture.destroy();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalTimingCapture.destroy();
  });

  it('should sync events from globalTimingCapture to trace events', async () => {
    console.log('=== Solution Verification Test ===');
    
    const store = useCircuitStore.getState();
    
    // ゲートを追加
    store.addGate(clockGate);
    store.addGate(mockCircuit.gates[1]);
    // ワイヤーの追加（addWireがない場合はupdateCircuitを使用）
    if (store.addWire) {
      store.addWire(mockCircuit.wires[0]);
    } else if (store.updateCircuit) {
      store.updateCircuit({
        gates: [clockGate, mockCircuit.gates[1]],
        wires: mockCircuit.wires
      });
    }
    
    // CLOCKゲートを選択してタイミングチャートを開始
    store.setSelectedClockGate('clock1');
    
    // タイミングチャートが表示されているか確認
    expect(store.timingChart.isVisible).toBe(true);
    
    // トレースが作成されているか確認
    const traces = store.timingChart.traces;
    console.log('Initial traces:', traces.map(t => ({ id: t.id, gateId: t.gateId, events: t.events.length })));
    
    const clockTrace = traces.find(t => t.gateId === 'clock1');
    expect(clockTrace).toBeDefined();
    
    // 初期状態ではイベントが空
    console.log('Initial trace events:', clockTrace?.events.length);
    expect(clockTrace?.events).toEqual([]);
    
    // globalTimingCaptureでウォッチを開始
    globalTimingCapture.watchGate('clock1', 'output', 0);
    
    // 回路を数回評価してイベントを生成
    const startTime = Date.now();
    let previousCircuit: Circuit | undefined = undefined;
    
    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(startTime + i * 50); // 50ms間隔
      
      // CLOCKの状態を更新
      const currentTime = startTime + i * 50;
      const elapsed = currentTime - (clockGate.metadata?.startTime || startTime);
      const period = 1000 / (clockGate.metadata?.frequency || 10);
      const newOutput = Math.floor(elapsed / period) % 2 === 1;
      
      // 評価を実行
      const result = evaluator.evaluate({
        gates: [
          { ...clockGate, output: newOutput },
          mockCircuit.gates[1]
        ],
        wires: mockCircuit.wires,
        flipFlops: []
      });
      
      if (result.circuit) {
        // イベントを捕捉
        const events = globalTimingCapture.captureFromEvaluation(
          { success: true, data: { circuit: result.circuit }, warnings: [] } as any,
          previousCircuit
        );
        
        console.log(`Iteration ${i}: Generated ${events.length} events, clock output: ${newOutput}`);
        
        previousCircuit = result.circuit;
      }
    }
    
    // イベントバッファを手動でフラッシュ（テスト環境用）
    console.log('\n🔧 Flushing event buffer...');
    // globalTimingCaptureの内部バッファにアクセス
    const eventBuffer = (globalTimingCapture as any).eventBuffer;
    if (eventBuffer && typeof eventBuffer.flush === 'function') {
      eventBuffer.flush();
    }
    
    // グローバルイベントを確認
    const globalEvents = globalTimingCapture.getEvents();
    console.log('Total global events:', globalEvents.length);
    console.log('Clock events:', globalEvents.filter(e => e.gateId === 'clock1').map(e => ({ time: e.time, value: e.value })));
    
    // ✅ 新しいsyncEventsFromGlobalCaptureを呼び出す
    console.log('\n🔧 Calling syncEventsFromGlobalCapture...');
    store.timingChartActions.syncEventsFromGlobalCapture();
    
    // 少し待つ（processTimingEventsが非同期の可能性があるため）
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // トレースのイベントが更新されたか確認
    const updatedTrace = store.timingChart.traces.find(t => t.gateId === 'clock1');
    console.log('\nAfter sync:');
    console.log('- Global events:', globalEvents.length);
    console.log('- Trace events:', updatedTrace?.events.length || 0);
    
    // ✅ イベントが同期されているはず
    expect(updatedTrace?.events.length).toBeGreaterThan(0);
    console.log('✅ Events successfully synced to trace!');
    
    // イベントの詳細を確認
    if (updatedTrace && updatedTrace.events.length > 0) {
      console.log('\nFirst few events in trace:');
      updatedTrace.events.slice(0, 3).forEach((event, i) => {
        console.log(`  Event ${i}: time=${event.time}, value=${event.value}`);
      });
    }
  });

  it('should demonstrate the complete data flow', async () => {
    console.log('\n=== Complete Data Flow Test ===');
    
    const store = useCircuitStore.getState();
    
    // 1. セットアップ
    console.log('1. Setting up circuit with CLOCK gate');
    store.addGate(clockGate);
    store.setSelectedClockGate('clock1');
    
    // 2. 評価とイベント生成
    console.log('\n2. Evaluating circuit and generating events');
    const startTime = Date.now();
    
    for (let i = 0; i < 3; i++) {
      vi.setSystemTime(startTime + i * 100);
      
      const result = evaluator.evaluate({
        gates: [{ ...clockGate, output: i % 2 === 1 }],
        wires: [],
        flipFlops: []
      });
      
      if (result.circuit) {
        globalTimingCapture.captureFromEvaluation(
          { success: true, data: { circuit: result.circuit }, warnings: [] } as any,
          i > 0 ? { gates: [{ ...clockGate, output: (i-1) % 2 === 1 }], wires: [] } : undefined
        );
      }
    }
    
    // 3. バッファをフラッシュして同期
    console.log('\n3. Flushing buffer and syncing events to timing chart');
    const eventBuffer = (globalTimingCapture as any).eventBuffer;
    if (eventBuffer && typeof eventBuffer.flush === 'function') {
      eventBuffer.flush();
    }
    
    store.timingChartActions.syncEventsFromGlobalCapture();
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // 4. 結果確認
    console.log('\n4. Verifying results');
    const trace = store.timingChart.traces.find(t => t.gateId === 'clock1');
    console.log(`   - Trace found: ${trace !== undefined}`);
    console.log(`   - Events in trace: ${trace?.events.length || 0}`);
    console.log(`   - Events visible in WaveformCanvas: ${(trace?.events.length || 0) > 0 ? 'YES' : 'NO'}`);
    
    expect(trace?.events.length).toBeGreaterThan(0);
    
    console.log('\n✅ Complete data flow working correctly!');
    console.log('   Circuit → globalTimingCapture → syncEventsFromGlobalCapture → trace.events → WaveformCanvas');
  });
});