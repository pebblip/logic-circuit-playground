import React, { useState, useEffect } from 'react';

export const MobileWarningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    // localStorage から表示状態を復元
    const hidden = localStorage.getItem('hideMobileWarning');
    if (hidden === 'true') {
      setIsVisible(false);
      return;
    }

    // 自動非表示タイマーを設定（5秒後）
    const timer = setTimeout(() => {
      if (!isExpanded) {
        setIsVisible(false);
      }
    }, 5000);

    setAutoHideTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 展開時はタイマーをクリア
    if (isExpanded && autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }
  }, [isExpanded, autoHideTimer]);

  const handleClose = () => {
    setIsVisible(false);
    // 今後表示しないオプションは削除（UXを簡潔に）
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`mobile-toast ${isExpanded ? 'expanded' : ''}`}
      onClick={!isExpanded ? handleExpand : undefined}
      style={{
        position: 'fixed',
        top: isExpanded ? '50%' : '16px',
        left: isExpanded ? '50%' : '16px',
        right: isExpanded ? 'auto' : '16px',
        transform: isExpanded ? 'translate(-50%, -50%)' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: isExpanded ? '20px' : '12px 16px',
        borderRadius: isExpanded ? '12px' : '8px',
        zIndex: 1200, // design-tokensに準拠
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isExpanded ? 'default' : 'pointer',
        maxWidth: isExpanded ? '90vw' : 'none',
        minWidth: isExpanded ? '300px' : 'auto',
        animation: !isExpanded ? 'slideDown 0.3s ease-out' : 'none',
      }}
    >
      {!isExpanded ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
          }}
        >
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ flex: 1 }}>モバイル版は開発中です</span>
          <button
            onClick={e => {
              e.stopPropagation();
              handleClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '8px',
              opacity: 0.8,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '0.8';
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span>機能制限のお知らせ</span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              ✕
            </button>
          </div>
          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              lineHeight: '1.6',
              opacity: 0.9,
            }}
          >
            現在開発中の機能：
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          >
            <li>ドラッグ&ドロップ操作</li>
            <li>ゲート詳細表示</li>
            <li>カスタムゲート作成</li>
            <li>タッチ操作の最適化</li>
          </ul>
          <p
            style={{
              marginTop: '16px',
              fontSize: '12px',
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            最適な体験のため、PCでのご利用を推奨します
          </p>
        </>
      )}
    </div>
  );
};
