import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface BasicGateRendererProps {
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

export const BasicGateRenderer: React.FC<BasicGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
  // ゲートタイプに応じた入力数
  const inputCount = gate.type === 'NOT' ? 1 : 2;

  return (
    <>
      <g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleGateClick}
        style={{ cursor: 'grab' }}
      >
        <rect
          className={`gate ${isSelected ? 'selected' : ''}`}
          x="-35"
          y="-25"
          width="70"
          height="50"
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text className="gate-text" x="0" y="0">
          {gate.type}
        </text>
      </g>

      {/* 入力ピン */}
      {Array.from({ length: inputCount }).map((_, index) => {
        const y = inputCount === 1 ? 0 : index === 0 ? -10 : 10;
        return (
          <g key={`input-${index}`}>
            {/* クリック領域を大きくするための透明な円 */}
            <circle
              cx="-45"
              cy={y}
              r="15"
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onClick={e => handlePinClick(e, index, false)}
            />
            <circle
              cx="-45"
              cy={y}
              r="6"
              className={`pin ${getGateInputValue(gate, index) ? 'active' : ''}`}
              pointerEvents="none"
            />
            <line
              x1="-35"
              y1={y}
              x2="-45"
              y2={y}
              className={`pin-line ${getGateInputValue(gate, index) ? 'active' : ''}`}
              pointerEvents="none"
            />
          </g>
        );
      })}

      {/* 出力ピン */}
      <g>
        {/* クリック領域を大きくするための透明な円 */}
        <circle
          cx="45"
          cy="0"
          r="15"
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="45"
          cy="0"
          r="6"
          className={`pin ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="35"
          y1="0"
          x2="45"
          y2="0"
          className={`pin-line ${gate.output ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>
    </>
  );
};
