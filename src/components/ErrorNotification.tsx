import React, { useEffect } from 'react';
import { useCircuitStore } from '@/stores/circuitStore';

export const ErrorNotification: React.FC = () => {
  const { errorMessage, errorType, clearError } = useCircuitStore();

  // エラーメッセージがない場合は何も表示しない
  if (!errorMessage) {
    return null;
  }

  // エラータイプに応じたスタイルを決定
  const getErrorStyle = () => {
    switch (errorType) {
      case 'connection':
        return {
          backgroundColor: 'rgba(255, 107, 107, 0.95)',
          borderColor: '#ff6b6b',
          color: '#ffffff',
          icon: '🔌',
        };
      case 'general':
      default:
        return {
          backgroundColor: 'rgba(255, 159, 28, 0.95)',
          borderColor: '#ff9f1c',
          color: '#ffffff',
          icon: '⚠️',
        };
    }
  };

  const style = getErrorStyle();

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: style.backgroundColor,
        border: `2px solid ${style.borderColor}`,
        borderRadius: '12px',
        padding: '16px 20px',
        color: style.color,
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '300px',
        animation: 'slideInFromRight 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
      onClick={clearError}
      role="alert"
      aria-live="polite"
    >
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <div>
        <div style={{ marginBottom: '4px', fontSize: '12px', opacity: 0.9 }}>
          {errorType === 'connection' ? '接続エラー' : 'エラー'}
        </div>
        <div>{errorMessage}</div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
          クリックして閉じる
        </div>
      </div>
    </div>
  );
};

// スタイルシートを追加（グローバルCSS）
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);