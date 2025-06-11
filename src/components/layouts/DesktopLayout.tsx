import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../property-panel';
import { FloatingLearningPanel } from '../../features/learning-mode/ui/FloatingLearningPanel';
import { CircuitVisualizerPanel } from '../CircuitVisualizerPanel';
import { HelpPanel } from '../HelpPanel';
import { useCircuitStore } from '../../stores/circuitStore';
import type { AppMode } from '../../types/appMode';
import { TERMS } from '../../features/learning-mode/data/terms';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = () => {
  const {
    gates,
    wires,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    appMode,
    setAppMode,
    viewMode,
  } = useCircuitStore();
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [highlightedGateId, setHighlightedGateId] = useState<string | null>(
    null
  );
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPipLearningOpen, setIsPipLearningOpen] = useState(false);

  const handleModeChange = (mode: AppMode) => {
    if (mode === '学習モード') {
      // Picture-in-Picture学習パネルを開く
      setIsPipLearningOpen(true);
      // フリーモードに戻す（並行表示のため）
      setAppMode('フリーモード');
    } else {
      setAppMode(mode as AppMode);
    }
  };

  const handleGateHighlight = (gateId: string) => {
    setHighlightedGateId(gateId);
  };

  const handleGateUnhighlight = () => {
    setHighlightedGateId(null);
  };

  const handleOpenHelp = () => {
    setIsHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setIsHelpOpen(false);
  };


  // 緊急修正: 自動表示ロジックを無効化（バツボタンの妨害を防ぐ）
  // React.useEffect(() => {
  //   if (gates.length >= 3 && !isVisualizerOpen) {
  //     // 基本的な回路がある時に自動表示
  //     const hasClockAndOutputs =
  //       gates.some(g => g.type === 'CLOCK') &&
  //       gates.filter(g => g.type === 'OUTPUT').length >= 2;
  //     if (hasClockAndOutputs) {
  //       setIsVisualizerOpen(true);
  //     }
  //   }
  // }, [gates, isVisualizerOpen]);

  return (
    <div className="app-container">
      {/* ヘッダー（グリッド全幅） */}
      <Header 
        activeMode={appMode} 
        onModeChange={handleModeChange}
        onOpenHelp={handleOpenHelp}
      />

      {/* 左サイドバー - ツールパレット */}
      <aside className="sidebar-left">
        <ToolPalette />
      </aside>

      {/* メインキャンバス */}
      <main className="main-canvas">
        {/* キャンバス */}
        <div className="canvas-container">
          <Canvas highlightedGateId={highlightedGateId} />

          {/* フローティングアクションボタン（FAB） - キャンバス内に配置 */}
          {viewMode !== 'custom-gate-preview' && (
            <div className="canvas-toolbar">
              <button
                className="tool-button"
                title="元に戻す (Ctrl+Z)"
                onClick={undo}
                disabled={!canUndo()}
                style={{ opacity: canUndo() ? 1 : 0.5 }}
              >
                ↩️
              </button>
              <button
                className="tool-button"
                title="やり直し (Ctrl+Y)"
                onClick={redo}
                disabled={!canRedo()}
                style={{ opacity: canRedo() ? 1 : 0.5 }}
              >
                ↪️
              </button>
              <button
                className="tool-button"
                title="すべてクリア"
                onClick={() => {
                  if (window.confirm('すべての回路を削除しますか？')) {
                    clearAll();
                  }
                }}
              >
                🗑️
              </button>
              <button
                className={`tool-button ${isVisualizerOpen ? 'active' : ''}`}
                title="ビジュアライザー"
                onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
              >
                📟
              </button>
            </div>
          )}
        </div>

        {/* ステータスバー */}
        <div className="status-bar">
          <div className="status-item">
            <span>ゲート: {gates.length}</span>
          </div>
          <div className="status-item">
            <span>接続: {wires.length}</span>
          </div>
        </div>
      </main>

      {/* 右サイドバー */}
      <aside className="sidebar-right">
        {appMode === 'フリーモード' ? (
          isVisualizerOpen ? (
            <CircuitVisualizerPanel
              isVisible={isVisualizerOpen}
              onGateHighlight={handleGateHighlight}
              onGateUnhighlight={handleGateUnhighlight}
            />
          ) : (
            <PropertyPanel />
          )
        ) : null}
      </aside>

      {/* Picture-in-Picture学習パネル */}
      <FloatingLearningPanel
        isOpen={isPipLearningOpen}
        onClose={() => setIsPipLearningOpen(false)}
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
