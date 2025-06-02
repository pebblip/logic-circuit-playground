import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import { LearningPanel } from '../../features/learning-mode/ui/LearningPanel';
import { useCircuitStore } from '../../stores/circuitStore';
import '../../styles/tablet-layout.css';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

export const TabletLayout: React.FC<TabletLayoutProps> = () => {
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const { appMode, setAppMode } = useCircuitStore();

  return (
    <div className="tablet-layout">
      <Header activeMode={appMode} onModeChange={setAppMode} />
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
      
      {/* 学習モードパネル */}
      <LearningPanel 
        isOpen={appMode === '学習モード'}
        onClose={() => setAppMode('自由制作')}
      />
    </div>
  );
};