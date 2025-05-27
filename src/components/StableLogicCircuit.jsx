import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

/**
 * 安定版の論理回路コンポーネント
 * - 最小限の機能で確実に動作することを重視
 * - テスト駆動開発で品質を担保
 */
const StableLogicCircuit = () => {
  // 状態管理
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedGateType, setSelectedGateType] = useState('INPUT');
  const [draggedWire, setDraggedWire] = useState(null);
  const [mode, setMode] = useState('place'); // 'place' | 'connect'
  
  const nextGateId = useRef(1);
  const svgRef = useRef(null);

  // ゲート移動時のコールバック
  const handleGateMove = useCallback((gateId, x, y) => {
    setGates(prev => prev.map(gate => 
      gate.id === gateId ? { ...gate, x, y } : gate
    ));
  }, []);

  // ドラッグ&ドロップフックの使用
  const {
    svgRef: dragSvgRef,
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
  }, [gates, connections, shouldSaveHistory]);

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

  // ゲートタイプの定義
  const gateTypes = ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'];

  // ゲートの追加
  const addGate = useCallback((x, y) => {
    // 既存のゲートとの重複をチェック
    const isOverlapping = gates.some(gate => 
      Math.abs(gate.x - x) < 60 && Math.abs(gate.y - y) < 40
    );
    
    if (isOverlapping) return;
    
    const newGate = {
      id: `gate_${nextGateId.current++}`,
      type: selectedGateType,
      x,
      y,
      value: selectedGateType === 'INPUT' ? false : null
    };
    setGates(prev => [...prev, newGate]);
    saveHistory();
  }, [selectedGateType, saveHistory, gates]);

  // キャンバスクリック
  const handleCanvasClick = useCallback((e) => {
    if (!svgRef.current) return;
    
    // ワイヤー接続中はゲートを配置しない
    if (draggedWire) {
      setDraggedWire(null);
      return;
    }
    
    // 配置モードの時のみゲートを配置
    if (mode === 'place') {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addGate(x, y);
    }
  }, [addGate, draggedWire, mode]);

  // ゲートの削除
  const deleteGate = useCallback((gateId) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
    setConnections(prev => prev.filter(c => c.from !== gateId && c.to !== gateId));
    saveHistory();
  }, [saveHistory]);

  // 入力ゲートの値を切り替え
  const toggleInput = useCallback((gateId) => {
    setGates(prev => prev.map(gate => 
      gate.id === gateId && gate.type === 'INPUT'
        ? { ...gate, value: !gate.value }
        : gate
    ));
  }, []);

  // ワイヤー接続開始
  const startWire = useCallback((gateId, terminal, index = 0) => {
    if (mode === 'connect') {
      setDraggedWire({ gateId, terminal, index });
    }
  }, [mode]);

  // ワイヤー接続終了
  const endWire = useCallback((gateId, terminal, index = 0) => {
    if (!draggedWire || mode !== 'connect') return;
    
    // 同じゲートには接続しない
    if (draggedWire.gateId === gateId) {
      setDraggedWire(null);
      return;
    }
    
    // 出力から入力への接続のみ許可
    if (draggedWire.terminal === 'output' && terminal === 'input') {
      const newConnection = {
        id: `conn_${Date.now()}_${Math.random()}`,
        from: draggedWire.gateId,
        to: gateId,
        fromIndex: draggedWire.index || 0,
        toIndex: index
      };
      setConnections(prev => [...prev, newConnection]);
      saveHistory();
    }
    
    setDraggedWire(null);
  }, [draggedWire, saveHistory, mode]);


  // シンプルなシミュレーション
  const simulate = useCallback(() => {
    const results = {};
    
    // 入力ゲートの値を設定
    gates.forEach(gate => {
      if (gate.type === 'INPUT') {
        results[gate.id] = gate.value;
      }
    });
    
    // 論理演算を実行
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      gates.forEach(gate => {
        if (gate.type === 'INPUT' || results[gate.id] !== undefined) return;
        
        // 入力端子ごとに接続を確認
        const inputCount = gate.type === 'AND' || gate.type === 'OR' ? 2 : 1;
        const inputValues = [];
        
        for (let i = 0; i < inputCount; i++) {
          const connection = connections.find(c => c.to === gate.id && c.toIndex === i);
          if (connection && results[connection.from] !== undefined) {
            inputValues.push(results[connection.from]);
          }
        }
        
        const inputs = inputValues;
        
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
    const isActive = simulationResults[gate.id];
    const fillColor = gate.type === 'INPUT' || gate.type === 'OUTPUT' 
      ? (isActive ? '#10b981' : '#6b7280')
      : '#3b82f6';
    
    // 入力端子の数を決定
    const inputCount = gate.type === 'AND' || gate.type === 'OR' ? 2 : 
                      gate.type === 'NOT' || gate.type === 'OUTPUT' ? 1 : 0;
    
    return (
      <g key={gate.id}>
        {/* ゲート本体 */}
        <rect
          x={gate.x - 30}
          y={gate.y - 20}
          width="60"
          height="40"
          fill={fillColor}
          stroke="#000"
          strokeWidth="2"
          rx="5"
          className="cursor-pointer"
          style={{ opacity: draggedGate?.id === gate.id ? 0.5 : 1 }}
          onClick={() => {
            if (gate.type === 'INPUT') {
              toggleInput(gate.id);
            }
          }}
          onMouseDown={(e) => {
            if (mode === 'place' && e.button === 0) {
              handleGateMouseDown(e, gate);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            deleteGate(gate.id);
          }}
        />
        
        {/* ゲートラベル */}
        <text
          x={gate.x}
          y={gate.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          pointerEvents="none"
        >
          {gate.type}
        </text>
        
        {/* 入力端子 */}
        {gate.type !== 'INPUT' && Array.from({ length: inputCount }).map((_, index) => {
          const yOffset = inputCount === 1 ? 0 : (index - (inputCount - 1) / 2) * 15;
          return (
            <circle
              key={`input-${index}`}
              cx={gate.x - 35}
              cy={gate.y + yOffset}
              r="5"
              fill="#fbbf24"
              stroke="#000"
              className="cursor-pointer"
              onMouseDown={(e) => {
                e.stopPropagation();
                startWire(gate.id, 'input', index);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                endWire(gate.id, 'input', index);
              }}
            />
          );
        })}
        
        {/* 出力端子 */}
        {gate.type !== 'OUTPUT' && (
          <circle
            cx={gate.x + 35}
            cy={gate.y}
            r="5"
            fill="#fbbf24"
            stroke="#000"
            className="cursor-pointer"
            onMouseDown={(e) => {
              e.stopPropagation();
              startWire(gate.id, 'output');
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              endWire(gate.id, 'output');
            }}
          />
        )}
      </g>
    );
  };

  // 接続線の描画
  const renderConnection = (connection) => {
    const fromGate = gates.find(g => g.id === connection.from);
    const toGate = gates.find(g => g.id === connection.to);
    
    if (!fromGate || !toGate) return null;
    
    // 接続元の座標（出力端子は常に1つ）
    const fromX = fromGate.x + 35;
    const fromY = fromGate.y;
    
    // 接続先の座標（入力端子のインデックスを考慮）
    const toInputCount = toGate.type === 'AND' || toGate.type === 'OR' ? 2 : 1;
    const toIndex = connection.toIndex || 0;
    const toYOffset = toInputCount === 1 ? 0 : (toIndex - (toInputCount - 1) / 2) * 15;
    const toX = toGate.x - 35;
    const toY = toGate.y + toYOffset;
    
    const isActive = simulationResults[connection.from];
    
    return (
      <line
        key={connection.id}
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={isActive ? '#10b981' : '#000'}
        strokeWidth={isActive ? '3' : '2'}
      />
    );
  };

  // ドラッグ中のワイヤー
  const renderDraggedWire = () => {
    if (!draggedWire) return null;
    
    const gate = gates.find(g => g.id === draggedWire.gateId);
    if (!gate) return null;
    
    const startX = draggedWire.terminal === 'output' ? gate.x + 35 : gate.x - 35;
    const startY = gate.y;
    
    return (
      <line
        x1={startX}
        y1={startY}
        x2={mousePosition ? mousePosition.x : startX}
        y2={mousePosition ? mousePosition.y : startY}
        stroke="#666"
        strokeWidth="2"
        strokeDasharray="5,5"
        pointerEvents="none"
      />
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">論理回路プレイグラウンド</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {/* TODO: 真理値表表示 */}}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              真理値表
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              元に戻す
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              やり直す
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex">
        {/* サイドバー */}
        <div className="w-48 bg-white border-r p-4">
          {/* モード切り替え */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">モード</h3>
            <div className="space-y-2">
              <button
                onClick={() => setMode('place')}
                className={`w-full px-3 py-2 text-left rounded transition-colors ${
                  mode === 'place'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🔨 配置モード
              </button>
              <button
                onClick={() => setMode('connect')}
                className={`w-full px-3 py-2 text-left rounded transition-colors ${
                  mode === 'connect'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🔌 接続モード
              </button>
            </div>
          </div>
          
          {/* モード別の説明 */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            {mode === 'place' ? (
              <p>キャンバスをクリックしてゲートを配置します。右クリックで削除。</p>
            ) : (
              <p>ゲートの端子をドラッグして接続します。出力→入力の順で接続。</p>
            )}
          </div>
          
          {/* ゲート選択（配置モードの時のみ表示） */}
          {mode === 'place' && (
            <>
              <h3 className="font-semibold mb-3 mt-4">ゲート</h3>
              <div className="space-y-2">
            {gateTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedGateType(type)}
                className={`w-full px-3 py-2 text-left rounded transition-colors ${
                  selectedGateType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
            </>
          )}
        </div>

        {/* キャンバス */}
        <div className="flex-1 p-4">
          <svg
            ref={(el) => {
              svgRef.current = el;
              if (dragSvgRef) dragSvgRef.current = el;
            }}
            width="800"
            height="600"
            className={`bg-white border rounded shadow-sm ${
              mode === 'place' ? 'cursor-crosshair' : 'cursor-default'
            }`}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={(e) => {
              setDraggedWire(null);
              handleMouseUp(e);
              if (draggedGate) {
                saveHistory();
              }
            }}
          >
            {/* グリッド */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="#e5e7eb" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* 接続線 */}
            <g>{connections.map(renderConnection)}</g>
            
            {/* ゲート */}
            <g>{gates.map(renderGate)}</g>
            
            {/* ドラッグ中のワイヤー */}
            {renderDraggedWire()}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StableLogicCircuit;