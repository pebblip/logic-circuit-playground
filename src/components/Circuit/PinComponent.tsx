import React from 'react';
import { Pin } from '@/models/Pin';

interface PinComponentProps {
  x: number;
  y: number;
  type: 'input' | 'output';
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  fillColor?: string;
  label?: string;
}

export const PinComponent: React.FC<PinComponentProps> = ({
  x,
  y,
  type,
  onMouseDown,
  onMouseUp,
  fillColor = 'rgba(255, 255, 255, 0.3)',
  label
}) => {
  
  return (
    <g>
      {/* 見えない大きな当たり判定エリア */}
      <circle 
        cx={x} 
        cy={y}
        r={Pin.HIT_RADIUS}
        fill="transparent"
        stroke="none"
        style={{ cursor: 'crosshair' }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
      
      {/* 表示用のピン */}
      <circle 
        cx={x} 
        cy={y}
        r={Pin.VISUAL_RADIUS}
        fill={fillColor}
        stroke="none"
        style={{ pointerEvents: 'none' }}
        data-terminal={type}
      />
      
      {/* オプショナルなラベル */}
      {label && (
        <text 
          x={type === 'input' ? x - 15 : x + 15} 
          y={y + 3}
          fontSize="7" 
          fill="rgba(255, 255, 255, 0.6)"
          textAnchor={type === 'input' ? 'end' : 'start'}
        >
          {label}
        </text>
      )}
    </g>
  );
};