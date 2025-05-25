// useErrorHandler フックのテスト（修正版）

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    // console.errorをモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('同期処理のエラーハンドリング', () => {
    it('executeが成功した場合、結果を返す', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      let executionResult;
      act(() => {
        executionResult = result.current.execute(() => {
          return 'success';
        });
      });

      expect(executionResult).toBe('success');
      expect(result.current.error).toBe(null);
    });

    it('executeでエラーが発生した場合、エラーを設定する', () => {
      const { result } = renderHook(() => useErrorHandler());
      const testError = new Error('Test error');
      
      let thrownError;
      act(() => {
        try {
          result.current.execute(() => {
            throw testError;
          }, 'カスタムエラーメッセージ');
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(testError);
      expect(result.current.error).toMatchObject({
        message: 'カスタムエラーメッセージ',
        details: 'Test error',
        timestamp: expect.any(String)
      });
      expect(console.error).toHaveBeenCalledWith('Error in execute:', testError);
    });

    it('エラーメッセージのデフォルト値が使用される', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        try {
          result.current.execute(() => {
            throw new Error('Some error');
          });
        } catch (e) {
          // エラーを無視
        }
      });

      expect(result.current.error.message).toBe('エラーが発生しました');
    });
  });

  describe('非同期処理のエラーハンドリング', () => {
    it('executeAsyncが成功した場合、結果を返す', async () => {
      const { result } = renderHook(() => useErrorHandler());
      
      let executionResult;
      await act(async () => {
        executionResult = await result.current.executeAsync(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async success';
        });
      });

      expect(executionResult).toBe('async success');
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it('executeAsync実行中はisLoadingがtrueになる', async () => {
      const { result } = renderHook(() => useErrorHandler());
      
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      // 非同期処理を開始（完了を待たない）
      act(() => {
        result.current.executeAsync(async () => {
          await promise;
          return 'result';
        });
      });

      // 実行中の状態を確認
      expect(result.current.isLoading).toBe(true);

      // Promiseを解決
      await act(async () => {
        resolvePromise();
        await promise;
      });

      // 実行後の状態を確認
      expect(result.current.isLoading).toBe(false);
    });

    it('executeAsyncでエラーが発生した場合、エラーを設定する', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const testError = new Error('Async test error');
      
      let thrownError;
      await act(async () => {
        try {
          await result.current.executeAsync(async () => {
            throw testError;
          }, '非同期エラー');
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(testError);
      expect(result.current.error).toMatchObject({
        message: '非同期エラー',
        details: 'Async test error',
        timestamp: expect.any(String)
      });
      expect(result.current.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error in executeAsync:', testError);
    });

    it('executeAsync実行前にエラーがクリアされる', async () => {
      const { result } = renderHook(() => useErrorHandler());
      
      // 最初にエラーを設定
      act(() => {
        try {
          result.current.execute(() => {
            throw new Error('First error');
          });
        } catch (e) {
          // エラーを無視
        }
      });

      expect(result.current.error).not.toBe(null);

      // 新しい非同期処理を実行
      await act(async () => {
        await result.current.executeAsync(async () => {
          return 'success';
        });
      });

      // エラーがクリアされている
      expect(result.current.error).toBe(null);
    });
  });

  describe('エラーのクリア', () => {
    it('clearErrorでエラーをクリアできる', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      // エラーを設定
      act(() => {
        try {
          result.current.execute(() => {
            throw new Error('Error to clear');
          });
        } catch (e) {
          // エラーを無視
        }
      });

      expect(result.current.error).not.toBe(null);

      // エラーをクリア
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('エラーの詳細情報', () => {
    it('Errorオブジェクト以外のthrowも処理できる', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        try {
          result.current.execute(() => {
            throw 'String error'; // 文字列をthrow
          });
        } catch (e) {
          // エラーを無視
        }
      });

      expect(result.current.error).toMatchObject({
        message: 'エラーが発生しました',
        details: 'String error'
      });
    });

    it('タイムスタンプが正しいフォーマットで記録される', () => {
      const { result } = renderHook(() => useErrorHandler());
      const beforeTime = new Date().toISOString();
      
      act(() => {
        try {
          result.current.execute(() => {
            throw new Error('Timestamp test');
          });
        } catch (e) {
          // エラーを無視
        }
      });

      const afterTime = new Date().toISOString();
      
      expect(result.current.error.timestamp).toBeDefined();
      expect(new Date(result.current.error.timestamp).getTime())
        .toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
      expect(new Date(result.current.error.timestamp).getTime())
        .toBeLessThanOrEqual(new Date(afterTime).getTime());
    });
  });

  describe('複数の操作', () => {
    it('連続して操作を実行できる', async () => {
      const { result } = renderHook(() => useErrorHandler());
      
      // 同期処理の成功
      let result1;
      act(() => {
        result1 = result.current.execute(() => 'sync');
      });
      expect(result1).toBe('sync');

      // 非同期処理の成功
      let result2;
      await act(async () => {
        result2 = await result.current.executeAsync(async () => 'async');
      });
      expect(result2).toBe('async');

      // エラーケース
      act(() => {
        try {
          result.current.execute(() => {
            throw new Error('Error case');
          });
        } catch (e) {
          // エラーを無視
        }
      });

      expect(result.current.error).not.toBe(null);

      // クリアして再度成功ケース
      let result3;
      act(() => {
        result.current.clearError();
        result3 = result.current.execute(() => 'after clear');
      });
      expect(result3).toBe('after clear');
      expect(result.current.error).toBe(null);
    });
  });
});