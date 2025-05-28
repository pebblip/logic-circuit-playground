import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CircuitViewModel } from '../viewmodels/CircuitViewModel';
import { useCircuitViewModel } from '../hooks/useCircuitViewModel';
import { GateType } from '../types/gate';

// Import existing components
import TutorialSystemV2 from './TutorialSystemV2';
import ChallengeSystem from './ChallengeSystem';
import ExtendedChallengeSystem from './ExtendedChallengeSystem';
import ProgressTracker from './ProgressTracker';
import ModeSelector from './ModeSelector';
import SaveLoadPanel from './SaveLoadPanel';
import GateDefinitionDialog from './GateDefinitionDialog';
import CustomGateDetail from './CustomGateDetail';

import { 
  getUserPreferences, 
  saveUserPreferences,
  getTutorialState,
  saveTutorialState,
  decodeCircuitFromURL,
  saveCustomGate,
  getCustomGates
} from '../utils/circuitStorage';
import { migrateAllCustomGates } from '../utils/customGateMigration';

// Constants from original
const GATE_SIZE = 40;

/**
 * 統一感のあるモダンなデザインの論理回路コンポーネントV2
 * オリジナルのUIを完全に保持しながら、新しいアーキテクチャで実装
 */
const UltraModernCircuitV2 = () => {
  // ViewModel
  const [viewModel] = useState(() => new CircuitViewModel());
  useCircuitViewModel(viewModel);
  
  // UI States (from original)
  const [selectedTool, setSelectedTool] = useState(null);
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [isDraggingGate, setIsDraggingGate] = useState(false);
  const [drawingWire, setDrawingWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showGateDefinition, setShowGateDefinition] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  
  // ユーザー設定とモード
  const [userMode, setUserMode] = useState(null);
  const [preferences, setPreferences] = useState(null);
  
  // 教育機能の状態
  const [showTutorial, setShowTutorial] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showExtendedChallenge, setShowExtendedChallenge] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({
    gatesPlaced: 0,
    challengesCompleted: 0,
    totalTime: 0
  });
  
  // カスタムゲート
  const [customGates, setCustomGates] = useState({});
  const [showCustomGatePanel, setShowCustomGatePanel] = useState(false);
  const [selectedCustomGateDetail, setSelectedCustomGateDetail] = useState(null);
  
  // デバッグモード（環境変数またはURLパラメータで有効化）
  const [debugMode] = useState(() => {
    const envDebug = import.meta.env.VITE_DEBUG_MODE === 'true';
    const params = new URLSearchParams(window.location.search);
    const urlDebug = params.get('debug') === 'true';
    return urlDebug || envDebug;
  });
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);

  // モダンデザインシステム (from original)
  const themes = {
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
          primary: '#00ff88',
          secondary: '#00ffff',
          accent: '#ff00ff',
          warning: '#ffff00',
          danger: '#ff0066',
          
          panel: 'rgba(15, 20, 65, 0.95)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#ffffff',
          textMuted: 'rgba(255, 255, 255, 0.6)',
        },
        
        animation: {
          glow: '#00ff88',
          pulse: '#00ffff',
        }
      }
    }
  };
  
  const theme = themes[selectedTheme];

  // Gate types with original SVG icons
  const gateTypes = {
    INPUT: {
      name: '入力',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={5} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="14" fontWeight="600">
            IN
          </text>
        </g>
      )
    },
    OUTPUT: {
      name: '出力',
      icon: (isActive) => (
        <g>
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={GATE_SIZE/2}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={5} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="12" fontWeight="600">
            OUT
          </text>
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
          <text x={0} y={6} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="18" fontWeight="600">
            &amp;
          </text>
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
          <text x={0} y={6} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="14" fontWeight="600">
            ≥1
          </text>
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
          <circle cx={0} cy={0} r={6}
            fill="none"
            stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            strokeWidth="2"
          />
          <circle cx={10} cy={0} r={3}
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
          <text x={0} y={6} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="14" fontWeight="600">
            =1
          </text>
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
    }
  };
  
  // カスタムゲートをgateTypesに追加
  const allGateTypes = {
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
        inputs: gateDef.inputs,
        outputs: gateDef.outputs,
        circuit: gateDef.circuit,
        isCustom: true
      };
      return acc;
    }, {})
  };

  // ゲート追加（1クリック配置）
  const addGate = useCallback((type) => {
    const centerX = svgRef.current ? svgRef.current.clientWidth / 2 : 400;
    const centerY = svgRef.current ? (svgRef.current.clientHeight - 60) / 2 : 300;
    
    let x = centerX;
    let y = centerY;
    let offset = 0;
    
    // 既存のゲートと重ならない位置を探す
    const gates = viewModel.getCircuit().getGates();
    while (gates.some(g => Math.abs(g.position.x - x) < 80 && Math.abs(g.position.y - y) < 80)) {
      offset += 60;
      x = centerX + (offset * Math.cos(offset / 50));
      y = centerY + (offset * Math.sin(offset / 50));
    }
    
    // グリッドにスナップ
    x = Math.round(x / 20) * 20;
    y = Math.round(y / 20) * 20;
    
    // ViewModelを通じてゲートを追加
    const gateTypeEnum = GateType[type] || type; // カスタムゲートの場合はそのまま使用
    viewModel.addGate(gateTypeEnum, { x, y });
    
    // 進捗を更新
    setProgress(prev => ({ ...prev, gatesPlaced: prev.gatesPlaced + 1 }));
    
    // 最初のゲート配置バッジ
    if (progress.gatesPlaced === 0 && !badges.some(b => b.id === 'first-gate')) {
      setBadges([...badges, { id: 'first-gate', name: '初めてのゲート', icon: '🎯' }]);
    }
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: `${type}_PLACED` } 
      }));
    }
  }, [viewModel, progress, badges, showTutorial]);

  // Initialize
  useEffect(() => {
    // カスタムゲートのマイグレーション
    migrateAllCustomGates();
    
    const prefs = getUserPreferences();
    setPreferences(prefs);
    
    const tutorialState = getTutorialState();
    if (tutorialState) {
      setBadges(tutorialState.badges || []);
      setProgress(tutorialState.progress || progress);
    }
    
    const gates = getCustomGates();
    setCustomGates(gates);
    
    const urlCircuit = decodeCircuitFromURL();
    if (urlCircuit) {
      // TODO: Load circuit from URL into ViewModel
    }
  }, []);

  // Wire drawing handlers
  const handlePinClick = useCallback((gateId, pinId, pinType, event) => {
    event.stopPropagation();
    
    if (!drawingWire) {
      // Start drawing wire
      setDrawingWire({
        fromGate: gateId,
        fromPin: pinId,
        fromPinType: pinType,
        to: null
      });
    } else {
      // Complete wire
      if (drawingWire.fromPinType !== pinType) {
        const fromGate = drawingWire.fromPinType === 'output' ? drawingWire.fromGate : gateId;
        const fromPin = drawingWire.fromPinType === 'output' ? drawingWire.fromPin : pinId;
        const toGate = drawingWire.fromPinType === 'output' ? gateId : drawingWire.fromGate;
        const toPin = drawingWire.fromPinType === 'output' ? pinId : drawingWire.fromPin;
        
        try {
          viewModel.addConnection(fromGate, fromPin, toGate, toPin);
          
          // チュートリアルアクション
          if (showTutorial) {
            window.dispatchEvent(new CustomEvent('tutorial-action', { 
              detail: { action: 'WIRE_CONNECTED' } 
            }));
          }
        } catch (error) {
          console.error('Failed to create connection:', error);
        }
      }
      setDrawingWire(null);
    }
  }, [drawingWire, viewModel, showTutorial]);

  // Mouse move handler for wire drawing
  const handleMouseMove = useCallback((e) => {
    if (drawingWire && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDrawingWire(prev => ({ ...prev, to: { x, y } }));
    }
  }, [drawingWire]);

  // Gate drag handlers
  const handleGateMouseDown = useCallback((gateId, event) => {
    event.stopPropagation();
    const gate = viewModel.getCircuit().getGate(gateId);
    if (!gate) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    setDraggedGate(gateId);
    setDragOffset({
      x: event.clientX - rect.left - gate.position.x,
      y: event.clientY - rect.top - gate.position.y
    });
    setIsDraggingGate(true);
    
    // Select gate
    if (!event.shiftKey) {
      viewModel.clearSelection();
    }
    viewModel.selectGate(gateId);
  }, [viewModel]);

  const handleGateDrag = useCallback((e) => {
    if (isDraggingGate && draggedGate && dragOffset && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const y = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
      viewModel.moveGate(draggedGate, { x, y });
    }
  }, [isDraggingGate, draggedGate, dragOffset, viewModel]);

  const handleGateMouseUp = useCallback(() => {
    setDraggedGate(null);
    setDragOffset(null);
    setIsDraggingGate(false);
  }, []);

  // Input toggle
  const toggleInput = useCallback((gateId) => {
    const gate = viewModel.getCircuit().getGate(gateId);
    if (gate && gate.type === GateType.INPUT) {
      // Toggle input value in the model
      gate.outputs[0].value = !gate.outputs[0].value;
      viewModel.simulate();
      
      // Tutorial action
      if (showTutorial) {
        window.dispatchEvent(new CustomEvent('tutorial-action', { 
          detail: { action: 'INPUT_TOGGLED' } 
        }));
      }
    }
  }, [viewModel, showTutorial]);

  // Delete gate
  const deleteGate = useCallback((gateId) => {
    viewModel.removeGate(gateId);
  }, [viewModel]);

  // Save custom gate
  const handleSaveCustomGate = useCallback((gateData) => {
    const saved = saveCustomGate(gateData);
    if (saved) {
      setCustomGates(prev => ({ ...prev, [saved.id]: saved }));
    }
  }, []);

  // Get circuit data for rendering
  const circuit = viewModel.getCircuit();
  const gates = circuit.getGates();
  const connections = circuit.getConnections();

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* モードセレクター（初回のみ） */}
      {!userMode && !preferences && (
        <ModeSelector onModeSelect={(mode) => {
          setUserMode(mode);
          saveUserPreferences({ mode });
          if (mode === 'education') {
            setShowTutorial(true);
          }
        }} />
      )}

      {/* ツールバー（上部） */}
      <div style={{
        backgroundColor: theme.colors.ui.panel,
        borderBottom: `1px solid ${theme.colors.ui.border}`,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ 
            color: theme.colors.ui.text, 
            fontSize: '18px', 
            fontWeight: '600',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            論理回路プレイグラウンド
          </h1>
          
          {/* バッジ表示 */}
          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: '5px' }}>
              {badges.slice(0, 3).map(badge => (
                <span key={badge.id} title={badge.name} style={{ fontSize: '20px' }}>
                  {badge.icon}
                </span>
              ))}
              {badges.length > 3 && (
                <span style={{ color: theme.colors.ui.textMuted, fontSize: '14px' }}>
                  +{badges.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* 教育機能ボタン */}
          <button
            onClick={() => setShowTutorial(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '8px',
              color: '#a78bfa',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                borderColor: '#a78bfa'
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
              e.target.style.borderColor = '#a78bfa';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
          >
            📚 チュートリアル
          </button>
          
          <button
            onClick={() => setShowChallenge(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(251, 146, 60, 0.2)',
              border: '1px solid rgba(251, 146, 60, 0.5)',
              borderRadius: '8px',
              color: '#fdba74',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(251, 146, 60, 0.3)';
              e.target.style.borderColor = '#fdba74';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(251, 146, 60, 0.2)';
              e.target.style.borderColor = 'rgba(251, 146, 60, 0.5)';
            }}
          >
            🎯 チャレンジ
          </button>
          
          <button
            onClick={() => setShowExtendedChallenge(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.5)',
              borderRadius: '8px',
              color: '#f9a8d4',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.3)';
              e.target.style.borderColor = '#f9a8d4';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.2)';
              e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)';
            }}
          >
            🏆 上級チャレンジ
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: theme.colors.ui.border }} />
          
          {/* ツールボタン */}
          <button
            onClick={() => setShowSaveLoad(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.ui.primary + '20',
              border: `1px solid ${theme.colors.ui.primary}40`,
              borderRadius: '8px',
              color: theme.colors.ui.primary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.ui.primary + '30';
              e.target.style.borderColor = theme.colors.ui.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.ui.primary + '20';
              e.target.style.borderColor = theme.colors.ui.primary + '40';
            }}
          >
            💾 保存/読込
          </button>
          
          <button
            onClick={() => setShowGateDefinition(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.ui.accent + '20',
              border: `1px solid ${theme.colors.ui.accent}40`,
              borderRadius: '8px',
              color: theme.colors.ui.accent,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.ui.accent + '30';
              e.target.style.borderColor = theme.colors.ui.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.ui.accent + '20';
              e.target.style.borderColor = theme.colors.ui.accent + '40';
            }}
          >
            🔧 カスタムゲート
          </button>
          
          <button
            onClick={() => setShowProgress(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: theme.colors.ui.text,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            📊 進捗
          </button>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              padding: '8px 12px',
              backgroundColor: showHelp ? theme.colors.ui.primary + '30' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showHelp ? theme.colors.ui.primary : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '8px',
              color: showHelp ? theme.colors.ui.primary : theme.colors.ui.text,
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.2s'
            }}
          >
            ❓
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* ゲートパレット（左） */}
        <div style={{
          width: '80px',
          backgroundColor: theme.colors.ui.panel,
          borderRight: `1px solid ${theme.colors.ui.border}`,
          padding: '20px 10px',
          overflowY: 'auto',
          zIndex: 50
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px',
            alignItems: 'center'
          }}>
            {Object.entries(allGateTypes).map(([type, config]) => (
              <button
                key={type}
                onClick={() => addGate(type)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={config.name}
              >
                <svg width={GATE_SIZE + 20} height={GATE_SIZE + 20} viewBox={`${-GATE_SIZE/2 - 10} ${-GATE_SIZE/2 - 10} ${GATE_SIZE + 20} ${GATE_SIZE + 20}`}>
                  {config.icon(false)}
                </svg>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: theme.colors.ui.textMuted,
                  whiteSpace: 'nowrap'
                }}>
                  {config.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* キャンバス */}
        <div style={{ 
          flex: 1, 
          backgroundColor: theme.colors.canvas,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onMouseMove={handleMouseMove}
            onMouseUp={handleGateMouseUp}
            onClick={() => {
              if (drawingWire) {
                setDrawingWire(null);
              }
            }}
            style={{ cursor: isDraggingGate ? 'grabbing' : 'default' }}
          >
            {/* グリッド */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.5" fill={theme.colors.grid} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 接続線 */}
            {connections.map(conn => {
              const fromGate = gates.find(g => g.id === conn.fromGateId);
              const toGate = gates.find(g => g.id === conn.toGateId);
              if (!fromGate || !toGate) return null;

              const fromPin = fromGate.outputs.find(p => p.id === conn.fromPinId);
              const toPin = toGate.inputs.find(p => p.id === conn.toPinId);
              if (!fromPin || !toPin) return null;

              const from = {
                x: fromGate.position.x + GATE_SIZE/2 + 5,
                y: fromGate.position.y
              };
              const to = {
                x: toGate.position.x - GATE_SIZE/2 - 5,
                y: toGate.position.y
              };

              const isActive = fromPin.value;
              const strokeColor = isActive ? theme.colors.signal.on : theme.colors.signal.off;

              return (
                <g key={conn.id}>
                  {/* 接続線 */}
                  <path
                    d={`M ${from.x} ${from.y} C ${from.x + 50} ${from.y}, ${to.x - 50} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    opacity={isActive ? 1 : 0.5}
                  />
                  {/* アニメーション */}
                  {isActive && (
                    <circle r="3" fill={theme.colors.signal.flow}>
                      <animateMotion
                        dur="1s"
                        repeatCount="indefinite"
                        path={`M ${from.x} ${from.y} C ${from.x + 50} ${from.y}, ${to.x - 50} ${to.y}, ${to.x} ${to.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* 描画中のワイヤー */}
            {drawingWire && drawingWire.to && (
              <path
                d={`M ${drawingWire.from?.x || 0} ${drawingWire.from?.y || 0} L ${drawingWire.to.x} ${drawingWire.to.y}`}
                fill="none"
                stroke={theme.colors.signal.off}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            )}

            {/* ゲート */}
            {gates.map(gate => {
              const gateType = allGateTypes[gate.type];
              const isActive = gate.type === GateType.INPUT ? gate.outputs[0]?.value : 
                             gate.type === GateType.OUTPUT ? gate.inputs[0]?.value :
                             gate.outputs[0]?.value;
              const isSelected = viewModel.isGateSelected(gate.id);

              return (
                <g
                  key={gate.id}
                  transform={`translate(${gate.position.x}, ${gate.position.y})`}
                  onMouseDown={(e) => handleGateMouseDown(gate.id, e)}
                  onMouseEnter={() => setHoveredGate(gate.id)}
                  onMouseLeave={() => setHoveredGate(null)}
                  style={{ cursor: 'move' }}
                >
                  {/* 選択ハイライト */}
                  {isSelected && (
                    <circle
                      cx={0} cy={0} r={GATE_SIZE/2 + 5}
                      fill="none"
                      stroke={theme.colors.ui.primary}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}

                  {/* ゲートアイコン */}
                  {gateType?.icon(isActive)}

                  {/* 入力ピン */}
                  {gate.inputs.map((pin, idx) => (
                    <g key={pin.id}>
                      <circle
                        cx={-GATE_SIZE/2 - 5}
                        cy={0}
                        r="5"
                        fill={pin.value ? theme.colors.signal.on : theme.colors.canvas}
                        stroke={pin.value ? theme.colors.signal.on : theme.colors.signal.off}
                        strokeWidth="1.5"
                        style={{ cursor: 'crosshair' }}
                        onClick={(e) => handlePinClick(gate.id, pin.id, 'input', e)}
                      />
                    </g>
                  ))}

                  {/* 出力ピン */}
                  {gate.outputs.map((pin, idx) => (
                    <g key={pin.id}>
                      <circle
                        cx={GATE_SIZE/2 + 5}
                        cy={0}
                        r="5"
                        fill={pin.value ? theme.colors.signal.on : theme.colors.canvas}
                        stroke={pin.value ? theme.colors.signal.on : theme.colors.signal.off}
                        strokeWidth="1.5"
                        style={{ cursor: 'crosshair' }}
                        onClick={(e) => handlePinClick(gate.id, pin.id, 'output', e)}
                      />
                    </g>
                  ))}

                  {/* 入力ゲートのトグルボタン */}
                  {gate.type === GateType.INPUT && (
                    <rect
                      x={-GATE_SIZE/2}
                      y={-GATE_SIZE/2}
                      width={GATE_SIZE}
                      height={GATE_SIZE}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleInput(gate.id);
                      }}
                    />
                  )}

                  {/* 削除ボタン（ホバー時） */}
                  {hoveredGate === gate.id && (
                    <g
                      transform="translate(15, -15)"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGate(gate.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={0} cy={0} r={8} fill={theme.colors.ui.danger} />
                      <text x={0} y={4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                        ×
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ヘルプパネル（右） */}
        {showHelp && (
          <div style={{
            width: '300px',
            backgroundColor: theme.colors.ui.panel,
            borderLeft: `1px solid ${theme.colors.ui.border}`,
            padding: '20px',
            overflowY: 'auto',
            zIndex: 50
          }}>
            <h2 style={{
              color: theme.colors.ui.text,
              fontSize: '18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>💡</span>
              ヘルプ
            </h2>

            <div style={{ color: theme.colors.ui.textMuted, fontSize: '14px', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: theme.colors.ui.text, marginBottom: '10px' }}>基本操作</h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>左のパレットからゲートをクリックして配置</li>
                  <li>ゲートをドラッグで移動</li>
                  <li>ピンをクリックしてワイヤーを接続</li>
                  <li>入力ゲートをクリックでON/OFF切替</li>
                  <li>ゲートにホバーで削除ボタン表示</li>
                </ul>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: theme.colors.ui.text, marginBottom: '10px' }}>ゲートの種類</h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><strong>入力 (IN)</strong>: 手動でON/OFF切替</li>
                  <li><strong>出力 (OUT)</strong>: 結果を表示</li>
                  <li><strong>AND (&)</strong>: すべて入力がONで出力ON</li>
                  <li><strong>OR (≥1)</strong>: いずれかの入力がONで出力ON</li>
                  <li><strong>NOT (○)</strong>: 入力を反転</li>
                  <li><strong>XOR (=1)</strong>: 入力が異なるとき出力ON</li>
                  <li><strong>NAND/NOR/XNOR</strong>: それぞれの否定</li>
                </ul>
              </div>

              <div>
                <h3 style={{ color: theme.colors.ui.text, marginBottom: '10px' }}>ショートカット</h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><kbd>Delete</kbd>: 選択したゲートを削除</li>
                  <li><kbd>Escape</kbd>: 選択解除/ワイヤー描画キャンセル</li>
                  <li><kbd>Ctrl+A</kbd>: すべて選択</li>
                </ul>
              </div>

              {debugMode && (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '10px', 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  borderRadius: '5px',
                  border: '1px solid rgba(255, 0, 0, 0.3)'
                }}>
                  <h3 style={{ color: '#ff6666', marginBottom: '10px' }}>デバッグ情報</h3>
                  <pre style={{ fontSize: '12px', color: '#ffaaaa' }}>
                    Gates: {gates.length}{'\n'}
                    Connections: {connections.length}{'\n'}
                    Progress: {JSON.stringify(progress, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 各種ダイアログ・システム */}
      {showTutorial && (
        <TutorialSystemV2
          onComplete={() => {
            setShowTutorial(false);
            const newBadge = { id: 'tutorial-complete', name: 'チュートリアル完了', icon: '🎓' };
            setBadges(prev => [...prev, newBadge]);
            saveTutorialState({ badges: [...badges, newBadge], progress });
          }}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {showChallenge && (
        <ChallengeSystem
          onComplete={(challengeId) => {
            setProgress(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
            saveTutorialState({ badges, progress: { ...progress, challengesCompleted: progress.challengesCompleted + 1 } });
          }}
          onClose={() => setShowChallenge(false)}
        />
      )}

      {showExtendedChallenge && (
        <ExtendedChallengeSystem
          onComplete={(challengeId) => {
            setProgress(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + 1 }));
            saveTutorialState({ badges, progress: { ...progress, challengesCompleted: progress.challengesCompleted + 1 } });
          }}
          onClose={() => setShowExtendedChallenge(false)}
        />
      )}

      {showProgress && (
        <ProgressTracker
          progress={progress}
          badges={badges}
          onClose={() => setShowProgress(false)}
        />
      )}

      {showSaveLoad && (
        <SaveLoadPanel
          circuit={viewModel.toJSON()}
          onLoad={(circuitData) => {
            // TODO: Load circuit data into viewModel
            setShowSaveLoad(false);
          }}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {showGateDefinition && (
        <GateDefinitionDialog
          onSave={handleSaveCustomGate}
          onClose={() => setShowGateDefinition(false)}
        />
      )}

      {selectedCustomGateDetail && (
        <CustomGateDetail
          gate={selectedCustomGateDetail}
          onEdit={(gateData) => {
            handleSaveCustomGate(gateData);
            setSelectedCustomGateDetail(null);
          }}
          onClose={() => setSelectedCustomGateDetail(null)}
        />
      )}
    </div>
  );
};

export default UltraModernCircuitV2;