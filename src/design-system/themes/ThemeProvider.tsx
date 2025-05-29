/**
 * テーマプロバイダー
 * CSS変数を使ってテーマを適用
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { darkTheme } from './dark';

// テーマの型定義
export interface Theme {
  name: string;
  colors: Record<string, string>;
  shadows: Record<string, string>;
}

// コンテキスト
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: darkTheme,
  setTheme: () => {},
});

// カスタムフック
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = darkTheme 
}) => {
  // CSS変数として適用
  useEffect(() => {
    const root = document.documentElement;
    
    // カラーの適用
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // シャドウの適用
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // テーマ名をdata属性に設定
    root.setAttribute('data-theme', theme.name);
  }, [theme]);
  
  const value = useMemo(() => ({
    theme,
    setTheme: () => {
      // 将来的にテーマ切り替え機能を実装
      console.log('Theme switching not implemented yet');
    },
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// グローバルスタイルの生成
export const generateGlobalStyles = (theme: Theme) => `
  :root {
    /* Colors */
    ${Object.entries(theme.colors)
      .map(([key, value]) => `--color-${key}: ${value};`)
      .join('\n    ')}
    
    /* Shadows */
    ${Object.entries(theme.shadows)
      .map(([key, value]) => `--shadow-${key}: ${value};`)
      .join('\n    ')}
  }
  
  /* ダークモード用のスタイル */
  [data-theme="dark"] {
    color-scheme: dark;
  }
  
  /* 基本的なリセット */
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;