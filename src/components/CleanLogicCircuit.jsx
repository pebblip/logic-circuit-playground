import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * クリーンで洗練されたデザインの論理回路コンポーネント
 * Material Design と Figma のデザイン哲学を参考に
 */
const CleanLogicCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [drawingWire, setDrawingWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);

  // デザインシステム
  const design = {
    colors: {
      // 基本カラー（モノクローム）
      background: '#FFFFFF',
      canvas: '#FAFBFC',
      grid: '#F0F2F5',
      
      // ゲート
      gateFill: '#FFFFFF',
      gateStroke: '#2D3748',
      gateText: '#1A202C',
      gateShadow: '0 1px 3px rgba(0,0,0,0.12)',
      
      // 信号
      signalOff: '#CBD5E0',
      signalOn: '#3182CE',
      signalFlow: '#63B3ED',
      
      // UI
      textPrimary: '#2D3748',
      textSecondary: '#718096',
      border: '#E2E8F0',
      hover: '#EDF2F7',
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      sizes: {
        xs: '11px',
        sm: '13px',
        base: '14px',
        lg: '16px',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
      }
    }
  };

  // ゲートタイプ定義（洗練されたSVGアイコン）
  const gateTypes = {
    INPUT: { 
      name: 'Input',
      renderIcon: (x, y, isActive) => (
        <g>
          <circle cx={x} cy={y} r="16" fill={isActive ? design.colors.signalOn : design.colors.gateFill} 
                  stroke={design.colors.gateStroke} strokeWidth="1.5"/>
          <path d={`M ${x-8} ${y} L ${x+4} ${y} M ${x} ${y-4} L ${x+4} ${y} L ${x} ${y+4}`} 
                stroke={design.colors.gateText} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      )
    },
    OUTPUT: { 
      name: 'Output',
      renderIcon: (x, y, isActive) => (
        <g>
          <circle cx={x} cy={y} r="16" fill={isActive ? design.colors.signalOn : design.colors.gateFill} 
                  stroke={design.colors.gateStroke} strokeWidth="1.5"/>
          <path d={`M ${x+8} ${y} L ${x-4} ${y} M ${x} ${y-4} L ${x-4} ${y} L ${x} ${y+4}`} 
                stroke={design.colors.gateText} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      )
    },
    AND: { 
      name: 'AND',
      renderIcon: (x, y, isActive) => (
        <g>
          <path d={`M ${x-20} ${y-15} L ${x-20} ${y+15} L ${x} ${y+15} Q ${x+20} ${y+15} ${x+20} ${y} Q ${x+20} ${y-15} ${x} ${y-15} Z`}
                fill={design.colors.gateFill} stroke={design.colors.gateStroke} strokeWidth="1.5"/>
          <text x={x} y={y+4} textAnchor="middle" fill={design.colors.gateText} 
                fontSize={design.typography.sizes.sm} fontWeight={design.typography.weights.medium}>
            AND
          </text>
        </g>
      )
    },
    OR: { 
      name: 'OR',
      renderIcon: (x, y, isActive) => (
        <g>
          <path d={`M ${x-20} ${y-15} Q ${x-10} ${y} ${x-20} ${y+15} L ${x+5} ${y+15} Q ${x+20} ${y} ${x+5} ${y-15} Z`}
                fill={design.colors.gateFill} stroke={design.colors.gateStroke} strokeWidth="1.5"/>
          <text x={x} y={y+4} textAnchor="middle" fill={design.colors.gateText} 
                fontSize={design.typography.sizes.sm} fontWeight={design.typography.weights.medium}>
            OR
          </text>
        </g>
      )
    },
    NOT: { 
      name: 'NOT',
      renderIcon: (x, y, isActive) => (
        <g>
          <path d={`M ${x-20} ${y-15} L ${x-20} ${y+15} L ${x+10} ${y} Z`}
                fill={design.colors.gateFill} stroke={design.colors.gateStroke} strokeWidth="1.5"/>
          <circle cx={x+15} cy={y} r="5" fill={design.colors.gateFill} 
                  stroke={design.colors.gateStroke} strokeWidth="1.5"/>
        </g>
      )
    },
  };

  // ゲート追加
  const addGate = useCallback((type) => {
    const centerX = svgRef.current ? svgRef.current.clientWidth / 2 : 400;
    const centerY = svgRef.current ? svgRef.current.clientHeight / 2 : 300;
    
    let x = centerX;
    let y = centerY;
    let offset = 0;
    
    while (gates.some(g => Math.abs(g.x - x) < 80 && Math.abs(g.y - y) < 60)) {
      offset += 60;
      x = centerX + (offset * Math.cos(offset / 40));
      y = centerY + (offset * Math.sin(offset / 40));
    }
    
    const newGate = {
      id: `gate_${nextGateId.current++}`,
      type,
      x: Math.round(x / 10) * 10,
      y: Math.round(y / 10) * 10,
      value: type === 'INPUT' ? false : null
    };
    
    setGates(prev => [...prev, newGate]);
  }, [gates]);

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
  }, []);

  // ドラッグ開始
  const handleGateMouseDown = useCallback((e, gate) => {
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();
    setDraggedGate(gate);
    setDragOffset({
      x: e.clientX - rect.left - gate.x,
      y: e.clientY - rect.top - gate.y
    });
  }, []);

  // マウス移動
  const handleMouseMove = useCallback((e) => {
    if (draggedGate && dragOffset) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 10) * 10;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 10) * 10;
      
      setGates(prev => prev.map(g => 
        g.id === draggedGate.id ? { ...g, x: newX, y: newY } : g
      ));
    }
    
    if (drawingWire) {
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
    setDraggedGate(null);
    setDragOffset(null);
    if (drawingWire) {
      setDrawingWire(null);
    }
  }, [drawingWire]);

  // ワイヤー接続開始
  const startWireConnection = useCallback((gateId, x, y) => {
    setDrawingWire({
      from: gateId,
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  }, []);

  // ワイヤー接続完了
  const completeWireConnection = useCallback((toGateId, inputIndex = 0) => {
    if (drawingWire && toGateId && drawingWire.from !== toGateId) {
      const exists = connections.some(c => 
        c.from === drawingWire.from && c.to === toGateId && c.toInput === inputIndex
      );
      
      if (!exists) {
        setConnections(prev => [...prev, {
          id: `conn_${Date.now()}`,
          from: drawingWire.from,
          to: toGateId,
          toInput: inputIndex
        }]);
      }
    }
    setDrawingWire(null);
  }, [drawingWire, connections]);

  // シミュレーション
  const simulate = useCallback(() => {
    const results = {};
    
    gates.filter(g => g.type === 'INPUT').forEach(g => {
      results[g.id] = g.value;
    });
    
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      gates.forEach(gate => {
        if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
        
        const inputs = connections
          .filter(c => c.to === gate.id)
          .sort((a, b) => (a.toInput || 0) - (b.toInput || 0))
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
      
      const shortcuts = {
        'i': 'INPUT',
        'o': 'OUTPUT',
        'a': 'AND',
        'r': 'OR',
        'n': 'NOT',
      };
      
      const type = shortcuts[e.key.toLowerCase()];
      if (type) {
        addGate(type);
      } else if (e.key === 'Delete' && hoveredGate) {
        deleteGate(hoveredGate);
      } else if (e.key === '?') {
        setShowHelp(!showHelp);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addGate, deleteGate, hoveredGate, showHelp]);

  // ゲート描画
  const renderGate = (gate) => {
    const gateType = gateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    const isDragging = draggedGate?.id === gate.id;
    
    return (
      <g key={gate.id}>
        {/* ホバー効果 */}
        {isHovered && !isDragging && (
          <rect
            x={gate.x - 35}
            y={gate.y - 25}
            width="70"
            height="50"
            fill={design.colors.hover}
            rx="8"
            opacity="0.5"
          />
        )}
        
        {/* ゲートアイコン */}
        <g style={{
            opacity: isDragging ? 0.7 : 1,
            cursor: 'move',
            filter: `drop-shadow(${design.colors.gateShadow})`,
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
            if (gate.type === 'INPUT') toggleInput(gate.id);
          }}
        >
          {gateType.renderIcon(gate.x, gate.y, isActive)}
        </g>
        
        {/* 接続端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {(gate.type === 'AND' || gate.type === 'OR') ? (
              <>
                <circle cx={gate.x - 30} cy={gate.y - 8} r="4"
                  fill={design.colors.signalOff} style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 0)} />
                <circle cx={gate.x - 30} cy={gate.y + 8} r="4"
                  fill={design.colors.signalOff} style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 1)} />
              </>
            ) : (
              <circle cx={gate.x - 30} cy={gate.y} r="4"
                fill={design.colors.signalOff} style={{ cursor: 'crosshair' }}
                onMouseUp={() => completeWireConnection(gate.id, 0)} />
            )}
          </>
        )}
        
        {gate.type !== 'OUTPUT' && (
          <circle cx={gate.x + 30} cy={gate.y} r="4"
            fill={design.colors.signalOff} style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startWireConnection(gate.id, gate.x + 30, gate.y);
            }} />
        )}
      </g>
    );
  };

  // ワイヤー描画
  const renderWire = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const startX = fromGate.x + 30;
    const startY = fromGate.y;
    const endX = toGate.x - 30;
    
    let endY = toGate.y;
    if (toGate.type === 'AND' || toGate.type === 'OR') {
      endY = connection.toInput === 0 ? toGate.y - 8 : toGate.y + 8;
    }
    
    const isActive = simulationResults[connection.from];
    const midX = (startX + endX) / 2;
    
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        <path
          d={path}
          fill="none"
          stroke={isActive ? design.colors.signalOn : design.colors.signalOff}
          strokeWidth={isActive ? "2" : "1.5"}
          strokeLinecap="round"
        />
        
        {isActive && (
          <circle r="3" fill={design.colors.signalFlow}>
            <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </g>
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: design.colors.background,
      fontFamily: design.typography.fontFamily,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <header style={{
        height: '48px',
        backgroundColor: design.colors.background,
        borderBottom: `1px solid ${design.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${design.spacing.lg}px`,
      }}>
        <h1 style={{
          fontSize: design.typography.sizes.lg,
          fontWeight: design.typography.weights.semibold,
          color: design.colors.textPrimary,
          margin: 0
        }}>
          Logic Circuit Playground
        </h1>
        
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            padding: `${design.spacing.xs}px ${design.spacing.sm}px`,
            backgroundColor: 'transparent',
            border: `1px solid ${design.colors.border}`,
            borderRadius: '6px',
            fontSize: design.typography.sizes.sm,
            color: design.colors.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 6C6 5.5 6.5 4.5 8 4.5C9.5 4.5 10 5.5 10 6C10 7 9 7.5 8 7.5V9" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.5" fill="currentColor"/>
          </svg>
          Help
        </button>
      </header>

      {/* キャンバス */}
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: 'calc(100% - 112px)',
          backgroundColor: design.colors.canvas,
          cursor: drawingWire ? 'crosshair' : 'default'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill={design.colors.grid} />
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
            stroke={design.colors.signalOff}
            strokeWidth="1.5"
            strokeDasharray="4,4"
            pointerEvents="none"
          />
        )}
        
        {/* ゲート */}
        {gates.map(renderGate)}
      </svg>

      {/* ツールバー */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: design.colors.background,
        borderTop: `1px solid ${design.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: design.spacing.sm + 'px',
        padding: `0 ${design.spacing.lg}px`,
      }}>
        {Object.entries(gateTypes).map(([type, info]) => (
          <button
            key={type}
            onClick={() => addGate(type)}
            style={{
              width: '48px',
              height: '40px',
              backgroundColor: design.colors.background,
              border: `1px solid ${design.colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = design.colors.hover;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = design.colors.background;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title={`${info.name} (${type.charAt(0)})`}
          >
            <div style={{ width: '24px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {type}
            </div>
            <span style={{
              fontSize: design.typography.sizes.xs,
              color: design.colors.textSecondary,
              fontWeight: design.typography.weights.medium
            }}>
              {type}
            </span>
          </button>
        ))}
        
        <div style={{
          width: '1px',
          height: '32px',
          backgroundColor: design.colors.border,
          margin: `0 ${design.spacing.sm}px`
        }} />
        
        <button
          onClick={() => {
            setGates([]);
            setConnections([]);
          }}
          style={{
            padding: `${design.spacing.xs}px ${design.spacing.md}px`,
            backgroundColor: design.colors.background,
            border: `1px solid ${design.colors.border}`,
            borderRadius: '6px',
            fontSize: design.typography.sizes.sm,
            color: design.colors.textSecondary,
            cursor: 'pointer',
            fontWeight: design.typography.weights.medium
          }}
        >
          Clear
        </button>
      </div>

      {/* ヘルプ */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: design.spacing.lg + 'px',
          width: '280px',
          backgroundColor: design.colors.background,
          border: `1px solid ${design.colors.border}`,
          borderRadius: '8px',
          padding: design.spacing.lg + 'px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: design.typography.sizes.base,
            fontWeight: design.typography.weights.semibold,
            marginBottom: design.spacing.md + 'px',
            color: design.colors.textPrimary
          }}>
            Keyboard Shortcuts
          </h3>
          
          <div style={{ fontSize: design.typography.sizes.sm, color: design.colors.textSecondary }}>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>I</kbd> Add Input
            </div>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>O</kbd> Add Output
            </div>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>A</kbd> Add AND Gate
            </div>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>R</kbd> Add OR Gate
            </div>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>N</kbd> Add NOT Gate
            </div>
            <div style={{ marginBottom: design.spacing.sm + 'px' }}>
              <kbd style={{ backgroundColor: design.colors.hover, padding: '2px 6px', borderRadius: '4px' }}>Delete</kbd> Remove hovered gate
            </div>
            
            <div style={{ marginTop: design.spacing.md + 'px', paddingTop: design.spacing.md + 'px', borderTop: `1px solid ${design.colors.border}` }}>
              <strong>Mouse:</strong><br/>
              • Click input to toggle value<br/>
              • Drag gates to move<br/>
              • Right-click to delete<br/>
              • Drag from output to input pins
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanLogicCircuit;