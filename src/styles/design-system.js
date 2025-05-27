// Logic Circuit Playground デザインシステム
// モダンで教育的、かつプロフェッショナルなビジュアルデザイン

export const colors = {
  // プライマリカラー（青系 - 信頼性と知性を表現）
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // セカンダリカラー（紫系 - 創造性と革新性）
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // 成功色（緑系）
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // 警告色（アンバー系）
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // エラー色（赤系）
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // グレースケール
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // 背景色
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    canvas: '#fafafa',
  },
  
  // ゲート別カラー
  gates: {
    INPUT: {
      primary: '#3b82f6',
      active: '#22c55e',
      inactive: '#9ca3af',
    },
    OUTPUT: {
      primary: '#8b5cf6',
      active: '#22c55e',
      inactive: '#9ca3af',
    },
    AND: {
      primary: '#f59e0b',
      stroke: '#d97706',
    },
    OR: {
      primary: '#22c55e',
      stroke: '#16a34a',
    },
    NOT: {
      primary: '#ef4444',
      stroke: '#dc2626',
    },
  },
  
  // ワイヤーカラー
  wire: {
    inactive: '#d1d5db',
    active: '#3b82f6',
    highlight: '#8b5cf6',
    drawing: '#60a5fa',
  },
};

export const typography = {
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export const animations = {
  durations: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// コンポーネント別スタイル定義
export const components = {
  gate: {
    width: 80,
    height: 50,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    iconSize: 24,
    padding: spacing[3],
    transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
    
    hover: {
      scale: 1.05,
      brightness: 1.1,
      shadow: shadows.lg,
    },
    
    active: {
      scale: 0.95,
      shadow: shadows.sm,
    },
    
    dragging: {
      opacity: 0.6,
      cursor: 'grabbing',
    },
  },
  
  wire: {
    strokeWidth: 3,
    strokeWidthActive: 4,
    strokeWidthHover: 5,
    curveRadius: 20,
    arrowSize: 8,
    dashArray: '5, 5',
    
    animation: {
      pulse: 'pulse 2s infinite',
      flow: 'flow 1s linear infinite',
    },
  },
  
  toolbar: {
    height: 64,
    padding: spacing[4],
    gap: spacing[2],
    borderRadius: borderRadius['2xl'],
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    shadow: shadows.lg,
    
    button: {
      size: 48,
      borderRadius: borderRadius.xl,
      iconSize: 24,
    },
  },
  
  panel: {
    width: 320,
    padding: spacing[6],
    borderRadius: borderRadius['2xl'],
    background: colors.background.primary,
    shadow: shadows.xl,
  },
};