// キャンバスコンポーネント

import React, { memo } from 'react';
import Gate from './Gate';
import Connection from './Connection';
import { getConnectionPath } from '../../utils/circuit';
import { CANVAS, GATE_UI } from '../../constants/circuit';

/**
 * 回路キャンバスコンポーネント
 */
const Canvas = memo(({
  gates,
  connections,
  simulation,
  selectedGate,
  connectionDrag,
  mousePosition,
  svgRef,
  onGateClick,
  onGateDoubleClick,
  onGateMouseDown,
  onTerminalMouseDown,
  onTerminalMouseUp,
  onConnectionDelete,
  onCanvasClick,
  onMouseMove,
  onMouseUp
}) => {
  return (
    <div className="flex-1 bg-gray-50 p-4">
      <div className="bg-white border border-gray-300 rounded-lg h-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS.WIDTH} ${CANVAS.HEIGHT}`}
          className="w-full h-full"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={onCanvasClick}
        >
          {/* グリッド背景 */}
          <defs>
            <pattern 
              id="grid" 
              width={CANVAS.GRID_SIZE} 
              height={CANVAS.GRID_SIZE} 
              patternUnits="userSpaceOnUse"
            >
              <path 
                d={`M ${CANVAS.GRID_SIZE} 0 L 0 0 0 ${CANVAS.GRID_SIZE}`} 
                fill="none" 
                stroke="#f0f0f0" 
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 接続線 */}
          {connections.map((conn, index) => {
            const fromGate = gates.find(g => g.id === conn.from);
            const toGate = gates.find(g => g.id === conn.to);
            const isActive = simulation[conn.from];

            return (
              <Connection
                key={index}
                connection={conn}
                fromGate={fromGate}
                toGate={toGate}
                isActive={isActive}
                onDelete={() => onConnectionDelete(index)}
              />
            );
          })}

          {/* ドラッグ中の接続線 */}
          {connectionDrag && (
            <path
              d={getConnectionPath(
                connectionDrag.fromX,
                connectionDrag.fromY,
                mousePosition.x,
                mousePosition.y
              )}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              pointerEvents="none"
            />
          )}

          {/* ゲート */}
          {gates.map(gate => (
            <Gate
              key={gate.id}
              gate={gate}
              isSelected={selectedGate?.id === gate.id}
              simulation={simulation}
              onGateClick={onGateClick}
              onGateDoubleClick={onGateDoubleClick}
              onGateMouseDown={onGateMouseDown}
              onTerminalMouseDown={onTerminalMouseDown}
              onTerminalMouseUp={onTerminalMouseUp}
            />
          ))}
        </svg>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;