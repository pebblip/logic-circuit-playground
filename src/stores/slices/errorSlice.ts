/**
 * ErrorSlice - 統一エラーハンドリングシステム
 *
 * 既存の単純なエラーシステムから統一エラーハンドリングシステムに移行。
 * 後方互換性を保ちながら新機能を提供。
 */

import type { StateCreator } from 'zustand';
import type { CircuitStore } from '../types';

// 新しいエラー通知の型定義
export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  userMessage: string;
  context?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    isPrimary?: boolean;
  }>;
  duration?: number;
  timestamp: number;
  dismissed?: boolean;
}

// テスト用インターフェース定義
export interface ErrorState {
  notifications: ErrorNotification[];
  maxNotifications: number;
  isVisible: boolean;
}

export interface ErrorActions {
  showErrorNotification: (
    notification: Omit<ErrorNotification, 'id' | 'timestamp'>
  ) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
  setVisibility: (visible: boolean) => void;
  dismissErrorsByType: (type: ErrorNotification['type']) => void;
  cleanupOldErrors: (maxAge: number) => void;
}

// 後方互換性のため既存インターフェースを保持
export interface ErrorSlice {
  // 🆕 新しい統一エラーハンドリング
  notifications: ErrorNotification[];
  maxNotifications: number;
  isVisible: boolean;

  showErrorNotification: (
    notification: Omit<ErrorNotification, 'id' | 'timestamp'>
  ) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
  setVisibility: (visible: boolean) => void;
  dismissErrorsByType: (type: ErrorNotification['type']) => void;
  cleanupOldErrors: (maxAge: number) => void;

  // 🔄 既存APIとの互換性（内部的に新システムを使用）
  setError: (message: string, type: 'connection' | 'general') => void;
  clearError: () => void;
}

// ID生成ユーティリティ
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 重複チェック関数
const isDuplicate = (
  notifications: ErrorNotification[],
  newNotification: Omit<ErrorNotification, 'id' | 'timestamp'>
): boolean => {
  return notifications.some(
    existing =>
      existing.title === newNotification.title &&
      existing.context === newNotification.context &&
      existing.type === newNotification.type &&
      !existing.dismissed
  );
};

// 既存のエラータイプを新システムに変換
const convertLegacyError = (
  message: string,
  type: 'connection' | 'general'
): Omit<ErrorNotification, 'id' | 'timestamp'> => {
  if (type === 'connection') {
    return {
      type: 'error',
      title: '配線に失敗しました',
      message,
      userMessage:
        'ピン同士を正しく接続できませんでした。接続元と接続先のピンを確認してください。',
      context: 'wire-connection',
      duration: 3000, // 既存の3秒自動削除を維持
    };
  } else {
    return {
      type: 'error',
      title: 'エラーが発生しました',
      message,
      userMessage: message,
      context: 'general',
      duration: 3000,
    };
  }
};

export const createErrorSlice: StateCreator<
  CircuitStore,
  [],
  [],
  ErrorSlice
> = (set, get) => ({
  // 🆕 新しい統一エラーハンドリング状態
  notifications: [],
  maxNotifications: 5,
  isVisible: false,

  // 🆕 エラー通知を追加
  showErrorNotification: notification => {
    const current = get();

    // 重複チェック
    if (isDuplicate(current.notifications, notification)) {
      console.warn(
        '[ErrorSlice] Duplicate notification ignored:',
        notification.title
      );
      return;
    }

    const newNotification: ErrorNotification = {
      ...notification,
      id: generateErrorId(),
      timestamp: Date.now(),
      dismissed: false,
    };

    set(state => {
      let updatedNotifications = [...state.notifications, newNotification];

      // 最大数を超えた場合、古い通知を削除
      if (updatedNotifications.length > state.maxNotifications) {
        updatedNotifications.sort((a, b) => {
          const priorityOrder: Record<string, number> = {
            error: 3,
            warning: 2,
            info: 1,
          };
          const priorityDiff = priorityOrder[b.type] - priorityOrder[a.type];
          if (priorityDiff !== 0) return priorityDiff;
          return b.timestamp - a.timestamp;
        });
        updatedNotifications = updatedNotifications.slice(
          0,
          state.maxNotifications
        );
      }

      return {
        ...state,
        notifications: updatedNotifications,
        isVisible: true,
      };
    });

    // 自動削除タイマー
    if (notification.duration) {
      setTimeout(() => {
        get().dismissError(newNotification.id);
      }, notification.duration);
    }
  },

  // 🆕 特定のエラーを削除
  dismissError: id => {
    set(state => ({
      ...state,
      notifications: state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, dismissed: true }
          : notification
      ),
    }));

    setTimeout(() => {
      set(state => ({
        ...state,
        notifications: state.notifications.filter(n => !n.dismissed),
      }));
    }, 300);
  },

  // 🆕 すべてのエラーを削除
  dismissAllErrors: () => {
    set(state => ({
      ...state,
      notifications: state.notifications.map(notification => ({
        ...notification,
        dismissed: true,
      })),
    }));

    setTimeout(() => {
      set(state => ({
        ...state,
        notifications: [],
        isVisible: false,
      }));
    }, 300);
  },

  // 🆕 表示状態を設定
  setVisibility: visible => {
    set(state => ({
      ...state,
      isVisible: visible,
    }));
  },

  // 🆕 特定タイプのエラーのみ削除
  dismissErrorsByType: type => {
    set(state => ({
      ...state,
      notifications: state.notifications.map(notification =>
        notification.type === type
          ? { ...notification, dismissed: true }
          : notification
      ),
    }));

    setTimeout(() => {
      set(state => ({
        ...state,
        notifications: state.notifications.filter(n => !n.dismissed),
      }));
    }, 300);
  },

  // 🆕 古いエラーを自動削除
  cleanupOldErrors: maxAge => {
    const cutoffTime = Date.now() - maxAge;

    set(state => ({
      ...state,
      notifications: state.notifications.filter(
        notification => notification.timestamp > cutoffTime
      ),
    }));
  },

  // 🔄 既存APIとの互換性
  setError: (message, type) => {
    const legacyNotification = convertLegacyError(message, type);
    get().showErrorNotification(legacyNotification);

    // 既存の状態も更新（既存コンポーネントとの互換性）
    set({
      errorMessage: message,
      errorType: type,
    });
  },

  clearError: () => {
    // 既存の状態をクリア
    set({
      errorMessage: null,
      errorType: null,
    });

    // 新システムでも対応する通知をクリア
    get().dismissErrorsByType('error');
  },
});
