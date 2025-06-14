import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';

export interface ErrorSlice {
  setError: (message: string, type: 'connection' | 'general') => void;
  clearError: () => void;
}

export const createErrorSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ErrorSlice
> = (set) => ({
  setError: (message, type) => {
    set({
      errorMessage: message,
      errorType: type,
    });

    // 3秒後に自動的にエラーをクリア
    setTimeout(() => {
      set(state => {
        // 現在のエラーメッセージと同じ場合のみクリア（新しいエラーが設定されていない場合）
        if (state.errorMessage === message) {
          return {
            errorMessage: null,
            errorType: null,
          };
        }
        return state;
      });
    }, 3000);
  },

  clearError: () => {
    set({
      errorMessage: null,
      errorType: null,
    });
  },
});