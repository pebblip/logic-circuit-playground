import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * プロフェッショナルで洗練された論理回路コンポーネント
 * - 日本語UI
 * - 適切なアイコンデザイン
 * - 十分な余白
 * - 視認性の高いデザイン
 */
const ProfessionalCircuit = () => {
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
      // 基本カラー
      background: '#FFFFFF',
      canvas: '#FAFBFC',
      grid: '#E8EAED',
      
      // ゲート
      gate: {
        fill: '#FFFFFF',
        stroke: '#5F6368',
        text: '#202124',
        shadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      
      // 信号状態
      signal: {
        off: '#DADCE0',
        on: '#1A73E8',
        flow: '#4285F4',
      },
      
      // UI
      ui: {
        primary: '#202124',
        secondary: '#5F6368',
        border: '#DADCE0',
        hover: '#F1F3F4',
      }
    }
  };

  // ゲートタイプ定義
  const gateTypes = {
    INPUT: { 
      name: '入力',
      icon: '▶',
      width: 60,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <circle cx={0} cy={0} r="25" 
            fill={isActive ? design.colors.signal.on : design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
            filter={`drop-shadow(${design.colors.gate.shadow})`}
          />
          <text x={0} y={6} textAnchor="middle" 
            fill={isActive ? '#FFFFFF' : design.colors.gate.text}
            fontSize="24" fontWeight="500">
            ▶
          </text>
        </g>
      )
    },
    OUTPUT: { 
      name: '出力',
      icon: '■',
      width: 60,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <circle cx={0} cy={0} r="25" 
            fill={isActive ? design.colors.signal.on : design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
            filter={`drop-shadow(${design.colors.gate.shadow})`}
          />
          <text x={0} y={6} textAnchor="middle" 
            fill={isActive ? '#FFFFFF' : design.colors.gate.text}
            fontSize="20" fontWeight="500">
            ■
          </text>
        </g>
      )
    },
    AND: { 
      name: 'AND',
      icon: '&',
      width: 100,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <path d={`M ${-40} ${-25} L ${-40} ${25} L ${20} ${25} Q ${40} ${25} ${40} ${0} Q ${40} ${-25} ${20} ${-25} Z`}
            fill={design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
            filter={`drop-shadow(${design.colors.gate.shadow})`}
          />
          <text x={0} y={6} textAnchor="middle" 
            fill={design.colors.gate.text}
            fontSize="18" fontWeight="600" letterSpacing="0.1em">
            AND
          </text>
        </g>
      )
    },
    OR: { 
      name: 'OR',
      icon: '≥1',
      width: 100,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <path d={`M ${-40} ${-25} Q ${-25} ${0} ${-40} ${25} L ${20} ${25} Q ${40} ${0} ${20} ${-25} Z`}
            fill={design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
            filter={`drop-shadow(${design.colors.gate.shadow})`}
          />
          <text x={0} y={6} textAnchor="middle" 
            fill={design.colors.gate.text}
            fontSize="18" fontWeight="600" letterSpacing="0.1em">
            OR
          </text>
        </g>
      )
    },
    NOT: { 
      name: 'NOT',
      icon: '¬',
      width: 80,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <path d={`M ${-30} ${-25} L ${-30} ${25} L ${15} ${0} Z`}
            fill={design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
            filter={`drop-shadow(${design.colors.gate.shadow})`}
          />
          <circle cx={22} cy={0} r="7" 
            fill={design.colors.gate.fill} 
            stroke={design.colors.gate.stroke} 
            strokeWidth="2"
          />
          <text x={-7} y={5} textAnchor="middle" 
            fill={design.colors.gate.text}
            fontSize="16" fontWeight="600">
            NOT
          </text>
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
    
    while (gates.some(g => Math.abs(g.x - x) < 120 && Math.abs(g.y - y) < 80)) {
      offset += 80;
      x = centerX + (offset * Math.cos(offset / 50));
      y = centerY + (offset * Math.sin(offset / 50));
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
      <g key={gate.id} data-gate-id={gate.id} data-type={gate.type} data-active={isActive} transform={`translate(${gate.x}, ${gate.y})`}>
        {/* ホバー効果 */}
        {isHovered && !isDragging && (
          <rect
            x={-gateType.width/2 - 10}
            y={-gateType.height/2 - 10}
            width={gateType.width + 20}
            height={gateType.height + 20}
            fill={design.colors.ui.hover}
            rx="12"
            opacity="0.6"
          />
        )}
        
        {/* ゲート本体 */}
        <g style={{
            opacity: isDragging ? 0.7 : 1,
            cursor: 'move',
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
          {gateType.renderGate(0, 0, isActive)}
        </g>
        
        {/* 接続端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {(gate.type === 'AND' || gate.type === 'OR') ? (
              <>
                <circle cx={-gateType.width/2 - 5} cy={-12} r="5" data-terminal="input"
                  fill={design.colors.signal.off} 
                  stroke={design.colors.gate.stroke}
                  strokeWidth="1.5"
                  style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 0)} />
                <circle cx={-gateType.width/2 - 5} cy={12} r="5" data-terminal="input"
                  fill={design.colors.signal.off} 
                  stroke={design.colors.gate.stroke}
                  strokeWidth="1.5"
                  style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 1)} />
              </>
            ) : (
              <circle cx={-gateType.width/2 - 5} cy={0} r="5" data-terminal="input"
                fill={design.colors.signal.off} 
                stroke={design.colors.gate.stroke}
                strokeWidth="1.5"
                style={{ cursor: 'crosshair' }}
                onMouseUp={() => completeWireConnection(gate.id, 0)} />
            )}
          </>
        )}
        
        {gate.type !== 'OUTPUT' && (
          <circle cx={gateType.width/2 + 5} cy={0} r="5" data-terminal="output"
            fill={design.colors.signal.off} 
            stroke={design.colors.gate.stroke}
            strokeWidth="1.5"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startWireConnection(gate.id, gate.x + gateType.width/2 + 5, gate.y);
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
    
    const fromType = gateTypes[fromGate.type];
    const toType = gateTypes[toGate.type];
    
    const startX = fromGate.x + fromType.width/2 + 5;
    const startY = fromGate.y;
    const endX = toGate.x - toType.width/2 - 5;
    
    let endY = toGate.y;
    if (toGate.type === 'AND' || toGate.type === 'OR') {
      endY = connection.toInput === 0 ? toGate.y - 12 : toGate.y + 12;
    }
    
    const isActive = simulationResults[connection.from];
    const midX = (startX + endX) / 2;
    
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        <path
          className="wire"
          d={path}
          fill="none"
          stroke={isActive ? design.colors.signal.on : design.colors.signal.off}
          strokeWidth={isActive ? "3" : "2"}
          strokeLinecap="round"
        />
        
        {isActive && (
          <circle r="4" fill={design.colors.signal.flow}>
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <header style={{
        height: '56px',
        backgroundColor: design.colors.background,
        borderBottom: `1px solid ${design.colors.ui.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '500',
          color: design.colors.ui.primary,
          margin: 0
        }}>
          論理回路プレイグラウンド
        </h1>
        
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: `1px solid ${design.colors.ui.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: design.colors.ui.secondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>?</span>
          ヘルプ
        </button>
      </header>

      {/* キャンバス */}
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: 'calc(100% - 128px)',
          backgroundColor: design.colors.canvas,
          cursor: drawingWire ? 'crosshair' : 'default'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
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
            stroke={design.colors.signal.off}
            strokeWidth="2"
            strokeDasharray="5,5"
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
        height: '72px',
        backgroundColor: design.colors.background,
        borderTop: `1px solid ${design.colors.ui.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '0 24px',
      }}>
        {Object.entries(gateTypes).map(([type, info]) => (
          <button
            key={type}
            onClick={() => addGate(type)}
            style={{
              width: '56px',
              height: '48px',
              backgroundColor: design.colors.background,
              border: `1px solid ${design.colors.ui.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = design.colors.ui.hover;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = design.colors.background;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={`${info.name} (${type.charAt(0)})`}
          >
            <span style={{
              fontSize: '20px',
              lineHeight: 1,
            }}>
              {info.icon}
            </span>
            <span style={{
              fontSize: '10px',
              color: design.colors.ui.secondary,
              fontWeight: '500'
            }}>
              {info.name}
            </span>
          </button>
        ))}
        
        <div style={{
          width: '1px',
          height: '32px',
          backgroundColor: design.colors.ui.border,
          margin: '0 8px'
        }} />
        
        <button
          onClick={() => {
            setGates([]);
            setConnections([]);
          }}
          style={{
            padding: '8px 20px',
            backgroundColor: design.colors.background,
            border: `1px solid ${design.colors.ui.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: design.colors.ui.secondary,
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          クリア
        </button>
      </div>

      {/* ヘルプ */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '68px',
          right: '24px',
          width: '320px',
          backgroundColor: design.colors.background,
          border: `1px solid ${design.colors.ui.border}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: design.colors.ui.primary
          }}>
            ショートカットキー
          </h3>
          
          <div style={{ fontSize: '14px', color: design.colors.ui.secondary, lineHeight: 1.8 }}>
            <div><kbd>I</kbd> 入力ゲートを追加</div>
            <div><kbd>O</kbd> 出力ゲートを追加</div>
            <div><kbd>A</kbd> ANDゲートを追加</div>
            <div><kbd>R</kbd> ORゲートを追加</div>
            <div><kbd>N</kbd> NOTゲートを追加</div>
            <div><kbd>Delete</kbd> 選択中のゲートを削除</div>
            
            <h4 style={{ marginTop: '16px', marginBottom: '8px', fontWeight: '600', color: design.colors.ui.primary }}>
              マウス操作
            </h4>
            <div>• 入力ゲートをクリックで値を切り替え</div>
            <div>• ゲートをドラッグで移動</div>
            <div>• 右クリックで削除</div>
            <div>• 出力端子から入力端子へドラッグで接続</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalCircuit;