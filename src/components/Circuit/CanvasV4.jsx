import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Gate from './Gate';
import Connection from './Connection';

const CanvasV4 = ({
  gates,
  connections,
  simulation,
  onAddGate,
  onAddConnection,
  onSelectGate,
  onDeleteGate,
  onDeleteConnection,
  onUpdateGate,
  showHint,
  currentChallenge
}) => {
  const svgRef = useRef(null);
  const [draggedConnection, setDraggedConnection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ドラッグ&ドロップ処理
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType');
    
    if (gateType && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      onAddGate(gateType, { x, y });
    }
  }, [onAddGate]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // 接続線の開始
  const startConnection = useCallback((gateId, terminalType, terminalIndex) => {
    setDraggedConnection({
      from: gateId,
      fromTerminal: terminalType === 'output' ? `out${terminalIndex}` : null,
      fromType: terminalType
    });
  }, []);

  // 接続線の終了
  const endConnection = useCallback((gateId, terminalIndex, e) => {
    if (draggedConnection && draggedConnection.from !== gateId) {
      const connection = {
        id: `conn_${Date.now()}`,
        from: draggedConnection.from,
        to: gateId,
        fromOutput: 0,
        toInput: terminalIndex,
        toTerminal: `in${terminalIndex}`
      };
      
      onAddConnection(connection);
    }
    setDraggedConnection(null);
  }, [draggedConnection, onAddConnection]);

  // マウス移動の追跡
  const handleMouseMove = useCallback((e) => {
    if (draggedConnection && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [draggedConnection]);

  // キャンバスクリック
  const handleCanvasClick = useCallback(() => {
    setDraggedConnection(null);
    onSelectGate(null);
  }, [onSelectGate]);

  // ゲートの入力値を切り替え
  const handleGateToggle = useCallback((gateId) => {
    const gate = gates.find(g => g.id === gateId);
    if (gate && gate.type === 'INPUT') {
      onUpdateGate(gateId, { value: !gate.value });
    }
  }, [gates, onUpdateGate]);

  // ドラッグ中の接続線を取得
  const getDraggedConnectionPath = () => {
    if (!draggedConnection) return null;
    
    const fromGate = gates.find(g => g.id === draggedConnection.from);
    if (!fromGate) return null;
    
    const fromX = fromGate.x + (fromGate.type === 'INPUT' || fromGate.type === 'OUTPUT' ? 0 : 60);
    const fromY = fromGate.y;
    
    const midX = (fromX + mousePosition.x) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;
  };

  return (
    <div 
      className="w-full h-full bg-gray-50 relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      >
        {/* グリッド背景 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* 接続線 */}
        <g>
          {connections.map(connection => (
            <Connection
              key={connection.id}
              connection={connection}
              gates={gates}
              simulation={simulation}
              onDelete={() => onDeleteConnection(connection.id)}
            />
          ))}
          
          {/* ドラッグ中の接続線 */}
          {draggedConnection && (
            <path
              d={getDraggedConnectionPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="pointer-events-none"
            />
          )}
        </g>

        {/* ゲート */}
        <g>
          {gates.map(gate => (
            <Gate
              key={gate.id}
              gate={gate}
              isSelected={false}
              simulation={simulation}
              onSelect={() => onSelectGate(gate)}
              onDelete={() => onDeleteGate(gate.id)}
              onTerminalMouseDown={(terminalType, terminalIndex) => 
                startConnection(gate.id, terminalType, terminalIndex)
              }
              onTerminalMouseUp={(terminalType, terminalIndex, e) => {
                if (terminalType === 'input' && draggedConnection) {
                  endConnection(gate.id, terminalIndex, e);
                }
              }}
              onDoubleClick={() => handleGateToggle(gate.id)}
            />
          ))}
        </g>
      </svg>

      {/* ヒント表示 */}
      {showHint > 0 && currentChallenge && (
        <motion.div
          className="absolute top-4 left-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 max-w-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-sm text-yellow-800">
            {showHint === 1 && currentChallenge.hints?.placement}
            {showHint === 2 && currentChallenge.hints?.wiring}
            {showHint === 3 && currentChallenge.hints?.answer}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CanvasV4;