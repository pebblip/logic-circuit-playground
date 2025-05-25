// useCircuitSimulation フックのテスト

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuitSimulation } from '../useCircuitSimulation';

describe('useCircuitSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockGates = [
    { id: 1, type: 'INPUT', value: true },
    { id: 2, type: 'INPUT', value: false },
    { id: 3, type: 'AND', value: null },
    { id: 4, type: 'OUTPUT', value: null }
  ];

  const mockConnections = [
    { from: 1, to: 3, toInput: 0 },
    { from: 2, to: 3, toInput: 1 },
    { from: 3, to: 4, toInput: 0 }
  ];

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      expect(result.current.simulation).toEqual({});
      expect(result.current.autoMode).toBe(false);
      expect(result.current.simulationSpeed).toBe(1);
      expect(result.current.clockSignal).toBe(false);
    });
  });

  describe('回路計算', () => {
    it('calculateCircuitWithGatesが正しく動作する', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      const simulation = result.current.calculateCircuitWithGates(mockGates);
      
      expect(simulation[1]).toBe(true);  // INPUT1
      expect(simulation[2]).toBe(false); // INPUT2
      expect(simulation[3]).toBe(false); // AND(true, false) = false
    });

    it('runCalculationが状態を更新する', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      act(() => {
        const simulation = result.current.runCalculation();
        expect(simulation[3]).toBe(false); // AND result
      });

      expect(result.current.simulation[1]).toBe(true);
      expect(result.current.simulation[2]).toBe(false);
      expect(result.current.simulation[3]).toBe(false);
    });
  });

  describe('自動実行モード', () => {
    it('toggleAutoModeが自動モードを切り替える', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      expect(result.current.autoMode).toBe(false);

      act(() => {
        result.current.toggleAutoMode();
      });

      expect(result.current.autoMode).toBe(true);

      act(() => {
        result.current.toggleAutoMode();
      });

      expect(result.current.autoMode).toBe(false);
    });

    it('自動モードでクロック信号が切り替わる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      // 自動モードを開始
      act(() => {
        result.current.toggleAutoMode();
      });

      expect(result.current.clockSignal).toBe(false);

      // 1秒進める（デフォルト速度は1Hz）
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.clockSignal).toBe(true);

      // さらに1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.clockSignal).toBe(false);
    });

    it('シミュレーション速度によってクロック間隔が変わる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      // 速度を2Hzに設定
      act(() => {
        result.current.updateSimulationSpeed(2);
      });

      // 自動モードを開始
      act(() => {
        result.current.toggleAutoMode();
      });

      expect(result.current.clockSignal).toBe(false);

      // 500ms進める（2Hzなので500msで切り替わるはず）
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.clockSignal).toBe(true);
    });

    it('自動モードを停止するとタイマーがクリアされる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      // 自動モードを開始
      act(() => {
        result.current.toggleAutoMode();
      });

      // クロック信号を変更
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.clockSignal).toBe(true);

      // 自動モードを停止
      act(() => {
        result.current.toggleAutoMode();
      });

      // 時間を進めてもクロック信号は変わらない
      const currentSignal = result.current.clockSignal;
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.clockSignal).toBe(currentSignal);
    });
  });

  describe('シミュレーション速度', () => {
    it('速度を正しく設定できる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      act(() => {
        result.current.updateSimulationSpeed(2.5);
      });

      expect(result.current.simulationSpeed).toBe(2.5);
    });

    it('速度が最小値でクランプされる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      act(() => {
        result.current.updateSimulationSpeed(0.1); // 最小値0.5未満
      });

      expect(result.current.simulationSpeed).toBe(0.5);
    });

    it('速度が最大値でクランプされる', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      act(() => {
        result.current.updateSimulationSpeed(10); // 最大値5を超える
      });

      expect(result.current.simulationSpeed).toBe(5);
    });
  });

  describe('リセット機能', () => {
    it('resetSimulationが全ての状態をリセットする', () => {
      const { result } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      // 状態を変更
      act(() => {
        result.current.runCalculation();
        result.current.toggleAutoMode();
        result.current.updateSimulationSpeed(3);
      });

      // 状態が変更されたことを確認
      expect(Object.keys(result.current.simulation).length).toBeGreaterThan(0);
      expect(result.current.autoMode).toBe(true);

      // リセット
      act(() => {
        result.current.resetSimulation();
      });

      // 全ての状態が初期値に戻る
      expect(result.current.simulation).toEqual({});
      expect(result.current.autoMode).toBe(false);
      expect(result.current.clockSignal).toBe(false);
      // 注: simulationSpeedはリセットされない（仕様による）
    });
  });

  describe('クリーンアップ', () => {
    it('コンポーネントのアンマウント時にタイマーがクリアされる', () => {
      const { result, unmount } = renderHook(() => 
        useCircuitSimulation(mockGates, mockConnections)
      );

      // 自動モードを開始
      act(() => {
        result.current.toggleAutoMode();
      });

      // タイマーIDを記録
      const activeTimers = vi.getTimerCount();
      expect(activeTimers).toBeGreaterThan(0);

      // アンマウント
      unmount();

      // タイマーがクリアされているはず
      act(() => {
        vi.runAllTimers();
      });
      // エラーが発生しないことを確認（タイマーが適切にクリアされている）
    });
  });
});