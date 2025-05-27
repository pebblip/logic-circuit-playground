import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CANVAS } from '../constants/circuit';
import Gate from './Circuit/Gate';
import Connection from './Circuit/Connection';
import { motion } from 'framer-motion';

const Canvas = ({ 
  circuit, 
  onCircuitUpdate, 
  selectedTool, 
  selectedComponent,
  onComponentSelect,
  simulationResults,
  showAnswer 
}) => {
  const svgRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [draggedGate, setDraggedGate] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // グリッドにスナップ
  const snapToGrid = useCallback((value) => {
    return Math.round(value / CANVAS.GRID_SIZE) * CANVAS.GRID_SIZE;
  }, []);

  // マウス位置の更新
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const scale = CANVAS.WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    setMousePosition({ x, y });

    // ゲートのドラッグ処理
    if (draggedGate) {
      const newGates = circuit.gates.map(gate => {
        if (gate.id === draggedGate.id) {
          return {
            ...gate,
            x: snapToGrid(x - dragOffset.x),
            y: snapToGrid(y - dragOffset.y)
          };
        }
        return gate;
      });
      onCircuitUpdate({ ...circuit, gates: newGates });
    }
  }, [circuit, draggedGate, dragOffset, onCircuitUpdate, snapToGrid]);

  // クリック処理
  const handleCanvasClick = useCallback((e) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const scale = CANVAS.WIDTH / rect.width;
    const x = snapToGrid((e.clientX - rect.left) * scale);
    const y = snapToGrid((e.clientY - rect.top) * scale);

    // ツールに応じた処理
    if (selectedTool && ['and', 'or', 'not', 'input', 'output'].includes(selectedTool)) {
      // 新しいゲートを追加
      const newGate = {
        id: `${selectedTool}_${Date.now()}`,
        type: selectedTool.toUpperCase(),
        x,
        y,
        inputs: selectedTool === 'not' ? ['A'] : selectedTool === 'input' ? [] : ['A', 'B'],
        outputs: ['Y']
      };

      onCircuitUpdate({
        ...circuit,
        gates: [...circuit.gates, newGate],
        inputs: selectedTool === 'input' 
          ? [...circuit.inputs, newGate.id]
          : circuit.inputs,
        outputs: selectedTool === 'output'
          ? [...circuit.outputs, newGate.id]
          : circuit.outputs
      });
    }
  }, [circuit, selectedTool, onCircuitUpdate, snapToGrid]);

  // ゲートクリック処理
  const handleGateClick = useCallback((gate, e) => {
    e.stopPropagation();
    
    if (selectedTool === 'delete') {
      // ゲートとその接続を削除
      const newGates = circuit.gates.filter(g => g.id !== gate.id);
      const newConnections = circuit.connections.filter(
        c => c.fromGate !== gate.id && c.toGate !== gate.id
      );
      const newInputs = circuit.inputs.filter(id => id !== gate.id);
      const newOutputs = circuit.outputs.filter(id => id !== gate.id);
      
      onCircuitUpdate({
        gates: newGates,
        connections: newConnections,
        inputs: newInputs,
        outputs: newOutputs
      });
    } else {
      onComponentSelect(gate);
    }
  }, [circuit, selectedTool, onCircuitUpdate, onComponentSelect]);

  // ゲートドラッグ開始
  const handleGateMouseDown = useCallback((gate, e) => {
    // 削除ツール選択時はドラッグしない
    if (selectedTool === 'delete') return;
    
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    const rect = svgRef.current.getBoundingClientRect();
    const scale = CANVAS.WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    
    setDraggedGate(gate);
    setDragOffset({
      x: x - gate.x,
      y: y - gate.y
    });
  }, [selectedTool]);

  // マウスアップ処理
  const handleMouseUp = useCallback(() => {
    setDraggedGate(null);
    setConnectionDrag(null);
  }, []);

  // ターミナルのマウスダウン（配線開始）
  const handleTerminalMouseDown = useCallback((gateId, terminal, isInput, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    const gate = circuit.gates.find(g => g.id === gateId);
    if (!gate) return;

    // 配線ツール選択時、または常に配線可能にする
    if (!isInput) {
      setConnectionDrag({
        fromGate: gateId,
        fromTerminal: terminal,
        startX: gate.x + (gate.type === 'INPUT' || gate.type === 'OUTPUT' || gate.type === 'CLOCK' ? 0 : 60),
        startY: gate.y
      });
    }
  }, [circuit.gates]);

  // ターミナルのマウスアップ（配線完了）
  const handleTerminalMouseUp = useCallback((gateId, terminal, isInput, e) => {
    if (!connectionDrag || !isInput) return;
    
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    // 新しい接続を作成
    const newConnection = {
      fromGate: connectionDrag.fromGate,
      fromTerminal: connectionDrag.fromTerminal,
      toGate: gateId,
      toTerminal: terminal
    };

    // 同じ接続が既に存在しないかチェック
    const exists = circuit.connections.some(
      c => c.fromGate === newConnection.fromGate &&
           c.fromTerminal === newConnection.fromTerminal &&
           c.toGate === newConnection.toGate &&
           c.toTerminal === newConnection.toTerminal
    );

    if (!exists) {
      onCircuitUpdate({
        ...circuit,
        connections: [...circuit.connections, newConnection]
      });
    }

    setConnectionDrag(null);
  }, [connectionDrag, circuit, onCircuitUpdate]);

  // 接続削除
  const handleConnectionDelete = useCallback((index) => {
    const newConnections = circuit.connections.filter((_, i) => i !== index);
    onCircuitUpdate({
      ...circuit,
      connections: newConnections
    });
  }, [circuit, onCircuitUpdate]);

  // 答えを表示するアニメーション
  useEffect(() => {
    if (showAnswer && circuit.gates.length > 0) {
      // アニメーション効果を追加（オプション）
    }
  }, [showAnswer, circuit]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANVAS.WIDTH} ${CANVAS.HEIGHT}`}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* グリッドパターン */}
        <defs>
          <pattern 
            id="grid" 
            width={CANVAS.GRID_SIZE} 
            height={CANVAS.GRID_SIZE} 
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.5" fill="#e5e7eb" />
          </pattern>
        </defs>

        {/* 背景 */}
        <rect width={CANVAS.WIDTH} height={CANVAS.HEIGHT} fill="url(#grid)" />

        {/* 接続線 */}
        {circuit.connections.map((connection, index) => (
          <Connection
            key={`conn-${index}`}
            connection={connection}
            gates={circuit.gates}
            simulation={simulationResults}
            onDelete={() => selectedTool === 'delete' && handleConnectionDelete(index)}
          />
        ))}

        {/* ドラッグ中の接続線 */}
        {connectionDrag && (
          <path
            d={`M ${connectionDrag.startX} ${connectionDrag.startY} L ${mousePosition.x} ${mousePosition.y}`}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            className="pointer-events-none animate-pulse"
          />
        )}

        {/* ゲート */}
        {circuit.gates.map(gate => (
          <Gate
            key={gate.id}
            gate={gate}
            isSelected={selectedComponent?.id === gate.id}
            simulation={simulationResults || {}}
            onGateClick={(e) => handleGateClick(gate, e)}
            onGateMouseDown={(e) => handleGateMouseDown(gate, e)}
            onTerminalMouseDown={handleTerminalMouseDown}
            onTerminalMouseUp={handleTerminalMouseUp}
            onGateDoubleClick={() => {}}
          />
        ))}
      </svg>

      {/* 配線モードの説明 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path d="M12 8v4l2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-700">
            <span className="font-semibold">配線のコツ：</span>
            出力端子（右側の丸）から入力端子（左側の丸）へドラッグして接続
          </span>
        </div>
      </div>

      {/* 答え表示時のオーバーレイ */}
      {showAnswer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            ✨ 模範解答を表示中
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Canvas;