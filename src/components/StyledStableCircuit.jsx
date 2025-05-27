import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { colors, typography, spacing, shadows, animations, borderRadius, components } from '../styles/design-system';

/**
 * デザインシステムを適用した安定版論理回路コンポーネント
 * - StableLogicCircuitの全機能を保持
 * - モダンなデザインシステムを適用
 * - 1クリックでゲート配置
 */
const StyledStableCircuit = () => {
  // 状態管理（StableLogicCircuitと同じ）
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedGateType, setSelectedGateType] = useState('INPUT');
  const [draggedWire, setDraggedWire] = useState(null);
  const [mode, setMode] = useState('place'); // 'place' | 'connect'
  const [hoveredGate, setHoveredGate] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [recentTools, setRecentTools] = useState(['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT']);
  
  const nextGateId = useRef(1);

  // ゲート移動時のコールバック
  const handleGateMove = useCallback((gateId, x, y) => {
    setGates(prev => prev.map(gate => 
      gate.id === gateId ? { ...gate, x, y } : gate
    ));
  }, []);

  // ドラッグ&ドロップフックの使用
  const {
    svgRef,
    draggedGate,
    mousePosition,
    handleGateMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDragAndDrop(handleGateMove);

  // 履歴管理
  const [history, setHistory] = useState([{ gates: [], connections: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [shouldSaveHistory, setShouldSaveHistory] = useState(false);

  // 履歴保存のuseEffect
  useEffect(() => {
    if (shouldSaveHistory) {
      const newState = { 
        gates: gates.map(g => ({ ...g })), 
        connections: connections.map(c => ({ ...c })) 
      };
      const newHistory = [...history.slice(0, historyIndex + 1), newState];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setShouldSaveHistory(false);
    }
  }, [gates, connections, shouldSaveHistory, history, historyIndex]);

  const saveHistory = useCallback(() => {
    setShouldSaveHistory(true);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setGates(prevState.gates.map(g => ({ ...g })));
      setConnections(prevState.connections.map(c => ({ ...c })));
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setGates(nextState.gates.map(g => ({ ...g })));
      setConnections(nextState.connections.map(c => ({ ...c })));
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // ゲートタイプの定義（デザインシステム対応）
  const gateTypeInfo = {
    INPUT: { name: '入力', icon: 'IN', shortcut: 'I', description: '0 or 1の値を設定' },
    OUTPUT: { name: '出力', icon: 'OUT', shortcut: 'O', description: '結果を表示' },
    AND: { name: 'ANDゲート', icon: '&', shortcut: 'A', description: '全ての入力が1の時1' },
    OR: { name: 'ORゲート', icon: '≥1', shortcut: 'R', description: 'いずれかが1の時1' },
    NOT: { name: 'NOTゲート', icon: '!', shortcut: 'N', description: '入力を反転' },
  };

  // ゲートの追加（1クリック配置対応）
  const addGate = useCallback((type) => {
    const centerX = svgRef.current ? svgRef.current.clientWidth / 2 : 400;
    const centerY = svgRef.current ? svgRef.current.clientHeight / 2 : 300;
    
    // 既存ゲートと重ならない位置を探す
    let x = centerX;
    let y = centerY;
    let offset = 0;
    
    while (gates.some(g => Math.abs(g.x - x) < 100 && Math.abs(g.y - y) < 80)) {
      offset += 50;
      x = centerX + (offset * Math.cos(offset / 30));
      y = centerY + (offset * Math.sin(offset / 30));
    }
    
    const newGate = {
      id: `gate_${nextGateId.current++}`,
      type,
      x: Math.round(x / 20) * 20,
      y: Math.round(y / 20) * 20,
      value: type === 'INPUT' ? false : null
    };
    
    setGates(prev => [...prev, newGate]);
    saveHistory();
    
    // 最近使用したツールを更新
    setRecentTools(prev => {
      const filtered = prev.filter(t => t !== type);
      return [type, ...filtered].slice(0, 5);
    });
  }, [gates, saveHistory]);

  // キャンバスクリック時の処理（配置モード時）
  const handleCanvasClick = useCallback((e) => {
    if (mode === 'place' && e.target === e.currentTarget) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 既存のゲートとの重複をチェック
      const isOverlapping = gates.some(gate => 
        Math.abs(gate.x - x) < 60 && Math.abs(gate.y - y) < 40
      );
      
      if (!isOverlapping) {
        const newGate = {
          id: `gate_${nextGateId.current++}`,
          type: selectedGateType,
          x: Math.round(x / 20) * 20,
          y: Math.round(y / 20) * 20,
          value: selectedGateType === 'INPUT' ? false : null
        };
        setGates(prev => [...prev, newGate]);
        saveHistory();
      }
    }
  }, [mode, selectedGateType, gates, saveHistory]);

  // ゲートの削除
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
    saveHistory();
  }, [saveHistory]);

  // 入力値の切り替え
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(g => 
      g.id === gateId ? { ...g, value: !g.value } : g
    ));
  }, []);

  // ワイヤー接続の開始
  const startWireConnection = useCallback((gateId, isOutput, outputIndex = 0) => {
    if (mode === 'connect') {
      setDraggedWire({
        fromGate: gateId,
        isOutput,
        outputIndex,
        toX: 0,
        toY: 0
      });
    }
  }, [mode]);

  // ワイヤー接続の完了
  const completeWireConnection = useCallback((toGateId, inputIndex = 0) => {
    if (draggedWire && draggedWire.fromGate !== toGateId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: draggedWire.fromGate,
        fromOutput: draggedWire.outputIndex,
        to: toGateId,
        toInput: inputIndex
      };
      
      // 重複チェック
      const exists = connections.some(c => 
        c.from === newConnection.from && 
        c.fromOutput === newConnection.fromOutput &&
        c.to === newConnection.to && 
        c.toInput === newConnection.toInput
      );
      
      if (!exists) {
        setConnections(prev => [...prev, newConnection]);
        saveHistory();
      }
    }
    setDraggedWire(null);
  }, [draggedWire, connections, saveHistory]);

  // シミュレーション
  const simulate = useCallback(() => {
    const results = {};
    
    // 入力ゲートの初期値
    gates.filter(g => g.type === 'INPUT').forEach(g => {
      results[g.id] = g.value;
    });
    
    // 反復的に計算
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      gates.forEach(gate => {
        if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
        
        const inputs = connections
          .filter(c => c.to === gate.id)
          .map(c => results[c.from])
          .filter(v => v !== undefined);
        
        if (gate.type === 'NOT' && inputs.length === 1) {
          results[gate.id] = !inputs[0];
          changed = true;
        } else if (gate.type === 'AND' && inputs.length >= 2) {
          results[gate.id] = inputs.every(v => v);
          changed = true;
        } else if (gate.type === 'OR' && inputs.length >= 2) {
          results[gate.id] = inputs.some(v => v);
          changed = true;
        } else if (gate.type === 'OUTPUT' && inputs.length >= 1) {
          results[gate.id] = inputs[0];
          changed = true;
        }
      });
    }
    
    return results;
  }, [gates, connections]);

  const simulationResults = simulate();

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      const key = e.key.toUpperCase();
      const gateType = Object.entries(gateTypeInfo).find(([_, info]) => info.shortcut === key)?.[0];
      
      if (gateType) {
        if (mode === 'place') {
          setSelectedGateType(gateType);
        } else {
          addGate(gateType);
        }
      } else if (e.key === 'Delete' && hoveredGate) {
        deleteGate(hoveredGate);
      } else if (e.key === 'Escape') {
        setDraggedWire(null);
      } else if (e.key === '?') {
        setShowHelp(!showHelp);
      } else if (e.key === 'c') {
        setMode('connect');
      } else if (e.key === 'p') {
        setMode('place');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addGate, deleteGate, hoveredGate, showHelp, mode, undo, redo]);

  // マウス移動の処理
  const handleSvgMouseMove = useCallback((e) => {
    handleMouseMove(e);
    
    if (draggedWire) {
      const rect = svgRef.current.getBoundingClientRect();
      setDraggedWire(prev => ({
        ...prev,
        toX: e.clientX - rect.left,
        toY: e.clientY - rect.top
      }));
    }
  }, [handleMouseMove, draggedWire]);

  // ゲートの描画
  const renderGate = (gate) => {
    const info = gateTypeInfo[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT'
      ? (isActive ? colors.gates[gate.type].active : colors.gates[gate.type].inactive)
      : colors.gates[gate.type].primary;
    
    const strokeColor = gate.type === 'INPUT' || gate.type === 'OUTPUT'
      ? colors.gates[gate.type].primary
      : colors.gates[gate.type].stroke;

    // 端子の位置計算
    const inputPins = gate.type === 'AND' || gate.type === 'OR' ? 2 : 
                      gate.type === 'NOT' || gate.type === 'OUTPUT' ? 1 : 0;
    const outputPins = gate.type !== 'OUTPUT' ? 1 : 0;

    return (
      <g key={gate.id}>
        {/* ホバー時のグロー */}
        {isHovered && !draggedGate && (
          <rect
            x={gate.x - components.gate.width/2}
            y={gate.y - components.gate.height/2}
            width={components.gate.width}
            height={components.gate.height}
            fill={fillColor}
            fillOpacity="0.3"
            rx={components.gate.borderRadius}
            style={{
              filter: 'blur(10px)',
              transform: 'scale(1.2)',
              transformOrigin: `${gate.x}px ${gate.y}px`
            }}
          />
        )}
        
        {/* ゲート本体 */}
        <rect
          x={gate.x - components.gate.width/2}
          y={gate.y - components.gate.height/2}
          width={components.gate.width}
          height={components.gate.height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={components.gate.borderWidth}
          rx={components.gate.borderRadius}
          className="gate-rect"
          style={{
            opacity: draggedGate?.id === gate.id ? 0.6 : 1,
            transform: isHovered && !draggedGate ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: `${gate.x}px ${gate.y}px`,
            transition: components.gate.transition,
            filter: isActive && gate.type !== 'INPUT' && gate.type !== 'OUTPUT' ? 'brightness(1.2)' : 'none',
            cursor: mode === 'place' ? 'move' : 'default'
          }}
          onMouseEnter={() => setHoveredGate(gate.id)}
          onMouseLeave={() => setHoveredGate(null)}
          onMouseDown={(e) => {
            if (mode === 'place' && e.button === 0) {
              e.stopPropagation();
              handleGateMouseDown(e, gate);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            deleteGate(gate.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (gate.type === 'INPUT') toggleInput(gate.id);
          }}
        />
        
        {/* ゲートアイコン */}
        <text
          x={gate.x}
          y={gate.y + 6}
          textAnchor="middle"
          fill="white"
          fontSize={components.gate.iconSize}
          fontWeight={typography.weights.bold}
          fontFamily={typography.fonts.sans}
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {info.icon}
        </text>
        
        {/* 入力端子 */}
        {Array.from({ length: inputPins }).map((_, index) => {
          const pinY = inputPins === 1 ? gate.y : 
                       gate.y - 15 + (index * 30);
          return (
            <circle
              key={`input-${index}`}
              cx={gate.x - components.gate.width/2}
              cy={pinY}
              r="8"
              fill={colors.primary[500]}
              stroke="white"
              strokeWidth="2"
              style={{ 
                cursor: mode === 'connect' ? 'pointer' : 'default',
                opacity: mode === 'connect' ? 1 : 0.7
              }}
              onMouseUp={() => {
                if (mode === 'connect' && draggedWire) {
                  completeWireConnection(gate.id, index);
                }
              }}
            />
          );
        })}
        
        {/* 出力端子 */}
        {Array.from({ length: outputPins }).map((_, index) => (
          <circle
            key={`output-${index}`}
            cx={gate.x + components.gate.width/2}
            cy={gate.y}
            r="8"
            fill={colors.secondary[500]}
            stroke="white"
            strokeWidth="2"
            style={{ 
              cursor: mode === 'connect' ? 'pointer' : 'default',
              opacity: mode === 'connect' ? 1 : 0.7
            }}
            onMouseDown={(e) => {
              if (mode === 'connect') {
                e.stopPropagation();
                startWireConnection(gate.id, true, index);
              }
            }}
          />
        ))}
      </g>
    );
  };

  // ワイヤーの描画
  const renderWire = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const startX = fromGate.x + components.gate.width/2;
    const startY = fromGate.y;
    
    const inputPins = toGate.type === 'AND' || toGate.type === 'OR' ? 2 : 1;
    const endX = toGate.x - components.gate.width/2;
    const endY = inputPins === 1 ? toGate.y : 
                 toGate.y - 15 + (connection.toInput * 30);
    
    const isActive = simulationResults[connection.from];
    const midX = (startX + endX) / 2;
    
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        {/* アクティブ時のグロー */}
        {isActive && (
          <path
            d={path}
            fill="none"
            stroke={colors.wire.active}
            strokeWidth={components.wire.strokeWidthActive + 4}
            opacity="0.3"
            style={{ filter: 'blur(4px)' }}
          />
        )}
        
        {/* ワイヤー本体 */}
        <path
          d={path}
          fill="none"
          stroke={isActive ? colors.wire.active : colors.wire.inactive}
          strokeWidth={isActive ? components.wire.strokeWidthActive : components.wire.strokeWidth}
          strokeLinecap="round"
          style={{
            transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
          }}
        />
        
        {/* 信号の流れアニメーション */}
        {isActive && (
          <circle r="4" fill={colors.wire.active}>
            <animateMotion
              dur="1s"
              repeatCount="indefinite"
              path={path}
            />
          </circle>
        )}
      </g>
    );
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: colors.background.canvas,
      fontFamily: typography.fonts.sans,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: colors.background.primary,
        boxShadow: shadows.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${spacing[6]}`,
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: typography.sizes['2xl'],
          fontWeight: typography.weights.bold,
          color: colors.gray[900],
          margin: 0
        }}>
          Logic Circuit Playground
        </h1>
        
        <div style={{ display: 'flex', gap: spacing[3] }}>
          {/* モード切り替えボタン */}
          <button
            onClick={() => setMode('place')}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: mode === 'place' ? colors.primary[500] : colors.gray[100],
              color: mode === 'place' ? 'white' : colors.gray[700],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              cursor: 'pointer',
              transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
            }}
          >
            配置モード (P)
          </button>
          
          <button
            onClick={() => setMode('connect')}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: mode === 'connect' ? colors.primary[500] : colors.gray[100],
              color: mode === 'connect' ? 'white' : colors.gray[700],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              cursor: 'pointer',
              transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
            }}
          >
            接続モード (C)
          </button>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.gray[100],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.gray[700],
              cursor: 'pointer',
              transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
            }}
          >
            ヘルプ (?)
          </button>
        </div>
      </header>
      
      {/* サイドバー（配置モード時のみ） */}
      {mode === 'place' && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '64px',
          bottom: 0,
          width: '200px',
          backgroundColor: colors.background.primary,
          boxShadow: shadows.sm,
          padding: spacing[4],
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            marginBottom: spacing[4],
            color: colors.gray[900]
          }}>
            ゲートを選択
          </h3>
          
          {Object.entries(gateTypeInfo).map(([type, info]) => (
            <button
              key={type}
              onClick={() => setSelectedGateType(type)}
              style={{
                width: '100%',
                padding: spacing[3],
                marginBottom: spacing[2],
                backgroundColor: selectedGateType === type ? colors.primary[100] : colors.gray[50],
                border: selectedGateType === type ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
            >
              <span style={{
                width: '40px',
                height: '40px',
                backgroundColor: colors.gates[type]?.primary || colors.primary[500],
                borderRadius: borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold
              }}>
                {info.icon}
              </span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: typography.weights.medium, color: colors.gray[900] }}>
                  {info.name}
                </div>
                <div style={{ fontSize: typography.sizes.xs, color: colors.gray[600] }}>
                  {info.description}
                </div>
              </div>
            </button>
          ))}
          
          <div style={{ marginTop: spacing[8] }}>
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              style={{
                width: '100%',
                padding: spacing[2],
                marginBottom: spacing[2],
                backgroundColor: historyIndex === 0 ? colors.gray[100] : colors.gray[200],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: historyIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: historyIndex === 0 ? 0.5 : 1
              }}
            >
              元に戻す (Ctrl+Z)
            </button>
            
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              style={{
                width: '100%',
                padding: spacing[2],
                backgroundColor: historyIndex >= history.length - 1 ? colors.gray[100] : colors.gray[200],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                opacity: historyIndex >= history.length - 1 ? 0.5 : 1
              }}
            >
              やり直す (Ctrl+Y)
            </button>
          </div>
        </div>
      )}
      
      {/* キャンバス */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: '64px',
          left: mode === 'place' ? '200px' : 0,
          right: 0,
          bottom: 0,
          cursor: mode === 'place' ? 'crosshair' : draggedWire ? 'crosshair' : 'default',
          backgroundColor: colors.background.canvas
        }}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={(e) => {
          handleMouseUp(e);
          if (draggedWire) {
            setDraggedWire(null);
          }
        }}
        onClick={handleCanvasClick}
      >
        {/* グリッド背景 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={colors.gray[300]} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* ワイヤー */}
        {connections.map(renderWire)}
        
        {/* 描画中のワイヤー */}
        {draggedWire && (
          <>
            <line
              x1={gates.find(g => g.id === draggedWire.fromGate)?.x + components.gate.width/2}
              y1={gates.find(g => g.id === draggedWire.fromGate)?.y}
              x2={draggedWire.toX}
              y2={draggedWire.toY}
              stroke={colors.wire.drawing}
              strokeWidth={components.wire.strokeWidth}
              strokeDasharray={components.wire.dashArray}
              pointerEvents="none"
            />
            <circle
              cx={draggedWire.toX}
              cy={draggedWire.toY}
              r="8"
              fill={colors.wire.drawing}
              fillOpacity="0.3"
              pointerEvents="none"
            />
          </>
        )}
        
        {/* ゲート */}
        {gates.map(renderGate)}
      </svg>
      
      {/* ツールバー（1クリック配置） */}
      <div style={{
        position: 'absolute',
        bottom: spacing[6],
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: components.toolbar.background,
        backdropFilter: components.toolbar.backdropFilter,
        borderRadius: components.toolbar.borderRadius,
        padding: components.toolbar.padding,
        boxShadow: components.toolbar.shadow,
        display: 'flex',
        gap: components.toolbar.gap,
        alignItems: 'center'
      }}>
        {recentTools.map((type) => {
          const info = gateTypeInfo[type];
          return (
            <button
              key={type}
              onClick={() => addGate(type)}
              style={{
                width: components.toolbar.button.size,
                height: components.toolbar.button.size,
                borderRadius: components.toolbar.button.borderRadius,
                border: 'none',
                backgroundColor: colors.gates[type]?.primary || colors.primary[500],
                color: 'white',
                fontSize: components.toolbar.button.iconSize,
                fontWeight: typography.weights.bold,
                cursor: 'pointer',
                transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
              title={`${info.name} (${info.shortcut})`}
            >
              {info.icon}
            </button>
          );
        })}
        
        <div style={{
          width: '1px',
          height: '32px',
          backgroundColor: colors.gray[300],
          margin: `0 ${spacing[2]}`
        }} />
        
        <button
          onClick={() => {
            setGates([]);
            setConnections([]);
            saveHistory();
          }}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.gray[300]}`,
            backgroundColor: 'white',
            color: colors.gray[700],
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            cursor: 'pointer',
            transition: `all ${animations.durations.fast} ${animations.easings.easeOut}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.gray[50];
            e.target.style.borderColor = colors.gray[400];
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = colors.gray[300];
          }}
        >
          クリア
        </button>
      </div>
      
      {/* ヘルプパネル */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: spacing[6],
          width: components.panel.width,
          backgroundColor: components.panel.background,
          borderRadius: components.panel.borderRadius,
          padding: components.panel.padding,
          boxShadow: components.panel.shadow,
        }}>
          <h2 style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            marginBottom: spacing[4],
            color: colors.gray[900]
          }}>
            ショートカット
          </h2>
          
          <div style={{ marginBottom: spacing[4] }}>
            <h3 style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing[2] }}>
              ゲート配置
            </h3>
            {Object.entries(gateTypeInfo).map(([type, info]) => (
              <div key={type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing[1],
                padding: spacing[2],
                backgroundColor: colors.gray[50],
                borderRadius: borderRadius.md
              }}>
                <span>{info.name}</span>
                <kbd style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  backgroundColor: colors.gray[200],
                  borderRadius: borderRadius.sm,
                  fontFamily: typography.fonts.mono,
                  fontSize: typography.sizes.sm
                }}>
                  {info.shortcut}
                </kbd>
              </div>
            ))}
          </div>
          
          <div style={{ color: colors.gray[600], fontSize: typography.sizes.sm }}>
            <h3 style={{ fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing[2] }}>
              操作方法
            </h3>
            <p>• P: 配置モード</p>
            <p>• C: 接続モード</p>
            <p>• 左クリック: {mode === 'place' ? 'ゲートを配置' : '端子を接続'}</p>
            <p>• ドラッグ: ゲートを移動（配置モード）</p>
            <p>• 右クリック: ゲートを削除</p>
            <p>• INPUTクリック: 値を切り替え</p>
            <p>• Delete: 選択中のゲートを削除</p>
            <p>• Esc: 操作をキャンセル</p>
            <p>• Ctrl+Z: 元に戻す</p>
            <p>• Ctrl+Y: やり直す</p>
          </div>
        </div>
      )}
      
      {/* モードインジケーター */}
      <div style={{
        position: 'absolute',
        bottom: spacing[6],
        left: spacing[6],
        padding: `${spacing[2]} ${spacing[4]}`,
        backgroundColor: mode === 'place' ? colors.primary[100] : colors.secondary[100],
        color: mode === 'place' ? colors.primary[700] : colors.secondary[700],
        borderRadius: borderRadius.lg,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        boxShadow: shadows.sm
      }}>
        {mode === 'place' ? '配置モード' : '接続モード'}
        {mode === 'place' && selectedGateType && ` - ${gateTypeInfo[selectedGateType].name}`}
      </div>
    </div>
  );
};

export default StyledStableCircuit;