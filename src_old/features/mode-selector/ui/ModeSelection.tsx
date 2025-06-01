/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '../../../shared/design-system/ThemeProvider';
import { Button } from '../../../shared/design-system/components/Button/Button';
import type { LearningMode } from '../../../entities/types/mode';

interface ModeSelectionProps {
  onModeSelect: (mode: LearningMode) => void;
}

const modes: Array<{
  id: LearningMode;
  icon: string;
  title: string;
  description: string;
  color: string;
}> = [
  {
    id: 'discovery',
    icon: '🔍',
    title: '探検モード',
    description: 'はじめての方へ\n段階的に論理回路を学ぼう',
    color: 'success',
  },
  {
    id: 'sandbox',
    icon: '🧪',
    title: '実験室モード',
    description: '自由に作成\n全機能をすぐに使える',
    color: 'primary',
  },
  {
    id: 'challenge',
    icon: '🏆',
    title: 'チャレンジ',
    description: '腕試し\nパズルを解いて上達しよう',
    color: 'warning',
  },
];

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerStyles = css`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.background.primary};
    padding: ${theme.spacing[8]};
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 50%, ${theme.colors.primary[500]}20 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, ${theme.colors.secondary[500]}20 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${theme.colors.success[500]}10 0%, transparent 50%);
      pointer-events: none;
    }
  `;

  const contentStyles = css`
    position: relative;
    z-index: 1;
    opacity: ${isVisible ? 1 : 0};
    transform: translateY(${isVisible ? 0 : '20px'});
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut};
  `;

  const logoStyles = css`
    font-size: ${theme.typography.heading[1].fontSize};
    margin-bottom: ${theme.spacing[10]};
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;

  const titleStyles = css`
    font-size: ${theme.typography.heading[2].fontSize};
    font-weight: ${theme.typography.heading[2].fontWeight};
    background: linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.secondary[400]});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: ${theme.spacing[16]};
    text-align: center;
  `;

  const cardsContainerStyles = css`
    display: flex;
    gap: ${theme.spacing[8]};
    flex-wrap: wrap;
    justify-content: center;
    
    @media (max-width: ${theme.breakpoints.md}) {
      flex-direction: column;
      gap: ${theme.spacing[5]};
    }
  `;

  const cardStyles = (color: string, index: number) => css`
    background: ${theme.colors.surface.secondary};
    border: 2px solid transparent;
    border-radius: ${theme.borderRadius.xl};
    padding: ${theme.spacing[10]} ${theme.spacing[8]};
    width: 280px;
    text-align: center;
    cursor: pointer;
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut};
    backdrop-filter: blur(10px);
    opacity: ${isVisible ? 1 : 0};
    transform: translateY(${isVisible ? 0 : '40px'});
    transition-delay: ${index * 100}ms;

    &:hover {
      transform: translateY(-10px);
      border-color: ${theme.colors[color as keyof typeof theme.colors][400]};
      background: ${theme.colors.surface.elevated};
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 40px ${theme.colors[color as keyof typeof theme.colors][400]}40;
    }

    @media (max-width: ${theme.breakpoints.md}) {
      width: 100%;
      max-width: 350px;
    }
  `;

  const iconStyles = css`
    font-size: 60px;
    margin-bottom: ${theme.spacing[5]};
    display: block;
  `;

  const modeTitleStyles = css`
    font-size: ${theme.typography.heading[4].fontSize};
    font-weight: ${theme.typography.heading[4].fontWeight};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing[3]};
  `;

  const descriptionStyles = css`
    font-size: ${theme.typography.body.sm.fontSize};
    color: ${theme.colors.text.secondary};
    line-height: ${theme.typography.body.sm.lineHeight};
    white-space: pre-line;
  `;

  return (
    <div css={containerStyles}>
      <div css={contentStyles}>
        <div css={logoStyles}>⚡</div>
        <h1 css={titleStyles}>Logic Circuit Playground</h1>
        
        <div css={cardsContainerStyles}>
          {modes.map((mode, index) => (
            <div
              key={mode.id}
              css={cardStyles(mode.color, index)}
              onClick={() => onModeSelect(mode.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onModeSelect(mode.id);
                }
              }}
            >
              <span css={iconStyles}>{mode.icon}</span>
              <h2 css={modeTitleStyles}>{mode.title}</h2>
              <p css={descriptionStyles}>{mode.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};