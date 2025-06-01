/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { useTheme } from '../../shared/design-system/ThemeProvider';
import { Button } from '../../shared/design-system/components/Button/Button';
import type { LearningMode } from '../../entities/types/mode';

interface HeaderProps {
  currentMode: LearningMode;
  onModeChange?: (mode: LearningMode) => void;
  onSave?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  autoSaveStatus?: 'saving' | 'saved' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onSave,
  onShare,
  onSettings,
  autoSaveStatus = 'saved',
}) => {
  const theme = useTheme();

  const headerStyles = css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: ${theme.colors.background.primary}ee;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${theme.colors.neutral[800]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${theme.spacing[6]};
    z-index: 100;
  `;

  const logoStyles = css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    font-size: ${theme.typography.heading[5].fontSize};
    font-weight: ${theme.typography.heading[5].fontWeight};
  `;

  const logoIconStyles = css`
    font-size: 24px;
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;

  const centerStyles = css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  `;

  const modeSelectorStyles = css`
    display: flex;
    background: ${theme.colors.surface.secondary};
    border-radius: ${theme.borderRadius.lg};
    padding: 4px;
    gap: 4px;
  `;

  const modeButtonStyles = (isActive: boolean) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    border: none;
    background: ${isActive ? theme.colors.primary[500] : 'transparent'};
    color: ${isActive ? theme.colors.text.inverse : theme.colors.text.secondary};
    font-size: ${theme.typography.ui.button.fontSize};
    font-weight: ${theme.typography.ui.button.fontWeight};
    border-radius: ${theme.borderRadius.md};
    cursor: pointer;
    transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};

    &:hover:not(:disabled) {
      background: ${isActive ? theme.colors.primary[600] : theme.colors.surface.elevated};
      color: ${isActive ? theme.colors.text.inverse : theme.colors.text.primary};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  const rightActionsStyles = css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
  `;

  const autoSaveStyles = css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    font-size: ${theme.typography.ui.caption.fontSize};
    color: ${autoSaveStatus === 'error' ? theme.colors.error[400] : theme.colors.success[400]};
    opacity: ${autoSaveStatus === 'saving' ? 0.7 : 1};
    transition: opacity ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};
  `;

  const iconButtonStyles = css`
    width: 36px;
    height: 36px;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.surface.secondary};
    border: none;
    color: ${theme.colors.text.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};

    &:hover {
      background: ${theme.colors.surface.elevated};
      transform: scale(1.1);
    }
  `;

  const modes: Array<{ id: LearningMode; icon: string; label: string }> = [
    { id: 'discovery', icon: '🔍', label: '探検' },
    { id: 'sandbox', icon: '🧪', label: '実験室' },
    { id: 'challenge', icon: '🏆', label: 'チャレンジ' },
  ];

  const getSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving': return '⏳';
      case 'error': return '❌';
      default: return '✓';
    }
  };

  const getSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving': return '保存中...';
      case 'error': return '保存エラー';
      default: return '自動保存済み';
    }
  };

  return (
    <header css={headerStyles}>
      <div css={logoStyles}>
        <span css={logoIconStyles}>⚡</span>
        <span>LCP</span>
      </div>

      <div css={centerStyles}>
        <div css={modeSelectorStyles}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              css={modeButtonStyles(currentMode === mode.id)}
              onClick={() => onModeChange?.(mode.id)}
              disabled={!onModeChange}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div css={rightActionsStyles}>
        <div css={autoSaveStyles}>
          <span>{getSaveIcon()}</span>
          <span>{getSaveText()}</span>
        </div>
        
        <button
          css={iconButtonStyles}
          onClick={onSave}
          title="保存"
          disabled={!onSave}
        >
          💾
        </button>
        
        <button
          css={iconButtonStyles}
          onClick={onShare}
          title="共有"
          disabled={!onShare}
        >
          📤
        </button>
        
        <button
          css={iconButtonStyles}
          onClick={onSettings}
          title="設定"
          disabled={!onSettings}
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};