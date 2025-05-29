import { useState, useCallback, useEffect } from 'react';
import { AppMode, DEFAULT_MODE, MODE_CONFIGS } from '@/types/mode';

interface UseAppModeResult {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  modeConfig: typeof MODE_CONFIGS[AppMode];
  availableModes: AppMode[];
  isLearningMode: boolean;
  isFreeMode: boolean;
  isPuzzleMode: boolean;
}

/**
 * アプリケーションのモード状態を管理するカスタムフック
 * - モード切り替え
 * - モード設定の取得
 * - ローカルストレージでの永続化
 */
export const useAppMode = (): UseAppModeResult => {
  // ローカルストレージからモードを復元（初回はデフォルト）
  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('circuit-app-mode');
      if (saved && (saved === 'learning' || saved === 'free' || saved === 'puzzle')) {
        return saved as AppMode;
      }
    }
    return DEFAULT_MODE;
  });

  // モード変更時にローカルストレージに保存
  const setMode = useCallback((mode: AppMode) => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('circuit-app-mode', mode);
    }
  }, []);

  // 現在のモード設定を取得
  const modeConfig = MODE_CONFIGS[currentMode];

  // 利用可能なモード一覧
  const availableModes: AppMode[] = ['learning', 'free', 'puzzle'];

  // モード判定ヘルパー
  const isLearningMode = currentMode === 'learning';
  const isFreeMode = currentMode === 'free';
  const isPuzzleMode = currentMode === 'puzzle';

  // デバッグ用ログ（開発時のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 App Mode changed to: ${currentMode}`, modeConfig);
    }
  }, [currentMode, modeConfig]);

  return {
    currentMode,
    setMode,
    modeConfig,
    availableModes,
    isLearningMode,
    isFreeMode,
    isPuzzleMode,
  };
};