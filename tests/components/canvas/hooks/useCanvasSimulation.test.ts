/**
 * useCanvasSimulation フックのテスト
 * CLOCKゲートシミュレーションロジックの動作確認
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCanvasSimulation } from '@/components/canvas/hooks/useCanvasSimulation';
import { useCircuitStore } from '@/stores/circuitStore';
import { globalTimingCapture } from '@/domain/timing/timingCapture';
import { EnhancedHybridEvaluator } from '@/domain/simulation/event-driven-minimal';
import type { Gate } from '@/types/circuit';

// モックの設定
vi.mock('@/stores/circuitStore');
vi.mock('@/domain/timing/timingCapture');
vi.mock('@/domain/simulation/event-driven-minimal');
vi.mock('@/infrastructure/errorHandler', () => ({
  handleError: vi.fn()
}));

describe('useCanvasSimulation', () => {
  const mockGetState = vi.fn();
  const mockSetState = vi.fn();
  const mockEvaluate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // useCircuitStore.getStateのモック
    (useCircuitStore as any).getState = mockGetState;
    (useCircuitStore as any).setState = mockSetState;
    
    // EnhancedHybridEvaluatorのモック
    (EnhancedHybridEvaluator as any).mockImplementation(() => ({
      evaluate: mockEvaluate
    }));
    
    // globalTimingCaptureのモック
    (globalTimingCapture as any).resetSimulationTime = vi.fn();
    (globalTimingCapture as any).setSimulationStartTime = vi.fn();
    (globalTimingCapture as any).captureFromEvaluation = vi.fn().mockReturnValue([]);
    (globalTimingCapture as any).getCurrentSimulationTime = vi.fn().mockReturnValue(0);
    (globalTimingCapture as any).watchGate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('プレビューモードでは何もしない', () => {
    const displayGates: Gate[] = [];
    const isReadOnly = true;
    
    renderHook(() => useCanvasSimulation({ displayGates, isReadOnly }));
    
    vi.advanceTimersByTime(1000);
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('実行中のCLOCKゲートがない場合は何もしない', () => {
    const displayGates: Gate[] = [
      {
        id: 'gate-1',
        type: 'AND',
        position: { x: 100, y: 100 },
        inputs: ['0', '1'],
        output: false
      }
    ];
    const isReadOnly = false;
    
    renderHook(() => useCanvasSimulation({ displayGates, isReadOnly }));
    
    vi.advanceTimersByTime(1000);
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('実行中のCLOCKゲートがある場合、定期的に回路を評価する', () => {
    const clockGate: Gate = {
      id: 'clock-1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      output: true,
      metadata: {
        isRunning: true,
        frequency: 10 // 10Hz
      }
    };
    
    const displayGates = [clockGate];
    const isReadOnly = false;
    
    // モックの設定
    mockGetState.mockReturnValue({
      gates: [clockGate],
      wires: [],
      timingChartActions: {
        resetView: vi.fn(),
        startContinuousScroll: vi.fn(),
        updateCurrentTime: vi.fn(),
        processTimingEvents: vi.fn(),
        addTraceFromGate: vi.fn()
      },
      timingChart: {
        traces: []
      }
    });
    
    mockEvaluate.mockReturnValue({
      circuit: {
        gates: [{ ...clockGate, output: !clockGate.output }],
        wires: []
      }
    });
    
    renderHook(() => useCanvasSimulation({ displayGates, isReadOnly }));
    
    // タイミングチャートの初期化を確認
    expect(globalTimingCapture.resetSimulationTime).toHaveBeenCalled();
    expect(globalTimingCapture.setSimulationStartTime).toHaveBeenCalled();
    
    // 100ms後に評価が実行されることを確認（10Hzなので25ms間隔）
    vi.advanceTimersByTime(100);
    expect(mockEvaluate).toHaveBeenCalled();
    expect(mockSetState).toHaveBeenCalled();
  });

  it('CLOCKゲートの周波数に応じて更新間隔を調整する', () => {
    const highFreqClock: Gate = {
      id: 'clock-1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      output: true,
      metadata: {
        isRunning: true,
        frequency: 20 // 20Hz（最高周波数）
      }
    };
    
    const displayGates = [highFreqClock];
    const isReadOnly = false;
    
    mockGetState.mockReturnValue({
      gates: [highFreqClock],
      wires: [],
      timingChartActions: {
        resetView: vi.fn(),
        startContinuousScroll: vi.fn(),
        updateCurrentTime: vi.fn(),
        processTimingEvents: vi.fn(),
        addTraceFromGate: vi.fn()
      },
      timingChart: {
        traces: []
      }
    });
    
    mockEvaluate.mockReturnValue({
      circuit: {
        gates: [highFreqClock],
        wires: []
      }
    });
    
    renderHook(() => useCanvasSimulation({ displayGates, isReadOnly }));
    
    // 初期評価をクリア
    vi.clearAllMocks();
    
    // 20Hzの場合、12.5ms間隔で更新されることを確認
    vi.advanceTimersByTime(12);
    expect(mockEvaluate).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1); // 13ms経過
    expect(mockEvaluate).toHaveBeenCalled();
  });

  it('エラーが発生した場合、適切にハンドリングする', () => {
    const clockGate: Gate = {
      id: 'clock-1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      output: true,
      metadata: {
        isRunning: true,
        frequency: 10
      }
    };
    
    const displayGates = [clockGate];
    const isReadOnly = false;
    
    mockGetState.mockReturnValue({
      gates: [clockGate],
      wires: []
    });
    
    // 評価時にエラーを発生させる
    mockEvaluate.mockImplementation(() => {
      throw new Error('回路評価エラー');
    });
    
    const { unmount } = renderHook(() => 
      useCanvasSimulation({ displayGates, isReadOnly })
    );
    
    // エラーが発生してもクラッシュしないことを確認
    vi.advanceTimersByTime(100);
    
    // アンマウント時にインターバルがクリアされることを確認
    unmount();
    vi.advanceTimersByTime(100);
    // これ以上評価が実行されないことを確認
    const callCount = mockEvaluate.mock.calls.length;
    vi.advanceTimersByTime(100);
    expect(mockEvaluate).toHaveBeenCalledTimes(callCount);
  });

  it('CLOCKゲートが停止したら評価を停止する', () => {
    const clockGate: Gate = {
      id: 'clock-1',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      output: true,
      metadata: {
        isRunning: true,
        frequency: 10
      }
    };
    
    const displayGates = [clockGate];
    const isReadOnly = false;
    
    // 最初は実行中
    mockGetState
      .mockReturnValueOnce({
        gates: [clockGate],
        wires: [],
        timingChartActions: {
          resetView: vi.fn(),
          startContinuousScroll: vi.fn()
        },
        timingChart: { traces: [] }
      })
      // setIntervalのコールバックで呼ばれる時は停止状態
      .mockReturnValue({
        gates: [{ ...clockGate, metadata: { ...clockGate.metadata, isRunning: false } }],
        wires: []
      });
    
    renderHook(() => useCanvasSimulation({ displayGates, isReadOnly }));
    
    // 初期化処理をクリア
    vi.clearAllMocks();
    
    vi.advanceTimersByTime(100);
    // 停止状態では評価が実行されないことを確認
    expect(mockEvaluate).not.toHaveBeenCalled();
  });
});