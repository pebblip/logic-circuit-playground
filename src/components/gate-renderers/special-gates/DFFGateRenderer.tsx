import React from 'react';
import type { Gate } from '@/types/circuit';
import { getGateInputValue } from '@/domain/simulation';

interface DFFGateRendererProps {
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

export const DFFGateRenderer: React.FC<DFFGateRendererProps> = ({
  gate,
  isSelected,
  handleMouseDown,
  handleTouchStart,
  handlePinClick,
  handleGateClick,
}) => {
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
          x="-50"
          y="-40"
          width="100"
          height="80"
          rx="8"
          stroke={isSelected ? '#00aaff' : undefined}
          strokeWidth={isSelected ? '3' : undefined}
        />
        <text className="gate-text" x="0" y="0">
          D-FF
        </text>
        {/* ピン名 */}
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="-20">
          D
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="-35" y="20">
          CLK
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="-20">
          Q
        </text>
        <text className="gate-text u-text-md u-fill-muted" x="40" y="20">
          Q̄
        </text>
      </g>

      {/* 入力ピン - D */}
      <g>
        <circle
          cx="-60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, false)}
        />
        <circle
          cx="-60"
          cy="-20"
          r="6"
          className={`pin ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="-20"
          x2="-60"
          y2="-20"
          className={`pin-line ${getGateInputValue(gate, 0) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 入力ピン - CLK */}
      <g>
        <circle
          cx="-60"
          cy="20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 1, false)}
        />
        <circle
          cx="-60"
          cy="20"
          r="6"
          className={`pin ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="-50"
          y1="20"
          x2="-60"
          y2="20"
          className={`pin-line ${getGateInputValue(gate, 1) ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q */}
      <g>
        <circle
          cx="60"
          cy="-20"
          r="22"
          fill="transparent"
          className="u-cursor-crosshair"
          onClick={e => handlePinClick(e, 0, true)}
        />
        <circle
          cx="60"
          cy="-20"
          r="6"
          className={`pin ${(gate.outputs?.[0] ?? false) ? 'active' : ''}`}
          pointerEvents="none"
        />
        <line
          x1="50"
          y1="-20"
          x2="60"
          y2="-20"
          className={`pin-line ${gate.outputs?.[0] ? 'active' : ''}`}
          pointerEvents="none"
        />
      </g>

      {/* 出力ピン - Q̄ (単一出力として扱う) */}
    </>
  );
};
