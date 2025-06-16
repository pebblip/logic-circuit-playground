/**
 * 統一エラーハンドリングシステム用通知パネル
 *
 * 新しいErrorSliceを使用した通知表示コンポーネント
 */

import React from 'react';
import { useCircuitStore } from '@/stores/circuitStore';
import type { ErrorNotification } from '@/stores/slices/errorSlice';
import './ErrorNotificationPanel.css';

export const ErrorNotificationPanel: React.FC = () => {
  const { notifications, isVisible, dismissError, setVisibility } =
    useCircuitStore();

  // 表示する通知がない、または非表示の場合は何も表示しない
  if (!isVisible || notifications.length === 0) {
    return null;
  }

  // 非削除状態の通知のみ表示
  const activeNotifications = notifications.filter(
    (n: ErrorNotification) => !n.dismissed
  );

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="error-notification-panel">
      {activeNotifications.map(notification => (
        <ErrorNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissError(notification.id)}
        />
      ))}

      {/* パネル全体を閉じるボタン */}
      {activeNotifications.length > 1 && (
        <div className="error-panel-footer">
          <button
            className="error-dismiss-all-button"
            onClick={() => setVisibility(false)}
          >
            すべて閉じる
          </button>
        </div>
      )}
    </div>
  );
};

interface ErrorNotificationItemProps {
  notification: ErrorNotification;
  onDismiss: () => void;
}

const ErrorNotificationItem: React.FC<ErrorNotificationItemProps> = ({
  notification,
  onDismiss,
}) => {
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'error':
        return {
          backgroundColor: 'rgba(255, 107, 107, 0.95)',
          borderColor: '#ff6b6b',
          color: '#ffffff',
          icon: '🚨',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 159, 28, 0.95)',
          borderColor: '#ff9f1c',
          color: '#ffffff',
          icon: '⚠️',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.95)',
          borderColor: '#2196f3',
          color: '#ffffff',
          icon: 'ℹ️',
        };
      default:
        return {
          backgroundColor: 'rgba(158, 158, 158, 0.95)',
          borderColor: '#9e9e9e',
          color: '#ffffff',
          icon: '📢',
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <div
      className={`error-notification-item ${notification.dismissed ? 'dismissed' : ''}`}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      }}
    >
      <div className="error-notification-header">
        <span className="error-notification-icon">{style.icon}</span>
        <div className="error-notification-title">{notification.title}</div>
        <button
          className="error-notification-close"
          onClick={onDismiss}
          aria-label="通知を閉じる"
        >
          ✕
        </button>
      </div>

      <div className="error-notification-body">
        <div className="error-notification-user-message">
          {notification.userMessage}
        </div>

        {notification.context && (
          <div className="error-notification-context">
            コンテキスト: {notification.context}
          </div>
        )}
      </div>

      {notification.actions && notification.actions.length > 0 && (
        <div className="error-notification-actions">
          {notification.actions.map((action: any, index: number) => (
            <button
              key={index}
              className={`error-action-button ${action.isPrimary ? 'primary' : 'secondary'}`}
              onClick={() => {
                action.action();
                onDismiss(); // アクション実行後に通知を閉じる
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
