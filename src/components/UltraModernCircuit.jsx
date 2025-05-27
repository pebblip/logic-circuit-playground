import React, { useState, useCallback, useRef, useEffect } from 'react';
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

/**
 * 統一感のあるモダンなデザインの論理回路コンポーネント
 * - 1クリック配置
 * - 統一されたゲートサイズ
 * - 洗練されたアイコン
 * - ヘルプは右サイドに表示
 */
const UltraModernCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
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
    // 環境変数をチェック
    const envDebug = import.meta.env.VITE_DEBUG_MODE === 'true';
    
    // URLパラメータをチェック（環境変数より優先）
    const params = new URLSearchParams(window.location.search);
    const urlDebug = params.get('debug') === 'true';
    
    return urlDebug || envDebug;
  });
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);

  // モダンデザインシステム
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

  // 統一されたゲートサイズとアイコン
  const GATE_SIZE = 50;
  
  const gateTypes = {
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
          <rect x={-GATE_SIZE/2} y={-GATE_SIZE/2} width={GATE_SIZE} height={GATE_SIZE} rx={8}
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <rect x={-GATE_SIZE/4} y={-GATE_SIZE/4} width={GATE_SIZE/2} height={GATE_SIZE/2} rx={4}
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
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
          {/* ANDゲートのアイコン - シンプルな幾何学的デザイン */}
          <g transform="scale(1.2)">
            {/* 2つの円を重ねてANDを表現 */}
            <circle cx={-3} cy={0} r={6}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
            <circle cx={3} cy={0} r={6}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
            {/* 重なり部分を強調 */}
            <path d="M 0 -4.5 A 6 6 0 0 1 0 4.5 A 6 6 0 0 1 0 -4.5"
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              opacity="0.3"
            />
          </g>
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
          {/* ORゲートのアイコン - シンプルな幾何学的デザイン */}
          <g transform="scale(1.2)">
            {/* 2つの円を離してORを表現 */}
            <circle cx={-4} cy={0} r={6}
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              opacity="0.3"
            />
            <circle cx={4} cy={0} r={6}
              fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              opacity="0.3"
            />
            {/* 外枠の結合を表す円 */}
            <circle cx={0} cy={0} r={10}
              fill="none"
              stroke={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
              strokeWidth="1.5"
              opacity="0.8"
            />
          </g>
        </g>
      )
    },
    NOT: { 
      name: 'NOT',
      icon: (isActive) => (
        <g>
          <circle cx={0} cy={0} r={GATE_SIZE/2} 
            fill={isActive ? theme.colors.gate.activeBg : theme.colors.gate.bg}
            stroke={isActive ? theme.colors.gate.activeBorder : theme.colors.gate.border}
            strokeWidth="2"
          />
          <text x={0} y={5} textAnchor="middle" 
            fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}
            fontSize="14" fontWeight="700">
            !
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
          {/* NANDゲート - ANDゲート + 出力に小さな円 */}
          <g transform="scale(1)">
            {/* ANDゲートの形状 */}
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
            {/* NOT記号（出力側の小さな円） */}
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
          {/* NORゲート - ORゲート + 出力に小さな円 */}
          <g transform="scale(0.9)">
            {/* ORゲートの形状 */}
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
            {/* NOT記号（出力側の小さな円） */}
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
          {/* XNORゲート - XORゲート + 出力に小さな円 */}
          <g transform="scale(1.1)">
            {/* XORゲートの記号（≡） */}
            <g fill={isActive ? theme.colors.gate.activeText : theme.colors.gate.text}>
              <rect x={-6} y={-4} width={12} height={1.5} />
              <rect x={-6} y={-0.75} width={12} height={1.5} />
              <rect x={-6} y={2.5} width={12} height={1.5} />
            </g>
            {/* NOT記号（出力側の小さな円） */}
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
    while (gates.some(g => Math.abs(g.x - x) < 80 && Math.abs(g.y - y) < 80)) {
      offset += 60;
      x = centerX + (offset * Math.cos(offset / 50));
      y = centerY + (offset * Math.sin(offset / 50));
    }
    
    const gateConfig = allGateTypes[type];
    const newGate = {
      id: `gate_${nextGateId.current++}`,
      type,
      x: Math.round(x / 20) * 20,
      y: Math.round(y / 20) * 20,
      value: type === 'INPUT' ? false : null,
      // カスタムゲートの場合は内部回路を持つ
      ...(gateConfig?.isCustom && {
        circuit: gateConfig.circuit,
        inputs: gateConfig.inputs,
        outputs: gateConfig.outputs
      })
    };
    
    setGates(prev => [...prev, newGate]);
    
    // 進捗を更新
    setProgress(prev => ({ ...prev, gatesPlaced: prev.gatesPlaced + 1 }));
    
    // 最初のゲート配置バッジ
    if (progress.gatesPlaced === 0 && !badges.includes('first-gate')) {
      setBadges([...badges, 'first-gate']);
    }
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: `${type}_PLACED` } 
      }));
    }
  }, [gates, progress, badges, showTutorial, allGateTypes]);

  // キャンバスクリック（現在は使用しない）
  const handleCanvasClick = useCallback((e) => {
    // 1クリック配置のため、この関数は使用しない
  }, []);

  // ゲート削除
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
  }, []);

  // 入力値切り替え
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(g => 
      g.id === gateId ? { ...g, value: !g.value } : g
    ));
    
    // チュートリアルアクションを発火
    if (showTutorial) {
      window.dispatchEvent(new CustomEvent('tutorial-action', { 
        detail: { action: 'INPUT_TOGGLED' } 
      }));
    }
  }, [showTutorial]);

  // ドラッグ開始
  const handleGateMouseDown = useCallback((e, gate) => {
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();
    setDraggedGate(gate);
    setDragOffset({
      x: e.clientX - rect.left - gate.x,
      y: e.clientY - rect.top - gate.y
    });
    setIsDraggingGate(false); // ドラッグ開始時はまだfalse
  }, []);

  // マウス移動
  const handleMouseMove = useCallback((e) => {
    if (draggedGate && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
      // 実際に移動したらドラッグ中とみなす
      if (Math.abs(newX - draggedGate.x) > 5 || Math.abs(newY - draggedGate.y) > 5) {
        setIsDraggingGate(true);
      }
      
      setGates(prev => prev.map(g => 
        g.id === draggedGate.id ? { ...g, x: newX, y: newY } : g
      ));
    }

    if (drawingWire && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setDrawingWire(prev => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      }));
    }
  }, [draggedGate, dragOffset, drawingWire]);

  // マウスアップ
  const handleMouseUp = useCallback(() => {
    // ドラッグ終了後、少し待ってからフラグをリセット
    setTimeout(() => {
      setIsDraggingGate(false);
    }, 100);
    
    setDraggedGate(null);
    setDragOffset(null);
    if (drawingWire) {
      setDrawingWire(null);
    }
  }, [drawingWire]);

  // ワイヤー接続開始
  const startWireConnection = useCallback((gateId, x, y, outputIndex = 0) => {
    setDrawingWire({ from: gateId, fromOutput: outputIndex, startX: x, startY: y, endX: x, endY: y });
  }, []);

  // ワイヤー接続完了
  const completeWireConnection = useCallback((toGateId, inputIndex) => {
    if (drawingWire && drawingWire.from !== toGateId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: drawingWire.from,
        fromOutput: drawingWire.fromOutput || 0,
        to: toGateId,
        toInput: inputIndex
      };
      setConnections(prev => [...prev, newConnection]);
      
      // チュートリアルアクションを発火
      if (showTutorial) {
        window.dispatchEvent(new CustomEvent('tutorial-action', { 
          detail: { action: 'WIRE_CONNECTED' } 
        }));
      }
    }
    setDrawingWire(null);
  }, [drawingWire, showTutorial]);

  // カスタムゲートの内部回路をシミュレート
  const simulateCustomGate = (customGate, inputValues) => {
    const internalGates = customGate.circuit.gates;
    const internalConnections = customGate.circuit.connections;
    const results = {};
    
    // 入力ゲートに外部からの値を設定
    customGate.inputs.forEach((input, index) => {
      // inputはGateDefinitionDialogで保存されたオブジェクト {id: gateId, name: "IN1", position: 0}
      const inputGateId = input.id || input;  // 互換性のため
      const inputGate = internalGates.find(g => g.id === inputGateId);
      if (inputGate && inputValues[index] !== undefined) {
        results[inputGate.id] = inputValues[index];
      }
    });
    
    // 内部回路をシミュレート
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      internalGates.forEach(gate => {
        if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
        
        const inputConnections = internalConnections.filter(c => c.to === gate.id);
        const inputVals = inputConnections
          .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
          .map(c => {
            const fromGate = internalGates.find(g => g.id === c.from);
            if (!fromGate) return undefined;
            
            const fromResult = results[fromGate.id];
            if (Array.isArray(fromResult)) {
              // 複数出力の場合
              return fromResult[c.fromOutput || 0];
            } else {
              // 単一出力の場合
              return fromResult;
            }
          })
          .filter(v => v !== undefined);
        
        let newValue = undefined;
        
        switch (gate.type) {
          case 'AND':
            if (inputVals.length >= 2) {
              newValue = inputVals.every(v => v === true);
            }
            break;
          case 'OR':
            if (inputVals.length >= 1) {
              newValue = inputVals.some(v => v === true);
            }
            break;
          case 'NOT':
            if (inputVals.length >= 1) {
              newValue = !inputVals[0];
            }
            break;
          case 'NAND':
            if (inputVals.length >= 2) {
              newValue = !inputVals.every(v => v === true);
            }
            break;
          case 'NOR':
            if (inputVals.length >= 1) {
              newValue = !inputVals.some(v => v === true);
            }
            break;
          case 'XNOR':
            if (inputVals.length >= 2) {
              newValue = inputVals[0] === inputVals[1];
            }
            break;
          case 'OUTPUT':
            if (inputVals.length >= 1) {
              newValue = inputVals[0];
            }
            break;
        }
        
        if (newValue !== undefined && results[gate.id] !== newValue) {
          results[gate.id] = newValue;
          changed = true;
        }
      });
    }
    
    return results;
  };

  // 回路シミュレーション
  const simulationResults = {};
  
  // まずINPUTゲートの値を設定
  gates.forEach(gate => {
    if (gate.type === 'INPUT') {
      simulationResults[gate.id] = gate.value;
    }
  });
  
  // 反復的に計算（依存関係を解決）
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    
    gates.forEach(gate => {
      if (gate.type === 'INPUT' || simulationResults[gate.id] !== undefined) return;
      
      const inputConnections = connections.filter(c => c.to === gate.id);
      const inputValues = inputConnections
        .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
        .map(c => {
          const fromGate = gates.find(g => g.id === c.from);
          if (!fromGate) return undefined;
          
          const fromResult = simulationResults[fromGate.id];
          if (Array.isArray(fromResult)) {
            // 複数出力の場合、指定された出力インデックスの値を取得
            return fromResult[c.fromOutput || 0];
          } else {
            // 単一出力の場合
            return fromResult;
          }
        })
        .filter(v => v !== undefined);

      let newValue = undefined;
      
      // カスタムゲートの場合
      const gateConfig = allGateTypes[gate.type];
      if (gateConfig?.isCustom && gate.circuit) {
        // カスタムゲートの内部回路をシミュレート
        const internalResults = simulateCustomGate(gate, inputValues);
        
        // 複数出力の場合は配列として値を保存
        if (gate.outputs && gate.outputs.length > 1) {
          newValue = gate.outputs.map(output => {
            const outputGateId = output.id || output;  // 互換性のため
            return internalResults[outputGateId] || false;
          });
        } else {
          // 単一出力の場合は従来通り
          const firstOutputPin = gate.outputs[0];
          if (firstOutputPin) {
            const outputGateId = firstOutputPin.id || firstOutputPin;
            newValue = internalResults[outputGateId] || false;
          }
        }
      } else {
        // 標準ゲートの処理
        switch (gate.type) {
          case 'AND':
            if (inputValues.length >= 2) {
              newValue = inputValues.every(v => v === true);
            }
            break;
          case 'OR':
            if (inputValues.length >= 1) {
              newValue = inputValues.some(v => v === true);
            }
            break;
          case 'NOT':
            if (inputValues.length >= 1) {
              newValue = !inputValues[0];
            }
            break;
          case 'NAND':
            if (inputValues.length >= 2) {
              newValue = !inputValues.every(v => v === true);
            }
            break;
          case 'NOR':
            if (inputValues.length >= 1) {
              newValue = !inputValues.some(v => v === true);
            }
            break;
          case 'XNOR':
            if (inputValues.length >= 2) {
              // XNOR: 両方同じ値の時true
              newValue = inputValues[0] === inputValues[1];
            }
            break;
          case 'OUTPUT':
            if (inputValues.length >= 1) {
              newValue = inputValues[0];
            }
            break;
        }
      }
      
      if (newValue !== undefined && simulationResults[gate.id] !== newValue) {
        simulationResults[gate.id] = newValue;
        changed = true;
      }
    });
  }
  
  // 未計算のゲートはfalseに
  gates.forEach(gate => {
    if (simulationResults[gate.id] === undefined) {
      simulationResults[gate.id] = false;
    }
  });

  // 初期化処理
  useEffect(() => {
    // ユーザー設定を読み込み
    const prefs = getUserPreferences();
    setPreferences(prefs);
    
    // カスタムゲートのマイグレーション
    migrateAllCustomGates();
    
    // カスタムゲートを読み込み
    const savedCustomGates = getCustomGates();
    setCustomGates(savedCustomGates);
    
    // URLパラメータから回路データを読み込み
    const params = new URLSearchParams(window.location.search);
    const circuitData = params.get('circuit');
    if (circuitData) {
      const decoded = decodeCircuitFromURL(circuitData);
      if (decoded) {
        setGates(decoded.gates);
        setConnections(decoded.connections);
        // URLパラメータをクリア
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // モードが選択されている場合
    if (prefs.mode) {
      setUserMode(prefs.mode);
      
      // 学習モードでチュートリアルが未完了の場合
      if (prefs.mode === 'learning' && prefs.showTutorialOnStartup) {
        const tutorialState = getTutorialState();
        if (!tutorialState.completed) {
          setShowTutorial(true);
        }
      }
    }
  }, []);
  
  // イベントリスナー
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ESCキーでツール選択解除
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawingWire(null);
        setDraggedGate(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ゲート描画
  const renderGate = (gate) => {
    const gateType = allGateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    const isDragging = draggedGate?.id === gate.id;
    
    return (
      <g key={gate.id} data-gate-id={gate.id} data-gate-type={gate.type} data-type={gate.type} data-active={isActive} transform={`translate(${gate.x}, ${gate.y})`}>
        {/* ホバー効果 */}
        {isHovered && !isDragging && (
          <>
            <circle
              cx={0}
              cy={0}
              r={GATE_SIZE/2 + 5}
              fill="none"
              stroke={theme.colors.ui.accent}
              strokeWidth="2"
              opacity="0.5"
              strokeDasharray="5,5"
            />
            {/* カスタムゲートの場合はヒントを表示 */}
            {gateType.isCustom && (
              <g>
                <rect
                  x={GATE_SIZE/2 + 15}
                  y={-10}
                  width={100}
                  height={20}
                  rx={10}
                  fill="rgba(0, 0, 0, 0.8)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                />
                <text
                  x={GATE_SIZE/2 + 65}
                  y={3}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.8)"
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
            deleteGate(gate.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            // ドラッグ中やドラッグ直後はクリックを無視
            if (!isDraggingGate) {
              if (gate.type === 'INPUT') {
                toggleInput(gate.id);
              }
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            // カスタムゲートの場合は詳細を表示
            if (gateType.isCustom) {
              setSelectedCustomGateDetail(gate.type);
            }
          }}
        >
          {gateType.icon(isActive)}
        </g>
        
        {/* 接続端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {/* カスタムゲートの場合は複数入力ピンを表示 */}
            {gateType.isCustom && gate.inputs ? (
              gate.inputs.map((input, index) => {
                const inputCount = gate.inputs.length;
                const spacing = Math.min(20, (GATE_SIZE - 10) / (inputCount + 1));
                const yOffset = -GATE_SIZE/2 + spacing * (index + 1);
                
                return (
                  <g key={`input-${index}`}>
                    <circle 
                      cx={-GATE_SIZE/2 - 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="4"
                      fill={theme.colors.signal.off} 
                      stroke="none"
                      style={{ cursor: 'crosshair' }}
                      data-terminal="input"
                      onMouseUp={() => completeWireConnection(gate.id, index)} 
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
              })
            ) : (
              // 標準ゲートの場合は従来通り
              (gate.type === 'AND' || gate.type === 'OR' || gate.type === 'NAND' || gate.type === 'NOR' || gate.type === 'XNOR') ? (
                <>
                  <circle cx={-GATE_SIZE/2 - 8} cy={-10} r="4"
                    fill={theme.colors.signal.off} 
                    stroke="none"
                    style={{ cursor: 'crosshair' }}
                    data-terminal="input"
                    onMouseUp={() => completeWireConnection(gate.id, 0)} />
                  <circle cx={-GATE_SIZE/2 - 8} cy={10} r="4"
                    fill={theme.colors.signal.off} 
                    stroke="none"
                    style={{ cursor: 'crosshair' }}
                    data-terminal="input"
                    onMouseUp={() => completeWireConnection(gate.id, 1)} />
                </>
              ) : (
                <circle cx={-GATE_SIZE/2 - 8} cy={0} r="4"
                  fill={theme.colors.signal.off} 
                  stroke="none"
                  style={{ cursor: 'crosshair' }}
                  data-terminal="input"
                  onMouseUp={() => completeWireConnection(gate.id, 0)} />
              )
            )}
          </>
        )}
        
        {gate.type !== 'OUTPUT' && (
          <>
            {/* カスタムゲートの場合は複数出力ピンを表示 */}
            {gateType.isCustom && gate.outputs ? (
              gate.outputs.map((output, index) => {
                const outputCount = gate.outputs.length;
                const spacing = Math.min(20, (GATE_SIZE - 10) / (outputCount + 1));
                const yOffset = -GATE_SIZE/2 + spacing * (index + 1);
                
                return (
                  <g key={`output-${index}`}>
                    <circle 
                      cx={GATE_SIZE/2 + 8} 
                      cy={yOffset + GATE_SIZE/2 - GATE_SIZE/2}
                      r="4"
                      fill={theme.colors.signal.off} 
                      stroke="none"
                      style={{ cursor: 'crosshair' }}
                      data-terminal="output"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startWireConnection(
                          gate.id, 
                          gate.x + GATE_SIZE/2 + 8, 
                          gate.y + yOffset + GATE_SIZE/2 - GATE_SIZE/2,
                          index // 出力インデックスを追加
                        );
                      }} 
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
              })
            ) : (
              // 標準ゲートの場合は従来通り
              <circle cx={GATE_SIZE/2 + 8} cy={0} r="4"
                fill={theme.colors.signal.off} 
                stroke="none"
                style={{ cursor: 'crosshair' }}
                data-terminal="output"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startWireConnection(gate.id, gate.x + GATE_SIZE/2 + 8, gate.y);
                }} />
            )}
          </>
        )}
      </g>
    );
  };

  // ワイヤー描画
  const renderWire = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const fromGateType = allGateTypes[fromGate.type];
    const toGateType = allGateTypes[toGate.type];
    
    // 出力ピンの位置を計算
    let startX = fromGate.x + GATE_SIZE/2 + 8;
    let startY = fromGate.y;
    
    if (fromGateType?.isCustom && fromGate.outputs) {
      const outputIndex = connection.fromOutput || 0;
      const outputCount = fromGate.outputs.length;
      const spacing = Math.min(20, (GATE_SIZE - 10) / (outputCount + 1));
      const yOffset = -GATE_SIZE/2 + spacing * (outputIndex + 1);
      startY = fromGate.y + yOffset;
    }
    
    // 入力ピンの位置を計算
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
    
    // シミュレーション結果を取得
    let isActive = false;
    const fromResult = simulationResults[connection.from];
    if (Array.isArray(fromResult)) {
      // 複数出力の場合
      isActive = fromResult[connection.fromOutput || 0] || false;
    } else {
      // 単一出力の場合
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
            setConnections(prev => prev.filter(c => c.id !== connection.id));
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setConnections(prev => prev.filter(c => c.id !== connection.id));
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

  // モード選択ハンドラー
  const handleModeSelected = (mode) => {
    setUserMode(mode);
    
    // 学習モードの場合はチュートリアルを開始
    if (mode === 'learning') {
      setShowTutorial(true);
    }
  };

  // 回路読み込みハンドラー
  const handleLoadCircuit = (circuitData) => {
    setGates(circuitData.gates || []);
    setConnections(circuitData.connections || []);
  };

  // モード未選択の場合はモード選択画面を表示
  if (!userMode) {
    return <ModeSelector onModeSelected={handleModeSelected} />;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: theme.colors.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
      position: 'relative',
      overflow: 'hidden'
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
          {/* テーマ選択 */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
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
            onClick={() => {
              // モード選択画面に戻る
              setUserMode(null);
              saveUserPreferences({ ...preferences, mode: null });
            }}
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
            onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => e.target.style.background = theme.colors.ui.buttonBg}
          >
            モード: {userMode === 'learning' ? '学習' : userMode === 'free' ? '自由制作' : '上級者'}
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
            onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => e.target.style.background = theme.colors.ui.buttonBg}
          >
            進捗
          </button>
          
          {/* デバッグモード時のみレベル2ボタンを表示 */}
          {debugMode && (
            <button
              onClick={() => {
                setShowChallenge(false);
                setShowExtendedChallenge(!showExtendedChallenge);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.ui.border}`,
                background: showExtendedChallenge ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg,
                color: theme.colors.ui.primary,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
              onMouseLeave={(e) => e.target.style.background = showExtendedChallenge ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg}
            >
              レベル2
            </button>
          )}
          
          <button
            onClick={() => setShowSaveLoad(!showSaveLoad)}
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
            onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => e.target.style.background = theme.colors.ui.buttonBg}
          >
            保存/読込
          </button>
          
          {/* カスタムゲートパネル切り替えボタン */}
          {Object.keys(customGates).length > 0 && (
            <button
              onClick={() => setShowCustomGatePanel(!showCustomGatePanel)}
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
                e.target.style.background = showCustomGatePanel ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 255, 136, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = showCustomGatePanel ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)';
              }}
            >
              🧩 カスタムゲート ({Object.keys(customGates).length})
            </button>
          )}
          
          {/* ゲート化ボタン（回路がある場合のみ表示） */}
          {gates.length > 0 && (
            <button
              onClick={() => {
                setShowGateDefinition(true);
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
                e.target.style.background = 'rgba(0, 255, 136, 0.2)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 255, 136, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📦 ゲート化
            </button>
          )}
          
          <button
            onClick={() => setShowHelp(!showHelp)}
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
            onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => e.target.style.background = theme.colors.ui.buttonBg}
          >
            ヘルプ
          </button>
          
          <button
            onClick={() => {
              setGates([]);
              setConnections([]);
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
            onMouseEnter={(e) => e.target.style.background = theme.colors.ui.buttonHover}
            onMouseLeave={(e) => e.target.style.background = theme.colors.ui.buttonBg}
          >
            クリア
          </button>
        </div>
      </header>

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
            // 上級者モードまたはデバッグモードでは全ゲート表示
            if (userMode === 'advanced' || debugMode) return true;
            // それ以外は基本ゲートのみ
            return !['NAND', 'NOR', 'XNOR'].includes(type);
          })
          .map(([type, config]) => (
          <button
            key={type}
            onClick={(e) => {
              e.stopPropagation();
              addGate(type);  // 即座に配置！
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
                e.target.style.background = theme.colors.ui.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== type) {
                e.target.style.background = theme.colors.ui.buttonBg;
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
                    e.target.style.background = theme.colors.ui.buttonHover;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = theme.colors.ui.buttonBg;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
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
                    e.target.style.background = '#00ff88';
                    e.target.style.color = '#000';
                    e.target.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.transform = 'scale(1)';
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
                  setShowCustomGatePanel(false);
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
                e.target.style.background = 'rgba(255, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 0, 0, 0.1)';
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
        height="calc(100% - 60px)"
        style={{
          background: theme.colors.canvas,
          cursor: selectedTool ? 'crosshair' : 'default',
        }}
        onClick={handleCanvasClick}
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
            onClick={() => setShowHelp(false)}
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
            setBadges([...badges, 'tutorial-complete']);
            
            // 学習モードの場合のみチャレンジを表示
            if (userMode === 'learning') {
              setShowChallenge(true);
            }
          }}
          onSkip={() => {
            setShowTutorial(false);
            // 学習モードでもスキップ時はチャレンジを表示しない
          }}
        />
      )}
      
      {/* チャレンジシステム */}
      {showChallenge && (
        <ChallengeSystem
          gates={gates}
          connections={connections}
          onComplete={(completedCount) => {
            setProgress(prev => ({ ...prev, challengesCompleted: completedCount }));
            if (completedCount === 1) {
              setBadges([...badges, 'challenge-1']);
            } else if (completedCount === 5) {
              setBadges([...badges, 'challenge-all']);
              // レベル1完了後、自動的にレベル2へ
              if (debugMode) {
                setShowChallenge(false);
                setShowExtendedChallenge(true);
              }
            }
          }}
        />
      )}
      
      {/* 拡張チャレンジシステム（レベル2） */}
      {showExtendedChallenge && (
        <ExtendedChallengeSystem
          gates={gates}
          connections={connections}
          debugMode={debugMode}
          onComplete={(completedCount) => {
            setProgress(prev => ({ ...prev, challengesCompleted: prev.challengesCompleted + completedCount }));
            if (completedCount === 1) {
              setBadges([...badges, 'level2-1']);
            } else if (completedCount === 8) {
              setBadges([...badges, 'level2-complete']);
            }
          }}
        />
      )}
      
      {/* 進捗トラッカー */}
      {showProgress && (
        <ProgressTracker
          progress={progress}
          badges={badges}
          onClose={() => setShowProgress(false)}
        />
      )}
      
      {/* 保存/読み込みパネル */}
      {showSaveLoad && (
        <SaveLoadPanel
          currentCircuit={{ gates, connections }}
          onLoad={handleLoadCircuit}
          onClose={() => setShowSaveLoad(false)}
        />
      )}
      
      {/* ゲート定義ダイアログ */}
      {showGateDefinition && (
        <GateDefinitionDialog
          gates={gates}
          connections={connections}
          onSave={(gateDefinition) => {
            // カスタムゲートを保存
            const success = saveCustomGate(gateDefinition);
            setShowGateDefinition(false);
            
            if (success) {
              // カスタムゲートを再読み込み
              const updatedCustomGates = getCustomGates();
              setCustomGates(updatedCustomGates);
              
              // 保存完了の通知
              alert(`カスタムゲート "${gateDefinition.name}" を保存しました！`);
            }
          }}
          onClose={() => setShowGateDefinition(false)}
        />
      )}
      
      {/* カスタムゲート詳細ダイアログ */}
      {selectedCustomGateDetail && (
        <CustomGateDetail
          gateName={selectedCustomGateDetail}
          onClose={() => setSelectedCustomGateDetail(null)}
        />
      )}
    </div>
  );
};

export default UltraModernCircuit;