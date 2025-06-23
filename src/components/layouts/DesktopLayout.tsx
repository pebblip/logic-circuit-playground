import React, { useState } from 'react';
import { Header } from '../Header';
import { ToolPalette } from '../ToolPalette';
import { Canvas } from '../canvas/Canvas';
import { CANVAS_MODE_PRESETS } from '../canvas/types/canvasTypes';
import { PropertyPanel } from '../property-panel';
import { FloatingLearningPanel } from '../../features/learning-mode/ui/FloatingLearningPanel';
import { CircuitVisualizerPanel } from '../CircuitVisualizerPanel';
import { HelpPanel } from '../HelpPanel';
import { TimingChartPanel } from '../../features/timing-chart/components/TimingChartPanel';
import { GalleryModeLayout } from '../../features/gallery/components/GalleryModeLayout';
import { PuzzlePanel } from '../../features/puzzle-mode/ui/PuzzlePanel';
import { useCircuitStore } from '../../stores/circuitStore';
import type { AppMode } from '../../types/appMode';
import { TERMS } from '../../features/learning-mode/data/terms';
import { QuickTutorial } from '../QuickTutorial';

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
    timingChart,
    timingChartActions,
    simulationConfig,
    setDelayMode,
    selectedGateId,
  } = useCircuitStore();
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [highlightedGateId, setHighlightedGateId] = useState<string | null>(
    null
  );
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPipLearningOpen, setIsPipLearningOpen] = useState(false);
  const [showQuickTutorial, setShowQuickTutorial] = useState(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);

  const handleModeChange = (mode: AppMode) => {
    if (mode === '学習モード') {
      // Picture-in-Picture学習パネルを開く
      setIsPipLearningOpen(true);
      setIsPuzzleOpen(false);
      // 学習モードをアクティブに設定（ボタンが光るように）
      setAppMode('学習モード');
    } else if (mode === 'パズルモード') {
      // パズルパネルを開く
      setIsPuzzleOpen(true);
      setIsPipLearningOpen(false);
      setAppMode('パズルモード');
    } else {
      // 他のモードの場合は学習パネルとパズルパネルを閉じる
      setIsPipLearningOpen(false);
      setIsPuzzleOpen(false);
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

  // ゲート選択時にプロパティパネルを自動表示
  React.useEffect(() => {
    if (selectedGateId && isVisualizerOpen && appMode === 'フリーモード') {
      // ゲートが選択されたらビジュアライザーを閉じてプロパティパネルを表示
      setIsVisualizerOpen(false);
    }
  }, [selectedGateId, isVisualizerOpen, appMode]);

  return (
    <div
      className={`app-container ${appMode === TERMS.GALLERY_MODE ? 'gallery-mode' : ''}`}
    >
      {/* ヘッダー（グリッド全幅） */}
      <Header
        activeMode={appMode}
        onModeChange={handleModeChange}
        onOpenHelp={handleOpenHelp}
      />

      {/* 左サイドバー - ツールパレット */}
      {appMode !== TERMS.GALLERY_MODE && appMode !== TERMS.PUZZLE_MODE && (
        <aside className="sidebar-left">
          <ToolPalette />
        </aside>
      )}

      {/* メインキャンバス */}
      {appMode === TERMS.GALLERY_MODE ? (
        <GalleryModeLayout />
      ) : (
        <main className="main-canvas">
          <>
            {/* キャンバス */}
            <div className="canvas-container">
              <Canvas
                config={CANVAS_MODE_PRESETS.editor}
                dataSource={{ store: true }}
                highlightedGateId={highlightedGateId}
              />

              {/* フローティングアクションボタン（FAB） - キャンバス内に配置 */}
              {viewMode !== 'custom-gate-preview' && (
                <div
                  className="canvas-toolbar timing-chart-toggle"
                  data-testid="canvas-toolbar"
                >
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
                  <div
                    className="control-separator"
                    style={{
                      width: '1px',
                      height: '24px',
                      background: 'var(--color-border-subtle)',
                      margin: '0 4px',
                      opacity: 0.5,
                    }}
                  />
                  <button
                    className={`tool-button ${timingChart.isVisible ? 'active' : ''}`}
                    data-testid="timing-chart-toggle-button"
                    title="タイミングチャート"
                    onClick={() => timingChartActions.togglePanel()}
                  >
                    📊
                  </button>
                  <div
                    className="control-separator"
                    style={{
                      width: '1px',
                      height: '24px',
                      background: 'var(--color-border-subtle)',
                      margin: '0 4px',
                      opacity: 0.5,
                    }}
                  />
                  <button
                    className={`tool-button ${simulationConfig.delayMode ? 'active' : ''}`}
                    title={`遅延モード: ${simulationConfig.delayMode ? 'ON' : 'OFF'}`}
                    onClick={() => setDelayMode(!simulationConfig.delayMode)}
                    style={{
                      backgroundColor: simulationConfig.delayMode
                        ? 'var(--color-accent)'
                        : undefined,
                      color: simulationConfig.delayMode ? 'white' : undefined,
                    }}
                  >
                    ⏱️
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
              <div
                className="status-item"
                style={{
                  color: simulationConfig.delayMode
                    ? 'var(--color-accent)'
                    : 'inherit',
                }}
              >
                <span>
                  ⏱️ 遅延: {simulationConfig.delayMode ? 'ON' : 'OFF'}
                </span>
              </div>
              {simulationConfig.delayMode && (
                <div className="status-item">
                  <span>エンジン: イベント駆動</span>
                </div>
              )}
            </div>
          </>
        </main>
      )}

      {/* 右サイドバー */}
      {appMode !== TERMS.GALLERY_MODE && (
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
          ) : appMode === TERMS.PUZZLE_MODE ? (
            <PuzzlePanel isVisible={isPuzzleOpen} />
          ) : null}
        </aside>
      )}

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
        onStartTutorial={() => {
          handleCloseHelp();
          setShowQuickTutorial(true);
        }}
      />

      {/* タイミングチャートパネル - 横長レイアウト（fixed position） */}
      {appMode !== TERMS.GALLERY_MODE && <TimingChartPanel />}

      {/* クイックチュートリアル */}
      {showQuickTutorial && (
        <QuickTutorial
          onClose={() => {
            setShowQuickTutorial(false);
            localStorage.setItem('quickTutorialCompleted', 'true');
          }}
          gates={gates}
          wires={wires}
        />
      )}
    </div>
  );
};
