import React, { useState, useRef, useCallback, useEffect } from 'react';
import { colors, typography, spacing, shadows, animations, borderRadius, components } from '../styles/design-system';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

const gateTypes = {
  INPUT: { 
    name: '入力', 
    icon: 'IN', 
    shortcut: 'I',
    description: '0 or 1の値を設定'
  },
  OUTPUT: { 
    name: '出力', 
    icon: 'OUT', 
    shortcut: 'O',
    description: '結果を表示'
  },
  AND: { 
    name: 'ANDゲート', 
    icon: '&', 
    shortcut: 'A',
    description: '全ての入力が1の時1'
  },
  OR: { 
    name: 'ORゲート', 
    icon: '≥1', 
    shortcut: 'R',
    description: 'いずれかが1の時1'
  },
  NOT: { 
    name: 'NOTゲート', 
    icon: '!', 
    shortcut: 'N',
    description: '入力を反転'
  },
};

const ModernLogicCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedGate, setSelectedGate] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [drawingWire, setDrawingWire] = useState(null);
  const [recentTools, setRecentTools] = useState(['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT']);
  const [showHelp, setShowHelp] = useState(false);
  
  const nextGateId = useRef(1);
  
  // カスタムフックでドラッグ機能を実装
  const handleGateMove = useCallback((gateId, newX, newY) => {
    setGates(prev => prev.map(g => 
      g.id === gateId ? { ...g, x: newX, y: newY } : g
    ));
  }, []);
  
  const {
    svgRef,
    draggedGate,
    mousePosition,
    handleGateMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDragAndDrop(handleGateMove);
  
  // ゲートの追加
  const addGate = useCallback((type) => {
    const centerX = svgRef.current.clientWidth / 2;
    const centerY = svgRef.current.clientHeight / 2;
    
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
    
    // 最近使用したツールを更新
    setRecentTools(prev => {
      const filtered = prev.filter(t => t !== type);
      return [type, ...filtered].slice(0, 5);
    });
  }, [gates]);
  
  // ゲートの削除
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
    setSelectedGate(null);
  }, []);
  
  // 入力値の切り替え
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(g => 
      g.id === gateId ? { ...g, value: !g.value } : g
    ));
  }, []);
  
  // ワイヤー描画の開始
  const startDrawingWire = useCallback((gateId, x, y) => {
    setDrawingWire({ from: gateId, startX: x, startY: y, endX: x, endY: y });
  }, []);
  
  // ワイヤー描画の更新
  const updateDrawingWire = useCallback((x, y) => {
    if (drawingWire) {
      setDrawingWire(prev => ({ ...prev, endX: x, endY: y }));
    }
  }, [drawingWire]);
  
  // ワイヤー描画の完了
  const completeDrawingWire = useCallback((toGateId) => {
    if (drawingWire && toGateId && drawingWire.from !== toGateId) {
      const exists = connections.some(c => 
        c.from === drawingWire.from && c.to === toGateId
      );
      
      if (!exists) {
        setConnections(prev => [...prev, {
          id: `conn_${Date.now()}`,
          from: drawingWire.from,
          to: toGateId
        }]);
      }
    }
    setDrawingWire(null);
  }, [drawingWire, connections]);
  
  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      const key = e.key.toUpperCase();
      const gateType = Object.entries(gateTypes).find(([_, info]) => info.shortcut === key)?.[0];
      
      if (gateType) {
        addGate(gateType);
      } else if (e.key === 'Delete' && selectedGate) {
        deleteGate(selectedGate);
      } else if (e.key === 'Escape') {
        setSelectedGate(null);
        setDrawingWire(null);
      } else if (e.key === '?') {
        setShowHelp(!showHelp);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addGate, deleteGate, selectedGate, showHelp]);
  
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
  
  // ゲートの描画
  const renderGate = (gate) => {
    const gateInfo = gateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isSelected = selectedGate === gate.id;
    const isHovered = hoveredGate === gate.id;
    
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT'
      ? (isActive ? colors.gates[gate.type].active : colors.gates[gate.type].inactive)
      : colors.gates[gate.type].primary;
    
    const strokeColor = gate.type === 'INPUT' || gate.type === 'OUTPUT'
      ? colors.gates[gate.type].primary
      : colors.gates[gate.type].stroke;
    
    return (
      <g key={gate.id} style={{ cursor: 'pointer' }}>
        {/* 選択時のアウトライン */}
        {isSelected && (
          <rect
            x={gate.x - components.gate.width/2 - 5}
            y={gate.y - components.gate.height/2 - 5}
            width={components.gate.width + 10}
            height={components.gate.height + 10}
            fill="none"
            stroke={colors.primary[500]}
            strokeWidth="2"
            strokeDasharray="5,5"
            rx={components.gate.borderRadius}
            style={{
              animation: 'dash 20s linear infinite'
            }}
          />
        )}
        
        {/* ホバー時のグロー効果 */}
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
            filter: isActive ? 'brightness(1.2)' : 'none',
          }}
          onMouseEnter={() => setHoveredGate(gate.id)}
          onMouseLeave={() => setHoveredGate(null)}
          onMouseDown={(e) => {
            if (e.button === 0) {
              e.stopPropagation();
              handleGateMouseDown(e, gate);
              setSelectedGate(gate.id);
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
          {gateInfo.icon}
        </text>
        
        {/* 接続ポイント */}
        {gate.type !== 'INPUT' && (
          <circle
            cx={gate.x - components.gate.width/2}
            cy={gate.y}
            r="8"
            fill={colors.primary[500]}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startDrawingWire(gate.id, gate.x - components.gate.width/2, gate.y);
            }}
          />
        )}
        
        {gate.type !== 'OUTPUT' && (
          <circle
            cx={gate.x + components.gate.width/2}
            cy={gate.y}
            r="8"
            fill={colors.secondary[500]}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseUp={() => completeDrawingWire(gate.id)}
            onMouseEnter={() => {
              if (drawingWire) {
                updateDrawingWire(gate.x + components.gate.width/2, gate.y);
              }
            }}
          />
        )}
        
        {/* ゲート名（ホバー時） */}
        {isHovered && (
          <text
            x={gate.x}
            y={gate.y + components.gate.height/2 + 20}
            textAnchor="middle"
            fill={colors.gray[600]}
            fontSize={typography.sizes.sm}
            fontFamily={typography.fonts.sans}
            style={{ opacity: 0.8 }}
          >
            {gateInfo.name}
          </text>
        )}
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
    const endX = toGate.x - components.gate.width/2;
    const endY = toGate.y;
    
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colors.gray[100];
          }}
        >
          ヘルプ (?)
        </button>
      </header>
      
      {/* キャンバス */}
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: drawingWire ? 'crosshair' : 'default'
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (drawingWire) {
            const rect = svgRef.current.getBoundingClientRect();
            updateDrawingWire(e.clientX - rect.left, e.clientY - rect.top);
          }
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          if (drawingWire) {
            setDrawingWire(null);
          }
        }}
        onClick={() => setSelectedGate(null)}
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
        {drawingWire && (
          <line
            x1={drawingWire.startX}
            y1={drawingWire.startY}
            x2={drawingWire.endX}
            y2={drawingWire.endY}
            stroke={colors.wire.drawing}
            strokeWidth={components.wire.strokeWidth}
            strokeDasharray={components.wire.dashArray}
            pointerEvents="none"
          />
        )}
        
        {/* ゲート */}
        {gates.map(renderGate)}
      </svg>
      
      {/* ツールバー */}
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
          const info = gateTypes[type];
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
            setSelectedGate(null);
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
          
          {Object.entries(gateTypes).map(([type, info]) => (
            <div key={type} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: spacing[2],
              padding: spacing[2],
              backgroundColor: colors.gray[50],
              borderRadius: borderRadius.md
            }}>
              <span style={{ fontWeight: typography.weights.medium }}>{info.name}</span>
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
          
          <div style={{ marginTop: spacing[4], color: colors.gray[600], fontSize: typography.sizes.sm }}>
            <p>• 左クリック: ゲートを選択・移動</p>
            <p>• 右クリック: ゲートを削除</p>
            <p>• INPUTをクリック: 値を切り替え</p>
            <p>• Delete: 選択中のゲートを削除</p>
            <p>• Esc: 選択を解除</p>
          </div>
        </div>
      )}
      
      {/* スタイル定義 */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernLogicCircuit;