import { useState, useCallback, useEffect } from 'react';
import { AppMode, DEFAULT_MODE } from '../../../entities/types/mode';

const MODE_STORAGE_KEY = 'logic-circuit-mode';

/**
 * モード選択を管理するカスタムフック
 */
export const useModeSelection = () => {
  const [currentMode, setCurrentMode] = useState<AppMode | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // 初回読み込み時にローカルストレージから読み込み
  useEffect(() => {
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode && ['learning', 'free', 'puzzle'].includes(storedMode)) {
      setCurrentMode(storedMode as AppMode);
      setIsFirstVisit(false);
    }
  }, []);

  const selectMode = useCallback((mode: AppMode) => {
    setCurrentMode(mode);
    setIsFirstVisit(false);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, []);

  const resetMode = useCallback(() => {
    setCurrentMode(null);
    setIsFirstVisit(true);
    localStorage.removeItem(MODE_STORAGE_KEY);
  }, []);

  return {
    currentMode,
    isFirstVisit,
    needsModeSelection: currentMode === null,
    selectMode,
    resetMode,
  };
};