import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

/**
 * 究極のユーザーファースト論理回路エディタ
 * - 1クリックでゲート配置
 * - 直感的なスマートツールバー
 * - 視覚的フィードバック満載
 */
const UltimateLogicCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedTool, setSelectedTool] = useState('INPUT'); // 常に選択状態
  const [drawingWire, setDrawingWire] = useState(null);
  const [hoveredGate, setHoveredGate] = useState(null);
  const [recentTools, setRecentTools] = useState(['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT']);
  const [toolbarHover, setToolbarHover] = useState(false);
  
  const svgRef = useRef(null);
  const nextGateId = useRef(1);
  
  // ドラッグ&ドロップフック
  const {
    svgRef: dragSvgRef,
    draggedGate,
    mousePosition,
    handleGateMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDragAndDrop((gateId, x, y) => {
    setGates(prev => prev.map(g => g.id === gateId ? { ...g, x, y } : g));
  });

  // ゲートタイプ（視覚的にわかりやすいアイコン）
  const gateTypes = {
    INPUT: { icon: '▶', color: '#10b981', name: 'INPUT', shortcut: 'I' },
    OUTPUT: { icon: '◀', color: '#10b981', name: 'OUTPUT', shortcut: 'O' },
    AND: { icon: '&', color: '#3b82f6', name: 'AND', shortcut: 'A' },
    OR: { icon: '≥1', color: '#3b82f6', name: 'OR', shortcut: 'R' },
    NOT: { icon: '○┐', color: '#8b5cf6', name: 'NOT', shortcut: 'N' }
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 修飾キーが押されていない場合のみ
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch(e.key.toUpperCase()) {
          case 'I': setSelectedTool('INPUT'); break;
          case 'O': setSelectedTool('OUTPUT'); break;
          case 'A': setSelectedTool('AND'); break;
          case 'R': setSelectedTool('OR'); break;
          case 'N': setSelectedTool('NOT'); break;
          case 'ESCAPE': setSelectedTool(null); break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 最近使ったツールを更新
  const updateRecentTools = useCallback((tool) => {
    setRecentTools(prev => {
      const filtered = prev.filter(t => t !== tool);
      return [tool, ...filtered].slice(0, 5);
    });
  }, []);

  // SVGクリックは何もしない（ツールバーから直接配置するため）
  const handleSvgClick = useCallback((e) => {
    // 何もしない
  }, []);

  // ゲート削除（Deleteキーまたは右クリック）
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
  }, []);

  // INPUTゲートの値切り替え（ワンクリック）
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(gate => 
      gate.id === gateId && gate.type === 'INPUT'
        ? { ...gate, value: !gate.value }
        : gate
    ));
  }, []);

  // ワイヤー接続（ドラッグで直感的に）
  const startWire = useCallback((e, gateId, isOutput) => {
    e.stopPropagation();
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return;
    
    setDrawingWire({
      fromGate: gateId,
      isOutput,
      startX: gate.x + (isOutput ? 35 : -35),
      startY: gate.y,
      endX: mousePosition.x,
      endY: mousePosition.y
    });
  }, [gates, mousePosition]);

  // ワイヤー接続終了
  const endWire = useCallback((e, gateId, isInput) => {
    e.stopPropagation();
    
    if (!drawingWire) return;
    
    // 正しい方向の接続のみ許可
    if (drawingWire.isOutput && isInput && drawingWire.fromGate !== gateId) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        from: drawingWire.fromGate,
        to: gateId
      };
      setConnections(prev => [...prev, newConnection]);
    }
    
    setDrawingWire(null);
  }, [drawingWire]);

  // マウス移動でワイヤーを更新
  const handleSvgMouseMove = useCallback((e) => {
    handleMouseMove(e);
    
    if (drawingWire && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setDrawingWire(prev => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      }));
    }
  }, [drawingWire, handleMouseMove]);

  // リアルタイムシミュレーション
  const simulate = useCallback(() => {
    const results = {};
    
    gates.forEach(gate => {
      if (gate.type === 'INPUT') {
        results[gate.id] = gate.value;
      }
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

  // ゲート描画（視覚的フィードバック満載）
  const renderGate = (gate) => {
    const gateInfo = gateTypes[gate.type];
    const isActive = simulationResults[gate.id];
    const isHovered = hoveredGate === gate.id;
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT' 
      ? (isActive ? '#10b981' : '#6b7280')
      : gateInfo.color;
    
    return (
      <g key={gate.id}>
        {/* ホバー時の光彩 */}
        {isHovered && (
          <rect
            x={gate.x - 35}
            y={gate.y - 25}
            width="70"
            height="50"
            fill={fillColor}
            fillOpacity="0.2"
            rx="12"
            className="animate-pulse"
          />
        )}
        
        <rect
          x={gate.x - 30}
          y={gate.y - 20}
          width="60"
          height="40"
          fill={fillColor}
          stroke={isHovered ? '#fff' : '#000'}
          strokeWidth={isHovered ? '3' : '2'}
          rx="8"
          className="cursor-move transition-all duration-200"
          style={{ 
            opacity: draggedGate?.id === gate.id ? 0.5 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'none'
          }}
          onMouseEnter={() => setHoveredGate(gate.id)}
          onMouseLeave={() => setHoveredGate(null)}
          onMouseDown={(e) => {
            if (e.button === 0) handleGateMouseDown(e, gate);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            deleteGate(gate.id);
          }}
          onClick={() => {
            if (gate.type === 'INPUT') toggleInput(gate.id);
          }}
        />
        
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
          {gateInfo.icon}
        </text>
        
        {/* 入力端子（視覚的にわかりやすく） */}
        {gate.type !== 'INPUT' && (
          <circle
            cx={gate.x - 35}
            cy={gate.y}
            r="6"
            fill="#fbbf24"
            stroke="#000"
            strokeWidth="2"
            className="cursor-crosshair transition-all hover:r-8"
            style={{ 
              filter: drawingWire && !drawingWire.isOutput ? 'brightness(1.3)' : 'none'
            }}
            onMouseDown={(e) => startWire(e, gate.id, false)}
            onMouseUp={(e) => endWire(e, gate.id, true)}
          />
        )}
        
        {/* 出力端子 */}
        {gate.type !== 'OUTPUT' && (
          <circle
            cx={gate.x + 35}
            cy={gate.y}
            r="6"
            fill="#fbbf24"
            stroke="#000"
            strokeWidth="2"
            className="cursor-crosshair transition-all hover:r-8"
            style={{ 
              filter: drawingWire && drawingWire.isOutput ? 'brightness(1.3)' : 'none'
            }}
            onMouseDown={(e) => startWire(e, gate.id, true)}
            onMouseUp={(e) => endWire(e, gate.id, false)}
          />
        )}
        
        {/* ゲートタイプラベル（小さく） */}
        <text
          x={gate.x}
          y={gate.y - 30}
          textAnchor="middle"
          fill="#666"
          fontSize="10"
          pointerEvents="none"
        >
          {gate.type}
        </text>
      </g>
    );
  };

  // 接続線描画（アニメーション付き）
  const renderConnection = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const isActive = simulationResults[connection.from];
    
    return (
      <g key={connection.id}>
        {/* アクティブ時の光彩 */}
        {isActive && (
          <line
            x1={fromGate.x + 35}
            y1={fromGate.y}
            x2={toGate.x - 35}
            y2={toGate.y}
            stroke="#10b981"
            strokeWidth="6"
            strokeOpacity="0.3"
            className="animate-pulse"
          />
        )}
        <line
          x1={fromGate.x + 35}
          y1={fromGate.y}
          x2={toGate.x - 35}
          y2={toGate.y}
          stroke={isActive ? '#10b981' : '#000'}
          strokeWidth={isActive ? '3' : '2'}
          className="transition-all duration-200"
        />
      </g>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* 超ミニマルヘッダー */}
      <header className="bg-gray-800 px-4 py-1 flex items-center justify-between text-sm">
        <h1 className="font-bold">Logic Circuit</h1>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>ゲート数: {gates.length}</span>
          <span>接続数: {connections.length}</span>
        </div>
      </header>

      {/* メインキャンバス */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={(el) => {
            svgRef.current = el;
            if (dragSvgRef) dragSvgRef.current = el;
          }}
          className="w-full h-full bg-gray-100 cursor-default"
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={(e) => {
            handleMouseUp(e);
            setDrawingWire(null);
          }}
        >
          {/* 美しいグリッド */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#d1d5db" />
            </pattern>
            <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#grid)" />
              <circle cx="50" cy="50" r="1" fill="#9ca3af" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-large)" />
          
          {/* 接続線 */}
          <g>{connections.map(renderConnection)}</g>
          
          {/* ゲート */}
          <g>{gates.map(renderGate)}</g>
          
          {/* 描画中のワイヤー（視覚的ヒント付き） */}
          {drawingWire && (
            <>
              <line
                x1={drawingWire.startX}
                y1={drawingWire.startY}
                x2={drawingWire.endX}
                y2={drawingWire.endY}
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
                strokeOpacity="0.8"
                pointerEvents="none"
                className="animate-pulse"
              />
              <circle
                cx={drawingWire.endX}
                cy={drawingWire.endY}
                r="8"
                fill="#3b82f6"
                fillOpacity="0.3"
                pointerEvents="none"
                className="animate-ping"
              />
            </>
          )}
          
        </svg>

        {/* スマートツールバー（下部に固定、ホバーで展開） */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4"
          onMouseEnter={() => setToolbarHover(true)}
          onMouseLeave={() => setToolbarHover(false)}
        >
          <div className={`
            bg-gray-800 rounded-full shadow-2xl p-2 
            flex items-center gap-1 transition-all duration-300
            ${toolbarHover ? 'scale-110' : 'scale-100 opacity-90'}
          `}>
            {recentTools.map((type, index) => {
              const info = gateTypes[type];
              const isSelected = selectedTool === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    // 即座に配置！
                    const centerX = svgRef.current.clientWidth / 2;
                    const centerY = svgRef.current.clientHeight / 2;
                    
                    // 既存ゲートと重ならない位置を探す
                    let x = centerX;
                    let y = centerY;
                    let offset = 0;
                    
                    while (gates.some(g => Math.abs(g.x - x) < 80 && Math.abs(g.y - y) < 60)) {
                      offset += 40;
                      x = centerX + (offset * Math.cos(offset / 20));
                      y = centerY + (offset * Math.sin(offset / 20));
                    }
                    
                    const newGate = {
                      id: `gate_${nextGateId.current++}`,
                      type,
                      x: Math.round(x / 20) * 20,
                      y: Math.round(y / 20) * 20,
                      value: type === 'INPUT' ? false : null
                    };
                    
                    setGates(prev => [...prev, newGate]);
                    updateRecentTools(type);
                  }}
                  className={`
                    relative group w-12 h-12 rounded-full transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-600 scale-110 shadow-lg' 
                      : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
                    }
                  `}
                  style={{ 
                    backgroundColor: info.color,
                    transform: `translateY(${toolbarHover ? 0 : index * 2}px)`
                  }}
                >
                  <span className="text-xl font-bold text-white">
                    {info.icon}
                  </span>
                  
                  {/* ツールチップ */}
                  <div className="
                    absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                    bg-gray-900 text-white text-xs px-2 py-1 rounded
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap
                  ">
                    {info.name} ({info.shortcut})
                  </div>
                  
                  {/* ショートカットキー表示 */}
                  <div className="
                    absolute -top-1 -right-1 w-4 h-4 bg-gray-900 
                    rounded-full text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity
                  ">
                    {info.shortcut}
                  </div>
                </button>
              );
            })}
            
            {/* 区切り線 */}
            <div className="w-px h-8 bg-gray-600 mx-1" />
            
            {/* クリアボタン */}
            <button
              onClick={() => {
                setGates([]);
                setConnections([]);
              }}
              className="
                w-10 h-10 rounded-full bg-red-600 hover:bg-red-700
                transition-all duration-200 hover:scale-105
                flex items-center justify-center group
              "
            >
              <span className="text-sm">🗑</span>
              <div className="
                absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                bg-gray-900 text-white text-xs px-2 py-1 rounded
                opacity-0 group-hover:opacity-100 transition-opacity
                pointer-events-none
              ">
                全削除
              </div>
            </button>
          </div>
          
          {/* 使い方ヒント（初回のみ） */}
          {gates.length === 0 && (
            <div className="
              absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2
              bg-gray-800 text-gray-300 text-sm px-4 py-2 rounded-lg
              animate-bounce
            ">
              ↓ クリックで即配置！
            </div>
          )}
        </div>

        {/* キーボードショートカット一覧（右下） */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          <div className="bg-gray-800 bg-opacity-80 rounded p-2">
            <div>I: INPUT</div>
            <div>O: OUTPUT</div>
            <div>A: AND</div>
            <div>R: OR</div>
            <div>N: NOT</div>
            <div>ESC: 選択解除</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateLogicCircuit;