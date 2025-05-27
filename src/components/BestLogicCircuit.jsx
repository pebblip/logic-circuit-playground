import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors, typography, spacing, shadows, animations, borderRadius, components } from '../styles/design-system';

/**
 * ベストプラクティスを集約した論理回路コンポーネント
 * - モードレス操作（配置モード・接続モード廃止）
 * - 1クリックでゲート配置
 * - 直感的なドラッグ＆ドロップ
 * - 美しいデザインシステム
 */
const BestLogicCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [drawingWire, setDrawingWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);

  // ゲートタイプ定義
  const gateTypes = {
    INPUT: { name: '入力', icon: 'IN', shortcut: 'I', color: colors.primary[500] },
    OUTPUT: { name: '出力', icon: 'OUT', shortcut: 'O', color: colors.secondary[500] },
    AND: { name: 'AND', icon: '&', shortcut: 'A', color: colors.warning[500] },
    OR: { name: 'OR', icon: '≥1', shortcut: 'R', color: colors.success[500] },
    NOT: { name: 'NOT', icon: '!', shortcut: 'N', color: colors.error[500] },
  };

  // 1クリックでゲート追加
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
      const newX = Math.round((e.clientX - rect.left - dragOffset.x) / 20) * 20;
      const newY = Math.round((e.clientY - rect.top - dragOffset.y) / 20) * 20;
      
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
      
      const key = e.key.toUpperCase();
      const gateType = Object.entries(gateTypes).find(([_, info]) => info.shortcut === key)?.[0];
      
      if (gateType) {
        addGate(gateType);
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
    const info = gateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    const isDragging = draggedGate?.id === gate.id;
    
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT'
      ? (isActive ? colors.success[500] : colors.gray[400])
      : info.color;

    return (
      <g key={gate.id}>
        {/* ホバー効果 */}
        {isHovered && !isDragging && (
          <rect
            x={gate.x - 45}
            y={gate.y - 30}
            width="90"
            height="60"
            fill={fillColor}
            fillOpacity="0.2"
            rx="12"
            style={{ filter: 'blur(8px)' }}
          />
        )}
        
        {/* ゲート本体 */}
        <rect
          x={gate.x - 40}
          y={gate.y - 25}
          width="80"
          height="50"
          fill={fillColor}
          stroke={isActive ? 'white' : colors.gray[700]}
          strokeWidth="2"
          rx="10"
          className="gate-rect"
          style={{
            opacity: isDragging ? 0.7 : 1,
            transform: isHovered && !isDragging ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: `${gate.x}px ${gate.y}px`,
            transition: isDragging ? 'none' : 'all 150ms ease-out',
            cursor: 'move',
            filter: isActive && gate.type !== 'INPUT' && gate.type !== 'OUTPUT' ? 'brightness(1.2)' : 'none'
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
        />
        
        {/* アイコン */}
        <text
          x={gate.x}
          y={gate.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {info.icon}
        </text>
        
        {/* 入力端子 */}
        {gate.type !== 'INPUT' && (
          <>
            {/* AND/ORは2つの入力、それ以外は1つ */}
            {(gate.type === 'AND' || gate.type === 'OR') ? (
              <>
                <circle
                  cx={gate.x - 40}
                  cy={gate.y - 15}
                  r="8"
                  fill={colors.primary[500]}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 0)}
                />
                <circle
                  cx={gate.x - 40}
                  cy={gate.y + 15}
                  r="8"
                  fill={colors.primary[500]}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'crosshair' }}
                  onMouseUp={() => completeWireConnection(gate.id, 1)}
                />
              </>
            ) : (
              <circle
                cx={gate.x - 40}
                cy={gate.y}
                r="8"
                fill={colors.primary[500]}
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'crosshair' }}
                onMouseUp={() => completeWireConnection(gate.id, 0)}
              />
            )}
          </>
        )}
        
        {gate.type !== 'OUTPUT' && (
          <circle
            cx={gate.x + 40}
            cy={gate.y}
            r="8"
            fill={colors.secondary[500]}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'crosshair' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startWireConnection(gate.id, gate.x + 40, gate.y);
            }}
          />
        )}
      </g>
    );
  };

  // ワイヤー描画
  const renderWire = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const startX = fromGate.x + 40;
    const startY = fromGate.y;
    const endX = toGate.x - 40;
    
    // AND/ORゲートの場合は入力位置を調整
    let endY = toGate.y;
    if (toGate.type === 'AND' || toGate.type === 'OR') {
      endY = connection.toInput === 0 ? toGate.y - 15 : toGate.y + 15;
    }
    
    const isActive = simulationResults[connection.from];
    const midX = (startX + endX) / 2;
    
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    
    return (
      <g key={connection.id}>
        {isActive && (
          <path
            d={path}
            fill="none"
            stroke={colors.primary[400]}
            strokeWidth="6"
            opacity="0.3"
            style={{ filter: 'blur(3px)' }}
          />
        )}
        
        <path
          d={path}
          fill="none"
          stroke={isActive ? colors.primary[500] : colors.gray[400]}
          strokeWidth={isActive ? "3" : "2"}
          strokeLinecap="round"
        />
        
        {isActive && (
          <circle r="3" fill={colors.primary[400]}>
            <animateMotion dur="1s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </g>
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: colors.background.secondary,
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
        height: '60px',
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
            cursor: 'pointer'
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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* グリッド */}
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
            stroke={colors.primary[400]}
            strokeWidth="2"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}
        
        {/* ゲート */}
        {gates.map(renderGate)}
      </svg>

      {/* ツールバー（下部中央） */}
      <div style={{
        position: 'absolute',
        bottom: spacing[6],
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: borderRadius['2xl'],
        padding: spacing[3],
        boxShadow: shadows.lg,
        display: 'flex',
        gap: spacing[2],
        alignItems: 'center'
      }}>
        {Object.entries(gateTypes).map(([type, info]) => (
          <button
            key={type}
            onClick={() => addGate(type)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: borderRadius.xl,
              border: 'none',
              backgroundColor: info.color,
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 150ms ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.1)';
              e.target.style.boxShadow = shadows.xl;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = 'none';
            }}
            title={`${info.name} (${info.shortcut})`}
          >
            {info.icon}
          </button>
        ))}
        
        <div style={{
          width: '1px',
          height: '30px',
          backgroundColor: colors.gray[300],
          margin: `0 ${spacing[2]}`
        }} />
        
        <button
          onClick={() => {
            setGates([]);
            setConnections([]);
          }}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.gray[300]}`,
            backgroundColor: 'white',
            color: colors.gray[700],
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            cursor: 'pointer'
          }}
        >
          クリア
        </button>
      </div>

      {/* ヘルプ */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: spacing[6],
          width: '300px',
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.xl,
          padding: spacing[6],
          boxShadow: shadows.xl
        }}>
          <h2 style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            marginBottom: spacing[4]
          }}>
            使い方
          </h2>
          
          <div style={{ fontSize: typography.sizes.sm, color: colors.gray[600] }}>
            <p><strong>ゲート配置:</strong> 下のボタンをクリック</p>
            <p><strong>ゲート移動:</strong> ドラッグ</p>
            <p><strong>ワイヤー接続:</strong> 出力端子から入力端子へドラッグ</p>
            <p><strong>値の切り替え:</strong> INPUTゲートをクリック</p>
            <p><strong>削除:</strong> 右クリック</p>
            
            <h3 style={{ marginTop: spacing[4], fontWeight: typography.weights.medium }}>
              ショートカット
            </h3>
            {Object.entries(gateTypes).map(([type, info]) => (
              <p key={type}>{info.shortcut}: {info.name}を追加</p>
            ))}
            <p>Delete: ホバー中のゲートを削除</p>
            <p>?: ヘルプ表示</p>
          </div>
        </div>
      )}

      {/* ヒント（初回のみ） */}
      {gates.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.gray[800],
          color: 'white',
          padding: `${spacing[2]} ${spacing[4]}`,
          borderRadius: borderRadius.lg,
          fontSize: typography.sizes.sm,
          animation: 'bounce 2s infinite'
        }}>
          ↓ クリックでゲートを追加
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default BestLogicCircuit;