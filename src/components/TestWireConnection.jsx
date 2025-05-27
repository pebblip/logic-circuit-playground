import React, { useState } from 'react';

const TestWireConnection = () => {
  const [connections, setConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const gates = [
    { id: 'input1', type: 'INPUT', x: 100, y: 100, value: true },
    { id: 'and1', type: 'AND', x: 300, y: 100 },
    { id: 'output1', type: 'OUTPUT', x: 500, y: 100 }
  ];

  const handleMouseDown = (gateId, terminal) => {
    console.log('Mouse down:', gateId, terminal);
    setDragging({ from: gateId, terminal });
  };

  const handleMouseUp = (gateId, terminal) => {
    console.log('Mouse up:', gateId, terminal);
    if (dragging && dragging.from !== gateId) {
      const newConnection = {
        id: Date.now(),
        from: dragging.from,
        to: gateId,
        fromTerminal: dragging.terminal,
        toTerminal: terminal
      };
      console.log('Creating connection:', newConnection);
      setConnections([...connections, newConnection]);
    }
    setDragging(null);
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">ワイヤー接続テスト</h2>
      <div className="mb-4">
        <p>接続数: {connections.length}</p>
        <p>ドラッグ中: {dragging ? `${dragging.from} (${dragging.terminal})` : 'なし'}</p>
      </div>
      
      <svg 
        width="600" 
        height="300" 
        className="border border-gray-300"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(null)}
      >
        {/* ゲート */}
        {gates.map(gate => (
          <g key={gate.id}>
            <rect
              x={gate.x - 30}
              y={gate.y - 20}
              width="60"
              height="40"
              fill={gate.type === 'INPUT' ? '#10b981' : gate.type === 'OUTPUT' ? '#ef4444' : '#3b82f6'}
              stroke="#000"
            />
            <text x={gate.x} y={gate.y + 5} textAnchor="middle" fill="white" fontSize="12">
              {gate.type}
            </text>
            
            {/* 出力端子 */}
            {gate.type !== 'OUTPUT' && (
              <circle
                cx={gate.x + 30}
                cy={gate.y}
                r="5"
                fill="#fbbf24"
                stroke="#000"
                cursor="pointer"
                onMouseDown={() => handleMouseDown(gate.id, 'output')}
                onMouseUp={() => handleMouseUp(gate.id, 'output')}
              />
            )}
            
            {/* 入力端子 */}
            {gate.type !== 'INPUT' && (
              <circle
                cx={gate.x - 30}
                cy={gate.y}
                r="5"
                fill="#fbbf24"
                stroke="#000"
                cursor="pointer"
                onMouseDown={() => handleMouseDown(gate.id, 'input')}
                onMouseUp={() => handleMouseUp(gate.id, 'input')}
              />
            )}
          </g>
        ))}
        
        {/* 接続線 */}
        {connections.map(conn => {
          const from = gates.find(g => g.id === conn.from);
          const to = gates.find(g => g.id === conn.to);
          if (!from || !to) return null;
          
          const fromX = from.x + (conn.fromTerminal === 'output' ? 30 : -30);
          const toX = to.x + (conn.toTerminal === 'output' ? 30 : -30);
          
          return (
            <line
              key={conn.id}
              x1={fromX}
              y1={from.y}
              x2={toX}
              y2={to.y}
              stroke="#000"
              strokeWidth="2"
            />
          );
        })}
        
        {/* ドラッグ中の線 */}
        {dragging && (
          <line
            x1={gates.find(g => g.id === dragging.from).x + (dragging.terminal === 'output' ? 30 : -30)}
            y1={gates.find(g => g.id === dragging.from).y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#666"
            strokeWidth="2"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
};

export default TestWireConnection;