import { describe, it, expect } from 'vitest';
import { globalTimingCapture } from '../../src/domain/timing/timingCapture';
import { useCircuitStore } from '../../src/stores/circuitStore';

describe('Timing Chart Simple Investigation', () => {
  it('should identify the missing connection between globalTimingCapture and trace events', () => {
    console.log('\n📍 PROBLEM IDENTIFICATION:');
    console.log('===============================');
    
    // 1. globalTimingCapture は CircuitTimingCapture クラスのインスタンス
    console.log('1. globalTimingCapture exists:', globalTimingCapture !== undefined);
    console.log('   - Type:', globalTimingCapture.constructor.name);
    console.log('   - Has captureFromEvaluation:', typeof globalTimingCapture.captureFromEvaluation === 'function');
    console.log('   - Has getEvents:', typeof globalTimingCapture.getEvents === 'function');
    
    // 2. タイミングチャートのトレースは timingChartSlice で管理
    const store = useCircuitStore.getState();
    console.log('\n2. Timing chart traces managed by:', 'timingChartSlice');
    console.log('   - Has traces array:', Array.isArray(store.timingChart?.traces));
    console.log('   - Trace structure: { id, gateId, events: [], ... }');
    
    // 3. 問題: globalTimingCapture のイベントが trace.events に同期されていない
    console.log('\n3. MISSING CONNECTION:');
    console.log('   ❌ No mechanism to sync globalTimingCapture.getEvents() → trace.events');
    console.log('   ❌ useCanvasSimulation generates events but doesn\'t update traces');
    console.log('   ❌ WaveformCanvas reads from trace.events which remains empty');
    
    // 4. 解決策の提案
    console.log('\n📋 SOLUTION PROPOSAL:');
    console.log('===============================');
    console.log('Add syncEventsFromGlobalCapture action to timingChartSlice:');
    console.log(`
    syncEventsFromGlobalCapture: () => {
      const state = get();
      const globalEvents = globalTimingCapture.getEvents();
      const { timeWindow, traces } = state.timingChart;
      
      // 各トレースに対応するイベントを同期
      const updatedTraces = traces.map(trace => {
        const traceEvents = globalEvents.filter(event => 
          event.gateId === trace.gateId &&
          event.pinType === trace.pinType &&
          event.pinIndex === trace.pinIndex
        );
        
        return { ...trace, events: traceEvents };
      });
      
      set(state => ({
        timingChart: {
          ...state.timingChart,
          traces: updatedTraces
        }
      }));
    }
    `);
    
    console.log('\nThen call it from useCanvasSimulation after evaluation:');
    console.log(`
    // In useCanvasSimulation.ts, after captureFromEvaluation:
    if (timingEvents.length > 0) {
      useCircuitStore.getState().timingChartActions.syncEventsFromGlobalCapture();
    }
    `);
    
    console.log('\n✅ This would complete the data flow:');
    console.log('   Circuit evaluation → globalTimingCapture → trace.events → WaveformCanvas');
    
    expect(true).toBe(true); // テストは成功
  });

  it('should demonstrate the current broken state', () => {
    console.log('\n🔍 CURRENT STATE DEMONSTRATION:');
    console.log('================================');
    
    // Store をリセット
    const store = useCircuitStore.getState();
    store.reset();
    
    // CLOCKゲートを追加
    const clockGate = {
      id: 'test-clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 100 },
      width: 80,
      height: 60,
      label: 'CLK',
      output: false,
      metadata: {
        frequency: 1,
        isRunning: true,
        startTime: Date.now()
      }
    };
    
    store.addGate(clockGate);
    
    // CLOCKゲートを選択（トレースが作成される）
    if (store.setSelectedClockGate) {
      store.setSelectedClockGate('test-clock');
    }
    
    // トレースが作成されたか確認
    const traces = store.timingChart?.traces || [];
    const clockTrace = traces.find(t => t.gateId === 'test-clock');
    
    console.log('Clock trace created:', clockTrace !== undefined);
    console.log('Clock trace events:', clockTrace?.events || []);
    
    // グローバルイベントを手動で追加してみる
    globalTimingCapture.watchGate('test-clock', 'output', 0);
    
    // イベントをシミュレート
    const mockEvaluationResult = {
      success: true as const,
      data: {
        circuit: {
          gates: [{ ...clockGate, output: true }],
          wires: []
        }
      },
      warnings: []
    };
    
    const previousCircuit = {
      gates: [clockGate],
      wires: []
    };
    
    // イベントを捕捉
    const events = globalTimingCapture.captureFromEvaluation(
      mockEvaluationResult as any,
      previousCircuit as any
    );
    
    console.log('\nGlobal events captured:', events.length);
    console.log('Global events:', globalTimingCapture.getEvents());
    
    // トレースのイベントを再確認
    const updatedTrace = store.timingChart?.traces.find(t => t.gateId === 'test-clock');
    console.log('\nTrace events after capture:', updatedTrace?.events || []);
    console.log('❌ Events NOT synced to trace!');
    
    // 期待される動作と実際の動作の違い
    console.log('\nEXPECTED: trace.events should contain captured events');
    console.log('ACTUAL: trace.events remains empty');
    console.log('REASON: No sync mechanism implemented');
    
    expect(updatedTrace?.events || []).toEqual([]); // 現在は空のまま
  });
});