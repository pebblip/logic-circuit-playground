import React, { ReactNode, useState } from 'react';
import { Header } from './components/Header';
import { CollapsibleToolPalette } from './components/CollapsibleToolPalette';

interface TabletLayoutProps {
  children: ReactNode;
}

/**
 * タブレット用レイアウト（折り畳み可能なサイドバー）
 */
export const TabletLayout: React.FC<TabletLayoutProps> = ({ children }) => {
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-gray-900">
      {/* Grid: ヘッダー + 2カラム */}
      <div 
        className="grid h-full"
        style={{
          gridTemplateColumns: isToolPaletteOpen ? '240px 1fr' : '60px 1fr',
          gridTemplateRows: '56px 1fr',
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.05)',
          transition: 'grid-template-columns 0.3s ease'
        }}
      >
        {/* ヘッダー */}
        <Header className="col-span-2" />
        
        {/* 折り畳み可能なツールパレット */}
        <aside className="bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <CollapsibleToolPalette 
            isOpen={isToolPaletteOpen}
            onToggle={() => setIsToolPaletteOpen(!isToolPaletteOpen)}
          />
        </aside>
        
        {/* メインキャンバス */}
        <main className="bg-gray-900 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};