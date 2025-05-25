// デザイントークン - カラー、スペーシング、アニメーションなどの定数

export const colors = {
  // 信号の状態
  signal: {
    on: '#10b981',      // 明るい緑
    onGlow: '#34d399',  // 発光エフェクト用
    off: '#6b7280',     // グレー
    wire: '#374151',    // ワイヤーの色
    wireActive: '#10b981', // アクティブなワイヤー
  },
  
  // UI要素
  ui: {
    background: '#f9fafb',
    surface: '#ffffff',
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    accent: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  },
  
  // ゲートの色
  gates: {
    basic: '#3b82f6',      // 基本ゲート（青）
    memory: '#8b5cf6',     // メモリ要素（紫）
    arithmetic: '#f59e0b', // 演算回路（オレンジ）
    cpu: '#ef4444',        // CPU要素（赤）
  },
  
  // ダークモード（将来実装用）
  dark: {
    background: '#111827',
    surface: '#1f2937',
    border: '#374151',
  }
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
};

export const animation = {
  // トランジション
  transition: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // 信号のアニメーション
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  flow: 'flow 1s linear infinite',
  glow: 'glow 1.5s ease-in-out infinite',
};

export const layout = {
  // 固定サイズ
  leftPanel: {
    width: '280px',
    minWidth: '280px',
  },
  rightPanel: {
    width: '320px',
    minWidth: '320px',
  },
  toolbar: {
    height: '64px',
  },
  bottomPanel: {
    minHeight: '200px',
    defaultHeight: '300px',
    maxHeight: '500px',
  },
  canvas: {
    minWidth: '800px',
    minHeight: '600px',
  }
};

export const typography = {
  // フォントサイズ
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem',    // 24px
  },
  
  // フォントウェイト
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // 行間
  lineHeight: {
    tight: 1.25,
    base: 1.5,
    relaxed: 1.75,
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const radius = {
  sm: '0.25rem',    // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',
};