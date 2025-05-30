import React, { useState, useCallback, useRef, useEffect } from 'react';
// ViewModelのインポート
import { UltraModernCircuitViewModel } from '../viewmodels/UltraModernCircuitViewModel';
import { useDiscovery } from '../hooks/useDiscovery';
import { DiscoveryModeSelector } from './UI/DiscoveryModeSelector';
import { DiscoveryNotification } from './UI/DiscoveryNotification';
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
// import { ModeSelector } from './UI/ModeSelector'; // 旧モードセレクター

// Import all required components
import TutorialSystemV2 from './TutorialSystemV2';
// import ChallengeSystem from './ChallengeSystem';
// import ExtendedChallengeSystem from './ExtendedChallengeSystem';
import ProgressTracker from './ProgressTracker';
import SaveLoadPanel from './SaveLoadPanel';
import GateDefinitionDialog from './GateDefinitionDialog';
import CustomGateDetail from './CustomGateDetail';
import { ClockControl } from './ClockControl';
import { LearningModeManager } from './Education/LearningModeManager';
import { FreeModeGuide } from './Education/FreeModeGuide';
import { PuzzleModeManager } from './Education/PuzzleModeManager';

// UI定数
import { PIN_CONSTANTS } from '../constants/ui';

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

const UltraModernCircuitWithViewModel: React.FC = () => {
  // ViewModelの初期化
  const [viewModel] = useState(() => new UltraModernCircuitViewModel());
  
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
    progress: discoveryProgress, 
    checkDiscoveries, 
    incrementExperiments,
    discoveries,
    milestones 
  } = useDiscovery();
  
  const {
    showDiscoveryNotification,
    showDiscoveryTutorial,
    setShowDiscoveryNotification,
    setShowDiscoveryTutorial
  } = useDiscoverySystem();
  
  // 教育機能（レガシー、新しいcurrentModeシステムに移行中）
  const {
    userMode,
    setUserMode,
    showTutorial,
    setShowTutorial,
    // showChallenge,
    // setShowChallenge,
    // showExtendedChallenge,
    // setShowExtendedChallenge,
    showProgress,
    setShowProgress,
    badges,
    setBadges,
    progress,
    setProgress,
    preferences,
    setPreferences
  } = useEducationalFeatures();
  // console.log('[DEBUG] UltraModernCircuitWithViewModel - userMode:', userMode);
  
  // パネル表示
  const {
    showHelp,
    showSaveLoad,
    showGateDefinition,
    showCustomGatePanel,
    showNotebook,
    selectedCustomGateDetail,
    toggleHelp,
    toggleSaveLoad,
    toggleGateDefinition,
    toggleCustomGatePanel,
    toggleNotebook,
    setSelectedCustomGateDetail
  } = usePanelVisibility();
  
  // カスタムゲート
  const {
    customGates,
    setCustomGates,
    addCustomGate,
    removeCustomGate,
    updateCustomGate,
    simulateCustomGate
  } = useCustomGates();
  
  // デバッグモード（環境変数またはURLパラメータで有効化）
  const [debugMode] = useState(() => {
    const envDebug = process.env.NODE_ENV === 'development';
    const urlDebug = new URLSearchParams(window.location.search).has('debug');
    return envDebug || urlDebug;
  });
  
  // 設定からテーマを読み込み
  useEffect(() => {
    const settings = localStorage.getItem('logic-circuit-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.theme) {
        setSelectedTheme(parsed.theme);
      }
    }
  }, []);
  
  // ViewModelからのデータ（リアクティブ）
  const [gates, setGates] = useState<UltraModernGate[]>([]);
  const [connections, setConnections] = useState<UltraModernConnection[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResults>({});
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const nextGateId = useRef(1);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // ViewModelのイベントを購読
  useViewModelSubscription({
    viewModel,
    onGatesChanged: setGates,
    onConnectionsChanged: setConnections,
    onSimulationResultsChanged: (results) => {
      const resultMap: SimulationResults = {};
      results.forEach((value, key) => {
        resultMap[key] = value;
      });
      setSimulationResults(resultMap);
      
      // 発見チェック（learningモードのときのみ）
      if (currentMode === 'learning') {
        const circuit = viewModel.toJSON();
        const newDiscoveries = checkDiscoveries(circuit);
        if (newDiscoveries && newDiscoveries.length > 0) {
          setShowDiscoveryNotification(true);
        }
      }
    },
    onSaveCircuit: (circuit) => {
      // セーブ処理
      // console.log('Circuit saved:', circuit);
    },
    onNotification: (message, type) => {
      // 通知処理
      // console.log('Notification:', message, type);
    }
  });

  // モダンデザインシステム（変更なし）
  const themes: Record<string, Theme> = {
    modern: {
      name: 'モダン',
      colors: {
        background: '#0a0e27',
        canvas: '#0f1441',
        grid: 'rgba(255, 255, 255, 0.05)',
        
        gate: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.2)',
          text: '#ffffff',
          activeBg: 'rgba(0, 255, 136, 0.2)',
          activeBorder: '#00ff88',
          activeText: '#00ff88',
        },
        
        signal: {
          off: 'rgba(255, 255, 255, 0.3)',
          on: '#00ff88',
          flow: '#00ffff',
        },
        
        ui: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          accent: '#00ff88',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.1)',
          buttonBg: 'rgba(255, 255, 255, 0.05)',
          buttonHover: 'rgba(255, 255, 255, 0.1)',
          buttonActive: 'rgba(0, 255, 136, 0.2)',
        }
      }
    },
    neon: {
      name: 'ネオン',
      colors: {
        background: '#000000',
        canvas: '#0a0a0a',
        grid: 'rgba(255, 0, 255, 0.05)',
        
        gate: {
          bg: 'rgba(0, 0, 0, 0.8)',
          border: '#ff00ff',
          text: '#00ffff',
          activeBg: 'rgba(255, 255, 0, 0.2)',
          activeBorder: '#ffff00',
          activeText: '#ffff00',
        },
        
        signal: {
          off: '#ff00ff',
          on: '#00ff00',
          flow: '#ffff00',
        },
        
        ui: {
          primary: '#00ffff',
          secondary: '#ff00ff',
          accent: '#ffff00',
          border: '#ff00ff',
          hover: 'rgba(255, 0, 255, 0.2)',
          buttonBg: 'rgba(255, 0, 255, 0.1)',
          buttonHover: 'rgba(255, 0, 255, 0.2)',
          buttonActive: 'rgba(255, 255, 0, 0.3)',
        }
      }
    },
    minimal: {
      name: 'ミニマル',
      colors: {
        background: '#ffffff',
        canvas: '#fafafa',
        grid: 'rgba(0, 0, 0, 0.05)',
        
        gate: {
          bg: '#ffffff',
          border: '#e0e0e0',
          text: '#333333',
          activeBg: '#e3f2fd',
          activeBorder: '#2196f3',
          activeText: '#2196f3',
        },
        
        signal: {
          off: '#e0e0e0',
          on: '#2196f3',
          flow: '#2196f3',
        },
        
        ui: {
          primary: '#333333',
          secondary: '#666666',
          accent: '#2196f3',
          border: '#e0e0e0',
          hover: '#f5f5f5',
          buttonBg: '#ffffff',
          buttonHover: '#f5f5f5',
          buttonActive: '#e3f2fd',
        }
      }
    }
  };

  const theme = themes[selectedTheme];
  const GATE_SIZE = 50;
  
  // 元のゲートタイプ定義（変更なし）
  const gateTypes: Record<string, GateType> = {
    INPUT: { 
      name: '入力',
      icon: (isActive) => (
        <g>
          <circle cx={0} cy={0} r={GATE_SIZE/2} 
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <circle cx={0} cy={0} r={GATE_SIZE/3}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          />
        </g>
      )
    },
    OUTPUT: {
      name: '出力',
      icon: (isActive) => (
        <g>
          <circle cx={0} cy={0} r={GATE_SIZE/2} 
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <rect x={-GATE_SIZE/4} y={-GATE_SIZE/4} width={GATE_SIZE/2} height={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            rx="2"
          />
        </g>
      )
    },
    AND: {
      name: 'AND',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <circle cx={-10} cy={0} r={5}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="1.5"
            opacity="0.8"
          />
          <circle cx={10} cy={0} r={5}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="1.5"
            opacity="0.8"
          />
          <circle cx={0} cy={0} r={12}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="2"
          />
        </g>
      )
    },
    OR: {
      name: 'OR',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <circle cx={-10} cy={0} r={7}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            opacity="0.3"
          />
          <circle cx={10} cy={0} r={7}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            opacity="0.3"
          />
          <circle cx={0} cy={0} r={15}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="2"
          />
        </g>
      )
    },
    NOT: {
      name: 'NOT',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <circle cx={-8} cy={0} r={8}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="2"
          />
          <circle cx={8} cy={0} r={4}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          />
        </g>
      )
    },
    XOR: {
      name: 'XOR',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <path d="M -15 -15 L 15 15 M -15 15 L 15 -15"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )
    },
    NAND: {
      name: 'NAND',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <g transform="scale(1)">
            <circle cx={-3} cy={0} r={5}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
            <circle cx={3} cy={0} r={5}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
            <circle cx={12} cy={0} r={3}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="2"
            />
          </g>
        </g>
      )
    },
    NOR: {
      name: 'NOR',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <g transform="scale(0.9)">
            <circle cx={-4} cy={0} r={5}
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              opacity="0.3"
            />
            <circle cx={4} cy={0} r={5}
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              opacity="0.3"
            />
            <circle cx={0} cy={0} r={9}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
            <circle cx={13} cy={0} r={3}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="2"
            />
          </g>
        </g>
      )
    },
    XNOR: {
      name: 'XNOR',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <g transform="scale(1.1)">
            <g fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}>
              <rect x={-6} y={-4} width={12} height={1.5} />
              <rect x={-6} y={-0.75} width={12} height={1.5} />
              <rect x={-6} y={2.5} width={12} height={1.5} />
            </g>
            <circle cx={10} cy={0} r={2.5}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
            />
          </g>
        </g>
      )
    },
    NUMBER_4BIT_INPUT: {
      name: '4bit入力',
      icon: (isActive, value = 0) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-5} textAnchor="middle" 
            fontSize="18" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            {value || 0}
          </text>
          <text x={0} y={10} textAnchor="middle" 
            fontSize="8"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            4BIT IN
          </text>
        </g>
      ),
      outputs: 4
    },
    NUMBER_4BIT_DISPLAY: {
      name: '4bit表示',
      icon: (isActive, value = 0) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-5} textAnchor="middle" 
            fontSize="18" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            {value || 0}
          </text>
          <text x={0} y={10} textAnchor="middle" 
            fontSize="8"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            DISPLAY
          </text>
        </g>
      ),
      inputs: 4
    },
    ADDER_4BIT: {
      name: '4bit加算',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-8} textAnchor="middle" 
            fontSize="9" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            ADD
          </text>
          <text x={0} y={4} textAnchor="middle" 
            fontSize="9" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            4BIT
          </text>
          <text x={0} y={14} textAnchor="middle" 
            fontSize="14" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            +
          </text>
        </g>
      ),
      inputs: 9,  // A0-A3, B0-B3, Cin
      outputs: 5  // S0-S3, Cout
    },
    CLOCK: {
      name: 'クロック',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <g transform="scale(0.8)">
            {/* クロックの文字盤 */}
            <circle cx={0} cy={0} r={15}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="2"
            />
            {/* 針 */}
            <line x1={0} y1={0} x2={0} y2={-10}
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1={0} y1={0} x2={7} y2={0}
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* 中心の点 */}
            <circle cx={0} cy={0} r={2}
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            />
          </g>
        </g>
      )
    },
    D_FLIP_FLOP: {
      name: 'D-FF',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-8} textAnchor="middle" 
            fontSize="10" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            D
          </text>
          <text x={0} y={4} textAnchor="middle" 
            fontSize="10" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            FF
          </text>
          {/* CLK入力の三角形 */}
          <path d={`M ${-GATE_SIZE/2} ${GATE_SIZE/2 - 10} l 5 5 l -5 5`}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="1.5"
          />
        </g>
      ),
      inputs: 2,  // D, CLK
      outputs: 2  // Q, Q'
    },
    SR_LATCH: {
      name: 'SR-L',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-8} textAnchor="middle" 
            fontSize="10" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            SR
          </text>
          <text x={0} y={4} textAnchor="middle" 
            fontSize="8" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            LATCH
          </text>
          {/* S/Rラベル */}
          <text x={-GATE_SIZE/2 - 4} y={-8} textAnchor="end" 
            fontSize="7"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            S
          </text>
          <text x={-GATE_SIZE/2 - 4} y={8} textAnchor="end" 
            fontSize="7"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            R
          </text>
        </g>
      ),
      inputs: 2,  // S, R
      outputs: 2  // Q, Q'
    },
    REGISTER_4BIT: {
      name: 'REG4',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-8} textAnchor="middle" 
            fontSize="9" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            REG
          </text>
          <text x={0} y={4} textAnchor="middle" 
            fontSize="9" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            4BIT
          </text>
          {/* CLK入力の三角形 */}
          <path d={`M ${-GATE_SIZE/2} ${GATE_SIZE/2 - 10} l 5 5 l -5 5`}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="1.5"
          />
        </g>
      ),
      inputs: 6,  // D0-D3, CLK, RST
      outputs: 4  // Q0-Q3
    },
    MUX_2TO1: {
      name: 'MUX',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={4}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={-8} textAnchor="middle" 
            fontSize="9" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            MUX
          </text>
          <text x={0} y={4} textAnchor="middle" 
            fontSize="8" fontWeight="bold"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            2:1
          </text>
          {/* A/B/SELラベル */}
          <text x={-GATE_SIZE/2 - 4} y={-12} textAnchor="end" 
            fontSize="7"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            A
          </text>
          <text x={-GATE_SIZE/2 - 4} y={0} textAnchor="end" 
            fontSize="7"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            B
          </text>
          <text x={-GATE_SIZE/2 - 4} y={12} textAnchor="end" 
            fontSize="7"
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
          >
            S
          </text>
        </g>
      ),
      inputs: 3,  // A, B, SEL
      outputs: 1  // Y
    }
  };
  
  // カスタムゲートをgateTypesに追加
  const allGateTypes: Record<string, GateType> = {
    ...gateTypes,
    ...Object.entries(customGates).reduce((acc, [name, gateDef]) => {
      acc[name] = {
        name: name,
        icon: (isActive) => (
          <g>
            <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={8}
              fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
              stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
              strokeWidth="2"
            />
            <text x={0} y={5} textAnchor="middle" 
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              fontSize="10" fontWeight="600">
              {name.slice(0, 4).toUpperCase()}
            </text>
          </g>
        ),
        inputs: gateDef.inputs.length,
        outputs: gateDef.outputs.length,
        circuit: gateDef.circuit,
        isCustom: true
      };
      return acc;
    }, {} as Record<string, GateType>)
  };

  // ゲート追加（ViewModelを使用）
  const addGate = useCallback((type: string) => {
    // console.log('addGate called with type:', type);
    const centerX = svgRef.current ? svgRef.current.clientWidth / 2 : 400;
    const centerY = svgRef.current ? (svgRef.current.clientHeight - 60) / 2 : 300;
    
    let x = centerX;
    let y = centerY;
    let offset = 0;
    
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
    viewModel.addGate(type, { x, y });
    
    // 進捗を更新
    setProgress((prev) => ({ ...prev, gatesPlaced: (prev.gatesPlaced || 0) + 1 }));
    
    // 実験カウントを増やす
    incrementExperiments();
    
    // 最初のゲート配置バッジ
    if ((progress as any).gatesPlaced === 0 && !(badges as any[]).includes('first-gate')) {
      setBadges([...(badges as any[]), { id: 'first-gate', name: '最初のゲート', description: '最初のゲートを配置しました', icon: '🎯' } as any]);
    }
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: `${type}_PLACED` } 
      }));
    }
  }, [gates, progress, badges, showTutorial, viewModel]);

  // ゲート削除（ViewModelを使用）
  const deleteGate = useCallback((gateId: string) => {
    viewModel.removeGate(gateId);
  }, [viewModel]);

  // 入力値切り替え（ViewModelを使用）
  const toggleInput = useCallback((gateId: string) => {
    console.log('[DEBUG] toggleInput called with gateId:', gateId);
    const beforeState = simulationResults[gateId];
    viewModel.toggleInput(gateId);
    console.log('[DEBUG] State before:', beforeState, 'State after:', simulationResults[gateId]);
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: 'INPUT_TOGGLED' } 
      }));
    }
  }, [viewModel, showTutorial, simulationResults]);

  // イベントハンドラー
  const handleGateMouseDown = useCallback((e: React.MouseEvent, gate: UltraModernGate) => {
    e.stopPropagation();
    const rect = svgRef.current!.getBoundingClientRect();
    dragStartPos.current = { x: gate.x, y: gate.y };
    hasDraggedRef.current = false;
    startDragging(gate.id, {
      x: e.clientX - rect.left - gate.x,
      y: e.clientY - rect.top - gate.y
    });
  }, [startDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedGate && dragOffset && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
      // ドラッグ開始位置から一定以上移動したらドラッグとみなす
      if (dragStartPos.current) {
        const distance = Math.sqrt(
          Math.pow(newX - dragStartPos.current.x, 2) + 
          Math.pow(newY - dragStartPos.current.y, 2)
        );
        if (distance > 5) {
          hasDraggedRef.current = true;
        }
      }
      
      // 直接ViewModelを更新（stateの更新は不要）
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
    // ドラッグフラグをリセット（少し遅延させる）
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  }, [drawingWire, stopDragging, cancelWireConnection]);

  // ワイヤー接続関数はカスタムフックから取得済み

  // 汎用的な接続開始関数
  const startConnection = useCallback((gateId: string, pinType: 'input' | 'output', pinIndex: number, x: number, y: number) => {
    startWireConnection(gateId, pinIndex, pinType === 'output', x, y);
  }, [startWireConnection]);

  // 汎用的な接続完了関数
  const completeConnection = useCallback((gateId: string, pinType: 'input' | 'output', pinIndex: number) => {
    completeWireConnection(gateId, pinIndex, pinType === 'output');
    
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: 'WIRE_CONNECTED' } 
      }));
    }
  }, [completeWireConnection, showTutorial]);

  // カスタムゲート関連の関数はフックから取得済み

  // 初期化処理
  useEffect(() => {
    // カスタムゲートのマイグレーション
    migrateAllCustomGates();
    
    // ユーザー設定を読み込み
    const prefs = getUserPreferences();
    setPreferences(prefs);
    
    // チュートリアル状態を読み込み
    const tutorialState = getTutorialState();
    if (tutorialState) {
      // setBadges(tutorialState.badges || []);
      // setProgress(tutorialState.progress || progress);
    }
    
    // カスタムゲートを読み込み
    const gates = getCustomGates();
    setCustomGates(gates);
    Object.entries(gates).forEach(([name, def]) => {
      viewModel.registerCustomGate(name, def);
    });
    
    // URLからの回路読み込み
    const urlCircuit = decodeCircuitFromURL();
    if (urlCircuit) {
      viewModel.loadCircuit(urlCircuit);
    }
    
    // 自由モードで初回アクセスの場合、発見チュートリアルを表示
    // 学習モードでは表示しない（LearningModeManagerが独自のチュートリアルを持っているため）
    if (currentMode === 'free' && !localStorage.getItem('logic-circuit-tutorial-completed')) {
      setShowDiscoveryTutorial(true);
    }
    
    // 初期データを取得するために、ViewModelに初期化完了を通知
    // ViewModelが内部でイベントを発火する
  }, []);

  // ゲート描画
  const renderGate = (gate: UltraModernGate) => {
    const gateType = allGateTypes[gate.type];
    if (!gateType) return null;
    
    const isActive = simulationResults[gate.id] || false;
    const isDragging = draggedGate === gate.id;
    
    // CLOCKゲートの場合は動作状態も確認
    let clockState: { isRunning: boolean; interval: number } | null = null;
    if (gate.type === 'CLOCK') {
      clockState = viewModel.getClockState(gate.id);
    }
    
    return (
      <g key={gate.id} data-testid={`gate-${gate.id}`} transform={`translate(${gate.x}, ${gate.y})`}>
        {/* ホバーエフェクト */}
        {hoveredGate === gate.id && selectedTheme !== 'minimal' && (
          <>
            <circle cx={0} cy={0} r={GATE_SIZE/2 + 10}
              fill="none"
              stroke={theme.colors.ui.accent}
              strokeWidth="1"
              opacity="0.3"
              className="hover-effect"
              style={{
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
            {/* カスタムゲートの場合はヒントを表示 */}
            {gateType.isCustom && (
              <g>
                <rect x={-60} y={-GATE_SIZE - 25} width={120} height={20} rx={10}
                  fill={theme.colors.ui.buttonBg}
                  stroke={theme.colors.ui.border}
                  strokeWidth="1"
                />
                <text x={0} y={-GATE_SIZE - 12} textAnchor="middle" 
                  fill={theme.colors.ui.primary}
                  fontSize="10"
                  fontWeight="500"
                >
                  ダブルクリックで詳細
                </text>
              </g>
            )}
          </>
        )}
        
        {/* ゲート本体 */}
        <g style={{
            opacity: isDragging ? 0.7 : 1,
            cursor: 'move',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setHoveredGate(gate.id)}
          onMouseLeave={() => setHoveredGate(null)}
          onMouseDown={(e) => handleGateMouseDown(e, gate)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (gate.type === 'CLOCK') {
              // CLOCKゲートの場合はメニューを表示
              const clockState = viewModel.getClockState(gate.id);
              if (clockState) {
                const action = confirm(
                  `クロックゲート制御\n\n` +
                  `現在の状態: ${clockState.isRunning ? '動作中' : '停止中'}\n` +
                  `間隔: ${clockState.interval}ms\n\n` +
                  `OK: ${clockState.isRunning ? '停止' : '開始'}\n` +
                  `キャンセル: ゲートを削除`
                );
                if (action) {
                  if (clockState.isRunning) {
                    viewModel.stopClock(gate.id);
                  } else {
                    viewModel.startClock(gate.id);
                  }
                } else {
                  if (confirm('このクロックゲートを削除しますか？')) {
                    deleteGate(gate.id);
                  }
                }
              }
            } else {
              deleteGate(gate.id);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('[DEBUG] Gate onClick:', {
              gateType: gate.type,
              hasDragged: hasDraggedRef.current,
              gateId: gate.id
            });
            // 実際にドラッグした場合はクリックを無視
            if (!hasDraggedRef.current) {
              if (gate.type === 'INPUT') {
                console.log('[DEBUG] Toggling INPUT gate:', gate.id);
                toggleInput(gate.id);
              } else if (gate.type === 'CLOCK') {
                // CLOCKゲートをクリックで開始/停止
                const clockState = viewModel.getClockState(gate.id);
                if (clockState) {
                  if (clockState.isRunning) {
                    viewModel.stopClock(gate.id);
                  } else {
                    viewModel.startClock(gate.id);
                  }
                }
              } else if (gate.type === 'NUMBER_4BIT_INPUT') {
                // NUMBER_4BIT_INPUTゲートをクリックで値を変更
                const currentValue = (gate as any).value || 0;
                const newValue = (currentValue + 1) % 16; // 0-15をループ
                // TODO: ViewModelに値を設定するメソッドが必要
                (gate as any).value = newValue;
                // 再描画をトリガー
                viewModel.simulate();
              }
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (gateType.isCustom) {
              setSelectedCustomGateDetail(gate.type);
            }
          }}
        >
          {(() => {
            // NUMBER_4BIT_INPUTの場合は値を渡す
            if (gate.type === 'NUMBER_4BIT_INPUT' || gate.type === 'NUMBER_4BIT_DISPLAY') {
              // TODO: ViewModelから値を取得する必要がある
              // 現在はデフォルト値を表示
              const value = (gate as any).value || 0;
              return gateType.icon(isActive as boolean);
            } else if (gate.type === 'CLOCK' && clockState) {
              return gateType.icon(isActive as boolean);
            } else {
              return gateType.icon(isActive as boolean);
            }
          })()}
        </g>
        
        {/* 接続端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {/* カスタムゲートの場合は複数入力ピンを表示 */}
            {(gateType.isCustom && gate.inputs) || gate.type === 'REGISTER_4BIT' || gate.type === 'MUX_2TO1' || gate.type === 'NUMBER_4BIT_DISPLAY' || gate.type === 'ADDER_4BIT' ? (
              (() => {
                let inputs;
                if (gate.type === 'REGISTER_4BIT') {
                  inputs = [
                    {name: 'D0'}, {name: 'D1'}, {name: 'D2'}, {name: 'D3'},
                    {name: 'CLK'}, {name: 'RST'}
                  ];
                } else if (gate.type === 'MUX_2TO1') {
                  inputs = [{name: 'A'}, {name: 'B'}, {name: 'SEL'}];
                } else if (gate.type === 'NUMBER_4BIT_DISPLAY') {
                  inputs = [{name: 'D0'}, {name: 'D1'}, {name: 'D2'}, {name: 'D3'}];
                } else if (gate.type === 'ADDER_4BIT') {
                  inputs = [
                    {name: 'A0'}, {name: 'A1'}, {name: 'A2'}, {name: 'A3'},
                    {name: 'B0'}, {name: 'B1'}, {name: 'B2'}, {name: 'B3'},
                    {name: 'Cin'}
                  ];
                } else {
                  inputs = gate.inputs;
                }
                return inputs.map((input, index) => {
                const inputCount = inputs.length;
                const spacing = Math.min(20, (GATE_SIZE - 10) / (inputCount + 1));
                const yOffset = -GATE_SIZE/2 + spacing * (index + 1);
                
                return (
                  <g key={`input-${index}`}>
                    {/* 見えない大きな当たり判定エリア */}
                    <circle 
                      cx={-GATE_SIZE/2 - 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="12"
                      fill="transparent"
                      stroke="none"
                      style={{ cursor: 'crosshair' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startConnection(
                          gate.id,
                          'input',
                          index,
                          gate.x - GATE_SIZE/2 - 8,
                          gate.y + yOffset + GATE_SIZE/2 - GATE_SIZE/2
                        );
                      }}
                    />
                    {/* 表示用のピン */}
                    <circle 
                      cx={-GATE_SIZE/2 - 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="4"
                      fill={theme.colors.signal.off} 
                      stroke="none"
                      style={{ pointerEvents: 'none' }}
                      data-terminal="input"
                    />
                    {/* ピン名を表示 */}
                    <text 
                      x={-GATE_SIZE/2 - 20} 
                      y={yOffset + GATE_SIZE/2 - GATE_SIZE/2 + 3}
                      textAnchor="end"
                      fill={theme.colors.ui.secondary}
                      fontSize="8"
                      style={{ pointerEvents: 'none' }}
                    >
                      {input.name}
                    </text>
                  </g>
                );
              });
              })()
            ) : (
              // 標準ゲートの場合は従来通り
              (gate.type === 'AND' || gate.type === 'OR' || gate.type === 'NAND' || gate.type === 'NOR' || gate.type === 'XNOR' || gate.type === 'D_FLIP_FLOP' || gate.type === 'SR_LATCH') ? (
                <>
                  {/* 入力ピン1 */}
                  <circle
                    cx={-GATE_SIZE/2 - 8}
                    cy={-10}
                    r="4"
                    fill={theme.colors.signal.off}
                    stroke="white"
                    strokeWidth="1"
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startConnection(gate.id, 'input', 0, gate.x - GATE_SIZE/2 - 8, gate.y - 10);
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      completeConnection(gate.id, 'input', 0);
                    }}
                  />
                  
                  {/* 入力ピン2 */}
                  <circle
                    cx={-GATE_SIZE/2 - 8}
                    cy={10}
                    r="4"
                    fill={theme.colors.signal.off}
                    stroke="white"
                    strokeWidth="1"
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startConnection(gate.id, 'input', 1, gate.x - GATE_SIZE/2 - 8, gate.y + 10);
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      completeConnection(gate.id, 'input', 1);
                    }}
                  />
                </>
              ) : (
                <circle
                  cx={-GATE_SIZE/2 - 8}
                  cy={0}
                  r="4"
                  fill={theme.colors.signal.off}
                  stroke="white"
                  strokeWidth="1"
                  style={{ cursor: 'crosshair' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startConnection(gate.id, 'input', 0, gate.x - GATE_SIZE/2 - 8, gate.y);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    completeConnection(gate.id, 'input', 0);
                  }}
                />
              )
            )}
          </>
        )}
        
        {/* 出力ピン */}
        {gate.type !== 'OUTPUT' && (
          <>
            {/* カスタムゲートの場合は複数出力ピンを表示 */}
            {(gateType.isCustom && gate.outputs) || gate.type === 'D_FLIP_FLOP' || gate.type === 'SR_LATCH' || gate.type === 'REGISTER_4BIT' || gate.type === 'NUMBER_4BIT_INPUT' || gate.type === 'ADDER_4BIT' ? (
              (() => {
                let outputs;
                if (gate.type === 'D_FLIP_FLOP' || gate.type === 'SR_LATCH') {
                  outputs = [{name: 'Q'}, {name: 'Q\''}];
                } else if (gate.type === 'REGISTER_4BIT') {
                  outputs = [{name: 'Q0'}, {name: 'Q1'}, {name: 'Q2'}, {name: 'Q3'}];
                } else if (gate.type === 'NUMBER_4BIT_INPUT') {
                  outputs = [{name: 'D0'}, {name: 'D1'}, {name: 'D2'}, {name: 'D3'}];
                } else if (gate.type === 'ADDER_4BIT') {
                  outputs = [{name: 'S0'}, {name: 'S1'}, {name: 'S2'}, {name: 'S3'}, {name: 'Cout'}];
                } else {
                  outputs = gate.outputs;
                }
                return outputs.map((output, index) => {
                const outputCount = outputs.length;
                const spacing = Math.min(20, (GATE_SIZE - 10) / (outputCount + 1));
                const yOffset = -GATE_SIZE/2 + spacing * (index + 1);
                
                return (
                  <g key={`output-${index}`}>
                    {/* 見えない大きな当たり判定エリア */}
                    <circle 
                      cx={GATE_SIZE/2 + 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="12"
                      fill="transparent" 
                      stroke="none"
                      style={{ cursor: 'crosshair' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startConnection(
                          gate.id,
                          'output',
                          index,
                          gate.x + GATE_SIZE/2 + 8, 
                          gate.y + yOffset + GATE_SIZE/2 - GATE_SIZE/2
                        );
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        completeConnection(gate.id, 'output', index);
                      }} 
                    />
                    {/* 表示用のピン */}
                    <circle 
                      cx={GATE_SIZE/2 + 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="4"
                      fill={theme.colors.signal.off} 
                      stroke="none"
                      style={{ pointerEvents: 'none' }}
                      data-terminal="output"
                    />
                    {/* ピン名を表示 */}
                    <text 
                      x={GATE_SIZE/2 + 20} 
                      y={yOffset + GATE_SIZE/2 - GATE_SIZE/2 + 3}
                      textAnchor="start"
                      fill={theme.colors.ui.secondary}
                      fontSize="8"
                      style={{ pointerEvents: 'none' }}
                    >
                      {output.name}
                    </text>
                  </g>
                );
              });
              })()
            ) : (
              // 標準ゲートの場合は従来通り
              <circle
                cx={GATE_SIZE/2 + 8}
                cy={0}
                r="4"
                fill={theme.colors.signal.off}
                stroke="white"
                strokeWidth="1"
                style={{ cursor: 'crosshair' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startConnection(gate.id, 'output', 0, gate.x + GATE_SIZE/2 + 8, gate.y);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  completeConnection(gate.id, 'output', 0);
                }}
              />
            )}
          </>
        )}
      </g>
    );
  };

  // ワイヤー描画
  const renderWire = (connection: UltraModernConnection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    // 元のワイヤー描画ロジックをそのまま使用
    const fromGateType = allGateTypes[fromGate.type];
    const toGateType = allGateTypes[toGate.type];
    
    let startX = fromGate.x + GATE_SIZE/2 + 8;
    let startY = fromGate.y;
    
    if (fromGateType?.isCustom && fromGate.outputs) {
      const outputIndex = connection.fromOutput || 0;
      const outputCount = fromGate.outputs.length;
      const spacing = Math.min(20, (GATE_SIZE - 10) / (outputCount + 1));
      const yOffset = -GATE_SIZE/2 + spacing * (outputIndex + 1);
      startY = fromGate.y + yOffset;
    }
    
    let endX = toGate.x - GATE_SIZE/2 - 8;
    let endY = toGate.y;
    
    if (toGateType?.isCustom && toGate.inputs) {
      const inputIndex = connection.toInput || 0;
      const inputCount = toGate.inputs.length;
      const spacing = Math.min(20, (GATE_SIZE - 10) / (inputCount + 1));
      const yOffset = -GATE_SIZE/2 + spacing * (inputIndex + 1);
      endY = toGate.y + yOffset;
    } else if (toGate.type === 'AND' || toGate.type === 'OR' || toGate.type === 'NAND' || toGate.type === 'NOR' || toGate.type === 'XNOR') {
      endY = connection.toInput === 0 ? toGate.y - 10 : toGate.y + 10;
    }
    
    let isActive = false;
    const fromResult = simulationResults[connection.from];
    if (Array.isArray(fromResult)) {
      isActive = fromResult[connection.fromOutput || 0] || false;
    } else {
      isActive = fromResult || false;
    }
    
    const midX = (startX + endX) / 2;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        {/* アクティブ時のグロー */}
        {isActive && selectedTheme !== 'minimal' && (
          <path
            className="wire"
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
          className="wire"
          d={path}
          fill="none"
          stroke={isActive ? theme.colors.signal.on : theme.colors.signal.off}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            viewModel.removeConnection(connection.id);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            viewModel.removeConnection(connection.id);
          }}
        />
        
        {/* 信号フローアニメーション */}
        {isActive && (
          <circle r="4" fill={theme.colors.signal.flow}>
            <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </g>
    );
  };

  const handleModeSelected = (mode: string) => {
    setUserMode(mode);
    if (mode === 'learning') {
      setShowTutorial(true);
    }
  };

  const handleLoadCircuit = (circuitData: any) => {
    viewModel.loadCircuit(circuitData);
  };

  // userModeは廃止し、新しいcurrentModeシステムを使用
  // if (!userMode) {
  //   return <ModeSelector onModeSelected={handleModeSelected} />;
  // }

  // 元のレンダリング構造をそのまま保持
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: theme.colors.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ヘッダー */}
      <header style={{
        height: '60px',
        background: selectedTheme === 'minimal' ? theme.colors.background : 'rgba(0, 0, 0, 0.3)',
        borderBottom: `1px solid ${theme.colors.ui.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: theme.colors.ui.primary,
          margin: 0,
        }}>
          論理回路プレイグラウンド
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* モード選択 */}
          <DiscoveryModeSelector
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
          
          {/* テーマ選択 */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value as 'modern' | 'neon' | 'minimal')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="modern">モダン</option>
            <option value="neon">ネオン</option>
            <option value="minimal">ミニマル</option>
          </select>
          
          <button
            onClick={toggleNotebook}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg}
          >
            📔 ノート
          </button>
          
          <button
            onClick={() => setShowProgress(!showProgress)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg}
          >
            進捗
          </button>
          
          {/* デバッグモード時のみレベル2ボタンを表示 */}
          {debugMode && (
            <button
              onClick={() => {
                // setShowChallenge(false);
                // setShowExtendedChallenge(!showExtendedChallenge);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.ui.border}`,
                background: false ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg,
                color: theme.colors.ui.primary,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = false ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg}
            >
              レベル2
            </button>
          )}
          
          <button
            onClick={toggleSaveLoad}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg}
          >
            保存/読込
          </button>
          
          {/* カスタムゲートパネル切り替えボタン */}
          {Object.keys(customGates).length > 0 && (
            <button
              onClick={toggleCustomGatePanel}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.ui.accent}`,
                background: showCustomGatePanel ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)',
                color: theme.colors.ui.accent,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = showCustomGatePanel ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 255, 136, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = showCustomGatePanel ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)';
              }}
            >
              🧩 カスタムゲート ({Object.keys(customGates).length})
            </button>
          )}
          
          {/* ゲート化ボタン（回路がある場合のみ表示） */}
          {gates.length > 0 && (
            <button
              onClick={toggleGateDefinition}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.ui.accent}`,
                background: 'rgba(0, 255, 136, 0.1)',
                color: theme.colors.ui.accent,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(0, 255, 136, 0.2)';
                (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(0, 255, 136, 0.1)';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              📦 ゲート化
            </button>
          )}
          
          <button
            onClick={toggleHelp}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg}
          >
            ヘルプ
          </button>
          
          <button
            onClick={() => {
              // 4ビット電卓デモを読み込む
              const demoCircuit = {
                gates: [
                  { id: 'num_a', type: 'NUMBER_4BIT_INPUT', x: 100, y: 150, value: 3 },
                  { id: 'num_b', type: 'NUMBER_4BIT_INPUT', x: 100, y: 350, value: 5 },
                  { id: 'adder', type: 'ADDER_4BIT', x: 350, y: 250 },
                  { id: 'result', type: 'NUMBER_4BIT_DISPLAY', x: 600, y: 200 },
                  { id: 'carry_out', type: 'OUTPUT', x: 600, y: 350 }
                ],
                connections: [
                  // A入力を加算器へ
                  { from: 'num_a', fromOutput: 0, to: 'adder', toInput: 0 },
                  { from: 'num_a', fromOutput: 1, to: 'adder', toInput: 1 },
                  { from: 'num_a', fromOutput: 2, to: 'adder', toInput: 2 },
                  { from: 'num_a', fromOutput: 3, to: 'adder', toInput: 3 },
                  // B入力を加算器へ  
                  { from: 'num_b', fromOutput: 0, to: 'adder', toInput: 4 },
                  { from: 'num_b', fromOutput: 1, to: 'adder', toInput: 5 },
                  { from: 'num_b', fromOutput: 2, to: 'adder', toInput: 6 },
                  { from: 'num_b', fromOutput: 3, to: 'adder', toInput: 7 },
                  // 加算結果を表示へ
                  { from: 'adder', fromOutput: 0, to: 'result', toInput: 0 },
                  { from: 'adder', fromOutput: 1, to: 'result', toInput: 1 },
                  { from: 'adder', fromOutput: 2, to: 'result', toInput: 2 },
                  { from: 'adder', fromOutput: 3, to: 'result', toInput: 3 },
                  // 桁上げ出力
                  { from: 'adder', fromOutput: 4, to: 'carry_out', toInput: 0 }
                ]
              };
              viewModel.loadCircuit(demoCircuit);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.accent}`,
              background: 'rgba(0, 255, 136, 0.1)',
              color: theme.colors.ui.accent,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(0, 255, 136, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(0, 255, 136, 0.1)';
            }}
          >
            🧮 電卓デモ
          </button>
          
          <button
            onClick={() => {
              viewModel.clear();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.secondary,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg}
          >
            クリア
          </button>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* モード別のサイドパネル */}
        {(currentMode === 'learning' || currentMode === 'free' || currentMode === 'puzzle') && (
          <aside style={{
            width: '320px',
            background: '#f9fafb',
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
            flexShrink: 0
          }}>
            {currentMode === 'learning' && (
              <LearningModeManager 
                currentMode={currentMode} 
                onLoadCircuit={(circuitData) => {
                  viewModel.loadCircuit(circuitData);
                }}
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
                onLoadCircuit={(circuitData) => {
                  viewModel.loadCircuit(circuitData);
                }}
                gates={gates}
                connections={connections}
              />
            )}
          </aside>
        )}

        {/* キャンバスエリア */}
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          {/* ツールバー（標準ゲートのみ） */}
          <div 
        data-tutorial-target="toolbar"
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',  // 左側に配置
          display: 'flex',
          flexDirection: 'column',  // 縦並びに
          gap: '4px',
          padding: '8px',
          background: selectedTheme === 'minimal' ? theme.colors.background : 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.ui.border}`,
          zIndex: 10,
        }}>
        {Object.entries(gateTypes)
          .filter(([type]) => {
            // デバッグモードでは全ゲート表示
            if (debugMode) return true;
            // 現在のモードで利用可能なゲートのみ表示
            const availableGates = getGatesForMode(currentMode || 'free');
            return availableGates.includes(type as any);
          })
          .map(([type, config]) => (
          <button
            key={type}
            data-testid={`gate-button-${type}`}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === type) {
                // 既に選択されている場合は選択解除
                setSelectedTool(null as any);
              } else {
                // ツールを選択
                setSelectedTool(type);
              }
            }}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: selectedTool === type ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              if (selectedTool !== type) {
                (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== type) {
                (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg;
              }
            }}
          >
            <svg width="20" height="20" viewBox="-25 -25 50 50">
              {config.icon(false)}
            </svg>
            <span style={{ fontSize: '10px' }}>{config.name}</span>
          </button>
        ))}
      </div>
      
      {/* カスタムゲートパネル */}
      {showCustomGatePanel && Object.keys(customGates).length > 0 && (
        <div 
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',  // 右側に配置
            width: '220px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '12px',
            background: selectedTheme === 'minimal' ? theme.colors.background : 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.ui.accent}`,
            boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
            zIndex: 15,
          }}>
          <h3 style={{
            color: theme.colors.ui.accent,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            margin: 0,
          }}>
            カスタムゲート
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            marginTop: '12px',
          }}>
            {Object.entries(customGates).map(([name, gateDef]) => (
              <div key={name} style={{ position: 'relative' }}>
                <button
                  data-testid={`custom-gate-button-${name}`}
                  onClick={() => addGate(name)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.ui.border}`,
                    background: theme.colors.ui.buttonBg,
                    color: theme.colors.ui.primary,
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '4px',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.ui.buttonHover;
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = theme.colors.ui.buttonBg;
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                  title={`${name}\n入力: ${gateDef.inputs.length}\n出力: ${gateDef.outputs.length}`}
                >
                  <svg width="24" height="24" viewBox="-25 -25 50 50">
                    {allGateTypes[name]?.icon(false)}
                  </svg>
                  <span style={{ 
                    fontSize: '9px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    textAlign: 'center',
                  }}>
                    {name}
                  </span>
                </button>
                {/* 詳細ボタン */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomGateDetail(name);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = '#00ff88';
                    (e.target as HTMLElement).style.color = '#000';
                    (e.target as HTMLElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.8)';
                    (e.target as HTMLElement).style.color = 'rgba(255, 255, 255, 0.7)';
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                  }}
                  title="詳細を表示"
                >
                  ℹ
                </button>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: `1px solid ${theme.colors.ui.border}`,
          }}>
            <button
              onClick={() => {
                if (confirm('すべてのカスタムゲートを削除しますか？')) {
                  localStorage.removeItem('customGates');
                  setCustomGates({});
                  toggleCustomGatePanel();
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.ui.border}`,
                background: 'rgba(255, 0, 0, 0.1)',
                color: '#ff6666',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 0, 0, 0.1)';
              }}
            >
              すべて削除
            </button>
          </div>
        </div>
      )}

          {/* キャンバス */}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{
              background: theme.colors.canvas,
              cursor: selectedTool ? 'crosshair' : 'default',
            }}
            onClick={(e) => {
              if (selectedTool) {
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) {
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // ViewModelを使用してゲートを追加
                  const gate = viewModel.addGate(selectedTool as string, { x, y });
                  if (gate) {
                    viewModel.simulate();
                    setSelectedTool(null as any); // ツール選択をクリア
                  }
                }
              }
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill={theme.colors.grid} />
          </pattern>
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
        </div>
      </div>

      {/* ヘルプウィンドウ（右サイド） */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          width: '300px',
          padding: '20px',
          background: selectedTheme === 'minimal' ? theme.colors.background : 'rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.ui.border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
        }}>
          <h2 style={{ 
            color: theme.colors.ui.primary, 
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px' 
          }}>
            操作方法
          </h2>
          <ul style={{ 
            color: theme.colors.ui.secondary, 
            fontSize: '14px',
            lineHeight: '1.8',
            paddingLeft: '20px',
            margin: 0,
          }}>
            <li>ツールバーからゲートを選択</li>
            <li>キャンバスを1クリックで配置</li>
            <li>端子をドラッグして接続</li>
            <li>入力ゲートをクリックでON/OFF</li>
            <li>右クリックでゲート削除</li>
            <li>ESCキーで選択解除</li>
          </ul>
          <button
            onClick={toggleHelp}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      )}
      
      {/* チュートリアルシステム */}
      {showTutorial && (
        <TutorialSystemV2
          onComplete={() => {
            setShowTutorial(false);
            // チュートリアル完了を保存
            saveTutorialState({ completed: true });
            saveUserPreferences({ ...preferences, tutorialCompleted: true });
            setBadges([...badges, { id: 'tutorial-complete', name: 'チュートリアル完了', description: 'チュートリアルを完了しました', icon: '🎓' } as any]);
            
            // 学習モードの場合のみチャレンジを表示
            if (userMode === 'learning') {
              // setShowChallenge(true);
            }
          }}
          onSkip={() => {
            setShowTutorial(false);
            // 学習モードでもスキップ時はチャレンジを表示しない
          }}
        />
      )}
      
      {/* チャレンジシステム */}
      {/* showChallenge && (
        <ChallengeSystem
          gates={gates}
          connections={connections}
          onComplete={(completedCount) => {
            setProgress((prev: any) => ({ ...prev, challengesCompleted: completedCount }));
            if (completedCount === 1) {
              setBadges([...(badges as any[]), 'challenge-1']);
            } else if (completedCount === 5) {
              setBadges([...(badges as any[]), 'challenge-all']);
              // レベル1完了後、自動的にレベル2へ
              if (debugMode) {
                // setShowChallenge(false);
                // setShowExtendedChallenge(true);
              }
            }
          }}
        />
      )} */}
      
      {/* 拡張チャレンジシステム（レベル2） */}
      {/* showExtendedChallenge && (
        <ExtendedChallengeSystem
          gates={gates}
          connections={connections}
          debugMode={debugMode}
          onComplete={(completedCount) => {
            setProgress((prev: any) => ({ ...prev, challengesCompleted: (prev.challengesCompleted || 0) + completedCount }));
            if (completedCount === 1) {
              setBadges([...(badges as any[]), 'level2-1']);
            } else if (completedCount === 8) {
              setBadges([...(badges as any[]), 'level2-complete']);
            }
          }}
        />
      )} */}
      
      {/* 進捗トラッカー */}
      {showProgress && (
        <ProgressTracker
          progress={progress as any}
          badges={badges as any}
          onClose={() => setShowProgress(false)}
        />
      )}
      
      {/* 保存/読み込みパネル */}
      {showSaveLoad && (
        <SaveLoadPanel
          currentCircuit={viewModel.toJSON()}
          onLoad={handleLoadCircuit}
          onClose={toggleSaveLoad}
        />
      )}
      
      {/* ゲート定義ダイアログ */}
      {showGateDefinition && (
        <GateDefinitionDialog
          gates={gates as any}
          connections={connections as any}
          onSave={(gateDefinition: any) => {
            // カスタムゲートを保存
            const success = saveCustomGate(gateDefinition);
            toggleGateDefinition();
            
            if (success) {
              // カスタムゲートを再読み込み
              const updatedCustomGates = getCustomGates();
              setCustomGates(updatedCustomGates);
              Object.entries(updatedCustomGates).forEach(([name, def]) => {
                viewModel.registerCustomGate(name, def);
              });
              
              // 保存完了の通知
              alert(`カスタムゲート "${gateDefinition.name}" を保存しました！`);
            }
          }}
          onClose={() => toggleGateDefinition()}
        />
      )}
      
      {/* カスタムゲート詳細ダイアログ */}
      {selectedCustomGateDetail && (
        <CustomGateDetail
          gateName={selectedCustomGateDetail}
          onClose={() => setSelectedCustomGateDetail(null)}
        />
      )}
      
      {/* 発見通知 */}
      {showDiscoveryNotification && (
        <DiscoveryNotification
          discoveryIds={[]}
          onClose={() => setShowDiscoveryNotification(false)}
        />
      )}
      
      {/* 実験ノート */}
      <ExperimentNotebook
        isOpen={showNotebook}
        onClose={toggleNotebook}
        currentCircuit={viewModel.toJSON()}
        discoveries={discoveryProgress?.discoveries ? Object.keys(discoveryProgress.discoveries).filter(key => discoveryProgress.discoveries[key]) : []}
      />
      
      {/* 発見チュートリアル */}
      {showDiscoveryTutorial && (
        <DiscoveryTutorial
          onClose={() => setShowDiscoveryTutorial(false)}
        />
      )}
    </div>
  );
};

export default UltraModernCircuitWithViewModel;