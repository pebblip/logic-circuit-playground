import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { UnifiedCanvas } from '../canvas/UnifiedCanvas';
import { CANVAS_MODE_PRESETS } from '../canvas/types/canvasTypes';
import { PropertyPanel } from '../property-panel';
import { FloatingLearningPanel } from '../../features/learning-mode/ui/FloatingLearningPanel';
import { HelpPanel } from '../HelpPanel';
import { useCircuitStore } from '../../stores/circuitStore';
import { TERMS } from '../../features/learning-mode/data/terms';
import type { AppMode } from '../../types/appMode';
import '../../styles/tablet-layout.css';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

export const TabletLayout: React.FC<TabletLayoutProps> = () => {
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(true);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPipLearningOpen, setIsPipLearningOpen] = useState(false);
  const { appMode, setAppMode } = useCircuitStore();

  const handleOpenHelp = () => {
    setIsHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setIsHelpOpen(false);
  };

  return (
    <div className="tablet-layout">
      <Header
        activeMode={appMode}
        onModeChange={mode => {
          if (mode === '学習モード') {
            setIsPipLearningOpen(true);
            setAppMode('学習モード');
          } else {
            setIsPipLearningOpen(false);
            setAppMode(mode as AppMode);
          }
        }}
        onOpenHelp={handleOpenHelp}
      />
      <div className="tablet-main">
        {/* ツールパレット（折りたたみ可能） */}
        <div
          className={`tablet-tool-palette ${isToolPaletteOpen ? 'open' : 'collapsed'}`}
        >
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
          <UnifiedCanvas
            config={CANVAS_MODE_PRESETS.editor}
            dataSource={{ store: true }}
          />
        </div>

        {/* プロパティパネル（折りたたみ可能） */}
        {
          <div
            className={`tablet-property-panel ${isPropertyPanelOpen ? 'open' : 'collapsed'}`}
          >
            <button
              className="panel-toggle"
              onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
            >
              {isPropertyPanelOpen ? '▶' : '◀'}
            </button>
            {isPropertyPanelOpen && <PropertyPanel />}
          </div>
        }
      </div>

      {/* Picture-in-Picture学習パネル */}
      <FloatingLearningPanel
        isOpen={isPipLearningOpen}
        onClose={() => {
          setIsPipLearningOpen(false);
          setAppMode('フリーモード');
        }}
        onOpenHelp={handleOpenHelp}
      />

      {/* ヘルプパネル */}
      <HelpPanel
        isOpen={isHelpOpen}
        onClose={handleCloseHelp}
        onOpenLearningMode={() => {
          handleCloseHelp();
          setAppMode(TERMS.LEARNING_MODE);
        }}
      />
    </div>
  );
};
