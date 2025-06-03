import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ErrorHandler, useAsyncErrorHandler, handleAsyncError, getErrorMessage } from './errorHandling';

describe('統一エラーハンドリングシステム', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // console.logをモック
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('ErrorHandler', () => {
    describe('handleAsync', () => {
      it('成功時は結果を返す', async () => {
        const operation = vi.fn().mockResolvedValue('success result');
        const onError = vi.fn();
        const setLoading = vi.fn();

        const result = await ErrorHandler.handleAsync(operation, {
          onError,
          setLoading,
          operationName: 'テスト操作'
        });

        expect(result).toBe('success result');
        expect(operation).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(console.log).toHaveBeenCalledWith('🔄 テスト操作を開始...');
        expect(console.log).toHaveBeenCalledWith('✅ テスト操作が成功しました');
      });

      it('失敗時はnullを返しエラーハンドラーを呼ぶ', async () => {
        const error = new Error('テストエラー');
        const operation = vi.fn().mockRejectedValue(error);
        const onError = vi.fn();
        const setLoading = vi.fn();

        const result = await ErrorHandler.handleAsync(operation, {
          onError,
          setLoading,
          defaultErrorMessage: 'デフォルトエラー',
          operationName: 'テスト操作'
        });

        expect(result).toBeNull();
        expect(onError).toHaveBeenCalledWith('テストエラー', error);
        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(console.error).toHaveBeenCalledWith('❌ テスト操作に失敗:', error);
      });

      it('setLoadingが省略された場合でも動作する', async () => {
        const operation = vi.fn().mockResolvedValue('success');
        const onError = vi.fn();

        const result = await ErrorHandler.handleAsync(operation, {
          onError
        });

        expect(result).toBe('success');
      });

      it('enableConsoleLogがfalseの場合はログを出力しない', async () => {
        const operation = vi.fn().mockResolvedValue('success');
        const onError = vi.fn();

        await ErrorHandler.handleAsync(operation, {
          onError,
          enableConsoleLog: false,
          operationName: 'テスト操作'
        });

        expect(console.log).not.toHaveBeenCalled();
      });
    });

    describe('handleOperationResult', () => {
      it('成功時の結果を正しく処理する', async () => {
        const successResult = { success: true, data: 'test data' };
        const operation = vi.fn().mockResolvedValue(successResult);
        const onError = vi.fn();

        const result = await ErrorHandler.handleOperationResult(operation, {
          onError,
          operationName: 'テスト操作'
        });

        expect(result).toBe(successResult);
        expect(onError).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('✅ テスト操作が成功しました');
      });

      it('失敗時の結果を正しく処理する', async () => {
        const failureResult = { success: false, message: '操作に失敗しました' };
        const operation = vi.fn().mockResolvedValue(failureResult);
        const onError = vi.fn();

        const result = await ErrorHandler.handleOperationResult(operation, {
          onError,
          operationName: 'テスト操作'
        });

        expect(result).toBe(failureResult);
        expect(onError).toHaveBeenCalledWith('操作に失敗しました');
        expect(console.warn).toHaveBeenCalledWith('⚠️ テスト操作が失敗:', '操作に失敗しました');
      });

      it('例外が発生した場合は失敗結果を返す', async () => {
        const error = new Error('例外エラー');
        const operation = vi.fn().mockRejectedValue(error);
        const onError = vi.fn();

        const result = await ErrorHandler.handleOperationResult(operation, {
          onError,
          operationName: 'テスト操作'
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe('例外エラー');
        expect(result.originalError).toBe(error);
        expect(onError).toHaveBeenCalledWith('例外エラー', error);
      });
    });

    describe('handleSequentialOperations', () => {
      it('全ての操作が成功した場合はtrueを返す', async () => {
        const operation1 = vi.fn().mockResolvedValue('result1');
        const operation2 = vi.fn().mockResolvedValue('result2');
        const onError = vi.fn();

        const result = await ErrorHandler.handleSequentialOperations([
          { operation: operation1, name: '操作1' },
          { operation: operation2, name: '操作2' }
        ], {
          onError,
          operationName: 'テスト操作'
        });

        expect(result).toBe(true);
        expect(operation1).toHaveBeenCalled();
        expect(operation2).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
      });

      it('途中で失敗した場合はfalseを返す', async () => {
        const operation1 = vi.fn().mockResolvedValue('result1');
        const operation2 = vi.fn().mockRejectedValue(new Error('操作2失敗'));
        const operation3 = vi.fn().mockResolvedValue('result3');
        const onError = vi.fn();

        const result = await ErrorHandler.handleSequentialOperations([
          { operation: operation1, name: '操作1' },
          { operation: operation2, name: '操作2' },
          { operation: operation3, name: '操作3' }
        ], {
          onError,
          operationName: 'テスト操作'
        });

        expect(result).toBe(false);
        expect(operation1).toHaveBeenCalled();
        expect(operation2).toHaveBeenCalled();
        expect(operation3).not.toHaveBeenCalled(); // 失敗後は実行されない
        expect(onError).toHaveBeenCalledWith('操作2失敗', expect.any(Error));
      });
    });

    describe('extractErrorMessage', () => {
      it('Errorオブジェクトからメッセージを抽出する', () => {
        const error = new Error('テストエラーメッセージ');
        const message = ErrorHandler.extractErrorMessage(error);

        expect(message).toBe('テストエラーメッセージ');
      });

      it('文字列エラーを処理する', () => {
        const message = ErrorHandler.extractErrorMessage('文字列エラー');

        expect(message).toBe('文字列エラー');
      });

      it('messageプロパティを持つオブジェクトを処理する', () => {
        const errorObj = { message: 'オブジェクトエラー' };
        const message = ErrorHandler.extractErrorMessage(errorObj);

        expect(message).toBe('オブジェクトエラー');
      });

      it('OperationResult形式のエラーを処理する', () => {
        const errorObj = { success: false, message: 'Operation失敗' };
        const message = ErrorHandler.extractErrorMessage(errorObj);

        expect(message).toBe('Operation失敗');
      });

      it('未知の形式の場合はデフォルトメッセージを返す', () => {
        const message = ErrorHandler.extractErrorMessage(123);

        expect(message).toBe('不明なエラーが発生しました');
      });

      it('カスタムデフォルトメッセージを使用する', () => {
        const message = ErrorHandler.extractErrorMessage(null, 'カスタムデフォルト');

        expect(message).toBe('カスタムデフォルト');
      });
    });

    describe('ログ機能', () => {
      it('logErrorが正しくログを出力する', () => {
        const error = new Error('テストエラー');
        const additionalInfo = { userId: 123 };

        ErrorHandler.logError('テストコンテキスト', error, additionalInfo);

        expect(console.error).toHaveBeenCalledWith('Error:', 'テストエラー');
        expect(console.error).toHaveBeenCalledWith('Additional Info:', additionalInfo);
      });

      it('logWarningが正しくログを出力する', () => {
        const additionalInfo = { action: 'test' };

        ErrorHandler.logWarning('テストコンテキスト', '警告メッセージ', additionalInfo);

        expect(console.warn).toHaveBeenCalledWith('Warning:', '警告メッセージ');
        expect(console.warn).toHaveBeenCalledWith('Additional Info:', additionalInfo);
      });

      it('logInfoが正しくログを出力する', () => {
        const additionalInfo = { step: 1 };

        ErrorHandler.logInfo('テストコンテキスト', '情報メッセージ', additionalInfo);

        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ℹ️'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('テストコンテキスト: 情報メッセージ'));
        expect(console.log).toHaveBeenCalledWith('Additional Info:', additionalInfo);
      });
    });
  });

  describe('useAsyncErrorHandler', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useAsyncErrorHandler('デフォルトエラー'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');
    });

    it('executeAsyncが正しく動作する', async () => {
      const { result } = renderHook(() => useAsyncErrorHandler());

      const operation = vi.fn().mockResolvedValue('成功結果');

      let asyncResult: any;
      await act(async () => {
        asyncResult = await result.current.executeAsync(operation, {
          operationName: 'テスト操作'
        });
      });

      expect(asyncResult).toBe('成功結果');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');
    });

    it('executeAsyncでエラーが発生した場合の処理', async () => {
      const { result } = renderHook(() => useAsyncErrorHandler('デフォルトエラー'));

      const operation = vi.fn().mockRejectedValue(new Error('テストエラー'));

      let asyncResult: any;
      await act(async () => {
        asyncResult = await result.current.executeAsync(operation);
      });

      expect(asyncResult).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('テストエラー');
    });

    it('executeOperationResultが正しく動作する', async () => {
      const { result } = renderHook(() => useAsyncErrorHandler());

      const operation = vi.fn().mockResolvedValue({ success: true, data: 'データ' });

      let asyncResult: any;
      await act(async () => {
        asyncResult = await result.current.executeOperationResult(operation);
      });

      expect(asyncResult.success).toBe(true);
      expect(asyncResult.data).toBe('データ');
      expect(result.current.error).toBe('');
    });

    it('clearErrorが正しく動作する', async () => {
      const { result } = renderHook(() => useAsyncErrorHandler());

      // エラーを設定
      await act(async () => {
        await result.current.executeAsync(() => Promise.reject(new Error('テストエラー')));
      });

      expect(result.current.error).toBe('テストエラー');

      // エラーをクリア
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe('');
    });
  });

  describe('レガシー互換性関数', () => {
    it('handleAsyncErrorが正しく動作する', async () => {
      const operation = vi.fn().mockResolvedValue('成功');
      const onError = vi.fn();

      const result = await handleAsyncError(operation, onError);

      expect(result).toBe('成功');
      expect(onError).not.toHaveBeenCalled();
    });

    it('getErrorMessageが正しく動作する', () => {
      const error = new Error('テストエラー');
      const message = getErrorMessage(error, 'デフォルト');

      expect(message).toBe('テストエラー');
    });
  });
});