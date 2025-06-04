import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../property-panel';
import { LearningPanel } from '../../features/learning-mode/ui/LearningPanel';
import { CircuitVisualizerPanel } from '../CircuitVisualizerPanel';
import { useCircuitStore } from '../../stores/circuitStore';
import type { AppMode } from '../../types/appMode';

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
  } = useCircuitStore();
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [highlightedGateId, setHighlightedGateId] = useState<string | null>(
    null
  );

  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
  };

  const handleGateHighlight = (gateId: string) => {
    setHighlightedGateId(gateId);
  };

  const handleGateUnhighlight = () => {
    setHighlightedGateId(null);
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
      <Header activeMode={appMode} onModeChange={handleModeChange} />

      {/* 左サイドバー - ツールパレット */}
      <aside className="sidebar-left">
        <ToolPalette />
      </aside>

      {/* メインキャンバス */}
      <main className="main-canvas">
        {/* キャンバスツールバー */}
        <div className="canvas-toolbar" data-testid="canvas-toolbar">
          <button
            className="tool-button"
            title="元に戻す"
            onClick={undo}
            disabled={!canUndo()}
            style={{ opacity: canUndo() ? 1 : 0.3 }}
          >
            ↩️
          </button>
          <button
            className="tool-button"
            title="やり直し"
            onClick={redo}
            disabled={!canRedo()}
            style={{ opacity: canRedo() ? 1 : 0.3 }}
          >
            ↪️
          </button>
          <div
            style={{
              width: '1px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '0 4px',
            }}
          ></div>
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
          <div
            style={{
              width: '1px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '0 4px',
            }}
          ></div>
          <button
            className={`tool-button ${isVisualizerOpen ? 'active' : ''}`}
            title="ビジュアライザーを開く"
            onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
          >
            📟
          </button>
        </div>

        {/* キャンバス */}
        <div className="canvas-container">
          <Canvas highlightedGateId={highlightedGateId} />
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
      {appMode === '自由制作' && (
        <aside className="sidebar-right">
          {isVisualizerOpen ? (
            <CircuitVisualizerPanel
              isVisible={isVisualizerOpen}
              onGateHighlight={handleGateHighlight}
              onGateUnhighlight={handleGateUnhighlight}
            />
          ) : (
            <PropertyPanel />
          )}
        </aside>
      )}

      {/* 学習モードパネル */}
      <LearningPanel
        isOpen={appMode === '学習モード'}
        onClose={() => setAppMode('自由制作')}
      />
    </div>
  );
};
