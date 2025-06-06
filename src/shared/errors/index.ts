import React from 'react';
import { debug } from '../debug';

/**
 * 統一エラーハンドリングシステム
 *
 * 複数箇所で重複していたエラーハンドリングロジックを統一し、
 * 一貫性と保守性を向上させるユーティリティ
 */

/**
 * エラーハンドリングの設定オプション
 */
export interface ErrorHandlingOptions {
  /** エラーメッセージを受け取るコールバック */
  onError: (message: string, error?: unknown) => void;
  /** ローディング状態を管理するコールバック（省略可） */
  setLoading?: (isLoading: boolean) => void;
  /** 成功時のメッセージ（省略可） */
  successMessage?: string;
  /** デフォルトのエラーメッセージ */
  defaultErrorMessage?: string;
  /** コンソールにログを出力するかどうか */
  enableConsoleLog?: boolean;
  /** 操作名（ログ用） */
  operationName?: string;
}

/**
 * 操作結果の型
 */
export interface OperationResult<T> {
  /** 操作が成功したかどうか */
  success: boolean;
  /** 結果データ（成功時） */
  data?: T;
  /** エラーメッセージ（失敗時） */
  message?: string;
  /** 元のエラーオブジェクト（失敗時） */
  originalError?: unknown;
}

/**
 * 統一エラーハンドリングクラス
 */
export class ErrorHandler {
  /**
   * 非同期操作のエラーハンドリングを統一的に処理
   *
   * @template T - 操作の戻り値の型
   * @param operation - 実行する非同期操作
   * @param options - エラーハンドリングの設定
   * @returns 操作結果または null（失敗時）
   *
   * @example
   * ```typescript
   * // 基本的な使用例
   * const result = await ErrorHandler.handleAsync(
   *   () => circuitStorage.saveCircuit(name, gates, wires),
   *   {
   *     onError: (message) => setError(message),
   *     setLoading: setIsLoading,
   *     defaultErrorMessage: '回路の保存に失敗しました',
   *     operationName: '回路保存'
   *   }
   * );
   *
   * if (result) {
   *   debug.log('保存成功:', result);
   * }
   * ```
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    options: ErrorHandlingOptions
  ): Promise<T | null> {
    const {
      onError,
      setLoading,
      defaultErrorMessage = '操作に失敗しました',
      enableConsoleLog = true,
      operationName = '操作',
    } = options;

    // ローディング開始
    setLoading?.(true);

    try {
      if (enableConsoleLog) {
        debug.log(`🔄 ${operationName}を開始...`);
      }

      const result = await operation();

      if (enableConsoleLog) {
        debug.log(`✅ ${operationName}が成功しました`);
      }

      return result;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error, defaultErrorMessage);

      if (enableConsoleLog) {
        debug.error(`❌ ${operationName}に失敗:`, error);
      }

      onError(errorMessage, error);
      return null;
    } finally {
      // ローディング終了
      setLoading?.(false);
    }
  }

  /**
   * OperationResult形式の操作のエラーハンドリング
   *
   * @template T - 操作の戻り値の型
   * @param operation - OperationResultを返す非同期操作
   * @param options - エラーハンドリングの設定
   * @returns 操作結果
   *
   * @example
   * ```typescript
   * const result = await ErrorHandler.handleOperationResult(
   *   () => circuitStorage.loadCircuit(circuitId),
   *   {
   *     onError: (message) => setError(message),
   *     setLoading: setIsLoading,
   *     operationName: '回路読み込み'
   *   }
   * );
   *
   * if (result.success) {
   *   debug.log('読み込み成功:', result.data);
   * }
   * ```
   */
  static async handleOperationResult<T>(
    operation: () => Promise<OperationResult<T>>,
    options: ErrorHandlingOptions
  ): Promise<OperationResult<T>> {
    const {
      onError,
      setLoading,
      enableConsoleLog = true,
      operationName = '操作',
    } = options;

    // ローディング開始
    setLoading?.(true);

    try {
      if (enableConsoleLog) {
        debug.log(`🔄 ${operationName}を開始...`);
      }

      const result = await operation();

      if (result.success) {
        if (enableConsoleLog) {
          debug.log(`✅ ${operationName}が成功しました`);
        }
      } else {
        if (enableConsoleLog) {
          debug.warn(`⚠️ ${operationName}が失敗:`, result.message);
        }
        onError(result.message || '操作に失敗しました');
      }

      return result;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(
        error,
        '操作中にエラーが発生しました'
      );

      if (enableConsoleLog) {
        debug.error(`❌ ${operationName}でエラーが発生:`, error);
      }

      onError(errorMessage, error);

      return {
        success: false,
        message: errorMessage,
        originalError: error,
      };
    } finally {
      // ローディング終了
      setLoading?.(false);
    }
  }

  /**
   * 複数の非同期操作を順次実行
   *
   * @param operations - 実行する操作の配列
   * @param options - エラーハンドリングの設定
   * @returns 全ての操作が成功した場合はtrue
   */
  static async handleSequentialOperations(
    operations: Array<{
      operation: () => Promise<unknown>;
      name: string;
    }>,
    options: ErrorHandlingOptions
  ): Promise<boolean> {
    const { onError, setLoading, enableConsoleLog = true } = options;

    setLoading?.(true);

    try {
      for (const { operation, name } of operations) {
        if (enableConsoleLog) {
          debug.log(`🔄 ${name}を実行中...`);
        }

        await operation();

        if (enableConsoleLog) {
          debug.log(`✅ ${name}が完了`);
        }
      }

      return true;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(
        error,
        '操作の実行に失敗しました'
      );

      if (enableConsoleLog) {
        debug.error('❌ 操作シーケンスでエラーが発生:', error);
      }

      onError(errorMessage, error);
      return false;
    } finally {
      setLoading?.(false);
    }
  }

  /**
   * エラーオブジェクトから適切なエラーメッセージを抽出
   *
   * @param error - エラーオブジェクト
   * @param defaultMessage - デフォルトメッセージ
   * @returns 適切なエラーメッセージ
   */
  static extractErrorMessage(
    error: unknown,
    defaultMessage: string = '不明なエラーが発生しました'
  ): string {
    if (!error) {
      return defaultMessage;
    }

    // Error オブジェクトの場合
    if (error instanceof Error) {
      return error.message || defaultMessage;
    }

    // 文字列の場合
    if (typeof error === 'string') {
      return error || defaultMessage;
    }

    // オブジェクトで message プロパティがある場合
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as { message?: unknown; success?: boolean };
      if (typeof errorObj.message === 'string') {
        return errorObj.message || defaultMessage;
      }
      // OperationResult 形式の場合
      if (typeof errorObj.message === 'string' && errorObj.success === false) {
        return errorObj.message || defaultMessage;
      }
    }

    return defaultMessage;
  }

  /**
   * 統一されたエラーログ出力
   *
   * @param context - エラーが発生したコンテキスト
   * @param error - エラーオブジェクト
   * @param additionalInfo - 追加情報
   */
  static logError(
    context: string,
    error: unknown,
    additionalInfo?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    debug.error(`❌ [${timestamp}] ${context}`);

    if (error instanceof Error) {
      debug.error('Error:', error.message);
      debug.error('Stack:', error.stack);
    } else {
      debug.error('Error:', error);
    }

    if (additionalInfo) {
      debug.error('Additional Info:', additionalInfo);
    }
  }

  /**
   * 統一された警告ログ出力
   *
   * @param context - 警告が発生したコンテキスト
   * @param message - 警告メッセージ
   * @param additionalInfo - 追加情報
   */
  static logWarning(
    context: string,
    message: string,
    additionalInfo?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    debug.warn(`⚠️ [${timestamp}] ${context}`);
    debug.warn('Warning:', message);

    if (additionalInfo) {
      debug.warn('Additional Info:', additionalInfo);
    }
  }

  /**
   * 統一された情報ログ出力
   *
   * @param context - ログのコンテキスト
   * @param message - 情報メッセージ
   * @param additionalInfo - 追加情報
   */
  static logInfo(
    context: string,
    message: string,
    additionalInfo?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    debug.log(`ℹ️ [${timestamp}] ${context}: ${message}`);

    if (additionalInfo) {
      debug.log('Additional Info:', additionalInfo);
    }
  }
}

/**
 * React フックでの便利なヘルパー関数
 */

/**
 * エラーハンドリング付きの非同期操作フック
 *
 * @param defaultErrorMessage - デフォルトのエラーメッセージ
 * @returns エラーハンドリング用の関数とステート
 *
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const { executeAsync, isLoading, error, clearError } = useAsyncErrorHandler('操作に失敗しました');
 *
 *   const handleSave = () => {
 *     executeAsync(
 *       () => saveData(),
 *       { operationName: '保存' }
 *     );
 *   };
 *
 *   return (
 *     <div>
 *       {error && <div className="error">{error}</div>}
 *       <button onClick={handleSave} disabled={isLoading}>
 *         {isLoading ? '保存中...' : '保存'}
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useAsyncErrorHandler(defaultErrorMessage?: string) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const executeAsync = React.useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: Partial<ErrorHandlingOptions> = {}
    ): Promise<T | null> => {
      const result = await ErrorHandler.handleAsync(operation, {
        onError: setError,
        setLoading: setIsLoading,
        defaultErrorMessage,
        ...options,
      });

      return result;
    },
    [defaultErrorMessage]
  );

  const executeOperationResult = React.useCallback(
    async <T>(
      operation: () => Promise<OperationResult<T>>,
      options: Partial<ErrorHandlingOptions> = {}
    ): Promise<OperationResult<T>> => {
      const result = await ErrorHandler.handleOperationResult(operation, {
        onError: setError,
        setLoading: setIsLoading,
        defaultErrorMessage,
        ...options,
      });

      return result;
    },
    [defaultErrorMessage]
  );

  const clearError = React.useCallback(() => {
    setError('');
  }, []);

  return {
    executeAsync,
    executeOperationResult,
    isLoading,
    error,
    clearError,
    setError,
  };
}

/**
 * レガシー互換性のためのヘルパー関数
 */

/**
 * @deprecated ErrorHandler.handleAsync() を使用してください
 */
export async function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  onError: (msg: string) => void
): Promise<T | null> {
  return ErrorHandler.handleAsync(asyncFn, {
    onError,
    defaultErrorMessage: '操作に失敗しました',
  });
}

/**
 * @deprecated ErrorHandler.extractErrorMessage() を使用してください
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = '不明なエラー'
): string {
  return ErrorHandler.extractErrorMessage(error, defaultMessage);
}
