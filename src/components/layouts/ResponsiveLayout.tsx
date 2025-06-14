import React, { useEffect, useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useCircuitStore } from '../../stores/circuitStore';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';
import { ErrorNotification } from '../ErrorNotification';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
}) => {
  const { breakpoint } = useResponsive();
  const { loadFromShareUrl } = useCircuitStore();
  const [shareLoadMessage, setShareLoadMessage] = useState<string | null>(null);
  
  useKeyboardShortcuts();

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
      
      {/* エラーメッセージ通知 */}
      <ErrorNotification />
      
      {/* キーボードショートカットヘルプ */}
      <KeyboardShortcutsHelp />
      
      {(() => {
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
      })()}
    </>
  );
};
