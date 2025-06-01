import React from 'react';

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDrawing?: boolean;
}

const WireComponent = ({ x1, y1, x2, y2, isDrawing = false }: WireProps) => {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isDrawing ? '#10b981' : '#00ff88'}
      strokeWidth="2"
      strokeDasharray={isDrawing ? '5,5' : undefined}
      opacity={isDrawing ? 0.6 : 1}
    />
  );
};

// パフォーマンス最適化のためのメモ化
export const Wire = React.memo(WireComponent);