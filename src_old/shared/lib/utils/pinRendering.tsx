import React from 'react';

interface PinRenderOptions {
  x: number;
  y: number;
  type: 'input' | 'output';
  index: number;
  gateId: string;
  gateX: number;
  gateY: number;
  fillColor?: string;
  onStart: (gateId: string, pinType: 'input' | 'output', pinIndex: number, x: number, y: number) => void;
  onComplete: (gateId: string, pinType: 'input' | 'output', pinIndex: number) => void;
}

export const renderPin = (options: PinRenderOptions) => {
  const {
    x, y, type, index, gateId, gateX, gateY,
    fillColor = 'rgba(255, 255, 255, 0.3)',
    onStart, onComplete
  } = options;
  
  const HIT_RADIUS = 12;
  const VISUAL_RADIUS = 4;
  
  return (
    <g key={`${type}-${index}`}>
      {/* 見えない大きな当たり判定エリア */}
      <circle 
        cx={x} 
        cy={y}
        r={HIT_RADIUS}
        fill="transparent"
        stroke="none"
        style={{ cursor: 'crosshair' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onStart(gateId, type, index, gateX + x, gateY + y);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onComplete(gateId, type, index);
        }}
      />
      
      {/* 表示用のピン */}
      <circle 
        cx={x} 
        cy={y}
        r={VISUAL_RADIUS}
        fill={fillColor}
        stroke="none"
        style={{ pointerEvents: 'none' }}
        data-terminal={type}
      />
    </g>
  );
};