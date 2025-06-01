import React, { ReactNode } from 'react';
import { useResponsive } from '../../shared/lib/hooks/useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

/**
 * デバイスタイプに応じて適切なレイアウトを選択
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { deviceType } = useResponsive();

  switch (deviceType) {
    case 'mobile':
      return <MobileLayout>{children}</MobileLayout>;
    case 'tablet':
      return <TabletLayout>{children}</TabletLayout>;
    case 'desktop':
    default:
      return <DesktopLayout>{children}</DesktopLayout>;
  }
};