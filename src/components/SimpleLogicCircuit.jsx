import React, { useState, useCallback, useRef } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

/**
 * シンプルで使いやすい論理回路エディタ
 * - ドラッグ&ドロップ中心の操作
 * - モード切り替え不要
 * - ミニマルなUI
 */
const SimpleLogicCircuit = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [drawingWire, setDrawingWire] = useState(null);
  
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

  // ゲートタイプ
  const gateTypes = [
    { type: 'INPUT', icon: '▶', color: '#10b981' },
    { type: 'OUTPUT', icon: '◀', color: '#10b981' },
    { type: 'AND', icon: '&', color: '#3b82f6' },
    { type: 'OR', icon: '≥1', color: '#3b82f6' },
    { type: 'NOT', icon: '¬', color: '#3b82f6' }
  ];

  // SVGクリックでゲートを配置
  const handleSvgClick = useCallback((e) => {
    if (selectedTool && !draggedGate && !drawingWire) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newGate = {
        id: `gate_${nextGateId.current++}`,
        type: selectedTool,
        x: Math.round(x / 20) * 20,
        y: Math.round(y / 20) * 20,
        value: selectedTool === 'INPUT' ? false : null
      };
      
      setGates(prev => [...prev, newGate]);
      setSelectedTool(null); // 配置後はツールを解除
    }
    setContextMenu(null);
  }, [selectedTool, draggedGate, drawingWire]);

  // 右クリックメニュー
  const handleContextMenu = useCallback((e, gate) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = svgRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      gate
    });
  }, []);

  // ゲート削除
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
    setContextMenu(null);
  }, []);

  // INPUTゲートの値切り替え
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(gate => 
      gate.id === gateId && gate.type === 'INPUT'
        ? { ...gate, value: !gate.value }
        : gate
    ));
  }, []);

  // ワイヤー接続開始
  const startWire = useCallback((e, gateId, isOutput) => {
    e.stopPropagation();
    const gate = gates.find(g => g.id === gateId);
    if (!gate) return;
    
    setDrawingWire({
      fromGate: gateId,
      isOutput,
      startX: gate.x + (isOutput ? 35 : -35),
      startY: gate.y,
      endX: gate.x + (isOutput ? 35 : -35),
      endY: gate.y
    });
  }, [gates]);

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
    
    if (drawingWire) {
      const rect = svgRef.current.getBoundingClientRect();
      setDrawingWire(prev => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      }));
    }
  }, [drawingWire, handleMouseMove]);

  // シミュレーション
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

  // ゲート描画
  const renderGate = (gate) => {
    const gateInfo = gateTypes.find(g => g.type === gate.type);
    const isActive = simulationResults[gate.id];
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT' 
      ? (isActive ? '#10b981' : '#6b7280')
      : gateInfo.color;
    
    return (
      <g key={gate.id}>
        <rect
          x={gate.x - 30}
          y={gate.y - 20}
          width="60"
          height="40"
          fill={fillColor}
          stroke="#000"
          strokeWidth="2"
          rx="8"
          className="cursor-move transition-opacity"
          style={{ opacity: draggedGate?.id === gate.id ? 0.5 : 1 }}
          onMouseDown={(e) => {
            if (e.button === 0) handleGateMouseDown(e, gate);
          }}
          onContextMenu={(e) => handleContextMenu(e, gate)}
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
        
        {/* 入力端子 */}
        {gate.type !== 'INPUT' && (
          <circle
            cx={gate.x - 35}
            cy={gate.y}
            r="5"
            fill="#fbbf24"
            stroke="#000"
            className="cursor-pointer"
            onMouseDown={(e) => startWire(e, gate.id, false)}
            onMouseUp={(e) => endWire(e, gate.id, true)}
          />
        )}
        
        {/* 出力端子 */}
        {gate.type !== 'OUTPUT' && (
          <circle
            cx={gate.x + 35}
            cy={gate.y}
            r="5"
            fill="#fbbf24"
            stroke="#000"
            className="cursor-pointer"
            onMouseDown={(e) => startWire(e, gate.id, true)}
            onMouseUp={(e) => endWire(e, gate.id, false)}
          />
        )}
      </g>
    );
  };

  // 接続線描画
  const renderConnection = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    const isActive = simulationResults[connection.from];
    
    return (
      <line
        key={connection.id}
        x1={fromGate.x + 35}
        y1={fromGate.y}
        x2={toGate.x - 35}
        y2={toGate.y}
        stroke={isActive ? '#10b981' : '#000'}
        strokeWidth={isActive ? '3' : '2'}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 最小限のヘッダー */}
      <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Logic Circuit</h1>
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {showPalette ? '✕ 閉じる' : '+ ゲート'}
        </button>
      </header>

      {/* メインキャンバス */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={(el) => {
            svgRef.current = el;
            if (dragSvgRef) dragSvgRef.current = el;
          }}
          className="w-full h-full bg-white cursor-crosshair"
          onClick={handleSvgClick}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={(e) => {
            handleMouseUp(e);
            setDrawingWire(null);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        >
          {/* グリッド */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#e5e7eb" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 接続線 */}
          <g>{connections.map(renderConnection)}</g>
          
          {/* ゲート */}
          <g>{gates.map(renderGate)}</g>
          
          {/* 描画中のワイヤー */}
          {drawingWire && (
            <line
              x1={drawingWire.startX}
              y1={drawingWire.startY}
              x2={drawingWire.endX}
              y2={drawingWire.endY}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
              pointerEvents="none"
            />
          )}
          
          {/* コンテキストメニュー */}
          {contextMenu && (
            <g>
              <rect
                x={contextMenu.x}
                y={contextMenu.y}
                width="100"
                height="30"
                fill="white"
                stroke="#ccc"
                rx="4"
              />
              <text
                x={contextMenu.x + 50}
                y={contextMenu.y + 20}
                textAnchor="middle"
                className="cursor-pointer"
                onClick={() => deleteGate(contextMenu.gate.id)}
              >
                🗑 削除
              </text>
            </g>
          )}
        </svg>

        {/* フローティングツールパレット */}
        {showPalette && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="text-xs text-gray-500 mb-2">クリックで選択、キャンバスクリックで配置</div>
            <div className="grid grid-cols-3 gap-2">
              {gateTypes.map(({ type, icon, color }) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTool(type);
                    setShowPalette(false);
                  }}
                  className={`w-16 h-16 rounded-lg border-2 transition-all ${
                    selectedTool === type 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: selectedTool === type ? '#eff6ff' : 'white' }}
                >
                  <div className="text-2xl" style={{ color }}>{icon}</div>
                  <div className="text-xs">{type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選択中のツール表示 */}
        {selectedTool && (
          <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded">
            {selectedTool}を配置中... (ESCでキャンセル)
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLogicCircuit;