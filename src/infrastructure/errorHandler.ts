/**
 * 統一エラーハンドラー
 *
 * アプリケーション全体で使用する統一的なエラーハンドリングシステム。
 * 異なるタイプのエラーを分類し、適切なユーザー向けメッセージを生成します。
 */

import type { ErrorNotification } from '@/stores/slices/errorSlice';
import { useCircuitStore } from '@/stores/circuitStore';

// エラータイプの定義
export enum ErrorType {
  CIRCUIT_EVALUATION_FAILED = 'CIRCUIT_EVALUATION_FAILED',
  CUSTOM_GATE_INVALID = 'CUSTOM_GATE_INVALID',
  WIRE_CONNECTION_FAILED = 'WIRE_CONNECTION_FAILED',
  FILE_LOAD_FAILED = 'FILE_LOAD_FAILED',
  PREVIEW_MODE_ERROR = 'PREVIEW_MODE_ERROR',
  PERFORMANCE_WARNING = 'PERFORMANCE_WARNING',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// エラーハンドラーのオプション
export interface ErrorOptions {
  userAction?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  showToUser?: boolean;
  logToConsole?: boolean;
  actions?: Array<{ label: string; action: () => void }>;
}

// エラーメッセージテンプレート
const ERROR_MESSAGE_TEMPLATES = {
  [ErrorType.CIRCUIT_EVALUATION_FAILED]: {
    title: '回路の計算に失敗しました',
    userMessage: 'ゲート同士の接続に問題があります。',
    suggestions: [
      '接続線を確認してください',
      '元に戻すボタンで前の状態に戻せます',
      'すべてクリアして最初から作り直すこともできます',
    ],
    severity: 'high' as const,
  },
  [ErrorType.CUSTOM_GATE_INVALID]: {
    title: 'カスタムゲートに問題があります',
    userMessage: 'カスタムゲートの定義が正しくありません。',
    suggestions: [
      'カスタムゲートを削除して作り直してください',
      'ツールパレットから基本ゲートを使用してください',
    ],
    severity: 'medium' as const,
  },
  [ErrorType.WIRE_CONNECTION_FAILED]: {
    title: '配線に失敗しました',
    userMessage: 'ピン同士を正しく接続できませんでした。',
    suggestions: [
      '接続元と接続先のピンを確認してください',
      'ゲートに既に接続されているピンは使用できません',
    ],
    severity: 'low' as const,
  },
  [ErrorType.FILE_LOAD_FAILED]: {
    title: 'ファイルの読み込みに失敗しました',
    userMessage: 'ファイル形式が正しくないか、破損している可能性があります。',
    suggestions: [
      '別のファイルを選択してください',
      'ファイル形式がJSON形式であることを確認してください',
    ],
    severity: 'medium' as const,
  },
  [ErrorType.PREVIEW_MODE_ERROR]: {
    title: 'プレビューモードでエラーが発生しました',
    userMessage: 'カスタムゲートの内部回路を表示できません。',
    suggestions: [
      'Escキーでプレビューモードを終了してください',
      'カスタムゲートを削除して作り直してください',
    ],
    severity: 'medium' as const,
  },
  [ErrorType.PERFORMANCE_WARNING]: {
    title: 'パフォーマンスの問題が検出されました',
    userMessage: 'ゲートの数が多すぎるため、動作が重くなる可能性があります。',
    suggestions: [
      'ゲートの数を減らすことをお勧めします',
      '不要なゲートを削除してください',
      '回路を分割することを検討してください',
    ],
    severity: 'low' as const,
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: '予期しないエラーが発生しました',
    userMessage: '申し訳ございません。予期しない問題が発生しました。',
    suggestions: [
      'ページを再読み込みしてください',
      '問題が続く場合は、作業内容を保存してください',
    ],
    severity: 'medium' as const,
  },
} as const;

// エラー分類関数
const classifyError = (error: unknown): ErrorType => {
  if (error instanceof Error) {
    // エラークラス名による分類
    switch (error.constructor.name) {
      case 'CircuitEvaluationError':
        return ErrorType.CIRCUIT_EVALUATION_FAILED;
      case 'CustomGateError':
        return ErrorType.CUSTOM_GATE_INVALID;
      case 'FileLoadError':
        return ErrorType.FILE_LOAD_FAILED;
      default: {
        // エラーメッセージによる分類
        const message = error.message.toLowerCase();
        if (
          message.includes('circuit evaluation') ||
          message.includes('回路の評価')
        ) {
          return ErrorType.CIRCUIT_EVALUATION_FAILED;
        }
        if (message.includes('wire connection') || message.includes('配線')) {
          return ErrorType.WIRE_CONNECTION_FAILED;
        }
        if (
          message.includes('custom gate') ||
          message.includes('カスタムゲート')
        ) {
          return ErrorType.CUSTOM_GATE_INVALID;
        }
        if (message.includes('file load') || message.includes('ファイル')) {
          return ErrorType.FILE_LOAD_FAILED;
        }
        if (
          message.includes('preview mode') ||
          message.includes('プレビュー')
        ) {
          return ErrorType.PREVIEW_MODE_ERROR;
        }
        if (
          message.includes('performance') ||
          message.includes('パフォーマンス')
        ) {
          return ErrorType.PERFORMANCE_WARNING;
        }
        return ErrorType.UNKNOWN_ERROR;
      }
    }
  }

  if (typeof error === 'string') {
    const message = error.toLowerCase();
    if (message.includes('circuit') || message.includes('回路')) {
      return ErrorType.CIRCUIT_EVALUATION_FAILED;
    }
    if (message.includes('wire') || message.includes('配線')) {
      return ErrorType.WIRE_CONNECTION_FAILED;
    }
    if (message.includes('custom') || message.includes('カスタム')) {
      return ErrorType.CUSTOM_GATE_INVALID;
    }
    if (message.includes('file') || message.includes('ファイル')) {
      return ErrorType.FILE_LOAD_FAILED;
    }
    if (message.includes('preview') || message.includes('プレビュー')) {
      return ErrorType.PREVIEW_MODE_ERROR;
    }
    if (message.includes('performance') || message.includes('パフォーマンス')) {
      return ErrorType.PERFORMANCE_WARNING;
    }
  }

  return ErrorType.UNKNOWN_ERROR;
};

// アクション生成関数
const generateActions = (
  errorType: ErrorType,
  customActions?: Array<{ label: string; action: () => void }>
): Array<{ label: string; action: () => void; isPrimary?: boolean }> => {
  const actions: Array<{
    label: string;
    action: () => void;
    isPrimary?: boolean;
  }> = [];

  // カスタムアクションを追加
  if (customActions) {
    actions.push(
      ...customActions.map(action => ({ ...action, isPrimary: false }))
    );
  }

  // エラータイプに応じたデフォルトアクション
  switch (errorType) {
    case ErrorType.CIRCUIT_EVALUATION_FAILED:
      actions.push(
        {
          label: '元に戻す',
          action: () => {
            // TODO: 実際のundo機能と連携
          },
          isPrimary: true,
        },
        {
          label: 'すべてクリア',
          action: () => {
            // TODO: 実際のclear機能と連携
          },
        }
      );
      break;

    case ErrorType.CUSTOM_GATE_INVALID:
      actions.push({
        label: 'ゲートを削除',
        action: () => {
          // TODO: 実際の削除機能と連携
        },
        isPrimary: true,
      });
      break;

    case ErrorType.FILE_LOAD_FAILED:
      actions.push({
        label: '別のファイルを選択',
        action: () => {
          // TODO: ファイル選択ダイアログと連携
        },
        isPrimary: true,
      });
      break;

    case ErrorType.PREVIEW_MODE_ERROR:
      actions.push({
        label: 'プレビューを終了',
        action: () => {
          // TODO: プレビューモード終了機能と連携
        },
        isPrimary: true,
      });
      break;

    case ErrorType.PERFORMANCE_WARNING:
      actions.push({
        label: 'ゲートを削除',
        action: () => {
          // TODO: 選択削除機能と連携
        },
        isPrimary: true,
      });
      break;
  }

  return actions;
};

// メイン統一エラーハンドラー
export const handleError = (
  error: unknown,
  context: string,
  options: ErrorOptions = {}
): void => {
  const {
    userAction,
    severity: overrideSeverity,
    showToUser = true,
    logToConsole = true,
    actions: customActions,
  } = options;

  // エラータイプを分類
  const errorType = classifyError(error);
  const template = ERROR_MESSAGE_TEMPLATES[errorType];

  // 重要度を決定（オプションで上書き可能）
  const severity = overrideSeverity || template.severity;

  // コンソールログ出力
  if (logToConsole) {
    const contextInfo = userAction ? `${context} - ${userAction}` : context;
    console.error(`[${contextInfo}]:`, error);
  }

  // ユーザー向け通知
  if (showToUser) {
    const contextInfo = userAction ? `${context} - ${userAction}` : context;
    const actions = generateActions(errorType, customActions);

    let notification;

    if (severity === 'low' || errorType === ErrorType.PERFORMANCE_WARNING) {
      notification = createWarningNotification(
        template.title,
        template.userMessage,
        {
          message: error instanceof Error ? error.message : String(error),
          context: contextInfo,
          actions,
        }
      );
    } else if (severity === 'critical') {
      notification = createErrorNotification(
        template.title,
        template.userMessage,
        {
          message: error instanceof Error ? error.message : String(error),
          context: contextInfo,
          actions,
          duration: undefined, // 重要なエラーは自動消去しない
        }
      );
    } else {
      notification = createErrorNotification(
        template.title,
        template.userMessage,
        {
          message: error instanceof Error ? error.message : String(error),
          context: contextInfo,
          actions,
        }
      );
    }

    // 実際のエラーストアに通知を送信
    try {
      const store = useCircuitStore.getState();
      if (store && typeof store.showErrorNotification === 'function') {
        store.showErrorNotification(notification);
      } else {
        // フォールバック: コンソールに出力（テスト環境など）
        console.warn(
          '[ErrorHandler] Error store not available, falling back to console:',
          notification
        );
      }
    } catch (error) {
      // ストアアクセスエラーの場合のフォールバック
      console.warn('[ErrorHandler] Failed to access error store:', error);
      console.error('[ErrorHandler] Original notification:', notification);
    }
  }
};

// エラー通知作成のヘルパー関数
const createErrorNotification = (
  title: string,
  userMessage: string,
  options?: Partial<
    Omit<ErrorNotification, 'id' | 'timestamp' | 'title' | 'userMessage'>
  >
): Omit<ErrorNotification, 'id' | 'timestamp'> => ({
  type: 'error',
  title,
  message: options?.message || title,
  userMessage,
  ...options,
});

const createWarningNotification = (
  title: string,
  userMessage: string,
  options?: Partial<
    Omit<ErrorNotification, 'id' | 'timestamp' | 'title' | 'userMessage'>
  >
): Omit<ErrorNotification, 'id' | 'timestamp'> => ({
  type: 'warning',
  title,
  message: options?.message || title,
  userMessage,
  ...options,
});

const createInfoNotification = (
  title: string,
  userMessage: string,
  options?: Partial<
    Omit<ErrorNotification, 'id' | 'timestamp' | 'title' | 'userMessage'>
  >
): Omit<ErrorNotification, 'id' | 'timestamp'> => ({
  type: 'info',
  title,
  message: options?.message || title,
  userMessage,
  ...options,
});

// 便利なヘルパー関数
export const handleCircuitError = (
  error: unknown,
  context: string,
  userAction?: string
) => {
  handleError(error, context, {
    userAction,
    severity: 'high',
    showToUser: true,
  });
};

export const handleWarning = (
  message: string,
  context: string,
  userAction?: string
) => {
  handleError(message, context, {
    userAction,
    severity: 'low',
    showToUser: true,
  });
};

export const handleInfo = (
  message: string,
  context: string,
  userAction?: string
) => {
  const notification = createInfoNotification('情報', message, {
    context: userAction ? `${context} - ${userAction}` : context,
  });

  // 実際のエラーストアに通知を送信
  try {
    const store = useCircuitStore.getState();
    if (store && typeof store.showErrorNotification === 'function') {
      store.showErrorNotification(notification);
    } else {
      // フォールバック: コンソールに出力（テスト環境など）
    }
  } catch {
    // ストアアクセスエラーの場合のフォールバック
  }
};

// Result<T,E>パターンとの統合
export const handleResult = <T, E>(
  result: { success: true; data: T } | { success: false; error: E },
  context: string,
  options?: ErrorOptions
): T | null => {
  if (result.success) {
    return result.data;
  } else {
    handleError(result.error, context, options);
    return null;
  }
};

// ErrorType は既に上で定義されているので、重複エクスポートを削除
