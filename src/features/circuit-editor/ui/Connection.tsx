import React from 'react';
import { Connection as ConnectionType } from '../../../entities/types';

interface ConnectionProps {
  connection: ConnectionType;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
}

const ConnectionComponent: React.FC<ConnectionProps> = ({ fromPosition, toPosition }) => {
  // Simple straight line for now, can make it curved later
  return (
    <line
      x1={fromPosition.x}
      y1={fromPosition.y}
      x2={toPosition.x}
      y2={toPosition.y}
      stroke="#10b981"
      strokeWidth="2"
      fill="none"
    />
  );
};

// パフォーマンス最適化のためのメモ化
export const Connection = React.memo(ConnectionComponent);

interface TempConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const TempConnectionComponent: React.FC<TempConnectionProps> = ({ from, to }) => {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="#10b981"
      strokeWidth="2"
      strokeDasharray="5,5"
      fill="none"
      pointerEvents="none"
    />
  );
};

// パフォーマンス最適化のためのメモ化
export const TempConnection = React.memo(TempConnectionComponent);