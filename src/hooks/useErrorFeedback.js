// エラーフィードバック用のカスタムフック

import { useState, useEffect, useCallback } from 'react';
import { analyzeCircuitErrors, generateFixSuggestions } from '../utils/errorAnalysis';

/**
 * エラーフィードバックを管理するカスタムフック
 */
export const useErrorFeedback = (gates, connections, objective) => {
  const [errors, setErrors] = useState([]);
  const [dismissedErrors, setDismissedErrors] = useState(new Set());

  // エラー分析を実行
  useEffect(() => {
    const analyzeErrors = () => {
      const detectedErrors = analyzeCircuitErrors(gates, connections, objective);
      
      // IDを持たないエラーにIDを付与
      const errorsWithIds = detectedErrors.map((error, index) => ({
        ...error,
        id: error.id || `error-${Date.now()}-${index}`,
        timestamp: Date.now()
      }));

      // 既に解決されたエラーをチェック
      const updatedErrors = errorsWithIds.map(error => {
        // 以前のエラーと比較して解決されたかチェック
        const previousError = errors.find(e => e.id === error.id);
        if (previousError && !error.resolved) {
          // エラーが継続している場合は、前回の状態を保持
          return {
            ...error,
            resolved: false
          };
        }
        return error;
      });

      // 解決されたエラーをマーク
      const resolvedErrors = errors.filter(oldError => 
        !updatedErrors.some(newError => newError.id === oldError.id)
      ).map(error => ({
        ...error,
        resolved: true
      }));

      // 新しいエラーと解決されたエラーを結合
      const allErrors = [
        ...updatedErrors.filter(e => !dismissedErrors.has(e.id)),
        ...resolvedErrors.filter(e => !dismissedErrors.has(e.id))
      ];

      setErrors(allErrors);
    };

    // デバウンスして実行
    const timer = setTimeout(analyzeErrors, 500);
    return () => clearTimeout(timer);
  }, [gates, connections, objective, dismissedErrors]);

  // エラーを削除
  const dismissError = useCallback((errorId) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  // すべてのエラーをクリア
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setDismissedErrors(new Set());
  }, []);

  // 特定のタイプのエラーを取得
  const getErrorsByType = useCallback((type) => {
    return errors.filter(e => e.type === type && !e.resolved);
  }, [errors]);

  // エラーの重要度でソート
  const getSortedErrors = useCallback(() => {
    const priority = { error: 0, warning: 1, info: 2 };
    return [...errors].sort((a, b) => {
      const priorityDiff = priority[a.level] - priority[b.level];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }, [errors]);

  // 自動修正の提案を適用
  const applyAutoFix = useCallback((errorId, action) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !action) return null;

    // アクションを返す（実際の適用は親コンポーネントで行う）
    return action;
  }, [errors]);

  // エラーの統計情報
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errors.filter(e => !e.resolved).length,
      byLevel: {
        error: errors.filter(e => e.level === 'error' && !e.resolved).length,
        warning: errors.filter(e => e.level === 'warning' && !e.resolved).length,
        info: errors.filter(e => e.level === 'info' && !e.resolved).length
      },
      byType: {
        connection: errors.filter(e => e.type === 'connection' && !e.resolved).length,
        logic: errors.filter(e => e.type === 'logic' && !e.resolved).length,
        structure: errors.filter(e => e.type === 'structure' && !e.resolved).length,
        timing: errors.filter(e => e.type === 'timing' && !e.resolved).length
      },
      resolved: errors.filter(e => e.resolved).length
    };
    return stats;
  }, [errors]);

  // 特定のゲートに関連するエラーを取得
  const getErrorsForGate = useCallback((gateId) => {
    return errors.filter(e => e.gateId === gateId && !e.resolved);
  }, [errors]);

  // エラーが存在するかチェック
  const hasErrors = useCallback((level = null) => {
    if (level) {
      return errors.some(e => e.level === level && !e.resolved);
    }
    return errors.some(e => !e.resolved);
  }, [errors]);

  // エラーメッセージを結合して取得
  const getErrorSummary = useCallback(() => {
    const activeErrors = errors.filter(e => !e.resolved);
    if (activeErrors.length === 0) return null;

    const errorCount = activeErrors.filter(e => e.level === 'error').length;
    const warningCount = activeErrors.filter(e => e.level === 'warning').length;

    let summary = '';
    if (errorCount > 0) {
      summary += `${errorCount}個のエラー`;
    }
    if (warningCount > 0) {
      if (summary) summary += '、';
      summary += `${warningCount}個の警告`;
    }

    return summary;
  }, [errors]);

  return {
    errors: getSortedErrors(),
    dismissError,
    clearAllErrors,
    getErrorsByType,
    applyAutoFix,
    errorStats: getErrorStats(),
    getErrorsForGate,
    hasErrors,
    errorSummary: getErrorSummary()
  };
};