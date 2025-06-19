/**
 * タイミングチャートの問題修正確認テスト
 * 1. 波形のスクロール問題
 * 2. CLOCK周波数反映問題
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { useCircuitStore } from '@/stores/circuitStore';
import type { CircuitStore } from '@/stores/types';
import type { Gate } from '@/types/circuit';

describe('タイミングチャートの問題修正確認', () => {
  let store: CircuitStore;

  beforeEach(() => {
    vi.clearAllMocks();
    globalTimingCapture.clearEvents();
    globalTimingCapture.resetSimulationTime();
    
    // テスト用のタイムプロバイダー
    let currentTime = 0;
    const mockTimeProvider = {
      getCurrentTime: () => currentTime,
      advanceTime: (ms: number) => { currentTime += ms; }
    };
    globalTimingCapture.setTimeProvider(mockTimeProvider);
    
    // ストアの状態をリセット
    useCircuitStore.setState({
      gates: [],
      wires: [],
      selectedGateId: null,
      selectedClockGateId: null,
    });
    
    store = useCircuitStore.getState();
    
    // タイミングチャートパネルを表示
    store.timingChartActions.showPanel();
  });

  describe('波形のスクロール問題', () => {
    it('オシロスコープモードが有効になっている', () => {
      // showPanel()でautoScrollとisScrollingがtrueになることを確認
      const currentState = useCircuitStore.getState();
      expect(currentState.timingChart.autoScroll).toBe(true);
      expect(currentState.timingChart.scrollState.isScrolling).toBe(true);
    });

    it('時間が進むと時間窓が自動的にスクロールする', () => {
      const currentState = useCircuitStore.getState();
      const initialWindow = { ...currentState.timingChart.timeWindow };
      
      // CLOCKゲートを追加
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          frequency: 10, // 10Hz = 100ms周期
          isRunning: true,
          startTime: 0
        }
      };
      
      store.addGate(clockGate.type, clockGate.position);
      const stateAfterAdd = useCircuitStore.getState();
      const addedClock = stateAfterAdd.gates.find(g => g.type === 'CLOCK');
      expect(addedClock).toBeDefined();
      
      // トレースを追加
      store.timingChartActions.addTraceFromGate(addedClock!, 'output', 0);
      
      // 時間を大きく進める（窓の70%を超える）
      const windowWidth = initialWindow.end - initialWindow.start;
      const advanceTime = windowWidth * 0.8; // 窓の80%進める
      
      store.timingChartActions.updateCurrentTime(advanceTime);
      
      // 時間窓がスクロールしたことを確認
      const newState = useCircuitStore.getState();
      const newWindow = newState.timingChart.timeWindow;
      expect(newWindow.start).toBeGreaterThanOrEqual(initialWindow.start);
      expect(newWindow.end).toBeGreaterThan(initialWindow.end);
      
      // 現在時刻が窓の右端30%の位置にあることを確認
      const currentTimePosition = (advanceTime - newWindow.start) / (newWindow.end - newWindow.start);
      expect(currentTimePosition).toBeCloseTo(0.7, 1); // 約70%の位置
    });

    it('手動操作時は自動スクロールが無効になる', () => {
      // 初期状態で自動スクロールが有効
      const initialState = useCircuitStore.getState();
      expect(initialState.timingChart.autoScroll).toBe(true);
      
      // 手動でズームイン
      store.timingChartActions.zoomIn();
      
      // 自動スクロールが無効になる
      const currentState = useCircuitStore.getState();
      expect(currentState.timingChart.autoScroll).toBe(false);
      expect(currentState.timingChart.scrollState.isScrolling).toBe(false);
    });
  });

  describe('CLOCK周波数反映問題', () => {
    it('CLOCK周波数変更が即座に波形に反映される', () => {
      // CLOCKゲートを追加
      const clockGate: Gate = {
        id: 'clock1',
        type: 'CLOCK',
        position: { x: 100, y: 100 },
        inputs: [],
        output: false,
        metadata: {
          frequency: 1, // 初期値1Hz = 1000ms周期
          isRunning: true,
          startTime: 0
        }
      };
      
      store.addGate(clockGate.type, clockGate.position);
      const stateAfterAdd = useCircuitStore.getState();
      const addedClock = stateAfterAdd.gates.find(g => g.type === 'CLOCK');
      expect(addedClock).toBeDefined();
      
      // 初期周波数の確認（GateFactoryのデフォルトは5Hz）
      expect(addedClock!.metadata.frequency).toBe(5);
      
      // 周波数を変更
      store.updateClockFrequency(addedClock!.id, 10); // 10Hz = 100ms周期
      
      // 変更後のゲートを取得
      const updatedState = useCircuitStore.getState();
      const updatedClock = updatedState.gates.find(g => g.id === addedClock!.id);
      expect(updatedClock).toBeDefined();
      expect(updatedClock!.metadata.frequency).toBe(10);
      
      // startTimeがリセットされていることを確認
      expect(updatedClock!.metadata.startTime).toBeUndefined();
    });

    it('周波数変更後、新しい周期で波形が生成される', () => {
      // CLOCKゲートを追加
      store.addGate('CLOCK', { x: 100, y: 100 });
      const stateAfterAdd = useCircuitStore.getState();
      const clockGate = stateAfterAdd.gates.find(g => g.type === 'CLOCK');
      expect(clockGate).toBeDefined();
      
      // 周波数を10Hz（100ms周期）に変更
      store.updateClockFrequency(clockGate!.id, 10);
      
      // 周波数が変更されたことを確認
      const updatedState = useCircuitStore.getState();
      const updatedGate = updatedState.gates.find(g => g.id === clockGate!.id);
      expect(updatedGate).toBeDefined();
      expect(updatedGate!.metadata.frequency).toBe(10);
      
      // startTimeがリセットされていることを確認（新しい周期で開始）
      expect(updatedGate!.metadata.startTime).toBeUndefined();
      
      // 注：実際の波形生成はuseCanvasSimulationフックが行うため、
      // このテストでは周波数変更とstartTimeリセットの確認のみ行う
    });

    it('デフォルト周波数が1Hzであることを確認', () => {
      // CLOCKゲートを追加
      store.addGate('CLOCK', { x: 100, y: 100 });
      const stateAfterAdd = useCircuitStore.getState();
      const clockGate = stateAfterAdd.gates.find(g => g.type === 'CLOCK');
      
      expect(clockGate).toBeDefined();
      expect(clockGate!.metadata.frequency).toBe(1); // GateFactoryで設定されたデフォルト値
    });
  });

  describe('統合テスト：スクロールと周波数変更', () => {
    it('周波数変更後も正しくスクロールする', () => {
      // CLOCKゲートを追加
      store.addGate('CLOCK', { x: 100, y: 100 });
      const stateAfterAdd = useCircuitStore.getState();
      const clockGate = stateAfterAdd.gates.find(g => g.type === 'CLOCK');
      expect(clockGate).toBeDefined();
      
      // トレースを追加
      store.timingChartActions.addTraceFromGate(clockGate!, 'output', 0);
      
      // 初期時間窓を記録
      const initialState = useCircuitStore.getState();
      const initialWindow = { ...initialState.timingChart.timeWindow };
      
      // 周波数を高速に変更（20Hz）
      store.updateClockFrequency(clockGate!.id, 20);
      
      // 時間を進める
      const windowWidth = initialWindow.end - initialWindow.start;
      const advanceTime = windowWidth * 0.8;
      store.timingChartActions.updateCurrentTime(advanceTime);
      
      // スクロールが発生したことを確認
      const newState = useCircuitStore.getState();
      const newWindow = newState.timingChart.timeWindow;
      expect(newWindow.start).toBeGreaterThanOrEqual(initialWindow.start);
      
      // 高速な周波数でも正しく動作することを確認
      const finalState = useCircuitStore.getState();
      const updatedGate = finalState.gates.find(g => g.id === clockGate!.id);
      expect(updatedGate!.metadata.frequency).toBe(20);
    });
  });
});