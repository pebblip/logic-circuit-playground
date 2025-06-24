import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface BinaryCounterGateRendererProps {
  gate: Gate;
  isSelected: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handlePinClick: (
    event: React.MouseEvent,
    pinIndex: number,
    isOutput: boolean
  ) => void;
  handleGateClick: (event: React.MouseEvent) => void;
}

export const BinaryCounterGateRenderer: React.FC<
  BinaryCounterGateRendererProps
> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  const bitCount = (gate.metadata?.bitCount as number) || 2;
  const currentValue = (gate.metadata?.currentValue as number) || 0;

  // ゲートの高さを動的に計算
  const gateHeight = Math.max(80, bitCount * 30 + 20);
  const halfHeight = gateHeight / 2;

  return (
    <>
      <g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleGateClick}
        className="u-cursor-grab"
      >
        <rect
          className={`gate ${isSelected ? 'selected' : ''}`}
          x="-60"
          y={-halfHeight}
          width="120"
          height={gateHeight}
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text
          className="gate-text u-text-sm"
          x="0"
          y="-15"
          data-testid="counter-label"
        >
          COUNTER
        </text>
        <text
          className="gate-text u-text-sm"
          x="0"
          y="0"
          data-testid="counter-bit-label"
        >
          {bitCount}bit
        </text>

        {/* 現在の値を表示 */}
        <text
          className="gate-text u-text-lg u-font-mono"
          x="0"
          y="20"
          data-testid="counter-value"
        >
          {currentValue.toString(2).padStart(bitCount, '0')}
        </text>

        {/* CLK入力ラベル */}
        <text className="gate-text u-text-xs u-fill-muted" x="-45" y="5">
          CLK
        </text>

        {/* 出力ピンラベル */}
        {Array.from({ length: bitCount }, (_, i) => {
          const spacing = 30;
          const startY = -((bitCount - 1) * spacing) / 2;
          const y = startY + i * spacing;
          return (
            <text
              key={i}
              className="gate-text u-text-xs u-fill-muted"
              x="45"
              y={y + 5}
            >
              Q{i}
            </text>
          );
        })}
      </g>

      {/* 入力ピン - CLK */}
      <g>
        <circle
          cx="-70"
          cy="0"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-70"
          cy="0"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-60"
          y1="0"
          x2="-70"
          y2="0"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        {/* クロックエッジ記号 */}
        <path
          d="M -50 5 l 0 -10 l 5 5 z"
          fill={getGateInputValue(gate, 0) ? '#00ff88' : '#666'}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - ビット毎 */}
      {Array.from({ length: bitCount }, (_, i) => {
        const spacing = 30;
        const startY = -((bitCount - 1) * spacing) / 2;
        const y = startY + i * spacing;
        const bitValue = (currentValue & (1 << i)) !== 0;

        return (
          <g key={i}>
            <circle
              cx="70"
              cy={y}
              r="22"
              fill="transparent"
              className="u-cursor-crosshair"
              onClick={e => handlePinClick(e, i, true)}
            />
            <circle
              cx="70"
              cy={y}
              r="6"
              className={`pin ${bitValue ? 'active' : ''}`}
              pointerEvents="none"
            />
            <line
              x1="60"
              y1={y}
              x2="70"
              y2={y}
              className={`pin-line ${bitValue ? 'active' : ''}`}
              pointerEvents="none"
            />
          </g>
        );
      })}
    </>
  );
};
