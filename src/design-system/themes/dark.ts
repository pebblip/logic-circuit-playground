/**
 * ダークテーマ定義
 */

import { colors } from '../tokens/colors';

export const darkTheme = {
  name: 'dark',
  
  // カラーマッピング
  colors: {
    // 背景色
    'bg-primary': colors.background.primary,
    'bg-secondary': colors.background.secondary,
    'bg-elevated': colors.background.elevated,
    'bg-overlay': colors.background.overlay,
    
    // テキスト色
    'text-primary': colors.neutral[50],
    'text-secondary': colors.neutral[300],
    'text-tertiary': colors.neutral[400],
    'text-disabled': colors.neutral[600],
    
    // ボーダー色
    'border-default': colors.neutral[800],
    'border-light': colors.neutral[700],
    'border-focus': colors.primary[500],
    
    // プライマリカラー
    'primary-50': colors.primary[50],
    'primary-100': colors.primary[100],
    'primary-200': colors.primary[200],
    'primary-300': colors.primary[300],
    'primary-400': colors.primary[400],
    'primary-500': colors.primary[500],
    'primary-600': colors.primary[600],
    'primary-700': colors.primary[700],
    'primary-800': colors.primary[800],
    'primary-900': colors.primary[900],
    
    // セカンダリカラー
    'secondary-50': colors.secondary[50],
    'secondary-100': colors.secondary[100],
    'secondary-200': colors.secondary[200],
    'secondary-300': colors.secondary[300],
    'secondary-400': colors.secondary[400],
    'secondary-500': colors.secondary[500],
    'secondary-600': colors.secondary[600],
    'secondary-700': colors.secondary[700],
    'secondary-800': colors.secondary[800],
    'secondary-900': colors.secondary[900],
    
    // セマンティックカラー
    'success': colors.success[500],
    'success-light': colors.success[400],
    'success-dark': colors.success[600],
    
    'warning': colors.warning[500],
    'warning-light': colors.warning[400],
    'warning-dark': colors.warning[600],
    
    'error': colors.error[500],
    'error-light': colors.error[400],
    'error-dark': colors.error[600],
    
    // ゲート関連
    'gate-input': colors.semantic.gateInput,
    'gate-output': colors.semantic.gateOutput,
    'gate-active': colors.semantic.gateActive,
    'gate-inactive': colors.semantic.gateInactive,
    
    // ワイヤー関連
    'wire-default': colors.semantic.wireDefault,
    'wire-active': colors.semantic.wireActive,
    'wire-hover': colors.semantic.wireHover,
    'wire-error': colors.semantic.wireError,
    
    // インタラクション
    'hover': colors.semantic.hover,
    'focus': colors.semantic.focus,
    'selected': colors.semantic.selected,
  },
  
  // シャドウ
  shadows: {
    'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    'md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    'glow-sm': `0 0 10px ${colors.primary[500]}40`,
    'glow-md': `0 0 20px ${colors.primary[500]}60`,
    'glow-lg': `0 0 30px ${colors.primary[500]}80`,
  },
} as const;

export type DarkTheme = typeof darkTheme;