import React, { useState, useCallback, useRef, useEffect } from 'react';
// ViewModelのインポート
import { UltraModernCircuitViewModel } from '../viewmodels/UltraModernCircuitViewModel';
import { useDiscovery } from '../hooks/useDiscovery';
import { useResponsive } from '../hooks/useResponsive';
import { ExperimentNotebook } from './ExperimentNotebook';
import { DiscoveryTutorial } from './DiscoveryTutorial';
import { 
  saveUserPreferences, 
  getUserPreferences,
  saveTutorialState,
  getTutorialState,
  saveCustomGate,
  getCustomGates,
  decodeCircuitFromURL
} from '../utils/circuitStorage';
import { migrateAllCustomGates } from '../utils/customGateMigration';

// レスポンシブコンポーネント
import { ResponsiveLayout } from './Layout/ResponsiveLayout';
import { ResponsiveHeader } from './Layout/ResponsiveHeader';
import { ResponsiveToolPalette } from './Layout/ResponsiveToolPalette';
import { MobileBottomNav } from './Layout/MobileBottomNav';

// カスタムフックのインポート
import { useCircuitState } from '../hooks/useCircuitState';
import { useUIInteraction } from '../hooks/useUIInteraction';
import { usePanelVisibility } from '../hooks/usePanelVisibility';
import { useWireDrawing } from '../hooks/useWireDrawing';
import { useEducationalFeatures } from '../hooks/useEducationalFeatures';
import { useCustomGates } from '../hooks/useCustomGates';
import { useDiscoverySystem } from '../hooks/useDiscoverySystem';
import { useTheme } from '../hooks/useTheme';
import { useViewModelSubscription } from '../hooks/useViewModelSubscription';

// モード関連のインポート
import { CircuitMode, DEFAULT_MODE } from '../types/mode';
import { getGatesForMode } from '../constants/modeGates';
import { useAppMode } from '../hooks/useAppMode';

// Import all required components
import TutorialSystemV2 from './TutorialSystemV2';
import ProgressTracker from './ProgressTracker';
import SaveLoadPanel from './SaveLoadPanel';
import GateDefinitionDialog from './GateDefinitionDialog';
import CustomGateDetail from './CustomGateDetail';
import { ClockControl } from './ClockControl';
import { LearningModeManager } from './Education/LearningModeManager';
import { FreeModeGuide } from './Education/FreeModeGuide';
import { PuzzleModeManager } from './Education/PuzzleModeManager';

// 改善されたゲートコンポーネント
import { ImprovedGateComponent } from './Circuit/ImprovedGateComponent';
import { PIN_CONSTANTS } from '../constants/ui';
import { PinComponent } from './Circuit/PinComponent';

// Types
import {
  UltraModernGate,
  UltraModernConnection,
  Progress,
  Preferences,
  DrawingWire,
  DragOffset,
  CustomGateDefinition,
  Theme,
  GateType,
  SimulationResults
} from '../types/circuit';

const ResponsiveUltraModernCircuit: React.FC = () => {
  // ViewModelの初期化
  const [viewModel] = useState(() => new UltraModernCircuitViewModel());
  
  // レスポンシブフック
  const { isMobile, isTablet, deviceType } = useResponsive();
  
  // モバイルメニューの状態
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(false);
  
  // カスタムフックの使用
  const {
    selectedTool,
    setSelectedTool,
    hoveredGate,
    setHoveredGate,
    draggedGate,
    dragOffset,
    isDraggingGate,
    startDragging,
    updateDragging,
    stopDragging
  } = useUIInteraction();
  
  const { selectedTheme, setSelectedTheme } = useTheme();
  
  const {
    drawingWire,
    startWireConnection,
    updateWirePosition,
    completeWireConnection,
    cancelWireConnection
  } = useWireDrawing({ viewModel });
  
  // モード状態（App.tsxと共有）
  const { currentMode, setMode: setCurrentMode } = useAppMode();
  
  // 発見システム
  const {
    progress,
    discoveries,
    milestones,
    incrementExperiments,
    makeDiscovery,
    checkDiscoveries,
    toggleFavoriteCircuit
  } = useDiscovery();
  
  // パネル表示状態
  const {
    showHelp, toggleHelp,
    showNotebook, toggleNotebook,
    showSaveLoad, toggleSaveLoad,
    showGateDefinition, toggleGateDefinition,
    showCustomGatePanel, toggleCustomGatePanel
  } = usePanelVisibility();
  
  // 追加の状態管理
  const [showProgress, setShowProgress] = useState(false);
  const toggleProgress = () => setShowProgress(!showProgress);
  
  // 教育機能
  const {
    showTutorial,
    showChallenge,
    showExtendedChallenge,
    setShowTutorial,
    setShowChallenge,
    setShowExtendedChallenge
  } = useEducationalFeatures();
  
  // カスタムゲート機能
  const {
    customGates,
    setCustomGates
  } = useCustomGates();
  
  // UI参照
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  
  // 状態管理
  const [gates, setGates] = useState<UltraModernGate[]>([]);
  const [connections, setConnections] = useState<UltraModernConnection[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResults>({});
  const [preferences, setPreferences] = useState<Preferences>({
    tutorialCompleted: false,
    mode: currentMode
  });
  const [showDiscoveryTutorial, setShowDiscoveryTutorial] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // ViewModelの購読
  useViewModelSubscription({
    viewModel,
    onGatesChanged: (gates) => setGates(gates),
    onConnectionsChanged: (connections) => setConnections(connections),
    onSimulationResultsChanged: (results) => {
      const simResults: SimulationResults = {};
      results.forEach((value, key) => {
        simResults[key] = value;
      });
      setSimulationResults(simResults);
    }
  });
  
  // テーマ取得
  const theme = {
    colors: {
      background: selectedTheme === 'minimal' ? '#fafafa' : '#0a0a0a',
      ui: {
        primary: selectedTheme === 'minimal' ? '#1a1a1a' : '#ffffff',
        secondary: selectedTheme === 'minimal' ? '#666666' : '#999999',
        border: selectedTheme === 'minimal' ? '#e0e0e0' : '#333333',
        buttonBg: selectedTheme === 'minimal' ? '#ffffff' : '#1a1a1a',
        buttonHover: selectedTheme === 'minimal' ? '#f0f0f0' : '#2a2a2a',
        buttonActive: selectedTheme === 'minimal' ? '#e0e0e0' : '#3a3a3a',
        accent: '#00ff88'
      },
      gate: {
        bg: selectedTheme === 'minimal' ? '#ffffff' : '#1a1a1a',
        border: selectedTheme === 'minimal' ? '#333333' : '#666666',
        text: selectedTheme === 'minimal' ? '#1a1a1a' : '#ffffff',
        activeBg: selectedTheme === 'minimal' ? '#e8f5e9' : '#00ff88',
        activeBorder: selectedTheme === 'minimal' ? '#4caf50' : '#00ff88',
        activeText: selectedTheme === 'minimal' ? '#2e7d32' : '#000000'
      },
      wire: {
        active: '#00ff88',
        inactive: selectedTheme === 'minimal' ? '#cccccc' : '#444444',
        selected: '#ff6b6b'
      },
      signal: {
        on: '#00ff88',
        off: selectedTheme === 'minimal' ? '#cccccc' : '#444444'
      }
    }
  };
  
  // ゲート配置（改善版）
  const addGate = useCallback((type: GateType) => {
    const canvasRect = svgRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // キャンバスの中心を基準に配置
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    // 既存のゲートとの重なりを避けるためのオフセット
    let offset = 0;
    let x = centerX;
    let y = centerY;
    
    // 既存のゲートと重ならない位置を探す
    while (gates.some(g => Math.abs(g.x - x) < 80 && Math.abs(g.y - y) < 80)) {
      offset += 60;
      x = centerX + (offset * Math.cos(offset / 50));
      y = centerY + (offset * Math.sin(offset / 50));
    }
    
    // グリッドにスナップ
    x = Math.round(x / 20) * 20;
    y = Math.round(y / 20) * 20;
    
    // ViewModelにゲートを追加
    viewModel.addGate(type as any, { x, y });
    
    // 実験カウントを増やす
    incrementExperiments();
    
    // モバイルの場合はツールパレットを閉じる
    if (isMobile) {
      setIsToolPaletteOpen(false);
    }
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: `${type}_PLACED` } 
      }));
    }
  }, [gates, progress, showTutorial, viewModel, isMobile]);
  
  // ヘッダーコンポーネント
  const headerComponent = (
    <ResponsiveHeader
      currentMode={currentMode}
      onModeChange={setCurrentMode}
      onMenuClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
      selectedTheme={selectedTheme}
      onThemeChange={(theme) => setSelectedTheme(theme as any)}
      showNotebook={showNotebook}
      onNotebookToggle={toggleNotebook}
      showProgress={showProgress}
      onProgressToggle={toggleProgress}
      showSaveLoad={showSaveLoad}
      onSaveLoadToggle={toggleSaveLoad}
      onClear={() => viewModel.clear()}
    />
  );
  
  // サイドパネルコンポーネント
  const sidePanelComponent = (
    <>
      {currentMode === 'learning' && (
        <LearningModeManager 
          currentMode={currentMode} 
          onLoadCircuit={(circuitData) => viewModel.loadCircuit(circuitData)}
        />
      )}
      {currentMode === 'free' && (
        <FreeModeGuide 
          currentMode={currentMode}
          onStartTutorial={() => setShowDiscoveryTutorial(true)}
        />
      )}
      {currentMode === 'puzzle' && (
        <PuzzleModeManager 
          currentMode={currentMode}
          onLoadCircuit={(circuitData) => viewModel.loadCircuit(circuitData)}
          gates={gates}
          connections={connections}
        />
      )}
    </>
  );
  
  // ツールパレットコンポーネント
  const toolPaletteComponent = (
    <ResponsiveToolPalette
      currentMode={currentMode}
      selectedTool={selectedTool}
      onToolSelect={(tool) => setSelectedTool(tool as string)}
      onGateAdd={(type) => addGate(type as any)}
    />
  );
  
  // モバイルボトムナビゲーション
  const bottomNavComponent = isMobile ? (
    <MobileBottomNav
      currentMode={currentMode}
      onModeChange={setCurrentMode}
      onMenuClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
      onToolsClick={() => setIsToolPaletteOpen(!isToolPaletteOpen)}
    />
  ) : undefined;
  
  // イベントハンドラー（既存のものを使用）
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedGate && dragOffset && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
      if (dragStartPos.current) {
        const distance = Math.sqrt(
          Math.pow(newX - dragStartPos.current.x, 2) + 
          Math.pow(newY - dragStartPos.current.y, 2)
        );
        if (distance > 5) {
          hasDraggedRef.current = true;
        }
      }
      
      viewModel.moveGate(draggedGate, newX, newY);
    }

    if (drawingWire && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      updateWirePosition(e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [draggedGate, dragOffset, drawingWire, viewModel, updateWirePosition]);
  
  const handleMouseUp = useCallback(() => {
    stopDragging();
    if (drawingWire) {
      cancelWireConnection();
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  }, [drawingWire, stopDragging, cancelWireConnection]);
  
  // キャンバスコンポーネント（既存のSVG部分）
  const canvasComponent = (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{
        backgroundColor: theme.colors.background,
        cursor: selectedTool ? 'crosshair' : 'default'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 既存のSVG内容をここに移動 */}
      {/* グリッド、接続線、ゲート等 */}
    </svg>
  );
  
  return (
    <ResponsiveLayout
      header={headerComponent}
      sidePanel={sidePanelComponent}
      toolPalette={toolPaletteComponent}
      canvas={canvasComponent}
      bottomNav={bottomNavComponent}
      showSidePanel={currentMode === 'learning' || currentMode === 'free' || currentMode === 'puzzle'}
      showToolPalette={true}
      isSidePanelOpen={isSidePanelOpen}
      isToolPaletteOpen={isToolPaletteOpen}
      onSidePanelToggle={() => setIsSidePanelOpen(!isSidePanelOpen)}
      onToolPaletteToggle={() => setIsToolPaletteOpen(!isToolPaletteOpen)}
    />
  );
};

export default ResponsiveUltraModernCircuit;