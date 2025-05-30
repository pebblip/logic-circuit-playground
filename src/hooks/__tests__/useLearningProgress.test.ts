import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLearningProgress } from '../useLearningProgress';

// LocalStorageモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useLearningProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useLearningProgress());

    expect(result.current.progress.currentLesson).toBe(1);
    expect(result.current.progress.currentStep).toBe(0);
    expect(result.current.progress.completedLessons).toEqual([]);
    expect(result.current.progress.achievements).toEqual([]);
  });

  it('保存された進捗を正しく読み込む', () => {
    const savedProgress = {
      currentLesson: 3,
      currentStep: 2,
      completedLessons: [1, 2],
      completedSteps: { 1: ['step1', 'step2'] },
      achievements: ['first_gate'],
      totalTimeSpent: 1800,
      lastActivity: '2023-01-01'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));

    const { result } = renderHook(() => useLearningProgress());

    expect(result.current.progress.currentLesson).toBe(3);
    expect(result.current.progress.completedLessons).toEqual([1, 2]);
    expect(result.current.progress.achievements).toEqual(['first_gate']);
  });

  it('レッスン進行が正しく動作する', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.advanceToLesson(2);
    });

    expect(result.current.progress.currentLesson).toBe(2);
    expect(result.current.progress.currentStep).toBe(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('ステップ完了が正しく記録される', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.completeStep(1, 'welcome');
    });

    expect(result.current.progress.completedSteps[1]).toContain('welcome');
    expect(result.current.progress.currentStep).toBe(1);
  });

  it('レッスン完了が正しく記録される', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.completeLesson(1);
    });

    expect(result.current.progress.completedLessons).toContain(1);
    expect(result.current.progress.currentLesson).toBe(2);
    expect(result.current.progress.currentStep).toBe(0);
  });

  it('アクティビティ記録で実績が解除される', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.recordActivity('gate_placed');
    });

    expect(result.current.progress.achievements).toContain('gate_placed');
  });

  it('統計が正しく計算される', () => {
    const { result } = renderHook(() => useLearningProgress());

    // 進捗を設定
    act(() => {
      result.current.completeLesson(1);
    });
    act(() => {
      result.current.completeLesson(2);
    });
    act(() => {
      result.current.completeLesson(3);
    });

    const stats = result.current.getStatistics();
    expect(stats.completionPercentage).toBe(50); // 3/6 * 100
    expect(stats.achievementsCount).toBeGreaterThanOrEqual(0);
  });

  it('進捗リセットが正しく動作する', () => {
    const { result } = renderHook(() => useLearningProgress());

    // 進捗を作る
    act(() => {
      result.current.completeLesson(1);
      result.current.recordActivity('gate_placed');
    });

    // リセット
    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.progress.currentLesson).toBe(1);
    expect(result.current.progress.completedLessons).toEqual([]);
    expect(result.current.progress.achievements).toEqual([]);
  });

  it('重複するステップ完了が処理される', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.completeStep(1, 'welcome');
      result.current.completeStep(1, 'welcome'); // 重複
    });

    // 重複は1つだけ記録される
    expect(result.current.progress.completedSteps[1]).toEqual(['welcome']);
  });

  it('重複するレッスン完了が処理される', () => {
    const { result } = renderHook(() => useLearningProgress());

    act(() => {
      result.current.completeLesson(1);
      result.current.completeLesson(1); // 重複
    });

    // 重複は1つだけ記録される
    expect(result.current.progress.completedLessons).toEqual([1]);
  });
});