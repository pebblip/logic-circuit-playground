import React, { ReactNode } from 'react';
import { Header } from './components/Header';
import { ToolPalette } from './components/ToolPalette';
import { PropertyPanel } from './components/PropertyPanel';

interface DesktopLayoutProps {
  children: ReactNode;
}

/**
 * デスクトップ用レイアウト（モックアップに基づく3カラム）
 */
export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      {/* ヘッダー */}
      <Header />
      
      {/* 左サイドバー - ツールパレット */}
      <aside className="sidebar-left">
        <ToolPalette />
      </aside>
      
      {/* メインキャンバス */}
      <main className="main-canvas">
        {children}
      </main>
      
      {/* 右サイドバー - プロパティパネル */}
      <aside className="sidebar-right" data-testid="right-sidebar">
        <PropertyPanel />
      </aside>
    </div>
  );
};