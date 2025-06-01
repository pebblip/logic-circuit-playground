import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import '../../styles/tablet-layout.css';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

export const TabletLayout: React.FC<TabletLayoutProps> = () => {
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);

  return (
    <div className="tablet-layout">
      <Header />
      <div className="tablet-main">
        {/* ツールパレット（折りたたみ可能） */}
        <div className={`tablet-tool-palette ${isToolPaletteOpen ? 'open' : 'collapsed'}`}>
          <button 
            className="palette-toggle"
            onClick={() => setIsToolPaletteOpen(!isToolPaletteOpen)}
          >
            {isToolPaletteOpen ? '◀' : '▶'}
          </button>
          {isToolPaletteOpen && <ToolPalette />}
        </div>
        
        {/* キャンバス */}
        <div className="tablet-canvas-container">
          <Canvas />
        </div>
        
        {/* プロパティパネル（折りたたみ可能） */}
        <div className={`tablet-property-panel ${isPropertyPanelOpen ? 'open' : 'collapsed'}`}>
          <button 
            className="panel-toggle"
            onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
          >
            {isPropertyPanelOpen ? '▶' : '◀'}
          </button>
          {isPropertyPanelOpen && <PropertyPanel />}
        </div>
      </div>
    </div>
  );
};