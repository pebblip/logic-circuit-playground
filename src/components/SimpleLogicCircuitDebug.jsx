import React, { useState, useCallback, useRef, useEffect } from 'react';

// デバッグ版：問題を特定するためのシンプルな実装
const SimpleLogicCircuitDebug = () => {
  const [gates, setGates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedConnection, setDraggedConnection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState([]);
  const svgRef = useRef(null);

  // ログを追加
  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // デバッグ用：接続状態を表示
  useEffect(() => {
    if (draggedConnection) {
      addLog(`ドラッグ中: ${draggedConnection.from}`);
    }
  }, [draggedConnection]);

  // ゲート追加
  const addGate = (type, x, y) => {
    const newGate = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      value: type === 'INPUT' ? false : undefined
    };
    setGates(prev => [...prev, newGate]);
    return newGate;
  };

  // テスト配置
  const setupTest = () => {
    setGates([]);
    setConnections([]);
    setLogs([]);
    
    // ゲートを配置
    const input1 = addGate('INPUT', 100, 100);
    const input2 = addGate('INPUT', 100, 200);
    const orGate = addGate('OR', 300, 150);
    
    addLog('テスト配置完了: INPUT1, INPUT2, OR');
  };

  // 配線開始
  const startConnection = (gateId, e) => {
    e.stopPropagation();
    addLog(`配線開始: ${gateId}`);
    setDraggedConnection({ from: gateId });
  };

  // 配線終了
  const endConnection = (gateId, inputIndex, e) => {
    e.stopPropagation();
    
    addLog(`配線終了試行: ${gateId} の入力${inputIndex + 1}`);
    
    if (!draggedConnection) {
      addLog('エラー: ドラッグ中の接続がありません');
      return;
    }
    
    if (draggedConnection.from === gateId) {
      addLog('エラー: 自己接続は不可');
      setDraggedConnection(null);
      return;
    }
    
    const newConnection = {
      id: `conn_${Date.now()}`,
      from: draggedConnection.from,
      to: gateId,
      toInput: inputIndex
    };
    
    setConnections(prev => [...prev, newConnection]);
    addLog(`接続成功: ${draggedConnection.from} → ${gateId}[${inputIndex}]`);
    setDraggedConnection(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl font-semibold">配線デバッグテスト</h1>
      </header>

      <div className="p-4 bg-white border-b">
        <button
          onClick={setupTest}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          テスト配置
        </button>
        
        <button
          onClick={() => {
            setGates([]);
            setConnections([]);
            setLogs([]);
            addLog('クリア完了');
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          クリア
        </button>
        
        <span className="ml-4 text-sm text-gray-600">
          操作方法: 出力（右の丸）からドラッグして、入力（左の丸）でマウスを離す
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVGキャンバス */}
        <div className="flex-1 relative bg-white">
          <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
            onMouseUp={() => {
              if (draggedConnection) {
                addLog('配線キャンセル');
                setDraggedConnection(null);
              }
            }}
          >
            {/* グリッド */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="#e5e7eb" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 接続線 */}
            {connections.map((conn, index) => {
              const fromGate = gates.find(g => g.id === conn.from);
              const toGate = gates.find(g => g.id === conn.to);
              if (!fromGate || !toGate) return null;
              
              const fromX = fromGate.x + 80;
              const fromY = fromGate.y + 30;
              const toX = toGate.x;
              const toY = toGate.y + (conn.toInput === 0 ? 15 : 45);
              
              return (
                <g key={conn.id}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  <text x={(fromX + toX) / 2} y={(fromY + toY) / 2 - 5} fontSize="12" fill="#065f46">
                    接続{index + 1}
                  </text>
                </g>
              );
            })}

            {/* ドラッグ中の線 */}
            {draggedConnection && (() => {
              const fromGate = gates.find(g => g.id === draggedConnection.from);
              if (!fromGate) return null;
              
              return (
                <line
                  x1={fromGate.x + 80}
                  y1={fromGate.y + 30}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  pointerEvents="none"
                />
              );
            })()}

            {/* ゲート */}
            {gates.map(gate => (
              <g key={gate.id} transform={`translate(${gate.x}, ${gate.y})`}>
                {gate.type === 'INPUT' ? (
                  <>
                    <rect x="0" y="0" width="80" height="60" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" rx="5" />
                    <text x="40" y="35" textAnchor="middle" fontSize="14" fontWeight="bold">INPUT</text>
                    
                    {/* 出力端子 */}
                    <circle
                      cx="80"
                      cy="30"
                      r="8"
                      fill="#f59e0b"
                      stroke="#92400e"
                      strokeWidth="2"
                      onMouseDown={(e) => startConnection(gate.id, e)}
                      style={{ cursor: 'crosshair' }}
                    />
                    <text x="90" y="35" fontSize="10" fill="#92400e">出力</text>
                  </>
                ) : gate.type === 'OR' ? (
                  <>
                    <rect x="0" y="0" width="80" height="60" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" rx="5" />
                    <text x="40" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">OR</text>
                    
                    {/* 入力端子1 */}
                    <circle
                      cx="0"
                      cy="15"
                      r="8"
                      fill="#10b981"
                      stroke="#064e3b"
                      strokeWidth="2"
                      onMouseUp={(e) => endConnection(gate.id, 0, e)}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="-30" y="20" fontSize="10" fill="#064e3b">入力1</text>
                    
                    {/* 入力端子2 */}
                    <circle
                      cx="0"
                      cy="45"
                      r="8"
                      fill="#10b981"
                      stroke="#064e3b"
                      strokeWidth="2"
                      onMouseUp={(e) => endConnection(gate.id, 1, e)}
                      style={{ cursor: 'pointer' }}
                    />
                    <text x="-30" y="50" fontSize="10" fill="#064e3b">入力2</text>
                    
                    {/* 出力端子 */}
                    <circle
                      cx="80"
                      cy="30"
                      r="8"
                      fill="#f59e0b"
                      stroke="#92400e"
                      strokeWidth="2"
                      onMouseDown={(e) => startConnection(gate.id, e)}
                      style={{ cursor: 'crosshair' }}
                    />
                  </>
                ) : null}
                
                {/* ゲートID表示 */}
                <text x="40" y="-5" textAnchor="middle" fontSize="10" fill="#6b7280">
                  {gate.id.split('_')[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* ログパネル */}
        <div className="w-80 bg-white border-l p-4 overflow-auto">
          <h3 className="font-bold mb-2">操作ログ：</h3>
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-xs font-mono">{log}</div>
            ))}
          </div>
          
          <h3 className="font-bold mt-4 mb-2">現在の接続：</h3>
          <div className="text-xs">
            {connections.length === 0 ? (
              <p className="text-gray-500">接続なし</p>
            ) : (
              connections.map((conn, i) => (
                <div key={conn.id} className="mb-1">
                  接続{i + 1}: {conn.from} → {conn.to}[入力{conn.toInput + 1}]
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogicCircuitDebug;