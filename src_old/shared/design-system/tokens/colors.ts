/**
 * カラートークン定義
 * CSS変数として使用され、テーマ切り替えに対応
 */

export const colors = {
  // Primary Colors - 青系（メインブランドカラー）
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

  // Secondary Colors - 紫系（アクセントカラー）
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Success - 緑系
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

  // Warning - 黄系
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Error - 赤系
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

  // Neutral - グレー系
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Background Colors
  background: {
    primary: '#0a0e27',    // メイン背景
    secondary: '#0f1419',  // セカンダリ背景
    elevated: '#1e293b',   // 浮き上がった要素
    overlay: 'rgba(0, 0, 0, 0.8)', // オーバーレイ
  },

  // Semantic Colors
  semantic: {
    // ゲートタイプ別の色
    gateInput: '#10b981',   // 入力ゲート（緑）
    gateOutput: '#3b82f6',  // 出力ゲート（青）
    gateActive: '#22c55e',  // アクティブな信号
    gateInactive: '#64748b', // 非アクティブ
    
    // 接続線の色
    wireDefault: '#64748b',
    wireActive: '#10b981',
    wireHover: '#3b82f6',
    wireError: '#ef4444',
    
    // インタラクション
    hover: 'rgba(59, 130, 246, 0.1)',
    focus: 'rgba(59, 130, 246, 0.2)',
    selected: 'rgba(59, 130, 246, 0.3)',
  },
} as const;

// 型定義
export type ColorToken = typeof colors;
export type ColorCategory = keyof ColorToken;
export type ColorShade<T extends ColorCategory> = keyof ColorToken[T];