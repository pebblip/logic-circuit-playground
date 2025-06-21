import React, { useEffect, useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useCircuitStore } from '../../stores/circuitStore';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';
import { ErrorNotificationPanel } from '../ErrorNotificationPanel';
import { CanvasTestPage } from '../../pages/CanvasTestPage';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const { breakpoint } = useResponsive();
  const { loadFromShareUrl, loadPreferences } = useCircuitStore();
  const [shareLoadMessage, setShareLoadMessage] = useState<string | null>(null);

  // 開発用テストページ表示チェック
  const isTestMode =
    new URLSearchParams(window.location.search).get('test') === 'canvas';

  useKeyboardShortcuts();

  // 設定の読み込み
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // 共有URLからの自動読み込み
  useEffect(() => {
    const checkAndLoadShareUrl = async () => {
      const success = await loadFromShareUrl();
      if (success) {
        setShareLoadMessage('回路を読み込みました！');
        setTimeout(() => setShareLoadMessage(null), 3000);
      }
    };

    checkAndLoadShareUrl();
  }, [loadFromShareUrl]);

  return (
    <>
      {shareLoadMessage && (
        <div
          data-testid="share-load-message"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {shareLoadMessage}
        </div>
      )}

      {/* 統一エラーハンドリングシステム通知 */}
      <ErrorNotificationPanel />

      {/* 開発用テストページ */}
      {isTestMode ? (
        <CanvasTestPage />
      ) : (
        (() => {
          switch (breakpoint) {
            case 'mobile':
              return <MobileLayout>{children}</MobileLayout>;
            case 'tablet':
              return <TabletLayout>{children}</TabletLayout>;
            case 'desktop':
              return <DesktopLayout>{children}</DesktopLayout>;
            default:
              return <DesktopLayout>{children}</DesktopLayout>;
          }
        })()
      )}
    </>
  );
};
