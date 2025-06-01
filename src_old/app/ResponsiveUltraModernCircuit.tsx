import React, { useState, useCallback, useRef, useEffect } from 'react';
// ViewModelのインポート
import { UltraModernCircuitViewModel } from '../features/circuit-editor/model/UltraModernCircuitViewModel';
import { useDiscovery } from '../shared/lib/hooks/useDiscovery';
import { useResponsive } from '../shared/lib/hooks/useResponsive';
import { ExperimentNotebook } from '../features/notebook/ui/ExperimentNotebook';
import { DiscoveryTutorial } from '../features/tutorial/ui/DiscoveryTutorial';
import { 
  saveUserPreferences, 
  getUserPreferences,
  saveTutorialState,
  getTutorialState,
  saveCustomGate,
  getCustomGates,
  decodeCircuitFromURL
} from '../shared/lib/utils/circuitStorage';
import { migrateAllCustomGates } from '../shared/lib/utils/customGateMigration';

// レスポンシブコンポーネント
import { ResponsiveLayout } from '../widgets/layout/ResponsiveLayout';
import { ResponsiveHeader } from '../widgets/layout/ResponsiveHeader';
import { ResponsiveToolPalette } from '../widgets/layout/ResponsiveToolPalette';
import { MobileBottomNav } from '../widgets/layout/MobileBottomNav';

// カスタムフックのインポート
import { useCircuitState } from '../shared/lib/hooks/useCircuitState';
import { useUIInteraction } from '../shared/lib/hooks/useUIInteraction';
import { usePanelVisibility } from '../shared/lib/hooks/usePanelVisibility';
import { useWireDrawing } from '../shared/lib/hooks/useWireDrawing';
import { useEducationalFeatures } from '../shared/lib/hooks/useEducationalFeatures';
import { useCustomGates } from '../shared/lib/hooks/useCustomGates';
import { useDiscoverySystem } from '../shared/lib/hooks/useDiscoverySystem';
import { useTheme } from '../shared/lib/hooks/useTheme';
import { useViewModelSubscription } from '../shared/lib/hooks/useViewModelSubscription';
import { usePinState } from '../shared/lib/hooks/usePinState';

// モード関連のインポート
import { CircuitMode, DEFAULT_MODE } from '../entities/types/mode';
import { getGatesForMode } from '../shared/config/modeGates';
import { useAppMode } from '../shared/lib/hooks/useAppMode';

// Import all required components
import TutorialSystemV2 from '../features/tutorial/ui/TutorialSystemV2';
import ProgressTracker from '../features/progress/ui/ProgressTracker';
import SaveLoadPanel from '../features/save-load/ui/SaveLoadPanel';
import GateDefinitionDialog from '../features/custom-gate/ui/GateDefinitionDialog';
import CustomGateDetail from '../features/custom-gate/ui/CustomGateDetail';
import { ClockControl } from '../widgets/clock/ClockControl';
import { LearningModeManager } from '../features/education/ui/LearningModeManager';
import { FreeModeGuide } from '../features/education/ui/FreeModeGuide';
import { PuzzleModeManager } from '../features/education/ui/PuzzleModeManager';

// UI定数
import { PIN_CONSTANTS, GRID_CONSTANTS, GATE_PLACEMENT } from '../shared/config/ui';

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
} from '../entities/types/circuit';

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
  
  // ピン状態管理
  const {
    hoveredPin,
    activePin,
    handlePinHover,
    handlePinClick,
    clearActivePin,
    isPinHovered,
    isPinActive
  } = usePinState();
  
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
  
  // ワイヤー接続用のホバーピン追跡
  const hoveredPinRef = useRef<{ gateId: string; pinType: 'input' | 'output'; pinIndex: number } | null>(null);
  
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
  
  // ゲート配置（改善版 - グリッド配置）
  const addGate = useCallback((type: GateType) => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // SVGの実際のサイズを取得
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    
    // 既存ゲートの数に基づいてグリッド位置を計算
    const gateCount = gates.length;
    const row = Math.floor(gateCount / GATE_PLACEMENT.MAX_GATES_PER_ROW);
    const col = gateCount % GATE_PLACEMENT.MAX_GATES_PER_ROW;
    
    // 配置位置を計算
    let x = GATE_PLACEMENT.INITIAL_X + (col * GATE_PLACEMENT.GRID_SPACING);
    let y = GATE_PLACEMENT.INITIAL_Y + (row * GATE_PLACEMENT.GRID_SPACING);
    
    // 画面外に出ないように調整
    if (x > svgWidth - 100) {
      x = GATE_PLACEMENT.INITIAL_X;
      y += GATE_PLACEMENT.GRID_SPACING;
    }
    if (y > svgHeight - 100) {
      // キャンバスの中心付近に配置
      x = svgWidth / 2;
      y = svgHeight / 2;
    }
    
    // グリッドにスナップ
    x = Math.round(x / GRID_CONSTANTS.SIZE) * GRID_CONSTANTS.SIZE;
    y = Math.round(y / GRID_CONSTANTS.SIZE) * GRID_CONSTANTS.SIZE;
    
    console.log('[DEBUG] Adding gate at:', { type, x, y, svgWidth, svgHeight });
    
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
  }, [gates, viewModel, isMobile, showTutorial, incrementExperiments]);
  
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
    console.log('[DEBUG] handleMouseUp called, hoveredPinRef:', hoveredPinRef.current);
    stopDragging();
    if (drawingWire) {
      // ホバー中のピンがあれば接続を完了、なければキャンセル
      if (hoveredPinRef.current) {
        const { gateId, pinType, pinIndex } = hoveredPinRef.current;
        console.log('[DEBUG] Completing connection to:', gateId, pinType, pinIndex);
        completeWireConnection(gateId, pinIndex, pinType === 'output');
      } else {
        console.log('[DEBUG] No hovered pin, canceling wire connection');
        cancelWireConnection();
      }
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  }, [drawingWire, stopDragging, cancelWireConnection, completeWireConnection]);
  
  // キャンバスクリックハンドラー
  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // 2クリック配置は無効化（1クリック配置のみ使用）
    // if (selectedTool && svgRef.current) {
    //   const rect = svgRef.current.getBoundingClientRect();
    //   const x = Math.round((e.clientX - rect.left) / 20) * 20;
    //   const y = Math.round((e.clientY - rect.top) / 20) * 20;
    //   
    //   // ViewModelを使用してゲートを追加
    //   const gate = viewModel.addGate(selectedTool as string, { x, y });
    //   if (gate) {
    //     viewModel.simulate();
    //     setSelectedTool(''); // ツール選択をクリア
    //     
    //     // 実験カウントを増やす
    //     incrementExperiments();
    //     
    //     // モバイルの場合はツールパレットを閉じる
    //     if (isMobile) {
    //       setIsToolPaletteOpen(false);
    //     }
    //   }
    // }
  }, []);

  // ゲート描画
  const renderGate = (gate: UltraModernGate) => {
    const result = simulationResults[gate.id];
    const isActive = Array.isArray(result) ? result[0] : !!result;
    const isDragging = draggedGate === gate.id;
    const GATE_SIZE = 50;
    
    // デバッグ：ゲートの座標を確認
    if (gate.x === 0 && gate.y === 0) {
      console.log('[DEBUG] Gate at (0,0):', gate.id, gate.type);
    }
    
    return (
      <g 
        key={gate.id} 
        transform={`translate(${gate.x}, ${gate.y})`}
        className="gate-enter"
        style={{
          transformOrigin: 'center',
          transition: isDragging ? 'none' : `transform ${PIN_CONSTANTS.TRANSITION_DURATION} ease`
        }}
      >
        {/* ホバーエフェクト */}
        {hoveredGate === gate.id && selectedTheme !== 'minimal' && (
          <circle cx={0} cy={0} r={GATE_SIZE/2 + 10}
            fill="none"
            stroke={theme.colors.ui.accent}
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        
        {/* ゲート本体 */}
        <g
          style={{ cursor: gate.type === 'INPUT' || gate.type === 'CLOCK' ? 'pointer' : 'move' }}
          onMouseEnter={() => setHoveredGate(gate.id)}
          onMouseLeave={() => setHoveredGate(null)}
          onMouseDown={(e) => {
            e.stopPropagation();
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              startDragging(gate.id, {
                x: e.clientX - rect.left - gate.x,
                y: e.clientY - rect.top - gate.y
              });
              dragStartPos.current = { x: gate.x, y: gate.y };
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasDraggedRef.current) {
              if (gate.type === 'INPUT') {
                viewModel.toggleInput(gate.id);
              } else if (gate.type === 'CLOCK') {
                // CLOCKゲートの開始/停止
                const clockState = viewModel.getClockState(gate.id);
                if (clockState) {
                  if (clockState.isRunning) {
                    viewModel.stopClock(gate.id);
                  } else {
                    viewModel.startClock(gate.id);
                  }
                }
              }
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            viewModel.removeGate(gate.id);
          }}
        >
          {/* ゲートタイプごとのSVG */}
          {renderGateShape(gate.type, isActive, GATE_SIZE)}
        </g>
        
        {/* ピン */}
        {renderGatePins(gate, isActive)}
      </g>
    );
  };

  // ワイヤー描画
  const renderWire = (connection: UltraModernConnection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    // 出力ピンの位置計算
    const fromPin = fromGate.outputs?.[connection.fromOutput || 0];
    const toPin = toGate.inputs?.[connection.toInput || 0];
    
    if (!fromPin || !toPin) return null;
    
    const startX = fromPin.x;
    const startY = fromPin.y;
    const endX = toPin.x;
    const endY = toPin.y;
    
    const result = simulationResults[connection.from];
    const isActive = Array.isArray(result) ? result[0] : !!result;
    
    const midX = (startX + endX) / 2;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        {/* アクティブ時のグロー */}
        {isActive && selectedTheme !== 'minimal' && (
          <path
            d={path}
            fill="none"
            stroke={theme.colors.signal.on}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(4px)"
          />
        )}
        
        <path
          d={path}
          fill="none"
          stroke={isActive ? theme.colors.signal.on : theme.colors.signal.off}
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            transition: 'stroke 0.3s ease'
          }}
        />
      </g>
    );
  };

  // ゲートの形状を描画
  const renderGateShape = (type: string, isActive: boolean, size: number) => {
    const halfSize = size / 2;
    const activeColor = '#00ff88';
    const inactiveColor = 'rgba(255, 255, 255, 0.2)';
    const fillColor = isActive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)';
    const strokeColor = isActive ? activeColor : inactiveColor;
    const textColor = isActive ? activeColor : '#ffffff';

    switch (type) {
      case 'INPUT':
        return (
          <>
            <circle cx={0} cy={0} r={halfSize} 
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" fill={textColor} fontSize="20" fontWeight="bold">
              {isActive ? '1' : '0'}
            </text>
          </>
        );
      
      case 'OUTPUT':
        return (
          <>
            <circle cx={0} cy={0} r={halfSize}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <circle cx={0} cy={0} r={halfSize * 0.6}
              fill={isActive ? activeColor : 'transparent'}
            />
          </>
        );
      
      case 'AND':
        return (
          <>
            <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">
              AND
            </text>
          </>
        );
      
      case 'OR':
        return (
          <>
            <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" fill={textColor} fontSize="16" fontWeight="bold">
              OR
            </text>
          </>
        );
      
      case 'NOT':
        return (
          <>
            <polygon points={`${-halfSize},-${halfSize} ${halfSize},0 ${-halfSize},${halfSize}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <circle cx={halfSize + 5} cy={0} r={5}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="2"
            />
          </>
        );
      
      case 'CLOCK':
        return (
          <>
            <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" fill={textColor} fontSize="20">
              ⏰
            </text>
          </>
        );
      
      default:
        // その他のゲート用のデフォルト
        return (
          <>
            <rect x={-halfSize} y={-halfSize} width={size} height={size} rx={8}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold">
              {type}
            </text>
          </>
        );
    }
  };
  
  // ゲートのピンを描画（高品質版）
  const renderGatePins = (gate: UltraModernGate, isActive: boolean) => {
    const pins: React.ReactNode[] = [];
    
    // 入力ピン
    if (gate.inputs && gate.inputs.length > 0) {
      gate.inputs.forEach((pin, index) => {
        const isHovered = isPinHovered(gate.id, index, false);
        const isPinConnected = pin.isConnected;
        const pinValue = isPinConnected && isActive;
        
        // デバッグ：最初のゲートの最初のピンの座標を確認
        if (gate.id === 'gate_1' && index === 0) {
          console.log('[DEBUG] Input pin coordinates:', { gateX: gate.x, gateY: gate.y, pinX: pin.x, pinY: pin.y });
        }
        
        pins.push(
          <g key={`input-${index}`}>
            {/* ホバー時のグロー効果 */}
            {isHovered && (
              <>
                <circle
                  cx={pin.x - gate.x}
                  cy={pin.y - gate.y}
                  r={PIN_CONSTANTS.HIT_RADIUS}
                  fill={PIN_CONSTANTS.COLORS.INPUT.GLOW}
                  opacity="0.3"
                  style={{
                    animation: 'pulse 2s infinite',
                    pointerEvents: 'none'
                  }}
                />
                <circle
                  cx={pin.x - gate.x}
                  cy={pin.y - gate.y}
                  r={PIN_CONSTANTS.VISUAL_RADIUS * 2}
                  fill="none"
                  stroke={PIN_CONSTANTS.COLORS.INPUT.ACTIVE}
                  strokeWidth="1"
                  opacity="0.5"
                  style={{
                    animation: 'pulse 2s infinite',
                    pointerEvents: 'none'
                  }}
                />
              </>
            )}
            
            {/* クリック可能領域 */}
            <circle
              cx={pin.x - gate.x}
              cy={pin.y - gate.y}
              r={PIN_CONSTANTS.HIT_RADIUS}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => {
                handlePinHover(gate.id, index, false, true);
                hoveredPinRef.current = { gateId: gate.id, pinType: 'input', pinIndex: index };
                console.log('[DEBUG] Pin hover enter:', gate.id, 'input', index);
              }}
              onMouseLeave={() => {
                handlePinHover(gate.id, index, false, false);
                hoveredPinRef.current = null;
                console.log('[DEBUG] Pin hover leave');
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('[DEBUG] Pin mouseDown:', gate.id, 'input', index);
                console.log('[DEBUG] Wire start coordinates:', { pinX: pin.x, pinY: pin.y, gateX: gate.x, gateY: gate.y });
                handlePinClick(gate.id, index, false);
                // pin.x, pin.yが絶対座標か相対座標かを確認するため、まずそのまま使用
                startWireConnection(gate.id, index, false, pin.x, pin.y);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                console.log('[DEBUG] Pin mouseUp on target pin:', gate.id, 'input', index);
                if (drawingWire) {
                  completeWireConnection(gate.id, index, false);
                }
              }}
            />
            
            {/* ピン本体 */}
            <circle
              cx={pin.x - gate.x}
              cy={pin.y - gate.y}
              r={isHovered ? PIN_CONSTANTS.VISUAL_RADIUS * PIN_CONSTANTS.HOVER_SCALE : PIN_CONSTANTS.VISUAL_RADIUS}
              fill={pinValue ? PIN_CONSTANTS.COLORS.INPUT.ACTIVE : 
                    isHovered ? PIN_CONSTANTS.COLORS.INPUT.HOVER : 
                    PIN_CONSTANTS.COLORS.INPUT.DEFAULT}
              stroke={PIN_CONSTANTS.COLORS.INPUT.STROKE}
              strokeWidth={PIN_CONSTANTS.STROKE_WIDTH}
              style={{
                transition: `all ${PIN_CONSTANTS.TRANSITION_DURATION} ease`,
                filter: pinValue ? 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))' : 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* 接続時の中心点 */}
            {isPinConnected && (
              <circle
                cx={pin.x - gate.x}
                cy={pin.y - gate.y}
                r="2"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </g>
        );
      });
    }
    
    // 出力ピン
    if (gate.outputs && gate.outputs.length > 0) {
      gate.outputs.forEach((pin, index) => {
        const isHovered = isPinHovered(gate.id, index, true);
        const isPinConnected = pin.isConnected;
        const pinValue = isActive;
        
        pins.push(
          <g key={`output-${index}`}>
            {/* ホバー時のグロー効果 */}
            {isHovered && (
              <>
                <circle
                  cx={pin.x - gate.x}
                  cy={pin.y - gate.y}
                  r={PIN_CONSTANTS.HIT_RADIUS}
                  fill={PIN_CONSTANTS.COLORS.OUTPUT.GLOW}
                  opacity="0.3"
                  style={{
                    animation: 'pulse 2s infinite',
                    pointerEvents: 'none'
                  }}
                />
                <circle
                  cx={pin.x - gate.x}
                  cy={pin.y - gate.y}
                  r={PIN_CONSTANTS.VISUAL_RADIUS * 2}
                  fill="none"
                  stroke={PIN_CONSTANTS.COLORS.OUTPUT.ACTIVE}
                  strokeWidth="1"
                  opacity="0.5"
                  style={{
                    animation: 'pulse 2s infinite',
                    pointerEvents: 'none'
                  }}
                />
              </>
            )}
            
            {/* クリック可能領域 */}
            <circle
              cx={pin.x - gate.x}
              cy={pin.y - gate.y}
              r={PIN_CONSTANTS.HIT_RADIUS}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => {
                handlePinHover(gate.id, index, true, true);
                hoveredPinRef.current = { gateId: gate.id, pinType: 'output', pinIndex: index };
                console.log('[DEBUG] Pin hover enter:', gate.id, 'output', index);
              }}
              onMouseLeave={() => {
                handlePinHover(gate.id, index, true, false);
                hoveredPinRef.current = null;
                console.log('[DEBUG] Pin hover leave');
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                console.log('[DEBUG] Pin mouseDown:', gate.id, 'output', index);
                console.log('[DEBUG] Wire start coordinates:', { pinX: pin.x, pinY: pin.y, gateX: gate.x, gateY: gate.y });
                handlePinClick(gate.id, index, true);
                // pin.x, pin.yが絶対座標か相対座標かを確認するため、まずそのまま使用
                startWireConnection(gate.id, index, true, pin.x, pin.y);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                console.log('[DEBUG] Pin mouseUp on target pin:', gate.id, 'output', index);
                if (drawingWire) {
                  completeWireConnection(gate.id, index, true);
                }
              }}
            />
            
            {/* ピン本体 */}
            <circle
              cx={pin.x - gate.x}
              cy={pin.y - gate.y}
              r={isHovered ? PIN_CONSTANTS.VISUAL_RADIUS * PIN_CONSTANTS.HOVER_SCALE : PIN_CONSTANTS.VISUAL_RADIUS}
              fill={pinValue ? PIN_CONSTANTS.COLORS.OUTPUT.ACTIVE : 
                    isHovered ? PIN_CONSTANTS.COLORS.OUTPUT.HOVER : 
                    PIN_CONSTANTS.COLORS.OUTPUT.DEFAULT}
              stroke={PIN_CONSTANTS.COLORS.OUTPUT.STROKE}
              strokeWidth={PIN_CONSTANTS.STROKE_WIDTH}
              style={{
                transition: `all ${PIN_CONSTANTS.TRANSITION_DURATION} ease`,
                filter: pinValue ? 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))' : 'none',
                pointerEvents: 'none'
              }}
            />
            
            {/* 接続時の中心点 */}
            {isPinConnected && (
              <circle
                cx={pin.x - gate.x}
                cy={pin.y - gate.y}
                r="2"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </g>
        );
      });
    }
    
    return <>{pins}</>;
  };

  // キャンバスコンポーネント
  const canvasComponent = (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{
        backgroundColor: theme.colors.background,
        cursor: selectedTool ? 'crosshair' : 'default'
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* グリッド（改善版） */}
      <defs>
        <pattern id="grid" width={GRID_CONSTANTS.SIZE} height={GRID_CONSTANTS.SIZE} patternUnits="userSpaceOnUse">
          <circle 
            cx={GRID_CONSTANTS.SIZE / 2} 
            cy={GRID_CONSTANTS.SIZE / 2} 
            r={GRID_CONSTANTS.DOT_RADIUS} 
            fill={selectedTheme === 'minimal' ? GRID_CONSTANTS.COLORS.LIGHT.DOT : GRID_CONSTANTS.COLORS.DARK.DOT}
            opacity="0.6"
          />
          <rect 
            x="0" 
            y="0" 
            width={GRID_CONSTANTS.SIZE} 
            height={GRID_CONSTANTS.SIZE} 
            fill="none" 
            stroke={selectedTheme === 'minimal' ? GRID_CONSTANTS.COLORS.LIGHT.LINE : GRID_CONSTANTS.COLORS.DARK.LINE}
            strokeWidth={GRID_CONSTANTS.LINE_WIDTH}
            opacity="0.2"
          />
        </pattern>
        
        {/* アニメーション定義 */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.1); }
              100% { opacity: 0.3; transform: scale(1); }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.8); }
              to { opacity: 1; transform: scale(1); }
            }
            
            .gate-enter {
              animation: fadeIn ${GATE_PLACEMENT.ANIMATION_DURATION} ${GATE_PLACEMENT.ANIMATION_EASING};
            }
          `}
        </style>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* ワイヤー */}
      {connections.map(renderWire)}
      
      {/* 描画中のワイヤー */}
      {drawingWire && (
        <line
          x1={drawingWire.startX}
          y1={drawingWire.startY}
          x2={drawingWire.endX}
          y2={drawingWire.endY}
          stroke={theme.colors.ui.accent}
          strokeWidth="2"
          strokeDasharray="5,5"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
      
      {/* ゲート */}
      {gates.map(renderGate)}
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