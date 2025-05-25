import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Undo/Redo機能を提供するカスタムフック
 * @param {*} initialState - 初期状態
 * @param {number} maxHistory - 保持する履歴の最大数
 * @returns {Object} 現在の状態と履歴操作関数
 */
export const useHistory = (initialState, maxHistory = 50) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInternalUpdate = useRef(false);

  // 現在の状態
  const current = history[currentIndex];

  // 新しい状態を履歴に追加
  const pushState = useCallback((newState) => {
    // isInternalUpdateフラグをチェックして、同じ状態の場合のみ無視
    if (isInternalUpdate.current) {
      const currentState = history[currentIndex];
      if (JSON.stringify(currentState) === JSON.stringify(newState)) {
        isInternalUpdate.current = false;
        return;
      }
      // 異なる状態の場合は、フラグをリセットして通常通り処理
      isInternalUpdate.current = false;
    }

    setHistory(prev => {
      // 現在位置より後の履歴を削除
      const newHistory = prev.slice(0, currentIndex + 1);
      // 新しい状態を追加
      newHistory.push(newState);
      
      // 最大履歴数を超えた場合、古い履歴を削除
      if (newHistory.length > maxHistory) {
        const trimmedHistory = newHistory.slice(newHistory.length - maxHistory);
        // インデックスも調整
        setCurrentIndex(trimmedHistory.length - 1);
        return trimmedHistory;
      }
      
      // インデックスを新しい履歴の最後に設定
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex, maxHistory, history]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isInternalUpdate.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return { state: history[newIndex], index: newIndex };
    }
    return null;
  }, [currentIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isInternalUpdate.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return { state: history[newIndex], index: newIndex };
    }
    return null;
  }, [currentIndex, history]);

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([current]);
    setCurrentIndex(0);
  }, [current]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    current,
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    clearHistory,
    historyLength: history.length,
    currentIndex
  };
};