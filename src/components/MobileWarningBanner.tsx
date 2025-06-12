import React, { useState, useEffect } from 'react';

export const MobileWarningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // localStorage から表示状態を復元
    const hidden = localStorage.getItem('hideMobileWarning');
    if (hidden === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hideMobileWarning', 'true');
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 193, 7, 0.95)',
        color: '#000',
        padding: isMinimized ? '8px 16px' : '16px',
        borderBottom: '2px solid rgba(255, 152, 0, 0.5)',
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: isMinimized ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: isMinimized ? 0 : '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span>モバイル版は開発中です</span>
          </div>
          {!isMinimized && (
            <>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                現在、モバイル版の機能は限定的です。最適な体験のため、PCまたはタブレットでのご利用を推奨します。
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  opacity: 0.8,
                }}
              >
                <span>❌ ドラッグ&ドロップ</span>
                <span>❌ ゲート詳細表示</span>
                <span>❌ カスタムゲート</span>
                <span>⚠️ 操作性制限</span>
              </div>
            </>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleToggleMinimize}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isMinimized ? '詳細を表示' : '最小化'}
          >
            {isMinimized ? '📐' : '➖'}
          </button>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="閉じる（今後表示しない）"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};