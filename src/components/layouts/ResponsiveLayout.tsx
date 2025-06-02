import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { breakpoint } = useResponsive();
  useKeyboardShortcuts();

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
};