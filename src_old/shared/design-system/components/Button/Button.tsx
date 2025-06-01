/**
 * Buttonコンポーネント
 * デザイントークンを使用した最初のコンポーネント
 */

import React, { forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import { tokens } from '../../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  
  // ベーススタイル
  const baseStyles = css`
    /* レイアウト */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${tokens.spacing[2]};
    width: ${fullWidth ? '100%' : 'auto'};
    
    /* タイポグラフィ */
    font-family: ${tokens.fontFamily.sans};
    font-size: ${tokens.typography.ui.button.fontSize};
    font-weight: ${tokens.typography.ui.button.fontWeight};
    line-height: ${tokens.typography.ui.button.lineHeight};
    letter-spacing: ${tokens.typography.ui.button.letterSpacing};
    
    /* 見た目 */
    border: none;
    border-radius: ${tokens.spacing[2]};
    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
    outline: none;
    position: relative;
    text-decoration: none;
    user-select: none;
    white-space: nowrap;
    
    /* トランジション */
    transition: 
      background-color ${tokens.animation.hover.duration} ${tokens.animation.hover.easing},
      transform ${tokens.animation.press.duration} ${tokens.animation.press.easing},
      box-shadow ${tokens.animation.hover.duration} ${tokens.animation.hover.easing};
    
    /* フォーカススタイル */
    &:focus-visible {
      box-shadow: 0 0 0 3px var(--color-focus);
    }
    
    /* ホバー */
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    
    /* アクティブ */
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    /* 無効化 */
    &:disabled {
      opacity: 0.5;
    }
  `;
  
  // サイズスタイル
  const sizeStyles = {
    sm: css`
      height: ${tokens.spacing[8]};
      padding: 0 ${tokens.spacing[3]};
      font-size: ${tokens.fontSize.sm};
    `,
    md: css`
      height: ${tokens.spacing[10]};
      padding: 0 ${tokens.spacing[4]};
      font-size: ${tokens.fontSize.base};
    `,
    lg: css`
      height: ${tokens.spacing[12]};
      padding: 0 ${tokens.spacing[6]};
      font-size: ${tokens.fontSize.lg};
    `,
  };
  
  // バリアントスタイル
  const variantStyles = {
    primary: css`
      background-color: var(--color-primary-500);
      color: white;
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-600);
        box-shadow: var(--shadow-glow-sm);
      }
      
      &:active:not(:disabled) {
        background-color: var(--color-primary-700);
      }
    `,
    secondary: css`
      background-color: var(--color-secondary-500);
      color: white;
      
      &:hover:not(:disabled) {
        background-color: var(--color-secondary-600);
        box-shadow: var(--shadow-glow-sm);
      }
      
      &:active:not(:disabled) {
        background-color: var(--color-secondary-700);
      }
    `,
    ghost: css`
      background-color: transparent;
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-default);
      
      &:hover:not(:disabled) {
        background-color: var(--color-hover);
        border-color: var(--color-border-light);
      }
      
      &:active:not(:disabled) {
        background-color: var(--color-selected);
      }
    `,
    danger: css`
      background-color: var(--color-error);
      color: white;
      
      &:hover:not(:disabled) {
        background-color: var(--color-error-dark);
        box-shadow: 0 0 10px var(--color-error);
      }
      
      &:active:not(:disabled) {
        background-color: var(--color-error-dark);
      }
    `,
  };
  
  // ローディングスタイル
  const loadingStyles = loading && css`
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: ${tokens.keyframes.spin} 1s linear infinite;
    }
  `;
  
  return (
    <button
      ref={ref}
      className={cx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        loadingStyles,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';