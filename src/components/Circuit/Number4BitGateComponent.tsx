/**
 * 4ビット数値入力・表示ゲート用の特別なコンポーネント
 */

import React from 'react';
import { GateViewModel } from '@/viewmodels/GateViewModel';

interface Number4BitGateComponentProps {
  gate: GateViewModel;
  onMouseDown?: (e: React.MouseEvent) => void;
  onValueChange?: (value: number) => void;
}

export const Number4BitInputComponent: React.FC<Number4BitGateComponentProps> = ({
  gate,
  onMouseDown,
  onValueChange
}) => {
  const value = (gate.gate as any).getValue?.() || 0;
  const { width, height } = gate.gate.getSize();

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = Math.min(15, value + 1);
    (gate.gate as any).setValue?.(newValue);
    onValueChange?.(newValue);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = Math.max(0, value - 1);
    (gate.gate as any).setValue?.(newValue);
    onValueChange?.(newValue);
  };

  return (
    <g
      transform={`translate(${gate.x}, ${gate.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'move' }}
    >
      {/* 背景 */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        fill="rgba(59, 130, 246, 0.1)"
        stroke="#3b82f6"
        strokeWidth="2"
      />

      {/* 数値表示 */}
      <text
        x={0}
        y={-5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="24"
        fontWeight="bold"
        fill="#3b82f6"
        style={{ userSelect: 'none' }}
      >
        {value}
      </text>

      {/* ラベル */}
      <text
        x={0}
        y={15}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#94a3b8"
        style={{ userSelect: 'none' }}
      >
        INPUT
      </text>

      {/* インクリメントボタン */}
      <g transform={`translate(${width / 2 - 15}, ${-height / 2 + 10})`}>
        <rect
          x={-8}
          y={-8}
          width={16}
          height={16}
          rx={2}
          fill="#1e293b"
          stroke="#3b82f6"
          strokeWidth="1"
          style={{ cursor: 'pointer' }}
          onClick={handleIncrement}
        />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="#3b82f6"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          +
        </text>
      </g>

      {/* デクリメントボタン */}
      <g transform={`translate(${width / 2 - 15}, ${height / 2 - 10})`}>
        <rect
          x={-8}
          y={-8}
          width={16}
          height={16}
          rx={2}
          fill="#1e293b"
          stroke="#3b82f6"
          strokeWidth="1"
          style={{ cursor: 'pointer' }}
          onClick={handleDecrement}
        />
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="#3b82f6"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          -
        </text>
      </g>

      {/* 出力ピン */}
      {gate.outputs.map((pin, index) => (
        <g
          key={pin.id}
          transform={`translate(${pin.x - gate.x}, ${pin.y - gate.y})`}
        >
          <circle
            cx={0}
            cy={0}
            r={6}
            fill={pin.value ? '#00ff88' : '#334155'}
            stroke={pin.value ? '#00ff88' : '#64748b'}
            strokeWidth="2"
          />
          <text
            x={-15}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#64748b"
            style={{ userSelect: 'none' }}
          >
            D{index}
          </text>
        </g>
      ))}
    </g>
  );
};

export const Number4BitDisplayComponent: React.FC<Number4BitGateComponentProps> = ({
  gate,
  onMouseDown
}) => {
  const value = (gate.gate as any).getDisplayValue?.() || 0;
  const binary = (gate.gate as any).getBinaryString?.() || '0000';
  const { width, height } = gate.gate.getSize();

  return (
    <g
      transform={`translate(${gate.x}, ${gate.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: 'move' }}
    >
      {/* 背景 */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        fill="rgba(16, 185, 129, 0.1)"
        stroke="#10b981"
        strokeWidth="2"
      />

      {/* 数値表示 */}
      <text
        x={0}
        y={-8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="28"
        fontWeight="bold"
        fill="#10b981"
        style={{ userSelect: 'none' }}
      >
        {value}
      </text>

      {/* バイナリ表示 */}
      <text
        x={0}
        y={12}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#6ee7b7"
        fontFamily="monospace"
        style={{ userSelect: 'none' }}
      >
        {binary}
      </text>

      {/* 入力ピン */}
      {gate.inputs.map((pin, index) => (
        <g
          key={pin.id}
          transform={`translate(${pin.x - gate.x}, ${pin.y - gate.y})`}
        >
          <circle
            cx={0}
            cy={0}
            r={6}
            fill={pin.value ? '#00ff88' : '#334155'}
            stroke={pin.value ? '#00ff88' : '#64748b'}
            strokeWidth="2"
          />
          <text
            x={15}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#64748b"
            style={{ userSelect: 'none' }}
          >
            D{index}
          </text>
        </g>
      ))}
    </g>
  );
};