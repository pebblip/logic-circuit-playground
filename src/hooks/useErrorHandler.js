// エラーハンドリング用カスタムフック

import { useState, useCallback } from 'react';

/**
 * エラーハンドリング用カスタムフック
 * @returns {Object} エラー状態と操作関数
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 非同期処理を安全に実行
  const executeAsync = useCallback(async (asyncFunction, errorMessage = 'エラーが発生しました') => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      console.error('Error in executeAsync:', err);
      setError({
        message: errorMessage,
        details: err.message || err.toString(),
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // 同期処理を安全に実行
  const execute = useCallback((func, errorMessage = 'エラーが発生しました') => {
    clearError();
    
    try {
      return func();
    } catch (err) {
      console.error('Error in execute:', err);
      setError({
        message: errorMessage,
        details: err.message || err.toString(),
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  }, [clearError]);

  return {
    error,
    isLoading,
    clearError,
    executeAsync,
    execute
  };
};