// モダンなキャンバスコンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Gate from './Gate';
import Connection from './Connection';
import { CANVAS } from '../../constants/circuit';
import { colors } from '../../styles/design-tokens';

/**
 * モダンなキャンバスコンポーネント
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
    <div className="relative w-full h-full" style={{ backgroundColor: colors.ui.background }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANVAS.WIDTH} ${CANVAS.HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="cursor-default"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onCanvasClick}
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        {/* 背景パターン */}
        <defs>
          {/* グリッドパターン */}
          <pattern 
            id="grid" 
            width={CANVAS.GRID_SIZE} 
            height={CANVAS.GRID_SIZE} 
            patternUnits="userSpaceOnUse"
          >
            <circle 
              cx="1" 
              cy="1" 
              r="0.5" 
              fill={colors.ui.border}
              opacity="0.5"
            />
          </pattern>
          
          {/* グロー効果 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* ドロップシャドウ */}
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
          
          {/* 信号フローアニメーション */}
          <linearGradient id="signalFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.signal.on} stopOpacity="0">
              <animate 
                attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={colors.signal.onGlow} stopOpacity="1">
              <animate 
                attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="1s"
              />
            </stop>
            <stop offset="100%" stopColor={colors.signal.on} stopOpacity="0">
              <animate 
                attributeName="stop-opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="2s"
              />
            </stop>
          </linearGradient>
        </defs>

        {/* 背景 */}
        <rect 
          width={CANVAS.WIDTH} 
          height={CANVAS.HEIGHT} 
          fill="url(#grid)"
        />

        {/* 接続線 */}
        <g className="connections">
          {connections.map((connection, index) => (
            <Connection
              key={`conn-${index}`}
              connection={connection}
              gates={gates}
              simulation={simulation}
              onDelete={() => onConnectionDelete(index)}
            />
          ))}
        </g>

        {/* ドラッグ中の接続線 */}
        {connectionDrag && (
          <g className="pointer-events-none">
            {/* ドラッグ中のライン */}
            <line
              x1={connectionDrag.fromX || connectionDrag.startX}
              y1={connectionDrag.fromY || connectionDrag.startY}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke={colors.signal.wire}
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.8"
            />
            {/* ドラッグ開始点のマーカー */}
            <circle
              cx={connectionDrag.fromX || connectionDrag.startX}
              cy={connectionDrag.fromY || connectionDrag.startY}
              r="5"
              fill={colors.ui.accent.primary}
              stroke="white"
              strokeWidth="2"
            />
            {/* マウス位置のマーカー */}
            <circle
              cx={mousePosition.x}
              cy={mousePosition.y}
              r="6"
              fill="none"
              stroke={colors.ui.accent.primary}
              strokeWidth="2"
              strokeDasharray="2,2"
            />
          </g>
        )}

        {/* ゲート */}
        <g className="gates">
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
        </g>

      </svg>

      {/* キャンバス情報 */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        ゲート: {gates.length} | 接続: {connections.length}
      </div>

      {/* アニメーションスタイル */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes flow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
});

Canvas.displayName = 'Canvas';

Canvas.propTypes = {
  gates: PropTypes.array.isRequired,
  connections: PropTypes.array.isRequired,
  simulation: PropTypes.object.isRequired,
  selectedGate: PropTypes.object,
  connectionDrag: PropTypes.object,
  mousePosition: PropTypes.object.isRequired,
  svgRef: PropTypes.object.isRequired,
  onGateClick: PropTypes.func.isRequired,
  onGateDoubleClick: PropTypes.func.isRequired,
  onGateMouseDown: PropTypes.func.isRequired,
  onTerminalMouseDown: PropTypes.func.isRequired,
  onTerminalMouseUp: PropTypes.func.isRequired,
  onConnectionDelete: PropTypes.func.isRequired,
  onCanvasClick: PropTypes.func.isRequired,
  onMouseMove: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired
};

export default Canvas;