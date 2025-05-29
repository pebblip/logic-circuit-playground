import React, { ReactNode } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '../../design-system/ThemeProvider';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { LearningMode } from '../../types/mode';
import type { GateType } from '../../types/gate';

interface MainLayoutProps {
  children: ReactNode;
  currentMode: LearningMode;
  availableGates: GateType[];
  lockedGates?: GateType[];
  customGates?: Array<{ id: string; name: string; icon?: string }>;
  autoSaveStatus?: 'saving' | 'saved' | 'error';
  showSidebar?: boolean;
  onModeChange?: (mode: LearningMode) => void;
  onSave?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  onGateSelect?: (gateType: GateType | string) => void;
  onCreateCustomGate?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentMode,
  availableGates,
  lockedGates = [],
  customGates = [],
  autoSaveStatus = 'saved',
  showSidebar = true,
  onModeChange,
  onSave,
  onShare,
  onSettings,
  onGateSelect,
  onCreateCustomGate,
}) => {
  const theme = useTheme();

  const containerStyles = css`
    min-height: 100vh;
    background: ${theme.colors.background.primary};
    position: relative;
    overflow: hidden;
  `;

  const backgroundEffectStyles = css`
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, ${theme.colors.primary[500]}15 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, ${theme.colors.secondary[500]}15 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, ${theme.colors.success[500]}10 0%, transparent 50%);
    pointer-events: none;
  `;

  const mainStyles = css`
    display: flex;
    height: 100vh;
    padding-top: 60px; /* Header height */
    position: relative;
  `;

  const contentStyles = css`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  `;

  const canvasContainerStyles = css`
    flex: 1;
    position: relative;
    overflow: hidden;
    background-image: 
      linear-gradient(${theme.colors.neutral[850]}40 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.neutral[850]}40 1px, transparent 1px);
    background-size: 32px 32px;
  `;

  return (
    <div css={containerStyles}>
      <div css={backgroundEffectStyles} />
      
      <Header
        currentMode={currentMode}
        onModeChange={onModeChange}
        onSave={onSave}
        onShare={onShare}
        onSettings={onSettings}
        autoSaveStatus={autoSaveStatus}
      />
      
      <main css={mainStyles}>
        {showSidebar && (
          <Sidebar
            availableGates={availableGates}
            lockedGates={lockedGates}
            customGates={customGates}
            onGateSelect={onGateSelect}
            onCreateCustomGate={onCreateCustomGate}
          />
        )}
        
        <div css={contentStyles}>
          <div css={canvasContainerStyles}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};