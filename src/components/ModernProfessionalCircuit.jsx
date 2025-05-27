import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * モダンでカッコいいデザインの論理回路コンポーネント
 * - ネオモルフィズムデザイン
 * - グラデーション効果
 * - アニメーション
 * - サイバーパンク風の発光効果
 */
const ModernProfessionalCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isPlacingGate, setIsPlacingGate] = useState(false);
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [drawingWire, setDrawingWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('cyber'); // cyber, neumorphism, glass
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);

  // テーマ別デザインシステム
  const themes = {
    cyber: {
      name: 'サイバーパンク',
      colors: {
        background: '#0a0e27',
        canvas: 'radial-gradient(circle at 50% 50%, #0f1441 0%, #080b1f 100%)',
        grid: 'rgba(0, 255, 255, 0.1)',
        
        gate: {
          fill: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
          stroke: '#00ffff',
          text: '#00ffff',
          shadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          glow: '0 0 30px rgba(0, 255, 255, 0.8)',
        },
        
        signal: {
          off: 'rgba(100, 100, 100, 0.5)',
          on: '#00ff88',
          flow: '#00ffff',
          glow: '0 0 15px #00ff88',
        },
        
        ui: {
          primary: '#00ffff',
          secondary: '#ff00ff',
          accent: '#ffff00',
          border: 'rgba(0, 255, 255, 0.3)',
          hover: 'rgba(0, 255, 255, 0.1)',
          buttonBg: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
          buttonActive: 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)',
        }
      }
    },
    neumorphism: {
      name: 'ネオモルフィズム',
      colors: {
        background: '#e0e5ec',
        canvas: '#e0e5ec',
        grid: 'rgba(0, 0, 0, 0.03)',
        
        gate: {
          fill: '#e0e5ec',
          stroke: 'transparent',
          text: '#4a5568',
          shadow: '9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff',
          glow: 'none',
        },
        
        signal: {
          off: '#a3b1c6',
          on: '#5090d3',
          flow: '#5090d3',
          glow: 'none',
        },
        
        ui: {
          primary: '#4a5568',
          secondary: '#718096',
          accent: '#5090d3',
          border: 'transparent',
          hover: 'rgba(0, 0, 0, 0.05)',
          buttonBg: '#e0e5ec',
          buttonActive: '#5090d3',
        }
      }
    },
    glass: {
      name: 'グラスモーフィズム',
      colors: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        canvas: 'rgba(255, 255, 255, 0.1)',
        grid: 'rgba(255, 255, 255, 0.1)',
        
        gate: {
          fill: 'rgba(255, 255, 255, 0.2)',
          stroke: 'rgba(255, 255, 255, 0.5)',
          text: '#ffffff',
          shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          glow: 'none',
          backdrop: 'blur(10px)',
        },
        
        signal: {
          off: 'rgba(255, 255, 255, 0.3)',
          on: '#ffffff',
          flow: '#ffffff',
          glow: '0 0 10px rgba(255, 255, 255, 0.8)',
        },
        
        ui: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.8)',
          accent: '#ffd700',
          border: 'rgba(255, 255, 255, 0.3)',
          hover: 'rgba(255, 255, 255, 0.1)',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonActive: 'rgba(255, 255, 255, 0.4)',
        }
      }
    }
  };

  const theme = themes[selectedTheme];

  // ゲートタイプ定義
  const gateTypes = {
    INPUT: { 
      name: '入力',
      icon: '⚡',
      width: 60,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <defs>
            <filter id={`glow-${x}-${y}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {selectedTheme === 'cyber' && (
              <radialGradient id={`input-gradient-${x}-${y}`}>
                <stop offset="0%" stopColor={isActive ? '#00ff88' : '#1a1f3a'} />
                <stop offset="100%" stopColor={isActive ? '#00cc66' : '#0d0f1f'} />
              </radialGradient>
            )}
          </defs>
          
          {/* 背景の光彩 */}
          {selectedTheme === 'cyber' && isActive && (
            <circle cx={0} cy={0} r="35" 
              fill="none"
              stroke="#00ff88"
              strokeWidth="2"
              opacity="0.5"
              filter={`url(#glow-${x}-${y})`}>
              <animate attributeName="r" values="35;40;35" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          
          {/* メインボディ */}
          <circle cx={0} cy={0} r="25" 
            fill={selectedTheme === 'cyber' ? `url(#input-gradient-${x}-${y})` : theme.colors.gate.fill}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 
                    selectedTheme === 'cyber' && isActive ? `url(#glow-${x}-${y})` : 'none'}
            style={selectedTheme === 'glass' ? { backdropFilter: theme.colors.gate.backdrop } : {}}
          />
          
          {/* アイコン */}
          <text x={0} y={8} textAnchor="middle" 
            fill={isActive && selectedTheme === 'cyber' ? '#ffffff' : theme.colors.gate.text}
            fontSize="28" fontWeight="700"
            filter={selectedTheme === 'cyber' && isActive ? `url(#glow-${x}-${y})` : 'none'}>
            ⚡
          </text>
        </g>
      )
    },
    OUTPUT: { 
      name: '出力',
      icon: '💡',
      width: 60,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          {selectedTheme === 'cyber' && isActive && (
            <>
              <circle cx={0} cy={0} r="35" 
                fill="none"
                stroke="#ffff00"
                strokeWidth="3"
                opacity="0.6"
                filter="blur(8px)">
                <animate attributeName="r" values="30;38;30" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={0} cy={0} r="25" 
                fill="rgba(255, 255, 0, 0.2)"
                filter="blur(15px)" />
            </>
          )}
          
          <rect x={-30} y={-30} width="60" height="60" rx="15"
            fill={selectedTheme === 'cyber' ? 
                  (isActive ? 'linear-gradient(135deg, #ffff00 0%, #ff8800 100%)' : theme.colors.gate.fill) :
                  (isActive && selectedTheme === 'neumorphism' ? theme.colors.signal.on : theme.colors.gate.fill)}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 'none'}
            style={selectedTheme === 'glass' ? { backdropFilter: theme.colors.gate.backdrop } : {}}
          />
          
          <text x={0} y={8} textAnchor="middle" 
            fill={isActive && selectedTheme !== 'glass' ? '#ffffff' : theme.colors.gate.text}
            fontSize="32" fontWeight="700">
            💡
          </text>
        </g>
      )
    },
    AND: { 
      name: 'AND',
      icon: 'AND',
      width: 80,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <defs>
            <linearGradient id={`and-gradient-${x}-${y}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={selectedTheme === 'cyber' ? '#2d3561' : theme.colors.gate.fill} />
              <stop offset="100%" stopColor={selectedTheme === 'cyber' ? '#1a1f3a' : theme.colors.gate.fill} />
            </linearGradient>
          </defs>
          
          {selectedTheme === 'cyber' && (
            <path d={`M ${-50} ${-35} L ${-50} ${35} L ${25} ${35} Q ${50} ${35} ${50} ${0} Q ${50} ${-35} ${25} ${-35} Z`}
              fill="none"
              stroke={theme.colors.gate.stroke}
              strokeWidth="1"
              opacity="0.3"
              transform="scale(1.1)" />
          )}
          
          <path d={`M ${-50} ${-35} L ${-50} ${35} L ${25} ${35} Q ${50} ${35} ${50} ${0} Q ${50} ${-35} ${25} ${-35} Z`}
            fill={`url(#and-gradient-${x}-${y})`}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 
                    selectedTheme === 'cyber' ? `drop-shadow(${theme.colors.gate.shadow})` : 'none'}
            style={selectedTheme === 'glass' ? { backdropFilter: theme.colors.gate.backdrop } : {}}
          />
          
          <text x={0} y={6} textAnchor="middle" 
            fill={theme.colors.gate.text}
            fontSize="20" fontWeight="700" letterSpacing="0.1em"
            style={{ textShadow: selectedTheme === 'cyber' ? `0 0 10px ${theme.colors.gate.text}` : 'none' }}>
            AND
          </text>
          
          {/* 入力端子の装飾 */}
          {selectedTheme === 'cyber' && (
            <>
              <circle cx={-55} cy={-15} r="3" fill={theme.colors.gate.stroke} opacity="0.8" />
              <circle cx={-55} cy={15} r="3" fill={theme.colors.gate.stroke} opacity="0.8" />
            </>
          )}
        </g>
      )
    },
    OR: { 
      name: 'OR',
      icon: 'OR',
      width: 80,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <defs>
            <linearGradient id={`or-gradient-${x}-${y}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={selectedTheme === 'cyber' ? '#3d1f56' : theme.colors.gate.fill} />
              <stop offset="100%" stopColor={selectedTheme === 'cyber' ? '#1f1a3d' : theme.colors.gate.fill} />
            </linearGradient>
          </defs>
          
          <path d={`M ${-50} ${-35} Q ${-30} ${0} ${-50} ${35} L ${25} ${35} Q ${50} ${0} ${25} ${-35} Z`}
            fill={`url(#or-gradient-${x}-${y})`}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 
                    selectedTheme === 'cyber' ? `drop-shadow(${theme.colors.gate.shadow})` : 'none'}
            style={selectedTheme === 'glass' ? { backdropFilter: theme.colors.gate.backdrop } : {}}
          />
          
          <text x={0} y={6} textAnchor="middle" 
            fill={theme.colors.gate.text}
            fontSize="20" fontWeight="700" letterSpacing="0.1em"
            style={{ textShadow: selectedTheme === 'cyber' ? `0 0 10px ${theme.colors.gate.text}` : 'none' }}>
            OR
          </text>
          
          {selectedTheme === 'cyber' && (
            <>
              <circle cx={-55} cy={-15} r="3" fill={theme.colors.ui.secondary} opacity="0.8" />
              <circle cx={-55} cy={15} r="3" fill={theme.colors.ui.secondary} opacity="0.8" />
            </>
          )}
        </g>
      )
    },
    NOT: { 
      name: 'NOT',
      icon: 'NOT',
      width: 60,
      height: 60,
      renderGate: (x, y, isActive) => (
        <g>
          <defs>
            <linearGradient id={`not-gradient-${x}-${y}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={selectedTheme === 'cyber' ? '#561f3d' : theme.colors.gate.fill} />
              <stop offset="100%" stopColor={selectedTheme === 'cyber' ? '#3d1a2f' : theme.colors.gate.fill} />
            </linearGradient>
          </defs>
          
          <path d={`M ${-35} ${-30} L ${-35} ${30} L ${20} ${0} Z`}
            fill={`url(#not-gradient-${x}-${y})`}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 
                    selectedTheme === 'cyber' ? `drop-shadow(${theme.colors.gate.shadow})` : 'none'}
            style={selectedTheme === 'glass' ? { backdropFilter: theme.colors.gate.backdrop } : {}}
          />
          
          <circle cx={28} cy={0} r="8" 
            fill={selectedTheme === 'cyber' ? theme.colors.gate.stroke : theme.colors.gate.fill}
            stroke={theme.colors.gate.stroke}
            strokeWidth={selectedTheme === 'cyber' ? '2' : '0'}
            filter={selectedTheme === 'neumorphism' ? `drop-shadow(${theme.colors.gate.shadow})` : 'none'}
          />
          
          <text x={-7} y={5} textAnchor="middle" 
            fill={theme.colors.gate.text}
            fontSize="18" fontWeight="700"
            style={{ textShadow: selectedTheme === 'cyber' ? `0 0 10px ${theme.colors.gate.text}` : 'none' }}>
            NOT
          </text>
          
          {selectedTheme === 'cyber' && (
            <circle cx={-40} cy={0} r="3" fill={theme.colors.ui.accent} opacity="0.8" />
          )}
        </g>
      )
    },
  };

  // ゲート追加
  const addGate = useCallback((type, x, y) => {
    const newGate = {
      id: `gate_${nextGateId.current++}`,
      type,
      x: Math.round(x / 20) * 20,
      y: Math.round(y / 20) * 20,
      value: type === 'INPUT' ? false : null
    };
    
    setGates(prev => [...prev, newGate]);
  }, []);

  // ツール選択時に配置モードに
  const selectTool = useCallback((tool) => {
    setSelectedTool(tool);
    setIsPlacingGate(true);
  }, []);

  // キャンバスクリック
  const handleCanvasClick = useCallback((e) => {
    if (!isPlacingGate || !selectedTool) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addGate(selectedTool, x, y);
    // 1クリック配置後も選択状態を維持
  }, [selectedTool, isPlacingGate, addGate]);

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
    if (draggedGate && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
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
    setDraggedGate(null);
    setDragOffset(null);
    if (drawingWire) {
      setDrawingWire(null);
    }
  }, [drawingWire]);

  // ワイヤー接続開始
  const startWireConnection = useCallback((gateId, x, y) => {
    setDrawingWire({ from: gateId, startX: x, startY: y, endX: x, endY: y });
  }, []);

  // ワイヤー接続完了
  const completeWireConnection = useCallback((toGateId, inputIndex) => {
    if (drawingWire && drawingWire.from !== toGateId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: drawingWire.from,
        to: toGateId,
        toInput: inputIndex
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setDrawingWire(null);
  }, [drawingWire]);

  // 回路シミュレーション
  const simulationResults = {};
  gates.forEach(gate => {
    if (gate.type === 'INPUT') {
      simulationResults[gate.id] = gate.value;
    } else {
      const inputConnections = connections.filter(c => c.to === gate.id);
      const inputValues = inputConnections.map(c => {
        const fromGate = gates.find(g => g.id === c.from);
        return fromGate ? simulationResults[fromGate.id] : false;
      });

      switch (gate.type) {
        case 'AND':
          simulationResults[gate.id] = inputValues.length >= 2 && inputValues.every(v => v);
          break;
        case 'OR':
          simulationResults[gate.id] = inputValues.some(v => v);
          break;
        case 'NOT':
          simulationResults[gate.id] = inputValues.length > 0 ? !inputValues[0] : false;
          break;
        case 'OUTPUT':
          simulationResults[gate.id] = inputValues.length > 0 ? inputValues[0] : false;
          break;
      }
    }
  });

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
        setSelectedTool(null);
        setIsPlacingGate(false);
        setDrawingWire(null);
        setDraggedGate(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ゲート描画
  const renderGate = (gate) => {
    const gateType = gateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    const isDragging = draggedGate?.id === gate.id;
    
    return (
      <g key={gate.id} data-gate-id={gate.id} data-type={gate.type} data-active={isActive} transform={`translate(${gate.x}, ${gate.y})`}>
        {/* ホバー効果 */}
        {isHovered && !isDragging && selectedTheme === 'cyber' && (
          <rect
            x={-gateType.width/2 - 15}
            y={-gateType.height/2 - 15}
            width={gateType.width + 30}
            height={gateType.height + 30}
            fill="none"
            stroke={theme.colors.ui.primary}
            strokeWidth="1"
            rx="15"
            opacity="0.3"
            strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
          </rect>
        )}
        
        {/* ゲート本体 */}
        <g style={{
            opacity: isDragging ? 0.7 : 1,
            cursor: 'move',
            transition: 'all 0.3s ease',
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
          {gateType.renderGate(gate.x, gate.y, isActive)}
        </g>
        
        {/* 接続端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {(gate.type === 'AND' || gate.type === 'OR') ? (
              <>
                <circle cx={-gateType.width/2 - 5} cy={-15} r="6"
                  fill={theme.colors.signal.off} 
                  stroke={theme.colors.gate.stroke}
                  strokeWidth="2"
                  style={{ cursor: 'crosshair' }}
                  data-terminal="input"
                  onMouseUp={() => completeWireConnection(gate.id, 0)}>
                  {selectedTheme === 'cyber' && (
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>
                <circle cx={-gateType.width/2 - 5} cy={15} r="6"
                  fill={theme.colors.signal.off} 
                  stroke={theme.colors.gate.stroke}
                  strokeWidth="2"
                  style={{ cursor: 'crosshair' }}
                  data-terminal="input"
                  onMouseUp={() => completeWireConnection(gate.id, 1)}>
                  {selectedTheme === 'cyber' && (
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>
              </>
            ) : (
              <circle cx={-gateType.width/2 - 5} cy={0} r="6"
                fill={theme.colors.signal.off} 
                stroke={theme.colors.gate.stroke}
                strokeWidth="2"
                style={{ cursor: 'crosshair' }}
                data-terminal="input"
                onMouseUp={() => completeWireConnection(gate.id, 0)}>
                {selectedTheme === 'cyber' && (
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                )}
              </circle>
            )}
          </>
        )}
        
        {gate.type !== 'OUTPUT' && (
          <circle cx={gateType.width/2 + 5} cy={0} r="6"
            fill={theme.colors.signal.off} 
            stroke={theme.colors.gate.stroke}
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            data-terminal="output"
            onMouseDown={(e) => {
              e.stopPropagation();
              startWireConnection(gate.id, gate.x + gateType.width/2 + 5, gate.y);
            }}>
            {selectedTheme === 'cyber' && (
              <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
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
      endY = connection.toInput === 0 ? toGate.y - 15 : toGate.y + 15;
    }
    
    const isActive = simulationResults[connection.from];
    const midX = (startX + endX) / 2;
    
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        {/* グロー効果 */}
        {selectedTheme === 'cyber' && isActive && (
          <path
            className="wire"
            d={path}
            fill="none"
            stroke={theme.colors.signal.on}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(8px)"
          />
        )}
        
        <path
          className="wire"
          d={path}
          fill="none"
          stroke={isActive ? theme.colors.signal.on : theme.colors.signal.off}
          strokeWidth={isActive ? "4" : "3"}
          strokeLinecap="round"
          style={{
            filter: selectedTheme === 'cyber' && isActive ? theme.colors.signal.glow : 'none',
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* 信号フローアニメーション */}
        {isActive && (
          <circle r="6" fill={theme.colors.signal.flow}
            filter={selectedTheme === 'cyber' ? 'blur(2px)' : 'none'}>
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
      background: theme.colors.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <header style={{
        height: '60px',
        background: selectedTheme === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 
                    selectedTheme === 'cyber' ? 'rgba(0, 0, 0, 0.5)' : 
                    theme.colors.background,
        backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none',
        borderBottom: `1px solid ${theme.colors.ui.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: selectedTheme === 'neumorphism' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: theme.colors.ui.primary,
          margin: 0,
          textShadow: selectedTheme === 'cyber' ? `0 0 20px ${theme.colors.ui.primary}` : 'none',
        }}>
          論理回路プレイグラウンド
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* テーマ選択 */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              cursor: 'pointer',
              backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none',
            }}
          >
            <option value="cyber">サイバーパンク</option>
            <option value="neumorphism">ネオモルフィズム</option>
            <option value="glass">グラスモーフィズム</option>
          </select>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none',
              boxShadow: selectedTheme === 'neumorphism' ? theme.colors.gate.shadow : 'none',
            }}
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
              borderRadius: '8px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.secondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none',
              boxShadow: selectedTheme === 'neumorphism' ? theme.colors.gate.shadow : 'none',
            }}
          >
            クリア
          </button>
        </div>
      </header>

      {/* ツールバー */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '12px',
        background: selectedTheme === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 
                   selectedTheme === 'cyber' ? 'rgba(0, 0, 0, 0.7)' : 
                   theme.colors.background,
        borderRadius: '16px',
        border: `1px solid ${theme.colors.ui.border}`,
        backdropFilter: selectedTheme === 'glass' ? 'blur(10px)' : 'none',
        boxShadow: selectedTheme === 'neumorphism' ? theme.colors.gate.shadow : 
                   selectedTheme === 'cyber' ? `0 4px 20px rgba(0, 0, 0, 0.5)` : 
                   'none',
        zIndex: 10,
      }}>
        {Object.entries(gateTypes).map(([type, config]) => (
          <button
            key={type}
            onClick={() => selectTool(type)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              border: selectedTool === type ? `2px solid ${theme.colors.ui.accent}` : 'none',
              background: selectedTool === type ? theme.colors.ui.buttonActive : theme.colors.ui.buttonBg,
              color: selectedTool === type ? 
                     (selectedTheme === 'cyber' ? '#000000' : '#ffffff') : 
                     theme.colors.ui.primary,
              fontSize: '24px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: selectedTheme === 'neumorphism' ? 
                        (selectedTool === type ? 
                         'inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff' :
                         theme.colors.gate.shadow) : 'none',
              filter: selectedTheme === 'cyber' && selectedTool === type ? 
                     `drop-shadow(0 0 10px ${theme.colors.ui.accent})` : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedTheme === 'cyber') {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.filter = `drop-shadow(0 0 15px ${theme.colors.ui.primary})`;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              if (selectedTheme === 'cyber' && selectedTool !== type) {
                e.target.style.filter = 'none';
              }
            }}
          >
            <span>{config.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>{config.name}</span>
          </button>
        ))}
      </div>

      {/* キャンバス */}
      <svg
        ref={svgRef}
        width="100%"
        height="calc(100% - 60px)"
        style={{
          background: selectedTheme === 'glass' ? theme.colors.canvas : theme.colors.canvas,
          cursor: selectedTool ? 'crosshair' : 'default',
        }}
        onClick={handleCanvasClick}
      >
        {/* グリッド */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill={theme.colors.grid} />
          </pattern>
          {selectedTheme === 'cyber' && (
            <filter id="neon-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
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
            strokeWidth="3"
            strokeDasharray="5,5"
            strokeLinecap="round"
            opacity="0.7"
          >
            <animate attributeName="stroke-dashoffset" values="0;10" dur="0.5s" repeatCount="indefinite" />
          </line>
        )}
        
        {/* ゲート */}
        {gates.map(renderGate)}
      </svg>

      {/* ヘルプウィンドウ */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          padding: '24px',
          background: selectedTheme === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 
                     selectedTheme === 'cyber' ? 'rgba(0, 0, 0, 0.9)' : 
                     theme.colors.background,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.ui.border}`,
          backdropFilter: selectedTheme === 'glass' ? 'blur(20px)' : 'none',
          boxShadow: selectedTheme === 'neumorphism' ? '20px 20px 60px #a3b1c6, -20px -20px 60px #ffffff' : 
                     selectedTheme === 'cyber' ? `0 0 40px ${theme.colors.ui.primary}` : 
                     '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 100,
        }}>
          <h2 style={{ color: theme.colors.ui.primary, marginBottom: '16px' }}>操作方法</h2>
          <ul style={{ color: theme.colors.ui.secondary, lineHeight: '1.8' }}>
            <li>ツールバーからゲートを選択</li>
            <li>キャンバスをクリックして配置</li>
            <li>端子をドラッグして接続</li>
            <li>入力ゲートをクリックでON/OFF</li>
            <li>右クリックでゲート削除</li>
            <li>ESCキーで選択解除</li>
          </ul>
          <button
            onClick={() => setShowHelp(false)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.ui.border}`,
              background: theme.colors.ui.buttonBg,
              color: theme.colors.ui.primary,
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernProfessionalCircuit;